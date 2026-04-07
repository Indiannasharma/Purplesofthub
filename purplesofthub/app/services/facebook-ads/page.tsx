import type { Metadata } from "next"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Reveal from "@/components/Reveal"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com"

export const metadata: Metadata = {
  title: "Meta Ads (Facebook & Instagram) Pricing | PurpleSoftHub",
  description: "Professional Facebook & Instagram Ads management for businesses in Nigeria and worldwide. Plans from ₦150,000/month.",
  alternates: { canonical: `${SITE_URL}/services/facebook-ads` },
}

const PLANS = [
  {
    name: 'Starter',
    ngn: 150000,
    usd: 107,
    adSpend: '₦150,000 – ₦300,000 ($107 – $214 USD)',
    features: [
      'Campaign setup & strategy',
      '3–5 ad creatives per month',
      'Basic audience targeting',
      'Weekly optimization & reports',
      '1 platform (Facebook or Instagram)',
    ],
    color: '#6b7280',
  },
  {
    name: 'Growth',
    badge: 'Most Popular',
    ngn: 250000,
    usd: 179,
    adSpend: '₦300,000 – ₦750,000 ($214 – $536 USD)',
    features: [
      'Everything in Starter',
      '8–10 ad creatives per month',
      'Advanced targeting, lookalikes & retargeting',
      'A/B testing',
      'Bi-weekly strategy calls',
      'Both Facebook & Instagram',
    ],
    color: '#3b82f6',
  },
  {
    name: 'Scale',
    ngn: 400000,
    usd: 286,
    adSpend: '₦750,000+ ($536+ USD)',
    features: [
      'Everything in Growth',
      'Unlimited ad creatives & variations',
      'Full-funnel strategy (Awareness → Conversion)',
      'Advanced pixel & tracking setup',
      'Weekly performance calls + detailed dashboard',
      'Competitor analysis',
    ],
    color: '#8b5cf6',
  },
  {
    name: 'Enterprise',
    ngn: 600000,
    usd: 429,
    ngnDisplay: '₦600,000+',
    usdDisplay: '$429+ USD',
    adSpend: '₦1,500,000+ ($1,071+ USD)',
    customPricing: true,
    features: [
      'Everything in Scale',
      'Dedicated account manager',
      'Custom automation & funnels',
      'Creative production support',
      'Multi-account management',
      'Monthly in-depth audit',
    ],
    color: '#a855f7',
  },
]

