import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
function loader(overrides = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const loaded = { exports: {} };
    const code = ts.transpileModule(readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
    const local = name => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name.startsWith('./') && !name.endsWith('.css')) return load(path.join(path.dirname(file), name + '.ts'));
      if (name.startsWith('@/')) return load(name.slice(2) + '.ts');
      return require(name);
    };
    new Function('require', 'module', 'exports', code)(local, loaded, loaded.exports);
    cache.set(file, loaded.exports);
    return loaded.exports;
  }
  return load;
}
const load = loader();
const policy = load('lib/analytics/policy.ts');
const { AnalyticsRuntime } = load('lib/analytics/runtime.ts');
const ID = 'G-TEST123';
function fixture(id = ID) {
  const state = { path: '/', available: true, disabled: true, loads: 0, calls: [], cleared: 0, canceled: 0 };
  const runtime = new AnalyticsRuntime(id, {
    path: () => state.path, referrer: () => 'https://external.example/search?email=private@example.com', available: () => state.available,
    disable: value => { state.disabled = value; }, load: (ready, failed) => { state.loads++; state.ready = ready; state.failed = failed; },
    cancelPending: () => { state.canceled++; }, send: (...args) => { assert.equal(state.disabled, false); state.calls.push(args); }, clearCookies: () => { state.cleared++; },
  });
  const views = () => state.calls.filter(c => c[0] === 'event' && c[1] === 'page_view');
  return { state, runtime, views };
}

test('explicit public allowlist excludes private, callback, recovery, checkout and preview paths', () => {
  for (const p of ['/', '/about', '/services', '/services/web-development', '/services/google-ads/pricing', '/portfolio', '/portfolio/example', '/academy', '/music', '/blog', '/blog/-legacy-post', '/contact']) assert.equal(policy.eligiblePage(p), p);
  for (const p of ['', '//example.com', '/admin', '/admin/blog/preview/id', '/dashboard/music', '/platform/analytics', '/sign-in', '/sign-up', '/forgot-password', '/auth/callback', '/api/contact', '/services/checkout/success', '/services/social-media-management/account-recovery', '/services/social-media-management/account-recovery/success', '/donate/success', '/design/command-center', '/__music-form-preview', '/blog/post/preview', '/services/not-a-service', '/blog/a%40b']) assert.equal(policy.eligiblePage(p), null, p);
});

test('page locations and referrers drop queries, fragments, credentials and private paths', () => {
  const p = policy.eligiblePage('/blog/article/?email=private#secret');
  const payload = policy.pagePayload(p, 'https://www.purplesofthub.com/auth/callback?code=secret');
  assert.equal(payload.page_location, 'https://www.purplesofthub.com/blog/article');
  assert.equal(payload.page_referrer, '');
  assert.equal(policy.safeReferrer('https://external.example/private/person?token=secret#hash'), 'https://external.example');
  assert.equal(policy.safeReferrer('https://user:pass@external.example/'), '');
  assert.equal(policy.safeReferrer('javascript:alert(1)'), '');
});

test('preference persistence is versioned, expires and fails closed on invalid storage', () => {
  const now = 100000000;
  assert.equal(policy.readPreference(policy.preferenceRecord('accepted', now), now + 1), 'accepted');
  assert.equal(policy.readPreference(policy.preferenceRecord('rejected', now), now + 1), 'rejected');
  assert.equal(policy.readPreference(policy.preferenceRecord('accepted', now), now + policy.CONSENT_MAX_AGE), 'unknown');
  for (const raw of [null, 'broken', '{}', '{"version":1,"choice":"accepted","savedAt":9999999999999}']) assert.equal(policy.readPreference(raw, now), 'unknown');
});

test('unknown/rejected consent never loads a tag or queues Google commands', () => {
  const f = fixture(); f.runtime.rendered('/'); f.runtime.choose('rejected'); f.runtime.rendered('/');
  assert.equal(f.state.loads, 0); assert.deepEqual(f.state.calls, []); assert.equal(f.state.disabled, true);
});

test('accept after initial render initializes once and sends one sanitized page view', () => {
  const f = fixture(); f.runtime.rendered('/'); f.runtime.choose('accepted');
  assert.equal(f.state.loads, 1); assert.equal(f.views().length, 0);
  f.state.ready(); f.runtime.rendered('/'); f.runtime.choose('accepted');
  assert.equal(f.views().length, 1);
  const config = f.state.calls.find(c => c[0] === 'config');
  assert.equal(config[2].send_page_view, false); assert.equal(config[2].allow_google_signals, false);
  assert.equal(f.views()[0][2].send_to, ID); assert.equal(f.views()[0][2].page_referrer, 'https://external.example');
});

