'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function Preloader() {
  const [visible, setVisible] =
    useState(false)
  const [phase, setPhase] =
    useState<'in' | 'hold' | 'out'>('in')

  useEffect(() => {
    // Only show on first visit
    const hasVisited = localStorage
      .getItem('psw_visited')

    if (hasVisited) return

    setVisible(true)

    // Phase: hold after logo appears
    const holdTimer = setTimeout(() => {
      setPhase('hold')
    }, 800)

    // Phase: start fade out
    const outTimer = setTimeout(() => {
      setPhase('out')
    }, 1300)

    // Phase: remove from DOM
    const removeTimer = setTimeout(() => {
      setVisible(false)
      localStorage.setItem(
        'psw_visited', 'true'
      )
    }, 1900)

    return () => {
      clearTimeout(holdTimer)
      clearTimeout(outTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#06030f',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          opacity: phase === 'out' ? 0 : 1,
          transition: phase === 'out'
            ? 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            : 'none',
          pointerEvents: phase === 'out'
            ? 'none' : 'all',
        }}
      >
        {/* Outer ambient glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'ambientPulse 2s ease-in-out infinite',
        }}/>

        {/* Logo container */}
        <div style={{
          position: 'relative',
          animation: phase === 'in'
            ? 'logoBounceIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
            : phase === 'hold'
            ? 'logoFloat 1.5s ease-in-out infinite'
            : 'none',
          opacity: phase === 'in' ? 0 : 1,
        }}>

          {/* Rotating glow ring */}
          <div style={{
            position: 'absolute',
            inset: '-12px',
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #7c3aed, #22d3ee, #a855f7, #7c3aed)',
            animation: 'ringRotate 2s linear infinite',
            opacity: 0.6,
            filter: 'blur(8px)',
          }}/>

          {/* Static glow ring beneath */}
          <div style={{
            position: 'absolute',
            inset: '-6px',
            borderRadius: '50%',
            boxShadow: '0 0 30px rgba(124,58,237,0.5), 0 0 60px rgba(124,58,237,0.2)',
            animation: 'glowPulse 1.5s ease-in-out infinite',
          }}/>

          {/* Logo image */}
          <div style={{
            position: 'relative',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            zIndex: 2,
          }}>
            <Image
              src="/Purplesoft-logo-main.png"
              alt="PurpleSoftHub"
              fill
              sizes="100px"
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>

          {/* Orbiting cyan dot */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '8px',
            height: '8px',
            marginTop: '-4px',
            marginLeft: '-4px',
            borderRadius: '50%',
            background: '#22d3ee',
            boxShadow: '0 0 10px #22d3ee, 0 0 20px rgba(34,211,238,0.5)',
            transformOrigin: '0 0',
            animation: 'orbitDot 1.5s linear infinite',
            zIndex: 3,
          }}/>
        </div>

        {/* Brand name */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          animation: 'textSlideUp 0.6s ease forwards',
          animationDelay: '0.6s',
          opacity: 0,
          transform: 'translateY(16px)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
          }}>
            <span style={{
              fontSize: 'clamp(18px, 4vw, 24px)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontFamily: 'inherit',
              textShadow: '0 0 20px rgba(168,85,247,0.4)',
            }}>
              Purple
            </span>
            <span style={{
              fontSize: 'clamp(18px, 4vw, 24px)',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #7c3aed, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontFamily: 'inherit',
            }}>
              SoftHub
            </span>
          </div>

          {/* Tagline */}
          <p style={{
            fontSize: 'clamp(9px, 2vw, 11px)',
            fontWeight: 600,
            color: 'rgba(157,143,212,0.6)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            margin: 0,
            fontFamily: 'inherit',
            animation: 'textSlideUp 0.5s ease forwards',
            animationDelay: '0.85s',
            opacity: 0,
          }}>
            Africa&apos;s Digital Innovation Studio
          </p>
        </div>

        {/* Loading bar */}
        <div style={{
          position: 'absolute',
          bottom: 'clamp(24px, 5vw, 48px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'clamp(80px, 20vw, 140px)',
          height: '2px',
          background: 'rgba(124,58,237,0.15)',
          borderRadius: '100px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #7c3aed, #22d3ee)',
            borderRadius: '100px',
            animation: 'loadBar 1.3s ease forwards',
            animationDelay: '0.1s',
            boxShadow: '0 0 8px rgba(124,58,237,0.8)',
          }}/>
        </div>
      </div>

      <style>{`
        @keyframes logoBounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          60% {
            opacity: 1;
            transform: scale(1.08);
          }
          80% {
            transform: scale(0.96);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes ringRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.5;
            box-shadow:
              0 0 20px rgba(124,58,237,0.4),
              0 0 40px rgba(124,58,237,0.15);
          }
          50% {
            opacity: 1;
            box-shadow:
              0 0 40px rgba(124,58,237,0.7),
              0 0 80px rgba(124,58,237,0.3),
              0 0 120px rgba(124,58,237,0.1);
          }
        }

        @keyframes ambientPulse {
          0%, 100% {
            opacity: 0.4;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        @keyframes orbitDot {
          0% {
            transform: rotate(0deg)
              translateX(62px)
              rotate(0deg);
          }
          100% {
            transform: rotate(360deg)
              translateX(62px)
              rotate(-360deg);
          }
        }

        @keyframes textSlideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loadBar {
          0% { width: 0%; }
          15% { width: 15%; }
          40% { width: 45%; }
          70% { width: 72%; }
          90% { width: 90%; }
          100% { width: 100%; }
        }
      `}</style>
    </>
  )
}
