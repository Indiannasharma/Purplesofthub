import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import ServiceCards from "@/components/ServiceCards";
import NewsletterSignup from "@/components/NewsletterSignup";
import HeroCosmosScene from "@/components/HeroCosmosScene";
import PersistentTypewriter from "@/components/common/PersistentTypewriter";
import {
  FadeInUp,
  StaggerContainer,
  StaggerItem,
  AnimatedCard,
  FadeIn
} from "@/components/motion";
import { createClient } from "@/lib/supabase/server";

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
  {
    icon: "📈", tag: "E-Commerce", category: "Digital Marketing",
    challenge: "Low sales, high CPA", solution: "Shopify + Facebook Ads",
    result: "3.5×", resultLabel: "Revenue Increase",
    accent: "#7c3aed", accentLight: "rgba(124,58,237,0.12)", accentBorder: "rgba(124,58,237,0.35)",
  },
  {
    icon: "📱", tag: "App Development", category: "Mobile Engineering",
    challenge: "Build a Fitness App", solution: "Flutter & React Native",
    result: "50K+", resultLabel: "App Downloads",
    accent: "#06b6d4", accentLight: "rgba(6,182,212,0.1)", accentBorder: "rgba(6,182,212,0.3)",
  },
  {
    icon: "🎵", tag: "Music Promotion", category: "Music Distribution",
    challenge: "Increase Spotify Streams", solution: "Playlist Campaigns",
    result: "500K+", resultLabel: "Spotify Streams",
    accent: "#10b981", accentLight: "rgba(16,185,129,0.1)", accentBorder: "rgba(16,185,129,0.3)",
  },
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

// Scrolling ticker services list
const TICKER_SERVICES = [
  "Social Media Management", "Website Design & Development", "Web App Development",
  "Branding & Creative Design", "Logo Design", "Video Content Creation",
  "Digital & Outdoor Marketing", "Search Engine Optimization", "Start-up Launch Services",
  "Google Ads", "LinkedIn Ads", "Snapchat Ads", "TikTok Ads", "Instagram Ads",
  "Facebook Ads", "Twitter Ads", "Pinterest Ads", "Microsoft Ads",
  "E-commerce Marketing", "Music Distribution", "Account Recovery",
  "Mobile App Development", "UI/UX Design", "Cybersecurity",
];

// Brands typewriter words
const TYPEWRITER_WORDS = [
  "E-commerce Brands", "Music Artists", "NGOs & Charities",
  "Churches & Ministries", "Schools & Universities", "Oil & Gas Companies",
  "Influencers & Creators", "Real Estate Firms", "Startups & Founders",
  "Fashion Brands", "Tech Companies", "Healthcare Providers",
  "Media Houses", "Event Planners", "Law Firms",
];

