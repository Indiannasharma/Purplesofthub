'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string | null
  category: string | null
  status: 'draft' | 'published'
  author_name: string | null
  published_at: string | null
  created_at: string
  updated_at: string | null
  tags: string[] | null
}

const calculateReadTime = (text: string) => Math.max(1, Math.ceil(text.split(/\s+/).length / 200))
const calculateWordCount = (text: string) => text.split(/\s+/).filter(Boolean).length

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest')
  const [deleting, setDeleting] = useState<string | null>(null)

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(posts.filter(p => p.category).map(p => p.category!))
    return Array.from(cats).sort()
  }, [posts])

  // Stats
  const stats = useMemo(() => ({
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    drafts: posts.filter(p => p.status === 'draft').length,
  }), [posts])

  // Filtered and sorted posts
  const filtered = useMemo(() => {
    let result = posts.filter(p => {
      const matchesFilter = filter === 'all' || p.status === filter
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                          p.excerpt.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !categoryFilter || p.category === categoryFilter
      return matchesFilter && matchesSearch && matchesCategory
    })

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
      }
    })

    return result
  }, [posts, filter, search, categoryFilter, sortBy])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post permanently?')) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('blog_posts').delete().eq('id', id)
    setPosts(p => p.filter(post => post.id !== id))
    setDeleting(null)
  }

  const toggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    const supabase = createClient()
    await supabase
      .from('blog_posts')
      .update({
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', post.id)

    setPosts(p => p.map(pp => pp.id === post.id ? { ...pp, status: newStatus } : pp))
  }

  return (
    <div style={{ background: 'var(--cmd-bg)', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* ── HEADER ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(24px, 5vw, 32px)',
              fontWeight: 900,
              color: 'var(--cmd-heading)',
              margin: '0 0 6px',
            }}>
              📚 Blog Manager
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'var(--cmd-body)',
              margin: 0,
            }}>
              Create, manage, and organize your blog posts
            </p>
          </div>
          <Link
            href="/admin/blog/create"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff',
              padding: '12px 28px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 'clamp(13px, 2vw, 15px)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            ✍️ New Post
          </Link>
        </div>

        {/* ── STATS ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {[
            { label: 'Total Posts', value: stats.total, icon: '📝', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
            { label: 'Published', value: stats.published, icon: '🚀', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { label: 'Drafts', value: stats.drafts, icon: '💾', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'var(--cmd-card)',
              border: `1px solid ${stat.bg}`,
              borderRadius: '14px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: stat.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--cmd-muted)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: '28px', fontWeight: 900, color: stat.color, margin: '4px 0 0' }}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── CONTROLS ── */}
        <div style={{
          background: 'var(--cmd-card)',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: '14px',
          padding: '20px',
          marginBottom: '28px',
        }}>
          {/* Search */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: '10px',
              padding: '10px 14px',
            }}>
              <span style={{ color: '#6b5fa0' }}>🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search posts by title or content..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--cmd-heading)',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Filters */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
          }}>
            {/* Status filter */}
            <div>
              <label style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--cmd-muted)',
                display: 'block',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                Status
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['all', 'published', 'draft'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: filter === f ? 'none' : '1px solid rgba(124,58,237,0.2)',
                      background: filter === f
                        ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                        : 'transparent',
                      color: filter === f ? '#fff' : 'var(--cmd-body)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '12px',
                      transition: 'all 0.2s',
                      textTransform: 'capitalize',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'}
                  >
                    {f === 'all' ? `All (${stats.total})` : f === 'published' ? `Published (${stats.published})` : `Drafts (${stats.drafts})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            {categories.length > 0 && (
              <div>
                <label style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--cmd-muted)',
                  display: 'block',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  Category
                </label>
                <select
                  value={categoryFilter || ''}
                  onChange={e => setCategoryFilter(e.target.value || null)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(124,58,237,0.2)',
                    background: 'rgba(124,58,237,0.06)',
                    color: 'var(--cmd-heading)',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort */}
            <div>
              <label style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--cmd-muted)',
                display: 'block',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(124,58,237,0.2)',
                  background: 'rgba(124,58,237,0.06)',
                  color: 'var(--cmd-heading)',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">A-Z Title</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── POSTS ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--cmd-muted)' }}>
            Loading posts...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--cmd-card)',
            borderRadius: '14px',
            border: '1px solid rgba(124,58,237,0.15)',
          }}>
            <p style={{ fontSize: '32px', margin: '0 0 12px' }}>📭</p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cmd-heading)', margin: '0 0 4px' }}>
              No posts found
            </p>
            <p style={{ fontSize: '14px', color: 'var(--cmd-muted)', margin: 0 }}>
              {search ? 'Try a different search' : 'Create your first blog post!'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {filtered.map(post => {
              const readTime = calculateReadTime(post.content)
              const wordCount = calculateWordCount(post.content)
              const publishDate = post.published_at ? new Date(post.published_at) : new Date(post.created_at)
              const dateStr = publishDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

              return (
                <div
                  key={post.id}
                  style={{
                    background: 'var(--cmd-card)',
                    border: '1px solid rgba(124,58,237,0.15)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)'
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.15)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(124,58,237,0.15)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Featured Image */}
                  {post.featured_image && (
                    <div style={{
                      width: '100%',
                      height: '180px',
                      overflow: 'hidden',
                      background: 'rgba(124,58,237,0.08)',
                    }}>
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div style={{
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                  }}>
                    {/* Status & Category */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginBottom: '10px',
                      flexWrap: 'wrap',
                    }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: post.status === 'published' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: post.status === 'published' ? '#10b981' : '#f59e0b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        {post.status === 'published' ? '✓ Published' : '○ Draft'}
                      </span>
                      {post.category && (
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: 'rgba(124,58,237,0.15)',
                          color: '#a855f7',
                          textTransform: 'capitalize',
                        }}>
                          {post.category}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      color: 'var(--cmd-heading)',
                      margin: '0 0 8px',
                      lineHeight: '1.4',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--cmd-body)',
                      margin: '0 0 12px',
                      lineHeight: '1.5',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      flex: 1,
                    }}>
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div style={{
                        display: 'flex',
                        gap: '6px',
                        marginBottom: '12px',
                        flexWrap: 'wrap',
                      }}>
                        {post.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            style={{
                              fontSize: '10px',
                              padding: '3px 8px',
                              background: 'rgba(124,58,237,0.1)',
                              color: '#a855f7',
                              borderRadius: '4px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      fontSize: '11px',
                      color: 'var(--cmd-muted)',
                      marginBottom: '14px',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(124,58,237,0.1)',
                    }}>
                      <span>⏱️ {readTime}m read</span>
                      <span>📊 {wordCount} words</span>
                      <span>📅 {dateStr}</span>
                    </div>

                    {/* Author */}
                    {post.author_name && (
                      <p style={{
                        fontSize: '11px',
                        color: 'var(--cmd-muted)',
                        margin: '0 0 14px',
                        fontStyle: 'italic',
                      }}>
                        by {post.author_name}
                      </p>
                    )}

                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}>
                      <Link
                        href={`/admin/blog/create?id=${post.id}`}
                        style={{
                          flex: 1,
                          minWidth: '80px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(124,58,237,0.3)',
                          background: 'transparent',
                          color: '#a855f7',
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: 600,
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(124,58,237,0.15)'
                          e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'
                        }}
                      >
                        ✏️ Edit
                      </Link>

                      <button
                        onClick={() => toggleStatus(post)}
                        style={{
                          flex: 1,
                          minWidth: '80px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: post.status === 'published' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
                          color: post.status === 'published' ? '#f59e0b' : '#10b981',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        {post.status === 'published' ? '🔒 Unpublish' : '🚀 Publish'}
                      </button>

                      <button
                        onClick={() => deletePost(post.id)}
                        disabled={deleting === post.id}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(239,68,68,0.3)',
                          background: 'transparent',
                          color: '#f87171',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: deleting === post.id ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          opacity: deleting === post.id ? 0.5 : 1,
                        }}
                        onMouseEnter={e => {
                          if (deleting !== post.id) {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
                            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'
                          }
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
                        }}
                      >
                        {deleting === post.id ? '⏳' : '🗑️'} Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
