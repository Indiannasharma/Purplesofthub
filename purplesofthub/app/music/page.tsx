'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useTheme } from '@/context/ThemeContext'

const platforms = [
  { name: 'Spotify', color: '#1DB954', bg: '#191414', icon: '🎵' },
  { name: 'Apple Music', color: '#FA2D48', bg: '#1a1a1a', icon: '🍎' },
  { name: 'Amazon Music', color: '#00A8E1', bg: '#131921', icon: '📦' },
  { name: 'TikTok', color: '#ff0050', bg: '#010101', icon: '🎵' },
  { name: 'YouTube Music', color: '#FF0000', bg: '#0F0F0F', icon: '▶' },
  { name: 'Boomplay', color: '#f5a623', bg: '#1a0d00', icon: '🎶' },
  { name: 'Deezer', color: '#A238FF', bg: '#0d0d0d', icon: '🎧' },
  { name: 'Audiomack', color: '#FE6D00', bg: '#110000', icon: '🔊' },
  { name: 'Tidal', color: '#00FFFF', bg: '#000000', icon: '🌊' },
]

const features = [
  {
    icon: '💰',
    title: 'Keep 100% Royalties',
    desc: 'Every kobo and cent from your streams goes directly to you. No royalty splits, no hidden deductions — ever.',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.35)',
  },
  {
    icon: '🌍',
    title: 'Global Distribution',
    desc: 'Cover 150+ platforms across Africa, the Americas, Europe and Asia. Reach fans wherever they stream.',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.35)',
  },
  {
    icon: '📊',
    title: 'Real-Time Analytics',
    desc: 'Track every stream, playlist add, and country in one clean dashboard. Know your audience before your next release.',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.35)',
  },
  {
    icon: '⚡',
    title: '48-Hour Distribution',
    desc: 'Upload today, go live in under 48 hours. Fastest distribution turnaround in Africa.',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.35)',
  },
  {
    icon: '🏷️',
    title: 'Free ISRC & UPC Codes',
    desc: 'Professional ISRC and UPC codes included with every release — no extra charge.',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.35)',
  },
  {
    icon: '🎧',
    title: 'Playlist Pitching',
    desc: 'Our editorial team pitches your track to curators and editorial playlists on major DSPs.',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.35)',
  },
]

const steps = [
  { step: '01', title: 'Create Your Account', desc: 'Sign up free. No credit card needed to get started.', icon: '👤' },
  { step: '02', title: 'Upload Your Music', desc: 'Upload your audio file, cover art, and metadata in minutes.', icon: '⬆️' },
  { step: '03', title: 'Choose Platforms', desc: 'Select from 150+ platforms or distribute everywhere at once.', icon: '🌐' },
  { step: '04', title: 'Start Collecting Royalties', desc: 'Go live within 48 hours and watch the streams roll in.', icon: '💸' },
]

const testimonials = [
  {
    name: 'Davido K.',
    role: 'Afrobeats Artist · Lagos',
    text: 'Went from 0 to 200k streams on Spotify in 3 months. PurpleSoftHub Music got me on playlists I could never have reached on my own.',
    avatar: '🎤',
    streams: '200k+',
  },
  {
    name: 'Amara J.',
    role: 'Gospel Singer · Abuja',
    text: 'Fast, affordable, and they actually respond! My first single hit Apple Music charts in Nigeria. Best decision I made this year.',
    avatar: '🎶',
    streams: '85k+',
  },
  {
    name: 'Tunde B.',
    role: 'Afrohouse Producer · PHC',
    text: 'Other platforms take 30% or more. PurpleSoftHub lets me keep everything. That\'s money straight to my studio.',
    avatar: '🎛️',
    streams: '500k+',
  },
]

