export const BLOG_SITE_URL = 'https://www.purplesofthub.com'
export const DEFAULT_BLOG_AUTHOR = 'PurpleSoftHub'
// The database uses TEXT; 100 ASCII characters keeps URL/index size bounded.
export const MAX_BLOG_SLUG_LENGTH = 100
export type BlogStatus = 'draft' | 'published'
export type BlogPost = {
  id: string; title: string; slug: string; content: string; excerpt: string;
  featured_image: string | null; featured_image_alt: string | null;
  category: string | null; tags: string[] | null; source_urls: string[] | null;
  seo_title: string; seo_description: string; status: BlogStatus;
  author_name: string | null; author_type: 'Person' | 'Organization' | null;
  author_id: string | null; published_at: string | null;
  created_at: string; updated_at: string | null;
}
export type BlogValues = Omit<BlogPost, 'id' | 'created_at'>
export interface BlogRepository {
  findById(id: string): Promise<BlogPost | null>
  findBySlug(slug: string): Promise<BlogPost | null>
  categories(): Promise<{ name: string; slug: string }[]>
  insert(values: BlogValues): Promise<BlogPost>
  update(id: string, values: BlogValues, expectedUpdatedAt: string | null): Promise<BlogPost | null>
}
export class BlogPublishingError extends Error {
  status: number
  code: string
  fields?: Record<string, string>
  existing?: Pick<BlogPost, 'id' | 'slug' | 'status'>
  constructor(status: number, code: string, message: string,
    fields?: Record<string, string>, existing?: Pick<BlogPost, 'id' | 'slug' | 'status'>) {
    super(message); this.status = status; this.code = code; this.fields = fields; this.existing = existing
  }
}
export function blogSlug(title: string): string {
  return title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, MAX_BLOG_SLUG_LENGTH).replace(/-+$/g, '')
}
export function excerptDescription(excerpt: string, maximum = 160): string {
  const plain = excerpt.replace(/<[^>]*>/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_#`~]/g, '').replace(/\s+/g, ' ').trim()
  if (plain.length <= maximum) return plain
  const clipped = plain.slice(0, maximum - 1)
  const boundary = clipped.lastIndexOf(' ')
  return (boundary > maximum / 2 ? clipped.slice(0, boundary) : clipped).trimEnd() + '…'
}
export function httpsUrl(value: string): boolean {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password } catch { return false }
}
const allowed = new Set(['operation', 'id', 'slug', 'title', 'content', 'excerpt', 'featured_image',
  'featured_image_alt', 'category', 'tags', 'seo_title', 'seo_description', 'status', 'author',
  'author_type', 'source_urls', 'content_format', 'expected_updated_at'])
const stringLimits: Record<string, number> = { title: 200, content: 100000, excerpt: 500,
  slug: MAX_BLOG_SLUG_LENGTH, featured_image: 2048, featured_image_alt: 300, category: 100,
  seo_title: 70, seo_description: 160, author: 120, id: 36, expected_updated_at: 40 }
