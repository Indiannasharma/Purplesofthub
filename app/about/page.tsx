import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com";

export const metadata: Metadata = {
  title: "About Us — PurpleSoftHub",
  description:
    "PurpleSoftHub is a digital innovation studio helping businesses, startups, and creators build powerful online experiences.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About Us — PurpleSoftHub",
    description:
      "PurpleSoftHub is a digital innovation studio helping businesses, startups, and creators build powerful online experiences.",
    url: `${SITE_URL}/about`,
    siteName: "PurpleSoftHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us — PurpleSoftHub",
    description:
      "PurpleSoftHub is a digital innovation studio helping businesses, startups, and creators build powerful online experiences.",
  },
};

const SERVICES = [
  { icon: "🎨", title: "Branding & Creative Design", desc: "Visual identity, logo design, brand guidelines, and creative direction." },
  { icon: "🌐", title: "Website & App Development", desc: "Modern websites, mobile apps, SaaS platforms, and custom dashboards." },
  { icon: "📣", title: "Digital Marketing & Advertising", desc: "Meta Ads, Google Ads, TikTok Ads, Snapchat Ads, and performance campaigns." },
  { icon: "📱", title: "Social Media Management", desc: "Content strategy, community management, and social media growth." },
  { icon: "🔍", title: "SEO & Growth Marketing", desc: "Search engine optimization, content marketing, and organic growth strategies." },
  { icon: "🎵", title: "Music Distribution & Promotion", desc: "Global music distribution and targeted promotion campaigns for artists." },
];

const APPROACH = [
  { n: "01", icon: "🎯", title: "Understand", desc: "We start by understanding your goals, audience, and market position." },
  { n: "02", icon: "🎨", title: "Design", desc: "We design intuitive experiences focused on usability and conversion." },
  { n: "03", icon: "⚙️", title: "Build", desc: "We develop reliable, scalable solutions using modern technology." },
  { n: "04", icon: "📈", title: "Grow", desc: "We deliver measurable results and support your long-term digital growth." },
];

const REASONS = [
  { icon: "💜", title: "Quality First", desc: "We prioritize quality and attention to detail in every project we deliver." },
  { icon: "🔬", title: "Innovation Driven", desc: "We stay ahead of digital trends so our clients always have the competitive edge." },
  { icon: "🤝", title: "True Partnership", desc: "We become your long-term digital partner, not just a one-time vendor." },
  { icon: "📊", title: "Results Focused", desc: "Everything we do is focused on producing measurable results for your business." },
];

