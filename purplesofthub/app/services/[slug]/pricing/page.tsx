import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ServicePricingCards from '@/components/services/ServicePricingCards'
import RegionalServicePrice from '@/components/services/RegionalServicePrice'
import { getServiceBySlug } from '@/lib/payments/service-plans'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://purplesofthub.com'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const service = getServiceBySlug(slug)

  if (!service) return { title: 'Pricing Not Found' }

  return {
    title: `${service.name} Pricing | PurpleSoftHub`,
    description: `${service.description} Explore PurpleSoftHub pricing and choose the plan that fits your goals.`,
    alternates: { canonical: `${SITE_URL}/services/${slug}/pricing` },
  }
}

export default async function ServicePricingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = getServiceBySlug(slug)

  if (!service) notFound()

  const isGoogleAds = service.slug === 'google-ads'

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar />
      <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(120px, 15vw, 180px) 16px clamp(56px, 8vw, 104px)' }}>
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 720, height: 720, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,.18), transparent 68%)', top: '-45%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
          <Link href={`/services/${slug}`} style={{ color: 'var(--service-detail-accent)', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            ← Back to {service.name}
          </Link>
          <p style={{ margin: '28px 0 12px', color: 'var(--service-detail-accent)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {service.name} pricing
          </p>
          <h1 style={{ margin: '0 0 18px', fontSize: 'clamp(34px, 5vw, 58px)', lineHeight: 1.06, letterSpacing: '-0.055em', fontWeight: 900 }}>
            Clear support for every stage of growth.
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.7 }}>
            {isGoogleAds
              ? 'Choose a management plan, then fund your Google campaign directly. Your media budget stays in your Google Ads account.'
              : 'Choose the plan that fits your current needs, with transparent inclusions and a clear next step.'}
          </p>
        </div>
      </section>

      {isGoogleAds && (
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1, border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden', background: 'var(--border)' }}>
            <div style={{ padding: '20px', background: 'var(--bg-card)' }}>
              <strong style={{ display: 'block', marginBottom: 6, color: 'var(--text-primary)', fontSize: 14 }}>Management fee</strong>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>Paid to PurpleSoftHub for campaign strategy and optimisation.</span>
            </div>
            <div style={{ padding: '20px', background: 'var(--bg-card)' }}>
              <strong style={{ display: 'block', marginBottom: 6, color: 'var(--text-primary)', fontSize: 14 }}>Media budget</strong>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                From <RegionalServicePrice amountNGN={21000} amountUSD={15} plus /> / week for a short campaign, or <RegionalServicePrice amountNGN={70000} amountUSD={50} plus /> / month for monthly management. Paid directly to Google.
              </span>
            </div>
            <div style={{ padding: '20px', background: 'var(--bg-card)' }}>
              <strong style={{ display: 'block', marginBottom: 6, color: 'var(--text-primary)', fontSize: 14 }}>No false promises</strong>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>We optimise toward qualified traffic, leads, and measurable growth.</span>
            </div>
          </div>
        </section>
      )}

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(36px, 6vw, 80px) 16px clamp(72px, 9vw, 120px)' }}>
        <ServicePricingCards service={service} showAll={true} />
      </section>
      <Footer />
    </main>
  )
}
