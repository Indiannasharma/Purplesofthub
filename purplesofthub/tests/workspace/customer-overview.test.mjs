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

const model = loadSource('lib/customer-overview.ts')
const { CustomerOverview } = loadSource('components/workspace/customer-overview.tsx')
const { readCustomerOverview } = loadSource('lib/customer-overview.server.ts')
const { customerNavigationGroups, customerNavigation, customerAdvertisingLinks } = loadSource('lib/customer-navigation.ts')
const empty = () => ({ firstName: 'Ada', projects: { state: 'ready', rows: [] }, invoices: { state: 'ready', rows: [] }, music: { state: 'ready', rows: [] } })
const render = data => renderToStaticMarkup(React.createElement(CustomerOverview, { data }))

test('query failure, missing schema, forbidden access, null response and actual empty are distinct', () => {
  assert.deepEqual(model.overviewSection({ data: [], error: null }), { state: 'ready', rows: [] })
  assert.equal(model.overviewSection({ data: [], error: { code: 'NETWORK' } }).state, 'failed')
  for (const code of ['42P01', '42703', 'PGRST204', 'PGRST205']) assert.equal(model.overviewSection({ data: null, error: { code } }).state, 'unavailable')
  assert.equal(model.overviewSection({ data: null, error: { code: '42501' } }).state, 'unauthorized')
  assert.equal(model.overviewSection({ data: null, error: null }).state, 'unavailable')
})
test('greeting prefers real profile names, rejects email names and needs no time-of-day guess', () => {
  assert.equal(model.overviewFirstName('  Ada Lovelace ', 'Grace'), 'Ada')
  assert.equal(model.overviewFirstName(null, 'Grace Hopper'), 'Grace')
  assert.equal(model.overviewFirstName('private@example.com', null), 'there')
  assert.equal(model.overviewFirstName(123, ' '), 'there')
})
test('native currencies, zero and unavailable amounts retain their meaning', () => {
  assert.equal(model.invoiceAmount(0, 'NGN'), 'NGN 0.00')
  assert.equal(model.invoiceAmount('1250.50', 'USD'), 'USD 1,250.50')
  assert.equal(model.invoiceAmount(null, 'NGN'), 'Amount unavailable')
  assert.equal(model.invoiceAmount('not a number', 'NGN'), 'Amount unavailable')
  assert.equal(model.invoiceAmount(25, null), 'Currency unavailable')
  assert.equal(model.invoiceAmount(25, 'invalid'), 'Currency unavailable')
})
test('missing progress is not zero and invalid progress is never clamped into a fabricated value', () => {
  assert.equal(model.projectProgress(0), 0)
  for (const value of [null, -1, 101, NaN]) assert.equal(model.projectProgress(value), null)
  assert.equal(model.overviewDate('bad date'), 'Date unavailable')
  assert.equal(model.overviewDate('2026-10-01'), 'Oct 1, 2026')
})
test('next action comes from recent recorded statuses and never implies payment or project detail routes', () => {
  const data = empty()
  assert.equal(model.nextOverviewAction(data).href, '/dashboard/services')
  data.projects.rows.push({ title: 'Real project', status: 'in_progress' })
  assert.equal(model.nextOverviewAction(data).href, '/dashboard/projects')
  data.invoices.rows.push({ invoice_number: 'INV-REAL', status: 'sent' })
  const action = model.nextOverviewAction(data)
  assert.equal(action.href, '/dashboard/invoices')
  assert.match(action.description, /INV-REAL is marked sent/)
  data.invoices.state = 'failed'
  assert.equal(model.nextOverviewAction(data).href, '/dashboard/projects')
})
test('new-customer Overview offers real destinations without fake metrics or LMS', () => {
  const html = render(empty())
  for (const route of ['/dashboard/projects', '/dashboard/invoices', '/dashboard/music', '/dashboard/files', '/dashboard/services', '/academy']) assert.ok(html.includes('href="' + route + '"'), route)
  assert.match(html, /No invoices yet/)
  assert.match(html, /waitlist/)
  assert.doesNotMatch(html, /Total Spent|My Courses|Certificates|Marketplace|Creator Hub|Pay now/)
})
test('a failed domain stays visibly failed while successful domains retain actual records', () => {
  const data = empty()
  data.projects = { state: 'failed', rows: [] }
  data.music = { state: 'unauthorized', rows: [] }
  data.invoices.rows.push({ id: 'one', invoice_number: 'REAL-INV', amount: 0, currency: 'GBP', status: 'paid', due_date: null, created_at: null })
  const html = render(data)
  assert.match(html, /Could not load this information/)
  assert.match(html, /Access unavailable/)
  assert.match(html, /REAL-INV/)
  assert.match(html, /GBP.*0.00/)
  assert.doesNotMatch(html, /No invoices yet|Your next project starts here/)
})
test('recent mapping preserves project progress, invoice currencies and actual music fields without totals or invented events', () => {
  const data = empty()
  data.projects.rows.push({ id: 'p', title: 'Recorded project', service_type: 'web_development', status: 'in_progress', progress: 0, created_at: '2026-09-01' })
  data.invoices.rows.push({ id: 'i', invoice_number: 'INV-42', amount: 123, currency: 'CAD', status: 'sent', due_date: null, created_at: '2026-09-02' })
  data.music.rows.push({ id: 'm', track_title: 'Recorded track', artist_name: 'Recorded artist', plan_name: 'Recorded plan', status: 'pending', created_at: '2026-09-03' })
  const html = render(data)
  for (const value of ['Recorded project', 'INV-42', 'CAD', 'Recorded track', 'Recorded artist', 'Recorded plan']) assert.ok(html.includes(value))
  assert.match(html, /aria-valuenow="0"/)
  assert.match(html, /most recently/)
  assert.ok(!html.includes('/dashboard/projects/p'))
  assert.doesNotMatch(html, /Recent Activity|Total Spent|Pay now/)
})
test('shell groups contain each operational destination once, with honest Academy and manual Meta guide', () => {
  const ids = customerNavigationGroups.flatMap(group => group.ids)
  assert.equal(new Set(ids).size, ids.length)
  for (const id of ids) assert.ok(customerNavigation.find(item => item.id === id))
  for (const item of [...customerNavigation, ...customerAdvertisingLinks]) {
    if (item.href.startsWith('/')) assert.ok(existsSync(path.join(root, 'app', item.href, 'page.tsx')))
  }
  assert.equal(customerNavigation.find(item => item.id === 'academy').href, '/academy')
  assert.equal(customerAdvertisingLinks[0].href, '/dashboard/connect-meta')
})
function fakeClient({ fail = '', throwProfile = false } = {}) {
  const calls = []
  return { calls, from(table) {
    const call = { table }; calls.push(call)
    const query = {
      select(fields) { call.fields = fields; return query },
      eq(field, value) { call.filter = [field, value]; return query },
      order(field, options) { call.order = [field, options]; return query },
      limit(value) { call.limit = value; return query },
      async maybeSingle() { if (throwProfile) throw new Error('offline'); return { data: { full_name: 'Actual Profile' }, error: null } },
      then(resolve, reject) { return Promise.resolve(table === fail ? { data: null, error: { code: 'NETWORK' } } : { data: [{ id: table + '-owned' }], error: null }).then(resolve, reject) },
    }
    return query
  } }
}
test('server reads all domains with the current user filter, explicit columns and bounded limits', async () => {
  const client = fakeClient()
  const data = await readCustomerOverview(client, 'customer-a')
  assert.equal(data.profileName, 'Actual Profile')
  assert.equal(client.calls.length, 4)
  for (const call of client.calls) {
    assert.deepEqual(call.filter, [call.table === 'profiles' ? 'id' : 'client_id', 'customer-a'])
    assert.ok(!call.fields.includes('*'))
    if (call.table !== 'profiles') {
      assert.equal(call.limit, call.table === 'music_campaigns' ? 3 : 5)
      assert.deepEqual(call.order, ['created_at', { ascending: false }])
    }
  }
})
test('one failed read and a rejected profile read cannot erase successful domain reads', async () => {
  const data = await readCustomerOverview(fakeClient({ fail: 'projects', throwProfile: true }), 'customer-b')
  assert.equal(data.profileName, null)
  assert.equal(data.projects.state, 'failed')
  assert.equal(data.invoices.state, 'ready')
  assert.equal(data.music.state, 'ready')
})
