'use client'

import { useEffect } from 'react'
import Link from 'next/link'

type Service = {
  icon: string
  title: string
  desc: string
  tags: string[]
  href: string
}

const PROGRESS: Record<string, { pct: number; label: string; color: string; gradient: string }> = {
  'Web Development':        { pct: 95, label: 'High Demand',    color: '#7c3aed', gradient: 'linear-gradient(90deg, #7c3aed, #a855f7)' },
  'Mobile App Development': { pct: 88, label: 'Growing Fast',   color: '#3b82f6', gradient: 'linear-gradient(90deg, #3b82f6, #60a5fa)' },
  'Digital Marketing':      { pct: 92, label: 'Most Popular',   color: '#ec4899', gradient: 'linear-gradient(90deg, #ec4899, #f472b6)' },
  'UI/UX Design':           { pct: 78, label: 'In Demand',      color: '#f59e0b', gradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)' },
  'SaaS Development':       { pct: 85, label: 'Fast Growing',   color: '#10b981', gradient: 'linear-gradient(90deg, #10b981, #34d399)' },
  'Music Promotion':        { pct: 90, label: 'Trending 🔥',    color: '#f97316', gradient: 'linear-gradient(90deg, #f97316, #fb923c)' },
}

export default function ServiceCards({ services }: { services: Service[] }) {
  useEffect(() => {
    const bars = document.querySelectorAll<HTMLDivElement>('.service-progress-bar')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target as HTMLDivElement
            const target = bar.style.getPropertyValue('--target-width') || bar.dataset.width || '80%'
            setTimeout(() => { bar.style.width = target }, 200)
            observer.unobserve(bar)
          }
        })
      },
      { threshold: 0.3 }
    )

    bars.forEach((bar) => observer.observe(bar))
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 20 }}>
      {services.map((s) => {
        const p = PROGRESS[s.title]
        return (
          <div
            key={s.title}
            className="glass-card"
            style={{ padding: '30px 26px', display: 'flex', flexDirection: 'column', transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease' }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement
              el.style.transform = 'translateY(-4px)'
              el.style.boxShadow = '0 12px 40px rgba(124,58,237,0.12)'
              el.style.borderColor = 'rgba(124,58,237,0.3)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = ''
              el.style.borderColor = ''
            }}
          >
            <div style={{ fontSize: 38, marginBottom: 16 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 17, color: 'var(--text-primary)', marginBottom: 10 }}>{s.title}</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.75, marginBottom: 18, flex: 1 }}>{s.desc}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
              {s.tags.map((t) => (
                <span key={t} style={{ background: 'rgba(124,58,237,.12)', border: '1px solid rgba(168,85,247,.25)', borderRadius: 100, padding: '3px 11px', fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>{t}</span>
              ))}
            </div>
            <Link href={s.href}>
              <span style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Learn More →</span>
            </Link>

            {/* Progress bar */}
            {p && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(124,58,237,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: p.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.pct}%</span>
                </div>
                <div style={{ height: 4, background: 'rgba(124,58,237,0.1)', borderRadius: 100, overflow: 'hidden' }}>
                  <div
                    className="service-progress-bar"
                    style={{
                      height: '100%',
                      width: '0%',
                      borderRadius: 100,
                      background: p.gradient,
                      transition: 'width 1.5s ease 0.3s',
                      ['--target-width' as string]: `${p.pct}%`,
                    } as React.CSSProperties}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
