'use client'

import { useState } from 'react'
import Link from 'next/link'

const TELEGRAM_LINK = 'https://t.me/PurpleSofthubsupport'

export default function TelegramButton() {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="telegram-float-wrap">
      <div
        className="telegram-tooltip"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered
            ? 'translateX(0) scale(1)'
            : 'translateX(8px) scale(0.95)',
        }}
      >
        Chat with us on Telegram
        <div className="telegram-tooltip-arrow" />
      </div>

      <Link
        href={TELEGRAM_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with PurpleSoftHub on Telegram"
        className="telegram-float-button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        style={{
          boxShadow: hovered
            ? '0 8px 30px rgba(34, 158, 217, 0.52)'
            : '0 4px 20px rgba(34, 158, 217, 0.32)',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <svg
          width="29"
          height="29"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M21.7 4.3 18.5 19.4c-.2 1.1-.9 1.3-1.8.8l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L5.9 12.8l-5-1.6c-1.1-.3-1.1-1.1.2-1.6L20.5 2.1c.9-.3 1.7.2 1.2 2.2Z"
            fill="white"
          />
        </svg>
      </Link>

      <style>{`
        .telegram-float-wrap {
          position: fixed;
          right: 24px;
          bottom: 96px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-direction: row-reverse;
        }

        .telegram-tooltip {
          position: absolute;
          right: 64px;
          background: var(--bg-card);
          border: 1px solid rgba(34, 158, 217, 0.28);
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 500;
          padding: 8px 14px;
          border-radius: 10px;
          white-space: nowrap;
          transition: all 0.2s ease;
          pointer-events: none;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.22);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .telegram-tooltip-arrow {
          position: absolute;
          right: -6px;
          top: 50%;
          width: 12px;
          height: 12px;
          background: var(--bg-card);
          border: 1px solid rgba(34, 158, 217, 0.28);
          border-left: none;
          border-bottom: none;
          transform: translateY(-50%) rotate(45deg);
        }

        .telegram-float-button {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #229ed9;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          animation: telegram-pulse 2.5s ease-in-out infinite;
        }

        .telegram-float-button:focus-visible {
          outline: 3px solid rgba(34, 158, 217, 0.4);
          outline-offset: 4px;
        }

        @keyframes telegram-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 158, 217, 0.36);
          }
          70% {
            box-shadow: 0 0 0 12px rgba(34, 158, 217, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 158, 217, 0);
          }
        }

        @media (max-width: 640px) {
          .telegram-float-wrap {
            right: 24px;
            bottom: 92px;
          }

          .telegram-float-button {
            width: 52px;
            height: 52px;
          }

          .telegram-tooltip {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .telegram-float-button {
            animation: none;
            transition: none;
          }

          .telegram-tooltip {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}
