'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import purpleLogo from '@/Assets/images/Purplesoft-logo-main.png'
export default function AcademyPage() {
  const [dots, setDots] = useState('.')
  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev =>
        prev.length >= 3 ? '.' : prev + '.'
      )
    }, 500)
    return () => clearInterval(interval)
  }, [])
  return (
    <div style={{
      minHeight: '100vh',
      background: '#06030f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Outfit, Inter, sans-serif',
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
        animation: 'pulse 4s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '0%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
        animation: 'pulse 6s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '5%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
        animation: 'pulse 5s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${4 + i * 2}px`,
          height: `${4 + i * 2}px`,
          borderRadius: '50%',
          background: i % 2 === 0
            ? '#7c3aed' : '#a855f7',
          opacity: 0.3 + (i * 0.05),
          top: `${10 + i * 12}%`,
          left: `${5 + i * 15}%`,
          animation: `float ${3 + i}s ease-in-out infinite ${i * 0.5}s`,
          pointerEvents: 'none',
        }} />
      ))}
      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '32px' }}>
          <Link href="/">
            <Image
              src={purpleLogo}
              alt="PurpleSoftHub"
              width={160}
              height={48}
              style={{
                margin: '0 auto',
                display: 'block',
              }}
            />
          </Link>
        </div>
        {/* Animated icon */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.1))',
          border: '1px solid rgba(124,58,237,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          fontSize: '48px',
          animation: 'float 3s ease-in-out infinite',
          boxShadow: '0 0 40px rgba(124,58,237,0.15)',
        }}>
          🎓
        </div>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(124,58,237,0.1)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '100px',
          padding: '6px 16px',
          marginBottom: '24px',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#a855f7',
            animation: 'blink 1.5s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#a855f7',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Coming Soon
          </span>
        </div>
        {/* Heading */}
        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 56px)',
          fontWeight: 900,
          color: '#fff',
          margin: '0 0 16px',
          lineHeight: 1.1,
          letterSpacing: '-1px',
        }}>
          PurpleSoftHub{' '}
          <span style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Academy
          </span>
        </h1>
        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          color: '#9d8fd4',
          margin: '0 0 12px',
          lineHeight: 1.6,
          maxWidth: '480px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          We are building something
          incredible for you
          {dots}
        </p>
        <p style={{
          fontSize: '15px',
          color: '#6b5fa0',
          margin: '0 0 40px',
          lineHeight: 1.6,
          maxWidth: '420px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Learn web development, digital
          marketing, UI/UX design, and
          music promotion from industry
          experts. Coming in 2026.
        </p>
        {/* Course preview cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '40px',
        }}>
          {[
            { icon: '🌐', label: 'Web Dev' },
            { icon: '📱', label: 'Mobile Apps' },
            { icon: '📣', label: 'Marketing' },
            { icon: '🎨', label: 'UI/UX Design' },
            { icon: '🎵', label: 'Music Promo' },
            { icon: '🤖', label: 'AI Tools' },
          ].map((course, i) => (
            <div key={course.label} style={{
              background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: '14px',
              padding: '16px 12px',
              animation: `fadeInUp 0.5s ease forwards ${i * 0.1}s`,
              opacity: 0,
            }}>
              <div style={{
                fontSize: '24px',
                marginBottom: '8px',
              }}>
                {course.icon}
              </div>
              <p style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#9d8fd4',
                margin: 0,
              }}>
                {course.label}
              </p>
            </div>
          ))}
        </div>
        {/* Notify me form */}
        <div style={{
          background: 'rgba(124,58,237,0.06)',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: '20px',
          padding: '28px 24px',
          marginBottom: '32px',
        }}>
          <p style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 6px',
          }}>
            Get notified when we launch 🚀
          </p>
          <p style={{
            fontSize: '13px',
            color: '#6b5fa0',
            margin: '0 0 16px',
          }}>
            Be the first to know and get
            early bird discount
          </p>
          <NotifyForm />
        </div>
        {/* Back to home */}
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#6b5fa0',
          textDecoration: 'none',
          fontSize: '14px',
          transition: 'color 0.2s',
        }}>
          ← Back to Home
        </Link>
      </div>
      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
          50% { transform: translateX(-50%) scale(1.1); opacity: 0.8; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
// Separate client component for form
function NotifyForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] =
    useState(false)
  const [loading, setLoading] =
    useState(false)
  const handleSubmit = async () => {
    if (!email || !email.includes('@'))
      return
    setLoading(true)
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          source: 'academy-coming-soon'
        })
      })
      setSubmitted(true)
    } catch {
      setSubmitted(true)
    }
    setLoading(false)
  }
  if (submitted) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '12px',
        background: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: '12px',
        color: '#10b981',
        fontSize: '14px',
        fontWeight: 600,
      }}>
        <span>🎉</span>
        You&apos;re on the list! We&apos;ll
        notify you at launch.
      </div>
    )
  }
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
    }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e =>
          e.key === 'Enter' && handleSubmit()
        }
        placeholder="your@email.com"
        style={{
          flex: 1,
          minWidth: '200px',
          background: 'rgba(124,58,237,0.08)',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: '10px',
          padding: '11px 16px',
          fontSize: '14px',
          color: '#fff',
          outline: 'none',
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !email}
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          padding: '11px 20px',
          fontSize: '14px',
          fontWeight: 700,
          cursor: loading ?
            'not-allowed' : 'pointer',
          opacity: !email ? 0.5 : 1,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
        }}
      >
        {loading ? '...' : 'Notify Me 🔔'}
      </button>
    </div>
  )
}
