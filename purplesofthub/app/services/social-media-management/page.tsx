import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { getServiceBySlug } from "@/lib/payments/service-plans";
import ServicePricingCards from "@/components/services/ServicePricingCards";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com";

export const metadata: Metadata = {
  title: "Social Media Management | PurpleSoftHub",
  description:
    "Professional social media management for brands that need consistent content, engagement, reporting, and growth strategy. Packages start from ₦75,000/month.",
  keywords: ["social media management", "facebook management", "instagram management", "tiktok management", "social media pricing"],
  alternates: { canonical: `${SITE_URL}/services/social-media-management` },
  openGraph: {
    title: "Social Media Management | PurpleSoftHub",
    description: "Professional social media management from ₦75,000/month",
    url: `${SITE_URL}/services/social-media-management`,
    siteName: "PurpleSoftHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Media Management",
    description: "Professional social media management from ₦75,000/month",
  },
};

export default function SocialMediaManagementPage() {
  const service = getServiceBySlug("social-media-management");
  if (!service) return null;

  const accent = "#7c3aed";
  const description =
    "At PurpleSoftHub, we help businesses build a strong and consistent presence across social media. From content planning and posting to engagement, analytics, and growth strategy, we manage your brand professionally so you can focus on running your business.";

  return (
    <main style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh", overflowX: "hidden" }}>
      <Navbar />

      <div className="svc-breadcrumb" style={{ padding: "100px 5% 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Home</Link>
            <span style={{ color: "rgba(168,85,247,.4)" }}>&gt;</span>
            <Link href="/services" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Services</Link>
            <span style={{ color: "rgba(168,85,247,.4)" }}>&gt;</span>
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>{service.name}</span>
          </div>
        </div>
      </div>

      <section style={{ padding: "40px 5% 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 800, height: 800, borderRadius: "50%", background: `radial-gradient(circle,${accent}22 0%,transparent 65%)`, top: "-20%", left: "-10%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(34,211,238,.12) 0%,transparent 65%)", bottom: "-10%", right: "0", pointerEvents: "none" }} />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

        <div className="svc-hero-grid" style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <Reveal>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,.12)", border: "1px solid rgba(168,85,247,.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 20, fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: 1 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, boxShadow: `0 0 8px ${accent}`, display: "inline-block" }} />
                {service.category.toUpperCase()}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(32px,4vw,56px)", fontWeight: 900, lineHeight: 1.1, color: "var(--text-primary)", letterSpacing: "-2px", marginBottom: 16 }}>
                <span className="grad-text">Grow Your Brand With Professional Social Media Management</span>
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p style={{ fontFamily: "Outfit", fontSize: "clamp(17px,2vw,22px)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.4 }}>
                Consistent social media management that grows your visibility and keeps your brand active
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.85, marginBottom: 36 }}>
                {description}
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="svc-hero-btns" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Link href="/services/social-media-management/pricing">
                  <button className="btn-main animate-glow" style={{ padding: "14px 30px", fontSize: 15 }}>View Full Pricing</button>
                </Link>
                <Link href="#pricing">
                  <button className="btn-outline" style={{ padding: "14px 30px", fontSize: 15 }}>See Packages -&gt;</button>
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div className="glass-card animate-float svc-hero-card" style={{ padding: "48px 40px", textAlign: "center" }}>
              <div className="svc-hero-emoji" style={{ width: 88, height: 88, borderRadius: 24, background: `linear-gradient(135deg,${accent},#22d3ee)`, margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, boxShadow: `0 16px 48px ${accent}44` }}>
                {service.icon}
              </div>
              <div style={{ fontFamily: "Outfit", fontWeight: 900, fontSize: 22, color: "var(--text-primary)", marginBottom: 8 }}>
                Pricing
              </div>
              <div style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 900, color: "var(--text-primary)", marginBottom: 10 }}>
                From ₦75,000/month
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
                Flexible monthly social media management packages for startups, small businesses, and growing brands. Choose a plan that matches your content needs and growth goals.
              </div>
              <div style={{ display: "grid", gap: 10, marginBottom: 28, textAlign: "left" }}>
                {["Monthly content calendar", "Page optimization", "Consistent posting", "Performance reports"].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ color: accent, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/services/social-media-management/pricing">
                <button className="btn-main" style={{ width: "100%", padding: "13px", fontSize: 15, textAlign: "center", borderRadius: 10, cursor: "pointer" }}>
                  View All Plans
                </button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: "90px 5%", background: "rgba(124,58,237,.04)", borderTop: "1px solid rgba(124,58,237,.12)", borderBottom: "1px solid rgba(124,58,237,.12)" }}>
        <div className="svc-overview-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
          <Reveal>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>OVERVIEW</p>
              <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(26px,3vw,40px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px", lineHeight: 1.15, marginBottom: 20 }}>
                What&apos;s Included in Our <span className="grad-text">Social Media Management</span> Service
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.85, marginBottom: 28 }}>
                {description}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  "Content Planning",
                  "Page Management",
                  "Audience Engagement",
                  "Monthly Reports",
                  "Brand Growth Strategy",
                  "Social Media Optimization",
                  "Facebook & Instagram Management",
                  "TikTok & X Support",
                ].map((item) => (
                  <span key={item} style={{ background: "rgba(124,58,237,.1)", border: "1px solid rgba(168,85,247,.25)", borderRadius: 100, padding: "5px 14px", fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="glass-card" style={{ padding: "36px 32px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${accent},#22d3ee)` }} />
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "var(--accent)", textTransform: "uppercase", marginBottom: 10 }}>PRICING</p>
              <div style={{ fontFamily: "Outfit", fontSize: "clamp(26px,3vw,36px)", fontWeight: 900, background: "linear-gradient(135deg,#7c3aed,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6 }}>
                From ₦75,000/month
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                Flexible monthly social media management packages for startups, small businesses, and growing brands. Choose a plan that matches your content needs and growth goals.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {["Monthly content calendar", "Page optimization", "Consistent posting", "Performance reports"].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ color: accent, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/services/social-media-management/pricing">
                <button className="btn-main" style={{ width: "100%", padding: "13px", fontSize: 15, textAlign: "center", borderRadius: 10, cursor: "pointer" }}>
                  View All Plans
                </button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: "90px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>WHAT&apos;S INCLUDED</p>
              <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,46px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px" }}>
                Everything You <span className="grad-text">Get</span>
              </h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
            {[
              "Social Media Strategy",
              "Content Calendar",
              "Post Scheduling",
              "Page Optimization",
              "Caption Writing",
              "Audience Engagement",
              "Monthly Analytics Report",
              "Brand Growth Support",
            ].map((item, i) => (
              <Reveal key={item} delay={i * 0.05}>
                <div className="glass-card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#22d3ee)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>✓</div>
                  <span style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.5 }}>{item}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 5%", background: "rgba(124,58,237,.04)", borderTop: "1px solid rgba(124,58,237,.12)", borderBottom: "1px solid rgba(124,58,237,.12)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>TOOLS & TECH</p>
            <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(24px,3vw,40px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px", marginBottom: 40 }}>
              What We <span className="grad-text">Use</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              {[
                "Meta Business Suite",
                "Canva Pro",
                "Adobe Photoshop",
                "CapCut",
                "Google Analytics",
                "TikTok Business",
                "X Analytics",
                "Notion",
              ].map((tool) => (
                <span key={tool} className="glass-card" style={{ padding: "10px 20px", fontSize: 14, fontWeight: 600, color: "var(--accent)", borderRadius: 100 }}>
                  {tool}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="pricing" style={{ padding: "90px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "var(--accent)", textTransform: "uppercase", marginBottom: 12 }}>PRICING PREVIEW</p>
              <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(28px,3.5vw,46px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px" }}>
                Choose Your <span className="grad-text">Plan</span>
              </h2>
            </div>
          </Reveal>
          <ServicePricingCards
            service={service}
            showAll={false}
            previewCount={3}
            showMoreButton={false}
          />
          <div style={{ textAlign: "center" }}>
            <Link
              href="/services/social-media-management/pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                color: "#fff",
                padding: "16px 40px",
                borderRadius: "14px",
                textDecoration: "none",
                fontWeight: 800,
                fontSize: "16px",
                boxShadow: "0 8px 28px rgba(124,58,237,0.3)",
                transition: "all 0.2s",
              }}
            >
              See Full Pricing
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: "100px 5%", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%,rgba(124,58,237,.16) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <Reveal>
          <div style={{ position: "relative", zIndex: 2, maxWidth: 660, margin: "0 auto" }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, color: "var(--accent)", textTransform: "uppercase", marginBottom: 20 }}>
              - Ready to Grow? -
            </div>
            <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(30px,5vw,54px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 20 }}>
              Ready to Build a Stronger <span className="grad-text">Social Presence</span>?
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 17, marginBottom: 40, lineHeight: 1.7 }}>
              Explore the full pricing options and choose the monthly management package that fits your brand goals.
            </p>
            <div className="svc-cta-btns" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/services/social-media-management/pricing">
                <button className="btn-main animate-glow" style={{ padding: "16px 38px", fontSize: 16 }}>See Full Pricing</button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 1024px) {
          .svc-overview-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 768px) {
          .svc-breadcrumb { padding: 90px 16px 0 !important; }
          .svc-hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .svc-hero-card { padding: 24px 20px !important; max-width: 100% !important; }
          .svc-hero-emoji { width: 64px !important; height: 64px !important; font-size: 32px !important; }
          .svc-hero-btns { flex-direction: column !important; }
          .svc-hero-btns a, .svc-hero-btns button { width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
          .svc-cta-btns { flex-direction: column !important; align-items: center !important; }
          .svc-cta-btns a, .svc-cta-btns button { width: 100% !important; max-width: 340px !important; }
        }
      `}</style>
    </main>
  );
}
