import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { isAdminRecoveryStatus, toAdminRecoveryRecord } from '@/lib/recovery/records'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/admin/recovery/requests/[id]
 *
 * The only way internal `admin_notes` (and workflow status) may change.
 *
 *  - `requireAdmin()` runs before any privileged access.
 *  - Only `status` and `admin_notes` are accepted; document references,
 *    `created_by_admin_id` and `user_id` are server-owned and cannot be set here.
 *  - The column-level GRANTs added by
 *    supabase/migrations/20260924000000_privatize_account_recovery_documents.sql
 *    stop anon/authenticated sessions from writing or reading `admin_notes`
 *    directly, so this guarded route is the only mutation path.
 */

const MAX_ADMIN_NOTES_LENGTH = 4000

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  const { id } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  const rejected = Object.keys(body).filter(key => key !== 'status' && key !== 'admin_notes')

  if (rejected.length > 0) {
    return NextResponse.json(
      { error: 'This request contains a field that cannot be updated.' },
      { status: 400 }
    )
  }

  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || !isAdminRecoveryStatus(body.status)) {
      return NextResponse.json({ error: 'Unsupported status.' }, { status: 400 })
    }
    updates.status = body.status
  }

  if (body.admin_notes !== undefined) {
    if (body.admin_notes !== null && typeof body.admin_notes !== 'string') {
      return NextResponse.json({ error: 'Invalid notes value.' }, { status: 400 })
    }
    const notes =
      typeof body.admin_notes === 'string'
        ? body.admin_notes.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, MAX_ADMIN_NOTES_LENGTH)
        : ''
    updates.admin_notes = notes || null
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })
  }

  const supabase = createServiceRoleClient()
  if (!supabase) {
    console.error('[admin/recovery] service role client unavailable')
    return NextResponse.json({ error: 'Recovery updates are unavailable.' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('account_recovery_requests')
    .update(updates)
    .eq('id', id)
    .select('*')
    .maybeSingle()

  if (error) {
    console.error('[admin/recovery] update failed:', error.message)
    return NextResponse.json({ error: 'Recovery update failed.' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Recovery request not found.' }, { status: 404 })
  }

  console.info('[admin/recovery] record updated', {
    recoveryId: id,
    actorId: admin.userId,
    fields: Object.keys(updates),
  })

  return NextResponse.json(
    { request: toAdminRecoveryRecord(data) },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
