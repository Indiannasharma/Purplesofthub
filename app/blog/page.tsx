import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Blog — Tech, Marketing & Startup Insights",
  description: "Practical articles on web development, digital marketing, SaaS, AI tools, and music distribution — written by the PurpleSoftHub team.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com"}/blog` },
  openGraph: { title: "Blog — PurpleSoftHub", description: "Tech insights, marketing guides, and music industry tips from the PurpleSoftHub team." },
};

export const revalidate = 60;

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  category: string | null;
  author_name: string | null;
  published_at: string | null;
  created_at: string;
  tags: string[] | null;
}

export default async function BlogPage() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { 
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, featured_image, category, author_name, published_at, created_at, tags')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Blog fetch error:', error);
  }

  const mappedPosts = (posts || []).map(p => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || '',
    coverImage: p.featured_image || null,
    category: p.category || '',
    author: p.author_name || 'PurpleSoftHub',
    date: p.published_at || p.created_at,
    tags: p.tags || [],
  }));

  return (
    <main style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <Navbar />
      <section style={{ padding: "120px 5% 60px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#7c3aed", textTransform: "uppercase", marginBottom: 14 }}>Resources</p>
              <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(32px,4vw,56px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-2px", marginBottom: 16 }}>
                Tech <span className="grad-text">Insights</span> & Guides
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: 17, maxWidth: 520, margin: "0 auto" }}>
                Practical articles on web dev, marketing, SaaS, AI, and music — written by the PurpleSoftHub team.
              </p>
            </div>
          </Reveal>

          {/* Blog Posts Grid */}
          {mappedPosts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 24px" }}>
              <p style={{ fontSize: "48px", marginBottom: "16px" }}>✍️</p>
              <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
                No posts yet
              </h2>
              <p style={{ fontSize: "15px", color: "var(--text-muted)" }}>
                Check back soon for insights and resources.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "28px", marginTop: "40px" }}>
              {mappedPosts.map(post => (
                <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                  <article style={{
                    background: "var(--card-bg, rgba(124,58,237,0.05))",
                    border: "1px solid rgba(124,58,237,0.15)",
                    borderRadius: "20px",
                    overflow: "hidden",
                    transition: "all 0.3s",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "translateY(-4px)";
                    el.style.boxShadow = "0 16px 48px rgba(124,58,237,0.12)";
                    el.style.borderColor = "rgba(124,58,237,0.3)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "none";
                    el.style.borderColor = "rgba(124,58,237,0.15)";
                  }}>

                    {/* Featured image */}
                    {post.coverImage ? (
                      <div style={{ height: "200px", overflow: "hidden" }}>
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        height: "200px",
                        background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(168,85,247,0.05))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "48px",
                      }}>
                        ✍️
                      </div>
                    )}

                    {/* Content */}
                    <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                      {/* Category + date */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                        {post.category && (
                          <span style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#a855f7",
                            background: "rgba(124,58,237,0.08)",
                            padding: "3px 10px",
                            borderRadius: "100px",
                          }}>
                            {post.category}
                          </span>
                        )}
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 style={{
                        fontSize: "18px",
                        fontWeight: 800,
                        color: "var(--text-primary)",
                        margin: "0 0 10px",
                        lineHeight: 1.3,
                        flex: 1,
                      }}>
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p style={{
                          fontSize: "14px",
                          color: "var(--text-muted)",
                          lineHeight: 1.6,
                          margin: "0 0 20px",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                        }}>
                          {post.excerpt}
                        </p>
                      )}

                      {/* Read more + author */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#7c3aed" }}>
                          Read More →
                        </span>
                        {post.author && (
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {post.author}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}