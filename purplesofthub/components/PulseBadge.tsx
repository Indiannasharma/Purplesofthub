'use client'

interface PulseBadgeProps {
  text: string
  color?: string
}

export default function PulseBadge({
  text,
  color = '#a855f7'
}: PulseBadgeProps) {
  return (
    <>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(124,58,237,0.1)',
        border: '1px solid rgba(124,58,237,0.25)',
        borderRadius: '100px',
        padding: '5px 14px',
      }}>
        <span style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
          animation: 'pulseDot 2s ease-in-out infinite',
          flexShrink: 0,
        }}/>
        <span style={{
          fontSize: '12px',
          fontWeight: 700,
          color: color,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          {text}
        </span>
      </div>
      <style>{`
        @keyframes pulseDot {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.75);
          }
        }
      `}</style>
    </>
  )
}
