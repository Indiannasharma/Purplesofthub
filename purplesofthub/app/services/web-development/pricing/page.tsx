'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getServiceBySlug } from '@/lib/payments/service-plans'
import ServicePricingCards from '@/components/services/ServicePricingCards'

const tiers = [
  {
    name: 'Starter',
    ngn: 450000,
    usd: 300,
    delivery: '2 weeks',
    support: '2 weeks',
    popular: false,
    features: [
      '1–3 pages',
      'Mobile responsive design',
      'Contact form',
      'Basic SEO setup',
      'Social media links',
      'WhatsApp chat button',
      'Free domain connection',
      'SSL Certificate',
    ],
  },
  {
    name: 'Essential',
    ngn: 750000,
    usd: 500,
    delivery: '3 weeks',
    support: '1 month',
    popular: false,
    features: [
      'Up to 5 pages',
      'Mobile responsive design',
      'Contact form + Newsletter',
      'Basic SEO setup',
      'Social media integration',
      'WhatsApp chat button',
      'Free domain connection',
      'SSL Certificate',
      'Google Analytics setup',
      'Basic speed optimisation',
    ],
  },
  {
    name: 'Professional',
    ngn: 975000,
    usd: 650,
    delivery: '4 weeks',
    support: '2 months',
    popular: false,
    features: [
      'Up to 8 pages',
      'Premium UI/UX design',
      'Contact form + Newsletter',
      'Advanced SEO setup',
      'Blog section',
      'Social media integration',
      'WhatsApp + Live chat',
      'Free domain connection',
      'SSL Certificate',
      'Google Analytics setup',
      'Speed optimisation',
    ],
  },
  {
    name: 'Advanced',
    ngn: 1200000,
    usd: 800,
    delivery: '4–5 weeks',
    support: '2 months',
    popular: false,
    features: [
      'Up to 12 pages',
      'Premium UI/UX design',
      'Contact + Booking form',
      'Advanced SEO setup',
      'Blog + Portfolio section',
      'Social media integration',
      'WhatsApp + Live chat',
      'Free domain connection',
      'SSL Certificate',
      'Google Analytics + Search Console',
      'Speed + Performance optimisation',
      'Basic admin panel',
    ],
  },
  {
    name: 'Premium',
    ngn: 1800000,
    usd: 1200,
    delivery: '5–6 weeks',
    support: '3 months',
    popular: true,
    features: [
      'Up to 20 pages',
      'Custom UI/UX design',
      'All form types',
      'Full SEO optimisation',
      'Blog + Portfolio + Testimonials',
      'Social media integration',
      'WhatsApp + Live chat',
      'Free domain + SSL + Free CDN',
      'Google Analytics + Search Console',
      'Speed + Core Web Vitals optimisation',
      'Admin dashboard',
      'Payment integration (Paystack/Flutterwave)',
    ],
  },
  {
    name: 'Elite',
    ngn: 2550000,
    usd: 1700,
    delivery: '6–7 weeks',
    support: '3 months',
    popular: false,
    features: [
      'Unlimited pages',
      'Custom UI/UX design',
      'All forms + CRM integration',
      'Full SEO optimisation',
      'All sections included',
      'Social media integration',
      'WhatsApp + Live chat + Chatbot',
      'Free domain + SSL + Free CDN',
      'Full analytics + tracking',
      'Speed + Core Web Vitals optimisation',
      'Full admin dashboard',
      'Payment integration (Multi-gateway)',
      'Email marketing setup',
      'Google Business Profile setup',
    ],
  },
  {
    name: 'Executive',
    ngn: 3270000,
    usd: 2180,
    delivery: '7–8 weeks',
    support: '6 months',
    popular: false,
    features: [
      'Unlimited pages',
      'Custom UI/UX + Branding',
      'All forms + CRM + Automation',
      'Full SEO + Content strategy',
      'All sections included',
      'WhatsApp + Live chat + AI Chatbot',
      'Free domain connection',
      'VPS Hosting',
      'SSL Certificate + Free CDN',
      'Full analytics + tracking',
      'Full admin dashboard + Client portal',
      'Multi-gateway payment integration',
      'Email marketing setup',
      'Google Business Profile setup',
      'Monthly backup',
    ],
  },
  {
    name: 'Platinum',
    ngn: 4845000,
    usd: 2850,
    delivery: '8–10 weeks',
    support: '9 months',
    popular: false,
    features: [
      'Unlimited pages',
      'Premium custom UI/UX + Full Branding',
      'All forms + CRM + Automation',
      'Full SEO + Content + Link building',
      'All sections included',
      'WhatsApp + Live chat + AI Chatbot',
      'Free domain + VPS Hosting',
      'SSL + Free CDN',
      'Unmetered Monthly Bandwidth',
      'Full analytics + Conversion tracking',
      'Full admin dashboard + Client portal',
      'Multi-gateway payment integration',
      'Email + SMS marketing setup',
      'Google Business Profile setup',
      'Monthly backup',
      'Priority support',
    ],
  },
  {
    name: 'Diamond',
    ngn: 8500000,
    usd: 5000,
    delivery: '10–12 weeks',
    support: '12 months',
    popular: false,
    features: [
      'Unlimited pages',
      'World-class custom UI/UX + Branding',
      'All forms + Full CRM + Automation',
      'Full SEO + Content + Link building',
      'All custom features included',
      'Full social media integration',
      'WhatsApp + Live chat + Custom AI Chatbot',
      'Free domain connection',
      'Dedicated VPS Hosting',
      'SSL Certificate + Free CDN',
      'Unmetered Monthly Bandwidth',
      'Full analytics + Advanced tracking',
      'Performance + Security optimisation',
      'Full admin dashboard + Client portal',
      'Multi-gateway payment integration',
      'Email + SMS + Push notification marketing',
      'Google Business Profile setup + Management',
      'Weekly backup',
      '24/7 Priority support',
      'Basic Mobile App included',
      'SaaS/Custom features',
    ],
  },
]

