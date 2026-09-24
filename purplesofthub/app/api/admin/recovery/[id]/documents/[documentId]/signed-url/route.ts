import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import {
  RECOVERY_DOCUMENTS_BUCKET,
  RECOVERY_DOCUMENT_COLUMN_BY_KEY,
  RECOVERY_SIGNED_URL_TTL_SECONDS,
  isRecoveryDocumentKey,
  parseRecoveryDocumentReference,
} from '@/lib/recovery/documents'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/recovery/[id]/documents/[documentId]/signed-url
 *
 * Issues a short-lived signed URL for one document of one recovery request.
 *
 * Authorization order (all server-side):
 *  1. `requireAdmin()` — the caller must hold an authenticated admin session.
 *  2. The recovery record is loaded from the database with the service role.
 *  3. `documentId` is validated against the fixed document allowlist, so the
 *     browser can never supply a storage path.
 *  4. The stored value is resolved to an object path *inside* the private
 *     recovery bucket (legacy public URLs from historical rows are accepted
 *     only when they point at this project's recovery bucket).
 *  5. Only then is a 60-second signed URL minted.
 *
 * The response is `no-store`, the URL is never logged, and no URL is ever
 * generated for the whole page in one go.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  const { id, documentId } = await params

  if (!isRecoveryDocumentKey(documentId)) {
    return NextResponse.json({ error: 'Document not found.' }, { status: 404 })
  }

  const supabase = createServiceRoleClient()
  if (!supabase) {
    console.error('[admin/recovery/signed-url] service role client unavailable')
    return NextResponse.json({ error: 'Document access is unavailable.' }, { status: 503 })
  }

  const { data: record, error } = await supabase
    .from('account_recovery_requests')
    .select('id, id_document_url, screenshot_url')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[admin/recovery/signed-url] record lookup failed:', error.message)
    return NextResponse.json({ error: 'Document access failed.' }, { status: 500 })
  }

  if (!record) {
    return NextResponse.json({ error: 'Recovery request not found.' }, { status: 404 })
  }

  // The column is resolved from the fixed key → column map, never from input.
  const storedValue = (record as Record<string, unknown>)[
    RECOVERY_DOCUMENT_COLUMN_BY_KEY[documentId]
  ]
  const reference = parseRecoveryDocumentReference(
    typeof storedValue === 'string' ? storedValue : null,
    process.env.NEXT_PUBLIC_SUPABASE_URL
  )

  if (!reference) {
    // Covers: missing document, unexpected bucket, external URL, traversal.
    return NextResponse.json({ error: 'Document not found.' }, { status: 404 })
  }

  const { data: signed, error: signError } = await supabase.storage
    .from(RECOVERY_DOCUMENTS_BUCKET)
    .createSignedUrl(reference.objectPath, RECOVERY_SIGNED_URL_TTL_SECONDS)

  if (signError || !signed?.signedUrl) {
    console.error('[admin/recovery/signed-url] signing failed:', signError?.message ?? 'unknown')
    return NextResponse.json({ error: 'Document access failed.' }, { status: 500 })
  }

  // Deliberately logs identifiers only — never the signed URL itself.
  console.info('[admin/recovery/signed-url] issued', {
    recoveryId: id,
    document: documentId,
    actorId: admin.userId,
    legacyPublicUrl: reference.legacyPublicUrl,
  })

  return NextResponse.json(
    { url: signed.signedUrl, expiresIn: RECOVERY_SIGNED_URL_TTL_SECONDS },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
