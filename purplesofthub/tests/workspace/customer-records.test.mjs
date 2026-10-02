import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const packageRequire = createRequire(path.join(root, 'package.json'))
const cache = new Map()
// Compile the actual TSX modules in memory. Reuse installed React/Radix; no test UI doubles.
function loadSource(relative) {
  const filename = path.resolve(root, relative)
  if (cache.has(filename)) return cache.get(filename).exports
  const loaded = { exports: {} }
  cache.set(filename, loaded)
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText
  const localRequire = name => {
    if (name === 'server-only') return {};
    if (!name.startsWith('@/') && !name.startsWith('.')) return packageRequire(name)
    const target = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(filename), name)
    const resolved = [target, target + '.ts', target + '.tsx'].find(candidate => existsSync(candidate) && statSync(candidate).isFile())
    assert.ok(resolved, 'Local source import resolves: ' + name)
    return loadSource(path.relative(root, resolved))
  }
  new Function('require', 'module', 'exports', compiled)(localRequire, loaded, loaded.exports)
  return loaded.exports
}

const model = loadSource('lib/customer-records.ts')
const presentation = loadSource('lib/customer-overview.ts')
const { CustomerProjects } = loadSource('components/workspace/customer-projects.tsx')
const { default: InvoicesClient } = loadSource('app/dashboard/invoices/InvoicesClient.tsx')
const { CustomerRecordsLoading } = loadSource('components/workspace/customer-record-states.tsx')
const { readCustomerProjects, readCustomerInvoices } = loadSource('lib/customer-records.server.ts')
const project = (overrides = {}) => ({ id: 42, title: 'Recorded project', service_type: 'web_development', status: 'in_progress', progress: 0, description: 'Customer brief', due_date: null, created_at: '2026-10-01', project_updates: [], ...overrides })
const invoice = (overrides = {}) => ({ id: 42, amount: 125.50, currency: 'USD', status: 'sent', due_date: null, created_at: '2026-10-01', projects: { title: 'Recorded project' }, ...overrides })
const render = (component, section) => renderToStaticMarkup(React.createElement(component, { section }))
const ready = rows => ({ state: 'ready', rows })

