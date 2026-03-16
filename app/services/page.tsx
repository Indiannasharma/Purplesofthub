import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Link from "next/link";
import services from "@/app/services/_data/services";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com";

export const metadata: Metadata = {
  title: "Services — Web, Mobile, Marketing, SaaS & Music | PurpleSoftHub",
  description:
    "Explore all PurpleSoftHub services: Web Development, Mobile Apps, Digital Marketing, UI/UX Design, SaaS Development, Music Distribution, Branding, SEO, Social Media, and E-commerce.",
  alternates: { canonical: `${SITE_URL}/services` },
  openGraph: {
    title: "Our Services — PurpleSoftHub",
    description: "10 digital services under one roof: Web, Mobile, Marketing, SaaS, Design, Music & more.",
    url: `${SITE_URL}/services`,
    siteName: "PurpleSoftHub",
    type: "website",
  },
};

const CATEGORIES = ["All", "Development", "Design", "Marketing", "Music"];

export default function ServicesPage() {
  return (
    <main style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ padding: "120px 5% 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%,rgba(124,58,237,.2) 0%,transparent 60%)", pointerEvents: "none" }} />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <Reveal>
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,.12)", border: "1px solid rgba(168,85,247,.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 24, fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: 1 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 8px #a855f7", display: "inline-block" }} />
              WHAT WE OFFER
            </div>
            <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(32px,4vw,62px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-2px", marginBottom: 16 }}>
              10 Services. <span className="grad-text">One Powerful Hub.</span>
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 18, maxWidth: 580, margin: "0 auto 40px" }}>
              Everything your business needs to build, launch, market, and grow — under one roof.
            </p>
            <Link href="/contact">
              <button className="btn-main animate-glow" style={{ padding: "14px 32px", fontSize: 16 }}>Get a Free Quote →</button>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── SERVICES GRID ── */}
      <section style={{ padding: "60px 5% 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Category pills */}
          <Reveal>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 48, justifyContent: "center" }}>
              {CATEGORIES.map((cat) => (
                <span key={cat} style={{ background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 100, padding: "6px 18px", fontSize: 13, color: "var(--accent)", fontWeight: 600, cursor: "default" }}>
                  {cat}
                </span>
              ))}
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 24 }}>
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={i * 0.04}>
                <Link href={`/services/${s.slug}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                  <div className="glass-card" style={{ padding: "32px 28px", height: "100%", display: "flex", flexDirection: "column", cursor: "pointer", position: "relative", overflow: "hidden" }}>
                    {/* Top colour bar */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${s.color},#a855f7)` }} />

                    {/* Icon + category */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg,${s.color},#a855f7)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: `0 8px 24px ${s.color}33` }}>
                        {s.icon}
                      </div>
                      <span style={{ background: "rgba(124,58,237,.1)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 100, padding: "4px 12px", fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>
                        {s.category}
                      </span>
                    </div>

                    {/* Title + tagline */}
                    <div style={{ fontFamily: "Outfit", fontSize: 19, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>{s.title}</div>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.75, marginBottom: 20, flexGrow: 1 }}>
                      {s.tagline}
                    </p>

                    {/* Feature pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
                      {s.features.slice(0, 3).map((f) => (
                        <span key={f} style={{ background: "rgba(124,58,237,.08)", border: "1px solid rgba(168,85,247,.2)", borderRadius: 100, padding: "3px 10px", fontSize: 11, color: "var(--accent)", fontWeight: 500 }}>{f}</span>
                      ))}
                    </div>

                    {/* CTA row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--accent)", fontSize: 13, fontWeight: 700 }}>Learn more →</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        {s.technologies.slice(0, 2).map((t) => (
                          <span key={t} style={{ background: "rgba(124,58,237,.1)", borderRadius: 6, padding: "2px 8px", fontSize: 11, color: "#c084fc", fontWeight: 500 }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section style={{ padding: "90px 5%", background: "rgba(124,58,237,.04)", borderTop: "1px solid rgba(124,58,237,.12)", borderBottom: "1px solid rgba(124,58,237,.12)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>WHY PURPLESOFTHUB</p>
              <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,46px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px" }}>
                One Agency. <span className="grad-text">Everything You Need.</span>
              </h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
            {[
              { icon: "🚀", title: "Fast Delivery", desc: "We move fast. Most projects kick off within 48 hours of your deposit." },
              { icon: "💜", title: "Quality First", desc: "Every deliverable goes through a quality review before it reaches you." },
              { icon: "📊", title: "Results Focused", desc: "We measure everything. If it doesn't move the needle, we change it." },
              { icon: "🔒", title: "Transparent Pricing", desc: "No hidden fees. You get a clear quote before we start anything." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="glass-card" style={{ padding: "32px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>{item.icon}</div>
                  <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 17, color: "var(--text-primary)", marginBottom: 10 }}>{item.title}</div>
                  <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "90px 5%", textAlign: "center" }}>
        <Reveal>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(26px,3.5vw,46px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px", marginBottom: 16 }}>
              Not Sure Which Service You Need?
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 16, marginBottom: 36, lineHeight: 1.75 }}>
              Book a free discovery call and we&apos;ll help you figure out exactly what your business needs.
            </p>
            <Link href="/contact">
              <button className="btn-main animate-glow" style={{ padding: "15px 36px", fontSize: 16 }}>
                📅 Book a Free Discovery Call
              </button>
            </Link>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
