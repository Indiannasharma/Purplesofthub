import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import ServiceCards from "@/components/ServiceCards";
import NewsletterSignup from "@/components/NewsletterSignup";
import {
  FadeInUp,
  StaggerContainer,
  StaggerItem,
  AnimatedCard,
  FadeIn
} from "@/components/motion";
import { CountUp } from "@/components/motion/CountUp";
import { createClient } from "@/lib/supabase/client";

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
      contactPoint: { "@type": "ContactPoint", email: "hello@purplesofthub.com", contactType: "customer service" },
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
  { icon: "🌐", title: "Web Development", desc: "Business sites, SaaS platforms, e-commerce stores & custom dashboards built to convert.", tags: ["Next.js", "React", "Tailwind"], href: "/services/web-development" },
  { icon: "📱", title: "Mobile App Development", desc: "Cross-platform Flutter & React Native apps for iOS and Android that users love.", tags: ["Flutter", "React Native", "iOS/Android"], href: "/services/mobile-app-development" },
  { icon: "📣", title: "Digital Marketing", desc: "Meta, Google, TikTok & Snapchat ads — plus SEO strategies that drive real growth.", tags: ["Meta Ads", "Google Ads", "SEO"], href: "/services/digital-marketing" },
  { icon: "🎨", title: "UI/UX Design", desc: "Pixel-perfect product design grounded in user psychology and conversion principles.", tags: ["Figma", "Prototyping", "Research"], href: "/services/ui-ux-design" },
  { icon: "⚙️", title: "SaaS Development", desc: "AI tools, automation dashboards and creator platforms built from MVP to scale.", tags: ["SaaS", "AI Tools", "Automation"], href: "/services/saas-development" },
  { icon: "🎵", title: "Music Promotion", desc: "Get your music on 150+ platforms and grow your fanbase with targeted promo.", tags: ["Spotify", "Apple Music", "Promotion"], href: "/services/music-distribution" },
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
  { name: "Juliet Owusu", role: "C.E.O, 24 Hours Content Hub", text: "PurpleSoftHub built our studio website from scratch and nailed every detail. The online booking system alone transformed how we operate — clients book sessions seamlessly and our brand finally looks as premium as our service.", initials: "JO" },
  { name: "Emmanuel Delytesome", role: "C.E.O, Starzz Properties", text: "They delivered a real estate platform that actually generates leads. The property listings, enquiry system and overall design gave Starzz Properties a professional edge we never had before. Highly recommend the team.", initials: "ED" },
  { name: "Collins Kind", role: "Fashion Designer, Collins Kind", text: "Working with PurpleSoftHub was a game changer. They built my website, set up my Meta Ads and crafted a brand identity that speaks to my audience. My online presence is now as bold as my designs.", initials: "CK" },
];