export default function PricingPage() {
  const service = getServiceBySlug('web-development')

  return (
    <>
      <Navbar />

      <div style={{
        minHeight: '100vh',
        background: 'var(--blog-space-bg)',
        position: 'relative',
        overflowX: 'hidden',
      }}>

        {/* ── GRID BACKGROUND ── */}
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            linear-gradient(var(--blog-grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--blog-grid-line) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* ── AMBIENT GLOWS ── */}
        <div style={{
          position: 'fixed',
          top: '-200px',
          left: '-200px',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, var(--blog-glow-primary) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <div style={{
          position: 'fixed',
          bottom: '-200px',
          right: '-200px',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, var(--blog-glow-cyan) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ══════════════════════════════
              HERO SECTION
          ══════════════════════════════ */}
          <section style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: 'clamp(60px, 8vw, 100px) 24px 80px',
            textAlign: 'center',
          }}>
            <div style={{
              position: 'relative',
              zIndex: 1,
              maxWidth: '700px',
              margin: '0 auto',
              animation: 'slideIn 0.6s ease-out',
            }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(124,58,237,0.15)',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '100px',
                padding: '8px 20px',
                marginBottom: '24px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#a855f7',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#a855f7',
                  display: 'inline-block',
                  animation: 'pulseDot 1.8s ease-in-out infinite',
                }} />
                Web Development Pricing
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 900,
                color: 'var(--blog-heading)',
                margin: '0 0 20px',
                lineHeight: 1.1,
                letterSpacing: '-0.5px',
              }}>
                Choose Your{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Perfect Plan
                </span>
              </h1>

              {/* Subtitle */}
              <p style={{
                fontSize: 'clamp(15px, 2vw, 18px)',
                color: 'var(--blog-body)',
                margin: '0 0 36px',
                lineHeight: 1.7,
                maxWidth: '520px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}>
                Professional web solutions for every budget. All plans include mobile responsive design and SSL certificate.
              </p>

            </div>
          </section>

          {/* ══════════════════════════════
              PRICING GRID
          ══════════════════════════════ */}
          <section style={{
            maxWidth: '1300px',
            margin: '0 auto',
            padding: 'clamp(40px, 5vw, 80px) 16px',
          }}>
            {service && (
              <ServicePricingCards
                service={service}
                showAll={true}
              />
            )}

            {/* Bottom CTA */}
            <div style={{
              marginTop: '64px',
              textAlign: 'center',
              background: 'var(--blog-popular-bg)',
              border: '1px solid var(--blog-popular-border)',
              borderRadius: '24px',
              padding: 'clamp(32px, 4vw, 56px) 24px',
              animation: 'slideIn 0.6s ease-out 0.9s forwards',
              opacity: 0,
            }}>
              <h2 style={{
                fontSize: 'clamp(24px, 3vw, 36px)',
                fontWeight: 900,
                color: 'var(--blog-heading)',
                margin: '0 0 12px',
              }}>
                Not sure which plan is right?
              </h2>
              <p style={{
                fontSize: '16px',
                color: 'var(--blog-body)',
                margin: '0 0 28px',
                maxWidth: '480px',
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: 1.7,
              }}>
                Book a free consultation call and we'll recommend the perfect plan for your business.
              </p>
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}>
                <Link
                  href="/contact"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    color: '#fff',
                    padding: '14px 32px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 800,
                    fontSize: '15px',
                    boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
                    transition: 'all 0.3s',
                  }}
                >
                  📞 Book Free Call
                </Link>
                <Link
                  href="https://wa.me/message/BPNJE7CPON3OJ1"
                  target="_blank"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#25D366',
                    color: '#fff',
                    padding: '14px 32px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 800,
                    fontSize: '15px',
                    boxShadow: '0 8px 24px rgba(37,211,102,0.3)',
                    transition: 'all 0.3s',
                  }}
                >
                  💬 WhatsApp Us
                </Link>
              </div>
            </div>

          </section>

        </div>
      </div>

      <Footer />

      <style>{`
        :root {
          --blog-space-bg: #f0ebff;
          --blog-card-bg: rgba(255, 255, 255, 0.7);
          --blog-card-border: rgba(124, 58, 237, 0.2);
          --blog-heading: #1a1a2e;
          --blog-body: #4a3f6b;
          --blog-text-muted: rgba(74, 63, 107, 0.7);
          --blog-grid-line: rgba(124, 58, 237, 0.08);
          --blog-glow-primary: rgba(124, 58, 237, 0.15);
          --blog-glow-cyan: rgba(34, 211, 238, 0.08);
          --blog-hero-bg: linear-gradient(135deg, rgba(240, 235, 255, 0.95), rgba(232, 224, 255, 0.9));
          --blog-popular-bg: rgba(124, 58, 237, 0.06);
          --blog-popular-border: rgba(124, 58, 237, 0.15);
        }

        .dark {
          --blog-space-bg: #06030f;
          --blog-card-bg: linear-gradient(135deg, rgba(13, 5, 32, 0.9), rgba(26, 5, 53, 0.8));
          --blog-card-border: rgba(124, 58, 237, 0.25);
          --blog-heading: #ffffff;
          --blog-body: #9d8fd4;
          --blog-text-muted: #9d8fd4;
          --blog-grid-line: rgba(124, 58, 237, 0.06);
          --blog-glow-primary: rgba(124, 58, 237, 0.15);
          --blog-glow-cyan: rgba(34, 211, 238, 0.08);
          --blog-hero-bg: linear-gradient(135deg, rgba(13, 5, 32, 0.95), rgba(26, 5, 53, 0.9));
          --blog-popular-bg: rgba(124, 58, 237, 0.06);
          --blog-popular-border: rgba(124, 58, 237, 0.15);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulseDot {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        * {
          transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
        }

        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
          }
        }

        @media (max-width: 375px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