export default function FacebookAdsPage() {

  return (
    <main style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh", overflowX: "hidden" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ padding: "120px 5% 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%,rgba(124,58,237,.2) 0%,transparent 60%)", pointerEvents: "none" }} />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <Reveal>
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,.12)", border: "1px solid rgba(168,85,247,.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 24, fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: 1 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 8px #a855f7", display: "inline-block" }} />
              META ADS PRICING
            </div>
            <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(32px,4vw,56px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-2px", marginBottom: 16 }}>
              Meta Ads <span className="grad-text">Pricing</span>
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 18, maxWidth: 600, margin: "0 auto 8px" }}>
              Choose Your Perfect Plan
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 500, margin: "0 auto 32px" }}>
              Professional Facebook & Instagram Ads management for businesses in Nigeria and worldwide.
              All packages include strategy, creative direction, optimization, and performance reporting.
              Ad spend is paid directly to Meta (Facebook/Instagram).
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── PRICING TABLE ── */}
      <section style={{ padding: "0 5% 80px", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Plans Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
            marginBottom: 40,
          }}>
            {PLANS.map((plan, i) => (
              <div
                key={plan.name}
                className="glass-card"
                style={{
                  padding: "32px 28px",
                  position: "relative",
                  overflow: "hidden",
                  borderTop: plan.badge ? `3px solid ${plan.color}` : undefined,
                }}
              >
                {plan.badge && (
                  <span style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: `linear-gradient(135deg, ${plan.color}, #a855f7)`,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 100,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    {plan.badge}
                  </span>
                )}

                <p style={{ fontSize: 11, fontWeight: 700, color: plan.color, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>
                  Plan 0{i + 1}
                </p>

                <h3 style={{ fontFamily: "Outfit", fontSize: 22, fontWeight: 900, color: "var(--text-primary)", margin: "0 0 16px" }}>
                  {plan.name}
                </h3>

                <div style={{ marginBottom: 8 }}>
                  <span style={{
                    fontFamily: "Outfit",
                    fontSize: 36,
                    fontWeight: 900,
                    color: plan.color,
                  }}>
                    {plan.ngnDisplay || `₦${plan.ngn.toLocaleString()}`}
                  </span>
                  {plan.customPricing && (
                    <span style={{ fontSize: 14, color: "var(--text-muted)", marginLeft: 4 }}>
                      – Custom pricing
                    </span>
                  )}
                </div>

                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
                  Monthly Management Fee
                </p>

                <div style={{
                  height: 1,
                  background: "var(--border)",
                  margin: "20px 0",
                }} />

                <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4, fontWeight: 600 }}>
                  Recommended Ad Spend
                </p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
                  {plan.adSpend}
                </p>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "grid", gap: 10 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                      <span style={{ color: plan.color, fontWeight: 900, flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/contact?plan=${plan.name}&service=facebook-ads`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "14px",
                    borderRadius: 12,
                    border: `2px solid ${plan.color}40`,
                    color: plan.color,
                    fontWeight: 800,
                    fontSize: 14,
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = plan.color
                    el.style.color = "#fff"
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement
                    el.style.background = "transparent"
                    el.style.color = plan.color
                  }}
                >
                  Get Started →
                </Link>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div style={{
            background: "rgba(124,58,237,.04)",
            border: "1px solid rgba(124,58,237,.12)",
            borderRadius: 16,
            padding: "32px",
            marginBottom: 40,
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
              <div>
                <h4 style={{ fontFamily: "Outfit", fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
                  One-time Setup Fee
                </h4>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
                  ₦100,000 (~$71 USD)
                </p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  Includes Meta Business Suite setup, pixel installation, conversion tracking & initial strategy session.
                  <strong style={{ color: "var(--accent)" }}> Waived for 3-month or longer contracts.</strong>
                </p>
              </div>
              <div>
                <h4 style={{ fontFamily: "Outfit", fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
                  Performance-Based Option
                </h4>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
                  15% of ad spend
                </p>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Minimum ₦200,000 / ~$143 USD per month
                </p>
              </div>
            </div>
          </div>

          {/* Add-ons */}
          <div style={{
            background: "rgba(124,58,237,.04)",
            border: "1px solid rgba(124,58,237,.12)",
            borderRadius: 16,
            padding: "32px",
            marginBottom: 40,
          }}>
            <h4 style={{ fontFamily: "Outfit", fontSize: 18, fontWeight: 900, color: "var(--text-primary)", marginBottom: 20 }}>
              Add-ons
            </h4>
            <div style={{ display: "grid", gap: 12 }}>
              {[
                'Extra set of 5 ad creatives (static + video) — ₦80,000 (~$57 USD)',
                'Custom landing page or lead form optimization — ₦150,000 (~$107 USD) one-time',
                'Integration with PurpleSoftHub Academy or your SaaS platform — Special rate',
              ].map(item => (
                <div key={item} style={{ display: "flex", gap: 8, fontSize: 14, color: "var(--text-secondary)" }}>
                  <span style={{ color: "#a855f7", fontWeight: 900, flexShrink: 0 }}>+</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{
            background: "rgba(124,58,237,.06)",
            border: "1px solid rgba(124,58,237,0.15)",
            borderRadius: 12,
            padding: "24px",
            marginBottom: 40,
          }}>
            <h4 style={{ fontFamily: "Outfit", fontSize: 14, fontWeight: 700, color: "var(--accent)", marginBottom: 12 }}>
              Important Notes
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
              {[
                'Minimum commitment: 1 month (3-month contracts receive 10% discount)',
                'Results depend on your offer, creatives, and market conditions. We focus on delivering strong ROAS.',
                'International clients are welcome — pay in USD or NGN.',
              ].map(note => (
                <li key={note} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text-muted)" }}>
                  <span style={{ color: "#a855f7", flexShrink: 0 }}>•</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 24 }}>
              Not sure which plan is right for you?
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contact">
                <button className="btn-main animate-glow" style={{ padding: "14px 32px", fontSize: 15 }}>
                  Book a Free Consultation Call
                </button>
              </Link>
              <a
                href="https://wa.me/2348167593393"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 32px",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#25D366",
                  border: "2px solid #25D366",
                  borderRadius: 12,
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = "#25D366"
                  el.style.color = "#fff"
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = "transparent"
                  el.style.color = "#25D366"
                }}
              >
                💬 Chat with us on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}