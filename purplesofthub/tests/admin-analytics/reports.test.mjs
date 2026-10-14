import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import {generateKeyPairSync, verify} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),require=createRequire(import.meta.url);
function loader(overrides={}){
 const cache=new Map();
 const load=file=>{if(cache.has(file))return cache.get(file);const loaded={exports:{}};cache.set(file,loaded.exports);
 const code=ts.transpileModule(readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 new Function('require','module','exports',code)(name=>{if(Object.hasOwn(overrides,name))return overrides[name];if(name==='server-only')return {};if(name.endsWith('.module.css'))return {__esModule:true,default:new Proxy({},{get:(_obj,key)=>String(key)})};if(name.startsWith('@/')||name.startsWith('./')){const p=name.startsWith('@/')?name.slice(2):path.join(path.dirname(file),name);return load(p+(existsSync(path.join(root,p+'.ts'))?'.ts':'.tsx'));}return require(name);},loaded,loaded.exports);cache.set(file,loaded.exports);return loaded.exports;};return load;
}
const model=loader()('lib/admin/analytics/model.ts');
const range=model.dateRange({period:'7'},Date.parse('2026-10-14T12:00:00Z'));
const raw=(dimensions,metrics,values=[])=>({dimensionHeaders:dimensions.map(name=>({name})),metricHeaders:metrics.map(name=>({name})),metadata:{timeZone:'UTC'},rows:values.map(([dv,mv])=>({dimensionValues:dv.map(value=>({value})),metricValues:mv.map(value=>({value:String(value)}))}))});
function reports(){const summary=['activeUsers','sessions','screenPageViews','engagementRate'];return [raw([],summary,[[[],[2,3,10,.5]]]),raw([],summary,[[[],[1,2,5,.25]]]),raw(['date'],summary.slice(0,3),[[['20261007'],[2,3,10]]]),raw(['pagePath'],['screenPageViews','activeUsers','engagementRate'],[[['/services'],[6,2,.5]],[['/admin'],[99,1,.2]]]),raw(['sessionDefaultChannelGroup'],['sessions'],[[['Direct'],[3]]]),raw(['country'],['activeUsers'],[[['Nigeria'],[2]]]),raw(['deviceCategory'],['activeUsers'],[[['desktop'],[2]]])];}
test('date ranges are completed UTC days with equal adjacent previous periods',()=>{
 assert.deepEqual(range,{period:'7',start:'2026-10-07',end:'2026-10-13',previousStart:'2026-09-30',previousEnd:'2026-10-06',days:7});
 assert.equal(model.dates(range).length,7);assert.equal(model.exclusiveEnd(range.end),'2026-10-14T00:00:00.000Z');
 for(const input of [{period:'all'},{period:'custom',start:'2026-02-30',end:'2026-03-01'},{period:'custom',start:'2026-01-01',end:'2026-10-13'},{period:'custom',start:'2026-10-14',end:'2026-10-15'}])assert.throws(()=>model.dateRange(input,Date.parse('2026-10-14T12:00:00Z')));
 assert.equal(model.percentChange(20,10),100);assert.equal(model.percentChange(2,0),null);assert.equal(model.percentChange(0,0),null);
});
test('report filters and normalization exclude private paths and sensitive URLs',()=>{
 const ga=loader()('lib/admin/analytics/ga4.ts');
 for(const value of ['/admin','/dashboard','/platform','/sign-in','/auth/callback','/services/account-recovery','/blog/preview','/services/checkout','/blog/article?token=x','/portfolio/project#secret'])assert.equal(model.publicReportPath(value),null,value);
 for(const value of ['/','/services','/services/web-development/pricing','/blog/article'])assert.ok(model.publicReportPath(value),value);
 for(const request of ga.reportRequests(range)){assert.deepEqual(request.dimensionFilter,ga.PUBLIC_DIMENSION_FILTER);assert.equal(request.dimensionFilter.andGroup.expressions[0].filter.fieldName,'hostName');}
 const normalized=ga.normalizeReports(reports(),range);assert.equal(normalized.pages.length,1);assert.equal(normalized.pages[0].share,60);assert.equal(normalized.current.users,2);assert.equal(normalized.trend.length,7);assert.equal(normalized.trend[1].views,0);
});
test('normalization honors response headers, empty reports and data-quality limitations',()=>{
 const ga=loader()('lib/admin/analytics/ga4.ts');
 assert.deepEqual(ga.reportRows(raw([],['sessions','activeUsers'],[[[],[3,2]]]),[],['activeUsers','sessions'])[0].metrics,[2,3]);
 const empty=reports().map(r=>({...r,rows:[]}));assert.equal(ga.normalizeReports(empty,range).current.views,0);
 const limited=reports();limited[2].metadata.subjectToThresholding=true;assert.equal(ga.normalizeReports(limited,range).trend.length,1);
 const invalid=reports();invalid[0].rows[0].metricValues[0].value='invalid';assert.throws(()=>ga.normalizeReports(invalid,range));
 invalid[0].rows=[];invalid[0].metadata.subjectToThresholding=true;assert.throws(()=>ga.normalizeReports(invalid,range));
 assert.throws(()=>ga.normalizeReports([],range));
});
test('missing reporting credentials return disconnected without contacting Google',async()=>{
 const names=['GA4_PROPERTY_ID','GA4_SERVICE_ACCOUNT_EMAIL','GA4_PRIVATE_KEY'],saved=names.map(n=>[n,process.env[n]]),original=globalThis.fetch;
 try{for(const n of names)delete process.env[n];globalThis.fetch=()=>{throw Error('Must not contact Google')};const result=await loader()('lib/admin/analytics/ga4.ts').ga4Report(range);assert.equal(result.status,'disconnected');assert.equal('data' in result,false);}finally{globalThis.fetch=original;for(const [n,v]of saved){if(v===undefined)delete process.env[n];else process.env[n]=v;}}
});
test('Google authentication signs the documented readonly assertion; batches are capped at five',async()=>{
 const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
 const values={GA4_PROPERTY_ID:'123456',GA4_SERVICE_ACCOUNT_EMAIL:'reporter@example.iam.gserviceaccount.com',GA4_PRIVATE_KEY:privateKey.export({type:'pkcs8',format:'pem'}).toString()};
 const saved=Object.keys(values).map(n=>[n,process.env[n]]),original=globalThis.fetch;let calls=0,batches=0,mode='ok';
 try{Object.assign(process.env,values);globalThis.fetch=async(url,init)=>{calls++;assert.equal(init.cache,'no-store');if(url==='https://oauth2.googleapis.com/token'){const assertion=init.body.get('assertion'),[h,p,s]=assertion.split('.');const claims=JSON.parse(Buffer.from(p,'base64url').toString());assert.equal(claims.scope,'https://www.googleapis.com/auth/analytics.readonly');assert.equal(claims.aud,url);assert.equal(claims.exp-claims.iat,3600);assert.equal(verify('RSA-SHA256',Buffer.from(h+'.'+p),publicKey,Buffer.from(s,'base64url')),true);return Response.json({access_token:'test-only-token',expires_in:3600});}if(mode==='timeout')throw Error('timeout with sensitive details');if(mode!=='ok')return new Response('sensitive provider details',{status:Number(mode)});assert.equal(init.headers.Authorization,'Bearer test-only-token');const request=JSON.parse(init.body);assert.ok(request.requests.length<=5);return Response.json({reports:reports().slice(batches++===0?0:5,batches===1?5:7)});};
 const ga=loader()('lib/admin/analytics/ga4.ts');const good=await ga.ga4Report(range);assert.equal(good.status,'connected');assert.equal(calls,3);
 for(const failure of ['403','429','timeout']){mode=failure;const result=await ga.ga4Report(range);assert.equal(result.status,'error');assert.equal(JSON.stringify(result).includes('sensitive'),false);assert.equal('data' in result,false);}
 }finally{globalThis.fetch=original;for(const[n,v]of saved){if(v===undefined)delete process.env[n];else process.env[n]=v;}}
});
function databaseFixture(rows,{fail=false,nullCount=false}={}){
 const reads=[];return {reads,from:table=>{assert.equal(table,'newsletter_subscribers');let filters=[],head=false,first=0,last=Infinity,columns;const q={select(c,options){columns=c;head=options?.head;return this},abortSignal(){return this},eq(k,v){filters.push(r=>r[k]===v);return this},gte(k,v){filters.push(r=>r[k]>=v);return this},lt(k,v){filters.push(r=>r[k]<v);return this},order(){return this},range(a,b){first=a;last=b;return this},then(resolve,reject){reads.push({columns,head});const selected=rows.filter(r=>filters.every(f=>f(r))).sort((a,b)=>a.created_at.localeCompare(b.created_at));return Promise.resolve({error:fail?{message:'private database details'}:null,count:nullCount?null:selected.length,data:head?null:selected.slice(first,last+1).map(r=>({created_at:r.created_at}))}).then(resolve,reject)}};return q;}};
}
test('newsletter counts respect status, UTC boundaries, prior period and never request emails',async()=>{
 const rows=[{created_at:'2026-09-30T00:00:00Z',status:'active'},{created_at:'2026-10-06T23:59:59Z',status:'active'},{created_at:'2026-10-07T00:00:00Z',status:'active'},{created_at:'2026-10-13T23:59:59Z',status:'unsubscribed'},{created_at:'2026-10-14T00:00:00Z',status:'active'}];
 const db=databaseFixture(rows),load=loader({'@/lib/supabase/admin':{createServiceRoleClient:()=>db}});const result=await load('lib/admin/analytics/newsletter.ts').newsletterReport(range);assert.equal(result.status,'connected');assert.deepEqual([result.data.total,result.data.active,result.data.current,result.data.previous],[5,4,2,2]);assert.equal(result.data.trend.reduce((sum,p)=>sum+p.count,0),2);assert.ok(db.reads.every(r=>['id','created_at'].includes(r.columns)));assert.equal(JSON.stringify(result).includes('email'),false);
});
test('newsletter missing credentials and failed/null counts stay unavailable, never fake zero',async()=>{
 for(const db of [null,databaseFixture([],{fail:true}),databaseFixture([],{nullCount:true})]){const result=await loader({'@/lib/supabase/admin':{createServiceRoleClient:()=>db}})('lib/admin/analytics/newsletter.ts').newsletterReport(range);assert.equal(result.status,'error');assert.equal('data'in result,false);}
 const empty=await loader({'@/lib/supabase/admin':{createServiceRoleClient:()=>databaseFixture([])}})('lib/admin/analytics/newsletter.ts').newsletterReport(range);assert.equal(empty.status,'connected');assert.equal(empty.data.total,0);assert.equal(empty.data.trend.length,7);
});
test('large selected periods keep exact counts but refuse unbounded timestamp detail',async()=>{
 const db=databaseFixture(Array.from({length:10001},()=>({created_at:'2026-10-07T00:00:00Z',status:'active'})));const result=await loader({'@/lib/supabase/admin':{createServiceRoleClient:()=>db}})('lib/admin/analytics/newsletter.ts').newsletterReport(range);assert.equal(result.data.current,10001);assert.equal(result.data.trend,null);assert.equal(db.reads.some(r=>!r.head),false);
});
test('cache deduplicates in-flight requests and does not retain thrown failures',async()=>{
 const {ReportCache}=loader()('lib/admin/analytics/cache.ts'),cache=new ReportCache();let calls=0,finish;const load=()=>{calls++;return new Promise(resolve=>{finish=resolve})};const a=cache.get('report',load),b=cache.get('report',load);finish(4);assert.deepEqual(await Promise.all([a,b]),[4,4]);assert.equal(calls,1);await assert.rejects(cache.get('failed',async()=>{throw Error('failure')}));assert.equal(await cache.get('failed',async()=>5),5);
});
test('authorization runs before reporting and before every cache hit; non-admins receive no data',async()=>{
 let role='anonymous',checked=0,calls=0;const service=loader({'@/lib/auth':{requireAdmin:async()=>{checked++;return role==='admin'?{ok:true,userId:'test-admin'}:{ok:false,response:{status:role==='anonymous'?401:403}}}},'./ga4':{ga4Report:async()=>{calls++;return {status:'disconnected',message:'Connection required',updatedAt:new Date().toISOString()}}},'./newsletter':{newsletterReport:async()=>{calls++;return {status:'error',message:'Unavailable',updatedAt:new Date().toISOString()}}}})('lib/admin/analytics/service.ts');
 assert.equal((await service.authorizedAnalytics({})).status,401);role='client';assert.equal((await service.authorizedAnalytics({})).status,403);assert.equal(calls,0);role='admin';assert.equal((await service.authorizedAnalytics({period:'7'})).ok,true);assert.equal((await service.authorizedAnalytics({period:'7'})).ok,true);assert.equal(calls,2);assert.equal(checked,4);role='client';const denied=await service.authorizedAnalytics({period:'7'});assert.equal(denied.status,403);assert.equal('snapshot'in denied,false);role='admin';assert.equal((await service.authorizedAnalytics({period:'bad'})).status,400);
});
test('report API returns private no-store authorization failures without data',async()=>{
 const api=loader({'@/lib/admin/analytics/service':{authorizedAnalytics:async()=>({ok:false,status:401,error:'Authentication required.'})}})('app/api/admin/analytics/route.ts');const response=await api.GET({nextUrl:new URL('http://localhost/api/admin/analytics')});assert.equal(response.status,401);assert.match(response.headers.get('cache-control'),/private, no-store/);assert.deepEqual(await response.json(),{error:'Authentication required.'});
});
test('both server-rendered analytics pages redirect unauthorized and non-admin sessions',async()=>{
 for(const file of ['app/admin/analytics/page.tsx','app/admin/analytics/pages/page.tsx'])for(const status of [401,403]){
  const page=loader({'next/navigation':{redirect:location=>{throw Error('REDIRECT '+location)}},'next/link':()=>null,'@/components/admin/AdminPage':{AdminPage:()=>null},'@/components/admin/analytics/AnalyticsDashboard':()=>{throw Error('Private UI must not render')},'@/lib/admin/analytics/service':{authorizedAnalytics:async()=>({ok:false,status,error:'Denied'})}})(file).default;
  await assert.rejects(page({searchParams:Promise.resolve({})}),new RegExp('REDIRECT '+(status===401?'/sign-in':'/dashboard')));
 }
});
test('Analytics navigation is shared, nested routes stay active and breadcrumbs remain coherent',()=>{
 const nav=loader()('lib/admin-navigation.ts'),items=nav.flattenAdminNavItems(),analytics=items.find(item=>item.id==='analytics');
 assert.equal(items.filter(item=>item.id==='analytics').length,1);assert.equal(analytics.href,'/admin/analytics');assert.equal(nav.isAdminNavItemActive('/admin/analytics/pages',analytics),true);assert.equal(nav.isAdminNavItemActive('/admin/analytics/pages',items.find(item=>item.id==='dashboard')),false);assert.deepEqual(nav.getAdminBreadcrumbs('/admin/analytics/pages').map(item=>item.label),['Dashboard','Analytics','Page performance']);
});
test('disconnected dashboard SSR shows unavailable traffic, real newsletter zeros and no credential values',()=>{
 const React=require('react'),{renderToString}=require('react-dom/server');const Dashboard=loader({'next/link':{__esModule:true,default:({children,...props})=>React.createElement('a',props,children)},'@/components/admin/AdminPageHeader':{AdminPageHeader:({title,description})=>React.createElement('header',null,React.createElement('h1',null,title),React.createElement('p',null,description))},'./TrendChart':{__esModule:true,default:()=>React.createElement('div',{'aria-label':'Verified chart'})}})('components/admin/analytics/AnalyticsDashboard.tsx').default;
 const snapshot={range,traffic:{status:'disconnected',message:'Connect your Google Analytics property to view verified website traffic and audience insights.',updatedAt:'2026-10-14T12:00:00Z'},newsletter:{status:'connected',updatedAt:'2026-10-14T12:00:00Z',data:{total:1,active:1,current:0,previous:0,trend:model.dates(range).map(date=>({date,count:0})),trendMessage:null}}};const html=renderToString(React.createElement(Dashboard,{snapshot,view:'overview'}));assert.match(html,/Analytics connection required/);assert.ok((html.match(/>—</g)||[]).length>=4);assert.match(html,/Today’s signups/);assert.doesNotMatch(html,/PRIVATE KEY|test-only-token|@gmail/);
});
