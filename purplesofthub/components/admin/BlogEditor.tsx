'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AdminPage } from '@/components/admin/AdminPage'
import { blogSlug, type BlogPost, type BlogStatus } from '@/lib/blog/publishing'

type Form = { title: string; slug: string; content: string; excerpt: string; featured_image: string;
  featured_image_alt: string; category: string; tags: string; source_urls: string;
  seo_title: string; seo_description: string; author: string; author_type: 'Person' | 'Organization'; status: BlogStatus }
const emptyForm: Form = { title: '', slug: '', content: '', excerpt: '', featured_image: '', featured_image_alt: '',
  category: '', tags: '', source_urls: '', seo_title: '', seo_description: '', author: 'PurpleSoftHub', author_type: 'Organization', status: 'draft' }
function postForm(post: BlogPost): Form {
  return { title: post.title, slug: post.slug, content: post.content || '', excerpt: post.excerpt || '',
    featured_image: post.featured_image || '', featured_image_alt: post.featured_image_alt || '',
    category: post.category || '', tags: post.tags?.join(', ') || '', source_urls: post.source_urls?.join('\n') || '',
    seo_title: post.seo_title || '', seo_description: post.seo_description || '', author: post.author_name || 'PurpleSoftHub',
    author_type: post.author_name === 'PurpleSoftHub' ? 'Organization' : post.author_type || 'Person', status: post.status }
}
export default function BlogEditor({ id }: { id?: string }) {
  const router = useRouter()
  const [form, setForm] = useState<Form>(emptyForm)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      try {
        const response = await fetch('/api/admin/blog/publish' + (id ? '?id=' + encodeURIComponent(id) : ''), { signal: controller.signal })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not load the editor.')
        setCategories(result.categories)
        if (result.post) { setPost(result.post); setForm(postForm(result.post)) }
        setError('')
      } catch (error) { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Could not load the editor.') }
      finally { if (!controller.signal.aborted) setLoading(false) }
    }
    void Promise.resolve().then(load)
    return () => controller.abort()
  }, [id, retry])
  useEffect(() => {
    let active = true
    const url = file ? URL.createObjectURL(file) : form.featured_image
    void Promise.resolve().then(() => { if (active) setPreview(url) })
    return () => { active = false; if (file) URL.revokeObjectURL(url) }
  }, [file, form.featured_image])
  const update = useCallback((name: keyof Form, value: string) => {
    setForm(current => ({ ...current, [name]: value,
      ...(name === 'author' ? { author_type: value.trim() === 'PurpleSoftHub' ? 'Organization' : 'Person' } : {}) }))
    setFields(current => { const next = { ...current }; delete next[name]; return next })
  }, [])
  async function save(status: BlogStatus) {
    setBusy(true); setError(''); setFields({}); setSuccess('')
    try {
      const payload = { ...form, operation: id ? 'update' : 'create', status,
        ...(id ? { id, expected_updated_at: post?.updated_at ?? undefined } : {}),
        slug: form.slug || undefined, featured_image: file ? undefined : form.featured_image,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        source_urls: form.source_urls.split(/\r?\n/).map(t => t.trim()).filter(Boolean), content_format: 'markdown' }
      const body = new FormData()
      body.append('payload', JSON.stringify(payload))
      if (file) body.append('image', file)
      const response = await fetch('/api/admin/blog/publish', { method: 'POST', body })
      const result = await response.json()
      if (!response.ok) { setFields(result.fields || {}); throw new Error(result.error || 'The article was not saved.') }
      setPost(result.post); setForm(postForm(result.post)); setFile(null)
      setSuccess(status === 'published' ? 'Published. The article is live without a site deployment.' : 'Draft saved. It is visible only to administrators.')
      if (!id) router.replace('/admin/blog/edit/' + result.post.id)
      router.refresh()
    } catch (error) { setError(error instanceof Error ? error.message : 'The article was not saved.') }
    finally { setBusy(false) }
  }
  const words = form.content.trim().split(/\s+/).filter(Boolean).length
  const fieldError = (name: string) => fields[name] ? <small className="blog-field-error">{fields[name]}</small> : null
  const textInput = (name: keyof Form, label: string, maximum?: number, placeholder?: string) => (
    <label className="blog-editor-field" htmlFor={'blog-' + name}>
      <span>{label}</span>
      <input id={'blog-' + name} value={form[name]} onChange={e => update(name, e.target.value)}
        maxLength={maximum} placeholder={placeholder} aria-invalid={Boolean(fields[name])}
        readOnly={name === 'slug' && Boolean(post?.published_at)} />
      {fieldError(name)}
    </label>
  )
  return <AdminPage className="cc-module admin-form admin-adopted">
    <header className="blog-editor-header">
      <div><Link href="/admin/blog">← Blog manager</Link><h1>{id ? 'Edit article' : 'New article'}</h1>
        <p>{words} words · {Math.max(1, Math.ceil(words / 200))} min read · {form.status === 'published' ? 'Published' : 'Draft'}</p></div>
      <div className="blog-editor-actions">
        {post?.status === 'published' && <a href={'/blog/' + post.slug} target="_blank" rel="noopener noreferrer">View article ↗</a>}
        <button type="button" disabled={loading || busy} onClick={() => save('draft')}>{busy ? 'Saving…' : 'Save draft'}</button>
        <button className="blog-editor-primary" type="button" disabled={loading || busy} onClick={() => save('published')}>{busy ? 'Saving…' : post?.status === 'published' ? 'Save published changes' : 'Publish article'}</button>
      </div>
    </header>
    {error && <div className="blog-editor-alert" role="alert">{error}
      {loading === false && categories.length === 0 && <button onClick={() => setRetry(n => n + 1)}>Retry loading</button>}
      {Object.keys(fields).length > 0 && <ul>{Object.entries(fields).map(([name, message]) => <li key={name}>{name}: {message}</li>)}</ul>}
    </div>}
    {success && <div className="blog-editor-success" role="status">{success}</div>}
    {loading ? <p role="status">Loading editor…</p> : <fieldset disabled={busy} className="blog-editor-layout">
      <div className="blog-editor-main">
        <section className="blog-editor-card">
          {textInput('title', 'Title', 200, 'Give your article a clear title')}
          <p className="blog-editor-hint">www.purplesofthub.com/blog/{form.slug || blogSlug(form.title) || 'your-article-slug'}</p>
        </section>
        <section className="blog-editor-card blog-editor-writing">
          <label className="blog-editor-field" htmlFor="blog-content"><span>Article content · Markdown</span>
            <textarea id="blog-content" value={form.content} onChange={e => update('content', e.target.value)} maxLength={100000}
              rows={22} placeholder={'## Your first section\n\nWrite a clear introduction…'} aria-invalid={Boolean(fields.content)} />
            {fieldError('content')}
          </label>
          <p className="blog-editor-hint">Use ## and ### headings, **bold**, _emphasis_, numbered or bulleted lists, and [links](https://example.com). Raw HTML is displayed as text.</p>
        </section>
        <section className="blog-editor-card">
          <label className="blog-editor-field" htmlFor="blog-excerpt"><span>Excerpt</span>
            <textarea id="blog-excerpt" rows={4} maxLength={500} value={form.excerpt} onChange={e => update('excerpt', e.target.value)}
              placeholder="A useful summary for the listing and search results" aria-invalid={Boolean(fields.excerpt)} />{fieldError('excerpt')}</label>
        </section>
      </div>
      <aside className="blog-editor-settings">
        <section className="blog-editor-card"><h2>Featured image</h2>
          {preview && <Image src={preview} alt={form.featured_image_alt || 'Featured image preview'} width={640} height={360} unoptimized className="blog-editor-image" />}
          <label className="blog-editor-field" htmlFor="blog-image"><span>Upload image</span>
            <input id="blog-image" type="file" accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={e => { setFile(e.target.files?.[0] || null); setError('') }} />
          </label><p className="blog-editor-hint">PNG, JPG, WebP or AVIF · maximum 3 MB. Uploaded with the article when you save.</p>
          {!file && textInput('featured_image', 'Existing image URL', 2048, 'https://…')}
          {file && <button type="button" onClick={() => setFile(null)}>Use existing image instead</button>}
          {fieldError('featured_image')}
          {textInput('featured_image_alt', 'Image alt text', 300, 'Describe what the image shows')}
        </section>
        <section className="blog-editor-card"><h2>Publication</h2>
          {textInput('slug', 'Slug · automatic when blank', 100, blogSlug(form.title) || 'your-article-slug')}
          {textInput('author', 'Author', 120)}
          <label className="blog-editor-field" htmlFor="blog-author-type"><span>Author type</span>
            <select id="blog-author-type" value={form.author_type} disabled={form.author.trim() === 'PurpleSoftHub'} onChange={e => update('author_type', e.target.value)}>
              <option value="Organization">Organization</option><option value="Person">Person</option></select></label>
          <label className="blog-editor-field" htmlFor="blog-category"><span>Category · optional</span>
            <select id="blog-category" value={form.category} onChange={e => update('category', e.target.value)}>
              <option value="">Uncategorized</option>{categories.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}</select>{fieldError('category')}</label>
          {textInput('tags', 'Tags · comma separated')}
          <label className="blog-editor-field" htmlFor="blog-status"><span>Status</span><select id="blog-status" value={form.status} onChange={e => update('status', e.target.value)}>
            <option value="draft">Draft</option><option value="published">Published</option></select></label>
          <button type="button" disabled={busy} onClick={() => save(form.status)}>Save selected status</button>
          <p className="blog-editor-hint">The first publication date is preserved on every later edit.</p>
        </section>
        <section className="blog-editor-card"><h2>Search preview</h2>
          {textInput('seo_title', 'SEO title', 70, 'Uses the article title when blank')}
          <label className="blog-editor-field" htmlFor="blog-seo-description"><span>Meta description</span>
            <textarea id="blog-seo-description" rows={4} maxLength={160} value={form.seo_description} onChange={e => update('seo_description', e.target.value)}
              placeholder="Uses the excerpt when blank" />{fieldError('seo_description')}</label>
          <p className="blog-editor-hint">Canonical URLs, social metadata and structured data are generated automatically.</p>
        </section>
        <section className="blog-editor-card"><h2>Sources · optional</h2><label className="blog-editor-field" htmlFor="blog-sources"><span>Source URLs · one per line</span>
          <textarea id="blog-sources" rows={4} value={form.source_urls} onChange={e => update('source_urls', e.target.value)} placeholder="https://source.example.com/article" />{fieldError('source_urls')}</label></section>
      </aside>
    </fieldset>}
    <style>{`
      .blog-editor-header{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap;margin-bottom:24px}
      .blog-editor-header a{color:var(--cc-accent);font-size:13px;text-decoration:none}.blog-editor-header h1{font-size:28px;letter-spacing:-.6px;margin:10px 0 6px;color:var(--cc-text)}
      .blog-editor-header p,.blog-editor-hint{font-size:12px;line-height:1.65;color:var(--cc-text-secondary);overflow-wrap:anywhere}
      .blog-editor-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.blog-editor-actions button,.blog-editor-card button,.blog-editor-alert button{padding:10px 16px;border-radius:8px;border:1px solid var(--cc-border);background:var(--cc-surface);color:var(--cc-text);cursor:pointer;font:inherit;font-size:13px;font-weight:600}
      .blog-editor-actions .blog-editor-primary{background:var(--cc-accent);color:var(--cc-on-accent);border-color:var(--cc-accent)}.blog-editor-actions button:disabled{opacity:.55;cursor:wait}
      .blog-editor-layout{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:20px;padding:0;margin:0;border:0;min-width:0}.blog-editor-main,.blog-editor-settings{display:flex;flex-direction:column;gap:18px;min-width:0}
      .blog-editor-card{background:var(--cc-surface);border:1px solid var(--cc-border);border-radius:12px;padding:22px}.blog-editor-card h2{margin:0 0 18px;font-size:15px;color:var(--cc-text)}
      .blog-editor-field{display:flex;flex-direction:column;gap:7px;margin-bottom:15px;min-width:0}.blog-editor-field>span{font-size:12px;font-weight:600;color:var(--cc-text-secondary)}
      .blog-editor-field input,.blog-editor-field textarea,.blog-editor-field select{width:100%;box-sizing:border-box;border:1px solid var(--cc-border);border-radius:8px;padding:10px 12px;background:var(--cc-bg);color:var(--cc-text);font:inherit;font-size:14px;line-height:1.6}
      .blog-editor-field textarea{resize:vertical}.blog-editor-field input:focus-visible,.blog-editor-field textarea:focus-visible,.blog-editor-field select:focus-visible{outline:2px solid var(--cc-accent);outline-offset:2px}
      .blog-editor-writing textarea{font-family:ui-monospace,monospace;min-height:480px}.blog-editor-field input[aria-invalid=true],.blog-editor-field textarea[aria-invalid=true]{border-color:var(--cc-error)}
      .blog-editor-image{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;border-radius:8px;margin-bottom:18px}.blog-field-error{color:var(--cc-error);font-size:12px}
      .blog-editor-alert,.blog-editor-success{padding:16px 20px;border-radius:10px;margin-bottom:20px;font-size:14px;line-height:1.6}.blog-editor-alert{background:var(--cc-error-soft);color:var(--cc-error)}.blog-editor-success{background:var(--cc-success-soft);color:var(--cc-success)}
      @media(max-width:1050px){.blog-editor-layout{grid-template-columns:minmax(0,1fr)}}@media(max-width:600px){.blog-editor-card{padding:16px}.blog-editor-header h1{font-size:24px}.blog-editor-actions{width:100%}.blog-editor-actions button{flex:1}.blog-editor-writing textarea{min-height:360px}}
    `}</style>
  </AdminPage>
}
