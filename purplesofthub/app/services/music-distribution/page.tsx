import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getServiceBySlug } from '@/lib/payments/service-plans'
import ServicePricingCards from '@/components/services/ServicePricingCards'

export const metadata: Metadata = {
  title: 'Music Distribution | PurpleSoftHub',
  description: 'Get your music on Spotify, Apple Music, YouTube, and 150+ platforms. Fast distribution, ISRC codes, and monthly royalty payments.',
}

export default function MusicDistributionPage() {
  const service = getServiceBySlug('music-distribution')
  if (!service) return null

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--cyber-bg, #f0ebff)', position: 'relative', overflowX: 'hidden' }}>
        <div style={{ position: 'fixed', inset: 0, backgroundImage: `linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px)`, backgroundSize: '50px 50px', pointerEvents: 'none', zIndex: 0 }}/>
        <div style={{ position: 'fixed', top: '-200px', left: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }}/>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: 'clamp(40px, 6vw, 80px) 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(48px, 6vw, 80px)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '100px', padding: '6px 18px', marginBottom: '24px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 8px #a855f7', display: 'inline-block', animation: 'pulse 1.8s infinite', flexShrink: 0 }}/>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Music Distribution</span>
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 900, color: 'var(--cyber-heading, #1a1a2e)', margin: '0 0 20px', lineHeight: 1.1 }}>Distribute Your Music Globally in Hours</h1>
            <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--cyber-body, #4a3f6b)', maxWidth: '640px', margin: '0 auto 32px', lineHeight: 1.7 }}>Get on Spotify, Apple Music, YouTube, and 150+ platforms. Fast distribution, ISRC/UPC codes, and 100% royalty payments to you.</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#7c3aed' }}>From ₦{service.startingPriceNGN ? service.startingPriceNGN.toLocaleString() : '50000'}</span>
              <span style={{ fontSize: '14px', color: 'var(--cyber-body, #4a3f6b)' }}>/ ${service.startingPriceUSD || '35'} USD</span>
            </div>
          </div>
          <div style={{ marginBottom: '64px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, color: 'var(--cyber-heading, #1a1a2e)', textAlign: 'center', margin: '0 0 8px' }}>Distribution Plans</h2>
            <p style={{ fontSize: '15px', color: 'var(--cyber-body, #4a3f6b)', textAlign: 'center', margin: '0 0 40px' }}>Affordable distribution with flexible licensing options and instant payouts.</p>
            <ServicePricingCards service={service} showAll={true} />
          </div>
          <div style={{ background: 'var(--cyber-card, rgba(255,255,255,0.7))', border: '1px solid var(--cyber-border, rgba(124,58,237,0.15))', borderRadius: '24px', padding: 'clamp(28px, 4vw, 48px)', backdropFilter: 'blur(10px)', marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 900, color: 'var(--cyber-heading, #1a1a2e)', margin: '0 0 32px', textAlign: 'center' }}>Why Distribute With Us?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
              {[
                { icon: '🌐', title: '150+ Platforms', desc: 'All major DSPs including Spotify, Apple, YouTube Music.' },
                { icon: '⚡', title: 'Fast Distribution', desc: 'Your music live within 48 hours of approval.' },
                { icon: '💰', title: 'Keep Royalties', desc: '100% of streaming royalties go directly to you.' },
                { icon: '📅', title: 'Monthly Payouts', desc: 'Fast payments, no hidden fees or deductions.' },
                { icon: '🏷️', title: 'ISRC + UPC Codes', desc: 'Professional codes included for tracking and licensing.' },
                { icon: '📞', title: 'Dedicated Support', desc: 'Artist support team available via WhatsApp.' },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cyber-heading, #1a1a2e)', margin: '0 0 4px' }}>{item.title}</p>
                    <p style={{ fontSize: '13px', color: 'var(--cyber-body, #4a3f6b)', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(34,211,238,0.05))', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '24px', padding: 'clamp(32px, 4vw, 48px)', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, color: 'var(--cyber-heading, #1a1a2e)', margin: '0 0 12px' }}>Ready to Go Global?</h2>
            <p style={{ fontSize: '15px', color: 'var(--cyber-body, #4a3f6b)', margin: '0 0 28px', lineHeight: 1.7 }}>Get your music distributed to the world. Affordable, fast, and transparent.</p>
            <a href="https://wa.me/2348167593393" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: '#fff', padding: '13px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '15px' }}>💬 Chat on WhatsApp</a>
          </div>
        </div>
      </main>
      <Footer />
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.65); }}`}</style>
    </>
  )
}
