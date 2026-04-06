'use client'

import { useState, useRef, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const toSlug = (title: string) =>
  title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100)

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1.5px solid rgba(124,58,237,0.2)',
  background: 'rgba(124,58,237,0.06)',
  color: '#fff',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: '#9d8fd4',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  marginBottom: '6px',
}

export default function EditBlogPost({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

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
    status: 'draft',
  })

  // Load post on mount
  useEffect(() => {
    loadPost()
    loadCategories()
  }, [id])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!form.title && !form.content) return
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => {
      autoSave()
    }, 30000)
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    }
  }, [form])

  const loadPost = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      setError('Post not found')
      setLoading(false)
      return
    }

    setForm({
      title: data.title || '',
      slug: data.slug || '',
      content: data.content || '',
      excerpt: data.excerpt || '',
      category: data.category || '',
      tags: data.tags?.join(', ') || '',
      seoTitle: data.seo_title || '',
      seoDescription: data.seo_description || '',
      featuredImage: data.featured_image || '',
      status: data.status || 'draft',
    })

    if (data.featured_image) {
      setImagePreview(data.featured_image)
    }
    setLoading(false)
  }

  const loadCategories = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('blog_categories')
      .select('name')
      .order('name')
    setCategories(data?.map(c => c.name) || [
      'Technology', 'Web Development',
      'Mobile Apps', 'Digital Marketing',
      'Music & Entertainment',
      'Business & Startups',
      'Design & UI/UX',
      'Academy & Learning', 'Company News',
    ])
  }

  const update = useCallback((
    field: string, value: string
  ) => {
    setForm(p => ({ ...p, [field]: value }))
  }, [])

  const autoSave = useCallback(async () => {
    setAutoSaveStatus('saving')
    const supabase = createClient()
    await supabase
      .from('blog_posts')
      .update({
        title: form.title || 'Untitled',
        slug: form.slug,
        content: form.content,
        excerpt: form.excerpt,
        category: form.category || null,
        tags: form.tags.split(',')
          .map(t => t.trim()).filter(Boolean),
        seo_title: form.seoTitle,
        seo_description: form.seoDescription,
        featured_image: form.featuredImage || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    setAutoSaveStatus('saved')
    setTimeout(() => setAutoSaveStatus('idle'), 3000)
  }, [form, id])

  const handleSave = async (
    status: 'draft' | 'published'
  ) => {
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }

    status === 'draft'
      ? setSaving(true)
      : setPublishing(true)
    setError('')

    const supabase = createClient()
    const { error: dbError } = await supabase
      .from('blog_posts')
      .update({
        title: form.title.trim(),
        slug: form.slug.trim(),
        content: form.content.trim(),
        excerpt: form.excerpt.trim(),
        category: form.category || null,
        tags: form.tags.split(',')
          .map(t => t.trim()).filter(Boolean),
        seo_title: form.seoTitle.trim() || form.title,
        seo_description: form.seoDescription.trim() || form.excerpt,
        featured_image: form.featuredImage || null,
        status,
        published_at: status === 'published'
          ? new Date().toISOString()
          : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (dbError) {
      setError(dbError.message)
    } else {
      setSuccess(status === 'published'
        ? '🎉 Post updated and published!'
        : '✅ Draft saved!'
      )
      setTimeout(() => {
        router.push('/admin/blog')
      }, 1500)
    }

    setSaving(false)
    setPublishing(false)
  }

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'blog')

      const res = await fetch(
        '/api/upload/cloudinary',
        { method: 'POST', body: formData }
      )
      const data = await res.json()

      if (data.url) {
        update('featuredImage', data.url)
        setImagePreview(data.url)
        setError('')
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch {
      setError('Upload error. Check connection.')
    } finally {
      setUploading(false)
    }
  }

  const applyFormat = (format: string) => {
    const textarea = document.getElementById(
      'blog-content'
    ) as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = form.content.substring(start, end)
    const before = form.content.substring(0, start)
    const after = form.content.substring(end)
    let newText = form.content

    switch(format) {
      case 'bold': newText = `${before}**${selected || 'bold text'}**${after}`; break
      case 'italic': newText = `${before}_${selected || 'italic'}_${after}`; break
      case 'h1': newText = `${before}\n# ${selected || 'Heading 1'}\n${after}`; break
      case 'h2': newText = `${before}\n## ${selected || 'Heading 2'}\n${after}`; break
      case 'h3': newText = `${before}\n### ${selected || 'Heading 3'}\n${after}`; break
      case 'ul': newText = `${before}\n- ${selected || 'List item'}\n${after}`; break
      case 'ol': newText = `${before}\n1. ${selected || 'List item'}\n${after}`; break
      case 'quote': newText = `${before}\n> ${selected || 'Quote'}\n${after}`; break
      case 'code': newText = `${before}\`${selected || 'code'}\`${after}`; break
      case 'link': newText = `${before}[${selected || 'link text'}](https://url)${after}`; break
    }

    update('content', newText)
    setTimeout(() => textarea.focus(), 10)
  }

  if (loading) return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      color: '#9d8fd4',
      fontSize: '16px',
    }}>
      Loading post...
    </div>
  )

  return (
    <div style={{
      maxWidth: '1400px',
      width: '100%',
      height: 'calc(100vh - 100px)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexShrink: 0,
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <Link href="/admin/blog" style={{
            fontSize: '13px',
            color: '#9d8fd4',
            textDecoration: 'none',
          }}>
            ← Blog
          </Link>
          <span style={{ color: '#4b5563' }}>/</span>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 900,
            color: '#fff',
            margin: 0,
          }}>
            Edit Post
          </h1>

          {/* Auto-save status */}
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: autoSaveStatus === 'saved'
              ? '#10b981'
              : autoSaveStatus === 'saving'
              ? '#f59e0b' : '#4b5563',
          }}>
            {autoSaveStatus === 'saving' && '⏳ Saving...'}
            {autoSaveStatus === 'saved' && '✅ Auto-saved'}
          </span>

          {/* Current status badge */}
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: form.status === 'published'
              ? '#10b981' : '#f59e0b',
            background: form.status === 'published'
              ? 'rgba(16,185,129,0.1)'
              : 'rgba(245,158,11,0.1)',
            padding: '3px 10px',
            borderRadius: '100px',
            border: `1px solid ${
              form.status === 'published'
                ? 'rgba(16,185,129,0.25)'
                : 'rgba(245,158,11,0.25)'
            }`,
          }}>
            {form.status === 'published'
              ? '🟢 Published' : '🟡 Draft'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleSave('draft')}
            disabled={saving || publishing}
            style={{
              padding: '9px 20px',
              borderRadius: '10px',
              border: '1.5px solid rgba(124,58,237,0.3)',
              background: 'transparent',
              color: '#9d8fd4',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            {saving ? '⏳ Saving...' : '💾 Save Draft'}
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving || publishing}
            style={{
              padding: '9px 20px',
              borderRadius: '10px',
              border: 'none',
              background: publishing
                ? 'rgba(124,58,237,0.4)'
                : 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: publishing ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
              whiteSpace: 'nowrap',
            }}
          >
            {publishing ? '⏳ Updating...' : '🚀 Update & Publish'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '12px',
          fontSize: '13px',
          color: '#ef4444',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          ⚠️ {error}
          <button onClick={() => setError('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '16px',
            }}>×</button>
        </div>
      )}
      {success && (
        <div style={{
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '12px',
          fontSize: '13px',
          color: '#10b981',
          flexShrink: 0,
        }}>
          {success}
        </div>
      )}

      {/* Editor layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '16px',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
      className="blog-editor-grid">

        {/* Left — editor */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          overflowY: 'auto',
          paddingRight: '2px',
          paddingBottom: '32px',
        }}>
          {/* Title */}
          <div style={{
            background: '#1a1f2e',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '14px',
            padding: '18px 20px',
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
                fontSize: '26px',
                fontWeight: 900,
                color: '#fff',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            {form.slug && (
              <p style={{
                fontSize: '12px',
                color: '#6b5fa0',
                margin: '6px 0 0',
              }}>
                🔗 purplesofthub.com/blog/
                <span style={{ color: '#a855f7' }}>
                  {form.slug}
                </span>
              </p>
            )}
          </div>

          {/* Editor */}
          <div style={{
            background: '#1a1f2e',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '14px',
            overflow: 'hidden',
            flex: 1,
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              padding: '8px 14px',
              borderBottom: '1px solid rgba(124,58,237,0.1)',
              flexWrap: 'wrap',
              background: 'rgba(124,58,237,0.03)',
            }}>
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
                (btn as any).divider ? (
                  <div key={i} style={{
                    width: '1px', height: '18px',
                    background: 'rgba(124,58,237,0.15)',
                    margin: '0 3px',
                  }}/>
                ) : (
                  <button
                    key={(btn as any).format}
                    onClick={() => applyFormat((btn as any).format)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'transparent',
                      color: '#9d8fd4',
                      fontSize: (btn as any).label?.length > 2 ? '11px' : '13px',
                      fontWeight: (btn as any).fw || 600,
                      fontStyle: (btn as any).fi ? 'italic' : 'normal',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {(btn as any).label}
                  </button>
                )
              )}
            </div>

            <textarea
              id="blog-content"
              value={form.content}
              onChange={e => update('content', e.target.value)}
              placeholder="Edit your post content..."
              style={{
                flex: 1,
                minHeight: '400px',
                padding: '18px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#e2e8f0',
                fontSize: '15px',
                lineHeight: 1.8,
                fontFamily: "'JetBrains Mono', monospace",
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 14px',
              borderTop: '1px solid rgba(124,58,237,0.08)',
              fontSize: '11px',
              color: '#4b5563',
            }}>
              <span>{form.content.length} chars</span>
              <span>
                {form.content.trim()
                  ? form.content.trim().split(/\s+/).length
                  : 0} words
              </span>
            </div>
          </div>
        </div>

        {/* Right — settings */}
        <div style={{
          overflowY: 'auto',
          paddingBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>

          {/* Featured Image */}
          <div style={{
            background: '#1a1f2e',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '14px',
            padding: '18px',
          }}>
            <p style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#fff',
              margin: '0 0 12px',
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
                    height: '150px',
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
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    padding: '6px 12px',
                    background: 'rgba(0,0,0,0.7)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Change Image
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                style={{
                  width: '100%',
                  height: '120px',
                  border: '2px dashed rgba(124,58,237,0.3)',
                  borderRadius: '10px',
                  background: 'rgba(124,58,237,0.04)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginBottom: '10px',
                }}
              >
                <span style={{ fontSize: '28px' }}>🖼️</span>
                <p style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#a855f7',
                  margin: 0,
                }}>
                  {uploading ? 'Uploading...' : 'Click to upload image'}
                </p>
              </button>
            )}
          </div>

          {/* Post Settings */}
          <div style={{
            background: '#1a1f2e',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '14px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            <p style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#fff',
              margin: 0,
            }}>
              ⚙️ Post Settings
            </p>

            <div>
              <label style={labelStyle}>URL Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => update('slug', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Category</label>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                maxHeight: '200px',
                overflowY: 'auto',
              }}>
                {['', ...categories].map((cat, i) => (
                  <div
                    key={cat || 'none'}
                    onClick={() => update('category', cat)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: form.category === cat
                        ? 'rgba(124,58,237,0.15)'
                        : 'rgba(124,58,237,0.04)',
                      border: `1px solid ${
                        form.category === cat
                          ? 'rgba(124,58,237,0.3)'
                          : 'transparent'
                      }`,
                      fontSize: '13px',
                      color: form.category === cat
                        ? '#a855f7' : '#9d8fd4',
                      fontWeight: form.category === cat ? 700 : 400,
                    }}
                  >
                    {form.category === cat ? '✓ ' : ''}
                    {cat || 'None'}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={e => update('tags', e.target.value)}
                placeholder="nextjs, marketing, nigeria"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Excerpt */}
          <div style={{
            background: '#1a1f2e',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '14px',
            padding: '18px',
          }}>
            <p style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#fff',
              margin: '0 0 10px',
            }}>
              📝 Excerpt
            </p>
            <textarea
              value={form.excerpt}
              onChange={e => update('excerpt', e.target.value)}
              placeholder="Brief description..."
              maxLength={300}
              rows={3}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: '80px',
              }}
            />
            <p style={{
              fontSize: '11px',
              color: form.excerpt.length > 280 ? '#f59e0b' : '#4b5563',
              margin: '4px 0 0',
              textAlign: 'right',
            }}>
              {form.excerpt.length}/300
            </p>
          </div>

          {/* SEO */}
          <div style={{
            background: '#1a1f2e',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '14px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <p style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#fff',
              margin: 0,
            }}>
              🔍 SEO Settings
            </p>
            <div>
              <label style={labelStyle}>SEO Title</label>
              <input
                type="text"
                value={form.seoTitle}
                onChange={e => update('seoTitle', e.target.value)}
                maxLength={60}
                style={inputStyle}
              />
              <p style={{
                fontSize: '10px',
                color: form.seoTitle.length > 55 ? '#f59e0b' : '#4b5563',
                margin: '3px 0 0',
                textAlign: 'right',
              }}>
                {form.seoTitle.length}/60
              </p>
            </div>
            <div>
              <label style={labelStyle}>Meta Description</label>
              <textarea
                value={form.seoDescription}
                onChange={e => update('seoDescription', e.target.value)}
                maxLength={160}
                rows={3}
                style={{ ...inputStyle, resize: 'none' }}
              />
              <p style={{
                fontSize: '10px',
                color: '#4b5563',
                margin: '3px 0 0',
                textAlign: 'right',
              }}>
                {form.seoDescription.length}/160
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .blog-editor-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
            overflow: visible !important;
          }
        }
        .blog-editor-grid > div::-webkit-scrollbar {
          width: 3px;
        }
        .blog-editor-grid > div::-webkit-scrollbar-thumb {
          background: rgba(124,58,237,0.25);
          border-radius: 100px;
        }
        textarea::placeholder,
        input::placeholder {
          color: '#4b5563' !important;
        }
      `}</style>
    </div>
  )
}