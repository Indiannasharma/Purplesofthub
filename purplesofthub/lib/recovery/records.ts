/**
 * Shape of a recovery record as returned to the authenticated admin UI.
 *
 * The admin browser never receives storage paths or URLs: documents are only
 * reachable through the guarded signed-URL endpoint, which resolves the object
 * path from trusted server-side data.
 */

export const ADMIN_RECOVERY_STATUSES = [
  'pending_payment',
  'pending',
  'in_progress',
  'completed',
  'rejected',
] as const

export type AdminRecoveryStatus = (typeof ADMIN_RECOVERY_STATUSES)[number]

export type AdminRecoveryRecord = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  platform: string | null
  support_type: string | null
  handle: string | null
  status: string | null
  payment_status: string | null
  amount_paid: number | null
  payment_method: string | null
  admin_notes: string | null
  appeal_message: string | null
  created_at: string | null
  has_id_document: boolean
  has_screenshot: boolean
}

export type RecoveryRecordRow = Record<string, unknown>

export function toAdminRecoveryRecord(row: RecoveryRecordRow): AdminRecoveryRecord {
  const text = (value: unknown): string | null =>
    typeof value === 'string' && value.length > 0 ? value : null

  const amountPaid = row.amount_paid

  return {
    id: String(row.id ?? ''),
    first_name: text(row.first_name),
    last_name: text(row.last_name),
    email: text(row.email),
    phone: text(row.phone),
    platform: text(row.platform),
    support_type: text(row.support_type),
    handle: text(row.handle),
    status: text(row.status),
    payment_status: text(row.payment_status),
    amount_paid:
      typeof amountPaid === 'number' ? amountPaid : amountPaid ? Number(amountPaid) : null,
    payment_method: text(row.payment_method),
    admin_notes: text(row.admin_notes),
    appeal_message: text(row.appeal_message),
    created_at: text(row.created_at),
    has_id_document: Boolean(row.id_document_url),
    has_screenshot: Boolean(row.screenshot_url),
  }
}

export function isAdminRecoveryStatus(value: string): value is AdminRecoveryStatus {
  return (ADMIN_RECOVERY_STATUSES as readonly string[]).includes(value)
}
