import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import NewsletterSignup from "@/components/NewsletterSignup";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com";

export const metadata: Metadata = {
  title: "PurpleSoftHub — Digital Innovation Studio",
  description:
    "PurpleSoftHub builds websites, mobile apps, SaaS platforms, AI tools, and runs digital marketing & music distribution for businesses worldwide.",
  alternates: { canonical: SITE_URL },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "PurpleSoftHub",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.ico` },
      contactPoint: { "@type": "ContactPoint", email: "purplesofthub@gmail.com", contactType: "customer service" },
      sameAs: ["https://twitter.com/purplesofthub", "https://instagram.com/purplesofthub", "https://facebook.com/purplesofthub"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "PurpleSoftHub",
      description: "Digital Innovation Studio — Web, Mobile, Marketing & Music",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

const SERVICES = [
  { icon: "🌐", title: "Web Development", desc: "Business sites, SaaS platforms, e-commerce stores & custom dashboards built to convert.", tags: ["Next.js", "React", "Tailwind"] },
  { icon: "📱", title: "Mobile App Development", desc: "Cross-platform Flutter & React Native apps for iOS and Android that users love.", tags: ["Flutter", "React Native", "iOS/Android"] },
  { icon: "📣", title: "Digital Marketing", desc: "Meta, Google, TikTok & Snapchat ads — plus SEO strategies that drive real growth.", tags: ["Meta Ads", "Google Ads", "SEO"] },
  { icon: "🎨", title: "UI/UX Design", desc: "Pixel-perfect product design grounded in user psychology and conversion principles.", tags: ["Figma", "Prototyping", "Research"] },
  { icon: "⚙️", title: "SaaS Development", desc: "AI tools, automation dashboards and creator platforms built from MVP to scale.", tags: ["SaaS", "AI Tools", "Automation"] },
  { icon: "🎵", title: "Music Distribution", desc: "Get your music on 150+ platforms and grow your fanbase with targeted promo.", tags: ["Spotify", "Apple Music", "Promotion"] },
];

const SUCCESS = [
  { icon: "📈", tag: "E-Commerce Growth", challenge: "Low sales, high CPA", solution: "Shopify + Facebook Ads", result: "3.5× Revenue Increase" },
  { icon: "📱", tag: "App Development", challenge: "Build a Fitness App", solution: "Flutter & React Native", result: "50K+ Downloads" },
  { icon: "🎵", tag: "Music Promotion", challenge: "Increase Spotify Streams", solution: "Playlist Campaigns", result: "500K+ Streams" },
];

const PROCESS = [
  { n: "01", icon: "💡", title: "Discovery", desc: "We map your goals, audience, and build a strategic roadmap." },
  { n: "02", icon: "🎨", title: "Design", desc: "Prototypes & UI approved before a single line of code is written." },
  { n: "03", icon: "⚙️", title: "Development", desc: "Agile sprints, clean code, regular demos." },
  { n: "04", icon: "🚀", title: "Launch", desc: "Deploy, monitor, optimise, and support post-launch." },
];

const TESTIMONIALS = [
  { name: "Amara Osei", role: "CEO, BrightPath Ventures", text: "PurpleSoftHub transformed our online presence. Leads doubled within a month of launch.", initials: "AO" },
  { name: "James Whitfield", role: "Founder, StackFlow", text: "They delivered our MVP faster than any agency we've worked with. Quality was world-class.", initials: "JW" },
  { name: "DJ Motive", role: "Independent Artist", text: "Went from zero to 500K streams in 3 months. Their music promo is on another level.", initials: "DM" },
];

export default function Home() {
  return (
    <main style={{ background: "#06030f", color: "#e2d9f3", minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      {/* ── HERO ── */}
      <section id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", padding: "100px 5% 60px" }}>
        <div style={{ position: "absolute", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle,rgba(109,40,217,.25) 0%,transparent 65%)", top: "-20%", left: "-15%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,.2) 0%,transparent 65%)", bottom: "-10%", right: "0%", pointerEvents: "none" }} />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <Reveal>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,.15)", border: "1px solid rgba(168,85,247,.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 28, fontSize: 12, fontWeight: 600, color: "#c084fc", letterSpacing: 1 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 8px #a855f7", display: "inline-block" }} />
                DIGITAL INNOVATION STUDIO
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(36px,4.5vw,62px)", fontWeight: 900, lineHeight: 1.1, color: "#fff", letterSpacing: "-2px", marginBottom: 22 }}>
                Building Technology<br />for the <span className="grad-text">Next Generation</span><br />of Businesses
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p style={{ color: "#9d8fd4", fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
                Web Development · Mobile Apps · Digital Marketing · Music Distribution
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
                <Link href="/contact">
                  <button className="btn-main" style={{ padding: "14px 30px", fontSize: 15 }}>Start a Project</button>
                </Link>
                <Link href="/contact">
                  <button className="btn-outline" style={{ padding: "14px 30px", fontSize: 15 }}>Book a Discovery Call</button>
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div style={{ display: "flex", gap: 36 }}>
                {[["50+", "Projects Shipped"], ["6", "Core Services"], ["98%", "Client Satisfaction"]].map(([n, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: "Outfit", fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>{n}</div>
                    <div style={{ fontSize: 12, color: "#5b4d8a", fontWeight: 500, marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Device Mockup */}
          <Reveal delay={0.2}>
            <div className="animate-float" style={{ position: "relative", zIndex: 3 }}>
              <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,.3),rgba(168,85,247,.2))", border: "1px solid rgba(168,85,247,.4)", borderRadius: 18, padding: 14, backdropFilter: "blur(20px)", boxShadow: "0 20px 60px rgba(124,58,237,.4)", maxWidth: 380, margin: "0 auto" }}>
                <div style={{ background: "rgba(0,0,0,.4)", borderRadius: 12, padding: 20, minHeight: 220 }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                    {["#ff5f56", "#ffbd2e", "#27c93f"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ height: 12, background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: 6, width: "60%" }} />
                    <div style={{ height: 8, background: "rgba(168,85,247,.2)", borderRadius: 4, width: "80%" }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
                      {[0, 1, 2].map(i => <div key={i} style={{ height: 64, background: `linear-gradient(135deg,rgba(124,58,237,${.15 + i * .1}),rgba(168,85,247,${.1 + i * .08}))`, borderRadius: 10, border: "1px solid rgba(168,85,247,.2)" }} />)}
                    </div>
                    <div style={{ height: 36, background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: 8, width: "50%" }} />
                  </div>
                </div>
              </div>
              <div className="animate-float-reverse" style={{ position: "absolute", right: -20, top: 20, background: "linear-gradient(135deg,rgba(109,40,217,.4),rgba(168,85,247,.25))", border: "1px solid rgba(168,85,247,.4)", borderRadius: 24, padding: 8, width: 110, backdropFilter: "blur(20px)", boxShadow: "0 16px 40px rgba(124,58,237,.5)" }}>
                <div style={{ background: "rgba(0,0,0,.5)", borderRadius: 18, padding: 10, minHeight: 170 }}>
                  <div style={{ width: 30, height: 4, background: "rgba(168,85,247,.5)", borderRadius: 4, margin: "0 auto 10px" }} />
                  {[0, 1, 2, 3].map(i => <div key={i} style={{ height: 8, background: `rgba(168,85,247,${.15 + i * .05})`, borderRadius: 4, marginBottom: 6, width: `${70 + i * 5}%` }} />)}
                  <div style={{ height: 28, background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: 8, marginTop: 10 }} />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
        <style>{`@media(max-width:768px){#home > div{grid-template-columns:1fr!important}#home > div > div:last-child{display:none}}`}</style>
      </section>

      {/* ── FEATURE CARDS ── */}
      <section style={{ padding: "0 5% 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          {[
            { icon: "💻", title: "Digital Solutions", sub: "Web, Mobile & Marketing", cta: "Learn More", href: "#services", color: "#4f46e5" },
            { icon: "🎓", title: "Purplesofthub Academy", sub: "Learn In-Demand Tech Skills", cta: "View Courses", href: "/blog", color: "#7c3aed" },
            { icon: "🎵", title: "Music Distribution", sub: "Promote & Distribute Your Music", cta: "Get Started", href: "#music", color: "#86198f" },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 0.1}>
              <div className="glass-card" style={{ padding: "28px 28px 24px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${c.color},#a855f7)` }} />
                <div style={{ fontSize: 32, marginBottom: 14 }}>{c.icon}</div>
                <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 8 }}>{c.title}</div>
                <div style={{ color: "#9d8fd4", fontSize: 14, marginBottom: 20 }}>{c.sub}</div>
                <Link href={c.href}>
                  <button style={{ background: "rgba(124,58,237,.15)", border: "1px solid rgba(168,85,247,.3)", borderRadius: 100, padding: "8px 18px", color: "#c084fc", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    {c.cta} →
                  </button>
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding: "90px 5%", background: "rgba(124,58,237,.04)", borderTop: "1px solid rgba(124,58,237,.12)", borderBottom: "1px solid rgba(124,58,237,.12)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#7c3aed", textTransform: "uppercase", marginBottom: 12 }}>What We Build</p>
              <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", marginBottom: 14 }}>
                6 Services. <span className="grad-text">One Powerful Hub.</span>
              </h2>
              <p style={{ color: "#9d8fd4", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>Everything your business needs to grow — under one roof.</p>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(310px,1fr))", gap: 20 }}>
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.05}>
                <div className="glass-card" style={{ padding: "30px 26px" }}>
                  <div style={{ fontSize: 38, marginBottom: 16 }}>{s.icon}</div>
                  <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 17, color: "#fff", marginBottom: 10 }}>{s.title}</div>
                  <p style={{ color: "#9d8fd4", fontSize: 14, lineHeight: 1.75, marginBottom: 18 }}>{s.desc}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {s.tags.map(t => (
                      <span key={t} style={{ background: "rgba(124,58,237,.15)", border: "1px solid rgba(168,85,247,.25)", borderRadius: 100, padding: "3px 11px", fontSize: 12, color: "#c084fc", fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── MUSIC ── */}
      <section id="music" style={{ padding: "100px 5%", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 50%,rgba(134,25,143,.18) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <Reveal>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#e879f9", textTransform: "uppercase", marginBottom: 14 }}>✦ Unique Service</p>
            <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,46px)", fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1.15, marginBottom: 20 }}>
              Music Distribution<br />
              <span style={{ background: "linear-gradient(135deg,#e879f9,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>& Promotion</span>
            </h2>
            <p style={{ color: "#9d8fd4", fontSize: 16, lineHeight: 1.85, marginBottom: 32 }}>We help artists get heard worldwide. From Spotify & Apple Music distribution to social media campaigns that build real, loyal fanbases.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
              {["🎵 Distribute to 150+ platforms globally", "📱 TikTok, Reels & YouTube promo campaigns", "🎨 Artist branding & cover art design", "📊 Stream analytics & audience insights"].map(t => (
                <div key={t} style={{ color: "#b8a9d9", fontSize: 15 }}>{t}</div>
              ))}
            </div>
            <Link href="/contact">
              <button className="btn-main" style={{ padding: "13px 30px", fontSize: 15, background: "linear-gradient(135deg,#86198f,#a855f7)" }}>
                🎵 Promote My Music
              </button>
            </Link>
          </Reveal>
          <Reveal delay={0.15}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[["🎧","150+ Platforms","Global distribution"],["📈","Real Growth","Authentic streams"],["🎨","Artist Branding","Visual identity"],["📢","Promotion","Targeted campaigns"]].map(([ic, tt, dd]) => (
                <div key={tt} className="glass-card" style={{ padding: "24px 18px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{ic}</div>
                  <div style={{ fontWeight: 800, color: "#fff", fontSize: 15, marginBottom: 6 }}>{tt}</div>
                  <div style={{ color: "#5b4d8a", fontSize: 13 }}>{dd}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <style>{`@media(max-width:768px){#music > div{grid-template-columns:1fr!important}}`}</style>
      </section>

      {/* ── SUCCESS STORIES ── */}
      <section style={{ padding: "90px 5%", background: "rgba(0,0,0,.3)", borderTop: "1px solid rgba(124,58,237,.12)", borderBottom: "1px solid rgba(124,58,237,.12)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(26px,3vw,42px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>✦ Our Success Stories ✦</h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 20 }}>
            {SUCCESS.map((s, i) => (
              <Reveal key={s.tag} delay={i * 0.1}>
                <div className="glass-card" style={{ padding: "28px 24px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#7c3aed,#a855f7)" }} />
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                  <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 17, color: "#fff", marginBottom: 18 }}>{s.tag}</div>
                  {[["Challenge", s.challenge], ["Solution", s.solution], ["Result", s.result]].map(([label, val]) => (
                    <div key={label} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: label === "Result" ? "#a855f7" : "#5b4d8a", minWidth: 65 }}>{label}:</span>
                      <span style={{ fontSize: 13, color: label === "Result" ? "#c084fc" : "#9d8fd4", fontWeight: label === "Result" ? 700 : 400 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section id="process" style={{ padding: "90px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#7c3aed", textTransform: "uppercase", marginBottom: 12 }}>How We Work</p>
              <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 900, color: "#fff", letterSpacing: "-1.5px" }}>Our <span className="grad-text">Process</span></h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
            {PROCESS.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.1}>
                <div className="glass-card" style={{ padding: "32px 24px", textAlign: "center" }}>
                  <div style={{ fontFamily: "Outfit", fontSize: 44, fontWeight: 900, color: "rgba(124,58,237,.2)", marginBottom: 12 }}>{p.n}</div>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#a855f7)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{p.icon}</div>
                  <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 16, color: "#fff", marginBottom: 10 }}>{p.title}</div>
                  <p style={{ color: "#9d8fd4", fontSize: 14, lineHeight: 1.7 }}>{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "90px 5%", background: "rgba(124,58,237,.04)", borderTop: "1px solid rgba(124,58,237,.12)", borderBottom: "1px solid rgba(124,58,237,.12)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#7c3aed", textTransform: "uppercase", marginBottom: 12 }}>Client Love</p>
              <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 900, color: "#fff", letterSpacing: "-1.5px" }}>
                What Our <span className="grad-text">Clients Say</span>
              </h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1}>
                <div className="glass-card" style={{ padding: "30px 26px" }}>
                  <div style={{ color: "#7c3aed", fontSize: 32, marginBottom: 14 }}>❝</div>
                  <p style={{ color: "#b8a9d9", fontSize: 15, lineHeight: 1.8, marginBottom: 24, fontStyle: "italic" }}>{t.text}</p>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 14, flexShrink: 0 }}>{t.initials}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: "#7c3aed" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORLDWIDE ── */}
      <section style={{ padding: "80px 5%", textAlign: "center" }}>
        <Reveal>
          <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(24px,3vw,38px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px", marginBottom: 10 }}>
            Empowering Businesses <span className="grad-text">Worldwide</span>
          </h2>
          <p style={{ color: "#9d8fd4", marginBottom: 44, fontSize: 15 }}>Partner with us to elevate your business</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 14 }}>
            {[["🇺🇸","🇦🇺"],["🇬🇧","🇵🇪"],["🇨🇦","🇳🇬"],["🇮🇹","🇿🇦"]].map((pair, i) => (
              <div key={i} className="glass-card" style={{ padding: "12px 18px", display: "flex", gap: 8, fontSize: 24 }}>
                {pair.map(f => <span key={f}>{f}</span>)}
              </div>
            ))}
            {["Flutter", "Shopify", "Next.js", "Firebase"].map(t => (
              <div key={t} className="glass-card" style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>⚡</span>
                <span style={{ fontWeight: 700, color: "#c084fc", fontSize: 14 }}>{t}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "100px 5%", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%,rgba(124,58,237,.22) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <Reveal>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 680, margin: "0 auto" }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, color: "#7c3aed", textTransform: "uppercase", marginBottom: 20 }}>→ Let&apos;s Build Your Next Project ←</div>
            <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(32px,5vw,62px)", fontWeight: 900, color: "#fff", letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 20 }}>
              Ready to Build Something <span className="grad-text">Extraordinary?</span>
            </h2>
            <p style={{ color: "#9d8fd4", fontSize: 17, marginBottom: 40, lineHeight: 1.7 }}>Partner with us to elevate your business. Your next big digital move starts here.</p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact">
                <button className="btn-main animate-glow" style={{ padding: "16px 38px", fontSize: 16 }}>Start a Project</button>
              </Link>
              <Link href="/contact">
                <button className="btn-outline" style={{ padding: "16px 38px", fontSize: 16 }}>Book a Call →</button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <NewsletterSignup />
      <Footer />
    </main>
  );
}
