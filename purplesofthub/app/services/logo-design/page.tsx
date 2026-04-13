import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getServiceBySlug } from '@/lib/payments/service-plans'
import ServicePricingCards from '@/components/services/ServicePricingCards'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Logo Design Services | PurpleSoftHub',
  description: 'Professional logo design that captures your brand identity. Custom designs, unlimited revisions, and all file formats included. Starting from ₦25,000.',
  keywords: ['logo design Nigeria', 'logo designer Africa', 'custom logo design', 'professional logo design'],
}

const FEATURES = [
  { icon: '🎨', title: '100% Original', desc: 'Every logo is custom-made for your brand — no templates, no stock icons.' },
  { icon: '⚡', title: 'Fast Delivery', desc: 'Basic logos in 3–5 business days. Full packages in 7–14 days.' },
  { icon: '🔄', title: 'Unlimited Revisions', desc: 'We iterate until you are completely satisfied with your logo.' },
  { icon: '📁', title: 'All File Formats', desc: 'AI, EPS, SVG, PNG (transparent), PDF — print-ready and digital.' },
  { icon: '🌍', title: 'African & Global', desc: 'Designs that resonate locally and appeal to a global audience.' },
  { icon: '©️', title: 'Full Ownership', desc: 'You receive 100% commercial rights and copyright of your logo.' },
]

const PROCESS = [
  { step: '01', title: 'Brief', icon: '📋', desc: 'We learn your brand, industry, audience, and style preferences through a short discovery questionnaire.' },
  { step: '02', title: 'Concepts', icon: '💡', desc: 'We present 3 distinct logo directions for you to review and give feedback on.' },
  { step: '03', title: 'Refine', icon: '✏️', desc: 'We polish your chosen concept with unlimited revisions until it\'s exactly right.' },
  { step: '04', title: 'Deliver', icon: '📦', desc: 'You receive print-ready and digital files in every format, plus usage guidelines.' },
]

const FAQS = [
  { q: 'What file formats will I receive?', a: 'You\'ll get AI, EPS, SVG, PNG (transparent background), and PDF — every format for both print and digital use.' },
  { q: 'How many concepts do you provide?', a: 'We present 3 initial concepts. Once you choose a direction, revisions are included until you\'re 100% happy.' },
  { q: 'How long does a logo take?', a: 'Basic logos are delivered in 3–5 business days. Full brand identity packages take 7–14 days.' },
  { q: 'Can I use my logo commercially?', a: 'Yes — you receive full commercial ownership and copyright of your final logo design. No royalties or licencing fees.' },
  { q: 'Do you design logos for startups and small businesses?', a: 'Absolutely. We work with startups, entrepreneurs, SMEs, and personal brands at every budget level.' },
  { q: 'Can you redesign my existing logo?', a: 'Yes — we offer logo refresh and rebranding services. We\'ll evolve your existing identity or create something completely new.' },
]

