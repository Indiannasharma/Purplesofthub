import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { randomUUID } from 'node:crypto'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp, rateLimiters } from '@/lib/rateLimit'
import { verifyCaptcha } from '@/lib/verifyCaptcha'
import { parseRecoverySubmission, type RecoveryRequestValues } from '@/lib/recovery/requests'
import {
  RECOVERY_DOCUMENTS_BUCKET,
  deriveRecoveryRateLimitKey,
  newRecoveryDocumentPath,
} from '@/lib/recovery/documents'
import { insertRecoveryRequest, removeRecoveryObjects } from '@/lib/recovery/persistence'
import {
  RECOVERY_DOCUMENT_MAX_ATTACHMENTS,
  RECOVERY_REQUEST_MAX_BYTES,
  sanitizeDisplayFileName,
  validateRecoveryDocument,
} from '@/lib/uploadPolicy'

export const dynamic = 'force-dynamic'

/**
 * Public account-recovery submission endpoint.
 *
 * Security posture (see docs/security/ACCOUNT_RECOVERY_SECURITY_PATCH.md):
 *  - No administrator identity is inferred here. `created_by_admin_id` is
 *    explicitly null for genuine public submissions; administrative creation
 *    lives in a separate server-guarded admin route.
 *  - Internal fields (`admin_notes`, status, staff assignment, document paths,
 *    administrator ids) are rejected by `parseRecoverySubmission({mode:'public'})`
 *    and are never written from this route.
 *  - Attachments are validated server-side (allowlist + size + magic bytes)
 *    and stored in the *private* recovery bucket under unpredictable UUID paths.
 *  - No public URL is ever generated or returned.
 */

/** The only two attachment slots the recovery form offers. */
const ATTACHMENT_FIELDS = [
  { field: 'idFile', column: 'id_document_url' },
  { field: 'screenshotFile', column: 'screenshot_url' },
] as const

type AttachmentColumn = (typeof ATTACHMENT_FIELDS)[number]['column']

