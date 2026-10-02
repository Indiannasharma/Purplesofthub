import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import postcss from 'postcss';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const source=file=>readFileSync(path.join(root,file),'utf8');
const packageRequire=createRequire(path.join(root,'package.json'));
const cache=new Map();
function load(file){
 const filename=path.resolve(root,file);
 if(cache.has(filename))return cache.get(filename).exports;
 const loaded={exports:{}};cache.set(filename,loaded);
 const compiled=ts.transpileModule(source(file),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 const localRequire=name=>{
  if(name.endsWith('.css'))return {};
  if(!name.startsWith('@/')&&!name.startsWith('.'))return packageRequire(name);
  const target=name.startsWith('@/')?path.join(root,name.slice(2)):path.resolve(path.dirname(filename),name);
  const resolved=[target,target+'.ts',target+'.tsx'].find(f=>existsSync(f)&&statSync(f).isFile());
  assert.ok(resolved,'Local module resolves: '+name);
  return load(path.relative(root,resolved));
 };
 new Function('require','module','exports',compiled)(localRequire,loaded,loaded.exports);
 return loaded.exports;
}
function canonical(node,ast){
 if(ts.isAsExpression(node)||ts.isNonNullExpression(node)||ts.isParenthesizedExpression(node))return canonical(node.expression,ast);
 if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)&&['returns','then','catch','finally'].includes(node.expression.name.text))return canonical(node.expression.expression,ast);
 if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node))return ['text',node.text];
 if(ts.isIdentifier(node))return ['name',node.text];
 if(ts.isNumericLiteral(node))return ['number',node.text];
 const children=[];ts.forEachChild(node,n=>{if(!ts.isTypeNode(n))children.push(canonical(n,ast));});
 return [ts.SyntaxKind[node.kind],children];
}
function requests(text){
 const ast=ts.createSourceFile('page.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),result=[];
 function visit(n){
  if(ts.isCallExpression(n)){
   const text=n.getText(ast),parent=n.parent;
   const chained=ts.isPropertyAccessExpression(parent)&&ts.isCallExpression(parent.parent);
   if(!chained&&(/^supabase\s*\./.test(text)&&text.includes('.from(')||/^supabase\.auth\./.test(text)||n.expression.getText(ast)==='fetch')){
    result.push(canonical(n,ast));return;
   }
  }
  ts.forEachChild(n,visit);
 }
 visit(ast);return result;
}
const contracts=JSON.parse(source('tests/workspace/fixtures/admin-sprint-request-contracts.json'));
for(const [file,expected]of Object.entries(contracts))test('Preserved request contract: '+file,()=>{
 assert.ok(expected.length,'The baseline includes actual transport calls');
 assert.deepEqual(requests(source(file)),expected,'Tables, filters, ordering, URLs, payloads, amounts and send calls stay intact');
});
const {WorkspaceCheckbox}=load('components/workspace/checkbox.tsx');
test('Native controlled checkbox emits booleans and preserves disabled/label/checked state',()=>{
 const values=[];
 const element=WorkspaceCheckbox({id:'consent',label:'Consent',checked:false,onChange:value=>values.push(value)});
 const input=element.props.children[0].props.children[0];
 input.props.onChange({target:{checked:true}});input.props.onChange({target:{checked:false}});
 assert.deepEqual(values,[true,false]);
 const unchecked=renderToStaticMarkup(React.createElement(WorkspaceCheckbox,{id:'disabled',label:'Disabled',checked:false,disabled:true,onChange:()=>{}}));
 assert.match(unchecked,/<label/);assert.match(unchecked,/type="checkbox"/);assert.match(unchecked,/disabled=""/);assert.doesNotMatch(unchecked,/lucide-check/);
 const checked=renderToStaticMarkup(React.createElement(WorkspaceCheckbox,{label:'Checked',checked:true,disabled:true,onChange:()=>{}}));
 assert.match(checked,/checked=""/);assert.match(checked,/lucide-check/);
});
const {AdminProjectRecords,AdminInvoiceRecords}=load('components/admin/operational-records.tsx');
test('Project mobile records preserve all fields and genuine 0/100 progress',()=>{
 for(const progress of [0,100]){
  const row={id:'project-1',title:'Recorded long project',client_name:'Client',service:'Development',status:'in_progress',progress,due_date:'2026-11-01'};
  const table=AdminProjectRecords({rows:[row]});
  const html=renderToStaticMarkup(table.props.mobileCard(row));
  for(const field of ['Client','Development','Progress','Due',progress+'%','in progress'])assert.ok(html.includes(field),field);
  assert.equal(table.props.columns.length,6);
  assert.match(html,/\/admin\/projects\/project-1/);
 }
});
test('Invoice desktop and mobile use native recorded currencies without invented invoice routes',()=>{
 for(const currency of ['NGN','USD',null]){
  const row={id:'invoice-1',invoice_number:null,client_name:'Client',client_email:'customer@example.test',amount:0,currency,status:'paid',due_date:null};
  const table=AdminInvoiceRecords({rows:[row]});
  const mobile=renderToStaticMarkup(table.props.mobileCard(row));
  const amount=table.props.columns.find(column=>column.accessorKey==='amount').cell({row:{original:row}});
  assert.ok(mobile.includes(amount));assert.ok(mobile.includes('customer@example.test'));
  assert.ok(mobile.includes(currency||'Currency unavailable'));
  assert.doesNotMatch(mobile,/href=/);
  assert.equal(table.props.columns[0].accessorFn(row),'#invoice-1');
 }
});
test('Settings retains operational profile and password controls alongside honest previews',()=>{
 const text=source('app/admin/settings/page.tsx');
 assert.match(text,/onClick=\{saveProfile\}/);assert.match(text,/onClick=\{changePassword\}/);
 assert.match(text,/Agency fields are a preview/);assert.match(text,/Preview only · not saved/);
 assert.doesNotMatch(text,/Agency settings saved|Notification preferences saved/);
});
test('Removed demo entrypoints have no production navigation links',()=>{
 const demos=['bar-chart','line-chart','form-elements','basic-tables','blank','calendar','profile','alerts','avatars','badge','buttons','images','modals','videos'];
 const nav=source('lib/admin-navigation.ts');
 for(const route of demos)assert.ok(!nav.includes('"/admin/'+route+'"'));
 assert.match(source('app/design/command-center/layout.tsx'),/DESIGN_PREVIEW_ENABLED/);
 assert.doesNotMatch(source('app/admin/ads/page.tsx'),/\/admin\/campaigns\/new/);
 assert.doesNotMatch(source('app/admin/services/page.tsx'),/\/admin\/services\/edit\//);
});
test('Scoped sprint CSS parses and customer bodies retain their existing scope',()=>{
 for(const file of ['app/styles/admin-sprint.css','app/styles/workspace-checkbox.css','app/styles/customer-workspace.css'])assert.doesNotThrow(()=>postcss.parse(source(file),{from:file}));
 assert.match(source('app/styles/admin-sprint.css'),/admin-grid-record/);
 assert.match(source('app/styles/customer-workspace.css'),/focus-visible/);
});
