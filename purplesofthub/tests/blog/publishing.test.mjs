import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { publishBlog, blogSlug, BlogPublishingError, excerptDescription } from '../../lib/blog/publishing.ts'
import { authorizeBlogRequest } from '../../lib/blog/authorization.ts'
import { renderBlogMarkdown } from '../../lib/blog/rendering.ts'
import { blogPosting, serializeBlogPosting } from '../../lib/blog/structured-data.ts'
function repository() {
  const rows = new Map()
  return { rows, writes: 0, async findById(id) { return rows.get(id) || null },
    async findBySlug(slug) { return [...rows.values()].find(p => p.slug === slug) || null },
    async categories() { return [{ name: 'Technology', slug: 'technology' }] },
    async insert(values) {
      if (await this.findBySlug(values.slug)) throw new BlogPublishingError(409, 'slug_exists', 'Duplicate')
      const row = { ...values, id: randomUUID(), created_at: values.updated_at }; rows.set(row.id, row); this.writes++; return row
    },
    async update(id, values, expected) {
      if (rows.get(id)?.updated_at !== expected) return null
      const row = { ...rows.get(id), ...values }; rows.set(id, row); this.writes++; return row
    } }
}
const now = () => new Date('2026-10-07T12:00:00Z')
const article = { title: 'A useful article', content: '## Section\n\nSome **useful** content.', excerpt: 'A clear summary of the article.',
  featured_image: 'https://res.cloudinary.com/example/image/upload/example.png', featured_image_alt: 'A phone showing an update screen', category: 'technology' }