export default function AboutPage() {
  return (
    <main style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ minHeight: "60vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", padding: "130px 5% 80px" }}>
        <div style={{ position: "absolute", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle,rgba(109,40,217,.18) 0%,transparent 65%)", top: "-20%", left: "-15%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,.14) 0%,transparent 65%)", bottom: "-10%", right: "0%", pointerEvents: "none" }} />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", textAlign: "center", position: "relative", zIndex: 2 }}>
          <Reveal>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,.12)", border: "1px solid rgba(168,85,247,.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 28, fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: 1 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 8px #a855f7", display: "inline-block" }} />
              WHO WE ARE
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(36px,4.5vw,62px)", fontWeight: 900, lineHeight: 1.1, color: "var(--text-primary)", letterSpacing: "-2px", marginBottom: 22 }}>
              About <span className="grad-text">PurpleSoftHub</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ color: "var(--text-muted)", fontSize: 17, lineHeight: 1.85, maxWidth: 660, margin: "0 auto" }}>
              PurpleSoftHub is a digital innovation studio focused on helping businesses, startups, and creators build powerful online experiences. We combine creativity, technology, and data-driven strategies to design and develop solutions that drive growth.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section style={{ padding: "90px 5%", background: "rgba(124,58,237,.04)", borderTop: "1px solid rgba(124,58,237,.12)", borderBottom: "1px solid rgba(124,58,237,.12)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          {/* Left */}
          <Reveal>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,.12)", border: "1px solid rgba(168,85,247,.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 20, fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: 1 }}>
                OUR MISSION
              </div>
              <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(26px,3vw,42px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px", lineHeight: 1.15, marginBottom: 20 }}>
                Empowering Businesses<br />to Grow <span className="grad-text">Digitally</span>
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.85, marginBottom: 18 }}>
                Our mission is to empower businesses and creators with innovative digital solutions that improve visibility, increase engagement, and accelerate growth.
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.85 }}>
                Our team specializes in building modern digital products — from websites and mobile apps to marketing campaigns and brand identities. We work with businesses of all sizes to create scalable solutions that help them compete and thrive in the digital economy.
              </p>
            </div>
          </Reveal>

          {/* Right — glass card */}
          <Reveal delay={0.15}>
            <div className="glass-card" style={{ padding: "36px 32px", textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🚀</div>
              <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 20, color: "var(--text-primary)", marginBottom: 12 }}>
                Digital Innovation Studio
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.75, marginBottom: 24 }}>
                We believe great digital products are built through collaboration, strategy, and technology.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 28 }}>
                {["🌍 Global Clients", "⚡ Fast Delivery", "💜 Quality First", "🔒 Secure & Scalable"].map((badge) => (
                  <span key={badge} style={{ background: "rgba(124,58,237,.12)", border: "1px solid rgba(168,85,247,.3)", borderRadius: 100, padding: "6px 14px", fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>
                    {badge}
                  </span>
                ))}
              </div>
              <div style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius: 14, padding: "18px 24px" }}>
                <div style={{ fontFamily: "Outfit", fontWeight: 900, fontSize: 22, color: "#fff", marginBottom: 4 }}>$2M+</div>
                <div style={{ color: "rgba(255,255,255,.85)", fontSize: 13, fontWeight: 500 }}>Client Revenue Generated</div>
              </div>
            </div>
          </Reveal>
        </div>
        <style>{`@media(max-width:768px){section > div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
      </section>

      {/* ── WHAT WE DO ── */}
      <section style={{ padding: "90px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>OUR SERVICES</p>
              <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px", marginBottom: 14 }}>
                Everything Your Business <span className="grad-text">Needs</span>
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
                We provide a full range of digital services to help you grow online.
              </p>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(310px,1fr))", gap: 20 }}>
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.05}>
                <div className="glass-card" style={{ padding: "30px 26px" }}>
                  <div style={{ fontSize: 38, marginBottom: 16 }}>{s.icon}</div>
                  <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 17, color: "var(--text-primary)", marginBottom: 10 }}>{s.title}</div>
                  <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.75 }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR APPROACH ── */}
      <section style={{ padding: "90px 5%", background: "rgba(124,58,237,.04)", borderTop: "1px solid rgba(124,58,237,.12)", borderBottom: "1px solid rgba(124,58,237,.12)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>HOW WE WORK</p>
              <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px", marginBottom: 14 }}>
                Our <span className="grad-text">Approach</span>
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: 16, maxWidth: 540, margin: "0 auto" }}>
                We believe great digital products are built through collaboration, strategy, and technology.
              </p>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
            {APPROACH.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.1}>
                <div className="glass-card" style={{ padding: "32px 24px", textAlign: "center" }}>
                  <div style={{ fontFamily: "Outfit", fontSize: 44, fontWeight: 900, color: "rgba(124,58,237,.25)", marginBottom: 12 }}>{p.n}</div>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#a855f7)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{p.icon}</div>
                  <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 16, color: "var(--text-primary)", marginBottom: 10 }}>{p.title}</div>
                  <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY WORK WITH US ── */}
      <section style={{ padding: "90px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>WHY PURPLESOFTHUB</p>
              <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px" }}>
                Built for Your <span className="grad-text">Success</span>
              </h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {REASONS.map((r, i) => (
              <Reveal key={r.title} delay={i * 0.08}>
                <div className="glass-card" style={{ padding: "32px 28px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#7c3aed,#a855f7)" }} />
                  <div style={{ fontSize: 36, marginBottom: 16 }}>{r.icon}</div>
                  <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", marginBottom: 10 }}>{r.title}</div>
                  <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.75 }}>{r.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "100px 5%", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%,rgba(124,58,237,.16) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <Reveal>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 680, margin: "0 auto" }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, color: "var(--accent)", textTransform: "uppercase", marginBottom: 20 }}>
              → Let&apos;s Build Something Great ←
            </div>
            <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(32px,5vw,58px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 20 }}>
              Ready to Build Something <span className="grad-text">Extraordinary?</span>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 17, marginBottom: 40, lineHeight: 1.7 }}>
              Let&apos;s become your long-term digital growth partner.
            </p>
            <div className="cta-row" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact">
                <button className="btn-main animate-glow" style={{ padding: "16px 38px", fontSize: 16 }}>Start a Project</button>
              </Link>
              <Link href="/contact">
                <button className="btn-outline" style={{ padding: "16px 38px", fontSize: 16 }}>Book a Discovery Call</button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
