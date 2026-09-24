/**
 * Server-side schema + validation for account-recovery submissions.
 *
 * Server-only helper (imported by route handlers, never by client components).
 *
 * Security contract:
 *  - The public submission endpoint accepts *only* the public field set. Any
 *    internal field (administrative notes, status, staff assignment, document
 *    paths, administrator identity) is explicitly rejected instead of silently
 *    ignored, so a forged submission cannot influence internal state.
 *  - Internal fields such as `admin_notes` are only accepted from the
 *    admin-guarded route (`mode: 'admin'`), which is protected by requireAdmin().
 *  - All values are length-capped and normalised here; the browser's values are
 *    never trusted as-is.
 *
 * No imports on purpose: this module can be unit-tested directly by Node.
 */

/** Fields that describe internal workflow state and are never public input. */
export const RECOVERY_INTERNAL_FIELDS = [
  'admin_notes',
  'adminnotes',
  'internal_notes',
  'internalnotes',
  'status',
  'approval_status',
  'approvalstatus',
  'created_by_admin_id',
  'createdbyadminid',
  'assigned_to',
  'assignedto',
  'assigned_admin_id',
  'user_id',
  'userid',
  'id_document_url',
  'iddocumenturl',
  'screenshot_url',
  'screenshoturl',
] as const

/** Platform values the application offers today (public + admin forms). */
export const RECOVERY_PLATFORMS = [
  'facebook',
  'instagram',
  'tiktok',
  'twitter',
  'youtube',
  'others',
  'other',
] as const

export type RecoveryRequestValues = {
  first_name: string
  last_name: string | null
  full_name: string
  handle: string | null
  email: string
  phone: string | null
  support_type: string | null
  appeal_message: string
  platform: string
  amount: number | null
}

export type RecoverySubmissionParse =
  | { ok: true; value: RecoveryRequestValues; adminNotes: string | null }
  | { ok: false; status: 400; error: string }

export type RecoverySubmissionMode = 'public' | 'admin'

type RecoveryFieldKey = keyof RecoveryRequestValues

/** Accepted spellings per logical field (keys are compared lower-cased). */
const FIELD_ALIASES: Record<string, RecoveryFieldKey> = {
  first_name: 'first_name',
  firstname: 'first_name',
  last_name: 'last_name',
  lastname: 'last_name',
  surname: 'last_name',
  full_name: 'full_name',
  fullname: 'full_name',
  name: 'full_name',
  handle: 'handle',
  username: 'handle',
  facebook_handle: 'handle',
  email: 'email',
  phone: 'phone',
  issue_type: 'support_type',
  issuetype: 'support_type',
  support_type: 'support_type',
  appeal_message: 'appeal_message',
  appealmessage: 'appeal_message',
  additional_info: 'appeal_message',
  platform: 'platform',
  amount: 'amount',
}

/**
 * Public fields that are accepted but intentionally not persisted
 * (client-side hints such as the payment method chosen on the form) and the
 * CAPTCHA token.
 */
const IGNORED_PUBLIC_FIELDS = [
  'paymentmethod',
  'profileurl',
  'captchatoken',
  'cf-turnstile-response',
] as const

const ADMIN_ONLY_FIELDS = ['admin_notes', 'adminnotes'] as const

const PUBLIC_ALLOWED = new Set<string>([
  ...Object.keys(FIELD_ALIASES),
  ...IGNORED_PUBLIC_FIELDS,
])

const ADMIN_ALLOWED = new Set<string>([
  ...PUBLIC_ALLOWED,
  ...ADMIN_ONLY_FIELDS,
])

const INTERNAL_FIELD_SET = new Set<string>(RECOVERY_INTERNAL_FIELDS)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SLUG_PATTERN = /^[a-z0-9_-]{2,32}$/

export const RECOVERY_MAX_APPEAL_MESSAGE_LENGTH = 5000
const MAX_NAME_LENGTH = 80
const MAX_HANDLE_LENGTH = 100
const MAX_PHONE_LENGTH = 50
const MAX_EMAIL_LENGTH = 200
const MAX_ADMIN_NOTES_LENGTH = 4000
const MAX_AMOUNT = 100_000_000

function normalizeText(raw: string, maxLength: number): string {
  return raw.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength)
}

function normalizeHandle(raw: string): string | null {
  const value = normalizeText(raw, MAX_HANDLE_LENGTH).replace(/^@+/, '').replace(/\s+/g, '')
  return value ? value : null
}

/**
 * Parse + validate a recovery submission.
 *
 * `mode: 'public'` rejects every internal field; `mode: 'admin'` is only ever
 * called from the requireAdmin()-guarded route and additionally accepts
 * `admin_notes`.
 */
