'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const programs = [
  {
    icon: '🌐',
    title: 'Web Development Bootcamp',
    desc: 'Full-stack mastery: HTML, CSS, JavaScript, React, Next.js & Node.js. Build real-world projects from day one.',
    duration: '12 Weeks',
    level: 'Beginner → Pro',
    color: '#7c3aed',
    students: '1.2k',
    tag: 'Most Popular',
  },
  {
    icon: '📣',
    title: 'Digital Marketing Mastery',
    desc: 'SEO, social media, paid ads, content strategy, and analytics. Learn to grow brands across all digital channels.',
    duration: '8 Weeks',
    level: 'Beginner',
    color: '#06b6d4',
    students: '890',
    tag: 'Trending',
  },
  {
    icon: '🎵',
    title: 'Music Tech & Distribution',
    desc: 'Music production, streaming distribution, playlist pitching, royalties, and digital promotion strategies.',
    duration: '6 Weeks',
    level: 'All Levels',
    color: '#a855f7',
    students: '645',
    tag: 'New',
  },
  {
    icon: '🚀',
    title: 'SaaS & Product Development',
    desc: 'Idea validation, product design, building an MVP, pricing models, and launching a profitable SaaS product.',
    duration: '10 Weeks',
    level: 'Intermediate',
    color: '#10b981',
    students: '430',
    tag: 'Hot',
  },
  {
    icon: '🎨',
    title: 'UI/UX Design',
    desc: 'User research, Figma, wireframing, prototyping, design systems, and building stunning user experiences.',
    duration: '8 Weeks',
    level: 'Beginner → Mid',
    color: '#f59e0b',
    students: '760',
    tag: 'Creative',
  },
]

const whyCards = [
  {
    icon: '🎯',
    title: 'Industry-Led Curriculum',
    desc: 'Programs built and taught by active professionals working at top tech companies in Nigeria and abroad.',
    color: '#7c3aed',
  },
  {
    icon: '🛠️',
    title: 'Build Real Projects',
    desc: 'No theory-only courses. Every module ends with a hands-on project you can add directly to your portfolio.',
    color: '#06b6d4',
  },
  {
    icon: '🌍',
    title: 'Built for Africa',
    desc: "Content localized for Nigerian and African market realities — from payments to infrastructure to business models.",
    color: '#10b981',
  },
  {
    icon: '💼',
    title: 'Career Support',
    desc: "CV reviews, mock interviews, job board access, and direct introductions to our network of hiring partners.",
    color: '#a855f7',
  },
  {
    icon: '📱',
    title: 'Learn Anywhere',
    desc: 'Mobile-optimized content. Download lessons and learn even without stable internet connection.',
    color: '#f59e0b',
  },
  {
    icon: '🤝',
    title: 'Community & Mentors',
    desc: 'Join a private community of learners. Get 1-on-1 mentor sessions and peer accountability groups.',
    color: '#ef4444',
  },
]

const testimonials = [
  {
    name: 'Chioma Okafor',
    role: 'Frontend Dev · Lagos',
    text: 'The Web Dev Bootcamp landed me my first remote job 3 weeks after completing the course. The projects were genuinely challenging and portfolio-worthy.',
    avatar: '👩🏾',
    rating: 5,
  },
  {
    name: 'Emeka Nwosu',
    role: 'Digital Marketer · Abuja',
    text: "Best investment I made in 2024. The digital marketing course paid for itself within 30 days. I'm now running campaigns for 4 clients.",
    avatar: '👨🏿',
    rating: 5,
  },
  {
    name: 'Fatima Bello',
    role: 'UI/UX Designer · Kano',
    text: 'Went from zero design knowledge to landing a ₦350k/month design role. The Figma modules alone are worth it.',
    avatar: '👩🏾‍💻',
    rating: 5,
  },
]

const stats = [
  { value: '5,000+', label: 'Students Enrolled' },
  { value: '92%', label: 'Completion Rate' },
  { value: '5', label: 'Expert Programs' },
  { value: '₦0', label: 'Hidden Fees' },
]

