import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
function loader(overrides = {}) {
  const cache = new Map();
  const load = file => {
    if (cache.has(file)) return cache.get(file);
    const loaded = { exports: {} };
    const source = readFileSync(path.join(root, file), 'utf8');
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    new Function('require', 'module', 'exports', code)(name => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name.startsWith('./')) return load(path.join(path.dirname(file), name + '.ts'));
      if (name.startsWith('@/')) return load(name.slice(2) + '.ts');
      return require(name);
    }, loaded, loaded.exports);
    cache.set(file, loaded.exports);
    return loaded.exports;
  };
  return load;
}
const policy = loader()('lib/newsletter/policy.ts');
const { NewsletterSubmission } = loader()('lib/newsletter/client.ts');
const controllerModule = loader({ 'next/navigation': { usePathname: () => '/' } })('components/newsletter/NewsletterPopupController.tsx');
function storage() { const values = new Map(); return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) }; }

test('45 seconds of active engagement qualifies; 44 seconds and initial load do not', () => {
  const clock = new policy.EngagementClock(0, true);
  assert.equal(clock.qualifies(1, true, false), false);
  clock.sample(44000, true); assert.equal(clock.qualifies(0, true, false), false);
  clock.sample(45000, true); assert.equal(clock.qualifies(0, true, false), true);
});
test('20 seconds plus 60 percent scroll qualifies; neither condition alone does', () => {
  const clock = new policy.EngagementClock(0, true);
  clock.sample(19000, true); assert.equal(clock.qualifies(.6, true, false), false);
  clock.sample(20000, true); assert.equal(clock.qualifies(.59, true, false), false);
  assert.equal(clock.qualifies(.6, true, false), true);
});
test('hidden and unfocused time is excluded; qualifying time never bypasses an interaction guard', () => {
  const clock = new policy.EngagementClock(0, true);
  clock.sample(10000, false); clock.sample(90000, false); clock.sample(100000, true);
  assert.equal(clock.elapsed, 10000);
  assert.equal(clock.qualifies(1, false, false), false);
  clock.sample(135000, true);
  assert.equal(clock.qualifies(1, true, true), false);
  assert.equal(clock.qualifies(1, true, false), true);
});
test('only public marketing routes qualify; private, payment and preview routes are excluded', () => {
  for (const route of ['/', '/services', '/services/web-development/pricing', '/portfolio', '/portfolio/project', '/blog/article', '/about']) assert.equal(policy.newsletterEligible(route), true, route);
  for (const route of ['/admin', '/dashboard', '/platform', '/sign-in', '/auth/callback', '/api/newsletter', '/services/checkout/success', '/donate/success', '/blog/preview', '/blog/article/preview', '/services/social-media-management/account-recovery']) assert.equal(policy.newsletterEligible(route), false, route);
  for (const query of ['?preview=1', '?token=example', '?draft=1', '?code=example']) assert.equal(policy.newsletterEligible('/', query), false);
  assert.equal(policy.newsletterEligible('/', '?utm_source=example'), true);
});
test('once per session persists across controller instances without storing visitor identifiers', () => {
  const local = storage(), session = storage();
  const a = new policy.NewsletterPreferences(() => local, () => session);
  assert.equal(a.canShow(), true); a.shown();
  assert.equal(a.canShow(), false);
  assert.equal(new policy.NewsletterPreferences(() => local, () => session).canShow(), false);
});
test('dismissal suppresses for exactly 14 days and is shared with later sessions', () => {
  const local = storage(); const now = 100000;
  new policy.NewsletterPreferences(() => local, storage).save(false, now);
  assert.equal(new policy.NewsletterPreferences(() => local, storage).canShow(now + policy.DISMISS_FOR - 1), false);
  assert.equal(new policy.NewsletterPreferences(() => local, storage).canShow(now + policy.DISMISS_FOR), true);
});
test('successful signup persists without storing email; malformed or future dismissal records are ignored', () => {
  const local = storage();
  const preferences = new policy.NewsletterPreferences(() => local, storage);
  preferences.save(true, 1);
  preferences.save(false, 2); // Closing the confirmation must not undo subscription persistence.
  new policy.NewsletterPreferences(() => local, storage).save(false, 3); // Nor may another tab overwrite it.
  assert.equal(new policy.NewsletterPreferences(() => local, storage).canShow(999999999999), false);
  assert.equal(policy.suppressed('broken'), false);
  assert.equal(policy.suppressed(JSON.stringify({ version: 1, dismissedAt: 200 }), 100), false);
  assert.equal(local.getItem(policy.PREFERENCE_KEY).includes('@'), false);
});
test('storage getter/read/write failures preserve in-memory suppression without crashing', () => {
  const blocked = () => { throw new Error('blocked storage'); };
  for (const access of [blocked, () => ({ getItem: blocked, setItem: blocked })]) {
    const prefs = new policy.NewsletterPreferences(access, access);
    assert.equal(prefs.canShow(), true); prefs.save(false);
    assert.equal(prefs.canShow(), false);
  }
});
test('email validation trims and normalizes without silently truncating or accepting nonstrings', () => {
  assert.equal(policy.normalizeEmail('  Reader@Example.invalid  '), 'reader@example.invalid');
  for (const value of [null, [], {}, 'invalid', 'a@b', 'a b@example.com', '<a>@example.com', 'x'.repeat(201) + '@example.com']) assert.equal(policy.normalizeEmail(value), null);
});
test('controller initial server markup is empty and cannot disturb page hydration', () => {
  const React = require('react');
  const { renderToString } = require('react-dom/server');
  assert.equal(renderToString(React.createElement(controllerModule.default)), '');
});
test('open dialogs, legacy checkout overlays, form entry and mobile keyboards block display', () => {
  const names = ['window', 'document', 'HTMLElement', 'getComputedStyle', 'innerWidth', 'innerHeight'];
  const saved = names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
  class ElementFixture { constructor(input = false) { this.input = input; this.style = {}; } matches() { return this.input; } closest() { return null; } getBoundingClientRect() { return { width: 400, height: 800, top: 0 }; } }
  let dialogs = [], overlays = [], focus = new ElementFixture();
  const viewport = { scale: 1, height: 800 };
  const doc = { get activeElement() { return focus; }, querySelector: () => null,
    querySelectorAll: selector => selector.startsWith('body ') ? overlays : selector.startsWith('iframe') ? [] : dialogs };
  try {
    for (const [name, value] of Object.entries({ window: { visualViewport: viewport }, document: doc, HTMLElement: ElementFixture, getComputedStyle: () => ({ display: 'block', visibility: 'visible' }), innerWidth: 400, innerHeight: 800 })) Object.defineProperty(globalThis, name, { configurable: true, value });
    assert.equal(controllerModule.browsingInterrupted(), false);
    focus = new ElementFixture(true); assert.equal(controllerModule.browsingInterrupted(), true);
    focus = new ElementFixture(); dialogs = [new ElementFixture()]; assert.equal(controllerModule.browsingInterrupted(), true);
    dialogs = []; const checkout = new ElementFixture(); checkout.style.position = 'fixed'; overlays = [checkout];
    assert.equal(controllerModule.browsingInterrupted(), true);
    overlays = []; viewport.height = 500; assert.equal(controllerModule.browsingInterrupted(), true);
    // Layout viewport may also shrink: use the baseline height captured before the keyboard.
    Object.defineProperty(globalThis, 'innerHeight', { configurable: true, value: 500 });
    assert.equal(controllerModule.browsingInterrupted(800), true);
  } finally { for (const [name, descriptor] of saved) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; } }
});
test('duplicate submissions issue one request and existing subscribers are accepted only after API acknowledgment', async () => {
  const submission = new NewsletterSubmission();
  let resolve, calls = 0, payload;
  const transport = (_url, options) => { calls++; payload = JSON.parse(options.body); return new Promise(done => { resolve = done; }); };
  const first = submission.submit(' Reader@Example.invalid ', 'newsletter-popup', transport);
  assert.equal(await submission.submit('reader@example.invalid', 'newsletter-popup', transport), null);
  assert.equal(calls, 1); assert.equal(submission.pending, true);
  resolve(Response.json({ success: true, message: 'You are already subscribed!' }));
  assert.equal(await first, 'You are already subscribed!');
  assert.deepEqual(payload, { email: 'reader@example.invalid', source: 'newsletter-popup' });
  assert.equal(submission.pending, false);
});
test('HTTP errors and false success responses never fabricate a subscription and allow retry', async () => {
  const submission = new NewsletterSubmission();
  for (const response of [Response.json({ success: true }, { status: 503 }), Response.json({ success: false }), Response.json({})]) {
    await assert.rejects(submission.submit('reader@example.invalid', 'website', async () => response));
    assert.equal(submission.pending, false);
  }
  await assert.rejects(submission.submit('invalid', 'website', () => { throw Error('must not request'); }));
});

