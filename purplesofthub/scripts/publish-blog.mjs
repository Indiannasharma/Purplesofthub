#!/usr/bin/env node
// One article operation; credentials come from the operator's secret store.
import fs from 'node:fs/promises'
import path from 'node:path'
const args = process.argv.slice(2)
const inputFile = args.shift()
if (!inputFile) { console.error('Usage: node scripts/publish-blog.mjs article.json [--publish] [--update ID] [--image FILE]'); process.exit(2) }
try {
  const article = JSON.parse(await fs.readFile(inputFile, 'utf8'))
  let imagePath
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--publish') article.status = 'published'
    else if (args[i] === '--update' && args[i + 1]) { article.operation = 'update'; article.id = args[++i] }
    else if (args[i] === '--image' && args[i + 1]) imagePath = args[++i]
    else throw new Error('Unknown or incomplete option: ' + args[i])
  }
  let token = process.env.PURPLESOFTHUB_BLOG_ACCESS_TOKEN
  if (!token) {
    const email = process.env.PURPLESOFTHUB_BLOG_EMAIL
    const password = process.env.PURPLESOFTHUB_BLOG_PASSWORD
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!email || !password || !supabaseUrl || !anonKey)
      throw new Error('Configure an admin access token, or an existing admin login and the public Supabase URL/anon key in the secret store.')
    const login = await fetch(supabaseUrl + '/auth/v1/token?grant_type=password', {
      method: 'POST', headers: { apikey: anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
    })
    const session = await login.json()
    if (!login.ok || !session.access_token) throw new Error('Admin login failed. No article was submitted.')
    token = session.access_token
  }
  const site = new URL(process.env.PURPLESOFTHUB_BLOG_URL || 'https://www.purplesofthub.com')
  if (site.protocol !== 'https:' && !(site.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(site.hostname)))
    throw new Error('The publishing endpoint must use HTTPS (HTTP is allowed only for local testing).')
  let body
  const headers = { Authorization: 'Bearer ' + token }
  if (imagePath) {
    const extensions = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif' }
    const mime = extensions[path.extname(imagePath).toLowerCase()]
    if (!mime) throw new Error('Use a PNG, JPG, WebP or AVIF image file.')
    const stat = await fs.stat(imagePath)
    if (stat.size > 3 * 1024 * 1024) throw new Error('Featured images must be at most 3 MB.')
    body = new FormData()
    delete article.featured_image
    body.append('payload', JSON.stringify(article))
    body.append('image', new Blob([await fs.readFile(imagePath)], { type: mime }), path.basename(imagePath))
  } else { headers['Content-Type'] = 'application/json'; body = JSON.stringify(article) }
  const response = await fetch(new URL('/api/admin/blog/publish', site), { method: 'POST', headers, body, signal: AbortSignal.timeout(60000) })
  const result = await response.json()
  if (!response.ok) {
    console.error(JSON.stringify({ ok: false, status: response.status, code: result.code, error: result.error, fields: result.fields, existing: result.existing }, null, 2))
    process.exitCode = 1
  } else console.log(JSON.stringify({ ok: true, operation: result.operation, id: result.post.id, slug: result.post.slug,
    status: result.post.status, author: result.post.author_name, featured_image: result.post.featured_image, url: result.url }, null, 2))
} catch (error) { console.error(error instanceof Error ? error.message : 'Publishing failed.'); process.exitCode = 1 }