export default function AcademyPage() {
  const [activeProgram, setActiveProgram] = useState<number | null>(null)
  const [testimonialIdx, setTestimonialIdx] = useState(0)
  const [email, setEmail] = useState('')
  const [enrolled, setEnrolled] = useState(false)
  const [notifyLoading, setNotifyLoading] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  // Auto-rotate testimonials
  useEffect(() => {
    const t = setInterval(() => {
      setTestimonialIdx(i => (i + 1) % testimonials.length)
    }, 4500)
    return () => clearInterval(t)
  }, [])

  const handleNotify = async () => {
    if (!email || !email.includes('@')) return
    setNotifyLoading(true)
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'academy-enroll' }),
      })
    } catch {}
    setEnrolled(true)
    setNotifyLoading(false)
  }

  return (
    <>
      <Navbar />

      <div style={{
        minHeight: '100vh',
        background: '#06030f',
        fontFamily: 'Outfit, Inter, sans-serif',
        overflowX: 'hidden',
        color: '#fff',
      }}>

        {/* ── GLOBAL STAR GRID ── */}
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 100%),
            radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.12) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 20%, rgba(255,255,255,0.1) 0%, transparent 100%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        {/* ═══════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════ */}
        <section ref={heroRef} style={{
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
          {/* Big purple glow center */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -60%)',
            width: '900px',
            height: '900px',
            background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(76,29,149,0.1) 40%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          {/* Cyan glow top-right */}
          <div style={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />
          {/* Planet orb */}
          <div style={{
            position: 'absolute',
            top: '8%',
            right: '5%',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #a855f7, #4c1d95, #06030f)',
            boxShadow: '0 0 80px rgba(168,85,247,0.35), 0 0 160px rgba(124,58,237,0.2)',
            animation: 'rotatePlanet 20s linear infinite',
          }}>
            {/* Ring */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotateX(72deg)',
              width: '360px',
              height: '360px',
              borderRadius: '50%',
              border: '2px solid rgba(6,182,212,0.4)',
              boxShadow: '0 0 20px rgba(6,182,212,0.3)',
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotateX(72deg)',
              width: '420px',
              height: '420px',
              borderRadius: '50%',
              border: '1px solid rgba(168,85,247,0.2)',
            }} />
          </div>

          {/* Floating badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(6,182,212,0.1)',
            border: '1px solid rgba(6,182,212,0.3)',
            borderRadius: '100px',
            padding: '6px 18px',
            marginBottom: '28px',
            zIndex: 1,
          }}>
            <span style={{ fontSize: '10px', color: '#06b6d4', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              🚀 Now Enrolling — Limited Seats
            </span>
          </div>

          {/* Hero Headline */}
          <h1 style={{
            fontSize: 'clamp(40px, 7vw, 80px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-2px',
            margin: '0 0 20px',
            maxWidth: '900px',
            zIndex: 1,
          }}>
            <span style={{ color: '#fff' }}>PurpleSoftHub</span>{' '}
            <span style={{
              background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Academy
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(18px, 3vw, 26px)',
            fontWeight: 600,
            color: '#c4b5fd',
            margin: '0 0 14px',
            zIndex: 1,
          }}>
            Learn. Build. Launch.
          </p>
          <p style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: '#9d8fd4',
            margin: '0 0 44px',
            maxWidth: '580px',
            lineHeight: 1.7,
            zIndex: 1,
          }}>
            Master the skills that power the future. Industry-led programs in tech, design, marketing, music & product — built for Africa.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', zIndex: 1 }}>
            <a href="#programs" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff',
              padding: '16px 36px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '16px',
              textDecoration: 'none',
              boxShadow: '0 0 40px rgba(124,58,237,0.45)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 60px rgba(124,58,237,0.6)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 40px rgba(124,58,237,0.45)' }}
            >
              🎓 Enroll Now
            </a>
            <a href="#programs" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              color: '#06b6d4',
              padding: '16px 36px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '16px',
              textDecoration: 'none',
              border: '2px solid rgba(6,182,212,0.4)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(6,182,212,0.08)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(6,182,212,0.7)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(6,182,212,0.4)' }}
            >
              ▶ Watch Intro Video
            </a>
          </div>

          {/* Stats Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            marginTop: '72px',
            width: '100%',
            maxWidth: '760px',
            background: 'rgba(124,58,237,0.15)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(124,58,237,0.2)',
            zIndex: 1,
          }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                padding: '24px 16px',
                textAlign: 'center',
                background: 'rgba(6,3,15,0.8)',
                backdropFilter: 'blur(12px)',
              }}>
                <p style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, color: '#a855f7', margin: '0 0 4px' }}>{s.value}</p>
                <p style={{ fontSize: '12px', color: '#6b5fa0', margin: 0, fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            WHY CHOOSE US
        ═══════════════════════════════════════════ */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(16px, 5vw, 80px)', position: 'relative', zIndex: 1 }}>
          {/* Section glow */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '800px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#06b6d4', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              WHY CHOOSE US
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, margin: '12px 0 16px', letterSpacing: '-1px' }}>
              Everything You Need to{' '}
              <span style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Succeed
              </span>
            </h2>
            <p style={{ fontSize: '16px', color: '#9d8fd4', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
              We built the academy we wish existed when we were starting out.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            maxWidth: '1100px',
            margin: '0 auto',
          }}>
            {whyCards.map((card, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: '20px',
                padding: '28px',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s',
                cursor: 'default',
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.background = `rgba(${card.color === '#7c3aed' ? '124,58,237' : card.color === '#06b6d4' ? '6,182,212' : card.color === '#10b981' ? '16,185,129' : card.color === '#a855f7' ? '168,85,247' : card.color === '#f59e0b' ? '245,158,11' : '239,68,68'},0.08)`
                  el.style.borderColor = `${card.color}44`
                  el.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.background = 'rgba(255,255,255,0.03)'
                  el.style.borderColor = 'rgba(124,58,237,0.15)'
                  el.style.transform = 'translateY(0)'
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: `${card.color}18`,
                  border: `1px solid ${card.color}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '16px',
                }}>
                  {card.icon}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 10px', color: '#fff' }}>{card.title}</h3>
                <p style={{ fontSize: '14px', color: '#9d8fd4', margin: 0, lineHeight: 1.7 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            OUR PROGRAMS
        ═══════════════════════════════════════════ */}
        <section id="programs" style={{ padding: 'clamp(60px, 8vw, 100px) clamp(16px, 5vw, 80px)', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#a855f7', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              OUR PROGRAMS
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, margin: '12px 0 16px', letterSpacing: '-1px' }}>
              Pick Your{' '}
              <span style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Program
              </span>
            </h2>
            <p style={{ fontSize: '16px', color: '#9d8fd4', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
              5 career-changing programs. Choose your path and start building your future today.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            maxWidth: '1100px',
            margin: '0 auto',
          }}>
            {programs.map((prog, i) => (
              <div key={i}
                onMouseEnter={() => setActiveProgram(i)}
                onMouseLeave={() => setActiveProgram(null)}
                style={{
                  background: activeProgram === i
                    ? `linear-gradient(135deg, ${prog.color}18, rgba(6,3,15,0.9))`
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${activeProgram === i ? prog.color + '55' : 'rgba(124,58,237,0.15)'}`,
                  borderRadius: '20px',
                  padding: '28px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  transform: activeProgram === i ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: activeProgram === i ? `0 20px 60px ${prog.color}22` : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Tag */}
                <span style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  fontSize: '10px',
                  fontWeight: 800,
                  color: prog.color,
                  background: `${prog.color}18`,
                  border: `1px solid ${prog.color}33`,
                  padding: '3px 10px',
                  borderRadius: '100px',
                  letterSpacing: '0.05em',
                }}>
                  {prog.tag}
                </span>

                {/* Icon */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: `${prog.color}20`,
                  border: `1px solid ${prog.color}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  marginBottom: '18px',
                  boxShadow: activeProgram === i ? `0 0 20px ${prog.color}44` : 'none',
                  transition: 'box-shadow 0.3s',
                }}>
                  {prog.icon}
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 10px', color: '#fff', paddingRight: '60px' }}>{prog.title}</h3>
                <p style={{ fontSize: '14px', color: '#9d8fd4', margin: '0 0 20px', lineHeight: 1.7 }}>{prog.desc}</p>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <span style={{ fontSize: '12px', color: '#6b5fa0', background: 'rgba(124,58,237,0.08)', padding: '4px 12px', borderRadius: '100px' }}>
                    ⏱ {prog.duration}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b5fa0', background: 'rgba(124,58,237,0.08)', padding: '4px 12px', borderRadius: '100px' }}>
                    📊 {prog.level}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b5fa0', background: 'rgba(124,58,237,0.08)', padding: '4px 12px', borderRadius: '100px' }}>
                    👥 {prog.students} enrolled
                  </span>
                </div>

                <button style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: `1px solid ${prog.color}44`,
                  background: activeProgram === i ? `linear-gradient(135deg, ${prog.color}, ${prog.color}cc)` : 'transparent',
                  color: activeProgram === i ? '#fff' : prog.color,
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontFamily: 'inherit',
                }}>
                  {activeProgram === i ? 'Enroll Now →' : 'Learn More'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            TESTIMONIALS
        ═══════════════════════════════════════════ */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(16px, 5vw, 80px)', position: 'relative', zIndex: 1 }}>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '700px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#06b6d4', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              STUDENT STORIES
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, margin: '12px 0 16px', letterSpacing: '-1px' }}>
              Real Results from{' '}
              <span style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Real Students
              </span>
            </h2>
          </div>

          {/* Big testimonial card */}
          <div style={{
            maxWidth: '700px',
            margin: '0 auto',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: '24px',
            padding: 'clamp(28px, 4vw, 48px)',
            backdropFilter: 'blur(16px)',
            textAlign: 'center',
            boxShadow: '0 0 60px rgba(124,58,237,0.1)',
          }}>
            {/* Stars */}
            <div style={{ marginBottom: '20px' }}>
              {'⭐'.repeat(testimonials[testimonialIdx].rating)}
            </div>
            <p style={{
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              lineHeight: 1.8,
              color: '#e2d9f3',
              margin: '0 0 28px',
              fontStyle: 'italic',
            }}>
              "{testimonials[testimonialIdx].text}"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}>
                {testimonials[testimonialIdx].avatar}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {testimonials[testimonialIdx].name}
                </p>
                <p style={{ fontSize: '13px', color: '#9d8fd4', margin: 0 }}>
                  {testimonials[testimonialIdx].role}
                </p>
              </div>
            </div>
            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '28px' }}>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  style={{
                    width: i === testimonialIdx ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '100px',
                    background: i === testimonialIdx ? '#a855f7' : 'rgba(124,58,237,0.3)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            CTA SECTION
        ═══════════════════════════════════════════ */}
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) clamp(16px, 5vw, 80px)',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.08))',
            border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: '32px',
            padding: 'clamp(40px, 6vw, 80px)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 80px rgba(124,58,237,0.15)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Corner glow */}
            <div style={{
              position: 'absolute',
              top: '-80px',
              right: '-80px',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 65%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-60px',
              left: '-60px',
              width: '250px',
              height: '250px',
              background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 65%)',
              pointerEvents: 'none',
            }} />

            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#a855f7',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '16px',
            }}>
              LIMITED SPOTS AVAILABLE
            </span>

            <h2 style={{
              fontSize: 'clamp(28px, 5vw, 52px)',
              fontWeight: 900,
              margin: '0 0 16px',
              letterSpacing: '-1px',
              lineHeight: 1.1,
            }}>
              Ready to Build{' '}
              <span style={{
                background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Your Future?
              </span>
            </h2>

            <p style={{
              fontSize: '17px',
              color: '#9d8fd4',
              margin: '0 0 40px',
              lineHeight: 1.7,
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              Join thousands of African students building career-changing skills. Enroll today and get early access pricing.
            </p>

            {enrolled ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '14px',
                padding: '16px 28px',
                color: '#10b981',
                fontWeight: 700,
                fontSize: '16px',
              }}>
                🎉 You're on the list! We'll be in touch soon.
              </div>
            ) : (
              <div style={{
                display: 'flex',
                gap: '12px',
                maxWidth: '480px',
                margin: '0 auto',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNotify()}
                  placeholder="your@email.com"
                  style={{
                    flex: 1,
                    minWidth: '220px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(124,58,237,0.3)',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    fontSize: '15px',
                    color: '#fff',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={handleNotify}
                  disabled={notifyLoading || !email}
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 28px',
                    fontWeight: 800,
                    fontSize: '15px',
                    cursor: notifyLoading || !email ? 'not-allowed' : 'pointer',
                    opacity: !email ? 0.6 : 1,
                    boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
                    whiteSpace: 'nowrap',
                    fontFamily: 'inherit',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={e => { if (email) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
                >
                  {notifyLoading ? 'Sending...' : '🎓 Get Early Access'}
                </button>
              </div>
            )}

            <p style={{ fontSize: '13px', color: '#4b5563', margin: '16px 0 0' }}>
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </section>

        {/* CSS Animations */}
        <style>{`
          @keyframes rotatePlanet {
            from { box-shadow: 0 0 80px rgba(168,85,247,0.35), 0 0 160px rgba(124,58,237,0.2); }
            50% { box-shadow: 0 0 100px rgba(168,85,247,0.5), 0 0 200px rgba(124,58,237,0.3); }
            to { box-shadow: 0 0 80px rgba(168,85,247,0.35), 0 0 160px rgba(124,58,237,0.2); }
          }
          @media (max-width: 768px) {
            [data-planet] { display: none; }
          }
        `}</style>
      </div>

      <Footer />
    </>
  )
}
