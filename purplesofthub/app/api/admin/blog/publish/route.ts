import { NextRequest, NextResponse } from 'next/server'
import { requireBlogAdmin } from '@/lib/blog/admin-auth'
import { revalidatePath } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { blogImageUpload } from '@/lib/blog/cloudinary'
import { BlogPublishingError, publishBlog, type BlogPost, type BlogRepository, type BlogValues } from '@/lib/blog/publishing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const MAX_REQUEST_BYTES = 4 * 1024 * 1024
const response = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
function repository(): BlogRepository {
  const db = createServiceRoleClient()
  if (!db) throw new BlogPublishingError(503, 'publisher_unavailable', 'Publishing is not configured.')
  function check(error: { code?: string } | null) {
    if (error?.code === '23505') throw new BlogPublishingError(409, 'slug_exists', 'This slug already exists. No duplicate article was created.')
    if (error) throw new BlogPublishingError(503, 'database_unavailable', 'The article could not be saved. Check that the blog migration has been applied.')
  }
  return {
    async findById(id) { const { data, error } = await db.from('blog_posts').select('*').eq('id', id).maybeSingle(); check(error); return data as BlogPost | null },
    async findBySlug(slug) { const { data, error } = await db.from('blog_posts').select('*').eq('slug', slug).maybeSingle(); check(error); return data as BlogPost | null },
    async categories() { const { data, error } = await db.from('blog_categories').select('name,slug').order('name'); check(error); return data || [] },
    async insert(values: BlogValues) { const { data, error } = await db.from('blog_posts').insert(values).select('*').single(); check(error); return data as BlogPost },
    async update(id, values, expectedUpdatedAt) {
      let query = db.from('blog_posts').update(values).eq('id', id)
      query = expectedUpdatedAt === null ? query.is('updated_at', null) : query.eq('updated_at', expectedUpdatedAt)
      const { data, error } = await query.select('*').maybeSingle(); check(error); return data as BlogPost | null
    },
  }
}
async function readPayload(request: Request): Promise<{ payload: unknown; file?: File }> {
  const contentType = request.headers.get('content-type') || ''
  if (!contentType.startsWith('application/json') && !contentType.startsWith('multipart/form-data'))
    throw new BlogPublishingError(415, 'unsupported_content_type', 'Use JSON or multipart/form-data with payload and image fields.')
  if (Number(request.headers.get('content-length') || 0) > MAX_REQUEST_BYTES)
    throw new BlogPublishingError(413, 'request_too_large', 'The request exceeds 4 MB.')
  const reader = request.body?.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  if (reader) {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > MAX_REQUEST_BYTES) { await reader.cancel(); throw new BlogPublishingError(413, 'request_too_large', 'The request exceeds 4 MB.') }
      chunks.push(value)
    }
  }
  const bytes = Buffer.concat(chunks)
  if (contentType.startsWith('application/json')) return { payload: JSON.parse(bytes.toString('utf8')) }
  const form = await new Response(bytes, { headers: { 'Content-Type': contentType } }).formData()
  if ([...form.keys()].some(k => !['payload', 'image'].includes(k)) || form.getAll('payload').length !== 1 || form.getAll('image').length > 1)
    throw new BlogPublishingError(400, 'invalid_request', 'Send one payload field and at most one image file.')
  const payload = form.get('payload')
  const file = form.get('image')
  if (typeof payload !== 'string' || (file !== null && !(file instanceof File)))
    throw new BlogPublishingError(400, 'invalid_request', 'The payload must be JSON text and image must be a file.')
  return { payload: JSON.parse(payload), file: file instanceof File ? file : undefined }
}
function failure(error: unknown) {
  if (error instanceof BlogPublishingError) return response({ ok: false, code: error.code, error: error.message, fields: error.fields,
    existing: error.existing ? { id: error.existing.id, slug: error.existing.slug, status: error.existing.status } : undefined }, error.status)
  if (error instanceof SyntaxError || error instanceof TypeError) return response({ ok: false, code: 'invalid_request', error: 'Could not read the request. Check the JSON or multipart encoding.' }, 400)
  console.error('[blog publisher] Unexpected server failure.')
  return response({ ok: false, code: 'publishing_failed', error: 'Publishing failed. Please try again.' }, 500)
}
export async function POST(request: NextRequest) {
  try {
    const auth = await requireBlogAdmin(request)
    if (!auth.ok) return response({ ok: false, code: 'unauthorized', error: auth.error }, auth.status)
    const { payload, file } = await readPayload(request)
    const image = file ? await blogImageUpload(file) : undefined
    const result = await publishBlog(payload, repository(), { image })
    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/blog/' + result.post.slug)
    return response(result, result.operation === 'create' ? 201 : 200)
  } catch (error) { return failure(error) }
}
export async function GET(request: NextRequest) {
  try {
    const auth = await requireBlogAdmin(request)
    if (!auth.ok) return response({ ok: false, code: 'unauthorized', error: auth.error }, auth.status)
    const db = repository()
    const id = request.nextUrl.searchParams.get('id')
    const slug = request.nextUrl.searchParams.get('slug')
    const post = id ? await db.findById(id) : slug ? await db.findBySlug(slug) : null
    if ((id || slug) && !post) throw new BlogPublishingError(404, 'post_not_found', 'Article not found.')
    return response({ ok: true, post, categories: await db.categories(), content_format: 'markdown' })
  } catch (error) { return failure(error) }
}
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireBlogAdmin(request)
    if (!auth.ok) return response({ ok: false, code: 'unauthorized', error: auth.error }, auth.status)
    const id = request.nextUrl.searchParams.get('id')
    if (!id || !/^[a-f0-9-]{36}$/i.test(id)) throw new BlogPublishingError(422, 'validation_failed', 'Supply the existing article UUID.')
    const db = createServiceRoleClient()
    if (!db) throw new BlogPublishingError(503, 'publisher_unavailable', 'Publishing is not configured.')
    const { data, error } = await db.from('blog_posts').delete().eq('id', id).select('id,slug').maybeSingle()
    if (error) throw new BlogPublishingError(503, 'delete_failed', 'The article could not be deleted.')
    if (!data) throw new BlogPublishingError(404, 'post_not_found', 'Article not found.')
    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/blog/' + data.slug)
    return response({ ok: true, id: data.id })
  } catch (error) { return failure(error) }
}
