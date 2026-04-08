'use client'

import Link from 'next/link'

export default function ConnectMetaPage() {
  return (
    <div style={{ maxWidth: '700px' }}>

      <h1 style={{
        fontSize: '24px',
        fontWeight: 900,
        color: 'var(--cmd-heading)',
        margin: '0 0 8px',
      }}>
        Connect Meta Account 🔗
      </h1>
      <p style={{
        fontSize: '15px',
        color: 'var(--cmd-body)',
        margin: '0 0 32px',
        lineHeight: 1.6,
      }}>
        Connect your Facebook Business account to enable automatic
        ad performance tracking.
      </p>

      {/* How it works */}
      <div style={{
        background: 'var(--cmd-card)',
        border: '1px solid var(--cmd-border)',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '24px',
        backdropFilter: 'blur(10px)',
      }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: 800,
          color: 'var(--cmd-heading)',
          margin: '0 0 20px',
        }}>
          How It Works
        </h2>

        {[
          {
            step: '01',
            icon: '🔐',
            title: 'Secure Login',
            desc: "Click Connect below. You'll be redirected to Facebook's secure login page.",
          },
          {
            step: '02',
            icon: '✅',
            title: 'Grant Permission',
            desc: 'Allow PurpleSoftHub to read your ad performance data. We never post or make changes.',
          },
          {
            step: '03',
            icon: '📊',
            title: 'See Your Data',
            desc: 'Return to your dashboard and see real-time Facebook & Instagram ad stats.',
          },
        ].map((item, i) => (
          <div key={item.step} style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
            marginBottom: i < 2 ? '20px' : 0,
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              flexShrink: 0,
            }}>
              {item.icon}
            </div>
            <div>
              <p style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--cmd-heading)',
                margin: '0 0 4px',
              }}>
                {item.title}
              </p>
              <p style={{
                fontSize: '13px',
                color: 'var(--cmd-body)',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Alternative: Manual */}
      <div style={{
        background: 'rgba(34,211,238,0.06)',
        border: '1px solid rgba(34,211,238,0.2)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 800,
          color: 'var(--cmd-heading)',
          margin: '0 0 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          💬 Prefer Manual Setup?
        </h3>
        <p style={{
          fontSize: '13px',
          color: 'var(--cmd-body)',
          margin: '0 0 14px',
          lineHeight: 1.5,
        }}>
          No problem! Add PurpleSoftHub as a partner in your Meta
          Business Manager and our team will handle everything.
        </p>
        <a
          href="https://wa.me/2348167593393?text=Hi! I want to add PurpleSoftHub as a partner in my Meta Business Manager"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#25D366',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '13px',
          }}
        >
          💬 Chat on WhatsApp
        </a>
      </div>

      {/* Connect button */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(34,211,238,0.05))',
        border: '1px solid rgba(124,58,237,0.25)',
        borderRadius: '20px',
        padding: '28px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '13px',
          color: 'var(--cmd-body)',
          margin: '0 0 20px',
          lineHeight: 1.5,
        }}>
          Meta API integration is being configured.
          This button will be active shortly.
        </p>

        <button
          disabled
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(124,58,237,0.3)',
            color: 'rgba(255,255,255,0.6)',
            padding: '14px 32px',
            borderRadius: '12px',
            border: 'none',
            fontWeight: 700,
            fontSize: '15px',
            cursor: 'not-allowed',
            fontFamily: 'inherit',
          }}
        >
          🔗 Connect Facebook & Instagram
          <span style={{
            fontSize: '11px',
            background: 'rgba(255,255,255,0.1)',
            padding: '2px 8px',
            borderRadius: '100px',
          }}>
            Coming Soon
          </span>
        </button>

        <p style={{
          fontSize: '11px',
          color: 'var(--cmd-muted)',
          margin: '12px 0 0',
        }}>
          🔒 We only read your ad data. We never post or make changes.
        </p>
      </div>
    </div>
  )
}