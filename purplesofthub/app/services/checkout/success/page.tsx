import { Suspense } from 'react'
import CheckoutSuccessClient from './CheckoutSuccessClient'

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
          background: 'radial-gradient(circle at top, rgba(124,58,237,0.18), transparent 35%), #06030f',
          color: '#e9e4ff',
          textAlign: 'center',
        }}>
          <div style={{
            width: '100%',
            maxWidth: 560,
            padding: '36px',
            borderRadius: 24,
            border: '1px solid rgba(124,58,237,0.28)',
            background: 'linear-gradient(180deg, rgba(15,11,31,0.96), rgba(8,6,18,0.96))',
            boxShadow: '0 0 60px rgba(124,58,237,0.18)',
          }}>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#c6b8ef', margin: 0 }}>
              Loading secure checkout...
            </p>
          </div>
        </main>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  )
}
