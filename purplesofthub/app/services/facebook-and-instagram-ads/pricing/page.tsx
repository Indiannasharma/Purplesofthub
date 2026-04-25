'use client'

import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Reveal from "@/components/Reveal"
import { getServiceBySlug } from "@/lib/payments/service-plans"
import ServicePricingCards from "@/components/services/ServicePricingCards"

const PLANS = [
  {
    name: 'Flex Weekly',
    ngn: 42000,
    usd: 30,
    adSpend: 'â‚¦42,000 minimum / week',
    features: [
      'Weekly ad management',
      'Flexible budget',
      'Creative updates',
      'Basic analytics',
      '1 ad campaign',
      'No long term commitment'
    ],
    color: '#14b8a6',
  },
  {
    name: 'Starter',
    ngn: 150000,
    usd: 107,
    adSpend: 'â‚¦150,000 â€“ â‚¦300,000 ($107 â€“ $214 USD)',
    features: [
      'Campaign setup & strategy',
      '3â€“5 ad creatives per month',
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
    adSpend: 'â‚¦300,000 â€“ â‚¦750,000 ($214 â€“ $536 USD)',
    features: [
      'Everything in Starter',
      '8â€“10 ad creatives per month',
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
    adSpend: 'â‚¦750,000+ ($536+ USD)',
    features: [
      'Everything in Growth',
      'Unlimited ad creatives & variations',
      'Full-funnel strategy (Awareness â†’ Conversion)',
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
    ngnDisplay: 'â‚¦600,000+',
    usdDisplay: '$429+ USD',
    adSpend: 'â‚¦1,500,000+ ($1,071+ USD)',
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

export default function FacebookAdsPricingPage() {
  const service = getServiceBySlug('facebook-and-instagram-ads')

  return (
    <main style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh", overflowX: "hidden" }}>
      <Navbar />

      {/* â”€â”€ HERO â”€â”€ */}
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

      {/* â”€â”€ PRICING TABLE â”€â”€ */}
      <section style={{ padding: "0 5% 80px", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Plans Grid */}
          {service && (
            <ServicePricingCards
              service={service}
              showAll={true}
            />
          )}

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
                  â‚¦100,000 (~$71 USD)
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
                  Minimum â‚¦200,000 / ~$143 USD per month
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
                'Extra set of 5 ad creatives (static + video) â€” â‚¦80,000 (~$57 USD)',
                'Custom landing page or lead form optimization â€” â‚¦150,000 (~$107 USD) one-time',
                'Integration with PurpleSoftHub Academy or your SaaS platform â€” Special rate',
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
                'International clients are welcome â€” pay in USD or NGN.',
              ].map(note => (
                <li key={note} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text-muted)" }}>
                  <span style={{ color: "#a855f7", flexShrink: 0 }}>â€¢</span>
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
                className="whatsapp-cta-btn-pricing"
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
              >
                ðŸ’¬ Chat with us on WhatsApp
              </a>
              <style>{`
                .whatsapp-cta-btn-pricing:hover {
                  background: #25D366 !important;
                  color: #fff !important;
                }
              `}</style>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

