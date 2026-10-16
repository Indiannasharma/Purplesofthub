import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const require = createRequire(import.meta.url)
function loader(overrides = {}) {
  const loaded = new Map()
  function load(file) {
    if (loaded.has(file)) return loaded.get(file).exports
    const loadedModule = { exports: {} }
    loaded.set(file, loadedModule)
    const code = ts.transpileModule(readFileSync(path.join(root, file), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText
    new Function('require', 'module', 'exports', code)(name => {
      if (Object.hasOwn(overrides, name)) return overrides[name]
      if (name.endsWith('.css')) return { __esModule: true, default: {} }
      if (name === 'server-only') return {}
      if (name.startsWith('@/') || name.startsWith('./') || name.startsWith('../')) {
        const base = name.startsWith('@/') ? name.slice(2) : path.join(path.dirname(file), name)
        return load(base + (existsSync(path.join(root, base + '.ts')) ? '.ts' : '.tsx'))
      }
      return require(name)
    }, loadedModule, loadedModule.exports)
    return loadedModule.exports
  }
  return load
}
const validation = loader()('lib/portfolio-validation.ts')
const id = '12345678-1234-4234-8234-123456789abc'

test('normalizer and authored content preserve final_solution from actual admin payload', () => {
  const { normalizeProject, authoredContentMap } = loader()('lib/portfolio-normalize.ts')
  const raw = { title: 'Authored', slug: 'authored', status: 'published', final_solution: 'Actual saved story', cover_image: 'https://res.cloudinary.com/example/image.png', videos: { youtube: 'https://youtu.be/abcdefghijk' } }
  const project = normalizeProject(raw)
  assert.equal(project.finalSolution, raw.final_solution)
  assert.equal(authoredContentMap(raw).solution, true)
  assert.equal(project.coverImage, raw.cover_image)
  assert.deepEqual(project.videos, raw.videos)
})
test('pagination and filter-syntax validation bound anonymous queries', () => {
  assert.deepEqual(validation.portfolioPageRange(new URLSearchParams()), { limit: 50, offset: 0 })
  for (const query of ['limit=0', 'limit=-1', 'limit=101', 'limit=abc', 'offset=-1', 'offset=100001', 'limit=1.5']) assert.equal(validation.portfolioPageRange(new URLSearchParams(query)), null)
  assert.doesNotMatch(validation.portfolioSearch('brand),status.eq.draft,%_"'), /[(),.%_"\\]/)
})
test('project validation rejects invalid statuses, IDs and unsafe media URLs', () => {
  for (const value of [null, [], {}, { title: '   ' }, { title: 'X', status: 'private' }, { title: 'X', featured: 'true' }, { title: 'X', cover_image: 'javascript:alert(1)' }, { title: 'X', cover_image: 'data:image/svg+xml,foo' }, { title: 'X', cover_image: 'https://user:password@example.com/a' }]) assert.ok(validation.portfolioInputError(value))
  assert.equal(validation.portfolioInputError({ id, status: 'archived' }, true), null)
  assert.equal(validation.portfolioInputError({ title: 'X', cover_image: '/images/project.png' }), null)
  assert.equal(validation.portfolioInputError({ title: 'X', cover_image: 'https://res.cloudinary.com/test/image.png' }), null)
  assert.ok(validation.portfolioInputError({title:'X',videos:{preview:'https://youtu.be/M7lc1UVf-VE'}}))
  assert.equal(validation.portfolioInputError({title:'X',videos:{preview:'https://res.cloudinary.com/approved/video/upload/v123/preview.mp4'}}),null)
})

function fixture(initial = [], behavior = {}) {
  const rows = initial.map(row => ({ ...row })), calls = []
  return { rows, calls, from(table) {
    assert.equal(table, 'portfolio_projects')
    let filters = [], operation = 'read', values, first = 0, last = Infinity
    const q = {
      select() { return this }, order() { return this }, or() { return this },
      eq(key, value) { filters.push(row => row[key] === value); return this },
      range(a, b) { first = a; last = b; return this },
      insert(payload) { operation = 'insert'; values = payload; return this },
      update(payload) { operation = 'update'; values = payload; return this },
      single() { return run(true) }, maybeSingle() { return run(true) },
      then(resolve, reject) { return run(false).then(resolve, reject) },
    }
    async function run(single) {
      calls.push({ operation, values })
      if (behavior.error) return { data: null, error: behavior.error, count: null }
      let selected = rows.filter(row => filters.every(filter => filter(row)))
      if (operation === 'insert') { const row = { id, ...values }; rows.push(row); selected = [row] }
      if (operation === 'update') selected.forEach(row => Object.assign(row, values))
      return { data: single ? selected[0] ?? null : selected.slice(first, last + 1), count: selected.length, error: null }
    }
    return q
  } }
}
function route(db, status = 200) {
  return loader({
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    '@/lib/auth': { requireAdmin: async () => status === 200 ? { ok: true, userId: id } : { ok: false, response: Response.json({ error: 'Denied' }, { status }) } },
    '@/lib/supabase/server': { createClient: async () => db },
  })('app/api/portfolio/route.ts')
}
const request = (method = 'GET', body, query = '') => new Request('http://localhost/api/portfolio' + query, { method, ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) })

test('public API returns valid empty results and filters drafts, archives and featured cards', async () => {
  assert.deepEqual(await (await route(fixture()).GET(request())).json(), { data: [], count: 0 })
  const api = route(fixture([{ id, slug: 'real', status: 'published', featured: true }, { slug: 'other', status: 'published', featured: false }, { slug: 'draft', status: 'draft', featured: true }, { slug: 'archive', status: 'archived', featured: true }]))
  const result = await (await api.GET(request('GET', undefined, '?featured=true'))).json()
  assert.deepEqual(result.data.map(row => row.slug), ['real'])
  assert.equal((await api.GET(request('GET', undefined, '?offset=-1'))).status, 400)
})
test('unauthenticated and non-admin writes return before database access', async () => {
  for (const status of [401, 403]) {
    const db = fixture(), api = route(db, status)
    for (const method of ['POST', 'PUT', 'DELETE']) assert.equal((await api[method](request(method, { title: 'Denied' }, '?id=' + id))).status, status)
    assert.equal(db.calls.length, 0)
  }
})
test('admin create/edit/publish/unpublish/archive preserve slug on status-only updates (in-memory only)', async () => {
  const db = fixture(), api = route(db)
  assert.equal((await api.POST(request('POST', { title: 'In-memory only', final_solution: 'Story', videos: {} }))).status, 201)
  assert.equal(db.rows[0].status, 'draft')
  assert.equal(db.rows[0].final_solution, 'Story')
  for (const status of ['published', 'draft']) {
    assert.equal((await api.PUT(request('PUT', { id, status }))).status, 200)
    assert.equal(db.rows[0].status, status)
    assert.equal(db.rows[0].slug, 'in-memory-only')
  }
  assert.equal((await api.DELETE(request('DELETE', undefined, '?id=' + id))).status, 200)
  assert.equal(db.rows[0].status, 'archived')
})
test('invalid admin input, missing rows, duplicate slugs and database errors have safe responses', async () => {
  assert.equal((await route(fixture()).POST(request('POST', { title: 'X', status: 'invalid' }))).status, 400)
  assert.equal((await route(fixture()).PUT(request('PUT', { id, status: 'draft' }))).status, 404)
  assert.equal((await route(fixture()).DELETE(request('DELETE', undefined, '?id=' + id))).status, 404)
  const failure = route(fixture([], { error: { code: '23505', message: 'private database detail' } }))
  const duplicate = await failure.POST(request('POST', { title: 'Duplicate' }))
  assert.equal(duplicate.status, 409)
  assert.equal(JSON.stringify(await duplicate.json()).includes('private database detail'), false)
  assert.equal((await failure.GET(request())).status, 500)
})

function catalog({ published = [], replaced = [], fail = false } = {}) {
  const reads = []
  const seeds = [{ title: 'Bundled', slug: 'bundled', status: 'published' }, { title: 'Draft seed', slug: 'draft-seed', status: 'draft' }]
  const client = { from(table) {
    assert.equal(table, 'portfolio_projects')
    return { select(columns) { reads.push(columns); return this }, in(_key, slugs) { assert.deepEqual(slugs, ['bundled']); return this }, limit() { return this }, abortSignal() { return Promise.resolve({ data: replaced.map(slug => ({ slug })), error: fail ? { message: 'unavailable' } : null }) } }
  } }
  const api = loader({ react: { cache: fn => fn }, '@supabase/supabase-js': { createClient: () => client }, '@/lib/portfolio.server': { getPublishedProjects: async () => published }, '@/app/portfolio/_data/portfolio': { PORTFOLIO_PROJECTS: seeds } })('lib/portfolio-public.server.ts')
  return { api, reads }
}
test('public catalog prefers normalized published records over static fallback', async () => {
  const { api, reads } = catalog({ published: [{ title: 'Database', slug: 'database', status: 'published', final_solution: 'Saved' }, { title: 'Private', slug: 'private', status: 'draft' }] })
  const rows = await api.publicPortfolioCatalog()
  assert.deepEqual(rows.map(row => row.slug), ['database'])
  assert.equal(rows[0].finalSolution, 'Saved')
  assert.equal(reads.length, 0)
})
test('empty database retains approved static content; existing private replacement never resurfaces', async () => {
  const names = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'], saved = names.map(name => [name, process.env[name]])
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-placeholder'
    const empty = catalog()
    assert.deepEqual((await empty.api.publicPortfolioCatalog()).map(row => row.slug), ['bundled'])
    assert.deepEqual(empty.reads, ['slug'])
    assert.deepEqual(await catalog({ replaced: ['bundled'] }).api.allowedPortfolioFallback(), [])
    assert.deepEqual(await catalog({ fail: true }).api.allowedPortfolioFallback(), [])
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    assert.deepEqual(await catalog().api.allowedPortfolioFallback(), [])
  } finally { for (const [name, value] of saved) { if (value === undefined) delete process.env[name]; else process.env[name] = value } }
})

test('homepage renders only published cards; empty selection renders safely', () => {
  const Home = loader({ 'next/link': ({ children, href, ...props }) => React.createElement('a', { href, ...props }, children) })('components/HomePortfolio.tsx').default
  const html = renderToStaticMarkup(React.createElement(Home, { projects: [{ title: 'Public title', slug: 'public', status: 'published', featured: true }, { title: 'Private title', slug: 'private', status: 'draft' }] }))
  assert.match(html, /Public title/)
  assert.doesNotMatch(html, /Private title/)
  assert.equal(renderToStaticMarkup(React.createElement(Home, { projects: [] })), '')
})
test('admin create/edit forms render draft/published/archived choices and preserve saved values', () => {
  const Form = loader({
    'next/navigation': { useRouter: () => ({ push() {}, refresh() {} }) },
    'next/link': ({ children, href }) => React.createElement('a', { href }, children),
    '@/components/admin/AdminPage': { AdminPage: ({ children }) => React.createElement('div', {}, children) },
  })('app/admin/portfolio/_components/ProjectForm.tsx').default
  const fresh = renderToStaticMarkup(React.createElement(Form))
  assert.match(fresh, /value="draft" selected/)
  assert.match(fresh, /value="archived"/)
  const edit = renderToStaticMarkup(React.createElement(Form, { projectId: id, initial: { title: 'Saved project', body: 'Saved story', status: 'archived', category: 'Custom category' } }))
  assert.match(edit, /Saved story/)
  assert.match(edit, /value="archived" selected/)
  assert.match(edit, /Custom category/)
})
