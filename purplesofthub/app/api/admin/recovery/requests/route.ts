import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { requireAdmin } from '@/lib/auth'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { parseRecoverySubmission } from '@/lib/recovery/requests'
import { toAdminRecoveryRecord, type RecoveryRecordRow } from '@/lib/recovery/records'
import { RECOVERY_DOCUMENTS_BUCKET, newRecoveryDocumentPath } from '@/lib/recovery/documents'
import {
  insertRecoveryRequest,
  missingColumnFromError,
  removeRecoveryObjects,
} from '@/lib/recovery/persistence'
import {
  RECOVERY_DOCUMENT_MAX_ATTACHMENTS,
  RECOVERY_REQUEST_MAX_BYTES,
  validateRecoveryDocument,
} from '@/lib/uploadPolicy'

export const dynamic = 'force-dynamic'

/**
 * Admin-only recovery collection.
 *
 * GET  → the recovery list, including internal `admin_notes`, for the
 *        authenticated admin workspace. Storage paths are never returned;
 *        each record carries `has_id_document` / `has_screenshot` flags and the
 *        documents are fetched through the guarded signed-URL endpoint.
 * POST → administrative creation, including internal notes and documents. The
 *        public endpoint can never do this.
 *
 * Both handlers are gated by `requireAdmin()` before any privileged access.
 */

const RECOVERY_COLUMNS = [
  'id',
  'first_name',
  'last_name',
  'email',
  'phone',
  'platform',
  'support_type',
  'handle',
  'status',
  'payment_status',
  'amount_paid',
  'payment_method',
  'admin_notes',
  'appeal_message',
  'created_at',
  'id_document_url',
  'screenshot_url',
].join(', ')

/** Bounded page size — the admin workspace filters client-side. */
const LIST_LIMIT = 500

const ATTACHMENT_FIELDS = [
  { field: 'idFile', column: 'id_document_url' },
  { field: 'screenshotFile', column: 'screenshot_url' },
] as const

type AttachmentColumn = (typeof ATTACHMENT_FIELDS)[number]['column']

export async function GET() {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  const supabase = createServiceRoleClient()
  if (!supabase) {
    console.error('[admin/recovery] service role client unavailable')
    return NextResponse.json({ error: 'Recovery data is unavailable.' }, { status: 503 })
  }

  const query = () =>
    supabase
      .from('account_recovery_requests')
      .select(RECOVERY_COLUMNS)
      .order('created_at', { ascending: false })
      .limit(LIST_LIMIT)

  let { data, error } = await query()

  // Tolerate a column that is absent in this environment by falling back to a
  // schema-agnostic read; the mapper only reads the columns it knows about.
  if (error && missingColumnFromError(error)) {
    console.warn('[admin/recovery] falling back to select(*) — column missing:', error.message)
    const fallback = await supabase
      .from('account_recovery_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(LIST_LIMIT)

    data = fallback.data
    error = fallback.error
  }

  if (error) {
    console.error('[admin/recovery] list failed:', error.message)
    return NextResponse.json({ error: 'Recovery data is unavailable.' }, { status: 500 })
  }

  // PostgREST's static typing is loose here because the select list is built at
  // runtime; the mapper reads only the columns it knows about.
  const requests = (data ?? []).map(row =>
    toAdminRecoveryRecord(row as unknown as RecoveryRecordRow)
  )

  return NextResponse.json({ requests }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  const declaredLength = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(declaredLength) && declaredLength > RECOVERY_REQUEST_MAX_BYTES) {
    return NextResponse.json({ error: 'This submission is too large.' }, { status: 413 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 })
  }

  // Internal fields are accepted here *because* requireAdmin() already passed.
  const parsed = parseRecoverySubmission(formData, { mode: 'admin' })
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status })
  }

  const values = parsed.value
  const attachments: Array<{
    column: AttachmentColumn
    file: File
    buffer: Buffer
    extension: string
  }> = []

  for (const { field, column } of ATTACHMENT_FIELDS) {
    for (const entry of formData.getAll(field)) {
      if (!(entry instanceof File) || entry.size === 0) continue

      if (attachments.length >= RECOVERY_DOCUMENT_MAX_ATTACHMENTS) {
        return NextResponse.json(
          { error: `A maximum of ${RECOVERY_DOCUMENT_MAX_ATTACHMENTS} documents can be uploaded.` },
          { status: 400 }
        )
      }

      const buffer = Buffer.from(await entry.arrayBuffer())
      const validation = validateRecoveryDocument(entry, buffer)

      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: validation.status })
      }

      attachments.push({ column, file: entry, buffer, extension: validation.extension })
    }
  }

  const supabase = createServiceRoleClient()
  if (!supabase) {
    console.error('[admin/recovery] service role client unavailable')
    return NextResponse.json({ error: 'Recovery writes are unavailable.' }, { status: 503 })
  }

  const requestId = randomUUID()
  const storedPaths: Partial<Record<AttachmentColumn, string>> = {}
  const uploadedObjects: string[] = []

  for (const attachment of attachments) {
    let objectPath: string

    try {
      objectPath = newRecoveryDocumentPath(requestId, attachment.extension)
    } catch (error) {
      console.error('[admin/recovery] storage path error:', (error as Error).message)
      await removeRecoveryObjects(supabase, uploadedObjects)
      return NextResponse.json({ error: 'Could not create the request.' }, { status: 500 })
    }

    const { error: uploadError } = await supabase.storage
      .from(RECOVERY_DOCUMENTS_BUCKET)
      .upload(objectPath, attachment.buffer, {
        cacheControl: '60',
        contentType: attachment.file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[admin/recovery] document upload failed:', uploadError.message)
      await removeRecoveryObjects(supabase, uploadedObjects)
      return NextResponse.json({ error: 'Could not store the uploaded document.' }, { status: 502 })
    }

    uploadedObjects.push(objectPath)
    storedPaths[attachment.column] = objectPath
  }

  const payload: Record<string, unknown> = {
    id: requestId,
    first_name: values.first_name,
    last_name: values.last_name,
    full_name: values.full_name,
    handle: values.handle,
    email: values.email,
    phone: values.phone,
    support_type: values.support_type,
    appeal_message: values.appeal_message,
    platform: values.platform,
    amount: values.amount,
    status: 'pending',
    // Internal state is decided by the server, never by the browser.
    admin_notes: parsed.adminNotes,
    created_by_admin_id: admin.userId,
    id_document_url: storedPaths.id_document_url ?? null,
    screenshot_url: storedPaths.screenshot_url ?? null,
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', values.email)
    .maybeSingle()

  if (profile?.id) {
    payload.user_id = profile.id
  }

  const insertError = await insertRecoveryRequest(supabase, 'account_recovery_requests', payload)

  if (insertError) {
    console.error('[admin/recovery] insert failed:', insertError.message)
    await removeRecoveryObjects(supabase, uploadedObjects)
    return NextResponse.json({ error: 'Could not create the request.' }, { status: 500 })
  }

  const { data: created } = await supabase
    .from('account_recovery_requests')
    .select(RECOVERY_COLUMNS)
    .eq('id', requestId)
    .maybeSingle()

  return NextResponse.json(
    {
      request: created
        ? toAdminRecoveryRecord(created as unknown as RecoveryRecordRow)
        : toAdminRecoveryRecord({ id: requestId, ...payload }),
    },
    { status: 201, headers: { 'Cache-Control': 'no-store' } }
  )
}
