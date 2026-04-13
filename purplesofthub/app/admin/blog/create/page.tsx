'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const toSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()

const calculateReadTime = (text: string) => {
  const words = text.trim().split(/\s+/).length
  const readTime = Math.max(1, Math.ceil(words / 200))
  return readTime
}

export default function CreateBlogPost() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const postId = searchParams.get('id')
  const fileRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(!!postId)

  // Form state
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    focusKeyword: '',
    featuredImage: '',
  })

  const [categories, setCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Stats
  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length
  const readTime = calculateReadTime(form.content)
  const charCount = form.content.length

  useEffect(() => {
    fetchCategories()
    if (postId) {
      loadPost(postId)
    }
  }, [postId])

  const loadPost = async (id: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      setForm({
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        category: data.category || '',
        tags: (data.tags || []).join(', '),
        seoTitle: data.seo_title,
        seoDescription: data.seo_description,
        focusKeyword: data.focus_keyword || '',
        featuredImage: data.featured_image || '',
      })
      if (data.featured_image) {
        setImagePreview(data.featured_image)
      }
    }
    setIsLoading(false)
  }

  const fetchCategories = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('blog_categories').select('name').order('name')
    setCategories(data?.map(c => c.name) || [])
  }

  const update = useCallback((field: string, value: string) => {
    setForm(p => {
      const updated = { ...p, [field]: value }
      if (field === 'title' && !p.slug) {
        updated.slug = toSlug(value)
      }
      if (field === 'title' && !p.seoTitle) {
        updated.seoTitle = `${value} | PurpleSoftHub Blog`
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

      if (data.url) {
        update('featuredImage', data.url)
        setSuccess('📸 Image uploaded!')
        setTimeout(() => setSuccess(''), 2000)
      }
    } catch (err) {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const addCategory = async () => {
    if (!newCategory.trim()) return
    const supabase = createClient()
    const { error } = await supabase
      .from('blog_categories')
      .insert({ name: newCategory.trim(), slug: toSlug(newCategory.trim()) })

    if (!error) {
      setCategories(p => [...p, newCategory.trim()].sort())
      setNewCategory('')
    }
  }

  const saveDraft = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required')
      return
    }

    setSaving(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to save a post.')
      setSaving(false)
      return
    }

    try {
      const postData = {
        title: form.title,
        slug: form.slug || toSlug(form.title),
        content: form.content,
        excerpt: form.excerpt,
        featured_image: form.featuredImage || null,
        category: form.category || null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        seo_title: form.seoTitle || form.title,
        seo_description: form.seoDescription || form.excerpt,
        focus_keyword: form.focusKeyword || null,
        status: 'draft',
        author_id: user.id,
        author_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        updated_at: new Date().toISOString(),
      }

      let dbError: any = null
      if (postId) {
        const { error } = await supabase.from('blog_posts').update(postData).eq('id', postId)
        dbError = error
      } else {
        const { error } = await supabase.from('blog_posts').insert({ ...postData, published_at: null })
        dbError = error
      }

      if (dbError) {
        setError(`Failed to save: ${dbError.message}`)
        return
      }

      setSuccess(postId ? '✅ Draft updated!' : '✅ Draft saved!')
      setTimeout(() => router.push('/admin/blog'), 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const publishPost = async () => {
    if (!form.title.trim() || !form.content.trim() || !form.excerpt.trim()) {
      setError('Title, content, and excerpt are required to publish')
      return
    }

    setPublishing(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to publish a post.')
      setPublishing(false)
      return
    }

    try {
      const now = new Date().toISOString()
      const postData = {
        title: form.title,
        slug: form.slug || toSlug(form.title),
        content: form.content,
        excerpt: form.excerpt,
        featured_image: form.featuredImage || null,
        category: form.category || null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        seo_title: form.seoTitle || form.title,
        seo_description: form.seoDescription || form.excerpt,
        focus_keyword: form.focusKeyword || null,
        status: 'published',
        author_id: user.id,
        author_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        published_at: now,
        updated_at: now,
      }

      let dbError: any = null
      if (postId) {
        const { error } = await supabase.from('blog_posts').update(postData).eq('id', postId)
        dbError = error
      } else {
        const { error } = await supabase.from('blog_posts').insert(postData)
        dbError = error
      }

      if (dbError) {
        // Common causes: RLS policy blocking insert, duplicate slug, missing required column
        setError(`Failed to publish: ${dbError.message}${dbError.details ? ` — ${dbError.details}` : ''}`)
        return
      }

      setSuccess(postId ? '✅ Post updated & published!' : '🎉 Post published successfully!')
      setTimeout(() => router.push('/admin/blog'), 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to publish')
    } finally {
      setPublishing(false)
    }
  }

  const applyFormat = (format: string) => {
    const textarea = document.getElementById('editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = form.content.substring(start, end)
    const before = form.content.substring(0, start)
    const after = form.content.substring(end)

    let newText = form.content
    switch (format) {
      case 'bold':
        newText = before + `**${selected || 'bold'}**` + after
        break
      case 'italic':
        newText = before + `_${selected || 'italic'}_` + after
        break
      case 'h1':
        newText = before + `# ${selected || 'Heading'}` + after
        break
      case 'h2':
        newText = before + `## ${selected || 'Heading'}` + after
        break
      case 'code':
        newText = before + `\`${selected || 'code'}\`` + after
        break
      case 'link':
        newText = before + `[${selected || 'text'}](url)` + after
        break
      case 'quote':
        newText = before + `> ${selected || 'quote'}` + after
        break
      case 'list':
        newText = before + `- ${selected || 'item'}` + after
        break
    }
    update('content', newText)
    setTimeout(() => textarea.focus(), 0)
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cmd-bg)' }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(124,58,237,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--cmd-card)',
      }}>
        <Link href="/admin/blog" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
          ← Back to Blog
        </Link>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: 'var(--cmd-heading)' }}>
          {isLoading ? '⏳ Loading...' : postId ? '✏️ Edit Post' : '✍️ New Blog Post'}
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={saveDraft}
            disabled={saving || publishing}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: '1px solid rgba(124,58,237,0.3)',
              background: 'transparent',
              color: 'var(--cmd-body)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            💾 {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={publishPost}
            disabled={publishing || saving}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🚀 {publishing ? 'Publishing...' : 'Publish Now'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          padding: '12px 24px',
          background: 'rgba(239,68,68,0.1)',
          borderBottom: '1px solid rgba(239,68,68,0.3)',
          color: '#f87171',
          fontSize: '13px',
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          padding: '12px 24px',
          background: 'rgba(16,185,129,0.1)',
          borderBottom: '1px solid rgba(16,185,129,0.3)',
          color: '#10b981',
          fontSize: '13px',
        }}>
          {success}
        </div>
      )}

      {/* Two-column layout */}
      {isLoading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          color: 'var(--cmd-muted)',
          fontSize: '14px',
        }}>
          Loading post data...
        </div>
      ) : (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '20px',
        padding: '20px 24px',
        flex: 1,
        overflow: 'hidden',
      }}>
        {/* Left: Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '8px' }}>
          {/* Title */}
          <input
            type="text"
            value={form.title}
            onChange={e => update('title', e.target.value)}
            placeholder="Post title..."
            style={{
              width: '100%',
              padding: '16px 20px',
              fontSize: '24px',
              fontWeight: 900,
              border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: '12px',
              background: 'var(--cmd-card)',
              color: 'var(--cmd-heading)',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />

          {/* Toolbar */}
          <div style={{
            display: 'flex',
            gap: '4px',
            padding: '12px',
            background: 'var(--cmd-card)',
            borderRadius: '12px',
            border: '1px solid rgba(124,58,237,0.15)',
            flexWrap: 'wrap',
          }}>
            {[
              { icon: '**', label: 'Bold', format: 'bold' },
              { icon: '_', label: 'Italic', format: 'italic' },
              { icon: 'H1', label: 'Heading 1', format: 'h1' },
              { icon: 'H2', label: 'Heading 2', format: 'h2' },
              { icon: '<>', label: 'Code', format: 'code' },
              { icon: '🔗', label: 'Link', format: 'link' },
              { icon: '❝', label: 'Quote', format: 'quote' },
              { icon: '•', label: 'List', format: 'list' },
            ].map(btn => (
              <button
                key={btn.format}
                onClick={() => applyFormat(btn.format)}
                title={btn.label}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(124,58,237,0.1)',
                  color: 'var(--cmd-body)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.1)')}
              >
                {btn.icon}
              </button>
            ))}
          </div>

          {/* Editor */}
          <textarea
            id="editor"
            value={form.content}
            onChange={e => update('content', e.target.value)}
            placeholder="Start writing your post... Markdown is supported."
            style={{
              width: '100%',
              flex: 1,
              padding: '20px',
              fontSize: '14px',
              lineHeight: '1.6',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: '12px',
              background: 'var(--cmd-card)',
              color: 'var(--cmd-heading)',
              outline: 'none',
              fontFamily: 'monospace',
              resize: 'none',
            }}
          />
        </div>

        {/* Right: Settings */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
          {/* Featured Image */}
          <div style={{
            background: 'var(--cmd-card)',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cmd-body)', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              📸 Featured Image
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed rgba(124,58,237,0.3)',
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(124,58,237,0.04)',
              }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '120px' }} />
              ) : (
                <div>
                  <p style={{ color: 'var(--cmd-body)', margin: '0 0 4px', fontWeight: 600, fontSize: '13px' }}>Click to upload</p>
                  <p style={{ color: 'var(--cmd-muted)', margin: 0, fontSize: '12px' }}>1200x630px recommended</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </div>

          {/* Excerpt */}
          <div style={{
            background: 'var(--cmd-card)',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cmd-body)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              📝 Excerpt
            </label>
            <textarea
              value={form.excerpt}
              onChange={e => update('excerpt', e.target.value)}
              placeholder="Brief summary for social media and search results..."
              maxLength={160}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '13px',
                border: '1px solid rgba(124,58,237,0.2)',
                borderRadius: '8px',
                background: 'rgba(124,58,237,0.06)',
                color: 'var(--cmd-heading)',
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />
            <p style={{ fontSize: '11px', color: 'var(--cmd-muted)', textAlign: 'right', margin: '4px 0 0' }}>
              {form.excerpt.length}/160
            </p>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}>
            <div style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '11px', color: 'var(--cmd-muted)', margin: '0 0 4px' }}>Reading Time</p>
              <p style={{ fontSize: '18px', fontWeight: 900, color: '#10b981', margin: 0 }}>{readTime}m</p>
            </div>
            <div style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '11px', color: 'var(--cmd-muted)', margin: '0 0 4px' }}>Words</p>
              <p style={{ fontSize: '18px', fontWeight: 900, color: '#3b82f6', margin: 0 }}>{wordCount}</p>
            </div>
          </div>

          {/* SEO Settings */}
          <div style={{
            background: 'var(--cmd-card)',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cmd-body)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              🔍 SEO Settings
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cmd-body)', display: 'block', marginBottom: '6px' }}>URL SLUG</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => update('slug', e.target.value)}
                placeholder="url-slug"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: '12px',
                  border: '1px solid rgba(124,58,237,0.2)',
                  borderRadius: '8px',
                  background: 'rgba(124,58,237,0.06)',
                  color: 'var(--cmd-heading)',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cmd-body)', display: 'block', marginBottom: '6px' }}>SEO TITLE</label>
              <input
                type="text"
                value={form.seoTitle}
                onChange={e => update('seoTitle', e.target.value)}
                maxLength={60}
                placeholder="SEO title..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: '12px',
                  border: '1px solid rgba(124,58,237,0.2)',
                  borderRadius: '8px',
                  background: 'rgba(124,58,237,0.06)',
                  color: 'var(--cmd-heading)',
                }}
              />
              <p style={{ fontSize: '10px', color: 'var(--cmd-muted)', textAlign: 'right', margin: '4px 0 0' }}>
                {form.seoTitle.length}/60
              </p>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cmd-body)', display: 'block', marginBottom: '6px' }}>META DESCRIPTION</label>
              <textarea
                value={form.seoDescription}
                onChange={e => update('seoDescription', e.target.value)}
                maxLength={160}
                placeholder="Meta description..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: '12px',
                  border: '1px solid rgba(124,58,237,0.2)',
                  borderRadius: '8px',
                  background: 'rgba(124,58,237,0.06)',
                  color: 'var(--cmd-heading)',
                  resize: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <p style={{ fontSize: '10px', color: 'var(--cmd-muted)', textAlign: 'right', margin: '4px 0 0' }}>
                {form.seoDescription.length}/160
              </p>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cmd-body)', display: 'block', marginBottom: '6px' }}>FOCUS KEYWORD</label>
              <input
                type="text"
                value={form.focusKeyword}
                onChange={e => update('focusKeyword', e.target.value)}
                placeholder="Main keyword..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: '12px',
                  border: '1px solid rgba(124,58,237,0.2)',
                  borderRadius: '8px',
                  background: 'rgba(124,58,237,0.06)',
                  color: 'var(--cmd-heading)',
                }}
              />
            </div>
          </div>

          {/* Category */}
          <div style={{
            background: 'var(--cmd-card)',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cmd-body)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              📂 Category
            </label>
            <select
              value={form.category}
              onChange={e => update('category', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: '13px',
                border: '1px solid rgba(124,58,237,0.2)',
                borderRadius: '8px',
                background: 'rgba(124,58,237,0.06)',
                color: 'var(--cmd-heading)',
              }}
            >
              <option value="">Select category...</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div style={{
            background: 'var(--cmd-card)',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cmd-body)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              🏷️ Tags
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={e => update('tags', e.target.value)}
              placeholder="Separate with commas..."
              style={{
                width: '100%',
                padding: '8px 10px',
                fontSize: '13px',
                border: '1px solid rgba(124,58,237,0.2)',
                borderRadius: '8px',
                background: 'rgba(124,58,237,0.06)',
                color: 'var(--cmd-heading)',
              }}
            />
          </div>
        </div>
      </div>
      )}
    </div>
  )
}
