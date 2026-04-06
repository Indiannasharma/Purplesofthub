import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog | PurpleSoftHub',
  description:
    "Insights on web development, digital marketing, music and tech from Africa's Digital Innovation Studio.",
}

// Reading time estimator
function readTime(content: string): string {
  const words = content?.trim()
    .split(/\s+/).length || 0
  const mins = Math.max(
    1, Math.ceil(words / 200)
  )
  return `${mins} min read`
}

export default async function BlogPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const { data: posts } = await supabase
    .from('blog_posts')
    .select(
      'id, title, slug, excerpt, content, featured_image, category, author_name, published_at, created_at, tags'
    )
    .eq('status', 'published')
    .order('published_at',
      { ascending: false })

  const allPosts = posts || []
  const featuredPost = allPosts[0] || null
  const latestPosts = allPosts.slice(1, 5)
  const popularPosts = allPosts.slice(0, 4)

  // Get unique categories for trending
  const allTags = allPosts
    .flatMap(p => p.tags || [p.category])
    .filter(Boolean)
  const uniqueTags = [
    ...new Set(allTags)
  ].slice(0, 8)

  return (
    <>
      <Navbar />

      <div style={{
        minHeight: '100vh',
        background: '#06030f',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* ── GRID BACKGROUND ── */}
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
          zIndex: 0,
        }}/>

        {/* ── AMBIENT GLOWS ── */}
        <div style={{
          position: 'fixed',
          top: '-200px',
          left: '-200px',
          width: '600px',
          height: '600px',
          background:
            'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}/>
        <div style={{
          position: 'fixed',
          bottom: '-200px',
          right: '-200px',
          width: '600px',
          height: '600px',
          background:
            'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}/>

        <div style={{
          position: 'relative',
          zIndex: 1
        }}>

          {/* ══════════════════════════════
              HERO — FEATURED POST
          ══════════════════════════════ */}
          <section style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding:
              'clamp(32px, 4vw, 60px) 24px 0',
          }}>
            {featuredPost ? (
              <div style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                border: '1px solid rgba(124,58,237,0.4)',
                boxShadow: `
                  0 0 40px rgba(124,58,237,0.2),
                  inset 0 0 40px rgba(124,58,237,0.04)
                `,
                marginBottom: '60px',
                display: 'grid',
                background: `
                  linear-gradient(135deg,
                    rgba(13,5,32,0.95) 0%,
                    rgba(26,5,53,0.9) 100%)
                `,
              }}
              className="hero-card">

                {/* Left content */}
                <div style={{
                  padding:
                    'clamp(32px, 4vw, 56px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '20px',
                  position: 'relative',
                  zIndex: 2,
                }}>

                  {/* Featured badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background:
                      'rgba(124,58,237,0.2)',
                    border:
                      '1px solid rgba(124,58,237,0.5)',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    width: 'fit-content',
                    backdropFilter: 'blur(8px)',
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#a855f7',
                      display: 'inline-block',
                      animation:
                        'pulseDot 1.8s ease-in-out infinite',
                      boxShadow:
                        '0 0 8px #a855f7',
                    }}/>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#c084fc',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}>
                      Featured Blog
                    </span>
                  </div>

                  {/* Title */}
                  <h1 style={{
                    fontSize:
                      'clamp(24px, 3.5vw, 44px)',
                    fontWeight: 900,
                    color: '#ffffff',
                    margin: 0,
                    lineHeight: 1.15,
                    letterSpacing: '-0.5px',
                    textShadow:
                      '0 0 40px rgba(168,85,247,0.3)',
                  }}>
                    {featuredPost.title}
                  </h1>

                  {/* Excerpt */}
                  {featuredPost.excerpt && (
                    <p style={{
                      fontSize: '15px',
                      color: 'rgba(200,180,255,0.7)',
                      lineHeight: 1.7,
                      margin: 0,
                    }}>
                      {featuredPost.excerpt
                        .substring(0, 140)}
                      {featuredPost.excerpt
                        .length > 140
                        ? '...' : ''}
                    </p>
                  )}

                  {/* CTA row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    flexWrap: 'wrap',
                  }}>
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background:
                          'linear-gradient(135deg, #7c3aed, #a855f7)',
                        color: '#fff',
                        padding: '13px 28px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 800,
                        fontSize: '14px',
                        boxShadow: `
                          0 0 20px rgba(124,58,237,0.5),
                          0 4px 16px rgba(124,58,237,0.4)
                        `,
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Read Article →
                    </Link>
                    <span style={{
                      fontSize: '13px',
                      color: 'rgba(200,180,255,0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      🕐 {readTime(
                        featuredPost.content || ''
                      )}
                    </span>
                  </div>
                </div>

                {/* Right — image / holographic */}
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '300px',
                }}>
                  {featuredPost.featured_image
                    ? (
                    <img
                      src={featuredPost.featured_image}
                      alt={featuredPost.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        filter:
                          'brightness(0.8) saturate(1.2)',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: `
                        radial-gradient(circle at 60% 40%,
                          rgba(124,58,237,0.4) 0%,
                          rgba(34,211,238,0.1) 50%,
                          transparent 70%)
                      `,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {/* Holographic cube */}
                      <div style={{
                        width: '180px',
                        height: '180px',
                        borderRadius: '24px',
                        background: `
                          linear-gradient(135deg,
                            rgba(124,58,237,0.3),
                            rgba(34,211,238,0.2))
                        `,
                        border:
                          '1px solid rgba(168,85,247,0.5)',
                        boxShadow: `
                          0 0 40px rgba(124,58,237,0.4),
                          inset 0 0 40px rgba(34,211,238,0.1)
                        `,
                        backdropFilter: 'blur(20px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '64px',
                        animation:
                          'float 4s ease-in-out infinite',
                      }}>
                        💜
                      </div>
                    </div>
                  )}

                  {/* Cyan overlay glow */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `
                      linear-gradient(to left,
                        rgba(34,211,238,0.08),
                        transparent 60%)
                    `,
                    pointerEvents: 'none',
                  }}/>
                </div>

                {/* Corner decorations */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '40px',
                  height: '40px',
                  borderTop:
                    '2px solid #7c3aed',
                  borderLeft:
                    '2px solid #7c3aed',
                  borderRadius: '24px 0 0 0',
                }}/>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '40px',
                  height: '40px',
                  borderTop:
                    '2px solid #22d3ee',
                  borderRight:
                    '2px solid #22d3ee',
                  borderRadius: '0 24px 0 0',
                }}/>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '40px',
                  height: '40px',
                  borderBottom:
                    '2px solid #22d3ee',
                  borderLeft:
                    '2px solid #22d3ee',
                  borderRadius: '0 0 0 24px',
                }}/>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '40px',
                  height: '40px',
                  borderBottom:
                    '2px solid #7c3aed',
                  borderRight:
                    '2px solid #7c3aed',
                  borderRadius: '0 0 24px 0',
                }}/>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '80px 24px',
                color: '#9d8fd4',
                marginBottom: '60px',
              }}>
                <p style={{
                  fontSize: '48px',
                  margin: '0 0 16px',
                }}>
                  ✍️
                </p>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#fff',
                  margin: '0 0 8px',
                }}>
                  No posts yet
                </h2>
                <p style={{ margin: 0 }}>
                  Check back soon.
                </p>
              </div>
            )}
          </section>

          {/* ══════════════════════════════
              MAIN — POSTS + SIDEBAR
          ══════════════════════════════ */}
          <section style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px clamp(60px, 8vw, 100px)',
            display: 'grid',
            gap: '32px',
            alignItems: 'start',
          }}
          className="blog-main-grid">

            {/* ── LEFT: LATEST INSIGHTS ── */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '28px',
              }}>
                <h2 style={{
                  fontSize: 'clamp(20px, 2.5vw, 28px)',
                  fontWeight: 900,
                  color: '#ffffff',
                  margin: 0,
                  textShadow:
                    '0 0 20px rgba(168,85,247,0.3)',
                }}>
                  Latest Insights
                </h2>
                <Link
                  href="/blog"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border:
                      '1px solid rgba(124,58,237,0.4)',
                    background:
                      'rgba(124,58,237,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#a855f7',
                    textDecoration: 'none',
                    fontSize: '16px',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                >
                  →
                </Link>
              </div>

              {/* 2x2 grid */}
              <div style={{
                display: 'grid',
                gap: '20px',
              }}
              className="blog-posts-grid">

                {latestPosts.length === 0 && (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '40px',
                    color: '#9d8fd4',
                    fontSize: '14px',
                  }}>
                    {featuredPost
                      ? 'Only one post so far. More coming soon!'
                      : 'No posts yet.'
                    }
                  </div>
                )}

                {latestPosts.map(post => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    style={{
                      textDecoration: 'none'
                    }}
                  >
                    <article
                      style={{
                        background: `
                          linear-gradient(135deg,
                            rgba(13,5,32,0.9),
                            rgba(26,5,53,0.8))
                        `,
                        border:
                          '1px solid rgba(124,58,237,0.25)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        transition: 'all 0.3s',
                        backdropFilter: 'blur(10px)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                      className="blog-card"
                    >
                      {/* Image */}
                      <div style={{
                        height: '160px',
                        overflow: 'hidden',
                        position: 'relative',
                      }}>
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                              transition:
                                'transform 0.3s',
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            background: `
                              radial-gradient(circle at 50% 50%,
                                rgba(124,58,237,0.3),
                                rgba(34,211,238,0.1),
                                transparent)
                            `,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '36px',
                          }}>
                            ✍️
                          </div>
                        )}
                        {/* Category overlay */}
                        {post.category && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                          }}>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: '#22d3ee',
                              background:
                                'rgba(34,211,238,0.15)',
                              border:
                                '1px solid rgba(34,211,238,0.3)',
                              padding: '3px 10px',
                              borderRadius: '100px',
                              backdropFilter:
                                'blur(8px)',
                              letterSpacing:
                                '0.06em',
                              textTransform:
                                'uppercase',
                            }}>
                              {post.category}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{
                        padding: '18px',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}>
                        <h3 style={{
                          fontSize: '15px',
                          fontWeight: 800,
                          color: '#ffffff',
                          margin: 0,
                          lineHeight: 1.3,
                          textShadow:
                            '0 0 10px rgba(168,85,247,0.2)',
                        }}>
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p style={{
                            fontSize: '12px',
                            color:
                              'rgba(200,180,255,0.6)',
                            lineHeight: 1.6,
                            margin: 0,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient:
                              'vertical' as const,
                          }}>
                            {post.excerpt}
                          </p>
                        )}

                        {/* Tags */}
                        {post.tags &&
                          post.tags.length > 0 && (
                          <div style={{
                            display: 'flex',
                            gap: '6px',
                            flexWrap: 'wrap',
                          }}>
                            {post.tags
                              .slice(0, 3)
                              .map((tag: string) => (
                              <span key={tag} style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                color: '#c084fc',
                                background:
                                  'rgba(124,58,237,0.15)',
                                border:
                                  '1px solid rgba(124,58,237,0.25)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Author + Date */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent:
                            'space-between',
                          marginTop: 'auto',
                          paddingTop: '10px',
                          borderTop:
                            '1px solid rgba(124,58,237,0.15)',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}>
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background:
                                'linear-gradient(135deg, #7c3aed, #22d3ee)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: 800,
                              color: '#fff',
                              flexShrink: 0,
                            }}>
                              {(post.author_name ||
                                'P')[0].toUpperCase()}
                            </div>
                            <span style={{
                              fontSize: '11px',
                              color:
                                'rgba(200,180,255,0.7)',
                              fontWeight: 600,
                            }}>
                              {post.author_name ||
                                'PurpleSoftHub'}
                            </span>
                          </div>
                          <span style={{
                            fontSize: '11px',
                            color:
                              'rgba(200,180,255,0.5)',
                          }}>
                            🕐 {readTime(
                              post.content || ''
                            )}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── RIGHT: SIDEBAR ── */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
            className="blog-sidebar">

              {/* Trending Topics */}
              <div style={{
                background: `
                  linear-gradient(135deg,
                    rgba(13,5,32,0.95),
                    rgba(26,5,53,0.9))
                `,
                border:
                  '1px solid rgba(124,58,237,0.25)',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(10px)',
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#fff',
                  margin: '0 0 16px',
                  textShadow:
                    '0 0 10px rgba(168,85,247,0.3)',
                }}>
                  Trending Topics
                </h3>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
                className="trending-tags">
                  {uniqueTags.length > 0
                    ? uniqueTags.map(tag => (
                      <span key={tag} style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '6px 14px',
                        borderRadius: '100px',
                        background:
                          'rgba(34,211,238,0.1)',
                        border:
                          '1px solid rgba(34,211,238,0.3)',
                        color: '#22d3ee',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow:
                          '0 0 8px rgba(34,211,238,0.1)',
                      }}>
                        {tag}
                      </span>
                    ))
                    : ['Web Dev', 'Mobile',
                       'Marketing', 'Music',
                       'SaaS', 'Design',
                       'AI', 'Nigeria']
                       .map(tag => (
                        <span key={tag} style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '6px 14px',
                          borderRadius: '100px',
                          background:
                            'rgba(34,211,238,0.1)',
                          border:
                            '1px solid rgba(34,211,238,0.3)',
                          color: '#22d3ee',
                          cursor: 'pointer',
                        }}>
                          {tag}
                        </span>
                      ))
                  }
                </div>
              </div>

              {/* Popular Posts */}
              <div style={{
                background: `
                  linear-gradient(135deg,
                    rgba(13,5,32,0.95),
                    rgba(26,5,53,0.9))
                `,
                border:
                  '1px solid rgba(124,58,237,0.25)',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(10px)',
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#fff',
                  margin: '0 0 16px',
                  textShadow:
                    '0 0 10px rgba(168,85,247,0.3)',
                }}>
                  Popular Posts
                </h3>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}>
                  {popularPosts.length > 0
                    ? popularPosts.map(
                        (post, i) => (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          style={{
                            textDecoration: 'none',
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            background:
                              'rgba(124,58,237,0.06)',
                            border:
                              '1px solid rgba(124,58,237,0.15)',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                          }}
                          className="popular-post-item">
                            {/* Thumbnail */}
                            <div style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              flexShrink: 0,
                              background:
                                'rgba(124,58,237,0.2)',
                              border:
                                '1px solid rgba(124,58,237,0.3)',
                            }}>
                              {post.featured_image
                                ? (
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
                              ) : (
                                <div style={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '18px',
                                }}>
                                  ✍️
                                </div>
                              )}
                            </div>

                            {/* Title + color */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#fff',
                                margin: '0 0 3px',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                              }}>
                                {post.title}
                              </p>
                              <p style={{
                                fontSize: '10px',
                                color: i % 2 === 0
                                  ? '#22d3ee' : '#a855f7',
                                margin: 0,
                                fontWeight: 600,
                              }}>
                                {post.category ||
                                  'Article'}
                              </p>
                            </div>

                            <span style={{
                              color: '#6b5fa0',
                              fontSize: '14px',
                              flexShrink: 0,
                            }}>
                              ›
                            </span>
                          </div>
                        </Link>
                      ))
                    : (
                      <p style={{
                        fontSize: '13px',
                        color: '#6b5fa0',
                        textAlign: 'center',
                        padding: '12px 0',
                      }}>
                        No posts yet
                      </p>
                    )
                  }
                </div>
              </div>

              {/* Newsletter */}
              <div style={{
                background: `
                  linear-gradient(135deg,
                    rgba(124,58,237,0.15),
                    rgba(34,211,238,0.05))
                `,
                border:
                  '1px solid rgba(124,58,237,0.35)',
                borderRadius: '16px',
                padding: '22px',
                backdropFilter: 'blur(10px)',
                boxShadow:
                  '0 0 24px rgba(124,58,237,0.1)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Glow decoration */}
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-30px',
                  width: '100px',
                  height: '100px',
                  background:
                    'radial-gradient(circle, rgba(34,211,238,0.15), transparent)',
                  pointerEvents: 'none',
                }}/>

                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 900,
                  color: '#fff',
                  margin: '0 0 8px',
                  textShadow:
                    '0 0 10px rgba(168,85,247,0.4)',
                  position: 'relative',
                }}>
                  Newsletter
                </h3>
                <p style={{
                  fontSize: '12px',
                  color: 'rgba(200,180,255,0.6)',
                  lineHeight: 1.6,
                  margin: '0 0 16px',
                  position: 'relative',
                }}>
                  Get the latest insights on
                  digital innovation delivered
                  to your inbox.
                </p>

                {/* Email input */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  position: 'relative',
                }}>
                  <input
                    type="email"
                    placeholder="Signup Slot"
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      borderRadius: '10px',
                      border:
                        '1px solid rgba(124,58,237,0.4)',
                      background:
                        'rgba(124,58,237,0.08)',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      boxShadow:
                        'inset 0 0 10px rgba(124,58,237,0.05)',
                    }}
                  />
                  <Link
                    href="/newsletter"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '11px',
                      borderRadius: '10px',
                      background:
                        'linear-gradient(135deg, #7c3aed, #22d3ee)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '13px',
                      textDecoration: 'none',
                      boxShadow: `
                        0 0 20px rgba(124,58,237,0.4),
                        0 4px 12px rgba(34,211,238,0.2)
                      `,
                      transition: 'all 0.2s',
                    }}
                  >
                    Subscribe →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />

      <style>{`
        /* ── ANIMATIONS ── */
        @keyframes pulseDot {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(0.7);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        /* ── HOVER EFFECTS ── */
        .hero-card:hover {
          box-shadow:
            0 0 60px rgba(124,58,237,0.35) !important;
        }

        .blog-card:hover {
          border-color:
            rgba(124,58,237,0.5) !important;
          transform: translateY(-4px);
          box-shadow:
            0 0 30px rgba(124,58,237,0.2);
        }

        .popular-post-item:hover {
          background: rgba(124,58,237,0.12) !important;
          border-color: rgba(124,58,237,0.3) !important;
          transform: translateX(4px);
        }

        /* ── DESKTOP ── */
        .blog-main-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 32px;
          align-items: start;
        }

        .blog-sidebar {
          position: sticky;
          top: 90px;
        }

        .hero-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 360px;
        }

        .blog-posts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        /* ── TABLET ── */
        @media (max-width: 1024px) {
          .blog-main-grid {
            grid-template-columns: 1fr !important;
          }
          .blog-sidebar {
            position: static !important;
          }
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .hero-card {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
          }
          .hero-card > div:last-child {
            min-height: 200px !important;
            max-height: 220px !important;
          }
          .blog-posts-grid {
            grid-template-columns: 1fr !important;
          }
          .blog-main-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .blog-sidebar {
            position: static !important;
            width: 100% !important;
          }
        }

        /* ── SMALL MOBILE ── */
        @media (max-width: 480px) {
          .trending-tags {
            flex-wrap: wrap !important;
            overflow: visible !important;
          }
        }

        /* ── GLOBAL OVERFLOW FIX ── */
        * {
          box-sizing: border-box;
        }

        input::placeholder {
          color: rgba(200,180,255,0.35);
        }
      `}</style>
    </>
  )
}