export function parsePublishingInput(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new BlogPublishingError(400, 'invalid_request', 'Send a JSON object as the article payload.')
  const body = input as Record<string, unknown>
  const fields: Record<string, string> = {}
  for (const key of Object.keys(body)) if (!allowed.has(key)) fields[key] = 'Unsupported field.'
  for (const [key, max] of Object.entries(stringLimits)) {
    if (key === 'expected_updated_at' && body[key] === null) continue
    if (body[key] !== undefined && (typeof body[key] !== 'string' || (body[key] as string).length > max))
      fields[key] = 'Must be a string of at most ' + max + ' characters.'
  }
  for (const key of ['tags', 'source_urls']) {
    if (body[key] !== undefined && (!Array.isArray(body[key]) || (body[key] as unknown[]).length > 20
      || (body[key] as unknown[]).some(v => typeof v !== 'string' || v.length > (key === 'tags' ? 50 : 2048))))
      fields[key] = 'Use an array of up to 20 strings (' + (key === 'tags' ? '50' : '2048') + ' characters each).'
  }
  if (body.operation !== undefined && !['create', 'update'].includes(body.operation as string)) fields.operation = 'Use create or update.'
  if (body.status !== undefined && !['draft', 'published'].includes(body.status as string)) fields.status = 'Use draft or published.'
  if (body.content_format !== undefined && body.content_format !== 'markdown') fields.content_format = 'Content must be Markdown.'
  if (body.author_type !== undefined && !['Person', 'Organization'].includes(body.author_type as string)) fields.author_type = 'Use Person or Organization.'
  if (body.id !== undefined && !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(String(body.id))) fields.id = 'Use a valid article UUID.'
  if (Object.keys(fields).length) throw new BlogPublishingError(422, 'validation_failed', 'Correct the article fields.', fields)
  return body
}
export async function publishBlog(input: unknown, db: BlogRepository, options: {
  image?: { upload(): Promise<{ url: string; publicId: string }>; remove(publicId: string): Promise<void> }
  now?: () => Date
} = {}) {
  const body = parsePublishingInput(input)
  const operation = body.operation ?? 'create'
  if (operation === 'create' && body.id !== undefined)
    throw new BlogPublishingError(422, 'validation_failed', 'An ID is only accepted for an explicit update.', { id: 'Use operation: update.' })
  let existing: BlogPost | null = null
  if (operation === 'update') {
    if (!body.id && !body.slug) throw new BlogPublishingError(422, 'validation_failed', 'An update needs the existing article ID or slug.')
    existing = body.id ? await db.findById(String(body.id)) : await db.findBySlug(String(body.slug))
    if (!existing) throw new BlogPublishingError(404, 'post_not_found', 'The article to update does not exist.')
    if (body.expected_updated_at !== undefined && body.expected_updated_at !== existing.updated_at)
      throw new BlogPublishingError(409, 'post_changed', 'The article changed. Reload it before saving.')
  }
  const text = (key: string, fallback = '') => body[key] === undefined ? fallback : (body[key] as string).trim()
  const title = text('title', existing?.title)
  const slug = text('slug', existing?.slug || blogSlug(title)) || existing?.slug || blogSlug(title)
  const author = text('author', existing?.author_name || DEFAULT_BLOG_AUTHOR) || DEFAULT_BLOG_AUTHOR
  const status = (body.status ?? existing?.status ?? 'draft') as BlogStatus
  const excerpt = text('excerpt', existing?.excerpt)
  const content = text('content', existing?.content)
  const categoryInput = text('category', existing?.category || '')
  const categories = categoryInput ? await db.categories() : []
  const category = categories.find(c => c.name.toLowerCase() === categoryInput.toLowerCase() || c.slug === categoryInput.toLowerCase())?.name ?? null
  const list = (key: 'tags' | 'source_urls') => [...new Set((body[key] === undefined ? existing?.[key] || [] : body[key] as string[]).map(s => s.trim()).filter(Boolean))]
  const authorType = author === DEFAULT_BLOG_AUTHOR ? 'Organization' :
    body.author_type as 'Person' | 'Organization' | undefined ?? (author === existing?.author_name ? existing?.author_type : null) ?? 'Person'
  const imageUrl = text('featured_image', existing?.featured_image || '') || null
  const imageAlt = text('featured_image_alt', existing?.featured_image_alt || '') || null
  // Preserve explicitly stored SEO on partial updates; derive fresh defaults when an editor clears it.
  const seoTitle = text('seo_title', existing?.seo_title || '') || excerptDescription(title, 70)
  const seoDescription = text('seo_description', existing?.seo_description || '') || excerptDescription(excerpt)
  const fields: Record<string, string> = {}
  if (!title) fields.title = 'Title is required, including for drafts.'
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > MAX_BLOG_SLUG_LENGTH) fields.slug = 'Use 1–100 lowercase ASCII letters, numbers and single hyphens.'
  if (existing?.published_at && slug !== existing.slug) fields.slug = 'The slug of an article that has been published cannot change.'
  if (categoryInput && !category) fields.category = 'Choose an existing category name or slug; no category was created.'
  if (imageUrl && !httpsUrl(imageUrl)) fields.featured_image = 'Use a secure HTTPS image URL or attach an image file.'
  const sourceUrls = list('source_urls')
  if (sourceUrls.some(u => !httpsUrl(u))) fields.source_urls = 'Source URLs must use HTTPS and cannot contain credentials.'
  if (options.image && body.featured_image) fields.featured_image = 'Supply either an image file or a URL, not both.'
  if ((imageUrl || options.image) && !imageAlt) fields.featured_image_alt = 'Describe the featured image for accessibility.'
  if (status === 'published') {
    if (!content) fields.content = 'Content is required to publish.'
    if (!excerpt) fields.excerpt = 'An excerpt is required to publish.'
    if (!imageUrl && !options.image) fields.featured_image = 'A featured image is required to publish.'
    if (!seoTitle) fields.seo_title = 'An SEO title is required to publish.'
    if (!seoDescription) fields.seo_description = 'An SEO description is required to publish.'
  }
  if (Object.keys(fields).length) throw new BlogPublishingError(422, 'validation_failed', 'Correct the article fields before saving.', fields)
  const duplicate = await db.findBySlug(slug)
  if (duplicate && duplicate.id !== existing?.id)
    throw new BlogPublishingError(409, 'slug_exists', 'This slug already exists. Use an explicit update with its ID.', undefined, duplicate)
  const now = (options.now ?? (() => new Date()))()
  const updatedAt = new Date(Math.max(now.getTime(), existing?.updated_at ? new Date(existing.updated_at).getTime() + 1 : 0)).toISOString()
  const values: BlogValues = { title, slug, content, excerpt, category, tags: list('tags'), source_urls: sourceUrls,
    featured_image: imageUrl, featured_image_alt: imageAlt, seo_title: seoTitle, seo_description: seoDescription,
    author_name: author, author_type: authorType, author_id: author === DEFAULT_BLOG_AUTHOR ? null : author === existing?.author_name ? existing?.author_id ?? null : null,
    status, published_at: existing?.published_at || (status === 'published' ? now.toISOString() : null), updated_at: updatedAt }
  let uploaded: { url: string; publicId: string } | undefined
  try {
    if (options.image) {
      uploaded = await options.image.upload()
      if (!httpsUrl(uploaded.url)) throw new BlogPublishingError(502, 'image_upload_failed', 'The image service did not return a secure URL.')
      values.featured_image = uploaded.url
    }
    const post = existing ? await db.update(existing.id, values, existing.updated_at) : await db.insert(values)
    if (!post) throw new BlogPublishingError(409, 'post_changed', 'The article changed or was removed. Reload before saving.')
    return { ok: true as const, operation, post, url: BLOG_SITE_URL + '/blog/' + post.slug, content_format: 'markdown' as const }
  } catch (error) {
    if (uploaded && options.image) { try { await options.image.remove(uploaded.publicId) } catch { console.error('[blog publisher] Failed to clean up an unused image.') } }
    throw error
  }
}
