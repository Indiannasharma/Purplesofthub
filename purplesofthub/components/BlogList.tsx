"use client";
import { useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import type { PostMeta } from "@/lib/blog";

const TAGS = ["All", "Business", "AI & Tech", "Music", "Web Dev", "Marketing", "SaaS", "Mobile"];

const TAG_EMOJI: Record<string, string> = {
  Business: "💼", "AI & Tech": "🤖", Music: "🎵",
  "Web Dev": "⚡", Marketing: "📈", SaaS: "🚀", Mobile: "📱",
};

export default function BlogList({ posts }: { posts: PostMeta[] }) {
  const [activeTag, setActiveTag] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = posts.filter((p) => {
    const matchTag = activeTag === "All" || p.tag === activeTag;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <>
      {/* Search */}
      <div style={{ marginBottom: 28, maxWidth: 460, margin: "0 auto 28px" }}>
        <input
          type="text"
          placeholder="🔍  Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "12px 18px", borderRadius: 50, background: "var(--bg-card)", border: "1px solid rgba(168,85,247,.25)", color: "var(--text-primary)", fontSize: 15, fontFamily: "Outfit", outline: "none" }}
        />
      </div>

      {/* Tag filters */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
        {TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTag(t)}
            style={{
              padding: "8px 18px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s",
              background: activeTag === t ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "rgba(124,58,237,.1)",
              border: activeTag === t ? "none" : "1px solid rgba(168,85,247,.25)",
              color: activeTag === t ? "#fff" : "#c084fc",
              boxShadow: activeTag === t ? "0 6px 20px rgba(124,58,237,.35)" : "none",
            }}
          >{t}</button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", color: "#5b4d8a", padding: "60px 0", fontSize: 16 }}>No articles found.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24 }}>
          {filtered.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.05}>
              <Link href={`/blog/${p.slug}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                <div className="glass-card" style={{ overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ height: 150, background: "linear-gradient(135deg,rgba(124,58,237,.2),rgba(168,85,247,.1))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 }}>
                    {TAG_EMOJI[p.tag] || "📝"}
                  </div>
                  <div style={{ padding: "22px 22px 28px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ background: "rgba(124,58,237,.2)", border: "1px solid rgba(124,58,237,.3)", borderRadius: 100, padding: "3px 11px", fontSize: 11, color: "#c084fc", fontWeight: 600 }}>{p.tag}</span>
                      <span style={{ fontSize: 12, color: "#5b4d8a" }}>{p.readTime}</span>
                    </div>
                    <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 17, color: "var(--text-primary)", marginBottom: 10, lineHeight: 1.4, flex: 1 }}>{p.title}</div>
                    <p style={{ color: "#9d8fd4", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{p.description}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#5b4d8a" }}>{new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span style={{ color: "#a855f7", fontSize: 13, fontWeight: 600 }}>Read More →</span>
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}
