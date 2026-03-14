import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import BlogList from "@/components/BlogList";
import NewsletterSignup from "@/components/NewsletterSignup";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Tech, Marketing & Startup Insights",
  description: "Practical articles on web development, digital marketing, SaaS, AI tools, and music distribution — written by the PurpleSoftHub team.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com"}/blog` },
  openGraph: { title: "Blog — PurpleSoftHub", description: "Tech insights, marketing guides, and music industry tips from the PurpleSoftHub team." },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <Navbar />
      <section style={{ padding: "120px 5% 60px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#7c3aed", textTransform: "uppercase", marginBottom: 14 }}>Resources</p>
              <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(32px,4vw,56px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-2px", marginBottom: 16 }}>
                Tech <span className="grad-text">Insights</span> &amp; Guides
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: 17, maxWidth: 520, margin: "0 auto" }}>
                Practical articles on web dev, marketing, SaaS, AI, and music — written by the PurpleSoftHub team.
              </p>
            </div>
          </Reveal>
          <BlogList posts={posts} />
        </div>
      </section>
      <NewsletterSignup />
      <Footer />
    </main>
  );
}
