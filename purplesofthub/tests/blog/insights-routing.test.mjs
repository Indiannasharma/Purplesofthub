import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import config from '../../next.config.mjs';
import {articlePath,categoryPath,archivePath} from '../../lib/blog/urls.ts';
import {eligiblePage,pagePayload} from '../../lib/analytics/policy.ts';

const require=createRequire(import.meta.url),root=path.resolve(import.meta.dirname,'../..');
function loader(overrides={}) {
 const cache=new Map();
 function load(file) {
  if(cache.has(file))return cache.get(file);
  const loaded={exports:{}};cache.set(file,loaded.exports);
  const local=name=>{
   if(Object.hasOwn(overrides,name))return overrides[name];
   if(name.endsWith('.css'))return {__esModule:true,default:{}};
   if(name.startsWith('@/')||name.startsWith('.')) {
    const base=name.startsWith('@/')?name.slice(2):path.join(path.dirname(file),name);
    return load(existsSync(path.join(root,base+'.ts'))?base+'.ts':base+'.tsx');
   }
   return require(name);
  };
  const code=ts.transpileModule(readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
  new Function('require','module','exports',code)(local,loaded,loaded.exports);
  cache.set(file,loaded.exports);return loaded.exports;
 }
 return load;
}
const {newsletterEligible}=loader()('lib/newsletter/policy.ts');
const Link=({href,children,...props})=>React.createElement('a',{href,...props},children);
const categories=[{name:'Gaming',slug:'gaming'},{name:'Technology',slug:'technology'}];
test('permanent redirects cover legacy public paths; CMS alias preserves original endpoints',async()=>{
 assert.deepEqual(await config.redirects(),[{source:'/blog/:path*',destination:'/insights/:path*',permanent:true}]);
 assert.deepEqual(await config.rewrites(),[{source:'/admin/insights/:path*',destination:'/admin/blog/:path*'}]);
});
test('canonical URL builders retain search and pagination and encode path/query values',()=>{
 assert.equal(articlePath('existing-slug'),'/insights/existing-slug');
 assert.equal(categoryPath('how-to'),'/insights/category/how-to');
 assert.equal(archivePath({category:'gaming',search:'GTA & VI',page:2}),'/insights/category/gaming?q=GTA+%26+VI&page=2');
 assert.equal(archivePath({page:1}),'/insights');
 assert.equal(articlePath('a/b'),'/insights/a%2Fb');
});
test('masthead links and search submit directly to the selected category',()=>{
 const Masthead=loader({'next/link':{__esModule:true,default:Link}})('components/blog/PublicationMasthead.tsx').default;
 const html=renderToStaticMarkup(React.createElement(Masthead,{categories,category:'gaming',search:'GTA'}));
 assert.match(html,/action="\/insights\/category\/gaming"/);
 assert.match(html,/href="\/insights\/category\/technology\?q=GTA"/);
 assert.doesNotMatch(html,/name="category"|href="\/blog/);
});
function archive(overrides={}) {
 const calls=[];
 const stop=kind=>url=>{throw Object.assign(new Error(kind),{kind,url});};
 const component={__esModule:true,default:()=>null};
 const feed={publicBlogCategories:async()=>categories,publishedArticles:async options=>{calls.push(options);return {ok:true,posts:[],total:0};}};
 const load=loader({
  'next/link':{__esModule:true,default:Link},
  'next/navigation':{notFound:stop('404'),permanentRedirect:stop('308'),redirect:stop('307')},
  '@/components/Navbar':component,'@/components/Footer':component,
  '@/components/blog/StoryCard':component,'@/components/blog/AdSlot':component,'@/components/blog/EditorialSidebar':component,
  '@/lib/blog/public-feed':{...feed,...overrides},'@/lib/blog/newsletter':{newsletterAvailable:async()=>false},
 });
 return {Archive:load('components/blog/InsightsArchive.tsx').default,calls};
}
test('legacy category query redirects to canonical category retaining search/page',async()=>{
 const {Archive,calls}=archive();
 await assert.rejects(Archive({searchParams:Promise.resolve({category:'Gaming',q:'GTA',page:'3'})}),error=>error.kind==='308'&&error.url==='/insights/category/gaming?q=GTA&page=3');
 assert.equal(calls.length,0);
});
test('category path is authoritative and filters by database category name',async()=>{
 const {Archive,calls}=archive();
 const page=await Archive({categorySlug:'gaming',searchParams:Promise.resolve({category:'Technology'})});
 assert.equal(calls[0].category,'Gaming');
 assert.match(renderToStaticMarkup(page),/Gaming stories are on the way/);
});
test('unknown category is 404; out-of-range category page keeps its search',async()=>{
 const {Archive}=archive();
 await assert.rejects(Archive({categorySlug:'missing',searchParams:Promise.resolve({})}),error=>error.kind==='404');
 const paged=archive({publishedArticles:async()=>({ok:true,posts:[],total:14})});
 await assert.rejects(paged.Archive({categorySlug:'gaming',searchParams:Promise.resolve({page:'9',q:'GTA'})}),error=>error.kind==='307'&&error.url==='/insights/category/gaming?q=GTA&page=2');
});
test('sitemap uses real published records, dates and category pages across multiple result pages',async()=>{
 const calls=[];
 const sitemap=loader({'@/app/portfolio/_data/portfolio':{PORTFOLIO_PROJECTS:[]},'@/lib/blog/public-feed':{
  publicBlogCategories:async()=>categories,
  publishedArticles:async options=>{calls.push(options);return {ok:true,total:13,posts:options.page===2?[{slug:'second-page',published_at:'2026-10-15T00:00:00Z'}]:[{slug:'existing',published_at:'2026-10-01T00:00:00Z'}]};},
 }})('app/sitemap.ts').default;
 const entries=await sitemap();
 assert.equal(calls.length,2);
 assert.ok(entries.some(item=>item.url==='https://www.purplesofthub.com/insights/second-page'));
 assert.ok(entries.some(item=>item.url.endsWith('/insights/category/gaming')));
 assert.equal(entries.find(item=>item.url.endsWith('/insights/existing')).lastModified,'2026-10-01T00:00:00Z');
 assert.ok(entries.every(item=>!item.url.includes('/blog')));
});
test('RSS and legacy feed aliases share Insights canonical URLs',async()=>{
 const query={select(){return this},eq(){return this},order(){return this},limit:async()=>({data:[{slug:'existing',title:'A story',published_at:'2026-10-15T00:00:00Z'}]})};
 const load=loader({'@supabase/supabase-js':{createClient:()=>({from:()=>query})}});
 const get=load('app/insights/rss/route.ts').GET;
 const response=await get(),xml=await response.text();
 assert.equal(response.status,200);
 assert.match(xml,/<link>https:\/\/www.purplesofthub.com\/insights\/existing<\/link>/);
 assert.match(xml,/href="https:\/\/www.purplesofthub.com\/insights\/rss" rel="self"/);
 for(const file of ['app/rss.xml/route.ts','app/api/blog/rss/route.ts','app/insights/feed/route.ts'])assert.equal(load(file).GET,get);
});
test('Insights analytics and newsletter recognize public pages while keeping private views excluded',()=>{
 const {PUBLIC_PATH_PATTERN}=loader()('lib/admin/analytics/model.ts');
 for(const url of ['/insights','/insights/existing','/insights/category/how-to']) {
  assert.match(url,new RegExp(PUBLIC_PATH_PATTERN));
  assert.equal(eligiblePage(url),url);assert.equal(newsletterEligible(url),true);
  assert.equal(pagePayload(url,'').page_title,'PurpleSoftHub — Insights');
  assert.equal(newsletterEligible(url,'?token=private'),false);
 }
 for(const url of ['/admin/insights','/api/admin/blog/publish','/insights/category/gaming/preview']) {
  assert.equal(eligiblePage(url),null);assert.equal(newsletterEligible(url),false);
 }
});
