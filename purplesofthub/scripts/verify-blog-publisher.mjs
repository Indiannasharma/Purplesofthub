// Controlled release check. Creates one disposable article and removes it.
// Run with an existing admin token. Production requires --allow-production.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const site = process.env.PURPLESOFTHUB_BLOG_URL || 'https://www.purplesofthub.com'
if (!['localhost', '127.0.0.1'].includes(new URL(site).hostname) && !process.argv.includes('--allow-production'))
  throw new Error('Use a local test server or explicitly pass --allow-production for a disposable public release check.')
const token = process.env.PURPLESOFTHUB_BLOG_ACCESS_TOKEN
if (!token) throw new Error('An existing admin access token is required.')
const nonce = randomUUID()
const work = await fs.mkdtemp(path.join(os.tmpdir(), 'purplesofthub-blog-test-'))
const articleFile = path.join(work, 'article.json')
const imageFile = path.join(work, 'featured.png')
const title = 'Publishing verification ' + nonce
const alt = 'A single pixel used to verify the blog image upload workflow.'
const excerpt = 'A disposable automated check of the PurpleSoftHub blog publishing workflow.'
const article = { title, content: '## Publishing verification\n\nThis disposable article is removed immediately after the release check.\n\n- One\n- Two\n\n### Formatting\n\n**Bold** and _emphasis_ with a [source](https://www.purplesofthub.com/about).', excerpt,
  featured_image_alt: alt, category: 'technology', tags: ['verification'], source_urls: ['https://www.purplesofthub.com/about'] }