test('client navigation deduplicates renders, counts return visits and blocks excluded routes synchronously', () => {
  const f = fixture(); f.runtime.choose('accepted'); f.runtime.rendered('/'); f.state.ready();
  f.runtime.beforeNavigation(); assert.equal(f.state.disabled, true);
  f.state.path = '/blog'; f.runtime.rendered('/blog'); f.runtime.rendered('/blog');
  assert.equal(f.views().length, 2);
  f.runtime.beforeNavigation(); f.state.path = '/admin'; f.runtime.rendered('/admin');
  assert.equal(f.state.disabled, true); assert.equal(f.views().length, 2);
  f.runtime.beforeNavigation(); f.state.path = '/'; f.runtime.rendered('/');
  assert.equal(f.views().length, 3); assert.equal(f.state.loads, 1);
});

test('late script completion never sends a stale view after rejection or private navigation', () => {
  for (const mode of ['withdraw', 'private']) {
    const f = fixture(); f.runtime.rendered('/'); f.runtime.choose('accepted');
    if (mode === 'withdraw') f.runtime.choose('rejected');
    else { f.runtime.beforeNavigation(); f.state.path = '/auth/callback'; f.runtime.rendered('/auth/callback'); }
    f.state.ready(); assert.equal(f.views().length, 0); assert.equal(f.state.disabled, true);
  }
});

test('withdrawal stops further collection, clears GA cookies, and does not replay the same page on reaccept', () => {
  const f = fixture(); f.runtime.rendered('/'); f.runtime.choose('accepted'); f.state.ready();
  f.runtime.choose('rejected'); f.runtime.rendered('/');
  assert.equal(f.state.disabled, true); assert.equal(f.views().length, 1); assert.equal(f.state.cleared, 1);
  f.runtime.choose('accepted'); assert.equal(f.views().length, 1);
});

test('missing/example IDs and unavailable pages do not load; blocked scripts never fabricate success', () => {
  for (const id of ['', 'G-XXXXXXXXXX', 'not-an-id']) { const f = fixture(id); f.runtime.rendered('/'); f.runtime.choose('accepted'); assert.equal(f.state.loads, 0); }
  const f = fixture(); f.state.available = false; f.runtime.rendered('/blog/draft'); f.runtime.choose('accepted'); assert.equal(f.state.loads, 0);
  f.state.available = true; f.runtime.rendered('/'); f.state.failed(); assert.equal(f.views().length, 0); assert.equal(f.state.disabled, true);
});

test('effect cleanup/restart does not duplicate a page view', () => {
  const f = fixture(); f.runtime.rendered('/'); f.runtime.choose('accepted'); f.state.ready();
  f.runtime.stop(); f.runtime.choose('accepted'); f.runtime.rendered('/'); assert.equal(f.views().length, 1);
});

test('browser adapter gates native history before URL mutation and clears only this tag cookies', () => {
  const names = ['window', 'document', 'history', 'location', 'Element'];
  const saved = names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
  const scripts = [], cookies = [], listeners = new Map();
  const loc = { pathname: '/', hostname: 'www.purplesofthub.com', href: 'https://www.purplesofthub.com/' };
  let mustBeDisabled = false;
  const win = { location: loc, addEventListener: (n, fn) => listeners.set(n, fn), removeEventListener: n => listeners.delete(n) };
  const doc = { referrer: '', querySelector: () => null, createElement: () => ({ remove() { this.removed = true; } }), head: { appendChild: script => scripts.push(script) }, addEventListener: () => {}, removeEventListener: () => {} };
  Object.defineProperty(doc, 'cookie', { get: () => '_ga=old; _ga_TEST123=old; auth_session=keep; purplesofthub-theme=dark; _ga_OTHER=keep', set: value => cookies.push(value) });
  const hist = { pushState(data, unused, url) {
    assert.equal(this, hist);
    if (mustBeDisabled) assert.equal(win[`ga-disable-${ID}`], true, 'tag disabled BEFORE native mutation');
    const next = new URL(url, loc.href); loc.pathname = next.pathname; loc.href = next.href;
    return undefined;
  }, replaceState(data, unused, url) { return this.pushState(data, unused, url); } };
  try {
    for (const [name, value] of Object.entries({ window: win, document: doc, history: hist, location: loc, Element: class {} })) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
    const { browserRuntime, guardNavigation } = load('lib/analytics/browser.ts');
    const runtime = browserRuntime(ID), original = hist.pushState, cleanup = guardNavigation(runtime);
    runtime.rendered('/'); assert.equal(scripts.length, 0);
    runtime.choose('accepted'); assert.equal(scripts.length, 1); assert.equal(scripts[0].referrerPolicy, 'no-referrer');
    assert.deepEqual(win.dataLayer, []); scripts[0].onload();
    const views = () => win.dataLayer.filter(c => c[0] === 'event');
    assert.equal(views().length, 1);
    mustBeDisabled = true; hist.pushState({}, '', '/admin?code=secret'); runtime.rendered('/admin');
    assert.equal(views().length, 1); assert.equal(win[`ga-disable-${ID}`], true);
    hist.pushState({}, '', '/blog'); runtime.rendered('/blog'); assert.equal(views().length, 2);
    runtime.choose('rejected'); assert.equal(win[`ga-disable-${ID}`], true);
    assert.ok(cookies.some(c => c.startsWith('_ga_TEST123=')));
    assert.ok(cookies.every(c => c.startsWith('_ga=') || c.startsWith('_ga_TEST123=')));
    cleanup(); assert.equal(hist.pushState, original); assert.equal(listeners.size, 0);
  } finally { for (const [name, descriptor] of saved) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; } }
});

