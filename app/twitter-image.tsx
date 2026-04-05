import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = "PurpleSoftHub — Africa's Digital Innovation Studio"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #06030f 0%, #0d0520 50%, #1a0535 100%)',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Purple glow background */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            width: '700px',
            height: '700px',
            background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
          }}
        />

        {/* ACTUAL PURPLESOFTHUB LOGO */}
        <img
          src="https://www.purplesofthub.com/images/logo/purplesoft-logo-main.png"
          width="320"
          height="90"
          style={{
            objectFit: 'contain',
            marginBottom: '28px',
            position: 'relative',
            zIndex: 1,
          }}
          alt="PurpleSoftHub"
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: '26px',
            fontWeight: 700,
            color: '#a855f7',
            marginBottom: '20px',
            position: 'relative',
            zIndex: 1,
            display: 'flex',
          }}
        >
          Africa&apos;s Digital Innovation Studio
        </div>

        {/* Service pills */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '32px',
            position: 'relative',
            zIndex: 1,
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: '900px',
          }}
        >
          {[
            '🌐 Web Development',
            '📱 Mobile Apps',
            '📣 Digital Marketing',
            '🎵 Music Promotion',
            '🎓 Academy',
          ].map((service) => (
            <div
              key={service}
              style={{
                background: 'rgba(124,58,237,0.2)',
                border: '1px solid rgba(124,58,237,0.4)',
                borderRadius: '100px',
                padding: '8px 20px',
                fontSize: '16px',
                color: '#c084fc',
                fontWeight: 600,
                display: 'flex',
              }}
            >
              {service}
            </div>
          ))}
        </div>

        {/* URL badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.35)',
            borderRadius: '100px',
            padding: '10px 28px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: '18px',
              color: '#a855f7',
              fontWeight: 700,
              display: 'flex',
            }}
          >
            🌐 purplesofthub.com
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
