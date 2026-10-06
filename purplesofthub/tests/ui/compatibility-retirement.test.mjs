import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import postcss from 'postcss';
import { renderSurface } from './fixtures/render-surface.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = file => readFileSync(path.join(root, file), 'utf8');
function files(directory) {
  return readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry => {
    const file = `${directory}/${entry.name}`;
    return entry.isDirectory() ? files(file) : [file];
  });
}
const production = ['app', 'components', 'context', 'hooks', 'lib', 'types', 'public'].flatMap(files)
  .filter(file => /\.(?:[cm]?[jt]sx?|css|json|svg)$/.test(file));

test('production source has no template imports, compatibility tokens or classes', () => {
  const forbidden = /--cmd-|\bcmd-(?:stat-card|table-row|badge|grid-bg|sidebar|nav-item)|TailAdmin|tailadmin|jsvectormap|@react-jvectormap|@fullcalendar|flatpickr|react-dropzone|components\/auth\/(?:SignInForm|SignUpForm)|layout\/(?:AppSidebar|AppHeader|SidebarWidget)|components\/(?:ecommerce|example|form\/input|Maps)\//;
  for (const file of production) assert.doesNotMatch(source(file), forbidden, file);
});

test('removed dependencies and vector declaration remain absent from manifest and lock', () => {
  const manifest = JSON.parse(source('package.json'));
  const lock = JSON.parse(source('package-lock.json'));
  const removed = ['flatpickr', '@fullcalendar/core', '@fullcalendar/daygrid', '@fullcalendar/interaction', '@fullcalendar/list', '@fullcalendar/react', '@fullcalendar/timegrid', '@react-jvectormap/core', '@react-jvectormap/world', 'jsvectormap', 'react-dropzone'];
  for (const name of removed) {
    assert.equal(manifest.dependencies[name], undefined, name);
    assert.equal(lock.packages[`node_modules/${name}`], undefined, name);
  }
  assert.equal(existsSync(path.join(root, 'types/jsvectormap.d.ts')), false);
});

