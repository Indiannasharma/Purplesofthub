import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) return null
  return data
}

async function getRelated(
  category: string,
  currentId: string
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('blog_posts')
    .select(
      'id, title, slug, excerpt, featured_image, category, published_at'
    )
    .eq('status', 'published')
    .eq('category', category)
    .neq('id', currentId)
    .limit(3)
  return data || []
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { 
    title: 'Not Found | PurpleSoftHub' 
  }

  const ogImage = 
    post.featured_image ||
    'https://www.purplesofthub.com/opengraph-image'

  return {
    title: post.seo_title ||
      `${post.title} | PurpleSoftHub Blog`,
    description: 
      post.seo_description || post.excerpt,
    openGraph: {
      type: 'article',
      title: post.title,
      description: 
        post.seo_description || post.excerpt,
      url: `https://www.purplesofthub.com/blog/${post.slug}`,
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: 
        post.seo_description || post.excerpt,
      images: [ogImage],
    },
  }
}

function renderMarkdown(text: string): string {
  if (!text) return ''
  return text
    .replace(
      /```[\w]*\n?([\s\S]*?)```/g,
      '<pre class="code-block"><code>$1</code></pre>'
    )
    .replace(
      /^### (.+)$/gm,
      '<h3 class="article-h3">$1</h3>'
    )
    .replace(
      /^## (.+)$/gm,
      '<h2 class="article-h2">$1</h2>'
    )
    .replace(
      /^# (.+)$/gm,
      '<h1 class="article-h1">$1</h1>'
    )
    .replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="article-strong">$1</strong>'
    )
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(
      /`([^`]+)`/g,
      '<code class="article-code">$1</code>'
    )
    .replace(
      /^> (.+)$/gm,
      '<blockquote class="article-quote">$1</blockquote>'
    )
    .replace(
      /^---$/gm,
      '<hr class="article-hr"/>'
    )
    .replace(
      /^[\-\*] (.+)$/gm,
      '<li class="article-li">$1</li>'
    )
    .replace(
      /(<li[^>]*>.*<\/li>\n?)+/g,
      '<ul class="article-ul">$&</ul>'
    )
    .replace(
      /^\d+\. (.+)$/gm,
      '<li class="article-li">$1</li>'
    )
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" class="article-link" target="_blank" rel="noopener">$1</a>'
    )
    .replace(
      /\n\n+/g,
      '</p><p class="article-p">'
    )
    .replace(/\n/g, '<br/>')
}

function readTime(content: string): string {
  const words = (content || '')
    .trim().split(/\s+/).length
  return `${Math.max(1, 
    Math.ceil(words / 200))} min read`
}

export default async function BlogPostPage(
  { params }: Props
) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const related = await getRelated(
    post.category || '',
    post.id
  )

  const content = renderMarkdown(
    post.content || ''
  )

  return (
    <>
      <Navbar />

      <div style={{
        minHeight: '100vh',
        background: 'var(--blog-space-bg)',
        position: 'relative',
        overflowX: 'hidden',
      }}>

        {/* Grid background */}
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            linear-gradient(var(--blog-grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--blog-grid-line) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
          zIndex: 0,
        }}/>

        {/* Glow top */}
        <div style={{
          position: 'fixed',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '400px',
          background: 
            'radial-gradient(ellipse, var(--blog-glow-primary) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}/>

        <div style={{ 
          position: 'relative', 
          zIndex: 1,
        }}>

          {/* ── ARTICLE HERO ── */}
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: 
              'clamp(32px, 5vw, 60px) clamp(16px, 4vw, 24px) 0',
          }}>

            {/* Breadcrumb */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '32px',
              fontSize: '13px',
              flexWrap: 'wrap',
            }}>
              {[
                { label: 'Home', href: '/' },
                { label: 'Blog', href: '/blog' },
                { 
                  label: post.category || 'Article',
                  href: '/blog',
                  highlight: true,
                },
              ].map((item, i, arr) => (
                <span key={item.href + i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                  <Link href={item.href} style={{
                    color: item.highlight
                      ? '#a855f7'
                      : 'var(--blog-body)',
                    textDecoration: 'none',
                    fontWeight: item.highlight
                      ? 700 : 400,
                  }}>
                    {item.label}
                  </Link>
                  {i < arr.length - 1 && (
                    <span style={{ 
                      color: '#4b5563' 
                    }}>
                      ›
                    </span>
                  )}
                </span>
              ))}
            </div>

            {/* Category + Date + Read time */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              flexWrap: 'wrap',
            }}>
              {post.category && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#22d3ee',
                  background: 
                    'rgba(34,211,238,0.1)',
                  border: 
                    '1px solid rgba(34,211,238,0.3)',
                  padding: '5px 14px',
                  borderRadius: '100px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  {post.category}
                </span>
              )}
              <span style={{
                fontSize: '13px',
                color: 'var(--blog-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                📅 {new Date(
                  post.published_at || 
                  post.created_at
                ).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span style={{
                fontSize: '13px',
                color: 'var(--blog-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                🕐 {readTime(post.content || '')}
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: 
                'clamp(26px, 4vw, 52px)',
              fontWeight: 900,
              color: 'var(--blog-heading)',
              margin: '0 0 20px',
              lineHeight: 1.15,
              letterSpacing: '-0.5px',
              textShadow: 
                '0 0 40px rgba(168,85,247,0.2)',
            }}>
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p style={{
                fontSize: '18px',
                color: 'var(--blog-body)',
                lineHeight: 1.7,
                margin: '0 0 32px',
                borderLeft: 
                  '3px solid #7c3aed',
                paddingLeft: '20px',
                fontStyle: 'italic',
              }}>
                {post.excerpt}
              </p>
            )}

            {/* Author row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              background: 
                'var(--blog-popular-bg)',
              border: 
                '1px solid var(--blog-card-border)',
              borderRadius: '14px',
              marginBottom: '40px',
              flexWrap: 'wrap',
              gap: '12px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 
                    'linear-gradient(135deg, #7c3aed, #22d3ee)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 900,
                  color: '#fff',
                  flexShrink: 0,
                  boxShadow: 
                    '0 0 16px rgba(124,58,237,0.4)',
                }}>
                  {(post.author_name || 'P')
                    [0].toUpperCase()}
                </div>
                <div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--blog-heading)',
                    margin: '0 0 2px',
                  }}>
                    {post.author_name || 
                      'PurpleSoftHub'}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--blog-body)',
                    margin: 0,
                  }}>
                    PurpleSoftHub Team
                  </p>
                </div>
              </div>

              {/* Share buttons */}
              <div style={{
                display: 'flex',
                gap: '8px',
              }}>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://purplesofthub.com/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 16px',
                    background: '#000',
                    color: '#fff',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: 
                      '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  𝕏 Share
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${post.title} - https://purplesofthub.com/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 16px',
                    background: '#25D366',
                    color: '#fff',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* ── FEATURED IMAGE ── */}
          {post.featured_image && (
            <div style={{
              maxWidth: '900px',
              margin: '0 auto',
              padding: 
                '0 clamp(16px, 4vw, 24px)',
              marginBottom: '48px',
            }}>
              <div style={{
                borderRadius: '20px',
                overflow: 'hidden',
                border: 
                  '1px solid var(--blog-card-border)',
                boxShadow: 
                  '0 0 40px var(--blog-glow-primary)',
                position: 'relative',
              }}>
                <img
                  src={post.featured_image}
                  alt={post.title}
                  style={{
                    width: '100%',
                    height: 'clamp(200px, 40vw, 460px)',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                {/* Cyan corner accent */}
                <div style={{
                  position: 'absolute',
                  top: 0, right: 0,
                  width: '40px', height: '40px',
                  borderTop: '2px solid #22d3ee',
                  borderRight: '2px solid #22d3ee',
                  borderRadius: '0 20px 0 0',
                }}/>
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0,
                  width: '40px', height: '40px',
                  borderBottom: '2px solid #7c3aed',
                  borderLeft: '2px solid #7c3aed',
                  borderRadius: '0 0 0 20px',
                }}/>
              </div>
            </div>
          )}

          {/* ── ARTICLE CONTENT ── */}
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: 
              '0 clamp(16px, 4vw, 24px) clamp(48px, 6vw, 80px)',
          }}>

            {/* Content card */}
            <div style={{
              background: 
                'var(--blog-sidebar-bg)',
              border: 
                '1px solid var(--blog-card-border)',
              borderRadius: '24px',
              padding: 'clamp(24px, 4vw, 48px)',
              backdropFilter: 'blur(10px)',
              marginBottom: '40px',
            }}>
              <div
                className="article-content"
                dangerouslySetInnerHTML={{
                  __html: 
                    `<p class="article-p">${content}</p>`,
                }}
              />
            </div>

            {/* Tags */}
            {post.tags && 
              post.tags.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '40px',
                alignItems: 'center',
              }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--blog-body)',
                  marginRight: '4px',
                }}>
                  Tags:
                </span>
                {post.tags.map(
                  (tag: string) => (
                  <span key={tag} style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#a855f7',
                    background: 
                      'rgba(124,58,237,0.1)',
                    border: 
                      '1px solid rgba(124,58,237,0.25)',
                    padding: '5px 14px',
                    borderRadius: '100px',
                    cursor: 'pointer',
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Share box */}
            <div style={{
              background: 
                'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(34,211,238,0.05))',
              border: 
                '1px solid rgba(124,58,237,0.25)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '48px',
            }}>
              <div>
                <p style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: 'var(--blog-heading)',
                  margin: '0 0 4px',
                }}>
                  Found this helpful? 💜
                </p>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--blog-body)',
                  margin: 0,
                }}>
                  Share it with your network
                </p>
              </div>
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
              }}>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://purplesofthub.com/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '10px 20px',
                    background: '#000',
                    color: '#fff',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 
                      '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  𝕏 Share on X
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${post.title} - https://purplesofthub.com/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '10px 20px',
                    background: '#25D366',
                    color: '#fff',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  💬 WhatsApp
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(`https://purplesofthub.com/blog/${post.slug}`)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '10px 20px',
                    background: '#229ED9',
                    color: '#fff',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  ✈️ Telegram
                </a>
              </div>
            </div>

            {/* Back to blog */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '64px',
            }}>
              <Link href="/blog" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                background: 
                  'rgba(124,58,237,0.1)',
                border: 
                  '1px solid rgba(124,58,237,0.3)',
                color: '#a855f7',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px',
                transition: 'all 0.2s',
              }}>
                ← Back to Blog
              </Link>
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <div>
                <h2 style={{
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  fontWeight: 900,
                  color: 'var(--blog-heading)',
                  margin: '0 0 24px',
                  textShadow: 
                    '0 0 20px rgba(168,85,247,0.2)',
                }}>
                  Related Articles
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 
                    'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '20px',
                }}>
                  {related.map(rp => (
                    <Link
                      key={rp.id}
                      href={`/blog/${rp.slug}`}
                      style={{ 
                        textDecoration: 'none' 
                      }}
                    >
                      <div style={{
                        background: 
                          'var(--blog-sidebar-bg)',
                        border: 
                          '1px solid var(--blog-card-border)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        transition: 'all 0.3s',
                      }}
                      className="blog-card">
                        {rp.featured_image && (
                          <img
                            src={rp.featured_image}
                            alt={rp.title}
                            style={{
                              width: '100%',
                              height: '140px',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        )}
                        <div style={{ 
                          padding: '16px' 
                        }}>
                          {rp.category && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: '#22d3ee',
                              background: 
                                'rgba(34,211,238,0.1)',
                              border: 
                                '1px solid rgba(34,211,238,0.25)',
                              padding: '3px 10px',
                              borderRadius: '100px',
                              display: 
                                'inline-block',
                              marginBottom: '8px',
                              textTransform: 
                                'uppercase',
                              letterSpacing: 
                                '0.06em',
                            }}>
                              {rp.category}
                            </span>
                          )}
                          <h3 style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            color: 
                              'var(--blog-heading)',
                            margin: '0 0 8px',
                            lineHeight: 1.3,
                          }}>
                            {rp.title}
                          </h3>
                          <p style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#a855f7',
                            margin: 0,
                          }}>
                            Read Article →
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        /* ── CSS VARIABLES ── */
        :root {
          --blog-space-bg: #f0ebff;
          --blog-card-bg: rgba(255,255,255,0.8);
          --blog-card-border: rgba(124,58,237,0.15);
          --blog-heading: #1a1a2e;
          --blog-body: #4a3f6b;
          --blog-grid-line: rgba(124,58,237,0.06);
          --blog-glow-primary: rgba(124,58,237,0.1);
          --blog-glow-cyan: rgba(34,211,238,0.06);
          --blog-sidebar-bg: rgba(255,255,255,0.7);
          --blog-popular-bg: rgba(124,58,237,0.05);
          --blog-text-muted: rgba(74,63,107,0.7);
        }

        .dark {
          --blog-space-bg: #06030f;
          --blog-card-bg: linear-gradient(135deg, rgba(13,5,32,0.9), rgba(26,5,53,0.8));
          --blog-card-border: rgba(124,58,237,0.25);
          --blog-heading: #ffffff;
          --blog-body: #9d8fd4;
          --blog-grid-line: rgba(124,58,237,0.06);
          --blog-glow-primary: rgba(124,58,237,0.15);
          --blog-glow-cyan: rgba(34,211,238,0.08);
          --blog-sidebar-bg: linear-gradient(135deg, rgba(13,5,32,0.95), rgba(26,5,53,0.9));
          --blog-popular-bg: rgba(124,58,237,0.06);
          --blog-text-muted: rgba(200,180,255,0.7);
        }

        /* ── ARTICLE CONTENT STYLES ── */
        .article-content {
          font-size: 16px;
          line-height: 1.85;
          color: var(--blog-body);
        }

        .article-p {
          margin: 0 0 20px;
          line-height: 1.85;
          color: var(--blog-body);
        }

        .article-h1 {
          font-size: clamp(24px, 3vw, 36px);
          font-weight: 900;
          color: var(--blog-heading);
          margin: 40px 0 16px;
          line-height: 1.2;
          text-shadow: 0 0 20px rgba(168,85,247,0.2);
        }

        .article-h2 {
          font-size: clamp(20px, 2.5vw, 28px);
          font-weight: 800;
          color: var(--blog-heading);
          margin: 36px 0 14px;
          line-height: 1.25;
          padding-left: 16px;
          border-left: 3px solid #7c3aed;
        }

        .article-h3 {
          font-size: clamp(17px, 2vw, 22px);
          font-weight: 700;
          color: var(--blog-heading);
          margin: 28px 0 12px;
          line-height: 1.3;
        }

        .article-strong {
          font-weight: 700;
          color: var(--blog-heading);
        }

        .article-code {
          background: rgba(124,58,237,0.1);
          color: #a855f7;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 14px;
          font-family: 'JetBrains Mono', monospace;
          border: 1px solid rgba(124,58,237,0.2);
        }

        .code-block {
          background: rgba(13,5,32,0.8);
          border: 1px solid rgba(124,58,237,0.25);
          border-radius: 12px;
          padding: 20px;
          overflow-x: auto;
          font-size: 14px;
          line-height: 1.6;
          margin: 20px 0;
          white-space: pre-wrap;
          box-shadow: 0 0 20px rgba(124,58,237,0.1);
        }

        .dark .code-block {
          background: rgba(13,5,32,0.9);
        }

        :root .code-block {
          background: rgba(26,5,53,0.08);
          border-color: rgba(124,58,237,0.2);
        }

        .code-block code {
          color: #22d3ee;
          font-family: 'JetBrains Mono', 
            'Fira Code', monospace;
        }

        .article-quote {
          border-left: 3px solid #7c3aed;
          padding: 14px 20px;
          margin: 24px 0;
          background: rgba(124,58,237,0.06);
          border-radius: 0 12px 12px 0;
          font-style: italic;
          color: var(--blog-body);
          box-shadow: 0 0 12px rgba(124,58,237,0.08);
        }

        .article-hr {
          border: none;
          border-top: 1px solid var(--blog-card-border);
          margin: 36px 0;
        }

        .article-ul {
          padding-left: 24px;
          margin: 16px 0;
          list-style: none;
        }

        .article-li {
          margin-bottom: 10px;
          color: var(--blog-body);
          position: relative;
          padding-left: 20px;
        }

        .article-li::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: #a855f7;
          font-size: 12px;
          top: 2px;
        }

        .article-link {
          color: #7c3aed;
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: 500;
          transition: color 0.2s;
        }

        .article-link:hover {
          color: #a855f7;
        }

        /* ── CARD HOVER ── */
        .blog-card:hover {
          transform: translateY(-4px);
          border-color: rgba(124,58,237,0.45) !important;
          box-shadow: 0 0 24px rgba(124,58,237,0.2);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .article-h1 { font-size: 22px; }
          .article-h2 { font-size: 18px; }
          .article-h3 { font-size: 16px; }
          .article-content { font-size: 15px; }
          .code-block { font-size: 13px; padding: 14px; }
        }
      `}</style>
    </>
  )
}