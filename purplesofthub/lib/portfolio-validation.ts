import { toSlug } from '@/lib/portfolio'
import { previewVideoUrl } from './media-preview'

export const isPortfolioId = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

export function portfolioPageRange(params: URLSearchParams) {
  const limitText = params.get('limit') ?? '50'
  const offsetText = params.get('offset') ?? '0'
  if (!/^\d+$/.test(limitText) || !/^\d+$/.test(offsetText)) return null
  const limit = Number(limitText), offset = Number(offsetText)
  return limit >= 1 && limit <= 100 && offset <= 100000 ? { limit, offset } : null
}

export function portfolioSearch(value: string) {
  // PostgREST OR syntax must not be supplied by a search term.
  return value.trim().toLowerCase().replace(/[(),.%_"\\]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function portfolioInputError(value: unknown, updating = false): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'Invalid project data'
  const body = value as Record<string, unknown>
  if (updating && !isPortfolioId(body.id)) return 'A valid project ID is required'
  if (!updating || body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim() || body.title.length > 200) return 'A project title of 1–200 characters is required'
    if (!body.slug && !toSlug(body.title)) return 'A valid project slug is required'
  }
  if (body.slug !== undefined && (typeof body.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug) || body.slug.length > 180)) return 'Invalid project slug'
  if (body.status !== undefined && (typeof body.status !== 'string' || !['draft', 'published', 'archived'].includes(body.status))) return 'Invalid project status'
  if (body.featured !== undefined && typeof body.featured !== 'boolean') return 'Featured must be true or false'
  if (body.videos && typeof body.videos === 'object' && 'preview' in body.videos) {
    const preview = (body.videos as Record<string, unknown>).preview
    if (preview !== '' && !previewVideoUrl(preview)) return 'Use an approved Cloudinary MP4/WebM upload URL for the preview'
  }
  if (body.client_id !== undefined && body.client_id !== null && !isPortfolioId(body.client_id)) return 'Invalid client ID'
  if (body.cover_image !== undefined && body.cover_image !== null && body.cover_image !== '') {
    if (typeof body.cover_image !== 'string') return 'Invalid cover image URL'
    if (!/^\/(?![\/\\])/.test(body.cover_image)) {
      try {
        const url = new URL(body.cover_image)
        if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return 'Invalid cover image URL'
      } catch { return 'Invalid cover image URL' }
    }
  }
  return null
}
