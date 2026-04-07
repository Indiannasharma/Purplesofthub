'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function DonateSuccess() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setTimeout(() => setShow(true), 100)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cyber-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        textAlign: 'center',
        opacity: show ? 1 : 0,
        transform: show
          ? 'translateY(0)'
          : 'translateY(20px)',
        transition: 'all 0.5s ease',
        background: 'var(--cyber-card)',
        border: '1px solid var(--cyber-border)',
        borderRadius: 20,
        padding: 'clamp(28px, 4vw, 48px)',
        backdropFilter: 'blur(10px)',
      }}>
        <Image
          src="/Purplesoft-logo-main.png"
          alt="PurpleSoftHub"
          width={140}
          height={40}
          style={{ 
            margin: '0 auto 32px', 
            display: 'block' 
          }}
        />

        {/* Success icon */}
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.1))',
          border: '2px solid rgba(124,58,237,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '44px',
          margin: '0 auto 24px',
          animation: 'bounce 1s ease',
        }}>
          💜
        </div>

        <h1 style={{
          fontSize: '32px',
          fontWeight: 900,
          color: '#fff',
          margin: '0 0 12px',
        }}>
          Thank You So Much! 🎉
        </h1>

        <p style={{
          fontSize: '17px',
          color: '#9d8fd4',
          lineHeight: 1.7,
          margin: '0 0 28px',
        }}>
          Your donation has been received and will go directly toward building Africa's digital future. You are a champion! 🏆
        </p>

        {/* What happens next */}
        <div style={{
          background: 'rgba(124,58,237,0.08)',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '28px',
          textAlign: 'left',
        }}>
          <p style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#a855f7',
            margin: '0 0 16px',
          }}>
            What happens next:
          </p>
          {[
            { icon: '📧', text: 'Donation receipt sent to your email' },
            { icon: '🧒', text: 'Your donation begins training kids immediately' },
            { icon: '💬', text: 'Follow us for impact updates' },
            { icon: '🙏', text: 'You are now part of our mission' },
          ].map(item => (
            <div key={item.text} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 0',
              borderBottom: '1px solid rgba(124,58,237,0.08)',
            }}>
              <span style={{ fontSize: '20px' }}>
                {item.icon}
              </span>
              <span style={{
                fontSize: '14px',
                color: '#9d8fd4',
              }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <Link href="/donate"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff',
              padding: '13px 24px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '14px',
            }}>
            💜 Donate Again
          </Link>
          <Link href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.3)',
              color: '#a855f7',
              padding: '13px 24px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '14px',
            }}>
            ← Back to Home
          </Link>
        </div>

        <style>{`
          @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </div>
    </div>
  )
}