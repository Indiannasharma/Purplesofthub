'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { AdminPage } from "@/components/admin/AdminPage";
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const toSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim().substring(0, 100)

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: "1px solid var(--cc-border)",
  background: 'rgba(124,58,237,0.06)',
  color: "var(--cc-text)",
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: "var(--cc-text-secondary)",
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  marginBottom: '6px',
}

const CATEGORIES = [
  'Technology', 'Web Development', 'Mobile Apps', 'Digital Marketing',
  'Music & Entertainment', 'Business & Startups', 'Design & UI/UX',
  'Academy & Learning', 'Company News',
]

export default function CreateBlogPost() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: '', slug: '', content: '', excerpt: '',
    category: '', tags: '', seoTitle: '', seoDescription: '',
    featuredImage: '',
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  const update = useCallback((field: string, value: string) => {
    setForm(p => {
      const updated = { ...p, [field]: value }
      if (field === 'title') {
        if (!p.slug) updated.slug = toSlug(value)
        if (!p.seoTitle) updated.seoTitle = `${value} | PurpleSoftHub Blog`
      }
      return updated
    })
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'blog')
      const res = await fetch('/api/upload/cloudinary', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) { update('featuredImage', data.url); setError('') }
      else setError(data.error || 'Image upload failed')
    } catch { setError('Upload error. Check your connection.') }
    finally { setUploading(false) }
  }

  const save = async (status: 'draft' | 'published') => {
    setError('')
    if (!form.title.trim()) { setError('Title is required.'); return }
    if (!form.content.trim()) { setError('Content is required.'); return }
    if (status === 'published' && !form.excerpt.trim()) {
      setError('Excerpt is required to publish.'); return
    }

    if (status === 'draft') setSaving(true)
    else setPublishing(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in.')
      setSaving(false); setPublishing(false); return
    }

    const now = new Date().toISOString()
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || toSlug(form.title),
      content: form.content.trim(),
      excerpt: form.excerpt.trim(),
      featured_image: form.featuredImage || null,
      category: form.category || null,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      seo_title: form.seoTitle.trim() || form.title.trim(),
      seo_description: form.seoDescription.trim() || form.excerpt.trim(),
      status,
      author_id: user.id,
      author_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
      published_at: status === 'published' ? now : null,
      updated_at: now,
    }

    const { error: dbError } = await supabase.from('blog_posts').insert(payload).select('id').single()

    if (dbError) {
      setError(`Failed: ${dbError.message}${dbError.details ? ' — ' + dbError.details : ''}`)
      setSaving(false); setPublishing(false); return
    }

    setSuccess(status === 'published' ? '🎉 Post published!' : '✅ Draft saved!')
    setTimeout(() => router.push('/admin/blog'), 1200)
    setSaving(false); setPublishing(false)
  }

  const applyFormat = (format: string) => {
    const el = document.getElementById('blog-content') as HTMLTextAreaElement
    if (!el) return
    const s = el.selectionStart, e = el.selectionEnd
    const sel = form.content.substring(s, e)
    const before = form.content.substring(0, s)
    const after = form.content.substring(e)
    const map: Record<string, string> = {
      bold: `**${sel || 'bold text'}**`,
      italic: `_${sel || 'italic'}_`,
      h1: `\n# ${sel || 'Heading 1'}\n`,
      h2: `\n## ${sel || 'Heading 2'}\n`,
      h3: `\n### ${sel || 'Heading 3'}\n`,
      ul: `\n- ${sel || 'List item'}\n`,
      ol: `\n1. ${sel || 'List item'}\n`,
      quote: `\n> ${sel || 'Quote'}\n`,
      code: `\`${sel || 'code'}\``,
      link: `[${sel || 'link text'}](https://url)`,
    }
    if (map[format]) {
      update('content', before + map[format] + after)
      setTimeout(() => el.focus(), 10)
    }
  }

  return (
    <AdminPage className="cc-module admin-form admin-adopted">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexShrink: 0, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/admin/blog" style={{ fontSize: 13, color: "var(--cc-text-secondary)", textDecoration: 'none' }}>← Blog</Link>
          <span style={{ color: "var(--cc-text-muted)" }}>/</span>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "var(--cc-text)", margin: 0 }}>New Post</h1>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--cc-text-muted)" }}>
            {wordCount} words · {readTime}m read
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => save('draft')}
            disabled={saving || publishing}
            style={{ padding: '9px 20px', borderRadius: 10, border: '1.5px solid rgba(124,58,237,0.3)', background: 'transparent', color: "var(--cc-text-secondary)", fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
          >
            {saving ? '⏳ Saving…' : '💾 Save Draft'}
          </button>
          <button
            onClick={() => save('published')}
            disabled={saving || publishing}
            style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: publishing ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #a855f7)', color: "var(--cc-on-accent)", fontSize: 13, fontWeight: 600, cursor: publishing ? 'not-allowed' : 'pointer', boxShadow: "none", whiteSpace: 'nowrap' }}
          >
            {publishing ? '⏳ Publishing…' : '🚀 Publish Now'}
          </button>
        </div>
      </div>

      {/* Error / Success */}
      {error && (
        <div style={{ background: "var(--cc-error-soft)", border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 12, fontSize: 13, color: "var(--cc-error)", flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          ⚠️ {error}
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: "var(--cc-error)", cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
      )}
      {success && (
        <div style={{ background: "var(--cc-success-soft)", border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 12, fontSize: 13, color: "var(--cc-success)", flexShrink: 0 }}>
          {success}
        </div>
      )}

      {/* Editor grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, flex: 1, minHeight: 0, overflow: 'hidden' }} className="blog-editor-grid admin-responsive-grid">

        {/* Left — editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', paddingRight: 2, paddingBottom: 32 }}>

          {/* Title */}
          <div style={{ background: "var(--cc-surface)", border: "1px solid var(--cc-border)", borderRadius: 12, padding: '18px 20px' }}>
            <input
              type="text"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              placeholder="Post title…"
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 26, fontWeight: 600, color: "var(--cc-text)", fontFamily: 'inherit', boxSizing: 'border-box' }}
             aria-label="Post title…"/>
            {form.slug && (
              <p style={{ fontSize: 12, color: "var(--cc-text-muted)", margin: '6px 0 0' }}>
                🔗 purplesofthub.com/blog/<span style={{ color: "var(--cc-accent)" }}>{form.slug}</span>
              </p>
            )}
          </div>

          {/* Content editor */}
          <div style={{ background: "var(--cc-surface)", border: "1px solid var(--cc-border)", borderRadius: 12, overflow: 'hidden', flex: 1, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '8px 14px', borderBottom: '1px solid rgba(124,58,237,0.1)', flexWrap: 'wrap', background: 'rgba(124,58,237,0.03)' }}>
              {[
                { label: 'B', format: 'bold', fw: 900 },
                { label: 'I', format: 'italic', fi: true },
                { divider: true },
                { label: 'H1', format: 'h1' },
                { label: 'H2', format: 'h2' },
                { label: 'H3', format: 'h3' },
                { divider: true },
                { label: '• List', format: 'ul' },
                { label: '1. List', format: 'ol' },
                { label: '"', format: 'quote' },
                { label: '<>', format: 'code' },
                { label: '🔗', format: 'link' },
              ].map((btn, i) =>
                btn.divider ? (
                  <div key={i} style={{ width: 1, height: 18, background: 'rgba(124,58,237,0.15)', margin: '0 3px' }} />
                ) : (
                  <button
                    key={btn.format}
                    onClick={() => applyFormat(btn.format ?? '')}
                    style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: 'transparent', color: "var(--cc-text-secondary)", fontSize: (btn.label?.length ?? 0) > 2 ? 11 : 13, fontWeight: btn.fw || 600, fontStyle: btn.fi ? 'italic' : 'normal', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                  >
                    {btn.label}
                  </button>
                )
              )}
            </div>
            <textarea
              id="blog-content"
              value={form.content}
              onChange={e => update('content', e.target.value)}
              placeholder="Start writing your post… Markdown is supported."
              style={{ flex: 1, minHeight: 400, padding: 18, background: 'transparent', border: 'none', outline: 'none', color: "var(--cc-text)", fontSize: 15, lineHeight: 1.8, fontFamily: "'JetBrains Mono', monospace", resize: 'vertical', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 14px', borderTop: '1px solid rgba(124,58,237,0.08)', fontSize: 11, color: "var(--cc-text-muted)" }}>
              <span>{form.content.length} chars</span>
              <span>{wordCount} words</span>
            </div>
          </div>
        </div>

        {/* Right — settings sidebar */}
        <div style={{ overflowY: 'auto', paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Featured Image */}
          <div style={{ background: "var(--cc-surface)", border: "1px solid var(--cc-border)", borderRadius: 12, padding: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--cc-text)", margin: '0 0 12px' }}>🖼️ Featured Image</p>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            {imagePreview ? (
              <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                <Image unoptimized width={640} height={360} src={imagePreview} alt="Preview" style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
                {uploading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: "var(--cc-on-accent)", fontSize: 13, fontWeight: 600 }}>⏳ Uploading…</div>
                )}
                <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 8, right: 8, padding: '6px 12px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: 8, color: "var(--cc-on-accent)", fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  Change
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ width: '100%', height: 100, border: '2px dashed rgba(124,58,237,0.3)', borderRadius: 10, background: 'rgba(124,58,237,0.04)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span style={{ fontSize: 24 }}>🖼️</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--cc-accent)" }}>{uploading ? 'Uploading…' : 'Click to upload'}</span>
              </button>
            )}
          </div>

          {/* Excerpt */}
          <div style={{ background: "var(--cc-surface)", border: "1px solid var(--cc-border)", borderRadius: 12, padding: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--cc-text)", margin: '0 0 10px' }}>📝 Excerpt *</p>
            <textarea
              value={form.excerpt}
              onChange={e => update('excerpt', e.target.value)}
              placeholder="Brief summary shown on blog listing and search results…"
              maxLength={300}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
             aria-label="Brief summary shown on blog listing and search results…"/>
            <p style={{ fontSize: 11, color: form.excerpt.length > 280 ? '#f59e0b' : '#4b5563', margin: '4px 0 0', textAlign: 'right' }}>
              {form.excerpt.length}/300
            </p>
          </div>

          {/* Post Settings */}
          <div style={{ background: "var(--cc-surface)", border: "1px solid var(--cc-border)", borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--cc-text)", margin: 0 }}>⚙️ Post Settings</p>

            <div>
              <label style={labelStyle} htmlFor="admin-blogcreatepagetsx-1">URL Slug</label>
              <input type="text" value={form.slug} onChange={e => update('slug', e.target.value)} placeholder="url-slug" style={inputStyle}   id="admin-blogcreatepagetsx-1"/>
            </div>

            <div>
              <label style={labelStyle}>Category</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
                {['', ...CATEGORIES].map(cat => (
                  <div
                    key={cat || 'none'}
                    onClick={() => update('category', cat)}
                    style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', background: form.category === cat ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.04)', border: `1px solid ${form.category === cat ? 'rgba(124,58,237,0.3)' : 'transparent'}`, fontSize: 13, color: form.category === cat ? '#a855f7' : '#9d8fd4', fontWeight: form.category === cat ? 700 : 400 }}
                  >
                    {form.category === cat ? '✓ ' : ''}{cat || 'None'}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle} htmlFor="admin-blogcreatepagetsx-2">Tags (comma separated)</label>
              <input type="text" value={form.tags} onChange={e => update('tags', e.target.value)} placeholder="nextjs, marketing, nigeria" style={inputStyle}   id="admin-blogcreatepagetsx-2"/>
            </div>
          </div>

          {/* SEO */}
          <div style={{ background: "var(--cc-surface)", border: "1px solid var(--cc-border)", borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--cc-text)", margin: 0 }}>🔍 SEO</p>
            <div>
              <label style={labelStyle} htmlFor="admin-blogcreatepagetsx-3">SEO Title</label>
              <input type="text" value={form.seoTitle} onChange={e => update('seoTitle', e.target.value)} maxLength={60} style={inputStyle}   id="admin-blogcreatepagetsx-3"/>
              <p style={{ fontSize: 10, color: form.seoTitle.length > 55 ? '#f59e0b' : '#4b5563', margin: '3px 0 0', textAlign: 'right' }}>{form.seoTitle.length}/60</p>
            </div>
            <div>
              <label style={labelStyle} htmlFor="admin-blogcreatepagetsx-4">Meta Description</label>
              <textarea value={form.seoDescription} onChange={e => update('seoDescription', e.target.value)} maxLength={160} rows={3} style={{ ...inputStyle, resize: 'none' }}   id="admin-blogcreatepagetsx-4"/>
              <p style={{ fontSize: 10, color: "var(--cc-text-muted)", margin: '3px 0 0', textAlign: 'right' }}>{form.seoDescription.length}/160</p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .blog-editor-grid { grid-template-columns: 1fr !important; height: auto !important; overflow: visible !important; }
        }
        .blog-editor-grid > div::-webkit-scrollbar { width: 3px; }
        .blog-editor-grid > div::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.25); border-radius: 100px; }
      `}</style>
    </AdminPage>
  )
}
