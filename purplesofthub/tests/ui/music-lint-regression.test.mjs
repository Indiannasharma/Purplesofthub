import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { renderSurface } from './fixtures/render-surface.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = readFileSync(path.join(root, 'app/dashboard/music/page.tsx'), 'utf8');
const services = renderSurface('lib/payments/service-plans.ts', {}, {}, '__data');
const currency = renderSurface('lib/pricing/currency.ts', {}, {}, '__data');
const campaign = { id: 'local-only', artist_name: 'Fixture artist', track_title: 'Fixture track', platforms: ['Spotify'], status: 'active', created_at: '2026-10-01', plan_name: 'Fixture plan' };

function harness({ search = '', authError = null, missingUser = false, rows = [campaign], campaignError = null } = {}) {
  const state = [], effects = [], pending = [], updates = [], requests = [];
  let stateIndex = 0, effectIndex = 0;
  const hooks = {
    ...React,
    useState(initial) {
      const index = stateIndex++;
      if (!Object.hasOwn(state, index)) state[index] = typeof initial === 'function' ? initial() : initial;
      return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; updates.push(index); }];
    },
    useEffect(callback, dependencies) {
      const index = effectIndex++;
      if (!effects[index] || dependencies.some((value, i) => !Object.is(value, effects[index][i]))) pending.push(callback);
      effects[index] = dependencies;
    },
  };
  const client = {
    auth: { getUser: async () => { requests.push('auth'); return { data: { user: missingUser ? null : { id: 'local-only', email: 'fixture@example.invalid', user_metadata: { full_name: 'Fixture user' } } }, error: authError }; } },
    from(table) {
      requests.push(table);
      const query = { select() { return query; }, eq(column, value) { assert.equal(column, table === 'profiles' ? 'id' : 'client_id'); assert.equal(value, 'local-only'); return query; }, single: async () => ({ data: { phone: 'fixture', full_name: 'Fixture profile' } }), order: async () => ({ data: rows, error: campaignError }) };
      return query;
    },
  };
  const loaded = { exports: {} };
  const code = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  function local(name) {
    if (name === 'react') return hooks;
    if (name === 'react/jsx-runtime') return jsxRuntime;
    if (name === 'date-fns') return { format: () => 'Oct 1, 2026' };
    if (name === '@/lib/supabase/client') return { createClient: () => client };
    if (name === '@/lib/payments/service-plans') return services;
    if (name === '@/lib/pricing/currency') return currency;
    if (name === '@/context/CurrencyContext') return { useCurrency: () => ({ currency: 'NGN' }) };
    return { __esModule: true, default: () => null };
  }
  new Function('require', 'module', 'exports', 'window', code)(local, loaded, loaded.exports, { location: { search } });
  function render() { stateIndex = 0; effectIndex = 0; return renderToStaticMarkup(loaded.exports.default()); }
  function runEffects() { for (const callback of pending.splice(0)) callback(); }
  async function settle() { for (let i = 0; i < 8; i++) await Promise.resolve(); }
  return { state, updates, requests, pending, render, runEffects, settle };
}

test('Music retains loading, owned reads and populated campaign rendering without duplicate requests', async () => {
  const fixture = harness();
  assert.match(fixture.render(), /Loading your music campaigns/);
  fixture.runEffects();
  assert.deepEqual(fixture.requests, ['auth']);
  assert.equal(fixture.state[1], true);
  await fixture.settle();
  assert.deepEqual(fixture.requests, ['auth', 'profiles', 'music_campaigns']);
  assert.equal(fixture.state[1], false);
  assert.match(fixture.render(), /Fixture track/);
  fixture.runEffects();
  await fixture.settle();
  assert.equal(fixture.pending.length, 0);
  assert.deepEqual(fixture.requests, ['auth', 'profiles', 'music_campaigns']);
});

test('Music defers only the three URL-selected updates, preserving selected plan and type', async () => {
  const plan = services.getServiceBySlug('music-distribution').plans.find(item => !item.isCustom);
  const fixture = harness({ search: `?service=distribution&plan=${plan.id}` });
  fixture.render();
  fixture.runEffects();
  assert.equal(fixture.state[8], null);
  assert.equal(fixture.state[10], false);
  assert.deepEqual(fixture.requests, ['auth']);
  await fixture.settle();
  assert.equal(fixture.state[8], plan);
  assert.equal(fixture.state[9], 'distribution');
  assert.equal(fixture.state[10], true);
  assert.deepEqual(fixture.updates.filter(index => [8, 9, 10].includes(index)), [8, 9, 10]);
  fixture.render(); fixture.runEffects(); await fixture.settle();
  assert.deepEqual(fixture.updates.filter(index => [8, 9, 10].includes(index)), [8, 9, 10]);
});

test('Music keeps the existing invalid-plan fallback and does not invent URL resynchronization', async () => {
  const fixture = harness({ search: '?plan=not-a-real-plan' });
  fixture.render(); fixture.runEffects(); await fixture.settle();
  assert.equal(fixture.state[8], services.getServiceBySlug('music-promotion').plans.find(item => !item.isCustom));
  assert.equal(fixture.state[9], 'promotion');
});

for (const options of [{ authError: { message: 'fixture auth failure' } }, { missingUser: true }]) {
  test(`Music preserves the ${options.missingUser ? 'signed-out' : 'auth-error'} loading exit without customer reads`, async () => {
    const fixture = harness(options);
    fixture.render(); fixture.runEffects(); await fixture.settle();
    assert.equal(fixture.state[1], false);
    assert.equal(fixture.state[3], false);
    assert.deepEqual(fixture.requests, ['auth']);
  });
}

test('Music preserves empty rendering and existing campaign-read error semantics', async () => {
  for (const options of [{ rows: [] }, { rows: null, campaignError: { message: 'fixture read failure' } }]) {
    const fixture = harness(options);
    fixture.render(); fixture.runEffects(); await fixture.settle();
    assert.deepEqual(fixture.state[0], []);
    assert.equal(fixture.state[1], false);
    assert.doesNotMatch(fixture.render(), /Fixture track|My Music Campaigns/);
    assert.deepEqual(fixture.requests, ['auth', 'profiles', 'music_campaigns']);
  }
});
