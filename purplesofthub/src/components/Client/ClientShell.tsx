'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: '🏠' },
  { label: 'Services', href: '/dashboard/services', icon: '🛍️' },
  { label: 'My Projects', href: '/dashboard/projects', icon: '📦' },
  { label: 'Music', href: '/dashboard/music', icon: '🎵' },
  { label: 'Files', href: '/dashboard/files', icon: '📁' },
  { label: 'Invoices', href: '/dashboard/invoices', icon: '🧾' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
]

interface ClientShellProps {
  children: React.ReactNode
  userEmail: string
  userName: string
}

export default function ClientShell({
  children,
  userEmail,
  userName,
}: ClientShellProps) {
  const pathname = usePathname()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [pathname, isMobile])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const displayName = userName || userEmail.split('@')[0]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#06030f',
        color: '#fff',
        display: 'flex',
      }}
      data-theme="dark"
    >
      {/* ── SIDEBAR ── */}

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 40,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          minHeight: '100vh',
          background: '#0a0618',
          borderRight: '1px solid rgba(124,58,237,0.15)',
          display: 'flex',
          flexDirection: 'column',
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          height: isMobile ? '100vh' : 'auto',
          zIndex: 50,
          transform: isMobile
            ? sidebarOpen
              ? 'translateX(0)'
              : 'translateX(-100%)'
            : 'translateX(0)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '24px 20px 20px',
            borderBottom: '1px solid rgba(124,58,237,0.1)',
          }}
        >
          <Link href="/" style={{ display: 'block', marginBottom: '10px' }}>
            <Image
              src="/images/logo/purplesoft-logo-main.png"
              alt="PurpleSoftHub"
              width={140}
              height={40}
              style={{ filter: 'brightness(1.2)' }}
            />
          </Link>
          <span
            style={{
              display: 'inline-block',
              fontSize: '11px',
              fontWeight: 700,
              background: 'rgba(124,58,237,0.2)',
              color: '#a855f7',
              padding: '3px 10px',
              borderRadius: '100px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Client Portal
          </span>
        </div>

        {/* User info */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(124,58,237,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {displayName[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#fff',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayName}
            </p>
            <p
              style={{
                fontSize: '11px',
                color: '#6b5fa0',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {userEmail}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: '12px 12px',
          }}
        >
          <p
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#4a3f70',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '0 8px',
              marginBottom: '8px',
              marginTop: '4px',
            }}
          >
            Menu
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  marginBottom: '2px',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#c084fc' : '#7c6fa8',
                  background: isActive
                    ? 'rgba(124,58,237,0.15)'
                    : 'transparent',
                  borderLeft: isActive
                    ? '2px solid #7c3aed'
                    : '2px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                <span
                  style={{
                    fontSize: '16px',
                    width: '20px',
                    textAlign: 'center',
                  }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div
          style={{
            padding: '12px',
            borderTop: '1px solid rgba(124,58,237,0.1)',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#6b5fa0',
              textDecoration: 'none',
              marginBottom: '4px',
              transition: 'all 0.15s',
            }}
          >
            <span>🌐</span>
            View Website
          </Link>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#ef4444',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <span>🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Top header */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            background: 'rgba(6,3,15,0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(124,58,237,0.1)',
            padding: '0 16px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {/* Hamburger — mobile only */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: 'rgba(124,58,237,0.1)',
                  border: '1px solid rgba(124,58,237,0.2)',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      display: 'block',
                      width: '18px',
                      height: '2px',
                      background: '#a855f7',
                      borderRadius: '2px',
                    }}
                  />
                ))}
              </button>
            )}
            {/* Mobile logo */}
            {isMobile && (
              <Image
                src="/images/logo/purplesoft-logo-main.png"
                alt="PurpleSoftHub"
                width={100}
                height={30}
                style={{ filter: 'brightness(1.2)' }}
              />
            )}
            {/* Page title — desktop */}
            {!isMobile && (
              <div>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#6b5fa0',
                    margin: 0,
                  }}
                >
                  Client Portal
                </p>
              </div>
            )}
          </div>
          {/* Right side */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {/* Notification bell */}
            <button
              style={{
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.2)',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              🔔
            </button>
            {/* User avatar */}
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {displayName[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            padding: isMobile ? '16px' : '24px 32px',
            maxWidth: '1400px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          {children}
        </main>

        {/* ── MOBILE BOTTOM NAV ── */}
        {isMobile && (
          <nav
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(10,6,24,0.98)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(124,58,237,0.15)',
              padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
              display: 'flex',
              justifyContent: 'space-around',
              zIndex: 40,
            }}
          >
            {NAV_ITEMS.slice(0, 5).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    background: isActive
                      ? 'rgba(124,58,237,0.15)'
                      : 'transparent',
                    minWidth: '52px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '20px',
                      filter: isActive
                        ? 'none'
                        : 'grayscale(0.5) opacity(0.6)',
                    }}
                  >
                    {item.icon}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#a855f7' : '#4a3f70',
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>
        )}

        {/* Bottom padding for mobile nav */}
        {isMobile && <div style={{ height: '72px' }} />}
      </div>
    </div>
  )
}
