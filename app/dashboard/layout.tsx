'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import purpleLogo from '@/Assets/images/Purplesoft-logo-main.png'

const NAV_ITEMS = [
  { icon: '🏠', label: 'Overview', href: '/dashboard' },
  { icon: '🛍️', label: 'Services', href: '/dashboard/services' },
  { icon: '📊', label: 'My Projects', href: '/dashboard/projects' },
  { icon: '🎵', label: 'Music Promotion', href: '/dashboard/music' },
  { icon: '📁', label: 'My Files', href: '/dashboard/files' },
  { icon: '🧾', label: 'Invoices', href: '/dashboard/invoices' },
  { icon: '⚙️', label: 'Settings', href: '/dashboard/settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isLoaded) {
    return (
      <div style={{ minHeight: '100vh', background: '#06030f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#9d8fd4', fontSize: 14 }}>Loading…</div>
      </div>
    )
  }

  const sidebarContent = (
    <div
      style={{
        width: 240,
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(10,6,24,0.95), rgba(6,4,16,0.9))',
        borderRight: '1px solid rgba(124,58,237,.25)',
        boxShadow: 'inset -1px 0 0 rgba(124,58,237,.15)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Logo + Badge */}
      <div style={{ padding: '28px 20px 16px', borderBottom: '1px solid rgba(124,58,237,.1)' }}>
        <Image src={purpleLogo} alt="PurpleSoftHub" width={100} height={34} style={{ objectFit: 'contain', height: 'auto' }} />
        <div
          style={{
            display: 'inline-block',
            marginTop: 8,
            background: 'rgba(124,58,237,.2)',
            color: '#a855f7',
            fontSize: 11,
            borderRadius: 100,
            padding: '3px 10px',
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          Client Portal
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 20px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? '#fff' : '#9d8fd4',
                cursor: 'pointer',
                transition: 'all .2s',
                margin: '2px 8px',
                textDecoration: 'none',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(124,58,237,.2), rgba(168,85,247,.1))'
                  : 'transparent',
                borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(124,58,237,.1)' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            {user.imageUrl && (
              <Image
                src={user.imageUrl}
                alt={user.firstName || 'User'}
                width={36}
                height={36}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2d9f3' }}>
                {user.firstName} {user.lastName}
              </div>
              <div style={{ fontSize: 11, color: '#9d8fd4' }}>
                {user.emailAddresses[0]?.emailAddress}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut(() => router.push('/'))}
          style={{
            width: '100%',
            padding: '8px 16px',
            borderRadius: 8,
            background: 'rgba(239,68,68,.1)',
            border: '1px solid rgba(239,68,68,.2)',
            color: '#f87171',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all .2s',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="dash-shell" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <div className="dash-sidebar-desktop">{sidebarContent}</div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 40 }}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className="dash-sidebar-mobile"
        style={{
          position: 'fixed',
          top: 0,
          left: sidebarOpen ? 0 : -260,
          zIndex: 50,
          transition: 'left .3s ease',
        }}
      >
        {sidebarContent}
      </div>

      {/* Main content */}
      <div className="dash-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <div
          className="dash-topbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 32px',
            borderBottom: '1px solid rgba(124,58,237,.2)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <button
            className="dash-hamburger"
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#9d8fd4',
              fontSize: 22,
              cursor: 'pointer',
              padding: 4,
              display: 'none',
            }}
          >
            ☰
          </button>
          <div style={{ color: '#e2d9f3', fontSize: 16, fontWeight: 700 }}>
            Hey {user?.firstName || 'there'}! 💜
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              style={{ background: 'none', border: 'none', color: '#9d8fd4', fontSize: 20, cursor: 'pointer' }}
              title="Notifications"
            >
              🔔
            </button>
            {user?.imageUrl && (
              <Image
                src={user.imageUrl}
                alt="User"
                width={32}
                height={32}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="dash-content" style={{ flex: 1, padding: 32, color: '#e2d9f3' }}>
          {children}
        </main>
      </div>

      <style>{`
        .dash-shell {
          background:
            radial-gradient(circle at 20% 20%, rgba(124,58,237,0.25), transparent 40%),
            radial-gradient(circle at 80% 10%, rgba(236,72,153,0.2), transparent 35%),
            radial-gradient(circle at 60% 80%, rgba(59,130,246,0.18), transparent 35%),
            #05020c;
          font-family: 'Sora', 'Outfit', sans-serif;
        }
        .dash-topbar {
          backdrop-filter: blur(18px);
          background: linear-gradient(135deg, rgba(9,6,22,0.9), rgba(8,6,20,0.6));
        }
        .dash-content {
          position: relative;
        }
        .dash-content::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          opacity: 0.4;
        }
        .dash-content > * {
          position: relative;
          z-index: 1;
        }
        @media (max-width: 768px) {
          .dash-sidebar-desktop { display: none !important; }
          .dash-hamburger { display: block !important; }
        }
        @media (min-width: 769px) {
          .dash-sidebar-mobile { display: none !important; }
        }
      `}</style>
    </div>
  )
}
