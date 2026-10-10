import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import postcss from 'postcss';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = file => readFileSync(path.join(root, file), 'utf8');
const require = createRequire(path.join(root, 'package.json'));

function loader(overrides = {}) {
  const cache = new Map();
  function load(file) {
    const filename = path.resolve(root, file);
    if (cache.has(filename)) return cache.get(filename).exports;
    const loaded = { exports: {} }; cache.set(filename, loaded);
    const code = ts.transpileModule(source(file), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
    function local(name) {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name.endsWith('.module.css')) return { default: { root: 'reveal-root', entered: 'reveal-entered', card: 'motion-card', gradient: 'motion-gradient' }, __esModule: true };
      if (name.endsWith('.css')) return {};
      if (!name.startsWith('@/') && !name.startsWith('.')) return require(name);
      const target = name.startsWith('@/') ? path.resolve(root, name.slice(2)) : path.resolve(path.dirname(filename), name);
      const resolved = [target, `${target}.ts`, `${target}.tsx`, `${target}/index.tsx`].find(candidate => existsSync(candidate) && statSync(candidate).isFile());
      assert.ok(resolved, name);
      return load(path.relative(root, resolved));
    }
    new Function('require', 'module', 'exports', code)(local, loaded, loaded.exports);
    return loaded.exports;
  }
  return load;
}
const load = loader();
const content = React.createElement('h2', null, 'Essential public content');
const markup = component => renderToStaticMarkup(React.createElement(component, null, content));

test('root document is visible server HTML without an animation dependency or paint promotion', () => {
  const html = markup(load('app/template.tsx').default);
  assert.equal(html, '<div><h2>Essential public content</h2></div>');
  assert.doesNotMatch(source('app/template.tsx'), /framer-motion|opacity|willChange/);
});

for (const name of ['FadeInUp', 'FadeIn', 'StaggerContainer', 'StaggerItem']) {
  test(`${name}: content is visible before JavaScript, observers or motion initialize`, () => {
    const html = markup(load('components/motion/index.tsx')[name]);
    assert.match(html, /Essential public content/);
    assert.doesNotMatch(html, /opacity:0|visibility:hidden|display:none|translateY\(24px\)/);
  });
}

test('Reveal CSS never hides content, including during delay and reduced motion', () => {
  const css = postcss.parse(source('components/Reveal.module.css'));
  const opacity = [], reduced = [];
  css.walkDecls('opacity', declaration => opacity.push(declaration.value));
  css.walkAtRules('media', rule => { if (rule.params.includes('prefers-reduced-motion: reduce')) reduced.push(rule.toString()); });
  assert.deepEqual(opacity, ['1']);
  assert.doesNotMatch(css.toString(), /visibility:\s*hidden|display:\s*none|will-change/);
  assert.match(reduced.join(''), /animation: none/);
  assert.match(reduced.join(''), /transform: none/);
});

test('Reveal fails open with missing, failed, silent and functioning observers', () => {
  const originalWindow = globalThis.window, originalObserver = globalThis.IntersectionObserver;
  try {
    for (const mode of ['missing', 'constructor-error', 'observe-error', 'silent', 'working', 'reduced', 'media-error']) {
      const effects = [], classes = [], node = { classList: { add: value => classes.push(value) } };
      let callback, observed = 0, disconnected = 0;
      globalThis.window = { matchMedia: () => { if (mode === 'media-error') throw new Error('media unavailable'); return { matches: mode === 'reduced' }; } };
      globalThis.IntersectionObserver = mode === 'missing' ? undefined : class {
        constructor(fn) { if (mode === 'constructor-error') throw new Error('observer unavailable'); callback = fn; }
        observe() { if (mode === 'observe-error') throw new Error('observe failed'); observed++; }
        disconnect() { disconnected++; }
      };
      const component = loader({ react: { ...React, useRef: () => ({ current: node }), useEffect: callback => effects.push(callback) } })('components/Reveal.tsx').default;
      const tree = component({ children: content, delay: 0.2 });
      assert.equal(tree.props.style.opacity, undefined, mode);
      assert.equal(tree.props.style.transform, undefined, mode);
      assert.doesNotThrow(() => { for (const effect of effects) effect(); }, mode);
      if (mode === 'working') { callback([{ isIntersecting: false }]); assert.equal(classes.length, 0); callback([{ isIntersecting: true }]); assert.deepEqual(classes, ['reveal-entered']); assert.ok(disconnected); }
      else assert.deepEqual(classes, [], mode);
      if (mode === 'missing' || mode === 'reduced' || mode === 'media-error') assert.equal(observed, 0, mode);
    }
  } finally {
    if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow;
    if (originalObserver === undefined) delete globalThis.IntersectionObserver; else globalThis.IntersectionObserver = originalObserver;
  }
});