export default async function Home() {
  // Fetch trending blog posts (top 3 by engagement)
  const supabase = createClient();
  const { data: trendingPostsData } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, read_time, comment_count, likes_count')
    .eq('published', true)
    .order('comment_count', { ascending: false })
    .limit(3);

  const trendingPosts = trendingPostsData || [];

  return (
    <main style={{ background: "var(--cyber-bg)", color: "var(--cyber-heading)", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* Background Effects */}
      <div className="cyber-glow-top-left" />
      <div className="cyber-glow-bottom-right" />
      <div className="cyber-grid-bg" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />

      <Navbar />

      {/* ── HERO ── */}
      <section id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", padding: "100px 5% 60px" }}>
        {/* Cosmic background glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 50%, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(34,211,238,0.08) 0%, transparent 50%)", pointerEvents: "none" }} />
        
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", position: "relative", zIndex: 2 }}>
          <div>
            <Reveal>
              {/* Cyber Badge */}
              <div className="cyber-badge" style={{ marginBottom: 28 }}>
                <span className="cyber-badge-dot" />
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#a855f7',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                }}>
                  DIGITAL INNOVATION STUDIO
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 style={{ 
                fontFamily: "Outfit", 
                fontSize: "clamp(36px,4.5vw,62px)", 
                fontWeight: 900, 
                lineHeight: 1.1, 
                color: "var(--cyber-heading)", 
                letterSpacing: "-2px", 
                marginBottom: 22,
                textShadow: "0 0 40px rgba(168,85,247,0.2)"
              }}>
                Building Technology<br />for the <span className="grad-text">Next Generation</span><br />of Businesses
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p style={{ color: "var(--cyber-body)", fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
                Web Development · Mobile Apps · Digital Marketing · Music Distribution
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="cta-row" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
                <Link href="/contact">
                  <button className="cyber-btn-primary" style={{ padding: "14px 32px", fontSize: 16 }}>Start a Project</button>
                </Link>
                <Link href="/contact">
                  <button className="cyber-btn-outline" style={{ padding: "14px 32px", fontSize: 16 }}>
                    Book a Discovery Call
                  </button>
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="hero-stats" style={{ display: "flex", gap: 36 }}>
                {[
                  [50, "Projects Shipped", "+"],
                  [10, "Core Services", ""],
                  [98, "Client Satisfaction", "%"]
                ].map(([n, l, suffix]) => (
                  <div key={l} className="cyber-card" style={{ padding: 16, borderRadius: 12 }}>
                    <div style={{ 
                      fontFamily: "Outfit", 
                      fontSize: "clamp(28px,4vw,40px)", 
                      fontWeight: 900, 
                      color: "#a855f7", 
                      letterSpacing: "-1px",
                      textShadow: "0 0 20px rgba(168,85,247,0.4)"
                    }}>
                      <CountUp end={n as number} duration={2} suffix={suffix as string} />
                    </div>
                    <div style={{ fontSize: 12, color: "var(--cyber-body)", fontWeight: 500, marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Holographic Planet */}
          <Reveal delay={0.2}>
            <div style={{
              position: 'relative',
              width: 'clamp(260px, 35vw, 480px)',
              height: 'clamp(260px, 35vw, 480px)',
              flexShrink: 0,
              animation: 'cyberFloat 6s ease-in-out infinite',
              margin: '0 auto',
            }}>
              {/* Planet body */}
              <div style={{
                position: 'absolute',
                inset: '10%',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #c084fc, #7c3aed 40%, #1a0535 80%)',
                boxShadow: '0 0 60px rgba(124,58,237,0.5), inset -20px -20px 40px rgba(0,0,0,0.4)',
              }} />
              {/* Planet ring */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotateX(75deg)',
                width: '140%',
                height: '140%',
                borderRadius: '50%',
                border: '8px solid rgba(34,211,238,0.3)',
                boxShadow: '0 0 20px rgba(34,211,238,0.2)',
              }} />
              {/* Outer ring */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotateX(75deg)',
                width: '170%',
                height: '170%',
                borderRadius: '50%',
                border: '3px solid rgba(124,58,237,0.2)',
              }} />
              {/* Orbiting dot */}
              <div style={{
                position: 'absolute',
                top: '8%',
                left: '50%',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#22d3ee',
                boxShadow: '0 0 12px #22d3ee',
                animation: 'cyberFloat 3s ease-in-out infinite reverse',
              }} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURE CARDS ── */}
      <section style={{ padding: "0 5% 80px", position: "relative", zIndex: 2 }}>
        <StaggerContainer style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          {[
            { icon: "💻", title: "Digital Solutions", sub: "Web, Mobile & Marketing", cta: "View Services", href: "/services", color: "#4f46e5" },
            { icon: "🎓", title: "Purplesofthub Academy", sub: "Learn In-Demand Tech Skills", cta: "View Courses", href: "/blog", color: "#7c3aed" },
            { icon: "5", title: "Music Promotion", sub: "Promote & Distribute Your Music", cta: "Get Started", href: "/services/music-promotion", color: "#86198f" },
          ].map((c) => (
            <StaggerItem key={c.title}>
              <div className="cyber-card" style={{ padding: "28px 28px 24px", position: "relative", overflow: "hidden" }}>
                <div className="cyber-corner-tl" />
                <div className="cyber-corner-br" />
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${c.color},#a855f7)` }} />
                <div style={{ 
                  fontSize: 32, 
                  marginBottom: 14,
                  width: 52,
                  height: 52,
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 12px rgba(124,58,237,0.15)",
                }}>{c.icon}</div>
                <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 18, color: "var(--cyber-heading)", marginBottom: 8 }}>{c.title}</div>
                <div style={{ color: "var(--cyber-body)", fontSize: 14, marginBottom: 20 }}>{c.sub}</div>
                <Link href={c.href}>
                  <button className="cyber-btn-small" style={{ padding: "8px 18px", fontSize: 13 }}>
                    {c.cta} →
                  </button>
                </Link>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding: "90px 5%", background: "var(--cyber-bg2)", borderTop: "1px solid var(--cyber-border)", borderBottom: "1px solid var(--cyber-border)", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#a855f7", textTransform: "uppercase", marginBottom: 12 }}>What We Build</p>
              <h2 className="cyber-section-heading" style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: 14 }}>
                10 Services. <span className="grad-text">One Powerful Hub.</span>
              </h2>
              <p style={{ color: "var(--cyber-body)", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>Everything your business needs to grow — under one roof.</p>
            </div>
          </Reveal>
          <ServiceCards services={SERVICES} />
          <Reveal delay={0.3}>
            <div style={{ textAlign: "center", marginTop: 48 }}>
              <Link href="/services">
                <button className="cyber-btn-outline" style={{ padding: "13px 32px", fontSize: 15 }}>
                  View All 10 Services →
                </button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── MUSIC ── */}
      <section id="music" style={{ padding: "100px 5%", position: "relative", overflow: "hidden", zIndex: 2 }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 50%,rgba(134,25,143,.12) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <Reveal>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#e879f9", textTransform: "uppercase", marginBottom: 14 }}>✦ Unique Service</p>
            <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,46px)", fontWeight: 900, color: "var(--cyber-heading)", letterSpacing: "-1.5px", lineHeight: 1.15, marginBottom: 20 }}>
              Music Distribution<br />
              <span style={{ background: "linear-gradient(135deg,#e879f9,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>& Promotion</span>
            </h2>
            <p style={{ color: "var(--cyber-body)", fontSize: 16, lineHeight: 1.85, marginBottom: 32 }}>We help artists get heard worldwide. From Spotify & Apple Music distribution to social media campaigns that build real, loyal fanbases.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
              {["🎵 Distribute to 150+ platforms globally", "📱 TikTok, Reels & YouTube promo campaigns", "🎨 Artist branding & cover art design", "📊 Stream analytics & audience insights"].map(t => (
                <div key={t} style={{ color: "var(--cyber-body)", fontSize: 15 }}>{t}</div>
              ))}
            </div>
            <Link href="/contact">
              <button className="cyber-btn-primary" style={{ padding: "13px 30px", fontSize: 15, background: "linear-gradient(135deg,#86198f,#a855f7)" }}>
                🎵 Promote My Music
              </button>
            </Link>
          </Reveal>
          <Reveal delay={0.15}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[["🎧","150+ Platforms","Global distribution"],["📈","Real Growth","Authentic streams"],["🎨","Artist Branding","Visual identity"],["📢","Promotion","Targeted campaigns"]].map(([ic, tt, dd]) => (
                <div key={tt} className="cyber-card" style={{ padding: "24px 18px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{ic}</div>
                  <div style={{ fontWeight: 800, color: "var(--cyber-heading)", fontSize: 15, marginBottom: 6 }}>{tt}</div>
                  <div style={{ color: "var(--cyber-body)", fontSize: 13 }}>{dd}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <style>{`@media(max-width:768px){#music > div{grid-template-columns:1fr!important}}`}</style>
      </section>

      {/* ── SUCCESS STORIES ── */}
      <section style={{ padding: "90px 5%", background: "var(--cyber-bg2)", borderTop: "1px solid var(--cyber-border)", borderBottom: "1px solid var(--cyber-border)", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <h2 className="cyber-section-heading" style={{ fontFamily: "Outfit", fontSize: "clamp(26px,3vw,42px)", fontWeight: 900, letterSpacing: "-1px" }}>✦ Our Success Stories ✦</h2>
            </div>
          </Reveal>
          <StaggerContainer style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 20 }}>
            {SUCCESS.map((s) => (
              <StaggerItem key={s.tag}>
                <div className="cyber-card" style={{ padding: "28px 24px", position: "relative", overflow: "hidden" }}>
                  <div className="cyber-corner-tl" />
                  <div className="cyber-corner-br" />
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#7c3aed,#22d3ee,#a855f7)" }} />
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                  <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 17, color: "var(--cyber-heading)", marginBottom: 18 }}>{s.tag}</div>
                  {[["Challenge", s.challenge], ["Solution", s.solution], ["Result", s.result]].map(([label, val]) => (
                    <div key={label} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: label === "Result" ? "#22d3ee" : "var(--cyber-muted)", minWidth: 65 }}>{label}:</span>
                      <span style={{ fontSize: 13, color: label === "Result" ? "#10b981" : "var(--cyber-body)", fontWeight: label === "Result" ? 700 : 400 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section id="process" style={{ padding: "90px 5%", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#a855f7", textTransform: "uppercase", marginBottom: 12 }}>How We Work</p>
              <h2 className="cyber-section-heading" style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 900, letterSpacing: "-1.5px" }}>Our <span className="grad-text">Process</span></h2>
            </div>
          </Reveal>
          <StaggerContainer style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
            {PROCESS.map((p) => (
              <StaggerItem key={p.n}>
                <div className="cyber-card" style={{ padding: "32px 24px", textAlign: "center", position: "relative" }}>
                  <div className="cyber-corner-tl" />
                  <div style={{ fontFamily: "Outfit", fontSize: 44, fontWeight: 900, color: "rgba(124,58,237,.25)", marginBottom: 12 }}>{p.n}</div>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#a855f7)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>{p.icon}</div>
                  <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 16, color: "var(--cyber-heading)", marginBottom: 10 }}>{p.title}</div>
                  <p style={{ color: "var(--cyber-body)", fontSize: 14, lineHeight: 1.7 }}>{p.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "90px 5%", background: "var(--cyber-bg2)", borderTop: "1px solid var(--cyber-border)", borderBottom: "1px solid var(--cyber-border)", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#a855f7", textTransform: "uppercase", marginBottom: 12 }}>Client Love</p>
              <h2 className="cyber-section-heading" style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 900, letterSpacing: "-1.5px" }}>
                What Our <span className="grad-text">Clients Say</span>
              </h2>
            </div>
          </Reveal>
          <StaggerContainer style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {TESTIMONIALS.map((t) => (
              <StaggerItem key={t.name}>
                <div className="cyber-card" style={{ padding: "30px 26px", position: "relative" }}>
                  <div style={{ color: "rgba(124,58,237,0.3)", fontSize: 60, marginBottom: 8, lineHeight: 1 }}>❝</div>
                  <p style={{ color: "var(--cyber-body)", fontSize: 15, lineHeight: 1.8, marginBottom: 24, fontStyle: "italic" }}>{t.text}</p>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 14, flexShrink: 0, boxShadow: "0 0 12px rgba(124,58,237,0.3)" }}>{t.initials}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--cyber-heading)", fontSize: 14 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: "#a855f7" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── WORLDWIDE ── */}
      <section style={{ padding: "80px 5%", textAlign: "center", position: "relative", zIndex: 2 }}>
        <FadeInUp>
          <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(24px,3vw,38px)", fontWeight: 900, color: "var(--cyber-heading)", letterSpacing: "-1px", marginBottom: 10 }}>
            Empowering Businesses <span className="grad-text">Worldwide</span>
          </h2>
          <p style={{ color: "var(--cyber-body)", marginBottom: 44, fontSize: 15 }}>Partner with us to elevate your business</p>
        </FadeInUp>
        <FadeInUp delay={0.1}>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 14 }}>
            {[["🇺🇸","🇦🇺"],["🇬🇧","🇵🇪"],["🇨🇦","🇳🇬"],["🇳🇬","🇿🇦"]].map((pair, i) => (
              <div key={i} className="cyber-card" style={{ padding: "12px 18px", display: "flex", gap: 8, fontSize: 24 }}>
                {pair.map(f => <span key={f}>{f}</span>)}
              </div>
            ))}
          </div>
        </FadeInUp>
      </section>

      {/* ── TRENDING BLOG POSTS ── */}
      <section style={{ padding: "90px 5%", background: "var(--cyber-bg2)", borderTop: "1px solid var(--cyber-border)", borderBottom: "1px solid var(--cyber-border)", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#a855f7", textTransform: "uppercase", marginBottom: 12 }}>Latest Insights</p>
              <h2 className="cyber-section-heading" style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 900, letterSpacing: "-1.5px" }}>
                Trending <span className="grad-text">Blog Posts</span>
              </h2>
            </div>
          </Reveal>
          {trendingPosts.length > 0 ? (
            <StaggerContainer style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
              {trendingPosts.map((post: any) => (
                <StaggerItem key={post.id}>
                  <Link href={`/blog/${post.slug}`}>
                    <div className="cyber-card" style={{ padding: "28px 24px", position: "relative", overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease" }}>
                      <div className="cyber-corner-tl" />
                      <div className="cyber-corner-br" />
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#7c3aed,#22d3ee,#a855f7)" }} />
                      <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 17, color: "var(--cyber-heading)", marginBottom: 12, lineHeight: 1.4 }}>{post.title}</div>
                      <p style={{ color: "var(--cyber-body)", fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>{post.excerpt}</p>
                      <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--cyber-muted)", marginBottom: 16, flexWrap: "wrap" }}>
                        <span>🕐 {post.read_time} min read</span>
                        <span>💬 {post.comment_count || 0}</span>
                        <span>💜 {post.likes_count || 0}</span>
                      </div>
                      <button className="cyber-btn-small" style={{ padding: "8px 18px", fontSize: 13 }}>
                        Read More →
                      </button>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div style={{ textAlign: "center", color: "var(--cyber-muted)", padding: "40px 20px" }}>
              <p>Check back soon for trending blog posts</p>
            </div>
          )}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "100px 5%", textAlign: "center", position: "relative", overflow: "hidden", zIndex: 2 }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%,rgba(124,58,237,.16) 0%,transparent 65%)", pointerEvents: "none" }} />
        <FadeInUp>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 680, margin: "0 auto" }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, color: "#a855f7", textTransform: "uppercase", marginBottom: 20 }}>→ Let's Build Your Next Project ←</div>
            <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(32px,5vw,62px)", fontWeight: 900, color: "var(--cyber-heading)", letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 20 }}>
              Ready to Build Something <span className="grad-text">Extraordinary?</span>
            </h2>
            <p style={{ color: "var(--cyber-body)", fontSize: 17, marginBottom: 40, lineHeight: 1.7 }}>Partner with us to elevate your business. Your next big digital move starts here.</p>
            <div className="cta-row" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact">
                <button className="cyber-btn-primary animate-glow" style={{ padding: "16px 38px", fontSize: 16 }}>Start a Project</button>
              </Link>
              <Link href="/contact">
                <button className="cyber-btn-outline" style={{ padding: "16px 38px", fontSize: 16 }}>
                  Book a Call →
                </button>
              </Link>
            </div>
          </div>
        </FadeInUp>
      </section>

      <NewsletterSignup />
      <Footer />
    </main>
  );
}