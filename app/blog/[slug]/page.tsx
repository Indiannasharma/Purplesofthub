import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { marked } from "marked";

// Revalidate every 60 seconds
export const revalidate = 60;

// Generate static params from Supabase
export async function generateStaticParams() {
  // Use regular Supabase client (not SSR) for generateStaticParams
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published');

  return (posts || []).map(p => ({ slug: p.slug }));
}

// Generate metadata from Supabase
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, featured_image, seo_title, seo_description, slug, published_at, author_name')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!post) {
    return { title: "Post Not Found | PurpleSoftHub" };
  }

  const ogImage = post.featured_image || `${process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com"}/opengraph-image`;

  return {
    title: post.seo_title || `${post.title} | PurpleSoftHub Blog`,
    description: post.seo_description || post.excerpt,
    openGraph: {
      type: "article",
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com"}/blog/${post.slug}`,
      siteName: "PurpleSoftHub",
      publishedTime: post.published_at || undefined,
      authors: [post.author_name || "PurpleSoftHub"],
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: [ogImage],
    },
  };
}

// Markdown to HTML converter with styling
function markdownToHtml(md: string): string {
  if (!md) return "";

  return md
    // Code blocks first
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.15);border-radius:10px;padding:16px;overflow-x:auto;font-size:14px;line-height:1.6;margin:20px 0"><code>$1</code></pre>')
    // Headings
    .replace(/^### (.*$)/gm, '<h3 style="font-size:20px;font-weight:800;margin:28px 0 12px;color:var(--post-heading)">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="font-size:26px;font-weight:800;margin:36px 0 16px;color:var(--post-heading)">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="font-size:32px;font-weight:900;margin:40px 0 16px;color:var(--post-heading)">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--post-heading);font-weight:700">$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:rgba(124,58,237,0.1);color:#a855f7;padding:2px 7px;border-radius:5px;font-size:14px;font-family:monospace">$1</code>')
    // Blockquote
    .replace(/^> (.*$)/gm, '<blockquote style="border-left:3px solid #7c3aed;padding:12px 16px;margin:20px 0;background:rgba(124,58,237,0.04);border-radius:0 8px 8px 0;color:var(--post-body);font-style:italic">$1</blockquote>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(124,58,237,0.15);margin:32px 0"/>')
    // Bullet lists
    .replace(/^- (.*$)/gm, '<li style="margin-bottom:8px;padding-left:4px">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul style="padding-left:24px;margin:16px 0">$&</ul>')
    // Line breaks
    .replace(/\n\n/g, '</p><p style="margin:0 0 16px;line-height:1.85">')
    .replace(/\n/g, '<br/>');
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !post) {
    notFound();
  }

  // Get related posts
  const { data: related } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, featured_image, category, published_at')
    .eq('status', 'published')
    .eq('category', post.category || '')
    .neq('id', post.id)
    .limit(3);

  const htmlContent = markdownToHtml(post.content || '');

  return (
    <main style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <Navbar />

      <article>
        {/* Post hero */}
        <div style={{
          background: post.featured_image ? "transparent" : "linear-gradient(135deg, #06030f, #0d0520)",
          position: "relative",
        }}>
          {post.featured_image && (
            <div style={{
              position: "relative",
              height: "clamp(280px, 40vw, 480px)",
              overflow: "hidden",
            }}>
              <img src={post.featured_image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))" }} />
            </div>
          )}
        </div>

        {/* Post content container */}
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "clamp(32px, 4vw, 60px) 24px clamp(48px, 6vw, 80px)" }}>

          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "28px", fontSize: "13px", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Home</Link>
            <span style={{ color: "#4b5563" }}>›</span>
            <Link href="/blog" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Blog</Link>
            {post.category && (
              <>
                <span style={{ color: "#4b5563" }}>›</span>
                <span style={{ color: "#7c3aed" }}>{post.category}</span>
              </>
            )}
          </div>

          {/* Category + Date + Author */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            {post.category && (
              <span style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#a855f7",
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.2)",
                padding: "4px 14px",
                borderRadius: "100px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>
                {post.category}
              </span>
            )}
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              {new Date(post.published_at || post.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            {post.author_name && (
              <>
                <span style={{ color: "#4b5563" }}>·</span>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{post.author_name}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "Outfit",
            fontSize: "clamp(26px, 4vw, 44px)",
            fontWeight: 900,
            color: "var(--text-primary)",
            margin: "0 0 20px",
            lineHeight: 1.15,
            letterSpacing: "-0.5px",
          }}>
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p style={{
              fontSize: "18px",
              color: "var(--text-muted)",
              lineHeight: 1.7,
              margin: "0 0 36px",
              borderLeft: "3px solid #7c3aed",
              paddingLeft: "16px",
              fontStyle: "italic",
            }}>
              {post.excerpt}
            </p>
          )}

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(124,58,237,0.12)", marginBottom: "36px" }} />

          {/* Blog content */}
          <div
            style={{ fontSize: "16px", lineHeight: 1.85, color: "var(--text-secondary)" }}
            dangerouslySetInnerHTML={{ __html: `<p style="margin:0 0 16px;line-height:1.85">${htmlContent}</p>` }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginTop: "48px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(124,58,237,0.12)",
            }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", marginRight: "4px" }}>Tags:</span>
              {post.tags.map((tag: string) => (
                <span key={tag} style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#7c3aed",
                  background: "rgba(124,58,237,0.08)",
                  border: "1px solid rgba(124,58,237,0.15)",
                  padding: "4px 12px",
                  borderRadius: "100px",
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Share section */}
          <div style={{
            marginTop: "48px",
            padding: "24px",
            background: "rgba(124,58,237,0.04)",
            border: "1px solid rgba(124,58,237,0.12)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>Found this helpful?</p>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>Share it with your network</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com"}/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "8px 16px",
                  background: "#000",
                  color: "#fff",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                𝕏 Share
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${post.title} - ${process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com"}/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "8px 16px",
                  background: "#25D366",
                  color: "#fff",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                💬 WhatsApp
              </a>
            </div>
          </div>

          {/* Back to blog */}
          <div style={{ marginTop: "40px" }}>
            <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#7c3aed", textDecoration: "none", fontWeight: 600, fontSize: "14px" }}>
              ← Back to Blog
            </Link>
          </div>
        </div>
      </article>

      {/* Related posts */}
      {related && related.length > 0 && (
        <section style={{
          background: "var(--related-bg, rgba(124,58,237,0.03))",
          padding: "clamp(40px, 5vw, 64px) 24px",
          borderTop: "1px solid rgba(124,58,237,0.1)",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 28px" }}>Related Posts</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
              {related.map(rp => (
                <Link key={rp.id} href={`/blog/${rp.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "var(--card-bg, rgba(124,58,237,0.05))",
                    border: "1px solid rgba(124,58,237,0.15)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "translateY(-3px)";
                    el.style.boxShadow = "0 8px 24px rgba(124,58,237,0.1)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "none";
                  }}>
                    {rp.featured_image && (
                      <img src={rp.featured_image} alt={rp.title} style={{ width: "100%", height: "160px", objectFit: "cover", display: "block" }} />
                    )}
                    <div style={{ padding: "16px" }}>
                      {rp.category && (
                        <span style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#a855f7",
                          background: "rgba(124,58,237,0.08)",
                          padding: "2px 8px",
                          borderRadius: "100px",
                          display: "inline-block",
                          marginBottom: "8px",
                        }}>
                          {rp.category}
                        </span>
                      )}
                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px", lineHeight: 1.3 }}>
                        {rp.title}
                      </h3>
                      <p style={{ fontSize: "12px", color: "#7c3aed", margin: 0, fontWeight: 600 }}>Read More →</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{
        background: "linear-gradient(135deg, #06030f, #0d0520)",
        padding: "clamp(48px, 6vw, 80px) 24px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: "var(--text-primary)", margin: "0 0 16px" }}>
            Ready to grow your digital presence?
          </h2>
          <p style={{ fontSize: "16px", color: "var(--text-muted)", margin: "0 0 32px", lineHeight: 1.7 }}>
            Let PurpleSoftHub build something exceptional for your business.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: 800,
              fontSize: "15px",
              boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
            }}>
              Start a Project →
            </Link>
            <Link href="/blog" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.25)",
              color: "#a855f7",
              padding: "14px 32px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "15px",
            }}>
              ← More Posts
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}