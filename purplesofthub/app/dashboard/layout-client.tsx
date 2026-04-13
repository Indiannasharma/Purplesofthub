'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import UserNotificationBell from '@/components/dashboard/UserNotificationBell'

const SIDEBAR_WIDTH = 260

const navItems = [
  { 
    href: '/dashboard', 
    label: 'Overview',
    icon: (
      <svg width="18" height="18" 
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  { 
    href: '/dashboard/services', 
    label: 'Services',
    icon: (
      <svg width="18" height="18"
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
  { 
    href: '/dashboard/projects', 
    label: 'My Projects',
    icon: (
      <svg width="18" height="18"
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  { 
    href: '/dashboard/music', 
    label: 'Music Promotion',
    icon: (
      <svg width="18" height="18"
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    ),
  },
  { 
    href: '/dashboard/files', 
    label: 'My Files',
    icon: (
      <svg width="18" height="18"
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
        <polyline points="13 2 13 9 20 9"/>
      </svg>
    ),
  },
  { 
    href: '/dashboard/invoices', 
    label: 'Invoices',
    icon: (
      <svg width="18" height="18"
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  { 
    href: '/dashboard/ads', 
    label: 'Ads Performance',
    icon: (
      <svg width="18" height="18"
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  { 
    href: '/dashboard/connect-meta', 
    label: 'Connect Meta',
    icon: (
      <svg width="18" height="18"
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  { 
    href: '/dashboard/recovery', 
    label: 'Account Recovery',
    icon: (
      <svg width="18" height="18"
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
]

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{
    id: string
    name: string
    email: string
    initials: string
  } | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user: u } } = await supabase.auth.getUser()
      if (u) {
        const name =
          u.user_metadata?.full_name ||
          u.user_metadata?.name ||
          u.email?.split('@')[0] ||
          'User'
        const initials = name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
        setUser({ id: u.id, name, email: u.email || '', initials })
      }
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  const isActive = (href: string) => 
    pathname === href || 
    (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <div style={{
      display: 'flex',
      height: '100dvh',
      width: '100%',
      overflow: 'hidden',
      background: theme === 'dark' ? '#0f0f1a' : '#f4f6f9',
      fontFamily: 'inherit',
      position: 'relative',
    }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
          }}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`dashboard-sidebar${sidebarOpen ? ' open' : ''}`}
        style={{
          width: `${SIDEBAR_WIDTH}px`,
          flexShrink: 0,
          height: '100vh',
          background: theme === 'dark' ? '#13131f' : '#ffffff',
          borderRight: `1px solid ${
            theme === 'dark'
              ? 'rgba(124,58,237,0.15)'
              : 'rgba(124,58,237,0.1)'
          }`,
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 200,
          transition: 'transform 0.3s ease',
          overflowY: 'auto',
        }}
      >

        {/* Logo */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${
            theme === 'dark'
              ? 'rgba(124,58,237,0.1)'
              : 'rgba(124,58,237,0.08)'
          }`,
          flexShrink: 0,
        }}>
          <Link href="/dashboard">
            <Image
              src="/images/logo/purplesoft-logo-main.png"
              alt="PurpleSoftHub"
              width={140}
              height={40}
              priority
              style={{ objectFit: 'contain' }}
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: '16px 12px',
          overflowY: 'auto',
        }}>
          <p style={{
            fontSize: '10px',
            fontWeight: 700,
            color: theme === 'dark' ? '#4b5563' : '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '0 12px',
            marginBottom: '8px',
          }}>
            Menu
          </p>

          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '10px',
                marginBottom: '4px',
                textDecoration: 'none',
                fontWeight: isActive(item.href) ? 700 : 500,
                fontSize: '14px',
                background: isActive(item.href)
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(168,85,247,0.1))'
                  : 'transparent',
                color: isActive(item.href)
                  ? '#a855f7'
                  : theme === 'dark' ? '#9ca3af' : '#6b7280',
                borderLeft: isActive(item.href)
                  ? '3px solid #a855f7'
                  : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <span style={{
                color: isActive(item.href) ? '#a855f7' : 'inherit',
                flexShrink: 0,
              }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}

          <div style={{
            height: '1px',
            background: theme === 'dark'
              ? 'rgba(124,58,237,0.1)'
              : 'rgba(124,58,237,0.08)',
            margin: '12px 0',
          }}/>

          <p style={{
            fontSize: '10px',
            fontWeight: 700,
            color: theme === 'dark' ? '#4b5563' : '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '0 12px',
            marginBottom: '8px',
          }}>
            Others
          </p>

          <Link
            href="/dashboard/settings"
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: isActive('/dashboard/settings') ? 700 : 500,
              background: isActive('/dashboard/settings')
                ? 'rgba(124,58,237,0.12)'
                : 'transparent',
              color: isActive('/dashboard/settings')
                ? '#a855f7'
                : theme === 'dark' ? '#9ca3af' : '#6b7280',
              borderLeft: isActive('/dashboard/settings')
                ? '3px solid #a855f7'
                : '3px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            <svg width="18" height="18"
              viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
            Settings
          </Link>
        </nav>

        {/* User section at bottom */}
        <div style={{
          padding: '16px',
          borderTop: `1px solid ${
            theme === 'dark'
              ? 'rgba(124,58,237,0.1)'
              : 'rgba(124,58,237,0.08)'
          }`,
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '10px',
            background: theme === 'dark'
              ? 'rgba(124,58,237,0.08)'
              : 'rgba(124,58,237,0.05)',
            marginBottom: '8px',
          }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 800,
              color: '#fff',
              flexShrink: 0,
            }}>
              {user?.initials || 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 700,
                color: theme === 'dark' ? '#fff' : '#1a1a1a',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user?.name || 'Loading...'}
              </p>
              <p style={{
                fontSize: '11px',
                color: '#9d8fd4',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user?.email || ''}
              </p>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: '#ef4444',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            }}
          >
            <svg width="16" height="16"
              viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div 
        style={{
          marginLeft: `${SIDEBAR_WIDTH}px`,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          overflow: 'hidden',
          minWidth: 0,
          width: '100%',
        }}
        className="dashboard-main"
      >

        {/* STICKY HEADER */}
        <header style={{
          minHeight: '64px',
          flexShrink: 0,
          background: theme === 'dark'
            ? 'rgba(19,19,31,0.92)'
            : 'rgba(255,255,255,0.92)',
          borderBottom: `1px solid ${
            theme === 'dark'
              ? 'rgba(124,58,237,0.12)'
              : 'rgba(124,58,237,0.08)'
          }`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '0 16px',
          position: 'sticky',
          top: 0,
          zIndex: 60,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}>

          {/* Left — Mobile menu + Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: 0,
            flex: '1 1 auto',
          }}>
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="dashboard-mobile-menu"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: `1px solid ${
                  theme === 'dark'
                    ? 'rgba(124,58,237,0.2)'
                    : 'rgba(124,58,237,0.15)'
                }`,
                background: 'transparent',
                cursor: 'pointer',
                color: theme === 'dark' ? '#9d8fd4' : '#6b7280',
              }}
            >
              <svg width="18" height="18"
                viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>

            {/* Mobile Logo */}
            <Link 
              href="/dashboard"
              className="dashboard-mobile-logo"
              style={{ display: 'flex', flexShrink: 0 }}>
              <Image
                src="/images/logo/purplesoft-logo-main.png"
                alt="PurpleSoftHub"
                width={116}
                height={32}
                priority
                style={{ objectFit: 'contain', maxWidth: '100%' }}
              />
            </Link>

            {/* Search bar - desktop */}
            <div
              className="dashboard-search"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: theme === 'dark'
                  ? 'rgba(124,58,237,0.06)'
                  : 'rgba(124,58,237,0.04)',
                border: `1px solid ${
                  theme === 'dark'
                    ? 'rgba(124,58,237,0.12)'
                    : 'rgba(124,58,237,0.1)'
                }`,
                borderRadius: '10px',
                padding: '7px 14px',
                minWidth: '220px',
              }}>
              <svg width="14" height="14"
                viewBox="0 0 24 24" fill="none"
                stroke={theme === 'dark' ? '#6b5fa0' : '#9ca3af'}
                strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span style={{
                fontSize: '13px',
                color: theme === 'dark' ? '#6b5fa0' : '#9ca3af',
              }}>
                Search or type command...
              </span>
              <span style={{
                fontSize: '11px',
                color: theme === 'dark' ? '#4b5563' : '#d1d5db',
                marginLeft: 'auto',
              }}>
                ⌘K
              </span>
            </div>
          </div>

          {/* Right — Actions */}
          <div
            className="dashboard-header-actions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0,
            }}
          >

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: `1px solid ${
                  theme === 'dark'
                    ? 'rgba(124,58,237,0.15)'
                    : 'rgba(124,58,237,0.1)'
                }`,
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: theme === 'dark' ? '#9d8fd4' : '#6b7280',
              }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Notifications */}
            {user?.id && (
              <UserNotificationBell userId={user.id} theme={theme} />
            )}

            {/* User avatar */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 800,
              color: '#fff',
              cursor: 'pointer',
              flexShrink: 0,
            }}>
              {user?.initials || 'U'}
            </div>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT */}
        <main style={{
          flex: '1 1 auto',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: 'clamp(16px, 2vw, 28px)',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          minHeight: 0,
        }}>
          {children}
        </main>
      </div>

      {/* RESPONSIVE CSS */}
      <style>{`
        /* Desktop — always show sidebar, hide mobile elements */
        @media (min-width: 1025px) {
          .dashboard-sidebar {
            transform: translateX(0) !important;
          }
          .dashboard-mobile-menu {
            display: none !important;
          }
          .dashboard-mobile-logo {
            display: none !important;
          }
          .dashboard-search {
            display: flex !important;
          }
        }

        /* Mobile — hide sidebar, show mobile header elements */
        @media (max-width: 1024px) {
          .dashboard-sidebar {
            transform: translateX(-100%) !important;
            z-index: 9999 !important;
            -webkit-overflow-scrolling: touch;
          }
          .dashboard-sidebar.open {
            transform: translateX(0) !important;
          }
          .dashboard-main {
            margin-left: 0 !important;
          }
          .dashboard-mobile-menu {
            display: flex !important;
          }
          .dashboard-mobile-logo {
            display: flex !important;
          }
          .dashboard-search {
            display: none !important;
          }
        }

        @media (max-width: 640px) {
          .dashboard-main {
            min-width: 0;
          }
          .dashboard-header-actions {
            gap: 4px !important;
          }
          .dashboard-header-actions button {
            width: 32px !important;
            height: 32px !important;
          }
          .dashboard-mobile-logo img {
            width: 98px !important;
            height: auto !important;
          }
          .dashboard-main header {
            padding-left: 12px !important;
            padding-right: 12px !important;
            min-height: 60px !important;
          }
        }

        /* Scrollbar styling */
        .dashboard-main main::-webkit-scrollbar {
          width: 6px;
        }
        .dashboard-main main::-webkit-scrollbar-track {
          background: transparent;
        }
        .dashboard-main main::-webkit-scrollbar-thumb {
          background: rgba(124,58,237,0.3);
          border-radius: 100px;
        }
        .dashboard-main main::-webkit-scrollbar-thumb:hover {
          background: rgba(124,58,237,0.5);
        }

        /* Fix touch scrolling on mobile */
        .dashboard-main {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        /* Ensure main content scrolls correctly */
        .dashboard-main main {
          min-height: 0;
          overscroll-behavior: contain;
        }
      `}</style>
    </div>
  )
}