const plans = [
  {
    name: 'Starter',
    price: '₦15,000',
    usd: '$10',
    period: 'per release',
    features: ['1 Single/EP', 'All 150+ platforms', 'ISRC + UPC included', 'Monthly payouts', '100% royalties'],
    color: '#7c3aed',
    popular: false,
  },
  {
    name: 'Artist',
    price: '₦45,000',
    usd: '$30',
    period: 'per year',
    features: ['Unlimited releases', 'All 150+ platforms', 'Priority distribution', 'Playlist pitching', '100% royalties', 'Analytics dashboard'],
    color: '#06b6d4',
    popular: true,
  },
  {
    name: 'Label',
    price: '₦120,000',
    usd: '$80',
    period: 'per year',
    features: ['Up to 10 artists', 'Label dashboard', 'Priority support', 'Editorial pitching', 'Custom ISRC prefix', 'Dedicated manager'],
    color: '#a855f7',
    popular: false,
  },
]

export default function MusicPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activePlan, setActivePlan] = useState(1)
  const [tIdx, setTIdx] = useState(0)
  const [floatOffset, setFloatOffset] = useState(0)

  const music = {
    pageBg: isDark ? '#06030f' : '#f7f3ff',
    pageText: isDark ? '#ffffff' : '#1a1a2e',
    titleAccent: isDark ? '#c4b5fd' : '#5f4b8b',
    muted: isDark ? '#9d8fd4' : '#6b5fa0',
    mutedStrong: isDark ? '#6b5fa0' : '#7a6a96',
    quote: isDark ? '#e2d9f3' : '#4a3f6b',
    card: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
    cardSoft: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
    cardStrong: isDark ? 'rgba(6,3,15,0.95)' : 'rgba(255,255,255,0.95)',
  }

  useEffect(() => {
    const t = setInterval(() => setTIdx(i => (i + 1) % testimonials.length), 4500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let frame = 0
    const animate = () => {
      frame++
      setFloatOffset(Math.sin(frame / 80) * 14)
      requestAnimationFrame(animate)
    }
    const id = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <>
      <Navbar />

      <div style={{
        minHeight: '100vh',
        background: music.pageBg,
        fontFamily: 'Outfit, Inter, sans-serif',
        overflowX: 'hidden',
        color: music.pageText,
      }}>

        {/* ── STAR BACKGROUND ── */}
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            radial-gradient(1px 1px at 15% 25%, rgba(255,255,255,0.18) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 85% 15%, rgba(255,255,255,0.14) 0%, transparent 100%),
            radial-gradient(1px 1px at 45% 65%, rgba(255,255,255,0.1) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 85%, rgba(255,255,255,0.12) 0%, transparent 100%),
            radial-gradient(2px 2px at 30% 90%, rgba(255,255,255,0.08) 0%, transparent 100%),
            radial-gradient(1px 1px at 92% 50%, rgba(255,255,255,0.1) 0%, transparent 100%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* ═══════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════ */}
        <section style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 24px 80px',
          overflow: 'hidden',
          textAlign: 'center',
        }}>
          {/* Deep space radial */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(76,29,149,0.25) 0%, rgba(6,182,212,0.05) 50%, transparent 80%)',
            pointerEvents: 'none',
          }} />

          {/* Floating planet */}
          <div style={{
            position: 'absolute',
            top: `calc(6% + ${floatOffset}px)`,
            right: '4%',
            width: 'clamp(200px, 22vw, 320px)',
            height: 'clamp(200px, 22vw, 320px)',
            transition: 'top 0.05s linear',
            pointerEvents: 'none',
            zIndex: 0,
          }}>
            {/* Planet body */}
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 32% 32%, #c084fc 0%, #7c3aed 30%, #3b0764 70%, #06030f 100%)',
              boxShadow: '0 0 60px rgba(168,85,247,0.5), 0 0 120px rgba(124,58,237,0.3), inset -20px -20px 40px rgba(0,0,0,0.5)',
              position: 'relative',
              overflow: 'visible',
            }}>
              {/* Ring 1 */}
              <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%) rotateX(75deg)',
                width: '155%', height: '155%',
                borderRadius: '50%',
                border: '3px solid rgba(6,182,212,0.6)',
                boxShadow: '0 0 20px rgba(6,182,212,0.4), inset 0 0 20px rgba(6,182,212,0.1)',
              }} />
              {/* Ring 2 */}
              <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%) rotateX(75deg)',
                width: '185%', height: '185%',
                borderRadius: '50%',
                border: '1.5px solid rgba(168,85,247,0.3)',
              }} />
              {/* Ring 3 */}
              <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%) rotateX(75deg)',
                width: '210%', height: '210%',
                borderRadius: '50%',
                border: '1px solid rgba(6,182,212,0.15)',
              }} />
            </div>
          </div>

          {/* Small second planet */}
          <div style={{
            position: 'absolute',
            bottom: '18%',
            left: '3%',
            width: 'clamp(60px, 8vw, 100px)',
            height: 'clamp(60px, 8vw, 100px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #06b6d4, #0e7490, #06030f)',
            boxShadow: '0 0 30px rgba(6,182,212,0.4)',
            animation: 'floatSlow 7s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(168,85,247,0.1)',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: '100px',
            padding: '6px 18px',
            marginBottom: '28px',
            zIndex: 1,
          }}>
            <span style={{
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: '#a855f7',
              boxShadow: '0 0 8px #a855f7',
              animation: 'blink 1.5s ease infinite',
              display: 'inline-block',
            }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#a855f7', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              PurpleSoftHub Music Distribution
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(42px, 8vw, 86px)',
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: '-3px',
            margin: '0 0 22px',
            maxWidth: '860px',
            zIndex: 1,
          }}>
            Get Your Music{' '}
            <span style={{
              background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 40%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Everywhere
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2.2vw, 20px)',
            color: music.muted,
            maxWidth: '600px',
            margin: '0 0 48px',
            lineHeight: 1.75,
            zIndex: 1,
          }}>
            Distribute to Spotify, Apple Music, TikTok, YouTube Music, Boomplay and <strong style={{ color: music.titleAccent }}>150+ platforms</strong> worldwide. Keep 100% of your royalties.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', zIndex: 1, marginBottom: '72px' }}>
            <Link href="/services/music-distribution" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7, #7c3aed)',
              backgroundSize: '200% 100%',
              color: music.pageText,
              padding: '16px 40px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '16px',
              textDecoration: 'none',
              boxShadow: '0 0 40px rgba(124,58,237,0.5), 0 4px 20px rgba(124,58,237,0.3)',
              transition: 'all 0.3s',
              letterSpacing: '0.01em',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.transform = 'translateY(-3px)'
                el.style.boxShadow = '0 0 60px rgba(124,58,237,0.7), 0 8px 30px rgba(124,58,237,0.4)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 0 40px rgba(124,58,237,0.5), 0 4px 20px rgba(124,58,237,0.3)'
              }}
            >
              🎵 Start Distributing Free
            </Link>
            <button style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'transparent',
              color: '#06b6d4',
              padding: '16px 36px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '16px',
              border: '2px solid rgba(6,182,212,0.45)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = 'rgba(6,182,212,0.08)'
                el.style.borderColor = 'rgba(6,182,212,0.8)'
                el.style.boxShadow = '0 0 20px rgba(6,182,212,0.2)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = 'transparent'
                el.style.borderColor = 'rgba(6,182,212,0.45)'
                el.style.boxShadow = 'none'
              }}
            >
              <span style={{
                width: '0',
                height: '0',
                borderTop: '7px solid transparent',
                borderBottom: '7px solid transparent',
                borderLeft: '12px solid #06b6d4',
                display: 'inline-block',
              }} />
              Watch How It Works
            </button>
          </div>

          {/* Scroll indicator */}
          <div style={{
            position: 'absolute', bottom: '28px', left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            animation: 'bounce 2s ease-in-out infinite',
            zIndex: 1,
          }}>
            <p style={{ fontSize: '11px', color: music.mutedStrong, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
              Scroll
            </p>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={music.mutedStrong} strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            REACH EVERY LISTENER
        ═══════════════════════════════════════════ */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(16px, 5vw, 80px)', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, margin: '0 0 14px', letterSpacing: '-1px' }}>
              Reach Every{' '}
              <span style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Listener
              </span>
            </h2>
            <p style={{ fontSize: '16px', color: music.muted, maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
              One upload. 150+ platforms. Your music everywhere your fans are.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            maxWidth: '900px',
            margin: '0 auto',
          }}>
            {platforms.map((p, i) => (
              <div key={i} style={{
                background: music.card,
                border: `1px solid ${p.color}28`,
                borderRadius: '16px',
                padding: '20px 16px',
                textAlign: 'center',
                transition: 'all 0.25s',
                cursor: 'default',
                backdropFilter: 'blur(8px)',
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.background = `${p.color}12`
                  el.style.borderColor = `${p.color}55`
                  el.style.transform = 'translateY(-4px)'
                  el.style.boxShadow = `0 12px 40px ${p.color}22`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.background = music.card
                  el.style.borderColor = `${p.color}28`
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = 'none'
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{p.icon}</div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: p.color, margin: 0 }}>{p.name}</p>
              </div>
            ))}

            {/* +150 more card */}
            <div style={{
              background: 'rgba(124,58,237,0.06)',
              border: '1px dashed rgba(124,58,237,0.25)',
              borderRadius: '16px',
              padding: '20px 16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <p style={{ fontSize: '20px', fontWeight: 900, color: '#a855f7', margin: '0 0 6px' }}>+141</p>
              <p style={{ fontSize: '12px', color: music.mutedStrong, margin: 0, fontWeight: 600 }}>more platforms</p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            WHY ARTISTS CHOOSE US
        ═══════════════════════════════════════════ */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(16px, 5vw, 80px)', position: 'relative', zIndex: 1 }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px', height: '500px',
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#a855f7', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              WHY ARTISTS CHOOSE US
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, margin: '12px 0 16px', letterSpacing: '-1px' }}>
              Built for{' '}
              <span style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Artists
              </span>
            </h2>
            <p style={{ fontSize: '16px', color: music.muted, maxWidth: '460px', margin: '0 auto', lineHeight: 1.7 }}>
              We take care of the business so you can focus on the music.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            maxWidth: '1100px',
            margin: '0 auto',
          }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: music.cardSoft,
                border: '1px solid rgba(124,58,237,0.12)',
                borderRadius: '20px',
                padding: '28px',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden',
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.background = `${f.color}10`
                  el.style.borderColor = `${f.color}40`
                  el.style.transform = 'translateY(-5px)'
                  el.style.boxShadow = `0 20px 50px ${f.color}18`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.background = music.cardSoft
                  el.style.borderColor = 'rgba(124,58,237,0.12)'
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: '54px', height: '54px',
                  borderRadius: '14px',
                  background: `${f.color}18`,
                  border: `1px solid ${f.color}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '26px',
                  marginBottom: '18px',
                  boxShadow: `0 0 16px ${f.color}20`,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: music.pageText, margin: '0 0 10px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: music.muted, margin: 0, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            HOW IT WORKS
        ═══════════════════════════════════════════ */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(16px, 5vw, 80px)', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#06b6d4', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              HOW IT WORKS
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, margin: '12px 0 0', letterSpacing: '-1px' }}>
              Live in{' '}
              <span style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                4 Simple Steps
              </span>
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            maxWidth: '1000px',
            margin: '0 auto',
            position: 'relative',
          }}>
            {/* Connector line */}
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '12.5%',
              right: '12.5%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3), rgba(6,182,212,0.3), transparent)',
              display: 'none',
            }} />

            {steps.map((s, i) => (
              <div key={i} style={{
                background: music.cardSoft,
                border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: '20px',
                padding: '28px',
                textAlign: 'center',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.25s',
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.background = 'rgba(124,58,237,0.08)'
                  el.style.borderColor = 'rgba(124,58,237,0.35)'
                  el.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.background = music.cardSoft
                  el.style.borderColor = 'rgba(124,58,237,0.15)'
                  el.style.transform = 'translateY(0)'
                }}
              >
                <div style={{
                  width: '56px', height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))',
                  border: '1px solid rgba(124,58,237,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px',
                  margin: '0 auto 16px',
                }}>
                  {s.icon}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#a855f7', letterSpacing: '0.1em' }}>STEP {s.step}</span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: music.pageText, margin: '8px 0 10px' }}>{s.title}</h3>
                <p style={{ fontSize: '13px', color: music.muted, margin: 0, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            PRICING
        ═══════════════════════════════════════════ */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(16px, 5vw, 80px)', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#a855f7', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              PRICING
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, margin: '12px 0 16px', letterSpacing: '-1px' }}>
              Affordable for Every{' '}
              <span style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Artist
              </span>
            </h2>
            <p style={{ fontSize: '16px', color: music.muted, maxWidth: '440px', margin: '0 auto', lineHeight: 1.7 }}>
              No subscription traps. No royalty cuts. Just simple, fair pricing.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            maxWidth: '960px',
            margin: '0 auto',
          }}>
            {plans.map((plan, i) => (
              <div key={i}
                onClick={() => setActivePlan(i)}
                style={{
                  background: plan.popular
                    ? `linear-gradient(135deg, ${plan.color}20, ${music.cardStrong})`
                    : music.cardSoft,
                  border: `1px solid ${activePlan === i ? plan.color + '66' : plan.popular ? plan.color + '44' : 'rgba(124,58,237,0.15)'}`,
                  borderRadius: '24px',
                  padding: '32px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  transform: plan.popular ? 'scale(1.04)' : 'scale(1)',
                  boxShadow: plan.popular ? `0 0 50px ${plan.color}22` : 'none',
                  position: 'relative',
                  backdropFilter: 'blur(12px)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = plan.popular ? 'scale(1.06)' : 'scale(1.02)'
                  el.style.boxShadow = `0 20px 60px ${plan.color}25`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = plan.popular ? 'scale(1.04)' : 'scale(1)'
                  el.style.boxShadow = plan.popular ? `0 0 50px ${plan.color}22` : 'none'
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: `linear-gradient(135deg, ${plan.color}, ${plan.color}aa)`,
                    color: music.pageText,
                    padding: '4px 18px',
                    borderRadius: '100px',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                    boxShadow: `0 0 16px ${plan.color}55`,
                  }}>
                    ✦ MOST POPULAR
                  </div>
                )}

                <p style={{ fontSize: '14px', fontWeight: 700, color: plan.color, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{plan.name}</p>
                <p style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 900, color: music.pageText, margin: '0 0 4px', letterSpacing: '-1px' }}>{plan.price}</p>
                <p style={{ fontSize: '14px', color: music.mutedStrong, margin: '0 0 24px' }}>{plan.usd} · {plan.period}</p>

                <div style={{ marginBottom: '28px' }}>
                  {plan.features.map((feat, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span style={{ color: plan.color, fontSize: '14px', fontWeight: 800, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: '14px', color: music.titleAccent }}>{feat}</span>
                    </div>
                  ))}
                </div>

                <Link href="/services/music-distribution" style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '13px',
                  borderRadius: '12px',
                  background: plan.popular ? `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)` : 'transparent',
                  border: `1px solid ${plan.color}55`,
                  color: plan.popular ? music.pageText : plan.color,
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  boxShadow: plan.popular ? `0 4px 20px ${plan.color}35` : 'none',
                }}>
                  Get Started →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            TESTIMONIALS
        ═══════════════════════════════════════════ */}
        <section style={{ padding: 'clamp(60px, 8vw, 80px) clamp(16px, 5vw, 80px)', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, margin: '0 0 14px', letterSpacing: '-1px' }}>
              Artists{' '}
              <span style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Are Talking
              </span>
            </h2>
          </div>

          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{
              background: music.card,
              border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: '24px',
              padding: 'clamp(28px, 4vw, 48px)',
              textAlign: 'center',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 0 60px rgba(124,58,237,0.1)',
            }}>
              <div style={{ fontSize: 'clamp(36px, 5vw, 52px)', marginBottom: '16px' }}>
                {testimonials[tIdx].avatar}
              </div>
              <p style={{
                fontSize: 'clamp(15px, 2.2vw, 18px)',
                color: music.quote,
                lineHeight: 1.8,
                margin: '0 0 24px',
                fontStyle: 'italic',
              }}>
                "{testimonials[tIdx].text}"
              </p>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 800, color: music.pageText, margin: '0 0 4px' }}>{testimonials[tIdx].name}</p>
                <p style={{ fontSize: '13px', color: music.muted, margin: '0 0 8px' }}>{testimonials[tIdx].role}</p>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#a855f7',
                  background: 'rgba(168,85,247,0.12)',
                  border: '1px solid rgba(168,85,247,0.25)',
                  padding: '3px 12px',
                  borderRadius: '100px',
                }}>
                  🎵 {testimonials[tIdx].streams} streams
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => setTIdx(i)} style={{
                    width: i === tIdx ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '100px',
                    background: i === tIdx ? '#a855f7' : 'rgba(124,58,237,0.3)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    padding: 0,
                  }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            CTA SECTION
        ═══════════════════════════════════════════ */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(16px, 5vw, 80px)', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(6,182,212,0.08))',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: '32px',
            padding: 'clamp(48px, 7vw, 90px) clamp(24px, 5vw, 72px)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 0 100px rgba(124,58,237,0.12)',
          }}>
            {/* Corner glows */}
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />

            {/* Waveform decoration */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '28px' }}>
              {[4, 8, 14, 20, 28, 36, 28, 20, 14, 8, 4].map((h, i) => (
                <div key={i} style={{
                  width: '4px',
                  height: `${h}px`,
                  borderRadius: '2px',
                  background: `linear-gradient(180deg, #a855f7, #06b6d4)`,
                  animation: `waveBar 1.4s ease-in-out ${i * 0.12}s infinite alternate`,
                  opacity: 0.7,
                }} />
              ))}
            </div>

            <h2 style={{ fontSize: 'clamp(28px, 5vw, 56px)', fontWeight: 900, margin: '0 0 18px', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
              Ready to Release{' '}
              <span style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Your Music?
              </span>
            </h2>
            <p style={{ fontSize: '17px', color: music.muted, margin: '0 0 40px', lineHeight: 1.7, maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
              Join thousands of African artists already distributing with PurpleSoftHub Music.
            </p>

            <Link href="/services/music-distribution" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: music.pageText,
              padding: '18px 48px',
              borderRadius: '14px',
              fontWeight: 900,
              fontSize: 'clamp(15px, 2vw, 18px)',
              textDecoration: 'none',
              boxShadow: '0 0 50px rgba(124,58,237,0.5), 0 6px 24px rgba(124,58,237,0.3)',
              transition: 'all 0.3s',
              letterSpacing: '0.01em',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.transform = 'translateY(-3px)'
                el.style.boxShadow = '0 0 70px rgba(124,58,237,0.7), 0 10px 36px rgba(124,58,237,0.4)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 0 50px rgba(124,58,237,0.5), 0 6px 24px rgba(124,58,237,0.3)'
              }}
            >
              🎵 Upload Your Music Now — It&apos;s Free
            </Link>

            <p style={{ fontSize: '13px', color: music.mutedStrong, margin: '16px 0 0' }}>No credit card required · Live in 48 hours</p>
          </div>
        </section>

        <style>{`
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-18px) rotate(5deg); }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.2; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(6px); }
          }
          @keyframes waveBar {
            from { transform: scaleY(0.5); }
            to { transform: scaleY(1.3); }
          }
        `}</style>
      </div>

      <Footer />
    </>
  )
}
