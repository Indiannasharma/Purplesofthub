import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Link from "next/link";
import services from "@/app/services/_data/services";
import ServicesContent from "@/app/services/_components/ServicesContent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com";

export const metadata: Metadata = {
  title: "Digital Services That Drive Growth | PurpleSoftHub",
  description:
    "Explore all PurpleSoftHub services: Web Development, Mobile Apps, Digital Marketing, UI/UX Design, SaaS, Google Ads, Facebook Ads, Content Creation, SEO, Branding, E-commerce & Music Promotion.",
  alternates: { canonical: `${SITE_URL}/services` },
  openGraph: {
    title: "Digital Services That Drive Growth — PurpleSoftHub",
    description: "10+ digital services under one roof: Web, Mobile, Marketing, Design, Creative & Music.",
    url: `${SITE_URL}/services`,
    siteName: "PurpleSoftHub",
    type: "website",
  },
};

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
              Digital Services That Drive <span className="grad-text">Growth</span>
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 18, maxWidth: 580, margin: "0 auto 40px" }}>
              Everything your business needs to build, launch, market, and grow — under one roof.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact">
                <button className="btn-main animate-glow" style={{ padding: "14px 32px", fontSize: 16 }}>Start a Project</button>
              </Link>
              <Link href="/contact">
                <button className="btn-outline" style={{ padding: "14px 32px", fontSize: 16 }}>View Pricing →</button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── CLIENT COMPONENT: TABS + CARDS + STATS + CTA ── */}
      <ServicesContent services={services} />

      <Footer />
    </main>
  );
}
