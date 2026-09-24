/**
 * Centralized server-side upload policy.
 *
 * Server-only helper: imported by route handlers, never by client components.
 *
 * The browser is only allowed to send a "purpose" key (the existing `folder`
 * form field). The real Cloudinary destination, the accepted MIME types and
 * the size ceiling are all resolved here on the server so a client can never
 * choose an arbitrary folder or bypass validation.
 */

export const KB = 1024
export const MB = 1024 * KB

/** Image formats the application renders today. No SVG (stored XSS), no GIF. */
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const

/**
 * Documents accepted by the client "My Files" dashboard
 * (the page advertises PDFs, images, documents, videos and archives).
 */
export const DASHBOARD_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
  'text/csv',
  'text/rtf',
  'application/rtf',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.rar',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'audio/mpeg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/wav',
  'audio/x-wav',
  'audio/aac',
  'video/mp4',
  'video/quicktime',
  'video/webm',
] as const

export type UploadPurpose =
  | 'blog'
  | 'portfolio-covers'
  | 'portfolio-resources'
  | 'dashboard-files'

export type UploadRule = {
  /** Server-controlled Cloudinary folder. Never taken from the client. */
  folder: string
  /** Admin role required (true) or any authenticated user (false). */
  requireAdmin: boolean
  /** Exact MIME types accepted for this purpose. */
  mimeTypes: readonly string[]
  /** Maximum accepted file size in bytes. */
  maxBytes: number
  /** Store inside a per-user subfolder derived from the session user id. */
  perUserFolder: boolean
}

export const UPLOAD_PURPOSES: Record<UploadPurpose, UploadRule> = {
  // Admin blog editor featured image.
  blog: {
    folder: 'purplesofthub/blog',
    requireAdmin: true,
    mimeTypes: IMAGE_MIME_TYPES,
    maxBytes: 5 * MB,
    perUserFolder: false,
  },
  // Admin resource library cover image.
  'portfolio-covers': {
    folder: 'purplesofthub/portfolio-covers',
    requireAdmin: true,
    mimeTypes: IMAGE_MIME_TYPES,
    maxBytes: 5 * MB,
    perUserFolder: false,
  },
  // Admin resource library PDF (publicly downloadable, PDF only).
  'portfolio-resources': {
    folder: 'purplesofthub/portfolio-resources',
    requireAdmin: true,
    mimeTypes: ['application/pdf'],
    maxBytes: 20 * MB,
    perUserFolder: false,
  },
  // Client dashboard "My Files" uploads — authenticated users only, keep a
  // per-user subfolder so one client can never target another client's space.
  'dashboard-files': {
    folder: 'purplesofthub/dashboard-files',
    requireAdmin: false,
    mimeTypes: DASHBOARD_MIME_TYPES,
    maxBytes: 15 * MB,
    perUserFolder: true,
  },
}

/** Purpose used when a caller omits the `folder` field (legacy behaviour). */
export const DEFAULT_UPLOAD_PURPOSE: UploadPurpose = 'dashboard-files'

/** Reject path traversal / namespace escape in a client-supplied purpose. */
const PURPOSE_PATTERN = /^[a-z0-9-]+$/

/**
 * Resolve a client-supplied purpose to a server-side rule.
 * Returns null when the purpose is unknown or looks like a path payload.
 */
export function resolveUploadRule(purpose: string | null | undefined): UploadRule | null {
  const normalized = (purpose ?? '').trim().toLowerCase()

  if (!normalized) {
    return UPLOAD_PURPOSES[DEFAULT_UPLOAD_PURPOSE]
  }

  if (!PURPOSE_PATTERN.test(normalized)) return null
  if (normalized.includes('..')) return null

  return UPLOAD_PURPOSES[normalized as UploadPurpose] ?? null
}

/** Human readable size limit for error responses. */
export function formatLimit(bytes: number): string {
  if (bytes % MB === 0) return `${bytes / MB} MB`
  return `${(bytes / MB).toFixed(1)} MB`
}

/* -------------------------------------------------------------------------- */
/* Account-recovery identity documents                                        */
/* -------------------------------------------------------------------------- */

