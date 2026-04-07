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
          position: 'relative',
          fontFamily: 'Arial, sans-serif',
          overflow: 'hidden',
          background: '#06030f',
        }}
      >
        {/* ── BACKGROUND LAYERS ── */}

        {/* Deep gradient base */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #06030f 0%, #0f0528 40%, #1a0535 70%, #06030f 100%)',
            display: 'flex',
          }}
        />

        {/* Large left glow */}
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            left: '-100px',
            width: '700px',
            height: '700px',
            background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 65%)',
            display: 'flex',
          }}
        />

        {/* Right glow */}
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            right: '-100px',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 65%)',
            display: 'flex',
          }}
        />

        {/* Subtle grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            display: 'flex',
          }}
        />

        {/* ── LEFT ACCENT BAR ── */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '6px',
            background: 'linear-gradient(180deg, #7c3aed, #a855f7, #c084fc)',
            display: 'flex',
          }}
        />

        {/* ── MAIN CONTENT ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            padding: '60px 80px 60px 86px',
          }}
        >

          {/* TOP SECTION */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >

            {/* Logo — LARGE AND PROMINENT */}
            <img
              src="https://www.purplesofthub.com/images/logo/purplesoft-logo-main.png"
              width="280"
              height="80"
              style={{
                objectFit: 'contain',
                objectPosition: 'left center',
                display: 'flex',
                filter: 'brightness(1.1)',
              }}
              alt="PurpleSoftHub"
            />

            {/* Top right badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(124,58,237,0.2)',
                border: '1px solid rgba(168,85,247,0.4)',
                borderRadius: '100px',
                padding: '10px 24px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#a855f7',
                  display: 'flex',
                }}
              />
              <span
                style={{
                  fontSize: '15px',
                  color: '#c084fc',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  display: 'flex',
                }}
              >
                DIGITAL INNOVATION STUDIO
              </span>
            </div>
          </div>

          {/* MIDDLE SECTION — Main headline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div
              style={{
                fontSize: '64px',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.05,
                letterSpacing: '-1px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span style={{ display: 'flex' }}>
                Building Africa&apos;s
              </span>
              <span
                style={{
                  display: 'flex',
                  background: 'linear-gradient(135deg, #a855f7, #c084fc, #e879f9)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Digital Future.
              </span>
            </div>

            <p
              style={{
                fontSize: '22px',
                color: '#9d8fd4',
                margin: 0,
                lineHeight: 1.5,
                display: 'flex',
                maxWidth: '700px',
              }}
            >
              Web · Mobile · Marketing · Music · SaaS · Academy
            </p>
          </div>

          {/* BOTTOM SECTION */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >

            {/* Service pills */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              {[
                '🌐 Web Dev',
                '📱 Mobile',
                '📣 Marketing',
                '🎵 Music',
                '🎓 Academy',
              ].map((service) => (
                <div
                  key={service}
                  style={{
                    background: 'rgba(124,58,237,0.15)',
                    border: '1px solid rgba(168,85,247,0.3)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '15px',
                    color: '#c084fc',
                    fontWeight: 600,
                    display: 'flex',
                  }}
                >
                  {service}
                </div>
              ))}
            </div>

            {/* URL */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(168,85,247,0.15))',
                border: '1px solid rgba(168,85,247,0.4)',
                borderRadius: '12px',
                padding: '12px 24px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#a855f7',
                  display: 'flex',
                }}
              />
              <span
                style={{
                  fontSize: '18px',
                  color: '#ffffff',
                  fontWeight: 700,
                  display: 'flex',
                }}
              >
                purplesofthub.com
              </span>
            </div>
          </div>
        </div>

        {/* ── DECORATIVE RIGHT SIDE ── */}
        {/* Abstract circles */}
        <div
          style={{
            position: 'absolute',
            right: '60px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            border: '1px solid rgba(168,85,247,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              border: '1px solid rgba(168,85,247,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'rgba(124,58,237,0.15)',
                border: '1px solid rgba(168,85,247,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '40px',
                  display: 'flex',
                }}
              >
                💜
              </span>
            </div>
          </div>
        </div>

      </div>
    ),
    { ...size }
  )
}
