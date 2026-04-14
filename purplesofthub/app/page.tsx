import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
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
import { createClient } from "@/lib/supabase/server";

// Dynamic imports for heavy components (code splitting)
const TypewriterEffect = dynamic(
  () => import("@/components/common/TypewriterEffect").then(mod => ({ default: mod.TypewriterEffect })),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        fontSize: 'clamp(32px, 5vw, 60px)', 
        fontWeight: 900, 
        minHeight: 'clamp(44px, 7vw, 80px)',
        background: 'linear-gradient(135deg, #7c3aed, #a855f7, #22d3ee)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        Loading...
      </div>
    )
  }
);

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
      <section id="home" className="hero-section" style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", padding: "100px 5% 60px" }}>
        {/* Layered background */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 50%, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(34,211,238,0.08) 0%, transparent 50%)", pointerEvents: "none" }} />

        {/* Floating particles — hidden on mobile via CSS */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="hero-particle"
            style={{
              position: 'absolute',
              width: i % 3 === 0 ? '4px' : i % 3 === 1 ? '6px' : '3px',
              height: i % 3 === 0 ? '4px' : i % 3 === 1 ? '6px' : '3px',
              borderRadius: '50%',
              background: i % 2 === 0 ? 'rgba(124,58,237,0.6)' : 'rgba(34,211,238,0.5)',
              left: `${8 + (i * 8)}%`,
              top: `${10 + ((i * 37) % 80)}%`,
              animation: `particleFloat ${3 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
              boxShadow: i % 2 === 0 ? '0 0 6px rgba(124,58,237,0.8)' : '0 0 6px rgba(34,211,238,0.8)',
              zIndex: 1,
            }}
          />
        ))}

        <div className="hero-grid" style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", position: "relative", zIndex: 2 }}>
          <div>
            <Reveal>
              {/* Premium Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '100px',
                padding: '7px 18px',
                marginBottom: '28px',
                boxShadow: '0 0 20px rgba(124,58,237,0.15)',
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#a855f7',
                  display: 'inline-block',
                  boxShadow: '0 0 10px #a855f7',
                  animation: 'cyberPulse 1.8s ease-in-out infinite',
                  flexShrink: 0,
                }}/>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#7c3aed',
                  letterSpacing: '0.08em',
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
                Building Technology<br />for the{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7, #22d3ee)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 20px rgba(124,58,237,0.3))',
                }}>
                  Next Generation
                </span>
                {' '}of Businesses
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p style={{ color: "var(--cyber-body)", fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
                Web Development · Mobile Apps · Digital Marketing · Music Distribution
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="cta-row hero-cta-row" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
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
              <div className="hero-stats" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {[
                  [50, "Projects Shipped", "+"],
                  [10, "Core Services", ""],
                  [98, "Client Satisfaction", "%"]
                ].map(([n, l, suffix]) => (
                  <div key={l} className="hero-stat-card" style={{
                    background: 'var(--cyber-card, rgba(255,255,255,0.7))',
                    border: '1px solid var(--cyber-border, rgba(124,58,237,0.15))',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    boxShadow: '0 4px 20px var(--cyber-glow, rgba(124,58,237,0.08))',
                    transition: 'all 0.3s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0,
                      height: '2px',
                      background: 'linear-gradient(90deg, #7c3aed, #22d3ee)',
                    }}/>
                    <div style={{ 
                      fontFamily: "Outfit", 
                      fontSize: "clamp(28px,4vw,40px)", 
                      fontWeight: 900, 
                      color: "var(--cyber-accent, #a855f7)", 
                      letterSpacing: "-1px",
                      textShadow: "0 0 20px rgba(124,58,237,0.3)",
                      marginTop: 4,
                    }}>
                      <CountUp end={n as number} duration={2} suffix={suffix as string} />
                    </div>
                    <div style={{ fontSize: 13, color: "var(--cyber-body)", fontWeight: 500, marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* ✨ PREMIUM COSMIC PLANET ✨ */}
          <div className="planet-col" style={{ position: 'relative' }}>
          <Reveal delay={0.2}>
            {/* Outer Nebula Glow — breathes */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'clamp(380px, 50vw, 700px)',
              height: 'clamp(380px, 50vw, 700px)',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, rgba(34,211,238,0.12) 40%, transparent 70%)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
              animation: 'pl-nebula 5s ease-in-out infinite alternate',
              zIndex: 0,
            }}/>

            {/* Atmosphere Halo — slow pulse */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'clamp(310px, 42vw, 580px)',
              height: 'clamp(310px, 42vw, 580px)',
              borderRadius: '50%',
              background: 'radial-gradient(circle, transparent 55%, rgba(124,58,237,0.22) 70%, rgba(34,211,238,0.16) 85%, transparent 100%)',
              animation: 'pl-atmos 8s ease-in-out infinite',
              zIndex: 1,
            }}/>

            {/* ── Float wrapper (handles Y bob only) ── */}
            <div className="pl-float-wrapper" style={{
              position: 'relative',
              width: 'clamp(220px, 38vw, 520px)',
              height: 'clamp(220px, 38vw, 520px)',
              flexShrink: 0,
              margin: '0 auto',
              animation: 'pl-float 7s ease-in-out infinite',
              zIndex: 2,
            }}>
              {/* ── Tilt wrapper (static -12 deg tilt, no conflict) ── */}
              <div style={{
                position: 'absolute', inset: 0,
                transform: 'rotateZ(-12deg)',
                transformStyle: 'preserve-3d',
              }}>

                {/* ── Main Planet Body ── */}
                <div style={{
                  position: 'absolute', inset: '8%',
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 30% 25%,
                    #e879f9 0%, #a855f7 15%, #7c3aed 35%,
                    #5b21b6 60%, #1e1b4b 85%, #0f0a1f 100%)`,
                  boxShadow: `
                    0 0 80px rgba(124,58,237,0.65),
                    0 0 140px rgba(124,58,237,0.3),
                    inset -30px -30px 60px rgba(0,0,0,0.55),
                    inset 20px 20px 40px rgba(232,121,249,0.22)`,
                  animation: 'pl-glow 4s ease-in-out infinite alternate',
                  overflow: 'hidden',
                }}>
                  {/* Static specular highlight */}
                  <div style={{
                    position: 'absolute', top: '18%', left: '22%',
                    width: '30%', height: '20%', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
                    filter: 'blur(8px)',
                  }}/>
                  {/* Rotating surface shimmer band */}
                  <div className="pl-surface-spin" style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, transparent 0%, rgba(168,85,247,0.08) 20%, rgba(34,211,238,0.06) 40%, transparent 60%, rgba(168,85,247,0.05) 80%, transparent 100%)',
                  }}/>
                </div>

                {/* ── Outer ring — orbits clockwise ── */}
                <div className="pl-ring-a" style={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: '185%', height: '185%',
                  borderRadius: '50%',
                  border: '5px solid transparent',
                  background: 'linear-gradient(90deg,transparent,rgba(34,211,238,0.45),rgba(124,58,237,0.55),rgba(34,211,238,0.35),transparent) border-box',
                  boxShadow: '0 0 28px rgba(34,211,238,0.3)',
                  zIndex: 3,
                }}/>

                {/* ── Middle ring — orbits counter-clockwise ── */}
                <div className="pl-ring-b" style={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: '155%', height: '155%',
                  borderRadius: '50%',
                  border: '3px solid rgba(168,85,247,0.45)',
                  boxShadow: '0 0 18px rgba(168,85,247,0.3)',
                  zIndex: 3,
                }}/>

                {/* ── Outer faint ring ── */}
                <div className="pl-ring-c" style={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: '215%', height: '215%',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(124,58,237,0.18)',
                  zIndex: 3,
                }}/>

                {/* ── Orbiting dot sparkles ── */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`pl-dot-orbit pl-dot-${i}`}
                    style={{
                      position: 'absolute', top: '50%', left: '50%',
                      width: i % 3 === 0 ? 10 : 6,
                      height: i % 3 === 0 ? 10 : 6,
                      borderRadius: '50%',
                      background: i % 2 === 0 ? '#22d3ee' : '#a855f7',
                      boxShadow: i % 2 === 0
                        ? '0 0 16px #22d3ee, 0 0 24px rgba(34,211,238,0.5)'
                        : '0 0 14px #a855f7, 0 0 20px rgba(168,85,247,0.5)',
                      marginLeft: -(i % 3 === 0 ? 5 : 3),
                      marginTop:  -(i % 3 === 0 ? 5 : 3),
                      zIndex: 4,
                    }}
                  />
                ))}

                {/* ── Accent cyan particle (pulses) ── */}
                <div style={{
                  position: 'absolute', top: '10%', left: '63%',
                  width: 14, height: 14, borderRadius: '50%',
                  background: '#22d3ee',
                  boxShadow: '0 0 20px #22d3ee, 0 0 36px rgba(34,211,238,0.45)',
                  animation: 'pl-blink 3s ease-in-out infinite alternate',
                  zIndex: 4,
                }}/>

              </div>{/* /tilt */}
            </div>{/* /float */}
          </Reveal>
          </div>{/* /planet-col */}

          {/* ── Planet keyframes ── */}
          <style>{`
            /* Float: gentle vertical bob */
            @keyframes pl-float {
              0%,100% { transform: translateY(0px);    }
              33%      { transform: translateY(-18px);  }
              66%      { transform: translateY(-8px);   }
            }

            /* Nebula background breathe */
            @keyframes pl-nebula {
              0%   { opacity: 0.5; transform: translate(-50%,-50%) scale(1);    }
              100% { opacity: 0.85; transform: translate(-50%,-50%) scale(1.1); }
            }

            /* Atmosphere halo pulse */
            @keyframes pl-atmos {
              0%,100% { opacity: 0.6; transform: translate(-50%,-50%) scale(1);    }
              50%      { opacity: 1;   transform: translate(-50%,-50%) scale(1.06); }
            }

            /* Planet glow breathe */
            @keyframes pl-glow {
              0%   { box-shadow: 0 0 70px rgba(124,58,237,0.55),  0 0 120px rgba(124,58,237,0.25), inset -30px -30px 60px rgba(0,0,0,0.55), inset 20px 20px 40px rgba(232,121,249,0.18); }
              100% { box-shadow: 0 0 110px rgba(124,58,237,0.85), 0 0 180px rgba(124,58,237,0.4),  inset -30px -30px 60px rgba(0,0,0,0.55), inset 20px 20px 40px rgba(232,121,249,0.3);  }
            }

            /* Surface shimmer spin */
            @keyframes pl-surface {
              from { transform: rotate(0deg);   }
              to   { transform: rotate(360deg); }
            }
            .pl-surface-spin { animation: pl-surface 28s linear infinite; }

            /* Outer ring — slow clockwise orbit */
            @keyframes pl-ring-orbit-a {
              from { transform: translate(-50%,-50%) rotateX(68deg) rotateZ(12deg);   }
              to   { transform: translate(-50%,-50%) rotateX(68deg) rotateZ(372deg);  }
            }
            .pl-ring-a { animation: pl-ring-orbit-a 22s linear infinite; }

            /* Middle ring — counter-clockwise */
            @keyframes pl-ring-orbit-b {
              from { transform: translate(-50%,-50%) rotateX(68deg) rotateZ(12deg);   }
              to   { transform: translate(-50%,-50%) rotateX(68deg) rotateZ(-348deg); }
            }
            .pl-ring-b { animation: pl-ring-orbit-b 32s linear infinite; }

            /* Faint outer ring — very slow clockwise */
            @keyframes pl-ring-orbit-c {
              from { transform: translate(-50%,-50%) rotateX(68deg) rotateZ(0deg);   }
              to   { transform: translate(-50%,-50%) rotateX(68deg) rotateZ(360deg); }
            }
            .pl-ring-c { animation: pl-ring-orbit-c 48s linear infinite; }

            /* Dot orbits — each dot gets its own radius + speed */
            @keyframes pl-orbit-0 { from{transform:rotate(0deg)   translateX(152px) scale(1);}  50%{transform:rotate(180deg)  translateX(152px) scale(1.4);} to{transform:rotate(360deg)  translateX(152px) scale(1);}  }
            @keyframes pl-orbit-1 { from{transform:rotate(45deg)  translateX(140px) scale(1);}  50%{transform:rotate(225deg)  translateX(140px) scale(1.3);} to{transform:rotate(405deg)  translateX(140px) scale(1);}  }
            @keyframes pl-orbit-2 { from{transform:rotate(90deg)  translateX(158px) scale(1);}  50%{transform:rotate(270deg)  translateX(158px) scale(1.4);} to{transform:rotate(450deg)  translateX(158px) scale(1);}  }
            @keyframes pl-orbit-3 { from{transform:rotate(135deg) translateX(132px) scale(1);}  50%{transform:rotate(315deg)  translateX(132px) scale(1.5);} to{transform:rotate(495deg)  translateX(132px) scale(1);}  }
            @keyframes pl-orbit-4 { from{transform:rotate(180deg) translateX(145px) scale(1);}  50%{transform:rotate(360deg)  translateX(145px) scale(1.3);} to{transform:rotate(540deg)  translateX(145px) scale(1);}  }
            @keyframes pl-orbit-5 { from{transform:rotate(225deg) translateX(162px) scale(1);}  50%{transform:rotate(405deg)  translateX(162px) scale(1.4);} to{transform:rotate(585deg)  translateX(162px) scale(1);}  }
            @keyframes pl-orbit-6 { from{transform:rotate(270deg) translateX(138px) scale(1);}  50%{transform:rotate(450deg)  translateX(138px) scale(1.3);} to{transform:rotate(630deg)  translateX(138px) scale(1);}  }
            @keyframes pl-orbit-7 { from{transform:rotate(315deg) translateX(168px) scale(1);}  50%{transform:rotate(495deg)  translateX(168px) scale(1.5);} to{transform:rotate(675deg)  translateX(168px) scale(1);}  }

            .pl-dot-0 { animation: pl-orbit-0 14s linear infinite; }
            .pl-dot-1 { animation: pl-orbit-1 17s linear infinite 0.8s; }
            .pl-dot-2 { animation: pl-orbit-2 13s linear infinite 1.5s; }
            .pl-dot-3 { animation: pl-orbit-3 19s linear infinite 0.3s; }
            .pl-dot-4 { animation: pl-orbit-4 15s linear infinite 1.1s; }
            .pl-dot-5 { animation: pl-orbit-5 16s linear infinite 0.6s; }
            .pl-dot-6 { animation: pl-orbit-6 12s linear infinite 2.0s; }
            .pl-dot-7 { animation: pl-orbit-7 20s linear infinite 0.4s; }

            /* Cyan accent pulse */
            @keyframes pl-blink {
              0%   { opacity: 0.6; transform: scale(0.85); }
              100% { opacity: 1.0; transform: scale(1.3);  }
            }

            /* ═══════════════════════════════════════════════
               MOBILE HERO — full responsive layout + perf
            ═══════════════════════════════════════════════ */
            @media (max-width: 767px) {

              /* Stack hero to single column */
              .hero-grid {
                grid-template-columns: 1fr !important;
                gap: 0 !important;
              }

              /* Reduce hero section padding */
              .hero-section {
                padding: 88px 5% 48px !important;
                min-height: auto !important;
              }

              /* Hide particles — saves ~12 animated elements */
              .hero-particle { display: none !important; }

              /* CTA buttons: stack full-width on mobile */
              .hero-cta-row {
                flex-direction: column !important;
                gap: 10px !important;
                margin-bottom: 32px !important;
              }
              .hero-cta-row a, .hero-cta-row button {
                width: 100% !important;
                text-align: center !important;
                justify-content: center !important;
              }

              /* Stats: compact 3-in-a-row */
              .hero-stats {
                gap: 8px !important;
                flex-wrap: nowrap !important;
                margin-bottom: 0 !important;
              }
              .hero-stat-card {
                padding: 12px 8px !important;
                border-radius: 12px !important;
                flex: 1 !important;
                min-width: 0 !important;
              }

              /* Planet column: constrained height, centered */
              .planet-col {
                height: 300px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin-top: 24px !important;
                overflow: visible !important;
              }

              /* Disable ring orbit animations — biggest perf win */
              .pl-ring-a {
                animation: none !important;
                transform: translate(-50%,-50%) rotateX(68deg) rotateZ(12deg) !important;
              }
              .pl-ring-b {
                animation: none !important;
                transform: translate(-50%,-50%) rotateX(68deg) rotateZ(12deg) !important;
              }
              .pl-ring-c {
                animation: none !important;
                transform: translate(-50%,-50%) rotateX(68deg) rotateZ(0deg) !important;
              }

              /* Disable surface spin */
              .pl-surface-spin { animation: none !important; }

              /* Hide 5 of 8 orbit dots — keep 3 for visual */
              .pl-dot-2,.pl-dot-3,.pl-dot-5,.pl-dot-6,.pl-dot-7 { display: none !important; }
            }

            /* Extra small phones */
            @media (max-width: 380px) {
              .hero-stat-card { padding: 10px 6px !important; }
            }
          `}</style>
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

      {/* ── SCROLLING SERVICES TICKER (Tilted) ── */}
      <div style={{
        width: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
        padding: '16px 0',
        position: 'relative',
        zIndex: 10,
        transform: 'rotate(-2deg) scale(1.05)',
        marginTop: '40px',
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
          <span id="typewriter-text" style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7, #22d3ee)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            minWidth: '10px',
          }} />
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

      {/* Typewriter Script - Client Side */}
      <script dangerouslySetInnerHTML={{__html: `(function() {
        var words = ${JSON.stringify(TYPEWRITER_WORDS)};
        var wordIndex = 0, charIndex = 0, isDeleting = false;
        
        function type() {
          var el = document.getElementById('typewriter-text');
          if (!el) { setTimeout(type, 100); return; }
          var currentWord = words[wordIndex];
          
          if (isDeleting) {
            charIndex--;
            el.textContent = currentWord.substring(0, charIndex);
          } else {
            charIndex++;
            el.textContent = currentWord.substring(0, charIndex);
          }
          
          var speed = isDeleting ? 40 : 80;
          
          if (!isDeleting && charIndex === currentWord.length) {
            speed = 2000;
            isDeleting = true;
          } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            speed = 300;
          }
          
          setTimeout(type, speed);
        }
        
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', function() { setTimeout(type, 500); });
        } else {
          setTimeout(type, 500);
        }
      })();`}} />
    </main>
  );
}