await fs.writeFile(articleFile, JSON.stringify(article))
await fs.writeFile(imageFile, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jB7sAAAAASUVORK5CYII=', 'base64'))
let id; let uploadedUrl; let stage = 'authorization'
async function call(payload, extra = {}) {
  const response = await fetch(new URL('/api/admin/blog/publish', site), { method: 'POST', headers: { 'Content-Type':'application/json', Authorization:'Bearer '+token, ...extra }, body: JSON.stringify(payload) })
  return { status: response.status, data: await response.json() }
}
function cli(extra) {
  const environment = { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, TEMP: process.env.TEMP,
    PURPLESOFTHUB_BLOG_ACCESS_TOKEN: token, PURPLESOFTHUB_BLOG_URL: site }
  const result = spawnSync(process.execPath, ['scripts/publish-blog.mjs', articleFile, ...extra], { cwd:process.cwd(), env:environment, encoding:'utf8', timeout:90000 })
  if (result.status !== 0) throw new Error('The one-command CLI failed. ' + result.stderr)
  return JSON.parse(result.stdout)
}
try {
  const unauthorized = await fetch(new URL('/api/admin/blog/publish',site), { method:'POST', headers:{'Content-Type':'application/json'},body:JSON.stringify({title}) })
  assert.ok([401,403].includes(unauthorized.status))
  assert.equal((await call({ title }, { Authorization:'Bearer not-a-valid-token' })).status,401)
  const crossOrigin = await fetch(new URL('/api/admin/blog/publish',site),{method:'POST',headers:{Origin:'https://untrusted.example','Content-Type':'application/json'},body:JSON.stringify({title})})
  assert.equal(crossOrigin.status,403)
  console.log('AUTHORIZATION: PASS')
  stage = 'draft creation and Cloudinary image'
  const created = cli(['--image',imageFile]); id=created.id; uploadedUrl=created.featured_image
  assert.equal(created.status,'draft'); assert.equal(created.author,'PurpleSoftHub')
  const read = await fetch(new URL('/api/admin/blog/publish?id='+id,site),{headers:{Authorization:'Bearer '+token}})
  assert.equal(read.status,200); let post=(await read.json()).post; uploadedUrl=post.featured_image
  assert.equal(post.slug,title.toLowerCase().replaceAll(' ','-')); assert.equal(post.published_at,null)
  assert.equal(post.author_name,'PurpleSoftHub'); assert.equal(post.author_type,'Organization'); assert.equal(post.author_id,null)
  assert.equal(post.featured_image_alt,alt); assert.ok(uploadedUrl.startsWith('https://res.cloudinary.com/'))
  assert.ok(new URL(uploadedUrl).pathname.includes('/purplesofthub/blog/')); assert.equal((await fetch(uploadedUrl,{method:'HEAD'})).status,200)
  assert.equal(post.category,'Technology'); assert.equal(post.seo_title,title); assert.equal(post.seo_description,excerpt)
  assert.equal((await fetch(new URL('/blog/'+post.slug,site))).status,404)
  console.log('CREATE DRAFT / AUTOMATIC SLUG / DEFAULT AUTHOR / CLOUDINARY / ALT / SEO: PASS')
  stage='draft update and validation'
  const revised='## Updated draft\n\nA verified paragraph with **bold** and _emphasis_.\n\n### Details\n\n1. First\n2. Second\n\n<script>window.__blogVerificationInjected=true</script>\n\n[Unsafe](javascript:alert(1))'
  let updated=await call({operation:'update',id,content:revised,expected_updated_at:post.updated_at})
  assert.equal(updated.status,200); assert.equal(updated.data.post.id,id); assert.equal(updated.data.post.status,'draft'); post=updated.data.post
  if(process.env.PURPLESOFTHUB_BLOG_COOKIE) {
    const human=await fetch(new URL('/api/admin/blog/publish',site),{method:'POST',headers:{Cookie:process.env.PURPLESOFTHUB_BLOG_COOKIE,Origin:new URL(site).origin,'Content-Type':'application/json'},body:JSON.stringify({operation:'update',id,tags:['verification','human-form']})})
    assert.equal(human.status,200); post=(await human.json()).post
    console.log('ADMIN FORM COOKIE WORKFLOW: PASS')
  }
  assert.equal((await call({operation:'update',id,expected_updated_at:'2000-01-01T00:00:00Z',title:'Stale'})).status,409)
  assert.equal((await call({...article,status:'published',featured_image:'http://insecure.example/test.png'})).status,422)
  assert.equal((await call({title:'Bad enum '+nonce,status:['published']})).status,422)
  const duplicate=await call(article); assert.equal(duplicate.status,409); assert.equal(duplicate.data.existing.id,id)
  console.log('UPDATE DRAFT / VALIDATION / STALE UPDATE / DUPLICATE PROTECTION: PASS')
  stage='publish and rendering'
  const published=await call({operation:'update',id,status:'published'}); assert.equal(published.status,200); post=published.data.post
  assert.ok(post.published_at); const firstDate=post.published_at
  const page=await fetch(new URL('/blog/'+post.slug,site)); assert.equal(page.status,200); const html=await page.text()
  assert.ok(html.includes('alt="'+alt+'"')); assert.ok(html.includes('<h2 class="article-h2">Updated draft</h2>'))
  assert.ok(html.includes('<h3 class="article-h3">Details</h3>')); assert.ok(html.includes('<ol ')); assert.ok(html.includes('<strong>bold</strong>'))
  assert.ok(html.includes('&lt;script&gt;window.__blogVerificationInjected=true&lt;/script&gt;'))
  assert.ok(!html.includes('<script>window.__blogVerificationInjected=true</script>')); assert.ok(!html.includes('href="javascript:'))
  const structured=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])).find(v=>v['@type']==='BlogPosting')
  assert.deepEqual(structured.author,{'@type':'Organization',name:'PurpleSoftHub'})
  const canonical='https://www.purplesofthub.com/blog/'+post.slug
  assert.equal(structured.mainEntityOfPage['@id'],canonical)
  assert.ok(html.includes('rel="canonical" href="'+canonical+'"')); assert.ok(html.includes('property="og:url" content="'+canonical+'"'))
  assert.ok(html.includes('name="twitter:card" content="summary_large_image"'))
  const listing=await fetch(new URL('/blog',site)); assert.equal(listing.status,200); assert.ok((await listing.text()).includes('/blog/'+post.slug))
  console.log('PUBLISH / ARTICLE RENDERING / CANONICAL / JSON-LD / SOCIAL METADATA / LISTING: PASS')
  stage='published update and database write protection'
  updated=await call({operation:'update',id,excerpt:'Updated verification summary.',seo_description:''})
  assert.equal(updated.status,200); assert.equal(updated.data.post.id,id); assert.equal(updated.data.post.status,'published')
  assert.equal(updated.data.post.published_at,firstDate); assert.equal(updated.data.post.seo_description,'Updated verification summary.')
  const denied=await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL+'/rest/v1/blog_posts?id=eq.'+id,{method:'PATCH',headers:{apikey:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({author_name:'Unauthorized direct write'})})
  assert.ok([401,403].includes(denied.status))
  console.log('PUBLISHED UPDATE / PUBLICATION DATE PRESERVED / DIRECT DATABASE WRITE BLOCKED: PASS')
} catch(error) { console.error('FAILED at '+stage+': '+(error instanceof Error ? error.message : 'Unknown failure')); process.exitCode=1 }
finally {
  if(id) {
    const cleanup=await fetch(new URL('/api/admin/blog/publish?id='+id,site),{method:'DELETE',headers:{Authorization:'Bearer '+token}})
    if(!cleanup.ok) { console.error('CLEANUP FAILED for disposable article '+id); process.exitCode=1 }
    else console.log('DISPOSABLE ARTICLE REMOVED: PASS')
  }
  if(uploadedUrl) {
    const publicId=new URL(uploadedUrl).pathname.split('/image/upload/')[1]?.replace(/^v\d+\//,'').replace(/\.[a-z0-9]+$/i,'')
    if(publicId?.startsWith('purplesofthub/blog/')) {
      const {v2:cloudinary}=require('cloudinary')
      cloudinary.config({cloud_name:process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET})
      try { const result=await cloudinary.uploader.destroy(publicId); assert.ok(['ok','not found'].includes(result.result)); console.log('DISPOSABLE IMAGE REMOVED: PASS') }
      catch { console.error('Could not remove the disposable verification image.'); process.exitCode=1 }
    }
  }
  if (!path.resolve(work).startsWith(path.resolve(os.tmpdir()) + path.sep + 'purplesofthub-blog-test-')) throw new Error('Unexpected cleanup target')
  await fs.rm(work,{recursive:true,force:true})
}
