'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'

const SIDEBAR_WIDTH = 260

const adminNavItems = [
  {
    section: 'MAIN',
    items: [
      {
        href: '/admin',
        label: 'Dashboard',
        exact: true,
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
        href: '/admin/clients',
        label: 'Clients',
        icon: (
          <svg width="18" height="18"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        ),
      },
      {
        href: '/admin/projects',
        label: 'Projects',
        icon: (
          <svg width="18" height="18"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        ),
      },
      {
        href: '/admin/invoices',
        label: 'Invoices',
        icon: (
          <svg width="18" height="18"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        ),
      },
      {
        href: '/admin/blog',
        label: 'Blog',
        icon: (
          <svg width="18" height="18"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        ),
      },
      {
        href: '/admin/leads',
        label: 'Contact Leads',
        icon: (
          <svg width="18" height="18"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        ),
      },
      {
        href: '/admin/subscribers',
        label: 'Newsletter',
        icon: (
          <svg width="18" height="18"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        ),
      },
      {
        href: '/admin/music',
        label: 'Music Campaigns',
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
        href: '/admin/recovery',
        label: 'Recovery Requests',
        icon: (
          <svg width="18" height="18"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        ),
      },
      {
        href: '/admin/payments',
        label: 'Payments',
        icon: (
          <svg width="18" height="18"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        ),
      },
    ],
  },
  {
    section: 'SETTINGS',
    items: [
      {
        href: '/admin/services',
        label: 'Services Catalog',
        icon: (
          <svg width="18" height="18"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
          </svg>
        ),
      },
      {
        href: '/admin/settings',
        label: 'Admin Settings',
        icon: (
          <svg width="18" height="18"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        ),
      },
    ],
  },
]

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{
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
          'Admin'
        const initials = name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
        setUser({ 
          name, 
          email: u.email || '', 
          initials 
        })
      }
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  const isActive = (href: string, exact = false) => 
    exact
      ? pathname === href
      : pathname === href || (href !== '/admin' && pathname.startsWith(href))

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: theme === 'dark' ? '#0f0f1a' : '#f4f6f9',
      fontFamily: 'inherit',
    }}>

      {/* ══════════════════════
          ADMIN SIDEBAR
      ══════════════════════ */}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 40,
          }}
        />
      )}

      <aside
        className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}
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
          zIndex: 50,
          transition: 'transform 0.3s ease',
        }}
      >

        {/* Logo */}
        <div style={{
          padding: '18px 20px',
          borderBottom: `1px solid ${
            theme === 'dark'
              ? 'rgba(124,58,237,0.1)'
              : 'rgba(124,58,237,0.08)'
          }`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link href="/admin">
            <Image
              src="/images/logo/purplesoft-logo-main.png"
              alt="PurpleSoftHub"
              width={140}
              height={40}
              priority
              style={{ objectFit: 'contain' }}
            />
          </Link>
          {/* Admin badge */}
          <span style={{
            fontSize: '10px',
            fontWeight: 800,
            color: '#a855f7',
            background: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(124,58,237,0.25)',
            padding: '3px 8px',
            borderRadius: '100px',
            letterSpacing: '0.06em',
          }}>
            ADMIN
          </span>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: '12px',
          overflowY: 'auto',
        }}>
          {adminNavItems.map(section => (
            <div key={section.section}>
              <p style={{
                fontSize: '10px',
                fontWeight: 700,
                color: theme === 'dark' ? '#4b5563' : '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '8px 12px 6px',
                margin: 0,
              }}>
                {section.section}
              </p>
              {section.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    marginBottom: '2px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: isActive(item.href, item.exact) ? 700 : 500,
                    background: isActive(item.href, item.exact)
                      ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(168,85,247,0.08))'
                      : 'transparent',
                    color: isActive(item.href, item.exact)
                      ? '#a855f7'
                      : theme === 'dark' ? '#9ca3af' : '#6b7280',
                    borderLeft: isActive(item.href, item.exact)
                      ? '3px solid #a855f7'
                      : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{
                    color: isActive(item.href, item.exact) ? '#a855f7' : 'inherit',
                    flexShrink: 0,
                  }}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom user section */}
        <div style={{
          padding: '12px 16px',
          borderTop: `1px solid ${
            theme === 'dark'
              ? 'rgba(124,58,237,0.1)'
              : 'rgba(124,58,237,0.08)'
          }`,
        }}>
          {/* User info */}
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
              {user?.initials || 'EE'}
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
                {user?.name || 'Admin'}
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

      {/* ══════════════════════
          ADMIN MAIN CONTENT
      ══════════════════════ */}
      <div
        style={{
          marginLeft: `${SIDEBAR_WIDTH}px`,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          minWidth: 0,
        }}
        className="admin-main"
      >

        {/* ── TOP HEADER ── */}
        <header style={{
          height: '60px',
          flexShrink: 0,
          background: theme === 'dark' ? '#13131f' : '#ffffff',
          borderBottom: `1px solid ${
            theme === 'dark'
              ? 'rgba(124,58,237,0.12)'
              : 'rgba(124,58,237,0.08)'
          }`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>

          {/* Left */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            {/* Mobile menu */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="admin-mobile-menu"
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: `1px solid rgba(124,58,237,0.2)`,
                background: 'transparent',
                cursor: 'pointer',
                color: '#9d8fd4',
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

            {/* Mobile logo */}
            <Link
              href="/admin"
              className="admin-mobile-logo"
              style={{ display: 'none' }}
            >
              <Image
                src="/images/logo/purplesoft-logo-main.png"
                alt="PurpleSoftHub"
                width={120}
                height={34}
                priority
                style={{ objectFit: 'contain' }}
              />
            </Link>

            {/* Search — desktop */}
            <div
              className="admin-search"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: theme === 'dark'
                  ? 'rgba(124,58,237,0.06)'
                  : 'rgba(124,58,237,0.04)',
                border: `1px solid rgba(124,58,237,0.12)`,
                borderRadius: '10px',
                padding: '7px 14px',
                minWidth: '220px',
              }}
            >
              <svg width="14" height="14"
                viewBox="0 0 24 24" fill="none"
                stroke="#6b5fa0" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span style={{
                fontSize: '13px',
                color: '#6b5fa0',
              }}>
                Search...
              </span>
              <span style={{
                fontSize: '11px',
                color: '#4b5563',
                marginLeft: 'auto',
              }}>
                ⌘K
              </span>
            </div>
          </div>

          {/* Right */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            {/* Quick links */}
            <Link
              href="/admin/blog/new"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                padding: '7px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
              className="admin-new-post-btn"
            >
              ✍️ New Post
            </Link>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: `1px solid rgba(124,58,237,0.15)`,
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Notifications */}
            <button style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: `1px solid rgba(124,58,237,0.15)`,
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9d8fd4',
              position: 'relative',
            }}>
              <svg width="16" height="16"
                viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#ef4444',
                color: '#fff',
                fontSize: '9px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                1
              </span>
            </button>

            {/* Admin avatar */}
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
              boxShadow: '0 0 0 2px rgba(168,85,247,0.3)',
            }}>
              {user?.initials || 'EE'}
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: 'clamp(16px, 2vw, 28px)',
        }}>
          {children}
        </main>
      </div>

      {/* ── RESPONSIVE CSS ── */}
      <style>{`
        @media (max-width: 1024px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-main {
            margin-left: 0 !important;
          }
          .admin-mobile-menu {
            display: flex !important;
          }
          .admin-mobile-logo {
            display: flex !important;
          }
          .admin-search {
            display: none !important;
          }
          .admin-new-post-btn {
            display: none !important;
          }
        }
        @media (min-width: 1025px) {
          .admin-sidebar {
            transform: translateX(0) !important;
          }
        }
        .admin-main main::-webkit-scrollbar {
          width: 4px;
        }
        .admin-main main::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-main main::-webkit-scrollbar-thumb {
          background: rgba(124,58,237,0.3);
          border-radius: 100px;
        }
      `}</style>
    </div>
  )
}