/**
 * MIME types accepted for the account-recovery identity documents that are
 * stored in the private `account-recovery-documents` Supabase Storage bucket.
 *
 * Deliberately narrower than IMAGE_MIME_TYPES:
 *  - no SVG (stored XSS), no GIF, no webp/avif (never required for scanned IDs),
 *  - PDF stays because passport / NIN / licence scans are commonly PDFs.
 */
export const RECOVERY_DOCUMENT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
] as const

/** Maximum accepted size of a single recovery attachment. */
export const RECOVERY_DOCUMENT_MAX_BYTES = 5 * MB

/** Maximum accepted number of attachments for one recovery submission. */
export const RECOVERY_DOCUMENT_MAX_ATTACHMENTS = 2

/** Maximum accepted size of a whole recovery submission request body. */
export const RECOVERY_REQUEST_MAX_BYTES = 12 * MB

/**
 * Storage extension for a validated MIME type.
 * The extension is always derived from the validated MIME type — never from
 * the client-supplied filename.
 */
export function extensionForMimeType(mimeType: string): string | null {
  switch (mimeType) {
    case 'application/pdf':
      return 'pdf'
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    default:
      return null
  }
}

export type RecoveryDocumentValidation =
  | { ok: true; mimeType: string; extension: string; size: number }
  | { ok: false; status: 400 | 413 | 415; error: string }

/**
 * Validate one recovery attachment: size, declared MIME type (strict
 * allowlist) *and* the actual leading bytes of the file.
 *
 * The browser's `File.type` and the file extension are attacker-controlled, so
 * neither is trusted on its own: the declared type must be in the allowlist and
 * the sniffed signature must match that declared type.
 */
export function validateRecoveryDocument(
  file: { type?: string | null; size?: number | null },
  buffer: Buffer
): RecoveryDocumentValidation {
  const declared = (file.type ?? '').toLowerCase().split(';')[0].trim()
  const size = typeof file.size === 'number' && file.size > 0 ? file.size : buffer.length

  if (size <= 0 || buffer.length === 0) {
    return { ok: false, status: 400, error: 'The uploaded file is empty.' }
  }

  if (size > RECOVERY_DOCUMENT_MAX_BYTES) {
    return {
      ok: false,
      status: 413,
      error: `File is too large. Maximum size is ${formatLimit(RECOVERY_DOCUMENT_MAX_BYTES)}.`,
    }
  }

  const supported = (RECOVERY_DOCUMENT_MIME_TYPES as readonly string[]).includes(declared)
  const extension = supported ? extensionForMimeType(declared) : null

  if (!supported || !extension) {
    return {
      ok: false,
      status: 415,
      error: 'Unsupported file type. Upload a JPG, PNG or PDF.',
    }
  }

  if (!matchesFileSignature(buffer, declared)) {
    return {
      ok: false,
      status: 415,
      error: 'File contents do not match the declared file type.',
    }
  }

  return { ok: true, mimeType: declared, extension, size }
}

/**
 * Produce a short, safe *display* name for the database record.
 *
 * This value is metadata only — it is never used to build a storage path and
 * never used to build a signed URL.
 */
export function sanitizeDisplayFileName(name: string | null | undefined): string | null {
  if (!name) return null

  const base = name.split(/[\\/]/).pop() ?? ''
  const cleaned = base
    .replace(/[\u0000-\u001f\u007f<>:"|?*]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned || cleaned === '.' || cleaned === '..') return null
  return cleaned.slice(0, 120)
}

/**
 * Verify the leading bytes of an upload match the declared MIME type.
 * Only the formats with a strict allowlist are sniffed; unknown / broad
 * formats return true so the MIME allowlist remains the gate.
 */
export function matchesFileSignature(buffer: Buffer, mimeType: string): boolean {
  const head = buffer.subarray(0, 1024)

  switch (mimeType) {
    case 'application/pdf': {
      // %PDF- must appear within the first 1024 bytes.
      return head.includes(Buffer.from('%PDF-'))
    }
    case 'image/jpeg':
      return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff
    case 'image/png':
      return head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47
    case 'image/webp':
      return head.subarray(0, 4).toString('ascii') === 'RIFF'
        && head.subarray(8, 12).toString('ascii') === 'WEBP'
    case 'image/avif':
      return head.subarray(4, 8).toString('ascii') === 'ftyp'
    default:
      return true
  }
}