function apiFixture({ existing = null, lookupError = null, updated = null, updateError = null } = {}) {
  const query = { select() { return this; }, eq() { return this; },
    update() { this.updating = true; return this; },
    async maybeSingle() { return this.updating ? { data: updated, error: updateError } : { data: existing, error: lookupError }; },
    insert() { throw Error('Unexpected subscriber creation'); } };
  const api = loader({ '@/lib/newsletter/server': { createNewsletterClient: () => ({ from: () => query }), newsletterAvailable: async () => false } })('app/api/newsletter/route.ts');
  return api;
}
const request = email => new Request('http://localhost/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: 'newsletter-popup' }) });
test('existing newsletter API fails closed on unavailable tables and invalid emails', async () => {
  const api = apiFixture({ lookupError: { code: 'PGRST205' } });
  assert.equal((await api.POST(request('reader@example.invalid'))).status, 503);
  assert.equal((await api.POST(request({ bad: 'email' }))).status, 400);
});
test('reactivation cannot claim success for a failed or zero-row update', async () => {
  for (const fixture of [{ updateError: { code: '42501' } }, { updated: null }]) {
    const api = apiFixture({ existing: { id: 1, status: 'unsubscribed' }, ...fixture });
    assert.equal((await api.POST(request('reader@example.invalid'))).status, 503);
  }
  const api = apiFixture({ existing: { id: 1, status: 'active' } });
  assert.equal((await (await api.POST(request('reader@example.invalid'))).json()).success, true);
});

test('newsletter server client uses only privileged server credentials and explicit public schema', async () => {
  const names = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const saved = names.map(name => [name, process.env[name]]);
  const originalFetch = globalThis.fetch;
  let configuration, checkedRequest;
  const server = loader({ 'server-only': {}, '@supabase/supabase-js': {
    createClient: (...args) => { configuration = args; return { serverClient: true }; },
  } })('lib/newsletter/server.ts');
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://newsletter.example.invalid';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    assert.equal(server.createNewsletterClient(), null);
    assert.equal(await server.newsletterAvailable(), false);
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'isolated-test-key';
    assert.deepEqual(server.createNewsletterClient(), { serverClient: true });
    assert.equal(configuration[1], 'isolated-test-key');
    assert.deepEqual(configuration[2], { db: { schema: 'public' }, auth: { persistSession: false, autoRefreshToken: false } });
    globalThis.fetch = async (...args) => { checkedRequest = args; return new Response(null, { status: 200 }); };
    assert.equal(await server.newsletterAvailable(), true);
    assert.match(checkedRequest[0], /limit=0$/);
    assert.equal(checkedRequest[1].method, 'HEAD');
    assert.equal(checkedRequest[1].headers['Accept-Profile'], 'public');
    assert.equal(checkedRequest[1].headers.Authorization, 'Bearer isolated-test-key');
    globalThis.fetch = async () => new Response(null, { status: 404 });
    assert.equal(await server.newsletterAvailable(), false);
    globalThis.fetch = async () => { throw Error('timeout'); };
    assert.equal(await server.newsletterAvailable(), false);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of saved) { if (value === undefined) delete process.env[name]; else process.env[name] = value; }
  }
});

test('newsletter capability returns only availability and POST fails closed without server credentials', async () => {
  for (const available of [false, true]) {
    const api = loader({ '@/lib/newsletter/server': { createNewsletterClient: () => null, newsletterAvailable: async () => available } })('app/api/newsletter/route.ts');
    const result = await api.GET();
    assert.deepEqual(await result.json(), { available });
    assert.equal(result.headers.get('Cache-Control'), 'no-store');
    assert.equal((await api.POST(request('reader@example.invalid'))).status, 503);
  }
});

test('concurrent duplicate signup is acknowledged only after confirming an active record', async () => {
  for (const status of ['active', 'unsubscribed']) {
    let reads = 0;
    const query = { select() { return this; }, eq() { return this; },
      async maybeSingle() { return { data: ++reads === 1 ? null : { status }, error: null }; },
      async insert() { return { error: { code: '23505' } }; } };
    const api = loader({ '@/lib/newsletter/server': { createNewsletterClient: () => ({ from: () => query }) } })('app/api/newsletter/route.ts');
    const response = await api.POST(request('reader@example.invalid'));
    assert.equal(response.status, status === 'active' ? 200 : 500);
    assert.equal((await response.json()).success === true, status === 'active');
  }
});