const rejects = (work, code) => assert.rejects(work, error => error instanceof BlogPublishingError && error.code === code)
test('create draft: automatic slug, organization author, SEO and no publication date', async () => {
  const db = repository(); const result = await publishBlog(article, db, { now })
  assert.equal(result.post.slug, 'a-useful-article'); assert.equal(result.post.status, 'draft')
  assert.equal(result.post.author_name, 'PurpleSoftHub'); assert.equal(result.post.author_type, 'Organization')
  assert.equal(result.post.author_id, null); assert.equal(result.post.published_at, null)
  assert.equal(result.post.category, 'Technology'); assert.equal(result.post.seo_title, article.title)
  assert.equal(result.post.seo_description, article.excerpt); assert.equal(db.rows.size, 1)
})
test('draft update, first publish and published update preserve ID, content and publication date', async () => {
  const db = repository(); const created = (await publishBlog(article, db, { now })).post
  const updated = (await publishBlog({ operation: 'update', id: created.id, content: '## New section\n\nRevised content' }, db, { now })).post
  assert.equal(updated.id, created.id); assert.equal(updated.status, 'draft')
  const published = (await publishBlog({ operation: 'update', slug: updated.slug, status: 'published' }, db, { now })).post
  const originalDate = published.published_at; assert.equal(originalDate, now().toISOString())
  const edited = (await publishBlog({ operation: 'update', id: created.id, title: 'A clearer title' }, db, { now: () => new Date('2026-10-08T12:00:00Z') })).post
  assert.equal(edited.status, 'published'); assert.equal(edited.published_at, originalDate)
  assert.equal(edited.slug, created.slug); assert.equal(edited.content, updated.content); assert.equal(db.rows.size, 1)
  const unpublished = (await publishBlog({ operation: 'update', id: created.id, status: 'draft' }, db)).post
  assert.equal(unpublished.published_at, originalDate)
  assert.equal((await publishBlog({ operation: 'update', id: created.id, status: 'published' }, db)).post.published_at, originalDate)
})
test('duplicate slug requires explicit update and never uploads an unused image', async () => {
  const db = repository(); await publishBlog(article, db); let uploads = 0
  await rejects(publishBlog({ ...article, featured_image: undefined }, db, { image: { async upload() { uploads++; return {url:'https://example.com/x.png',publicId:'x'} }, async remove() {} } }), 'slug_exists')
  assert.equal(uploads, 0); assert.equal(db.rows.size, 1)
})
test('publication validates fields before any image or database write', async () => {
  const db = repository()
  await rejects(publishBlog({ title: 'Incomplete', status: 'published' }, db), 'validation_failed')
  await rejects(publishBlog({ ...article, status: 'published', featured_image_alt: '' }, db), 'validation_failed')
  await rejects(publishBlog({ ...article, category: 'Invented Category' }, db), 'validation_failed')
  assert.equal(db.writes, 0)
})
test('image upload is integrated and compensates after a concurrent database conflict', async () => {
  const db = repository(); let removed
  const image = { async upload() { return { url: 'https://res.cloudinary.com/example/image/upload/real.png', publicId: 'purplesofthub/blog/real' } }, async remove(id) { removed = id } }
  const saved = (await publishBlog({ ...article, featured_image: undefined, status: 'published' }, db, { image })).post
  assert.equal(saved.featured_image, 'https://res.cloudinary.com/example/image/upload/real.png')
  db.update = async () => null
  await rejects(publishBlog({ operation: 'update', id: saved.id, featured_image_alt: 'A second illustration' }, db, { image }), 'post_changed')
  assert.equal(removed, 'purplesofthub/blog/real'); assert.equal(db.rows.get(saved.id).featured_image, saved.featured_image)
})
test('a stale update and published slug changes are rejected', async () => {
  const db = repository(); const post = (await publishBlog({ ...article, status: 'published' }, db)).post
  await rejects(publishBlog({ operation: 'update', id: post.id, expected_updated_at: '2000-01-01T00:00:00Z', title: 'Stale' }, db), 'post_changed')
  await rejects(publishBlog({ operation: 'update', id: post.id, slug: 'broken-link' }, db), 'validation_failed')
})
test('slug normalization is bounded and rejects unsafe or non-Latin-only automatic slugs', async () => {
  assert.equal(blogSlug('  Café & News / 2026!  '), 'cafe-news-2026')
  assert.ok(blogSlug('long '.repeat(100)).length <= 100); assert.ok(!blogSlug('long '.repeat(100)).endsWith('-'))
  const db = repository(); await rejects(publishBlog({ ...article, slug: '../evil' }, db), 'validation_failed')
  await rejects(publishBlog({ title: '中文' }, db), 'validation_failed')
})
test('explicit authors and source URLs are supported without author/category creation', async () => {
  const db = repository(); const post = (await publishBlog({ ...article, author: 'Ada Lovelace', source_urls: ['https://example.com/source', 'https://example.com/source'] }, db)).post
  assert.equal(post.author_name, 'Ada Lovelace'); assert.equal(post.author_type, 'Person'); assert.deepEqual(post.source_urls, ['https://example.com/source'])
  await rejects(publishBlog({ ...article, title: 'Unsafe source', source_urls: ['javascript:alert(1)'] }, db), 'validation_failed')
  await rejects(publishBlog({ ...article, title: 'Unsafe image', featured_image: 'http://example.com/image.png' }, db), 'validation_failed')
})
test('caller-owned timestamps and privileged fields cannot enter the payload', async () => {
  for (const [field, value] of Object.entries({ author_id: randomUUID(), published_at: '2000-01-01', created_at: '2000-01-01', role: 'admin', canonical: 'https://example.com' }))
    await rejects(publishBlog({ ...article, [field]: value }, repository()), 'validation_failed')
  await rejects(publishBlog({ ...article, content_format: 'html' }, repository()), 'validation_failed')
  await rejects(publishBlog({ ...article, id: randomUUID() }, repository()), 'validation_failed')
})
test('SEO descriptions clip at a word boundary without exposing Markdown syntax', () => {
  assert.equal(excerptDescription('**A clear** [source](https://example.com)'), 'A clear source')
  const description = excerptDescription('A useful description '.repeat(40)); assert.ok(description.length <= 160); assert.ok(description.endsWith('…'))
})
test('Markdown keeps headings, lists, emphasis, paragraphs, code and sources', () => {
  const html = renderBlogMarkdown('## Heading\n\nParagraph **bold** and _emphasis_.\n\n### Subheading\n\n- One\n- Two\n\n1. First\n2. Second\n\n[Source](https://example.com)\n\n```js\nconst x = "<safe>"\n```')
  for (const fragment of ['<h2', '<h3', '<p', '<ul', '<ol', '<li', '<strong>', '<em>', '<pre', 'href="https://example.com/"']) assert.ok(html.includes(fragment), fragment)
})
test('unsafe HTML and URL protocols cannot execute in rendered content', () => {
  for (const markdown of ['<script>alert(1)</script>', '<img src=x onerror=alert(1)>', '[evil](javascript:alert(1))', '[evil](data:text/html,evil)', '[evil](vbscript:evil)', '![x](javascript:evil)']) {
    const html = renderBlogMarkdown(markdown)
    assert.ok(!/<script|<img[^>]*onerror|href="(?:javascript|data|vbscript):|src="javascript:/i.test(html), html)
  }
})
test('JSON-LD uses real values and escapes script terminators', () => {
  const json = blogPosting({ ...article, slug: 'article', title: '</script><script>evil</script>', author_name: 'PurpleSoftHub', published_at: '2026-10-07T12:00:00Z' })
  assert.deepEqual(json.author, { '@type': 'Organization', name: 'PurpleSoftHub' })
  assert.equal(json.mainEntityOfPage['@id'], 'https://www.purplesofthub.com/blog/article')
  const serialized = serializeBlogPosting(json); assert.ok(!serialized.includes('</script>')); assert.deepEqual(JSON.parse(serialized), JSON.parse(JSON.stringify(json)))
  assert.equal(blogPosting({ title: 'No known date', slug: 'article' }).datePublished, undefined)
})
test('cookie changes need same origin; Bearer authorization is verified and never falls back', async () => {
  let sessions = 0; let tokens = 0
  const deps = { async sessionAdmin() { sessions++; return { ok: true, userId: 'admin' } }, async verifyAdminToken() { tokens++; return { ok: false, status: 401, error: 'Expired' } } }
  const endpoint = 'https://www.purplesofthub.com/api/admin/blog/publish'
  assert.equal((await authorizeBlogRequest(new Request(endpoint, { method: 'POST' }), deps)).status, 403)
  assert.equal((await authorizeBlogRequest(new Request(endpoint, { method: 'POST', headers: {Origin:'https://evil.example'} }), deps)).status, 403)
  assert.equal((await authorizeBlogRequest(new Request(endpoint, { method: 'POST', headers: {Origin:'https://www.purplesofthub.com'} }), deps)).ok, true)
  assert.equal((await authorizeBlogRequest(new Request(endpoint, { method: 'POST', headers: {Authorization:'Bearer expired'} }), deps)).status, 401)
  assert.equal((await authorizeBlogRequest(new Request(endpoint, { method: 'POST', headers: {Authorization:'Bearer'} }), deps)).status, 401)
  assert.equal(sessions, 1); assert.equal(tokens, 1)
})

test('enum fields reject arrays and objects rather than coercing them to strings', async () => {
  for (const field of ['operation', 'status', 'author_type']) {
    const value = { operation: ['update'], status: ['published'], author_type: ['Organization'] }[field]
    await rejects(publishBlog({ ...article, [field]: value }, repository()), 'validation_failed')
  }
})

test('same-origin cookies use the actual Host when Next normalizes its internal URL', async () => {
  const deps = { async sessionAdmin() { return {ok:true,userId:'admin'} }, async verifyAdminToken() { return {ok:false,status:401,error:'Invalid'} } }
  const response = await authorizeBlogRequest(new Request('http://localhost:3031/api/admin/blog/publish',{method:'POST',headers:{Host:'127.0.0.1:3031',Origin:'http://127.0.0.1:3031'}}),deps)
  assert.equal(response.ok,true)
  const denied = await authorizeBlogRequest(new Request('http://localhost:3031/api/admin/blog/publish',{method:'POST',headers:{Host:'127.0.0.1:3031',Origin:'http://untrusted.example'}}),deps)
  assert.equal(denied.status,403)
})
