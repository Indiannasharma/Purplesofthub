import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 
  'PurpleSoftHub — Digital Innovation Studio'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #06030f 0%, #0d0520 50%, #1a0535 100%)',
        position: 'relative',
        fontFamily: 'sans-serif',
      }}>

        {/* Glow effect */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '50%',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
        }} />

        {/* Logo + Name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '28px',
          zIndex: 1,
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '42px',
            fontWeight: '900',
            color: 'white',
          }}>
            P
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
          }}>
            <span style={{
              fontSize: '52px',
              fontWeight: '900',
              color: '#ffffff',
              letterSpacing: '-2px',
              lineHeight: '1',
              display: 'flex',
            }}>
              PurpleSoftHub
            </span>
            <span style={{
              fontSize: '22px',
              color: '#a855f7',
              fontWeight: '600',
              display: 'flex',
            }}>
              Digital Innovation Studio
            </span>
          </div>
        </div>

        {/* Services row */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          zIndex: 1,
        }}>
          {[
            '🌐 Web Dev',
            '📱 Mobile Apps', 
            '📣 Marketing',
            '🎵 Music Promo',
          ].map(service => (
            <div key={service} style={{
              background: 'rgba(124,58,237,0.2)',
              border: '1px solid rgba(124,58,237,0.4)',
              borderRadius: '100px',
              padding: '8px 18px',
              fontSize: '16px',
              color: '#c084fc',
              fontWeight: '600',
              display: 'flex',
            }}>
              {service}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(124,58,237,0.15)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '100px',
          padding: '10px 28px',
          zIndex: 1,
        }}>
          <span style={{
            fontSize: '18px',
            color: '#a855f7',
            fontWeight: '600',
            display: 'flex',
          }}>
            🌐 purplesofthub.com
          </span>
        </div>

        {/* Nigeria flag */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          right: '32px',
          fontSize: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#6b5fa0',
          zIndex: 1,
        }}>
          <span>🇳🇬</span>
          <span style={{
            fontSize: '14px',
            color: '#6b5fa0',
            display: 'flex',
          }}>
            Lagos, Nigeria
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}