function jsonError(error: string, status: number, extraHeaders: Record<string, string> = {}) {
  return NextResponse.json(
    { error },
    { status, headers: { 'Cache-Control': 'no-store', ...extraHeaders } }
  )
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function readString(value: FormDataEntryValue | null | undefined): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

/**
 * Notify the team that a request arrived.
 *
 * No document is ever attached to or linked from the e-mail, and no document
 * content is logged. The sanitized display names are included for staff context
 * only — the private object paths are never exposed outside the admin API.
 */
async function notifyTeam(
  values: RecoveryRequestValues,
  displayNames: (string | null)[],
  requestId: string
): Promise<void> {
  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASS

  if (!emailUser || !emailPass) {
    console.warn('[account-recovery] team notification skipped: mail credentials not configured')
    return
  }

  const fileCount = displayNames.length
  const rows: Array<[string, string]> = [
    ['Full Name', values.full_name],
    ['Handle', values.handle ?? ''],
    ['Email', values.email],
    ['Phone', values.phone ?? ''],
    ['Platform', values.platform.toUpperCase()],
    ['Issue Type', values.support_type ?? ''],
    ['Amount', values.amount !== null ? `₦${values.amount.toLocaleString()}` : '—'],
    ['Appeal Message', values.appeal_message],
    [
      'Documents',
      fileCount > 0
        ? `✓ ${fileCount} file(s) uploaded — view them in the admin recovery workspace`
        : 'Not provided',
    ],
    ['Reference', requestId],
  ]

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass },
    })

    await transporter.sendMail({
      from: `"PurpleSoftHub" <${emailUser}>`,
      to: 'hello@purplesofthub.com',
      replyTo: values.email,
      subject: `🔐 New Account Recovery: ${values.first_name} — ${values.platform.toUpperCase()}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:28px 24px;text-align:center">
            <h2 style="color:#fff;margin:0;font-size:22px">🔐 New Account Recovery Request</h2>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">
              Platform: ${escapeHtml(values.platform.toUpperCase())}
            </p>
          </div>
          <div style="padding:28px 24px">
            ${rows
              .map(
                ([key, value]) => `
              <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #f0f0f0">
                <div style="font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">
                  ${escapeHtml(key)}
                </div>
                <div style="font-size:14px;color:#1a1a1a;white-space:pre-wrap">
                  ${escapeHtml(value || '—')}
                </div>
              </div>
            `
              )
              .join('')}
          </div>
          <div style="background:#f8f5ff;padding:16px 24px;text-align:center;font-size:12px;color:#888">
            PurpleSoftHub Account Recovery · ${escapeHtml(
              new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })
            )}
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error('[account-recovery] team notification failed:', (error as Error).message)
  }
}

export async function POST(request: NextRequest) {
  // ── 1. Reject oversized bodies before buffering multipart data ──────────
  const declaredLength = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(declaredLength) && declaredLength > RECOVERY_REQUEST_MAX_BYTES) {
    return jsonError('This submission is too large.', 413)
  }

  // ── 2. Abuse controls — rate limit on a salted hash of the client IP ────
  const clientIp = getClientIp(request.headers)
  const limit = await checkRateLimit(
    rateLimiters.recovery,
    deriveRecoveryRateLimitKey(clientIp, process.env.RATE_LIMIT_SECRET)
  )

  if (!limit.ok) {
    const retryAfter = Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000))
    return jsonError(
      'Too many recovery submissions from this connection. Please try again later.',
      429,
      { 'Retry-After': String(retryAfter) }
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return jsonError('Invalid submission.', 400)
  }

  // ── 3. CAPTCHA — enforced whenever the server has a Turnstile secret ────
  const captchaToken =
    readString(formData.get('captchaToken')) ?? readString(formData.get('cf-turnstile-response'))
  const captcha = await verifyCaptcha(captchaToken, clientIp)

  if (!captcha.ok) {
    return jsonError(captcha.error ?? 'Captcha verification failed.', 400)
  }

  // ── 4. Schema — internal fields are rejected, never trusted ─────────────
  const parsed = parseRecoverySubmission(formData, { mode: 'public' })
  if (!parsed.ok) {
    return jsonError(parsed.error, parsed.status)
  }

  const values = parsed.value

  // ── 5. Attachments — count, allowlist, size and magic-byte checks ───────
  const attachments: Array<{
    column: AttachmentColumn
    file: File
    buffer: Buffer
    extension: string
    displayName: string | null
  }> = []

  for (const { field, column } of ATTACHMENT_FIELDS) {
    for (const entry of formData.getAll(field)) {
      if (!(entry instanceof File) || entry.size === 0) continue

      if (attachments.length >= RECOVERY_DOCUMENT_MAX_ATTACHMENTS) {
        return jsonError(
          `A maximum of ${RECOVERY_DOCUMENT_MAX_ATTACHMENTS} documents can be uploaded.`,
          400
        )
      }

      const buffer = Buffer.from(await entry.arrayBuffer())
      const validation = validateRecoveryDocument(entry, buffer)

      if (!validation.ok) {
        return jsonError(validation.error, validation.status)
      }

      attachments.push({
        column,
        file: entry,
        buffer,
        extension: validation.extension,
        displayName: sanitizeDisplayFileName(entry.name),
      })
    }
  }

  // ── 6. Privileged client. Server-side only; the key never reaches the browser ──
  const supabase = createServiceRoleClient()
  if (!supabase) {
    console.error('[account-recovery] service role client unavailable; submission rejected')
    return jsonError(
      'Recovery submissions are temporarily unavailable. Please try again shortly.',
      503
    )
  }

  const requestId = randomUUID()
  const storedPaths: Partial<Record<AttachmentColumn, string>> = {}
  const uploadedObjects: string[] = []

  // ── 7. Upload to the private bucket under unpredictable UUID paths ──────
  for (const attachment of attachments) {
    let objectPath: string

    try {
      objectPath = newRecoveryDocumentPath(requestId, attachment.extension)
    } catch (error) {
      console.error('[account-recovery] storage path error:', (error as Error).message)
      await removeRecoveryObjects(supabase, uploadedObjects)
      return jsonError('We could not process this submission. Please try again.', 500)
    }

    const { error: uploadError } = await supabase.storage
      .from(RECOVERY_DOCUMENTS_BUCKET)
      .upload(objectPath, attachment.buffer, {
        cacheControl: '60',
        contentType: attachment.file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[account-recovery] document upload failed:', uploadError.message)
      await removeRecoveryObjects(supabase, uploadedObjects)
      return jsonError('We could not store the uploaded document. Please try again.', 502)
    }

    uploadedObjects.push(objectPath)
    storedPaths[attachment.column] = objectPath
  }

  // ── 8. Persist. Internal fields are omitted (admin_notes) or explicitly
  //       null because this route holds no administrator identity. ─────────
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
    status: 'pending_payment',
    created_by_admin_id: null,
    id_document_url: storedPaths.id_document_url ?? null,
    screenshot_url: storedPaths.screenshot_url ?? null,
  }

  // Link the request to an existing account when the e-mail matches one.
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', values.email)
    .maybeSingle()

  if (profile?.id) {
    payload.user_id = profile.id
  }

  const insertError = await insertRecoveryRequest(
    supabase,
    'account_recovery_requests',
    payload
  )

  if (insertError) {
    console.error('[account-recovery] insert failed:', insertError.message)
    await removeRecoveryObjects(supabase, uploadedObjects)
    return jsonError('We could not save your request. Please try again.', 500)
  }

  await notifyTeam(
    values,
    attachments.map(attachment => attachment.displayName),
    requestId
  )

  // The response deliberately contains neither object paths nor URLs.
  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
}
