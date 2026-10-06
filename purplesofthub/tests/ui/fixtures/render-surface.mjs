// Test-only rendering of the actual page modules. No effects or request transport run.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const require = createRequire(path.join(root, 'package.json'));
const blocked = () => { throw new Error('Request transport is forbidden in compatibility fixtures'); };

export function renderSurface(file, states = {}, props = {}, exportName = 'default', sources = {}) {
  const cache = new Map();
  let stateIndex = 0;
  const hooks = {
    ...React,
    useState(initial) {
      const index = stateIndex++;
      const value = Object.hasOwn(states, index) ? states[index] : typeof initial === 'function' ? initial() : initial;
      return [value, blocked];
    },
    useEffect() {},
    useCallback: callback => callback,
    useMemo: callback => callback(),
    useRef: initial => ({ current: initial }),
    use: value => value,
  };
  function load(relative) {
    const filename = path.join(root, relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const loaded = { exports: {} };
    cache.set(filename, loaded);
    const code = ts.transpileModule(sources[relative] ?? readFileSync(filename, 'utf8'), {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText;
    function local(name) {
      if (name.endsWith('.css')) return {};
      if (name === 'react') return relative === file ? hooks : React;
      if (name === 'next/navigation') return { useRouter: () => ({ push: blocked, refresh: blocked }), usePathname: () => '/fixture' };
      if (name === '@/lib/supabase/client') return { createClient: () => ({ auth: { getUser: blocked }, from: blocked }) };
      if (name === '@/context/CurrencyContext') return { useCurrency: () => ({ currency: 'NGN', setCurrency: blocked }) };
      if (name === '@/components/command-center/fonts') return { ccFontVariables: '' };
      if (/CheckoutModal$|MusicSubmitForm$/.test(name)) return { __esModule: true, default: blocked };
      if (!name.startsWith('@/') && !name.startsWith('.')) return require(name);
      const target = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(filename), name);
      const resolved = [target, `${target}.ts`, `${target}.tsx`].find(candidate => existsSync(candidate) && statSync(candidate).isFile());
      if (!resolved) throw new Error(`Unresolved fixture module: ${name}`);
      return load(path.relative(root, resolved));
    }
    new Function('require', 'module', 'exports', 'fetch', code)(local, loaded, loaded.exports, blocked);
    return loaded.exports;
  }
  if (exportName === '__data') return load(file);
  const component = load(file)[exportName];
  return renderToStaticMarkup(component(props));
}