test('counts and rotating words have meaningful server-rendered fallbacks', () => {
  const count = renderToStaticMarkup(React.createElement(load('components/motion/CountUp.tsx').CountUp, { end: 98, suffix: '%' }));
  assert.match(count, /98%/);
  const words = renderToStaticMarkup(React.createElement(load('components/common/PersistentTypewriter.tsx').default, { words: ['E-commerce Brands', 'Music Artists'] }));
  assert.match(words, /E-commerce Brands/);
});

test('CountUp stays complete without capabilities and starts at most one timer after intersection', () => {
  const saved = { window: globalThis.window, observer: globalThis.IntersectionObserver, interval: globalThis.setInterval, clear: globalThis.clearInterval };
  try {
    for (const mode of ['missing', 'reduced', 'throwing', 'working']) {
      const effects = [], values = [];
      let callback, timers = 0, cleanupCount = 0;
      globalThis.window = { matchMedia: () => ({ matches: mode === 'reduced' }) };
      globalThis.IntersectionObserver = mode === 'missing' ? undefined : class {
        constructor(fn) { if (mode === 'throwing') throw new Error('observer failure'); callback = fn; }
        observe() {}
        disconnect() {}
      };
      globalThis.setInterval = () => { timers++; return 1; };
      globalThis.clearInterval = () => { cleanupCount++; };
      const hooks = { ...React, useRef: () => ({ current: {} }), useState: initial => [initial, value => values.push(value)], useEffect: effect => effects.push(effect) };
      const component = loader({ react: hooks })('components/motion/CountUp.tsx').CountUp;
      const tree = component({ end: 98, duration: 2, suffix: '%' });
      assert.equal(tree.props.children[1], 98);
      let cleanup; assert.doesNotThrow(() => { cleanup = effects[0](); });
      if (mode === 'working') { callback([{ isIntersecting: true }]); callback([{ isIntersecting: true }]); assert.equal(timers, 1); cleanup(); callback([{ isIntersecting: true }]); assert.equal(timers, 1); assert.equal(cleanupCount, 1); }
      else { assert.equal(timers, 0); assert.deepEqual(values, []); }
    }
  } finally {
    if (saved.window === undefined) delete globalThis.window; else globalThis.window = saved.window;
    if (saved.observer === undefined) delete globalThis.IntersectionObserver; else globalThis.IntersectionObserver = saved.observer;
    globalThis.setInterval = saved.interval; globalThis.clearInterval = saved.clear;
  }
});

test('blocked storage and reduced motion leave the typewriter complete without timers', () => {
  const originalWindow = globalThis.window;
  try {
    for (const reduced of [true, false]) {
      const effects = []; let scheduled = 0;
      globalThis.window = { matchMedia: () => ({ matches: reduced }), localStorage: { getItem() { throw new Error('blocked storage'); } }, setTimeout() { scheduled++; }, clearTimeout() {} };
      const hooks = { ...React, useRef: initial => ({ current: initial }), useState: initial => [initial, () => {}], useEffect: effect => effects.push(effect) };
      const component = loader({ react: hooks })('components/common/PersistentTypewriter.tsx').default;
      const tree = component({ words: ['Complete fallback'] });
      assert.equal(tree.props.children, 'Complete fallback');
      assert.doesNotThrow(() => effects[0]());
      assert.equal(scheduled, 0);
    }
  } finally { if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow; }
});

test('service progress represents its existing value without observer startup', () => {
  const html = renderToStaticMarkup(React.createElement(load('components/ServiceCards.tsx').default, { services: [{ icon: 'Web', title: 'Web Development', desc: 'Description', tags: ['Next.js'], href: '/services/web-development' }] }));
  assert.match(html, /width:95%/);
  assert.doesNotMatch(source('components/ServiceCards.tsx'), /new IntersectionObserver|querySelectorAll/);
});

test('Services keeps its categories and actual count values in server HTML', () => {
  const html = renderToStaticMarkup(React.createElement(load('app/services/_components/ServicesContent.tsx').default, { services: [] }));
  for (const text of ['Services Offered', 'Projects Delivered', 'Client Satisfaction', 'Response Time', '10+', '50+', '98%', '24hr']) assert.ok(html.includes(text), text);
});

