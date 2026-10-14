import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const source = file => readFileSync(new URL('../../' + file, import.meta.url), 'utf8');
const blocked = () => { throw new Error('Real payment/network transport is forbidden'); };
function load(file, overrides = {}) {
  const loaded = { exports: {} };
  const code = ts.transpileModule(source(file), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  new Function('require', 'module', 'exports', 'fetch', code)(name => {
    if (Object.hasOwn(overrides, name)) return overrides[name];
    if (name.startsWith('@/')) throw new Error('Unmocked dependency: ' + name);
    return require(name);
  }, loaded, loaded.exports, blocked);
  return loaded.exports;
}

function navbar(theme, hydration) {
  const plain = tag => function FixtureElement({ children, ...props }) { return React.createElement(tag, props, children); };
  const Navbar = load('components/Navbar.tsx', {
    react: hydration === undefined ? React : { ...React, useSyncExternalStore: (_subscribe, client, server) => hydration ? client() : server() },
    'next/link': { __esModule: true, default: plain('a') },
    'next/image': { __esModule: true, default: ({ alt }) => React.createElement('img', { alt }) },
    'framer-motion': { motion: {}, AnimatePresence: plain(React.Fragment) },
    '@/Assets/images/Purplesoft-logo-main.png': { __esModule: true, default: 'logo' },
    '@/context/ThemeContext': { useTheme: () => ({ theme, toggleTheme: blocked }) },
    '@/components/pricing/CurrencySwitcher': { __esModule: true, default: () => React.createElement('span', null, 'Currency') },
    '@/lib/supabase/client': { createClient: blocked },
  }).default;
  return renderToStaticMarkup(React.createElement(Navbar));
}

test('actual navbar server markup matches initial hydration regardless of saved theme', () => {
  const server = navbar('light');
  assert.equal(navbar('dark'), server);
  assert.equal(navbar('dark', false), server);
  assert.match(server, /href="\/services"/);
  assert.match(server, /Switch to Dark Mode/);
  assert.match(server, /Open menu/);
});
test('hydrated navbar restores dark controls without hiding navigation', () => {
  const dark = navbar('dark', true);
  assert.match(dark, /Switch to Light Mode/);
  assert.match(dark, /<circle cx="12" cy="12" r="4"/);
  assert.match(dark, /href="\/services"/);
  assert.match(navbar('light', true), /Switch to Dark Mode/);
});

function sdkFixture() {
  const names = ['window', 'document'];
  const saved = names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
  const scripts = [], timers = new Map();
  const win = { setTimeout(fn) { const id = timers.size + 1; timers.set(id, fn); return id; }, clearTimeout(id) { timers.delete(id); } };
  const doc = { createElement: () => ({ remove() { this.removed = true; } }), head: { appendChild(script) { scripts.push(script); } } };
  for (const [name, value] of Object.entries({ window: win, document: doc })) Object.defineProperty(globalThis, name, { configurable: true, value });
  return { scripts, timers, win, loadPaystack: load('lib/payments/paystack-loader.ts').loadPaystack, restore() { for (const [name, descriptor] of saved) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; } } };
}
test('scoped loader waits for readiness, shares concurrent loads and avoids data attributes', async () => {
  const f = sdkFixture();
  try {
    const a = f.loadPaystack(), b = f.loadPaystack();
    assert.equal(a, b); assert.equal(f.scripts.length, 1);
    assert.equal(f.scripts[0].src, 'https://js.paystack.co/v1/inline.js');
    assert.equal(f.scripts[0].referrerPolicy, 'no-referrer');
    assert.ok(Object.keys(f.scripts[0]).every(key => !key.startsWith('data-')));
    let resolved = false; void a.then(() => { resolved = true; });
    await Promise.resolve(); assert.equal(resolved, false);
    const sdk = { setup: blocked }; f.win.PaystackPop = sdk; f.scripts[0].onload();
    assert.equal(await a, sdk); assert.equal(await f.loadPaystack(), sdk);
    assert.equal(f.scripts.length, 1); assert.equal(f.timers.size, 0);
  } finally { f.restore(); }
});
for (const failure of ['network', 'timeout', 'missing-sdk']) {
  test(`loader rejects ${failure}, cleans up and allows retry`, async () => {
    const f = sdkFixture();
    try {
      const promise = f.loadPaystack();
      if (failure === 'network') f.scripts[0].onerror();
      else if (failure === 'timeout') [...f.timers.values()][0]();
      else f.scripts[0].onload();
      await assert.rejects(promise);
      assert.equal(f.scripts[0].removed, true); assert.equal(f.timers.size, 0);
      const retry = f.loadPaystack(); assert.equal(f.scripts.length, 2);
      f.win.PaystackPop = { setup: blocked }; f.scripts[1].onload(); await retry;
    } finally { f.restore(); }
  });
}

