/**
 * Static regression guards for the account-recovery security patch.
 *
 * The repository has no test framework and no test database, so these tests
 * assert the *source-level* invariants that would otherwise silently
 * re-introduce the vulnerability:
 *   - no public document URLs are generated anywhere in application code,
 *   - the public endpoint holds no administrator session and writes no
 *     internal fields,
 *   - every document access path is gated by requireAdmin(),
 *   - the migration and the legacy setup scripts keep the bucket private.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const read = relative => readFileSync(path.join(root, relative), 'utf8')

const SKIP_DIRS = new Set(['node_modules', 'node_modules_old', '.next', '.git', '.claude', '.vercel'])
const SOURCE_DIRS = ['app', 'lib', 'components']

function walk(relativeDir, files = []) {
  const absolute = path.join(root, relativeDir)

  for (const entry of readdirSync(absolute)) {
    if (SKIP_DIRS.has(entry)) continue
    const next = path.join(relativeDir, entry)
    if (statSync(path.join(root, next)).isDirectory()) walk(next, files)
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry)) files.push(next)
  }

  return files
}

const PUBLIC_ROUTE = read('app/api/account-recovery/route.ts')
const ADMIN_LIST_ROUTE = read('app/api/admin/recovery/requests/route.ts')
const ADMIN_PATCH_ROUTE = read('app/api/admin/recovery/requests/[id]/route.ts')
const SIGNED_URL_ROUTE = read(
  'app/api/admin/recovery/[id]/documents/[documentId]/signed-url/route.ts'
)
const ADMIN_PAGE = read('app/admin/recovery/page.tsx')
const CLIENT_PAGE = read('app/dashboard/recovery/page.tsx')
const RATE_LIMIT = read('lib/rateLimit.ts')
const MIGRATION = read(
  'supabase/migrations/20260924000000_privatize_account_recovery_documents.sql'
)
const LEGACY_MIGRATION_SCRIPT = read('scripts/supabase-account-recovery-migration.sql')
const LEGACY_TABLE_SCRIPT = read('scripts/supabase-account-recovery-table.sql')

/** The only file allowed to mention the public object URL shape (legacy parser). */
const LEGACY_URL_ALLOWLIST = ['lib' + path.sep + 'recovery' + path.sep + 'documents.ts']

test('application code never generates public document URLs', () => {
  const offenders = []

  for (const dir of SOURCE_DIRS) {
    for (const file of walk(dir)) {
      const source = readFileSync(path.join(root, file), 'utf8')
      if (source.includes('getPublicUrl')) offenders.push(`${file} (getPublicUrl)`)
      if (
        source.includes('/storage/v1/object/public/') &&
        !LEGACY_URL_ALLOWLIST.some(allowed => file.endsWith(allowed))
      ) {
        offenders.push(`${file} (public object URL)`)
      }
    }
  }

  assert.deepEqual(offenders, [])
})

