"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

const PROJECTS = [
  {
    slug: "eco-pi-rewards",
    emoji: "♻️",
    title: "Eco Pi Rewards",
    category: "Web Development",
    tag: "Sustainability · Blockchain",
    description: "Environmental sustainability rewards platform where users recycle bottles and earn Pi cryptocurrency as rewards.",
    tech: ["Next.js", "React", "Tailwind CSS", "Pi Network API"],
    color: "#22c55e",
  },
  {
    slug: "24hrs-content-hub",
    emoji: "📸",
    title: "24HRS Content Hub",
    category: "Web Development",
    tag: "Creative · Booking",
    description: "Premium content creation studio in Lekki, Lagos — photoshoots, podcasts, brand content and events with online booking.",
    tech: ["HTML", "Tailwind CSS", "JavaScript", "Netlify"],
    color: "#f59e0b",
  },
  {
    slug: "starzz-properties",
    emoji: "🏠",
    title: "Starzz Properties Ltd",
    category: "Web Development",
    tag: "Real Estate · Lead Generation",
    description: "Premium real estate platform with property listings, lead generation tools and professional brand presence.",
    tech: ["Next.js", "Tailwind CSS", "MongoDB", "Nodemailer"],
    color: "#7c3aed",
  },
  {
    slug: "3rdyearts",
    emoji: "🎨",
    title: "3rdyearts",
    category: "UI/UX Design",
    tag: "Creative · Portfolio",
    description: "Creative digital solutions platform showcasing artistic projects, digital art and creative services.",
    tech: ["React", "Tailwind CSS", "Framer Motion", "Netlify"],
    color: "#ec4899",
  },
  {
    slug: "collinskind-fashion",
    emoji: "👗",
    title: "CollinsKind Fashion",
    category: "Digital Marketing",
    tag: "Fashion · Branding",
    description: "Timeless fashion brand digital presence — website, social media strategy and brand identity.",
    tech: ["Next.js", "Tailwind CSS", "Instagram API", "Meta Ads"],
    color: "#a855f7",
  },
];

const FILTERS = ["All", "Web Development", "UI/UX Design", "Digital Marketing"];

export default function PortfolioPage() {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? PROJECTS : PROJECTS.filter(p => p.category === active);

  return (
    <main style={{ background: "#06030f", color: "#e2d9f3", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: "120px 5% 80px", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%,rgba(124,58,237,.22) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 700, margin: "0 auto" }}>
          <Reveal>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,.15)", border: "1px solid rgba(168,85,247,.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 24, fontSize: 12, fontWeight: 600, color: "#c084fc", letterSpacing: 1 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 8px #a855f7", display: "inline-block" }} />
              OUR WORK
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, color: "#fff", letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 20 }}>
              Projects We&apos;re <span className="grad-text">Proud Of</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ color: "#9d8fd4", fontSize: 17, lineHeight: 1.8 }}>
              Real products. Real results. Here&apos;s a selection of work we&apos;ve built for clients across the world.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Filter Buttons */}
      <section style={{ padding: "0 5% 60px" }}>
        <Reveal>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 48 }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActive(f)}
                style={{
                  padding: "10px 22px", borderRadius: 100, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all .2s",
                  background: active === f ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "rgba(124,58,237,.1)",
                  border: active === f ? "none" : "1px solid rgba(168,85,247,.25)",
                  color: active === f ? "#fff" : "#c084fc",
                  boxShadow: active === f ? "0 8px 24px rgba(124,58,237,.4)" : "none",
                }}
              >{f}</button>
            ))}
          </div>
        </Reveal>

        {/* Project Cards */}
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24 }}>
          {filtered.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.07}>
              <div className="glass-card" style={{ padding: "32px 28px", display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
                {/* Top accent line */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${p.color},#a855f7)`, borderRadius: "20px 20px 0 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 44 }}>{p.emoji}</div>
                  <span style={{ background: "rgba(124,58,237,.15)", border: "1px solid rgba(168,85,247,.25)", borderRadius: 100, padding: "4px 12px", fontSize: 11, color: "#c084fc", fontWeight: 600 }}>
                    {p.category}
                  </span>
                </div>

                <div>
                  <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 6 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: p.color, fontWeight: 600, marginBottom: 10 }}>{p.tag}</div>
                  <p style={{ color: "#9d8fd4", fontSize: 14, lineHeight: 1.75 }}>{p.description}</p>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
                  {p.tech.map(t => (
                    <span key={t} style={{ background: "rgba(124,58,237,.12)", border: "1px solid rgba(168,85,247,.2)", borderRadius: 100, padding: "3px 10px", fontSize: 12, color: "#c084fc", fontWeight: 500 }}>{t}</span>
                  ))}
                </div>

                <Link href={`/portfolio/${p.slug}`} style={{ marginTop: 8 }}>
                  <button className="btn-main" style={{ width: "100%", padding: "12px 20px", fontSize: 14 }}>
                    View Case Study →
                  </button>
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 5%", textAlign: "center" }}>
        <Reveal>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", marginBottom: 16 }}>
              Want to be our <span className="grad-text">next project?</span>
            </h2>
            <p style={{ color: "#9d8fd4", marginBottom: 32, fontSize: 16 }}>Let&apos;s build something extraordinary together.</p>
            <Link href="/contact">
              <button className="btn-main animate-glow" style={{ padding: "15px 38px", fontSize: 16 }}>Start a Project →</button>
            </Link>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
