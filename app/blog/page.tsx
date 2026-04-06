'use client'

import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useEffect, useState } from 'react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  category: string | null
  author_name: string | null
  published_at: string | null
  created_at: string
  tags: string[] | null
  content?: string
}

function readTime(content: string): string {
  const words = (content || '')
    .trim().split(/\s+/).length
  return `${Math.max(1,
    Math.ceil(words / 200))} min read`
}

async function getPosts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('blog_posts')
    .select(
      'id, title, slug, excerpt, content, featured_image, category, author_name, published_at, created_at, tags'
    )
    .eq('status', 'published')
    .order('published_at', {
      ascending: false
    })

  if (error) {
    console.error(
      'Blog posts error:', error
    )
    return []
  }

  return data || []
}

export default function BlogPage() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPosts().then(posts => {
      setAllPosts(posts)
      setLoading(false)
    })
  }, [])

  const featuredPost = allPosts[0] || null
  const latestPosts = allPosts.slice(1, 5)
  const popularPosts = allPosts.slice(0, 4)

  const allTags = allPosts
    .flatMap(p => p.tags ||
      (p.category ? [p.category] : []))
    .filter(Boolean)
  const uniqueTags =
    [...new Set(allTags)].slice(0, 8)

  return (
    <>
      <Navbar />

      <div style={{
        minHeight: '100vh',
        background: '#06030f',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Grid background */}
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

        {/* Ambient glows */}
        <div style={{
          position: 'fixed',
          top: '-200px',
          left: '-200px',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}/>
        <div style={{
          position: 'fixed',
          bottom: '-200px',
          right: '-200px',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}/>

        <div style={{
          position: 'relative',
          zIndex: 1,
        }}>

          {/* HERO */}
          <section style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: 'clamp(32px, 4vw, 60px) 24px 0',
          }}>
            {featuredPost ? (
              <div style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                border: '1px solid rgba(124,58,237,0.4)',
                boxShadow: '0 0 40px rgba(124,58,237,0.2)',
                marginBottom: '60px',
                minHeight: '360px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                background: 'linear-gradient(135deg, rgba(13,5,32,0.95), rgba(26,5,53,0.9))',
              }}
              className="hero-card">

                {/* Corner decorations */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  width: '40px', height: '40px',
                  borderTop: '2px solid #7c3aed',
                  borderLeft: '2px solid #7c3aed',
                  borderRadius: '24px 0 0 0',
                  zIndex: 2,
                }}/>
                <div style={{
                  position: 'absolute',
                  top: 0, right: 0,
                  width: '40px', height: '40px',
                  borderTop: '2px solid #22d3ee',
                  borderRight: '2px solid #22d3ee',
                  borderRadius: '0 24px 0 0',
                  zIndex: 2,
                }}/>
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0,
                  width: '40px', height: '40px',
                  borderBottom: '2px solid #22d3ee',
                  borderLeft: '2px solid #22d3ee',
                  borderRadius: '0 0 0 24px',
                  zIndex: 2,
                }}/>
                <div style={{
                  position: 'absolute',
                  bottom: 0, right: 0,
                  width: '40px', height: '40px',
                  borderBottom: '2px solid #7c3aed',
                  borderRight: '2px solid #7c3aed',
                  borderRadius: '0 0 24px 0',
                  zIndex: 2,
                }}/>

                {/* Left content */}
                <div style={{
                  padding: 'clamp(32px, 4vw, 56px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '20px',
                  position: 'relative',
                  zIndex: 2,
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(124,58,237,0.2)',
                    border: '1px solid rgba(124,58,237,0.5)',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    width: 'fit-content',
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#a855f7',
                      display: 'inline-block',
                      animation: 'pulseDot 1.8s ease-in-out infinite',
                      boxShadow: '0 0 8px #a855f7',
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

                  <h1 style={{
                    fontSize: 'clamp(22px, 3vw, 40px)',
                    fontWeight: 900,
                    color: '#ffffff',
                    margin: 0,
                    lineHeight: 1.15,
                    letterSpacing: '-0.5px',
                    textShadow: '0 0 40px rgba(168,85,247,0.3)',
                  }}>
                    {featuredPost.title}
                  </h1>

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
                        .length > 140 ? '...' : ''}
                    </p>
                  )}

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
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        color: '#fff',
                        padding: '13px 28px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 800,
                        fontSize: '14px',
                        boxShadow: '0 0 20px rgba(124,58,237,0.5)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Read Article →
                    </Link>
                    <span style={{
                      fontSize: '13px',
                      color: 'rgba(200,180,255,0.6)',
                    }}>
                      🕐 {readTime(
                        featuredPost.content || ''
                      )}
                    </span>
                  </div>
                </div>

                {/* Right image */}
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
                        filter: 'brightness(0.8)',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'radial-gradient(circle at 60% 40%, rgba(124,58,237,0.4), rgba(34,211,238,0.1), transparent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <div style={{
                        width: '160px',
                        height: '160px',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(34,211,238,0.2))',
                        border: '1px solid rgba(168,85,247,0.5)',
                        boxShadow: '0 0 40px rgba(124,58,237,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '60px',
                        animation: 'float 4s ease-in-out infinite',
                      }}>
                        💜
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '80px 24px',
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
                <p style={{
                  color: '#9d8fd4',
                  margin: 0,
                }}>
                  Check back soon.
                </p>
              </div>
            )}
          </section>

          {/* MAIN CONTENT + SIDEBAR */}
          <section style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px clamp(60px, 8vw, 100px)',
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: '32px',
            alignItems: 'start',
          }}
          className="blog-main-grid">

            {/* LEFT — Latest posts */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
              }}>
                <h2 style={{
                  fontSize: 'clamp(18px, 2.5vw, 26px)',
                  fontWeight: 900,
                  color: '#ffffff',
                  margin: 0,
                  textShadow: '0 0 20px rgba(168,85,247,0.3)',
                }}>
                  Latest Insights
                </h2>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
              }}
              className="blog-posts-grid">
                {!loading && latestPosts.length === 0 && (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '48px',
                    color: '#9d8fd4',
                    fontSize: '14px',
                  }}>
                    {featuredPost
                      ? 'More articles coming soon!'
                      : 'No posts published yet.'}
                  </div>
                )}

                {loading ? (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '48px',
                    color: '#9d8fd4',
                  }}>
                    Loading posts...
                  </div>
                ) : (
                  latestPosts.map(post => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      style={{
                        textDecoration: 'none'
                      }}
                    >
                      <article style={{
                        background: 'linear-gradient(135deg, rgba(13,5,32,0.9), rgba(26,5,53,0.8))',
                        border: '1px solid rgba(124,58,237,0.25)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        transition: 'all 0.3s',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                      }}
                      className="blog-card">

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
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              background: 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.3), rgba(34,211,238,0.1), transparent)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '36px',
                            }}>
                              ✍️
                            </div>
                          )}
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
                                background: 'rgba(34,211,238,0.15)',
                                border: '1px solid rgba(34,211,238,0.3)',
                                padding: '3px 10px',
                                borderRadius: '100px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                              }}>
                                {post.category}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div style={{
                          padding: '16px 18px 18px',
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
                          }}>
                            {post.title}
                          </h3>

                          {post.excerpt && (
                            <p style={{
                              fontSize: '12px',
                              color: 'rgba(200,180,255,0.6)',
                              lineHeight: 1.6,
                              margin: 0,
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical' as const,
                            }}>
                              {post.excerpt}
                            </p>
                          )}

                          {post.tags && post.tags.length > 0 && (
                            <div style={{
                              display: 'flex',
                              gap: '6px',
                              flexWrap: 'wrap',
                            }}>
                              {post.tags.slice(0, 3)
                                .map((tag: string) => (
                                <span key={tag} style={{
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  color: '#c084fc',
                                  background: 'rgba(124,58,237,0.15)',
                                  border: '1px solid rgba(124,58,237,0.25)',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: 'auto',
                            paddingTop: '10px',
                            borderTop: '1px solid rgba(124,58,237,0.15)',
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}>
                              <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #7c3aed, #22d3ee)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: 800,
                                color: '#fff',
                              }}>
                                {(post.author_name || 'P')[0].toUpperCase()}
                              </div>
                              <span style={{
                                fontSize: '11px',
                                color: 'rgba(200,180,255,0.7)',
                                fontWeight: 600,
                              }}>
                                {post.author_name || 'PurpleSoftHub'}
                              </span>
                            </div>
                            <span style={{
                              fontSize: '11px',
                              color: 'rgba(200,180,255,0.5)',
                            }}>
                              🕐 {readTime(post.content || '')}
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div style={{
              position: 'sticky',
              top: '90px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}>

              {/* Trending Topics */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(13,5,32,0.95), rgba(26,5,53,0.9))',
                border: '1px solid rgba(124,58,237,0.25)',
                borderRadius: '16px',
                padding: '20px',
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#fff',
                  margin: '0 0 16px',
                }}>
                  Trending Topics
                </h3>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}>
                  {(uniqueTags.length > 0
                    ? uniqueTags
                    : ['Web Dev', 'Mobile', 'Marketing', 'Music', 'SaaS', 'Design', 'AI', 'Nigeria']
                  ).map(tag => (
                    <span key={tag} style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '6px 14px',
                      borderRadius: '100px',
                      background: 'rgba(34,211,238,0.1)',
                      border: '1px solid rgba(34,211,238,0.3)',
                      color: '#22d3ee',
                      cursor: 'pointer',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Popular Posts */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(13,5,32,0.95), rgba(26,5,53,0.9))',
                border: '1px solid rgba(124,58,237,0.25)',
                borderRadius: '16px',
                padding: '20px',
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#fff',
                  margin: '0 0 16px',
                }}>
                  Popular Posts
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}>
                  {popularPosts.length > 0
                    ? popularPosts.map((post, i) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: 'rgba(124,58,237,0.06)',
                          border: '1px solid rgba(124,58,237,0.15)',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                        }}>
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            flexShrink: 0,
                            background: 'rgba(124,58,237,0.2)',
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
                              color: i % 2 === 0 ? '#22d3ee' : '#a855f7',
                              margin: 0,
                              fontWeight: 600,
                            }}>
                              {post.category || 'Article'}
                            </p>
                          </div>
                          <span style={{
                            color: '#6b5fa0',
                            fontSize: '14px',
                          }}>›</span>
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
                  )}
                </div>
              </div>

              {/* Newsletter */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(34,211,238,0.05))',
                border: '1px solid rgba(124,58,237,0.35)',
                borderRadius: '16px',
                padding: '22px',
                boxShadow: '0 0 24px rgba(124,58,237,0.1)',
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 900,
                  color: '#fff',
                  margin: '0 0 8px',
                }}>
                  Newsletter
                </h3>
                <p style={{
                  fontSize: '12px',
                  color: 'rgba(200,180,255,0.6)',
                  lineHeight: 1.6,
                  margin: '0 0 16px',
                }}>
                  Get the latest insights
                  delivered to your inbox.
                </p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      borderRadius: '10px',
                      border: '1px solid rgba(124,58,237,0.4)',
                      background: 'rgba(124,58,237,0.08)',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Link
                    href="/contact"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '11px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #7c3aed, #22d3ee)',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '13px',
                      textDecoration: 'none',
                      boxShadow: '0 0 20px rgba(124,58,237,0.4)',
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
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .hero-card:hover {
          box-shadow: 0 0 60px rgba(124,58,237,0.35) !important;
        }
        .blog-card:hover {
          border-color: rgba(124,58,237,0.5) !important;
          transform: translateY(-4px);
          box-shadow: 0 0 30px rgba(124,58,237,0.2);
        }
        @media (max-width: 1024px) {
          .blog-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .hero-card {
            grid-template-columns: 1fr !important;
          }
          .blog-posts-grid {
            grid-template-columns: 1fr !important;
          }
        }
        input::placeholder {
          color: rgba(200,180,255,0.35);
        }
      `}</style>
    </>
  )
}