test('Projects renders actual customer fields, progress zero and one hundred, and optional fields honestly', () => {
  const html = render(CustomerProjects, ready([project(), project({ id: 43, progress: 100 }), project({ id: 44, title: 'Missing', status: null, progress: null, service_type: null, created_at: null })]))
  for (const value of ['Recorded project', 'Customer brief', 'web development', 'Created', 'Oct 1, 2026', 'Status unavailable', 'Date unavailable', 'Service not specified']) assert.ok(html.includes(value), value)
  assert.match(html, /aria-valuenow="0"/)
  assert.match(html, /aria-valuenow="100"/)
  assert.equal((html.match(/role="progressbar"/g) || []).length, 2)
})
test('invalid progress is unavailable rather than invented or clamped', () => {
  const html = render(CustomerProjects, ready([project({ progress: 101 })]))
  assert.match(html, /Unavailable/)
  assert.doesNotMatch(html, /role="progressbar"|101%|100%/)
})
test('project filters use exact recorded statuses including unknowns without broad Active assumptions', () => {
  const rows = [project(), project({ id: 2, status: 'on_hold' }), project({ id: 3, status: 'completed' }), project({ id: 4, status: null }), project({ id: 5, status: 'all' })]
  assert.equal(model.filterProjects(rows, 'all').length, 5)
  assert.deepEqual(model.filterProjects(rows, 'status:on_hold').map(x => x.id), [2])
  assert.deepEqual(model.filterProjects(rows, 'missing').map(x => x.id), [4])
  assert.deepEqual(model.filterProjects(rows, 'status:all').map(x => x.id), [5])
  const html = render(CustomerProjects, ready(rows))
  assert.match(html, /<label[^>]*for="customer-project-status"/)
  assert.match(html, /select[^>]*id="customer-project-status"/)
  assert.match(html, /on hold/)
  assert.doesNotMatch(html, /Active Projects|type="search"/)
})
test('customer update preview selects the most recent dated nonempty message without mutating data', () => {
  const row = project({ project_updates: [{ id: 1, message: 'Older', created_at: '2026-01-01' }, { id: 2, message: 'Newest', created_at: '2026-09-01' }, { id: 3, message: 'Undated', created_at: 'invalid' }] })
  assert.equal(model.recentProjectUpdate(row).message, 'Newest')
  assert.equal(row.project_updates[0].message, 'Older')
  const html = render(CustomerProjects, ready([row]))
  assert.match(html, /Newest/)
  assert.doesNotMatch(html, /Older|Undated|Latest Update/)
})
test('Invoices presents native USD, NGN, GBP and CAD values without conversion or monetary totals', () => {
  const html = render(InvoicesClient, ready([invoice(), invoice({ id: 2, amount: 0, currency: 'NGN' }), invoice({ id: 3, currency: 'GBP' }), invoice({ id: 4, currency: 'CAD' })]))
  for (const value of ['USD', 'NGN', 'GBP', 'CAD', '0.00', '125.50', 'Recorded amount', 'Invoice reference', '#42', 'Issued']) assert.ok(html.includes(value), value)
  assert.doesNotMatch(html, /Custom|Total Paid|Total Outstanding|CurrencySwitcher|Stored in/)
})
test('amount stays authoritative for customer display even when a conflicting total is supplied', () => {
  const html = render(InvoicesClient, ready([invoice({ amount: 12.34, total: 99999 }), invoice({ id: 2, amount: null, total: 88888 })]))
  assert.match(html, /12.34/)
  assert.match(html, /Amount unavailable/)
  assert.doesNotMatch(html, /99,999|88,888|Invoice Total/)
  assert.equal(presentation.invoiceAmount('  ', 'USD'), 'Amount unavailable')
})
test('invoice missing currency, dates, project relationship and unknown status stay explicit', () => {
  const html = render(InvoicesClient, ready([invoice({ currency: null, status: 'custom_recorded_status', projects: null, created_at: 'bad', due_date: null })]))
  for (const value of ['Currency unavailable', 'Date unavailable', 'Not specified', 'Project not specified', 'custom recorded status']) assert.ok(html.includes(value), value)
  assert.doesNotMatch(html, /NGN|draft/)
})
test('both bodies distinguish actual empty accounts from failed, unavailable and unauthorized reads', () => {
  for (const component of [CustomerProjects, InvoicesClient]) {
    assert.match(render(component, ready([])), /No (projects|invoices) yet/)
    for (const [state, title] of [['failed', 'Could not load your records'], ['unavailable', 'These records are unavailable'], ['unauthorized', 'Access unavailable']]) {
      const html = render(component, { state, rows: [] })
      assert.ok(html.includes(title))
      assert.doesNotMatch(html, /No projects yet|No invoices yet|0 loaded|0 projects|0 invoices/)
    }
  }
})
test('loading uses shared aria-busy state and accessible heading', () => {
  const html = renderToStaticMarkup(React.createElement(CustomerRecordsLoading, { title: 'Invoices' }))
  assert.match(html, /aria-busy="true"/)
  assert.match(html, /<h1[^>]*>Invoices/)
})
test('record cards contain no missing detail, download or payment actions', () => {
  for (const [component, rows] of [[CustomerProjects, [project()]], [InvoicesClient, [invoice()]]]) {
    const html = render(component, ready(rows))
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1])
    assert.ok(hrefs.every(href => ['/dashboard', '/dashboard/services', 'https://wa.me/qr/L36LMHQ4RLP2B1'].includes(href)))
    assert.doesNotMatch(html, /View Invoice|View Project|Pay now|Download/)
  }
})
function fakeClient(result = { data: [], error: null }, throws = false) {
  const calls = []
  return { calls, from(table) {
    const call = { table, filters: [] }; calls.push(call)
    const query = { select(fields) { call.fields = fields; return query }, eq(key, value) { call.filters.push([key, value]); return query }, order(key, options) { call.order = [key, options]; return query }, then(resolve, reject) { return (throws ? Promise.reject(new Error('offline')) : Promise.resolve(result)).then(resolve, reject) } }
    return query
  } }
}
test('record reads retain customer ownership and explicit safe columns without staff fields', async () => {
  const client = fakeClient()
  await readCustomerProjects(client, 'customer-a')
  await readCustomerInvoices(client, 'customer-a')
  assert.equal(client.calls.length, 2)
  for (const call of client.calls) {
    assert.deepEqual(call.filters[0], ['client_id', 'customer-a'])
    assert.deepEqual(call.order, ['created_at', { ascending: false }])
    assert.doesNotMatch(call.fields, /\*|internal_notes|profiles|budget|tasks|subtotal|total/)
  }
  assert.deepEqual(client.calls[1].filters[1], ['projects.client_id', 'customer-a'])
  assert.match(client.calls[0].fields, /project_updates\(id, message, created_at\)/)
  assert.match(client.calls[1].fields, /projects\(title\)/)
  assert.ok(!client.calls[1].fields.includes('invoice_number'))
})
test('read errors and network exceptions never become successful empty records', async () => {
  for (const read of [readCustomerProjects, readCustomerInvoices]) {
    assert.equal((await read(fakeClient(), 'customer-a')).state, 'ready')
    assert.equal((await read(fakeClient({ data: null, error: { code: '42703' } }), 'customer-a')).state, 'unavailable')
    assert.equal((await read(fakeClient({ data: null, error: { code: '42501' } }), 'customer-a')).state, 'unauthorized')
    assert.equal((await read(fakeClient(undefined, true), 'customer-a')).state, 'failed')
  }
})

test("project relationship display supports PostgREST object and array shapes without guessing a title", () => {
  assert.equal(model.invoiceProjectTitle({ title: "Owned project" }), "Owned project")
  assert.equal(model.invoiceProjectTitle([{ title: "Owned project" }]), "Owned project")
  assert.equal(model.invoiceProjectTitle([]), "Project not specified")
  assert.equal(model.invoiceProjectTitle(null), "Project not specified")
  assert.match(render(InvoicesClient, ready([invoice({ projects: [{ title: "Owned project" }] })])), /Owned project/)
})