export default async function Home() {
  const supabase = await createClient();
  const { data: trendingPostsData } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, read_time, comment_count, likes_count')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3);

  const trendingPosts = trendingPostsData || [];

  return (
    <main style={{ background: "var(--cyber-bg)", color: "var(--cyber-heading)", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* Background Effects */}
      <div className="cyber-glow-top-left" />
      <div className="cyber-glow-bottom-right" />

      <Navbar />

      {/* ── HERO ── */}
      <section
        id="home"
        className="hero-section relative isolate flex min-h-[100dvh] flex-col overflow-hidden scroll-mt-[72px] pb-14 pt-[5.5rem] sm:pb-20 sm:pt-[5.75rem] lg:min-h-screen lg:pb-24 lg:pt-24"
      >
        <HeroCosmosScene variant="backdrop" />

        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_72%_58%_at_80%_38%,rgba(168,85,247,0.12)_0%,rgba(168,85,247,0.04)_28%,transparent_62%),radial-gradient(ellipse_48%_34%_at_72%_56%,rgba(34,211,238,0.08)_0%,transparent_56%),linear-gradient(180deg,rgba(7,4,18,0.18)_0%,rgba(7,4,18,0.12)_48%,rgba(7,4,18,0.34)_100%)]"
          aria-hidden
        />

        <div className="relative z-[2] mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-8 xl:gap-12">
          <div className="mx-auto flex w-full max-w-xl flex-col justify-center text-center lg:mx-0 lg:max-w-[min(100%,520px)] lg:flex-[0_0_42%] lg:text-left">
            <Reveal>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-500/35 bg-violet-500/[0.08] px-4 py-2 shadow-[0_0_28px_rgba(168,85,247,0.14)] backdrop-blur-md dark:border-violet-400/25 dark:bg-violet-500/[0.06] lg:mx-0 mx-auto">
                <span
                  className="inline-block size-1.5 shrink-0 rounded-full bg-fuchsia-400 shadow-[0_0_12px_#c084fc]"
                  style={{ animation: "cyberPulse 1.8s ease-in-out infinite" }}
                  aria-hidden
                />
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-700 sm:text-xs dark:text-violet-300">
                  Digital Innovation Studio
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1
                className="text-[clamp(2rem,6.4vw,4rem)] font-black leading-[0.98] tracking-[-0.045em] text-[var(--cyber-heading)] [text-shadow:0_0_48px_rgba(168,85,247,0.12)] sm:text-[clamp(2.35rem,5vw,3.7rem)] lg:text-[clamp(2.5rem,4.2vw,4.1rem)] xl:text-[clamp(2.9rem,4.4vw,4.45rem)]"
                style={{ fontFamily: "Outfit, system-ui, sans-serif" }}
              >
                <span className="block">Building Technology</span>
                <span className="block">
                  for the{" "}
                  <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(124,58,237,0.35)] dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-300">
                    Next
                  </span>
                </span>
                <span className="block">
                  <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(124,58,237,0.35)] dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-300">
                    Generation
                  </span>{" "}
                  of
                </span>
                <span className="block">Businesses</span>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="mx-auto mt-6 max-w-[31rem] text-[15px] leading-relaxed text-[var(--cyber-body)] sm:text-base lg:mx-0">
                Web Development • Mobile Apps • Digital Marketing • Music
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="cta-row hero-cta-row mt-9 flex flex-wrap justify-center gap-3.5 sm:gap-4 lg:justify-start">
                <Link href="/contact" className="inline-flex w-full min-[480px]:w-auto">
                  <button
                    type="button"
                    className="cyber-btn-primary w-full min-w-[200px] justify-center rounded-xl px-8 py-3.5 text-[15px] font-semibold shadow-[0_8px_32px_rgba(124,58,237,0.35)] transition duration-300 hover:shadow-[0_12px_40px_rgba(124,58,237,0.45)] min-[480px]:w-auto"
                  >
                    Start a Project
                  </button>
                </Link>
                <Link href="/contact" className="inline-flex w-full min-[480px]:w-auto">
                  <button
                    type="button"
                    className="cyber-btn-outline w-full min-w-[200px] justify-center rounded-xl px-8 py-3.5 text-[15px] font-semibold min-[480px]:w-auto"
                  >
                    Book a Discovery Call
                  </button>
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="hero-planet-shell w-full shrink-0 lg:flex-[1_1_58%] lg:max-w-[min(62vw,880px)] xl:max-w-[min(60vw,960px)]">
            <Reveal delay={0.15}>
              <HeroCosmosScene />
            </Reveal>
          </div>
        </div>
      </section>


      {/* ── FEATURE CARDS ── */}
      <section style={{ padding: "0 5% 80px", position: "relative", zIndex: 2 }}>
        <StaggerContainer style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          {[
            { icon: "💻", title: "Digital Solutions", sub: "Web, Mobile & Marketing", cta: "View Services", href: "/services", color: "#4f46e5" },
            { icon: "🎓", title: "Purplesofthub Academy", sub: "Learn In-Demand Tech Skills", cta: "View Courses", href: "/blog", color: "#7c3aed" },
            { icon: "🎵", title: "Music Promotion", sub: "Promote & Distribute Your Music", cta: "Get Started", href: "/services/music-promotion", color: "#86198f" },
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
      <section id="services" style={{ padding: "90px 5% 78px", background: "var(--cyber-bg2)", borderTop: "1px solid var(--cyber-border)", position: "relative", zIndex: 2 }}>
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

      {/* ── PREMIUM DIAGONAL DIVIDER ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          height: '28px',
          overflow: 'hidden',
          zIndex: 9,
          background: 'transparent',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '-6%',
            right: '-6%',
            top: '50%',
            height: '2px',
            transform: 'translateY(-50%) rotate(-2deg)',
            transformOrigin: 'center',
            background: 'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.55) 18%, rgba(168,85,247,0.95) 50%, rgba(34,211,238,0.65) 82%, transparent 100%)',
            boxShadow: '0 0 18px rgba(124,58,237,0.22)',
          }}
        />
      </div>

      {/* ── SCROLLING SERVICES TICKER (Tilted) ── */}
      <div style={{
        width: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
        padding: '16px 0',
        position: 'relative',
        zIndex: 10,
        transform: 'rotate(-2deg) scale(1.05)',
        marginTop: '8px',
        marginBottom: '40px',
      }}>
        <div style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: '80px',
          background: 'linear-gradient(90deg, #7c3aed, transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }}/>
        <div style={{
          position: 'absolute',
          right: 0, top: 0, bottom: 0,
          width: '80px',
          background: 'linear-gradient(-90deg, #6d28d9, transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }}/>
        <div style={{
          display: 'flex',
          animation: 'marqueeLeft 30s linear infinite',
          width: 'max-content',
        }}>
          {[...Array(2)].map((_, dupIdx) => (
            <div key={dupIdx} style={{ display: 'flex', alignItems: 'center', gap: '0', flexShrink: 0 }}>
              {TICKER_SERVICES.map((service, i) => (
                <div key={`${dupIdx}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '0 24px', flexShrink: 0 }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                    {service}
                  </span>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)', flexShrink: 0 }}/>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── BRANDS TYPEWRITER ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(60px, 8vw, 100px) 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#a855f7', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Trusted by businesses across Africa
        </p>
        <h2 style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 900, color: 'var(--cyber-heading)', margin: '0 0 8px', lineHeight: 1.15 }}>
          We Work With
        </h2>
        <div style={{
          fontSize: 'clamp(32px, 5vw, 60px)',
          fontWeight: 900,
          minHeight: 'clamp(44px, 7vw, 80px)',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0',
        }}>
          <PersistentTypewriter
            words={TYPEWRITER_WORDS}
            className="typewriter-text"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              minWidth: '10px',
            }}
          />
          <span style={{
            display: 'inline-block',
            width: '3px',
            height: 'clamp(36px, 5vw, 60px)',
            background: '#7c3aed',
            marginLeft: '4px',
            animation: 'cursorBlink 1s ease-in-out infinite',
            borderRadius: '2px',
            verticalAlign: 'middle',
          }}/>
        </div>
        <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--cyber-body)', maxWidth: '560px', margin: '0 auto 40px', lineHeight: 1.7 }}>
          From ambitious startups to global brands — we build digital experiences that convert and grow.
        </p>
        <Link href="/contact">
          <button className="cyber-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', fontSize: 15 }}>
            Start Your Project →
          </button>
        </Link>
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
      <section style={{ padding: "90px 5%", background: "var(--cyber-bg2)", borderTop: "1px solid var(--cyber-border)", borderBottom: "1px solid var(--cyber-border)", position: "relative", zIndex: 2, overflow: "hidden" }}>
        {/* Ambient glow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 300, background: "radial-gradient(ellipse,rgba(124,58,237,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "#a855f7", textTransform: "uppercase", marginBottom: 12 }}>Proven Results</p>
              <h2 className="cyber-section-heading" style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,46px)", fontWeight: 900, letterSpacing: "-1.5px", margin: "0 0 14px" }}>
                Our <span className="grad-text">Success Stories</span>
              </h2>
              <p style={{ fontSize: 15, color: "var(--cyber-body)", maxWidth: 440, margin: "0 auto", lineHeight: 1.7 }}>
                Real clients, real results — here's what we've helped build.
              </p>
            </div>
          </Reveal>

          <StaggerContainer style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
            {SUCCESS.map((s) => (
              <StaggerItem key={s.tag}>
                <div className="success-story-card" style={{
                  background: "var(--cyber-card)",
                  border: `1px solid ${s.accentBorder}`,
                  borderRadius: 20,
                  padding: "30px 28px",
                  position: "relative",
                  overflow: "hidden",
                  backdropFilter: "blur(16px)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  cursor: "default",
                }}>
                  {/* Card ambient glow */}
                  <div style={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${s.accentLight} 0%, transparent 70%)`, pointerEvents: "none" }} />

                  {/* Top accent bar */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)` }} />

                  {/* Header: icon + category */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 13,
                      background: s.accentLight,
                      border: `1px solid ${s.accentBorder}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22,
                      boxShadow: `0 0 16px ${s.accentLight}`,
                    }}>
                      {s.icon}
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                      color: s.accent, textTransform: "uppercase",
                      background: s.accentLight,
                      border: `1px solid ${s.accentBorder}`,
                      padding: "4px 10px", borderRadius: 100,
                    }}>
                      {s.category}
                    </span>
                  </div>

                  {/* Title */}
                  <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 18, color: "var(--cyber-heading)", marginBottom: 20, letterSpacing: "-0.3px" }}>
                    {s.tag}
                  </div>

                  {/* Challenge & Solution rows */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
                    {[
                      { label: "Challenge", val: s.challenge, icon: "⚡" },
                      { label: "Solution",  val: s.solution,  icon: "💡" },
                    ].map(({ label, val, icon: rowIcon }) => (
                      <div key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 12 }}>{rowIcon}</span>
                        <div>
                          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--cyber-muted)", marginRight: 6 }}>{label}</span>
                          <span style={{ fontSize: 13, color: "var(--cyber-body)" }}>{val}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Result metric — hero element */}
                  <div style={{
                    background: s.accentLight,
                    border: `1px solid ${s.accentBorder}`,
                    borderRadius: 14,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: s.accent,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, flexShrink: 0,
                      boxShadow: `0 0 12px ${s.accentLight}`,
                    }}>
                      ✦
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: s.accent, marginBottom: 2 }}>Result</div>
                      <div style={{ fontFamily: "Outfit", fontWeight: 900, fontSize: 22, color: s.accent, lineHeight: 1 }}>
                        {s.result} <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>{s.resultLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
        <style>{`
          .success-story-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 50px rgba(0,0,0,0.3), 0 0 30px rgba(124,58,237,0.12);
          }
        `}</style>
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
      <section style={{ padding: "80px 0", textAlign: "center", position: "relative", zIndex: 2, overflow: "hidden" }}>
        {/* Background gradient */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Top + bottom fade masks */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "var(--cyber-border)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "var(--cyber-border)" }} />

        <div style={{ position: "relative", padding: "0 5%" }}>
          <FadeInUp>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "#a855f7", textTransform: "uppercase", marginBottom: 12 }}>Global Reach</p>
            <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 900, color: "var(--cyber-heading)", letterSpacing: "-1.5px", marginBottom: 10 }}>
              Empowering Businesses <span className="grad-text">Worldwide</span>
            </h2>
            <p style={{ color: "var(--cyber-body)", marginBottom: 40, fontSize: 15, maxWidth: 400, margin: "0 auto 40px" }}>
              Trusted by founders and teams across 4 continents
            </p>
          </FadeInUp>

          {/* Stats row */}
          <FadeInUp delay={0.05}>
            <div style={{ display: "flex", justifyContent: "center", gap: "clamp(24px,5vw,60px)", marginBottom: 52, flexWrap: "wrap" }}>
              {[
                { value: "12+", label: "Countries" },
                { value: "4",   label: "Continents" },
                { value: "80+", label: "Clients Served" },
              ].map(({ value, label }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "Outfit", fontWeight: 900, fontSize: "clamp(26px,3vw,36px)", background: "linear-gradient(135deg,#a855f7,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1 }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--cyber-muted)", marginTop: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </FadeInUp>
        </div>

        {/* Marquee rows */}
        {(() => {
          const row1 = [
            { flag: "🇺🇸", name: "United States" }, { flag: "🇬🇧", name: "United Kingdom" },
            { flag: "🇨🇦", name: "Canada" },         { flag: "🇦🇺", name: "Australia" },
            { flag: "🇩🇪", name: "Germany" },         { flag: "🇫🇷", name: "France" },
          ]
          const row2 = [
            { flag: "🇳🇬", name: "Nigeria" },         { flag: "🇿🇦", name: "South Africa" },
            { flag: "🇬🇭", name: "Ghana" },            { flag: "🇰🇪", name: "Kenya" },
            { flag: "🇦🇪", name: "UAE" },              { flag: "🇮🇳", name: "India" },
          ]
          const Pill = ({ flag, name }: { flag: string; name: string }) => (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 100,
              background: "var(--cyber-card)",
              border: "1px solid var(--cyber-border)",
              backdropFilter: "blur(12px)",
              whiteSpace: "nowrap", flexShrink: 0,
            }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{flag}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--cyber-body)" }}>{name}</span>
            </div>
          )
          return (
            <>
              {/* Row 1 — scrolls left */}
              <div style={{ overflow: "hidden", marginBottom: 12, WebkitMaskImage: "linear-gradient(90deg,transparent,black 10%,black 90%,transparent)", maskImage: "linear-gradient(90deg,transparent,black 10%,black 90%,transparent)" }}>
                <div className="marquee-left" style={{ display: "flex", gap: 12, width: "max-content" }}>
                  {[...row1, ...row1].map((c, i) => <Pill key={i} flag={c.flag} name={c.name} />)}
                </div>
              </div>
              {/* Row 2 — scrolls right */}
              <div style={{ overflow: "hidden", WebkitMaskImage: "linear-gradient(90deg,transparent,black 10%,black 90%,transparent)", maskImage: "linear-gradient(90deg,transparent,black 10%,black 90%,transparent)" }}>
                <div className="marquee-right" style={{ display: "flex", gap: 12, width: "max-content" }}>
                  {[...row2, ...row2].map((c, i) => <Pill key={i} flag={c.flag} name={c.name} />)}
                </div>
              </div>
            </>
          )
        })()}

        <style>{`
          @keyframes scroll-left {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          @keyframes scroll-right {
            from { transform: translateX(-50%); }
            to   { transform: translateX(0); }
          }
          .marquee-left  { animation: scroll-left  28s linear infinite; }
          .marquee-right { animation: scroll-right 28s linear infinite; }
          .marquee-left:hover,
          .marquee-right:hover { animation-play-state: paused; }
        `}</style>
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
