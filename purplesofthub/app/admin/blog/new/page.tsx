'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  'Technology',
  'Web Development', 
  'Mobile Apps',
  'Digital Marketing',
  'Music & Entertainment',
  'Business & Startups',
  'Design & UI/UX',
  'Academy & Learning',
  'Company News',
]

const inputStyle = (dark: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: `1.5px solid ${dark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.15)'}`,
  background: dark ? 'rgba(124,58,237,0.06)' : '#f9f9ff',
  color: dark ? '#fff' : '#1a1a1a',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box' as const,
  transition: 'border-color 0.2s',
})

const labelStyle = (dark: boolean): React.CSSProperties => ({
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: dark ? '#9d8fd4' : '#6b5fa0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  marginBottom: '6px',
})

// Generate slug from title
const toSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

export default function NewBlogPost() {
  const router = useRouter()
  const dark = true // always dark in admin
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    featuredImage: '',
    featuredImagePublicId: '',
  })

  const [categories, setCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [showCategoryInput, setShowCategoryInput] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [excerptCount, setExcerptCount] = useState(0)
  const [seoTitleCount, setSeoTitleCount] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [postId, setPostId] = useState<string | null>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Auto-save every 30 seconds when form has content
  useEffect(() => {
    if (!form.title && !form.content) return

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveDraft()
    }, 30000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [form])

  // Auto-save on page leave
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.title || form.content) {
        autoSaveDraft()
        e.preventDefault()
        e.returnValue = 'You have unsaved changes.'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [form])

  const fetchCategories = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('blog_categories')
      .select('name')
      .order('name')
    setCategories(data?.map(c => c.name) || [])
  }

  const addCategory = async () => {
    if (!newCategory.trim()) return
    const supabase = createClient()
    const name = newCategory.trim()
    const slug = toSlug(name)

    const { error } = await supabase
      .from('blog_categories')
      .insert({ name, slug })

    if (!error) {
      setCategories(p => [...p, name].sort())
      setNewCategory('')
      setShowCategoryInput(false)
    }
  }

  const deleteCategory = async (name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return
    const supabase = createClient()
    await supabase.from('blog_categories').delete().eq('name', name)
    setCategories(p => p.filter(c => c !== name))
    if (form.category === name) {
      update('category', '')
    }
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
    if (field === 'content') {
      setCharCount(value.length)
      setWordCount(value.trim() ? value.trim().split(/\s+/).length : 0)
    }
    if (field === 'excerpt') {
      setExcerptCount(value.length)
    }
    if (field === 'seoTitle') {
      setSeoTitleCount(value.length)
    }
  }, [])

  // Auto-save draft silently
  const autoSaveDraft = useCallback(async () => {
    const currentForm = form
    if (!currentForm.title.trim() && !currentForm.content.trim()) return

    setAutoSaveStatus('saving')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const slug = currentForm.slug.trim() || toSlug(currentForm.title.trim() || `draft-${Date.now()}`)

    const postData = {
      title: currentForm.title.trim() || 'Untitled Draft',
      slug,
      content: currentForm.content,
      excerpt: currentForm.excerpt,
      featured_image: currentForm.featuredImage || null,
      category: currentForm.category || null,
      tags: currentForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      seo_title: currentForm.seoTitle || currentForm.title,
      seo_description: currentForm.seoDescription || currentForm.excerpt,
      status: 'draft',
      author_id: user?.id,
      author_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'PurpleSoftHub',
      updated_at: new Date().toISOString(),
    }

    try {
      if (postId) {
        const { error } = await supabase.from('blog_posts').update(postData).eq('id', postId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert({ ...postData, published_at: null })
          .select('id')
          .single()

        if (error) {
          if (error.code === '23505') {
            await supabase.from('blog_posts')
              .insert({ ...postData, slug: `${slug}-${Date.now()}`, published_at: null })
              .select('id').single()
          } else {
            throw error
          }
        } else if (data) {
          setPostId(data.id)
        }
      }

      setAutoSaveStatus('saved')
      setLastSaved(new Date())
      setTimeout(() => setAutoSaveStatus('idle'), 3000)
    } catch (err) {
      console.error('Auto-save error:', err)
      setAutoSaveStatus('error')
      setTimeout(() => setAutoSaveStatus('idle'), 3000)
    }
  }, [form, postId])

  // Upload featured image to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview immediately
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'blog')

      const res = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (data.url) {
        update('featuredImage', data.url)
        update('featuredImagePublicId', data.public_id || '')
        setImagePreview(data.url)
      } else {
        setError('Image upload failed. Please try again.')
      }
    } catch {
      setError('Upload error. Check connection.')
    } finally {
      setUploading(false)
    }
  }

  const validateForm = () => {
    if (!form.title.trim()) {
      setError('Post title is required')
      return false
    }
    if (!form.slug.trim()) {
      setError('URL slug is required')
      return false
    }
    if (!form.content.trim()) {
      setError('Post content is required')
      return false
    }
    if (!form.excerpt.trim()) {
      setError('Excerpt is required for SEO and social sharing')
      return false
    }
    return true
  }

  const saveDraft = async () => {
    setSaving(true)
    setError('')
    await autoSaveDraft()
    setSaving(false)
    setSuccess('✅ Draft saved!')
    setTimeout(() => setSuccess(''), 3000)
  }

  const publishPost = async () => {
    if (!form.title.trim()) {
      setError('Post title is required')
      return
    }
    if (!form.content.trim()) {
      setError('Post content is required')
      return
    }
    if (!form.excerpt.trim()) {
      setError('Excerpt is required for SEO and social sharing')
      return
    }

    setPublishing(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const slug = form.slug.trim() || toSlug(form.title.trim())

    const postData = {
      title: form.title.trim(),
      slug,
      content: form.content.trim(),
      excerpt: form.excerpt.trim(),
      featured_image: form.featuredImage || null,
      category: form.category || null,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      seo_title: form.seoTitle.trim() || form.title.trim(),
      seo_description: form.seoDescription.trim() || form.excerpt.trim(),
      status: 'published',
      author_id: user?.id,
      author_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'PurpleSoftHub',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      if (postId) {
        const { error } = await supabase.from('blog_posts').update(postData).eq('id', postId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert(postData)
          .select('id')
          .single()

        if (error) {
          if (error.code === '23505') {
            setError('A post with this slug already exists. Change the URL slug.')
            setPublishing(false)
            return
          }
          throw error
        }
        if (data) setPostId(data.id)
      }

      setSuccess('🎉 Post published!')
      setTimeout(() => router.push('/admin/blog'), 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to publish. Try again.')
    } finally {
      setPublishing(false)
    }
  }

  // Simple rich text formatting
  const applyFormat = (format: string) => {
    const textarea = document.getElementById('blog-content') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = form.content.substring(start, end)
    const before = form.content.substring(0, start)
    const after = form.content.substring(end)

    let newText = form.content
    let newPos = end

    switch(format) {
      case 'bold':
        newText = `${before}**${selected || 'bold text'}**${after}`
        newPos = start + 2 + (selected || 'bold text').length
        break
      case 'italic':
        newText = `${before}_${selected || 'italic text'}_${after}`
        newPos = start + 1 + (selected || 'italic text').length
        break
      case 'h1':
        newText = `${before}\n# ${selected || 'Heading 1'}\n${after}`
        break
      case 'h2':
        newText = `${before}\n## ${selected || 'Heading 2'}\n${after}`
        break
      case 'h3':
        newText = `${before}\n### ${selected || 'Heading 3'}\n${after}`
        break
      case 'ul':
        newText = `${before}\n- ${selected || 'List item'}\n${after}`
        break
      case 'ol':
        newText = `${before}\n1. ${selected || 'List item'}\n${after}`
        break
      case 'quote':
        newText = `${before}\n> ${selected || 'Quote text'}\n${after}`
        break
      case 'code':
        newText = `${before}\`${selected || 'code'}\`${after}`
        break
      case 'codeblock':
        newText = `${before}\n\`\`\`\n${selected || 'code block'}\n\`\`\`\n${after}`
        break
      case 'link':
        newText = `${before}[${selected || 'link text'}](https://)${after}`
        break
      case 'hr':
        newText = `${before}\n---\n${after}`
        break
    }

    update('content', newText)
    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = newPos
      textarea.selectionEnd = newPos
    }, 10)
  }

  const toolbarButtons = [
    { label: 'B', format: 'bold', title: 'Bold', bold: true },
    { label: 'I', format: 'italic', title: 'Italic', italic: true },
    { label: '—', format: '', title: '', divider: true },
    { label: 'H1', format: 'h1', title: 'Heading 1' },
    { label: 'H2', format: 'h2', title: 'Heading 2' },
    { label: 'H3', format: 'h3', title: 'Heading 3' },
    { label: '—', format: '', title: '', divider: true },
    { label: '• List', format: 'ul', title: 'Bullet list' },
    { label: '1. List', format: 'ol', title: 'Numbered list' },
    { label: '"', format: 'quote', title: 'Blockquote' },
    { label: '—', format: '', title: '', divider: true },
    { label: '<>', format: 'code', title: 'Inline code' },
    { label: '```', format: 'codeblock', title: 'Code block' },
    { label: '🔗', format: 'link', title: 'Link' },
    { label: '―', format: 'hr', title: 'Horizontal rule' },
  ]

  return (
    <div style={{ maxWidth: '1400px', width: '100%' }}>

      {/* ── PAGE HEADER ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/admin/blog"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#9d8fd4',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            ← Blog
          </Link>
          <span style={{ color: '#4b5563' }}>/</span>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            New Post
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Auto-save status */}
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: autoSaveStatus === 'saved'
              ? '#10b981'
              : autoSaveStatus === 'saving'
              ? '#f59e0b'
              : autoSaveStatus === 'error'
              ? '#ef4444'
              : '#4b5563',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            {autoSaveStatus === 'saving' && '⏳ Auto-saving...'}
            {autoSaveStatus === 'saved' && '✅ Auto-saved'}
            {autoSaveStatus === 'error' && '❌ Save failed'}
            {autoSaveStatus === 'idle' && lastSaved && `💾 Saved ${lastSaved.toLocaleTimeString()}`}
          </span>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={saveDraft}
              disabled={saving || publishing}
              style={{
                padding: '9px 20px',
                borderRadius: '10px',
                border: '1.5px solid rgba(124,58,237,0.3)',
                background: 'transparent',
                color: '#9d8fd4',
                fontSize: '13px',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {saving ? '⏳ Saving...' : '💾 Save Draft'}
            </button>

            <button
              onClick={publishPost}
              disabled={saving || publishing}
              style={{
                padding: '9px 20px',
                borderRadius: '10px',
                border: 'none',
                background: publishing ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: publishing ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {publishing ? '⏳ Publishing...' : '🚀 Publish Now'}
            </button>
          </div>
        </div>
      </div>

      {/* ── ERROR / SUCCESS ── */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '20px',
          fontSize: '13px',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '20px',
          fontSize: '13px',
          color: '#10b981',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {success}
        </div>
      )}

      {/* ── TWO COLUMN LAYOUT ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '20px',
        alignItems: 'start',
        height: 'calc(100vh - 160px)',
        overflow: 'hidden',
      }}
      className="blog-editor-grid">

        {/* ── LEFT — EDITOR (scrollable) ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: '4px',
          paddingBottom: '40px',
        }}>

          {/* Title */}
          <div style={{
            background: '#1a1f2e',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <input
              type="text"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              placeholder="Post title..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 'clamp(22px, 3vw, 32px)',
                fontWeight: 900,
                color: '#ffffff',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                letterSpacing: '-0.5px',
              }}
            />
            {form.slug && (
              <p style={{ fontSize: '12px', color: '#6b5fa0', margin: '8px 0 0' }}>
                🔗 purplesofthub.com/blog/
                <span style={{ color: '#a855f7' }}>{form.slug}</span>
              </p>
            )}
          </div>

          {/* Editor */}
          <div style={{
            background: '#1a1f2e',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            {/* Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              padding: '10px 16px',
              borderBottom: '1px solid rgba(124,58,237,0.12)',
              flexWrap: 'wrap',
              background: 'rgba(124,58,237,0.04)',
            }}>
              {toolbarButtons.map((btn, i) => btn.divider ? (
                <div key={i} style={{
                  width: '1px',
                  height: '20px',
                  background: 'rgba(124,58,237,0.15)',
                  margin: '0 4px',
                }}/>
              ) : (
                <button
                  key={btn.format}
                  onClick={() => applyFormat(btn.format)}
                  title={btn.title}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: '#9d8fd4',
                    fontSize: btn.label.length > 2 ? '11px' : '13px',
                    fontWeight: btn.bold ? 900 : btn.italic ? 400 : 600,
                    fontStyle: btn.italic ? 'italic' : 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.15)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = '#a855f7'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLButtonElement).style.color = '#9d8fd4'
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Content area */}
            <textarea
              id="blog-content"
              value={form.content}
              onChange={e => update('content', e.target.value)}
              placeholder="Start writing your post... 

Use the toolbar above for formatting.
Markdown is supported.

# Heading 1
## Heading 2
**bold** _italic_ `code`
> Blockquote
- Bullet list"
              style={{
                width: '100%',
                minHeight: '500px',
                padding: '20px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#e2e8f0',
                fontSize: '15px',
                lineHeight: 1.8,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />

            {/* Word/char count */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 16px',
              borderTop: '1px solid rgba(124,58,237,0.08)',
              fontSize: '11px',
              color: '#4b5563',
            }}>
              <span>{charCount} characters</span>
              <span>{wordCount} words</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT — SETTINGS PANEL (scrollable) ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: '40px',
        }}>

          {/* Featured Image */}
          <div style={{
            background: '#1a1f2e',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <p style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#fff',
              margin: '0 0 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              🖼️ Featured Image
            </p>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />

            {imagePreview ? (
              <div style={{
                position: 'relative',
                borderRadius: '10px',
                overflow: 'hidden',
                marginBottom: '10px',
              }}>
                <img
                  src={imagePreview}
                  alt="Featured"
                  style={{
                    width: '100%',
                    height: '160px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                {uploading && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}>
                    ⏳ Uploading...
                  </div>
                )}
                {!uploading && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0.5)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0)'
                  }}>
                    <button
                      onClick={() => fileRef.current?.click()}
                      style={{
                        padding: '8px 16px',
                        background: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.opacity = '1'
                      }}
                    >
                      Change Image
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  width: '100%',
                  height: '140px',
                  border: '2px dashed rgba(124,58,237,0.3)',
                  borderRadius: '10px',
                  background: 'rgba(124,58,237,0.04)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  marginBottom: '10px',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#7c3aed'
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.08)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,58,237,0.3)'
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.04)'
                }}
              >
                <span style={{ fontSize: '32px' }}>🖼️</span>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#a855f7', margin: 0 }}>
                  Click to upload image
                </p>
                <p style={{ fontSize: '11px', color: '#6b5fa0', margin: 0 }}>
                  JPG, PNG, WebP · Max 5MB
                </p>
                <p style={{ fontSize: '10px', color: '#4b5563', margin: 0 }}>
                  Recommended: 1200×630px
                </p>
              </button>
            )}

            {form.featuredImage && (
              <p style={{
                fontSize: '11px',
                color: '#10b981',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                ✅ Uploaded to Cloudinary
              </p>
            )}

            <p style={{
              fontSize: '11px',
              color: '#4b5563',
              margin: '8px 0 0',
              lineHeight: 1.5,
            }}>
              This image will show on the blog listing, blog post page and social media previews.
            </p>
          </div>

          {/* Post Settings */}
          <div style={{
            background: '#1a1f2e',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: 0 }}>
              ⚙️ Post Settings
            </p>

            {/* URL Slug */}
            <div>
              <label style={labelStyle(dark)}>URL Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => update('slug', toSlug(e.target.value))}
                placeholder="my-post-url"
                style={inputStyle(dark)}
              />
              {form.slug && (
                <p style={{ fontSize: '11px', color: '#6b5fa0', margin: '4px 0 0' }}>
                  /blog/{form.slug}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ ...labelStyle(dark), marginBottom: 0 }}>Category</label>
                <button
                  onClick={() => setShowCategoryInput(!showCategoryInput)}
                  style={{ fontSize: '11px', fontWeight: 600, color: '#a855f7', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  + Add New
                </button>
              </div>

              {showCategoryInput && (
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addCategory() }}
                    placeholder="Category name..."
                    style={{ ...inputStyle(dark), fontSize: '12px', padding: '8px 12px' }}
                    autoFocus
                  />
                  <button
                    onClick={addCategory}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#7c3aed', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    Add
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
                <div
                  onClick={() => update('category', '')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                    background: !form.category ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.04)',
                    border: `1px solid ${!form.category ? 'rgba(124,58,237,0.3)' : 'transparent'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '13px', color: !form.category ? '#a855f7' : '#9d8fd4', fontWeight: !form.category ? 700 : 400 }}>None</span>
                </div>

                {categories.map(cat => (
                  <div
                    key={cat}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                      background: form.category === cat ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.04)',
                      border: `1px solid ${form.category === cat ? 'rgba(124,58,237,0.3)' : 'transparent'}`,
                      transition: 'all 0.15s',
                    }}
                    onClick={() => update('category', cat)}
                  >
                    <span style={{ fontSize: '13px', color: form.category === cat ? '#a855f7' : '#9d8fd4', fontWeight: form.category === cat ? 700 : 400 }}>
                      {form.category === cat ? '✓ ' : ''}{cat}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); deleteCategory(cat) }}
                      title="Delete category"
                      style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '14px', padding: '0 4px', lineHeight: 1, flexShrink: 0 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#4b5563' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label style={labelStyle(dark)}>Tags (comma separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={e => update('tags', e.target.value)}
                placeholder="nextjs, react, nigeria"
                style={inputStyle(dark)}
              />
            </div>
          </div>

          {/* Excerpt */}
          <div style={{
            background: '#1a1f2e',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: '0 0 14px' }}>
              📝 Excerpt
            </p>
            <p style={{ fontSize: '11px', color: '#6b5fa0', margin: '0 0 10px', lineHeight: 1.5 }}>
              Used on blog listing, social media previews and Google search results.
            </p>
            <textarea
              value={form.excerpt}
              onChange={e => update('excerpt', e.target.value)}
              placeholder="Brief description of your post..."
              maxLength={300}
              rows={4}
              style={{ ...inputStyle(dark), resize: 'vertical', minHeight: '100px' }}
            />
            <p style={{
              fontSize: '11px',
              color: excerptCount > 280 ? '#f59e0b' : '#4b5563',
              margin: '4px 0 0',
              textAlign: 'right',
            }}>
              {excerptCount}/300
            </p>
          </div>

          {/* SEO Settings */}
          <div style={{
            background: '#1a1f2e',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: 0 }}>
                🔍 SEO Settings
              </p>
              <span style={{
                fontSize: '10px',
                background: 'rgba(16,185,129,0.12)',
                color: '#10b981',
                padding: '2px 8px',
                borderRadius: '100px',
                fontWeight: 600,
              }}>
                Auto-filled
              </span>
            </div>

            {/* SEO Title */}
            <div>
              <label style={labelStyle(dark)}>SEO Title</label>
              <input
                type="text"
                value={form.seoTitle}
                onChange={e => update('seoTitle', e.target.value)}
                placeholder="SEO title..."
                maxLength={60}
                style={inputStyle(dark)}
              />
              <p style={{
                fontSize: '11px',
                color: seoTitleCount > 55 ? '#f59e0b' : '#4b5563',
                margin: '4px 0 0',
                textAlign: 'right',
              }}>
                {seoTitleCount}/60
              </p>
            </div>

            {/* Meta Description */}
            <div>
              <label style={labelStyle(dark)}>Meta Description</label>
              <textarea
                value={form.seoDescription}
                onChange={e => update('seoDescription', e.target.value)}
                placeholder="Meta description for Google..."
                maxLength={160}
                rows={3}
                style={{ ...inputStyle(dark), resize: 'none' }}
              />
              <p style={{
                fontSize: '11px',
                color: '#4b5563',
                margin: '4px 0 0',
                textAlign: 'right',
              }}>
                {form.seoDescription.length}/160
              </p>
            </div>
          </div>

          {/* Social Preview */}
          {(form.title || form.excerpt) && (
            <div style={{
              background: '#1a1f2e',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: '16px',
              padding: '20px',
            }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: '0 0 14px' }}>
                📱 Social Preview
              </p>

              {/* Twitter card preview */}
              <div style={{
                border: '1px solid #2f3336',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#000',
              }}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '140px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '140px',
                    background: '#1a1f2e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4b5563',
                    fontSize: '12px',
                  }}>
                    Add featured image ↑
                  </div>
                )}
                <div style={{ padding: '12px', borderTop: '1px solid #2f3336' }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#fff',
                    margin: '0 0 4px',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const,
                  }}>
                    {form.title || 'Post title...'}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#71767b',
                    margin: '0 0 6px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const,
                  }}>
                    {form.excerpt || 'Post excerpt will appear here...'}
                  </p>
                  <p style={{ fontSize: '11px', color: '#71767b', margin: 0 }}>
                    purplesofthub.com
                  </p>
                </div>
              </div>
              <p style={{
                fontSize: '11px',
                color: '#4b5563',
                margin: '8px 0 0',
                textAlign: 'center',
              }}>
                Twitter / Telegram / WhatsApp
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1024px) {
          .blog-editor-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
            overflow: visible !important;
          }
          .blog-editor-grid > div {
            height: auto !important;
            overflow: visible !important;
          }
        }
        /* Blog editor scrollbars */
        .blog-editor-grid > div::-webkit-scrollbar {
          width: 3px;
        }
        .blog-editor-grid > div::-webkit-scrollbar-track {
          background: transparent;
        }
        .blog-editor-grid > div::-webkit-scrollbar-thumb {
          background: rgba(124,58,237,0.25);
          border-radius: 100px;
        }
        textarea::placeholder {
          color: #4b5563 !important;
          opacity: 1 !important;
        }
        input::placeholder {
          color: #4b5563 !important;
          opacity: 1 !important;
        }
        select option {
          background: #1a1f2e;
          color: #fff;
        }
      `}</style>
    </div>
  )
}