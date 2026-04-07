'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function RecoverySuccess() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cyber-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
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
          style={{ margin: '0 auto 32px', display: 'block' }}
        />
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(34,211,238,0.15)',
          border: '2px solid rgba(34,211,238,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
          margin: '0 auto 24px',
        }}>
          ✅
        </div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 900,
          color: '#fff',
          margin: '0 0 12px',
        }}>
          Payment Successful! 🎉
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#9d8fd4',
          lineHeight: 1.7,
          margin: '0 0 24px',
        }}>
          Thank you! Your account recovery request has been received and payment confirmed.
        </p>
        <div style={{
          background: 'rgba(124,58,237,0.08)',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '28px',
          textAlign: 'left',
        }}>
          {[
            { icon: '📧', text: 'You will receive a confirmation email shortly' },
            { icon: '⏱', text: 'Recovery takes 14–30 business days' },
            { icon: '💬', text: 'Our team will contact you via WhatsApp' },
            { icon: '🔒', text: 'Your information is kept confidential' },
          ].map(item => (
            <div key={item.text} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '14px',
            }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>
                {item.icon}
              </span>
              <p style={{
                fontSize: '14px',
                color: '#9d8fd4',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <Link
            href="https://wa.me/message/BPNJE7CPON3OJ1"
            target="_blank"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#25D366',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            💬 Chat on WhatsApp
          </Link>
          <Link href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.3)',
              color: '#a855f7',
              padding: '12px 24px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
