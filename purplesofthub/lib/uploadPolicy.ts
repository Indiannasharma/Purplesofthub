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