export function parseRecoverySubmission(
  form: FormData,
  options: { mode: RecoverySubmissionMode }
): RecoverySubmissionParse {
  const mode = options.mode
  const allowed = mode === 'admin' ? ADMIN_ALLOWED : PUBLIC_ALLOWED
  const collected: Partial<Record<RecoveryFieldKey, string>> = {}
  let adminNotes: string | null = null

  for (const [rawKey, rawValue] of form.entries()) {
    // Attachments are validated separately by the route handler.
    if (typeof rawValue !== 'string') continue

    const key = rawKey.trim().toLowerCase()

    if (INTERNAL_FIELD_SET.has(key)) {
      if (mode === 'public') {
        return {
          ok: false,
          status: 400,
          error: 'This submission contains a field that is not accepted.',
        }
      }
      if ((ADMIN_ONLY_FIELDS as readonly string[]).includes(key)) {
        adminNotes = normalizeText(rawValue, MAX_ADMIN_NOTES_LENGTH) || null
        continue
      }
      return {
        ok: false,
        status: 400,
        error: 'This submission contains a field that is not accepted.',
      }
    }

    if (!allowed.has(key)) {
      return {
        ok: false,
        status: 400,
        error: 'This submission contains a field that is not accepted.',
      }
    }

    const field = FIELD_ALIASES[key]
    if (!field) continue

    const value = rawValue.trim()
    if (!value) continue
    if (collected[field] === undefined) collected[field] = value
  }

  const fullNameRaw = collected.full_name
    ? normalizeText(collected.full_name, MAX_NAME_LENGTH * 2)
    : ''
  const firstRaw = collected.first_name ? normalizeText(collected.first_name, MAX_NAME_LENGTH) : ''
  const lastRaw = collected.last_name ? normalizeText(collected.last_name, MAX_NAME_LENGTH) : ''

  let firstName = firstRaw
  let lastName: string | null = lastRaw || null

  // The public form sends `fullName` only, the admin form sends first/last.
  if (!firstName && fullNameRaw) {
    const parts = fullNameRaw.split(/\s+/).filter(Boolean)
    firstName = parts[0]?.slice(0, MAX_NAME_LENGTH) ?? ''
    if (!lastName && parts.length > 1) {
      lastName = parts.slice(1).join(' ').slice(0, MAX_NAME_LENGTH)
    }
  }

  if (!firstName) {
    return { ok: false, status: 400, error: 'First name is required.' }
  }

  const fullName = fullNameRaw || [firstName, lastName].filter(Boolean).join(' ')

  const emailRaw = collected.email ? normalizeText(collected.email, MAX_EMAIL_LENGTH) : ''
  if (!emailRaw || !EMAIL_PATTERN.test(emailRaw)) {
    return { ok: false, status: 400, error: 'A valid email address is required.' }
  }

  const platformRaw = collected.platform ? normalizeText(collected.platform, 32).toLowerCase() : ''
  if (!platformRaw || !SLUG_PATTERN.test(platformRaw)) {
    return { ok: false, status: 400, error: 'A valid platform is required.' }
  }
  if (!(RECOVERY_PLATFORMS as readonly string[]).includes(platformRaw)) {
    return { ok: false, status: 400, error: 'Unsupported platform.' }
  }

  const appealMessage = collected.appeal_message
    ? normalizeText(collected.appeal_message, RECOVERY_MAX_APPEAL_MESSAGE_LENGTH)
    : ''
  if (!appealMessage) {
    return { ok: false, status: 400, error: 'An appeal message is required.' }
  }

  let supportType: string | null = null
  if (collected.support_type) {
    const candidate = normalizeText(collected.support_type, 32).toLowerCase()
    if (!SLUG_PATTERN.test(candidate)) {
      return { ok: false, status: 400, error: 'Unsupported issue type.' }
    }
    supportType = candidate
  }

  let amount: number | null = null
  if (collected.amount) {
    const parsed = Number(collected.amount.replace(/,/g, ''))
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > MAX_AMOUNT) {
      return { ok: false, status: 400, error: 'Invalid amount.' }
    }
    amount = parsed
  }

  const phone = collected.phone ? normalizeText(collected.phone, MAX_PHONE_LENGTH) : ''

  return {
    ok: true,
    adminNotes,
    value: {
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      handle: collected.handle ? normalizeHandle(collected.handle) : null,
      email: emailRaw.toLowerCase(),
      phone: phone || null,
      support_type: supportType,
      appeal_message: appealMessage,
      platform: platformRaw,
      amount,
    },
  }
}