test('template palette is gone while public and shadcn configuration remains owned', () => {
  assert.doesNotMatch(source('tailwind.config.js'), /boxdark|bodydark|strokedark|graydark|\bstroke:|\bmeta:|#1C2434/);
  assert.match(source('tailwind.config.js'), /brand:/);
  assert.match(source('tailwind.config.js'), /outfit:/);
  assert.match(source('components.json'), /tailwind.config.js/);
  for (const file of ['app/globals.css', 'app/styles/workspace-tokens.css', 'app/styles/workspace.css', 'app/styles/command-center.css']) postcss.parse(source(file));
});

test('all fourteen demo entrypoints remain absent', () => {
  for (const file of ['(others-pages)/(chart)/bar-chart', '(others-pages)/(chart)/line-chart', '(others-pages)/(forms)/form-elements', '(others-pages)/(tables)/basic-tables', '(others-pages)/blank', '(others-pages)/calendar', '(others-pages)/profile', ...['alerts', 'avatars', 'badge', 'buttons', 'images', 'modals', 'videos'].map(name => `(ui-elements)/${name}`)]) {
    assert.equal(existsSync(path.join(root, `app/admin/${file}/page.tsx`)), false, file);
  }
});

test('modal owns shared tokens outside either authenticated shell in both themes', () => {
  const modal = source('components/dashboard/ServicePlanModal.tsx');
  assert.match(modal, /import '@\/app\/styles\/workspace-tokens.css'/);
  assert.equal((modal.match(/className="workspace-overlay" style=\{overlayStyle\}/g) || []).length, 2);
  assert.match(source('app/styles/workspace-tokens.css'), /html\.dark \.workspace-overlay/);
  const declarations = source('app/styles/workspace-tokens.css');
  for (const name of modal.match(/--cc-[\w-]+/g) || []) assert.ok(declarations.includes(`${name}:`), name);
});

test('modal changes consist exclusively of token substitutions, CSS imports and scope classes', () => {
  let original = source('components/dashboard/ServicePlanModal.tsx')
    .replace("import '@/app/styles/workspace-tokens.css'\nimport '@/app/styles/workspace.css'\n\n", '')
    .replaceAll(' className="workspace-overlay"', '')
    .replace(' className="max-sm:max-w-[calc(100%_-_32px)]"', '');
  for (const [current, previous] of [['--cc-text-secondary', '--cmd-body'], ['--cc-text-muted', '--cmd-muted'], ['--cc-surface', '--cmd-card'], ['--cc-text', '--cmd-heading']]) original = original.replaceAll(current, previous);
  assert.equal(createHash('sha256').update(original).digest('hex'), 'dad69c173332c45ae111482e10e6cf604e79ff983d3e89b0bdbbd82dedee0eec');
});

test('local fixture uses actual modules with transport blocked and has no production entrypoint', () => {
  const guide = renderSurface('app/dashboard/connect-meta/page.tsx');
  assert.match(guide, /Connect Meta Account/);
  assert.match(guide, /var\(--cc-surface\)/);
  const services = renderSurface('lib/payments/service-plans.ts', {}, {}, '__data').SERVICES;
  const modal = renderSurface('components/dashboard/ServicePlanModal.tsx', {}, { service: services[0], onClose() {} });
  assert.match(modal, /workspace-overlay/);
  assert.match(modal, /Choose Your Plan/);
  assert.match(modal, /Close service plans/);
  assert.throws(() => renderSurface('components/dashboard/ServicePlanModal.tsx', { 0: services[0].plans[0] }, { service: services[0], onClose() {} }), /Request transport is forbidden/);
  for (const file of production.filter(file => /\.[jt]sx?$/.test(file))) assert.doesNotMatch(source(file), /tests\/ui\/fixtures|render-surface|renderSurface\(/, file);
});

function canonical(node) {
  if (ts.isAsExpression(node) || ts.isNonNullExpression(node)) return canonical(node.expression);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return ['text', node.text];
  if (ts.isIdentifier(node)) return ['name', node.text];
  const children = [];
  ts.forEachChild(node, child => { if (!ts.isTypeNode(child)) children.push(canonical(child)); });
  return [ts.SyntaxKind[node.kind], children];
}
function businessTree(node) {
  if (ts.isTypeNode(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) return null;
  if (ts.isImportDeclaration(node) && node.moduleSpecifier.text.endsWith('.css')) return null;
  if (ts.isJsxAttribute(node) && ['style', 'className'].includes(node.name.getText())) return null;
  if (ts.isVariableStatement(node) && node.declarationList.declarations.every(declaration => /Style$/.test(declaration.name.getText()))) return null;
  if (ts.isVariableDeclaration(node) && /Style$/.test(node.name.getText())) return null;
  if (ts.isAsExpression(node) || ts.isNonNullExpression(node)) return businessTree(node.expression);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    let text = node.text;
    for (const [previous, current] of [['--cmd-heading', '--cc-text'], ['--cmd-body', '--cc-text-secondary'], ['--cmd-muted', '--cc-text-muted'], ['--cmd-card', '--cc-surface'], ['--cmd-border', '--cc-border']]) text = text.replaceAll(previous, current);
    return ['text', text];
  }
  if (ts.isIdentifier(node)) return ['name', node.text];
  const children = [];
  ts.forEachChild(node, child => { const value = businessTree(child); if (value !== null) children.push(value); });
  return [ts.SyntaxKind[node.kind], children];
}
// Reverse only the explicitly authorized lint edits before comparing with the
// original controller fingerprint. Requests and every other expression remain checked.
function beforeAuthorizedLint(file, text) {
  text = text.replaceAll('\r\n', '\n');
  if (file === 'app/dashboard/music/page.tsx' || file === 'app/dashboard/settings/page.tsx') {
    text = text.replace(/import type \{ User \} from ['"]@supabase\/supabase-js['"];?\n/, '');
  }
  if (file === 'app/dashboard/files/page.tsx') {
    text = text.replaceAll(/catch \(caught: unknown\) \{\n\s*const error = caught as \{ message\?: string \} \| null \| undefined;/g, 'catch (error: any) {');
  }
  if (file === 'app/dashboard/music/page.tsx') {
    text = text.replace('void Promise.resolve().then(() => {\n        setSubmitPlan(targetPlan);\n        setSubmitPlanType(targetType);\n        setSubmitFormOpen(true);\n      });', 'setSubmitPlan(targetPlan);\n      setSubmitPlanType(targetType);\n      setSubmitFormOpen(true);');
  }
  const loader = {
    'app/dashboard/ads/page.tsx': 'loadData',
    'app/dashboard/recovery/page.tsx': 'loadRequests',
    'app/dashboard/settings/page.tsx': 'loadUser',
  }[file];
  if (loader) {
    const pattern = new RegExp('  useEffect\\(\\(\\) => \\{\\n    void Promise.resolve\\(\\).then\\(\\(\\) => \\{ '+loader+'\\(\\) \\}\\)\\n  \\}, \\[\\]\\)');
    assert.match(text, pattern, file);
    text = text.replace(pattern, '');
    text = text.replace('  const '+loader+' = async () => {', '  useEffect(() => {\n    '+loader+'()\n  }, [])\n\n  const '+loader+' = async () => {');
  }
  return text;
}
for (const [file, expected] of Object.entries(JSON.parse(source('tests/ui/fixtures/compatibility-business-fingerprints.json')))) {
  test(`${file}: complete non-presentation logic remains identical`, () => {
    const ast = ts.createSourceFile('page.tsx', beforeAuthorizedLint(file, source(file)), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    assert.equal(createHash('sha256').update(JSON.stringify(businessTree(ast))).digest('hex'), expected);
  });
}
function contracts(text) {
  const ast = ts.createSourceFile('page.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const calls = [];
  function visit(node) {
    if (ts.isCallExpression(node) && /^(?:fetch|JSON\.stringify|.*\.(?:from|select|eq|not|order|limit|single|insert|update|upsert|delete|append|signOut|getUser|updateUser|toLocaleString|toFixed))$/.test(node.expression.getText(ast))) calls.push(canonical(node));
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return calls;
}
for (const [file, expected] of Object.entries(JSON.parse(source('tests/ui/fixtures/compatibility-request-contracts.json')))) {
  test(`${file}: original requests, payloads, filters and financial display survive`, () => {
    assert.deepEqual(contracts(source(file)), expected);
  });
}
