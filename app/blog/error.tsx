'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Blog error:', error)
  }, [error])

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
    }}>
      <p style={{ 
        fontSize: '48px', 
        margin: '0 0 16px' 
      }}>
        ⚠️
      </p>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 800,
        color: 'var(--heading, #1a1a1a)',
        margin: '0 0 8px',
      }}>
        Blog Error
      </h2>
      <p style={{
        fontSize: '14px',
        color: 'var(--body, #6b5fa0)',
        margin: '0 0 8px',
        fontFamily: 'monospace',
        background: 'rgba(239,68,68,0.08)',
        padding: '8px 16px',
        borderRadius: '8px',
        maxWidth: '600px',
      }}>
        {error.message}
      </p>
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '24px',
      }}>
        <button
          onClick={reset}
          style={{
            padding: '10px 24px',
            background: 
              'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
        <Link href="/" style={{
          padding: '10px 24px',
          background: 
            'rgba(124,58,237,0.1)',
          border: 
            '1px solid rgba(124,58,237,0.2)',
          color: '#7c3aed',
          borderRadius: '10px',
          fontWeight: 700,
          fontSize: '14px',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
        }}>
          Go Home
        </Link>
      </div>
    </div>
  )
}