export default function LogoDesignPage() {
  const service = getServiceBySlug('logo-design')

  if (!service) return null

  return (
    <>
      <Navbar />

      <main style={{
        minHeight: '100vh',
        background: 'var(--cyber-bg, #f0ebff)',
        position: 'relative',
        overflowX: 'hidden',
      }}>

        {/* Grid background */}
        <div style={{
          position: 'fixed', inset: 0,
          backgroundImage: `linear-gradient(rgba(236,72,153,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.04) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          pointerEvents: 'none', zIndex: 0,
        }}/>

        {/* Glow */}
        <div style={{
          position: 'fixed', top: '-200px', right: '-100px',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }}/>
        <div style={{
          position: 'fixed', bottom: '-100px', left: '-100px',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }}/>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: 'clamp(40px, 6vw, 80px) 24px' }}>

          {/* ── HERO ── */}
          <div style={{ textAlign: 'center', marginBottom: 'clamp(48px, 6vw, 80px)' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.25)',
              borderRadius: 100, padding: '6px 18px', marginBottom: 24,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#ec4899', boxShadow: '0 0 8px #ec4899',
                display: 'inline-block', animation: 'pulse 1.8s infinite', flexShrink: 0,
              }}/>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#ec4899', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Logo Design
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 58px)',
              fontWeight: 900,
              color: 'var(--cyber-heading, #1a1a2e)',
              margin: '0 0 20px',
              lineHeight: 1.1,
              letterSpacing: '-0.5px',
            }}>
              A Logo That Makes Your <br/>
              <span style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Brand Unforgettable
              </span>
            </h1>

            <p style={{
              fontSize: 'clamp(15px, 2vw, 17px)',
              color: 'var(--cyber-body, #4a3f6b)',
              maxWidth: 580, margin: '0 auto 32px', lineHeight: 1.75,
            }}>
              Custom, original logo designs built around your brand story. 100% unique, delivered in every format, with unlimited revisions until you love it.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#ec4899' }}>
                From ₦{service.startingPriceNGN ? service.startingPriceNGN.toLocaleString() : '25,000'}
              </span>
              <span style={{ fontSize: 14, color: 'var(--cyber-body, #4a3f6b)' }}>
                / ${service.startingPriceUSD || '17'} USD
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="https://wa.me/2348167593393"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#25D366', color: '#fff',
                  padding: '11px 24px', borderRadius: 12,
                  textDecoration: 'none', fontWeight: 700, fontSize: 14,
                }}
              >
                💬 Get a Free Quote
              </a>
              <Link
                href="#pricing"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)',
                  color: '#ec4899', padding: '11px 24px', borderRadius: 12,
                  textDecoration: 'none', fontWeight: 700, fontSize: 14,
                }}
              >
                View Packages →
              </Link>
            </div>
          </div>

          {/* ── FEATURE PILLS ── */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 10,
            justifyContent: 'center', marginBottom: 64,
          }}>
            {['100% Original', 'Unlimited Revisions', 'All File Formats', 'Full Copyright Ownership', 'Fast Delivery', 'Print & Digital Ready'].map(tag => (
              <span key={tag} style={{
                fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 100,
                background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)',
                color: '#ec4899',
              }}>
                ✓ {tag}
              </span>
            ))}
          </div>

          {/* ── PRICING ── */}
          <div id="pricing" style={{ marginBottom: 72 }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ec4899', marginBottom: 8 }}>Packages</p>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, color: 'var(--cyber-heading, #1a1a2e)', margin: '0 0 10px' }}>
                Choose Your Logo Package
              </h2>
              <p style={{ fontSize: 15, color: 'var(--cyber-body, #4a3f6b)', margin: 0 }}>
                All packages include unlimited revisions until you're 100% happy
              </p>
            </div>
            <ServicePricingCards service={service} showAll={true} />
          </div>

          {/* ── PROCESS ── */}
          <div style={{ marginBottom: 72 }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ec4899', marginBottom: 8 }}>How It Works</p>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 900, color: 'var(--cyber-heading, #1a1a2e)', margin: 0 }}>
                Our Logo Design Process
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              {PROCESS.map((p, i) => (
                <div key={p.step} style={{
                  background: 'var(--cyber-card, rgba(255,255,255,0.7))',
                  border: '1px solid var(--cyber-border, rgba(236,72,153,0.15))',
                  borderRadius: 16, padding: '24px 22px',
                  position: 'relative', overflow: 'hidden',
                  backdropFilter: 'blur(10px)',
                }}>
                  {/* Step number watermark */}
                  <div style={{
                    position: 'absolute', top: 12, right: 16,
                    fontSize: 48, fontWeight: 900, color: 'rgba(236,72,153,0.08)', lineHeight: 1,
                  }}>
                    {p.step}
                  </div>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, marginBottom: 14,
                  }}>
                    {p.icon}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--cyber-heading, #1a1a2e)', margin: '0 0 6px' }}>{p.title}</p>
                  <p style={{ fontSize: 13, color: 'var(--cyber-body, #4a3f6b)', margin: 0, lineHeight: 1.55 }}>{p.desc}</p>
                  {i < PROCESS.length - 1 && (
                    <div style={{
                      position: 'absolute', top: '50%', right: -10,
                      width: 20, height: 2,
                      background: 'rgba(236,72,153,0.3)',
                      display: 'none', // hidden on mobile, shown via CSS
                    }} className="process-arrow"/>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── WHY CHOOSE US ── */}
          <div style={{
            background: 'var(--cyber-card, rgba(255,255,255,0.7))',
            border: '1px solid var(--cyber-border, rgba(236,72,153,0.15))',
            borderRadius: 24, padding: 'clamp(28px, 4vw, 48px)',
            backdropFilter: 'blur(10px)', marginBottom: 56,
          }}>
            <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, color: 'var(--cyber-heading, #1a1a2e)', margin: '0 0 32px', textAlign: 'center' }}>
              Why Choose PurpleSoftHub for Logo Design?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
              {FEATURES.map(item => (
                <div key={item.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                    background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--cyber-heading, #1a1a2e)', margin: '0 0 4px' }}>{item.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--cyber-body, #4a3f6b)', margin: 0, lineHeight: 1.55 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FAQs ── */}
          <div style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, color: 'var(--cyber-heading, #1a1a2e)', textAlign: 'center', margin: '0 0 36px' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {FAQS.map(faq => (
                <div key={faq.q} style={{
                  background: 'var(--cyber-card, rgba(255,255,255,0.7))',
                  border: '1px solid var(--cyber-border, rgba(124,58,237,0.12))',
                  borderRadius: 14, padding: '18px 20px',
                  backdropFilter: 'blur(8px)',
                }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#ec4899', margin: '0 0 8px' }}>
                    {faq.q}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--cyber-body, #4a3f6b)', margin: 0, lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA ── */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(236,72,153,0.12), rgba(124,58,237,0.08))',
            border: '1px solid rgba(236,72,153,0.25)',
            borderRadius: 24, padding: 'clamp(32px, 4vw, 52px)',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, transparent, #ec4899, #a855f7, transparent)',
            }} />
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎨</div>
            <h2 style={{ fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 900, color: 'var(--cyber-heading, #1a1a2e)', margin: '0 0 12px' }}>
              Ready to get your perfect logo?
            </h2>
            <p style={{ fontSize: 15, color: 'var(--cyber-body, #4a3f6b)', margin: '0 0 28px', lineHeight: 1.7, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
              Chat with us on WhatsApp and let's bring your brand vision to life. Free consultation, no obligation.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="https://wa.me/2348167593393"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#25D366', color: '#fff',
                  padding: '13px 28px', borderRadius: 12,
                  textDecoration: 'none', fontWeight: 800, fontSize: 15,
                  boxShadow: '0 4px 16px rgba(37,211,102,0.3)',
                }}
              >
                💬 Chat on WhatsApp
              </a>
              <Link
                href="#pricing"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.35)',
                  color: '#ec4899', padding: '13px 28px', borderRadius: 12,
                  textDecoration: 'none', fontWeight: 800, fontSize: 15,
                }}
              >
                View Packages →
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />

      <style>{`
        :root {
          --cyber-bg: #fdf4ff;
          --cyber-card: rgba(255,255,255,0.75);
          --cyber-border: rgba(236,72,153,0.12);
          --cyber-heading: #1a1a2e;
          --cyber-body: #4a3f6b;
        }
        .dark {
          --cyber-bg: #06030f;
          --cyber-card: rgba(13,5,32,0.8);
          --cyber-border: rgba(236,72,153,0.18);
          --cyber-heading: #ffffff;
          --cyber-body: #9d8fd4;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.65); }
        }
        @media (min-width: 768px) {
          .process-arrow { display: block !important; }
        }
      `}</style>
    </>
  )
}
