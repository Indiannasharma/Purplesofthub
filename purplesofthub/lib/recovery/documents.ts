import { createHash, randomUUID } from 'node:crypto'

/**
 * Server-only helpers for the *private* account-recovery document bucket.
 *
 * Security contract:
 *  - The bucket is private. Documents are never exposed through public URLs.
 *  - Object paths are generated here, never taken from the browser: a random
 *    UUID folder (the recovery request id) plus a random UUID file name.
 *  - `parseRecoveryDocumentReference` resolves a stored database value to an
 *    object path inside the recovery bucket. Anything that is not a relative
 *    object path or a URL pointing at *our own* Supabase project's recovery
 *    bucket is rejected (external URLs, other buckets, traversal).
 */

/** The only bucket recovery documents may ever be read from / written to. */
export const RECOVERY_DOCUMENTS_BUCKET = 'account-recovery-documents'

/** Lifetime of a single-use admin viewing link. */
export const RECOVERY_SIGNED_URL_TTL_SECONDS = 60

/** Object-name root inside the bucket: recovery/{requestUuid}/{documentUuid}.ext */
export const RECOVERY_OBJECT_ROOT = 'recovery'

/** Recovery columns that may hold a document reference. */
export const RECOVERY_DOCUMENT_COLUMNS = ['id_document_url', 'screenshot_url'] as const

/**
 * Document identifiers used by the admin signed-URL route
 * (`/api/admin/recovery/[id]/documents/[documentId]/signed-url`).
 *
 * These are the *only* values a browser may ask for: the client never supplies
 * a storage path or URL.
 */
export const RECOVERY_DOCUMENT_KEYS = ['id_document', 'screenshot'] as const

export type RecoveryDocumentKey = (typeof RECOVERY_DOCUMENT_KEYS)[number]

/** Database column that holds each document reference. */
export const RECOVERY_DOCUMENT_COLUMN_BY_KEY: Record<RecoveryDocumentKey, string> = {
  id_document: 'id_document_url',
  screenshot: 'screenshot_url',
}

export type RecoveryDocumentColumn = (typeof RECOVERY_DOCUMENT_COLUMNS)[number]

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-9a-f][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const CANONICAL_PATH_PATTERN =
  /^recovery\/[0-9a-f]{8}-[0-9a-f]{4}-[1-9a-f][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[1-9a-f][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|pdf)$/i
const SAFE_OBJECT_PATH_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/ -]{0,511}$/

export function isRecoveryDocumentColumn(value: string): value is RecoveryDocumentColumn {
  return (RECOVERY_DOCUMENT_COLUMNS as readonly string[]).includes(value)
}

export function isRecoveryDocumentKey(value: string): value is RecoveryDocumentKey {
  return (RECOVERY_DOCUMENT_KEYS as readonly string[]).includes(value)
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value)
}

/**
 * Path used by every *new* upload: `recovery/{requestId}/{documentId}.{ext}`.
 *
 * Contains no name, e-mail, handle, account id or original filename, and no
 * timestamp that could be guessed or correlated.
 */
export function newRecoveryDocumentPath(requestId: string, extension: string): string {
  if (!isUuid(requestId)) {
    throw new Error('newRecoveryDocumentPath requires a UUID request id')
  }
  if (!/^(jpg|png|pdf)$/.test(extension)) {
    throw new Error('newRecoveryDocumentPath requires a validated extension')
  }
  return `${RECOVERY_OBJECT_ROOT}/${requestId}/${randomUUID()}.${extension}`
}

/** True for the canonical `recovery/{uuid}/{uuid}.ext` layout written by this module. */
export function isCanonicalRecoveryObjectPath(value: string): boolean {
  return CANONICAL_PATH_PATTERN.test(value)
}

function isSafeObjectPath(value: string): boolean {
  if (!value || value.length > 512) return false
  if (value.startsWith('/') || value.endsWith('/')) return false
  if (value.includes('\\') || value.includes('..') || value.includes('//')) return false
  if (/[\u0000-\u001f\u007f]/.test(value)) return false
  return SAFE_OBJECT_PATH_PATTERN.test(value)
}

export type RecoveryDocumentReference = {
  bucket: typeof RECOVERY_DOCUMENTS_BUCKET
  objectPath: string
  /** True when the database value was a legacy public URL (already contained). */
  legacyPublicUrl: boolean
}

/**
 * Resolve a stored database value to an object path inside the recovery bucket.
 *
 * Accepted shapes:
 *  1. `recovery/{uuid}/{uuid}.ext` and other *relative* object names that
 *     already exist in the bucket (legacy flat names such as
 *     `id_1699999999999_passport_jpg` survive the SQL path migration).
 *  2. A URL served from *our own* Supabase project's public object endpoint for
 *     the recovery bucket — this is the shape historical rows contain. Only the
 *     bucket and object path are extracted; the URL itself is never reused.
 *
 * Rejected: everything else, including external hosts, other buckets, signed
 * URLs for other buckets, traversal and absolute filesystem-looking paths.
 */
export function parseRecoveryDocumentReference(
  raw: string | null | undefined,
  supabaseUrl?: string | null
): RecoveryDocumentReference | null {
  const value = (raw ?? '').trim()
  if (!value || value.length > 2048) return null

  if (!value.includes('://')) {
    return isSafeObjectPath(value)
      ? { bucket: RECOVERY_DOCUMENTS_BUCKET, objectPath: value, legacyPublicUrl: false }
      : null
  }

  if (!supabaseUrl) return null

  let reference: URL
  let project: URL
  try {
    reference = new URL(value)
    project = new URL(supabaseUrl)
  } catch {
    return null
  }

  if (reference.protocol !== 'https:' && reference.protocol !== 'http:') return null
  if (reference.host !== project.host) return null

  const prefix = `/storage/v1/object/public/${RECOVERY_DOCUMENTS_BUCKET}/`
  if (!reference.pathname.startsWith(prefix)) return null

  const encoded = reference.pathname.slice(prefix.length)
  let objectPath: string
  try {
    objectPath = decodeURIComponent(encoded)
  } catch {
    return null
  }

  if (!isSafeObjectPath(objectPath)) return null

  return { bucket: RECOVERY_DOCUMENTS_BUCKET, objectPath, legacyPublicUrl: true }
}

/**
 * Privacy-conscious rate-limit key: the caller's raw IP is never stored or
 * logged, only a salted SHA-256 digest.
 */
export function deriveRecoveryRateLimitKey(identifier: string, secret?: string): string {
  const digest = createHash('sha256')
    .update(`${secret ?? 'purplesofthub-recovery'}:${identifier}`)
    .digest('hex')
  return `recovery:${digest}`
}