test('the public endpoint holds no administrator session', () => {
  assert.equal(/createServerClient/.test(PUBLIC_ROUTE), false)
  assert.equal(/cookies\(/.test(PUBLIC_ROUTE), false)
  assert.equal(/getUser\(/.test(PUBLIC_ROUTE), false)
  assert.equal(/requireAdmin/.test(PUBLIC_ROUTE), false)
  assert.match(PUBLIC_ROUTE, /created_by_admin_id: null/)
})

test('the public endpoint cannot write or read internal fields', () => {
  assert.equal(/admin_notes\s*:/.test(PUBLIC_ROUTE), false)
  assert.equal(/adminNotes/.test(PUBLIC_ROUTE), false)
  assert.equal(/publicUrl/.test(PUBLIC_ROUTE), false)
  assert.match(PUBLIC_ROUTE, /parseRecoverySubmission\(formData, \{ mode: 'public' \}\)/)
})

test('the public endpoint validates, rate limits, captcha-checks and uploads privately', () => {
  assert.match(PUBLIC_ROUTE, /verifyCaptcha\(/)
  assert.match(PUBLIC_ROUTE, /checkRateLimit\(/)
  assert.match(PUBLIC_ROUTE, /deriveRecoveryRateLimitKey\(/)
  assert.match(PUBLIC_ROUTE, /validateRecoveryDocument\(/)
  assert.match(PUBLIC_ROUTE, /newRecoveryDocumentPath\(/)
  assert.match(PUBLIC_ROUTE, /RECOVERY_DOCUMENTS_BUCKET/)
  assert.match(PUBLIC_ROUTE, /removeRecoveryObjects\(/)
  assert.match(PUBLIC_ROUTE, /NextResponse\.json\(\{ success: true \}/)
  assert.match(PUBLIC_ROUTE, /'Cache-Control': 'no-store'/)
})

test('the recovery rate limiter exists and is keyed by a hashed identifier', () => {
  assert.match(RATE_LIMIT, /rateLimiters\.recovery = new Ratelimit/)
  assert.match(RATE_LIMIT, /prefix: 'rl:recovery'/)
})

test('every admin recovery route authorises before using the service role', () => {
  for (const [name, source] of [
    ['requests/route.ts', ADMIN_LIST_ROUTE],
    ['requests/[id]/route.ts', ADMIN_PATCH_ROUTE],
    ['signed-url/route.ts', SIGNED_URL_ROUTE],
  ]) {
    const guard = source.indexOf('requireAdmin()')
    const privileged = source.indexOf('createServiceRoleClient()')

    assert.notEqual(guard, -1, `${name} must call requireAdmin()`)
    assert.notEqual(privileged, -1, `${name} must use the service-role client`)
    assert.ok(guard < privileged, `${name} must authorise before privileged access`)
    assert.equal(source.includes('getPublicUrl'), false, `${name} must not mint public URLs`)
  }
})

test('the signed-URL endpoint derives the object path server-side only', () => {
  assert.match(SIGNED_URL_ROUTE, /createSignedUrl\(/)
  assert.match(SIGNED_URL_ROUTE, /RECOVERY_SIGNED_URL_TTL_SECONDS/)
  assert.match(SIGNED_URL_ROUTE, /isRecoveryDocumentKey\(documentId\)/)
  assert.match(SIGNED_URL_ROUTE, /parseRecoveryDocumentReference\(/)
  assert.match(SIGNED_URL_ROUTE, /'Cache-Control': 'no-store'/)

  // No browser-supplied path, body or query parameter may reach storage.
  assert.equal(/searchParams/.test(SIGNED_URL_ROUTE), false)
  assert.equal(/request\.json\(/.test(SIGNED_URL_ROUTE), false)
  assert.equal(/request\.formData\(/.test(SIGNED_URL_ROUTE), false)
  assert.equal(/\.from\([^)]*documentId/.test(SIGNED_URL_ROUTE), false)
})

test('the admin workspace uses guarded endpoints and persists no signed URL', () => {
  assert.match(ADMIN_PAGE, /\/api\/admin\/recovery\/requests/)
  assert.match(ADMIN_PAGE, /signed-url/)
  assert.match(ADMIN_PAGE, /has_id_document/)
  assert.match(ADMIN_PAGE, /has_screenshot/)

  assert.equal(/getPublicUrl/.test(ADMIN_PAGE), false)
  assert.equal(/supabase\.storage/.test(ADMIN_PAGE), false)
  assert.equal(/createClient/.test(ADMIN_PAGE), false)
  assert.equal(/localStorage\./.test(ADMIN_PAGE), false)
  assert.equal(/id_document_url/.test(ADMIN_PAGE), false)
})

test('the client dashboard cannot read internal notes', () => {
  assert.equal(/admin_notes/.test(CLIENT_PAGE), false)
  assert.match(CLIENT_PAGE, /select\('id, platform, handle, support_type, status, amount_paid, created_at'\)/)
})

function stripSqlComments(source) {
  return source
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
}

const MIGRATION_SQL = stripSqlComments(MIGRATION)
const LEGACY_MIGRATION_SQL = stripSqlComments(LEGACY_MIGRATION_SCRIPT)
const LEGACY_TABLE_SQL = stripSqlComments(LEGACY_TABLE_SCRIPT)

test('the migration makes the bucket private and removes the public policies', () => {
  assert.match(MIGRATION, /UPDATE storage\.buckets\s*\nSET public = false/)
  assert.match(MIGRATION, /DROP POLICY IF EXISTS "Allow public reads" ON storage\.objects/)
  assert.match(MIGRATION, /DROP POLICY IF EXISTS "Allow public uploads" ON storage\.objects/)
  assert.match(MIGRATION, /DROP POLICY IF EXISTS "Allow anonymous inserts"/)
  assert.match(MIGRATION, /REVOKE ALL ON public\.account_recovery_requests FROM anon/)
  assert.match(MIGRATION, /CREATE POLICY "Users can read own recovery requests"/)
  assert.match(MIGRATION, /NOTIFY pgrst/)
  assert.equal(/SET public = true/.test(MIGRATION_SQL), false)
  assert.equal(/auth\.uid\(\) IS NOT NULL/.test(MIGRATION_SQL), false)
})

test('the historical setup scripts cannot recreate the public bucket or policy', () => {
  for (const [name, source] of [
    ['scripts/supabase-account-recovery-migration.sql', LEGACY_MIGRATION_SQL],
    ['scripts/supabase-account-recovery-table.sql', LEGACY_TABLE_SQL],
  ]) {
    assert.equal(/'account-recovery-documents', true\)/.test(source), false, name)
    assert.equal(/CREATE POLICY "Allow public/.test(source), false, name)
    assert.equal(/WITH CHECK \(true\)/.test(source), false, name)
    assert.equal(/auth\.uid\(\) IS NOT NULL/.test(source), false, name)
    assert.equal(/public (true|TRUE)/.test(source), false, name)
  }

  assert.match(LEGACY_MIGRATION_SQL, /'account-recovery-documents', false\)/)
})

test('the private bucket name is defined once and referenced by constant', () => {
  const literals = []

  for (const dir of SOURCE_DIRS) {
    for (const file of walk(dir)) {
      const source = readFileSync(path.join(root, file), 'utf8')
      if (source.includes("'account-recovery-documents'")) literals.push(file)
    }
  }

  assert.deepEqual(literals, [path.join('lib', 'recovery', 'documents.ts')])
})
