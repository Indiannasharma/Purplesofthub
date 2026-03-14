import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Post Not Found" };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com";
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${siteUrl}/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.description, type: "article", publishedTime: post.date },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const related = allPosts.filter((p) => p.slug !== post.slug && p.tag === post.tag).slice(0, 2);

  return (
    <main style={{ background: "#06030f", color: "#e2d9f3", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "120px 5% 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%,rgba(124,58,237,.18) 0%,transparent 60%)", pointerEvents: "none" }} />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#9d8fd4", fontSize: 14, textDecoration: "none", marginBottom: 32 }}>
            ← Back to Blog
          </Link>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(124,58,237,.2)", border: "1px solid rgba(124,58,237,.3)", borderRadius: 100, padding: "4px 14px", fontSize: 12, color: "#c084fc", fontWeight: 600 }}>{post.tag}</span>
            <span style={{ fontSize: 13, color: "#5b4d8a" }}>{post.readTime}</span>
            <span style={{ fontSize: 13, color: "#5b4d8a" }}>
              {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(28px,4vw,52px)", fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1.2, marginBottom: 20 }}>
            {post.title}
          </h1>
          <p style={{ color: "#9d8fd4", fontSize: 17, lineHeight: 1.8 }}>{post.description}</p>
          <div style={{ marginTop: 16, fontSize: 13, color: "#5b4d8a" }}>By {post.author}</div>
        </div>
      </section>

      {/* MDX Body */}
      <section style={{ padding: "20px 5% 80px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div className="mdx-body">
            <MDXRemote source={post.content} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "0 5% 60px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", background: "rgba(124,58,237,.08)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 24, padding: "48px 36px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(22px,3vw,36px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px", marginBottom: 12 }}>
            Ready to work with <span className="grad-text">PurpleSoftHub?</span>
          </h2>
          <p style={{ color: "#9d8fd4", marginBottom: 28, fontSize: 15 }}>Let&apos;s build your next project together.</p>
          <Link href="/contact">
            <button className="btn-main" style={{ padding: "13px 32px", fontSize: 15 }}>Get in Touch →</button>
          </Link>
        </div>
      </section>

      {/* Related Posts */}
      {related.length > 0 && (
        <section style={{ padding: "0 5% 80px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "Outfit", fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 24 }}>Related Articles</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration: "none" }}>
                  <div className="glass-card" style={{ padding: "24px 22px" }}>
                    <span style={{ background: "rgba(124,58,237,.2)", borderRadius: 100, padding: "3px 11px", fontSize: 11, color: "#c084fc", fontWeight: 600 }}>{p.tag}</span>
                    <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 16, color: "#fff", margin: "12px 0 8px", lineHeight: 1.4 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: "#5b4d8a" }}>{p.readTime}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />

      <style>{`
        .mdx-body { color: #b8a9d9; font-size: 16px; line-height: 1.85; }
        .mdx-body h2 { font-family: Outfit; font-size: clamp(20px,2.5vw,28px); font-weight: 800; color: #fff; margin: 48px 0 16px; letter-spacing: -0.5px; }
        .mdx-body h3 { font-family: Outfit; font-size: 19px; font-weight: 700; color: #e2d9f3; margin: 32px 0 12px; }
        .mdx-body p { margin-bottom: 20px; }
        .mdx-body ul, .mdx-body ol { padding-left: 24px; margin-bottom: 20px; }
        .mdx-body li { margin-bottom: 8px; }
        .mdx-body strong { color: #fff; font-weight: 700; }
        .mdx-body a { color: #a855f7; text-decoration: none; font-weight: 600; }
        .mdx-body a:hover { text-decoration: underline; }
        .mdx-body code { background: rgba(124,58,237,.15); border: 1px solid rgba(124,58,237,.3); border-radius: 6px; padding: 2px 8px; font-size: 14px; color: #c084fc; }
        .mdx-body blockquote { border-left: 3px solid #7c3aed; padding: 12px 20px; margin: 24px 0; background: rgba(124,58,237,.08); border-radius: 0 12px 12px 0; }
        .mdx-body hr { border: none; border-top: 1px solid rgba(124,58,237,.2); margin: 40px 0; }
      `}</style>
    </main>
  );
}
