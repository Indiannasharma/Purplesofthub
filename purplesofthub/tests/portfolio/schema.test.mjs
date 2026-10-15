import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { test } from 'node:test'

const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const sql = read('supabase/migrations/20261015000000_restore_portfolio.sql')

test('setup copy matches the canonical migration', () => {
  assert.equal(read('SUPABASE_PORTFOLIO_SETUP.sql'), sql)
})
test('projects precede testimonials and client foreign key waits for both tables', () => {
  assert.ok(sql.indexOf('CREATE TABLE IF NOT EXISTS public.portfolio_projects') < sql.indexOf('CREATE TABLE IF NOT EXISTS public.portfolio_testimonials'))
  assert.ok(sql.indexOf('CREATE TABLE IF NOT EXISTS public.portfolio_clients') < sql.indexOf('ADD CONSTRAINT portfolio_projects_client_id_fkey'))
})
test('current admin payload columns exist, including final_solution and videos', () => {
  const form = read('app/admin/portfolio/_components/ProjectForm.tsx')
  const payload = form.slice(form.indexOf('const payload:'), form.indexOf('if (projectId) payload.id'))
  const columns = [...payload.matchAll(/^\s{6}(\w+):/gm)].map(match => match[1])
  assert.ok(columns.includes('final_solution') && columns.includes('videos'))
  for (const column of columns) assert.match(sql, new RegExp(`\\n  ${column} (?:TEXT|BOOLEAN|JSONB)`))
})
test('migration is transactional, refuses unknown existing objects, and contains no data writes', () => {
  assert.match(sql, /BEGIN;[\s\S]*COMMIT;/)
  assert.match(sql, /obj_description[\s\S]*RAISE EXCEPTION/)
  const executable = sql.replace(/--[^\n]*/g, '')
  assert.doesNotMatch(executable, /\b(?:DROP|TRUNCATE)\s|\bINSERT\s+INTO\b|\bUPDATE\s+public\.|\bDELETE\s+FROM\b/i)
})
test('each table enables RLS and grants no anonymous writes', () => {
  const tables = [...sql.matchAll(/CREATE TABLE IF NOT EXISTS public\.(\w+)/g)].map(match => match[1])
  assert.equal(tables.length, 7)
  for (const table of tables) {
    assert.ok(sql.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`))
    assert.ok(sql.includes(`REVOKE ALL ON public.${table} FROM PUBLIC, anon, authenticated`))
    assert.ok(sql.includes(`CREATE POLICY portfolio_admin_manage ON public.${table}`))
  }
  assert.doesNotMatch(sql, /GRANT (?:ALL|INSERT|UPDATE|DELETE)[^;]+TO anon/i)
  assert.doesNotMatch(sql, /GRANT SELECT ON public\.media_library TO anon/)
})
test('public project and testimonial policies require published parent content', () => {
  assert.match(sql, /ON public\.portfolio_projects FOR SELECT TO anon, authenticated USING \(status = 'published'\)/)
  assert.match(sql, /ON public\.portfolio_testimonials FOR SELECT TO anon, authenticated USING \(EXISTS[\s\S]*p\.status = 'published'/)
  assert.match(sql, /USING \(\(SELECT public\.is_blog_admin\(\)\)\) WITH CHECK/)
})

test('reruns validate column types and keys, and restore known policy predicates', () => {
  assert.match(sql, /atttypid = to_regtype\(col.value\)/)
  assert.match(sql, /primary key drift/)
  assert.match(sql, /unique slug constraint missing/)
  assert.match(sql, /policy command\/type drift/)
  const tables = [...sql.matchAll(/CREATE TABLE IF NOT EXISTS public\.(\w+)/g)].map(match => match[1])
  for (const table of tables) {
    assert.ok(sql.includes(`ALTER POLICY portfolio_admin_manage ON public.${table} TO authenticated`))
    if (table !== 'media_library') assert.ok(sql.includes(`ALTER POLICY portfolio_public_read ON public.${table} TO anon, authenticated`))
  }
})
test('unrelated workspace projects and subscriber tables are not referenced by the migration', () => {
  assert.doesNotMatch(sql, /\bpublic\.(?:projects|newsletter_subscribers|blog_posts|profiles)\s+(?:ADD|ENABLE|DISABLE|IS)/i)
  assert.doesNotMatch(sql, /(?:ON|TABLE|REFERENCES)\s+public\.(?:projects|newsletter_subscribers)\b/i)
  assert.match(sql, /admin helper differs from verified admin-only definition/)
})
test('all timestamp-writing helpers have matching service columns and media FKs are indexed', () => {
  const services = sql.match(/CREATE TABLE IF NOT EXISTS public\.portfolio_services \(([\s\S]*?)\n\);/)[1]
  assert.match(services, /updated_at TIMESTAMPTZ/)
  assert.match(sql, /ON public\.media_library\(created_by\)/)
})