function checkoutFixture(loadPaystack) {
  const states = [], effects = [];
  const hooks = { ...React, useState: initial => [typeof initial === 'function' ? initial() : initial, value => states.push(value)], useRef: initial => ({ current: initial }), useEffect: fn => effects.push(fn) };
  const Modal = load('components/checkout/UniversalCheckoutModal.tsx', {
    react: hooks, 'next/link': { __esModule: true, default: 'a' },
    '@/lib/payments/service-plans': { formatPrice: String },
    '@/context/CurrencyContext': { useCurrency: () => ({ currency: 'NGN' }) },
    '@/lib/pricing/currency': { formatRegionalPrice: String },
    '@/lib/payments/paystack-loader': { loadPaystack },
  }).default;
  const tree = Modal({ service: { id: 'fixture', name: 'Fixture' }, plan: { id: 'basic', name: 'Basic', priceNGN: 1200, priceUSD: 1, billingType: 'monthly' }, userName: 'Test User', userEmail: 'test@example.invalid', userPhone: '000', isLoggedIn: true, onClose: blocked });
  function text(node) { if (!node || typeof node === 'boolean') return ''; if (typeof node !== 'object') return String(node); if (Array.isArray(node)) return node.map(text).join(''); return text(node.props?.children); }
  function find(node) { if (!node || typeof node !== 'object') return null; if (Array.isArray(node)) return node.map(find).find(Boolean); if (node.type === 'button' && text(node).includes('Pay with Paystack')) return node; return find(node.props?.children); }
  return { click: find(tree).props.onClick, states, close: effects[0]() };
}
test('inline checkout waits for SDK and preserves amount, currency and callbacks', async () => {
  let resolve, config, opens = 0, loads = 0;
  const pending = new Promise(done => { resolve = done; });
  const f = checkoutFixture(() => { loads++; return pending; });
  const attempt = f.click(); await f.click(); assert.equal(loads, 1); assert.equal(opens, 0);
  resolve({ setup(value) { config = value; return { openIframe() { opens++; } }; } }); await attempt;
  assert.equal(opens, 1); assert.equal(config.amount, 120000); assert.equal(config.currency, 'NGN');
  assert.equal(config.email, 'test@example.invalid'); assert.equal(config.metadata.service_id, 'fixture');
  assert.equal(typeof config.callback, 'function'); assert.equal(typeof config.onClose, 'function');
  assert.match(config.ref, /^PSW-FIXTURE-BASIC-\d+$/);
});
test('closing checkout while SDK loads never opens a late payment iframe', async () => {
  let resolve, opened = false;
  const f = checkoutFixture(() => new Promise(done => { resolve = done; }));
  const attempt = f.click(); f.close(); resolve({ setup() { opened = true; return { openIframe: blocked }; } }); await attempt;
  assert.equal(opened, false);
});
test('inline checkout recovers loader and SDK errors without unhandled rejection', async () => {
  for (const sdk of [null, { setup() { throw new Error('SDK rejected'); } }]) {
    const f = checkoutFixture(() => sdk ? Promise.resolve(sdk) : Promise.reject(new Error('blocked')));
    await f.click(); assert.ok(f.states.includes('payment')); assert.ok(f.states.some(value => typeof value === 'string' && value.includes('Paystack is unavailable')));
  }
});
test('public layout keeps GA consent and Flutterwave while redirect checkout stays independent of inline SDK', () => {
  assert.match(source('app/layout.tsx'), /<AnalyticsPreferences measurementId=\{process.env.NEXT_PUBLIC_GA_ID/);
  assert.doesNotMatch(source('app/layout.tsx'), /src="https:\/\/js.paystack.co/);
  assert.match(source('app/layout.tsx'), /src="https:\/\/checkout.flutterwave.com\/v3.js"/);
  const redirect = source('app/services/_components/CheckoutModal.tsx');
  // Fingerprint the unchanged redirect controller, independent of checkout SDK loading.
  assert.equal(createHash('sha256').update(redirect.replace(/\r\n/g, '\n')).digest('hex'), '4efddae41d9e5d4c566ac0325d6d7d666f03d4d78085b6e13b193aca64604997');
  assert.match(redirect, /\/api\/payments\/paystack\/initialize/);
  assert.match(redirect, /window.location.href = data.authorization_url/);
  assert.doesNotMatch(redirect, /PaystackPop|loadPaystack/);
});
