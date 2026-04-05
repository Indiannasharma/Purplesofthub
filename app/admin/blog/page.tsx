'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image: string | null
  category: string | null
  status: 'draft' | 'published'
  author_name: string | null
  published_at: string | null
  created_at: string
  tags: string[] | null
}

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    drafts: posts.filter(p => p.status === 'draft').length,
  }

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
    if (!confirm('Delete this post? This cannot be undone.')) return

    setDeleting(id)
    const supabase = createClient()
    await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id)

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
        published_at: newStatus === 'published'
          ? new Date().toISOString()
          : null,
      })
      .eq('id', post.id)

    setPosts(p => p.map(pp => 
      pp.id === post.id 
        ? { ...pp, status: newStatus }
        : pp
    ))
  }

  const filtered = posts.filter(p => 
    filter === 'all' ? true : p.status === filter
  )

  return (
    <div style={{ maxWidth: '1200px' }}>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 900,
            color: '#ffffff',
            margin: '0 0 4px',
          }}>
            Blog Manager ✍️
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#9d8fd4',
            margin: 0,
          }}>
            Create and manage your blog content
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff',
            padding: '11px 24px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '14px',
            boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
            whiteSpace: 'nowrap',
          }}
        >
          ✍️ New Post
        </Link>
      </div>

      {/* ── STATS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {[
          { 
            label: 'Total Posts', 
            value: stats.total,
            icon: '📝',
            color: '#7c3aed',
            bg: 'rgba(124,58,237,0.1)',
          },
          { 
            label: 'Published', 
            value: stats.published,
            icon: '🚀',
            color: '#10b981',
            bg: 'rgba(16,185,129,0.1)',
          },
          { 
            label: 'Drafts', 
            value: stats.drafts,
            icon: '💾',
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.1)',
          },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#1a1f2e',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: stat.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              flexShrink: 0,
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{
                fontSize: '28px',
                fontWeight: 900,
                color: stat.color,
                margin: '0 0 2px',
                lineHeight: 1,
              }}>
                {loading ? '...' : stat.value}
              </p>
              <p style={{
                fontSize: '13px',
                color: '#9d8fd4',
                margin: 0,
                fontWeight: 500,
              }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTER TABS ── */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
      }}>
        {(['all', 'published', 'draft'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 20px',
              borderRadius: '10px',
              border: filter === f
                ? 'none'
                : '1px solid rgba(124,58,237,0.2)',
              background: filter === f
                ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                : 'transparent',
              color: filter === f ? '#fff' : '#9d8fd4',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s',
            }}
          >
            {f === 'all' 
              ? `All (${stats.total})`
              : f === 'published'
              ? `Published (${stats.published})`
              : `Drafts (${stats.drafts})`
            }
          </button>
        ))}
      </div>

      {/* ── POSTS LIST ── */}
      {loading ? (
        <div style={{
          display: 'grid',
          gap: '12px',
        }}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              background: '#1a1f2e',
              borderRadius: '16px',
              height: '120px',
              animation: 'shimmer 1.5s infinite',
            }}/>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: '#1a1f2e',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: '20px',
          padding: '60px 24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px' }}>✍️</p>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 800,
            color: '#fff',
            margin: '0 0 8px',
          }}>
            No {filter === 'all' ? '' : filter} posts yet
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#9d8fd4',
            margin: '0 0 24px',
          }}>
            {filter === 'all' 
              ? 'Create your first post to start driving organic traffic'
              : `No ${filter} posts found`
            }
          </p>
          <Link
            href="/admin/blog/new"
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
              fontSize: '14px',
              boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
            }}
          >
            ✍️ Write First Post
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '12px',
        }}>
          {filtered.map(post => (
            <div
              key={post.id}
              style={{
                background: '#1a1f2e',
                border: '1px solid rgba(124,58,237,0.12)',
                borderRadius: '16px',
                padding: '0',
                display: 'flex',
                overflow: 'hidden',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(124,58,237,0.3)'
                ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(124,58,237,0.12)'
                ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
              }}
            >
              {/* Featured image */}
              {post.featured_image ? (
                <div style={{
                  width: '160px',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}>
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  width: '160px',
                  flexShrink: 0,
                  background: 'rgba(124,58,237,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                }}>
                  📝
                </div>
              )}

              {/* Content */}
              <div style={{
                flex: 1,
                padding: '20px',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div>
                  {/* Top row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '8px',
                    flexWrap: 'wrap',
                  }}>
                    {/* Status badge */}
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: post.status === 'published' ? '#10b981' : '#f59e0b',
                      background: post.status === 'published'
                        ? 'rgba(16,185,129,0.1)'
                        : 'rgba(245,158,11,0.1)',
                      border: `1px solid ${
                        post.status === 'published'
                          ? 'rgba(16,185,129,0.25)'
                          : 'rgba(245,158,11,0.25)'
                      }`,
                      padding: '3px 10px',
                      borderRadius: '100px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {post.status === 'published' ? '🟢 Published' : '🟡 Draft'}
                    </span>

                    {post.category && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#a855f7',
                        background: 'rgba(124,58,237,0.1)',
                        padding: '3px 10px',
                        borderRadius: '100px',
                      }}>
                        {post.category}
                      </span>
                    )}

                    <span style={{
                      fontSize: '12px',
                      color: '#4b5563',
                      marginLeft: 'auto',
                    }}>
                      {new Date(post.published_at || post.created_at).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#fff',
                    margin: '0 0 6px',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical' as const,
                  }}>
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p style={{
                      fontSize: '13px',
                      color: '#9d8fd4',
                      margin: 0,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                      lineHeight: 1.5,
                    }}>
                      {post.excerpt}
                    </p>
                  )}
                </div>

                {/* Actions row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '14px',
                  flexWrap: 'wrap',
                }}>
                  {/* Edit */}
                  <Link
                    href={`/admin/blog/edit/${post.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: 'rgba(124,58,237,0.1)',
                      border: '1px solid rgba(124,58,237,0.2)',
                      color: '#a855f7',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    ✏️ Edit
                  </Link>

                  {/* View if published */}
                  {post.status === 'published' && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: '8px',
                        background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        color: '#10b981',
                        textDecoration: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      🔗 View Post
                    </Link>
                  )}

                  {/* Toggle status */}
                  <button
                    onClick={() => toggleStatus(post)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: post.status === 'published'
                        ? 'rgba(245,158,11,0.1)'
                        : 'rgba(16,185,129,0.1)',
                      border: `1px solid ${
                        post.status === 'published'
                          ? 'rgba(245,158,11,0.2)'
                          : 'rgba(16,185,129,0.2)'
                      }`,
                      color: post.status === 'published' ? '#f59e0b' : '#10b981',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {post.status === 'published' ? '⬇️ Unpublish' : '🚀 Publish'}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deletePost(post.id)}
                    disabled={deleting === post.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      color: '#ef4444',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginLeft: 'auto',
                    }}
                  >
                    {deleting === post.id ? '⏳' : '🗑️'} Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}