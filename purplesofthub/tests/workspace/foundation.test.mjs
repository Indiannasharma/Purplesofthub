import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import postcss from 'postcss'
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
    if (!name.startsWith('@/') && !name.startsWith('.')) return packageRequire(name)
    const target = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(filename), name)
    const resolved = [target, target + '.ts', target + '.tsx'].find(candidate => existsSync(candidate))
    assert.ok(resolved, 'Local source import resolves: ' + name)
    return loadSource(path.relative(root, resolved))
  }
  new Function('require', 'module', 'exports', compiled)(localRequire, loaded, loaded.exports)
  return loaded.exports
}
const { customerNavigation, customerAdvertisingLinks, isCustomerNavItemActive } = loadSource('lib/customer-navigation.ts')
const { flattenAdminNavItems, getAdminBreadcrumbs, isAdminNavItemActive } = loadSource('lib/admin-navigation.ts')
const { WorkspaceField } = loadSource('components/workspace/field.tsx')
const { AdminField } = loadSource('components/admin/AdminField.tsx')
const renderField = props => renderToStaticMarkup(React.createElement(WorkspaceField, props, React.createElement('input', { 'aria-describedby': 'existing-help', disabled: true, defaultValue: 'retained' })))

test('field label, help and error reference the actual control while retaining caller props', () => {
  const html = renderField({ id: 'name', label: 'Name', description: 'Help', error: 'Required' })
  assert.match(html, /for="name"/)
  assert.match(html, /id="name-description"/)
  assert.match(html, /id="name-error" role="alert"/)
  assert.match(html, /aria-describedby="existing-help name-description name-error"/)
  assert.match(html, /aria-invalid="true"/)
  assert.match(html, /disabled=""/)
  assert.match(html, /value="retained"/)
})
test('optional help and error never leave dangling accessible references', () => {
  const html = renderField({ id: 'name', label: 'Name' })
  assert.match(html, /aria-describedby="existing-help"/)
  assert.doesNotMatch(html, /name-description|name-error|aria-invalid/)
})
test('field slots support nested controls with explicit accessible relationships', () => {
  const html = renderToStaticMarkup(React.createElement(WorkspaceField, { id: 'nested', label: 'Nested', description: 'Help' }, props => React.createElement('div', null, React.createElement('textarea', props))))
  assert.match(html, /<textarea id="nested" aria-describedby="nested-description"/)
})
test('existing Admin field imports receive the shared accessible behavior', () => {
  assert.equal(AdminField, WorkspaceField)
})
test('all prepared internal destinations are real pages, with no invented operations', () => {
  const items = [...customerNavigation, ...customerAdvertisingLinks, ...flattenAdminNavItems()]
  for (const item of items) {
    if (item.href.startsWith('https:')) {
      assert.equal(new URL(item.href).hostname, 'wa.me')
    } else {
      assert.ok(existsSync(path.join(root, 'app', item.href, 'page.tsx')), item.href)
    }
  }
  assert.equal(customerNavigation.find(item => item.id === 'academy').destination, 'public')
  assert.equal(flattenAdminNavItems().find(item => item.id === 'academy').badge, 'Public')
  assert.equal(flattenAdminNavItems().find(item => item.id === 'promotions').badge, 'Pending')
})
test('customer active matching respects nested routes and segment boundaries', () => {
  const projects = customerNavigation.find(item => item.id === 'projects')
  const overview = customerNavigation.find(item => item.id === 'overview')
  assert.equal(isCustomerNavItemActive('/dashboard/projects/123/?view=files#top', projects), true)
  assert.equal(isCustomerNavItemActive('/dashboard/projects-old', projects), false)
  assert.equal(isCustomerNavItemActive('/dashboard/projects', overview), false)
  assert.equal(isCustomerNavItemActive('/dashboard/', overview), true)
  assert.equal(isCustomerNavItemActive('/dashboard', customerNavigation.find(item => item.id === 'support')), false)
})
test('Admin active matching and entity breadcrumb behavior survive navigation regrouping', () => {
  const projects = flattenAdminNavItems().find(item => item.id === 'projects')
  assert.equal(isAdminNavItemActive('/admin/projects/new?tab=all', projects), true)
  assert.equal(isAdminNavItemActive('/admin/projects-old', projects), false)
  assert.deepEqual(getAdminBreadcrumbs('/admin/projects/new'), [{ label: 'Dashboard', href: '/admin' }, { label: 'Projects', href: '/admin/projects' }, { label: 'New' }])
  assert.deepEqual(getAdminBreadcrumbs('/admin/projects/private-uuid'), [{ label: 'Dashboard', href: '/admin' }, { label: 'Projects', href: '/admin/projects' }])
})

test('portalled content receives complete tokens in both themes outside the workspace root', () => {
  const css = postcss.parse(readFileSync(path.join(root, 'app/styles/workspace-tokens.css'), 'utf8'))
  for (const [selector, surface] of [['.workspace-overlay', '#ffffff'], ['html.dark .workspace-overlay', '#14101e']]) {
    const rule = css.nodes.find(node => node.type === 'rule' && node.selector.split(',').map(value => value.trim()).includes(selector))
    assert.ok(rule, 'Explicit portal token owner: ' + selector)
    assert.equal(rule.nodes.find(node => node.prop === '--cc-surface').value, surface)
    assert.ok(rule.nodes.some(node => node.prop === '--cc-text'))
    assert.ok(rule.nodes.some(node => node.prop === '--cc-accent'))
  }
})
