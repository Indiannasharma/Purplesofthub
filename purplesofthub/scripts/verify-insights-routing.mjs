import assert from 'node:assert/strict';

// Read-only HTTP verification; accepts a local production server or the public origin.
const origin=process.argv[2]||'https://www.purplesofthub.com';
const canonicalOrigin='https://www.purplesofthub.com';
const checks=[];
async function request(path,redirect='manual') {
 for(let attempt=0;attempt<3;attempt++) {
  try {
   const response=await fetch(origin+path,{redirect,signal:AbortSignal.timeout(30000)});
   return {status:response.status,location:response.headers.get('location'),text:await response.text(),url:response.url};
  } catch(error) {
   if(attempt===2)throw error;
   await new Promise(resolve=>setTimeout(resolve,1000));
  }
 }
}
function canonical(html,url) {
 assert.ok(html.includes('<link rel="canonical" href="'+url+'"'),`Missing canonical ${url}`);
 assert.ok(html.includes('<meta property="og:url" content="'+url+'"'),`Missing Open Graph URL ${url}`);
}
async function redirect(path,destination) {
 const response=await request(path);
 assert.equal(response.status,308,path);
 assert.equal(new URL(response.location,origin).pathname+new URL(response.location,origin).search,destination,path);
 checks.push({path,status:response.status,location:destination});
}
await redirect('/blog','/insights');
await redirect('/blog?category=gaming&q=GTA&page=2','/insights?category=gaming&q=GTA&page=2');
await redirect('/blog/feed','/insights/feed');
await redirect('/insights?category=gaming&q=GTA','/insights/category/gaming?q=GTA');
const archive=await request('/insights');
assert.equal(archive.status,200);canonical(archive.text,canonicalOrigin+'/insights');
assert.match(archive.text,/href="\/insights\/category\/gaming"/);
assert.match(archive.text,/href="\/insights\/category\/how-to"/);
assert.match(archive.text,/>Insights<\/a>/);
assert.doesNotMatch(archive.text,/href="\/blog(?:[\/"?])/);
checks.push({path:'/insights',status:200,metadata:true,navigation:true});
const sitemap=await request('/sitemap.xml');assert.equal(sitemap.status,200);
assert.doesNotMatch(sitemap.text,/<loc>[^<]*\/blog/);
const slugs=[...sitemap.text.matchAll(/<loc>https:\/\/www\.purplesofthub\.com\/insights\/([^/<]+)<\/loc>/g)].map(match=>match[1]).filter(slug=>!['rss','feed'].includes(slug));
assert.ok(slugs.length>0,'No real articles in sitemap');
for(const slug of slugs) {
 await redirect('/blog/'+slug,'/insights/'+slug);
 const article=await request('/insights/'+slug);
 assert.equal(article.status,200,slug);canonical(article.text,canonicalOrigin+'/insights/'+slug);
 const data=[...article.text.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(match=>JSON.parse(match[1])).find(item=>item['@type']==='BlogPosting');
 assert.ok(data,'No BlogPosting for '+slug);
 assert.ok(JSON.stringify(data).includes(canonicalOrigin+'/insights/'+slug));
 assert.ok(article.text.includes('name="twitter:card"'));
 checks.push({path:'/insights/'+slug,status:200,canonical:true,blogPosting:true,twitter:true});
}
for(const slug of ['gaming','how-to','technology']) {
 const path='/insights/category/'+slug,response=await request(path);
 assert.equal(response.status,200,path);canonical(response.text,canonicalOrigin+path);
 checks.push({path,status:200,metadata:true});
}
for(const path of ['/insights?q=WhatsApp','/insights/category/technology?q=WhatsApp']) {
 const response=await request(path);assert.equal(response.status,200,path);
 assert.match(response.text,/Search results/);checks.push({path,status:200});
}
const page=await request('/insights/category/gaming?q=GTA&page=999','follow');
assert.equal(page.status,200);assert.equal(new URL(page.url).pathname+new URL(page.url).search,'/insights/category/gaming?q=GTA');
checks.push({pagination:'out-of-range redirect retains category and search'});
for(const path of ['/insights/rss','/insights/feed','/rss.xml','/api/blog/rss']) {
 const feed=await request(path);assert.equal(feed.status,200,path);
 assert.match(feed.text,/<title>PurpleSoftHub Insights<\/title>/);
 assert.match(feed.text,/<link>https:\/\/www.purplesofthub.com\/insights\//);
 assert.doesNotMatch(feed.text,/https:\/\/www\.purplesofthub\.com\/blog/);
 checks.push({path,status:200,canonicalFeed:true});
}
const auth=await request('/api/admin/blog/publish');assert.equal(auth.status,401);
checks.push({path:'/api/admin/blog/publish',status:401,authenticationPreserved:true});
for(const path of ['/insights/category/does-not-exist','/insights/does-not-exist']) {
 const response=await request(path);assert.equal(response.status,404,path);
 checks.push({path,status:404});
}
for(const path of ['/admin/blog','/admin/insights']) {
 const response=await request(path);
 assert.ok([303,307,308].includes(response.status),path);
 assert.equal(new URL(response.location,origin).pathname,'/sign-in');
 checks.push({path,status:response.status,authenticationPreserved:true});
}
console.log(JSON.stringify({origin,articleCount:slugs.length,checks},null,2));
