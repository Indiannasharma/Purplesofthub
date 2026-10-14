import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../../components/HeroCosmosScene.tsx', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
const contextSource = readFileSync(new URL('../../context/ThemeContext.tsx', import.meta.url), 'utf8');
const contextCode = ts.transpileModule(contextSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;

function render(theme, variant, hydration) {
  const loaded = { exports: {} };
  const hooks = hydration === undefined ? React : {
    ...React,
    useSyncExternalStore: (_subscribe, client, server) => hydration ? client() : server(),
  };
  const jsx = require('react/jsx-runtime');
  const cleanStyle = fn => (type, props, key) => {
    if (type === 'style') { const rest = { ...props }; delete rest.jsx; return fn(type, rest, key); }
    return fn(type, props, key);
  };
  const context = { exports: {} };
  new Function('require', 'module', 'exports', contextCode)(name => {
    if (name === 'react') return hooks;
    if (name === 'next-themes') return {
      ThemeProvider: function FixtureThemeProvider({ children }) { return children; },
      useTheme: () => ({ theme, resolvedTheme: theme === 'system' ? 'dark' : theme, setTheme() {} }),
    };
    return require(name);
  }, context, context.exports);
  new Function('require', 'module', 'exports', code)(name => {
    if (name === 'react') return hooks;
    if (name === 'react/jsx-runtime') return { ...jsx, jsx: cleanStyle(jsx.jsx), jsxs: cleanStyle(jsx.jsxs) };
    if (name === '@/context/ThemeContext') return context.exports;
    return require(name);
  }, loaded, loaded.exports);
  function ThemeAttributeConsumer() {
    const value = context.exports.useTheme();
    return React.createElement('span', { 'data-resolved-theme': value.theme, 'data-theme-mode': value.mode });
  }
  return renderToStaticMarkup(React.createElement(context.exports.ThemeProvider, null,
    React.createElement(loaded.exports.default, { variant }), React.createElement(ThemeAttributeConsumer)));
}

for (const variant of ['backdrop', 'planet']) {
  test(`${variant}: actual server and initial hydration markup match for saved dark and light themes`, () => {
    const server = render('light', variant);
    assert.equal(render('dark', variant), server);
    assert.equal(render('dark', variant, false), server);
    assert.equal(render('light', variant, false), server);
    assert.match(server, /data-theme="light"/);
    assert.match(server, /data-resolved-theme="light" data-theme-mode="system"/);
    assert.doesNotMatch(server, /suppressHydrationWarning/);
  });
}

test('resolved hero preserves dark/light star counts, ring colors and geometry after hydration', () => {
  const dark = render('dark', 'backdrop', true), light = render('light', 'backdrop', true);
  assert.equal((dark.match(/class="psh-cosmos-star"/g) || []).length, 68);
  assert.equal((light.match(/class="psh-cosmos-star"/g) || []).length, 42);
  assert.match(dark, /data-theme="dark"/);
  const planetDark = render('dark', 'planet', true), planetLight = render('light', 'planet', true);
  assert.match(planetDark, /<stop stop-color="#B44CFF"/);
  assert.match(planetLight, /<stop stop-color="#F7EEFF"/);
  assert.equal((planetDark.match(/<ellipse /g) || []).length, 12);
  assert.equal((planetLight.match(/<ellipse /g) || []).length, 12);
  assert.match(planetDark, /class="psh-planet-scene"/);
});

test('shared bridge preserves saved dark, light and system preferences after hydration', () => {
  assert.match(render('dark', 'backdrop', true), /data-resolved-theme="dark" data-theme-mode="dark"/);
  assert.match(render('light', 'backdrop', true), /data-resolved-theme="light" data-theme-mode="light"/);
  assert.match(render('system', 'backdrop', true), /data-resolved-theme="dark" data-theme-mode="system"/);
});