test('gtag adapter forwards native Arguments objects required by the real Google SDK', () => {
  const saved = ['window', 'document'].map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
  const scripts = [];
  const win = { location: { pathname: '/', hostname: 'localhost' } };
  const doc = { referrer: '', cookie: '', querySelector: () => null,
    createElement: () => ({ remove() {} }), head: { appendChild: script => scripts.push(script) } };
  try {
    for (const [name, value] of Object.entries({ window: win, document: doc })) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
    const runtime = load('lib/analytics/browser.ts').browserRuntime(ID);
    runtime.rendered('/');
    assert.equal(win.gtag, undefined, 'adapter absent before consent');
    runtime.choose('accepted');
    scripts[0].onload();
    assert.deepEqual(win.dataLayer.map(command => command[0]), ['consent', 'js', 'config', 'set', 'event']);
    for (const command of win.dataLayer) {
      assert.equal(Array.isArray(command), false, 'arrays are not native gtag command objects');
      assert.equal(Object.prototype.toString.call(command), '[object Arguments]');
    }
    const config = win.dataLayer.find(command => command[0] === 'config');
    assert.equal(config[1], ID);
    assert.equal(config[2].send_page_view, false);
    const event = win.dataLayer.find(command => command[0] === 'event');
    assert.equal(event[1], 'page_view');
    assert.equal(event[2].page_location, 'https://www.purplesofthub.com/');
  } finally {
    for (const [name, descriptor] of saved) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; }
  }
});

test('existing compact banner has equal accept/reject, Customize and withdrawal without automatic modal', () => {
  const render = (choice, open, preferencesOpen = false) => {
    let stateIndex = 0;
    const values = [choice, open, preferencesOpen, false];
    const component = loader({ react: { ...React, useEffect: () => {}, useRef: () => ({ current: null }), useState: () => [values[stateIndex++], () => {}] },
      'next/navigation': { usePathname: () => '/' }, 'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
      '@/lib/analytics/browser': { browserRuntime: () => {}, guardNavigation: () => {} },
      './AnalyticsPreferences.module.css': { __esModule: true, default: {} },
      '@radix-ui/react-dialog': {
        Root: ({ open, children }) => open ? children : null,
        Portal: ({ children }) => children,
        Overlay: () => null,
        Content: ({ children }) => React.createElement('div', { role: 'dialog' }, children),
        Title: ({ children }) => React.createElement('h2', {}, children),
        Description: ({ children }) => React.createElement('p', {}, children),
        Close: ({ children, ...props }) => React.createElement('button', props, children),
      },
    })('components/analytics/AnalyticsPreferences.tsx').default;
    return renderToStaticMarkup(React.createElement(component, { measurementId: ID }));
  };
  const html = render('unknown', false);
  assert.match(html, /Accept All/); assert.match(html, /Reject Optional/); assert.match(html, /Customize/); assert.match(html, /role="region"/); assert.match(html, /aria-controls="analytics-preferences"/);
  assert.doesNotMatch(html, /role="dialog"/);
  assert.match(render('accepted', true), /Withdraw consent/);
  const preferences = render('unknown', false, true);
  assert.match(preferences, /role="dialog"/);
  assert.match(preferences, /Always on/);
  assert.match(preferences, /Save Preferences/);
  assert.doesNotMatch(preferences, /checked=""/);
  const css = readFileSync(path.join(root, 'components/analytics/AnalyticsPreferences.module.css'), 'utf8');
  assert.match(css, /focus-visible/); assert.doesNotMatch(css, /animation|transition/);
  assert.match(css, /left: 16px; bottom: 16px/);
  assert.match(css, /max-width: min\(520px, calc\(100vw - 32px\)\)/);
});

test('footer privacy control opens the existing controller without storing or changing consent', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const events = [];
  try {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { dispatchEvent: event => events.push(event.type) } });
    const Button = loader({ './AnalyticsPreferences.module.css': { __esModule: true, default: {} } })('components/analytics/PrivacyPreferencesButton.tsx').default;
    const button = Button();
    assert.equal(button.props.children, 'Privacy Preferences');
    assert.equal(button.props['aria-haspopup'], 'dialog');
    button.props.onClick();
    assert.deepEqual(events, [policy.PRIVACY_PREFERENCES_EVENT]);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor); else delete globalThis.window;
  }
});