test('public Music and mobile menu do not start essential surfaces transparent', () => {
  assert.doesNotMatch(source('app/music/page.tsx'), /initial=\{\{ opacity: 0/);
  assert.match(source('components/Navbar.tsx'), /mobileMenuVariants\} initial=\{false\} animate="open"/);
  assert.match(source('components/Navbar.tsx'), /mobileOpen &&/);
  assert.match(source('components/Navbar.tsx'), /overflowY: "auto"/);
  const css = source('app/globals.css');
  assert.match(css, /max-height: calc\(100vh - 72px\); max-height: calc\(100dvh - 72px\)/);
  assert.match(css, /@supports not \(\(backdrop-filter/);
});

test('Nova is a bounded sibling outside the document and has no closed full-screen panel', () => {
  const layout = source('app/layout.tsx'), chatbot = source('components/ChatBot.tsx');
  assert.match(layout, /\{children\}[\s\S]*<ChatBot \/>[\s\S]*<ScrollToTop \/>/);
  assert.match(chatbot, /open &&/);
  assert.match(chatbot, /width: min\(390px, calc\(100vw - 28px\)\)/);
  assert.doesNotMatch(chatbot, /\.nova-shell\s*\{[^}]*inset:\s*0/);
});

test('no-script contact fallback uses the existing address and does not change the submission controller', () => {
  assert.match(source('app/contact/page.tsx'), /<noscript>[\s\S]*mailto:hello@purplesofthub.com/);
  assert.match(source('components/ContactForm.tsx'), /fetch\("\/api\/contact"/);
  assert.match(source('components/ScrollToTop.tsx'), /behavior: reduced \? 'auto' : 'smooth'/);
});


test('hero artwork preserves the original ellipse geometry, fill and front/back SVG layers', () => {
  const scene = source('components/HeroCosmosScene.tsx');
  const artwork = scene.slice(scene.indexOf('const RING_STROKES'), scene.indexOf('export default function HeroCosmosScene'));
  assert.equal(require('node:crypto').createHash('sha256').update(artwork).digest('hex'), 'b0c3e6eab7c1b4d440591fd3cc6022fb62e378a18a00fdb77ee15a17a9eb6cc1');
  const component = loader({ '@/context/ThemeContext': { useTheme: () => ({ theme: 'dark' }) } })('components/HeroCosmosScene.tsx').default;
  const html = renderToStaticMarkup(React.createElement(component));
  assert.equal((html.match(/<ellipse/g) || []).length, 12);
  assert.equal((html.match(/viewBox="0 0 920 660"/g) || []).length, 2);
  assert.ok(html.indexOf('psh-planet-rings--back') < html.indexOf('class="psh-planet"'));
  assert.ok(html.indexOf('class="psh-planet"') < html.indexOf('psh-planet-rings--front'));
});

test('hero centering is static while the common scene owns floating motion', () => {
  const scene = source('components/HeroCosmosScene.tsx');
  const css = postcss.parse(scene.slice(scene.indexOf('const styles = ')+16, scene.lastIndexOf('`;')));
  const rule = selector => css.nodes.find(node => node.type === 'rule' && node.selector === selector);
  const value = (selector, prop) => rule(selector).nodes.find(node => node.prop === prop)?.value;
  for (const selector of ['.psh-planet', '.psh-planet-rings', '.psh-planet-scene__aura']) {
    assert.equal(value(selector, 'left'), '50%');
    assert.equal(value(selector, 'top'), '50%');
  }
  assert.equal(value('.psh-planet', 'transform'), 'translate(-50%, -50%)');
  assert.equal(value('.psh-planet', 'animation'), undefined);
  assert.match(value('.psh-planet-scene', 'animation'), /^pshPlanetFloat/);
  assert.equal(value('.psh-planet-rings', 'width'), '100%');
  assert.doesNotMatch(scene, /min\(68vw|right: 50%|min-width: 1440px|translateZ\(0\)/);
  assert.match(scene, /\.psh-ring-stroke--dash,[\s\S]*animation: none !important/);
});

test('hero visual is hidden by default and has one continuous desktop visibility threshold', () => {
  const css = postcss.parse(source('app/globals.css'));
  const base = css.nodes.find(node => node.type === 'rule' && node.selector === '.psh-home-hero__visual');
  assert.equal(base.nodes.find(node => node.prop === 'display').value, 'none');
  const desktop = css.nodes.find(node => node.type === 'atrule' && node.name === 'media' && node.params === '(min-width: 1024px)' && node.nodes.some(child => child.selector === '.psh-home-hero__visual'));
  const visual = desktop.nodes.find(node => node.selector === '.psh-home-hero__visual');
  assert.equal(visual.nodes.find(node => node.prop === 'display').value, 'block');
  assert.equal(visual.nodes.some(node => node.prop === 'transform'), false);
  assert.doesNotMatch(source('app/globals.css'), /width: min\(58vw, 900px\)/);
});
