'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import purpleLogo from '@/Assets/images/Purplesoft-logo-main.png'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ icon: '📊', label: 'Dashboard', href: '/admin' }],
  },
  {
    label: 'Content',
    items: [
      { icon: '✍️', label: 'Blog Manager', href: '/admin/blog' },
      { icon: '📣', label: 'Promotions', href: '/admin/promotions' },
    ],
  },
  {
    label: 'Clients',
    items: [
      { icon: '👥', label: 'All Clients', href: '/admin/clients' },
      { icon: '💬', label: 'Chat Leads', href: '/admin/leads' },
      { icon: '📧', label: 'Subscribers', href: '/admin/subscribers' },
    ],
  },
  {
    label: 'Projects',
    items: [
      { icon: '📦', label: 'All Projects', href: '/admin/projects' },
      { icon: '🎵', label: 'Music Promos', href: '/admin/music' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { icon: '🧾', label: 'Invoices', href: '/admin/invoices' },
      { icon: '💰', label: 'Payments', href: '/admin/payments' },
    ],
  },
  {
    label: 'Settings',
    items: [{ icon: '⚙️', label: 'Settings', href: '/admin/settings' }],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.push('/sign-in')
      return
    }
    const userRole = typeof user.publicMetadata?.role === 'string' ? user.publicMetadata.role : null
    if (!userRole || userRole !== 'admin') {
      router.push('/dashboard')
    }
  }, [isLoaded, user, router])

  const role = typeof user?.publicMetadata?.role === 'string' ? user.publicMetadata.role : null

  if (!isLoaded || !user || role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: '#06030f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#9d8fd4', fontSize: 14 }}>Redirecting…</div>
      </div>
    )
  }

  const sidebarContent = (
    <div
      style={{
        width: 260,
        minHeight: '100vh',
        background: '#0a0618',
        borderRight: '1px solid rgba(124,58,237,.15)',
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
          Admin Panel
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
                color: '#3d2f60',
                textTransform: 'uppercase',
                padding: '16px 20px 6px',
              }}
            >
              {group.label}
            </div>
            {group.items.map((item) => {
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
          </div>
        ))}
      </nav>

      {/* User section */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(124,58,237,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          {user.imageUrl && (
            <Image
              src={user.imageUrl}
              alt={user.firstName || 'Admin'}
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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#06030f' }}>
      {/* Desktop Sidebar */}
      <div className="admin-sidebar-desktop">{sidebarContent}</div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.6)',
            zIndex: 40,
          }}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className="admin-sidebar-mobile"
        style={{
          position: 'fixed',
          top: 0,
          left: sidebarOpen ? 0 : -280,
          zIndex: 50,
          transition: 'left .3s ease',
        }}
      >
        {sidebarContent}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 32px',
            borderBottom: '1px solid rgba(124,58,237,.1)',
            background: '#06030f',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <button
            className="admin-hamburger"
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
          <div style={{ color: '#e2d9f3', fontSize: 15, fontWeight: 600 }}>
            Admin Panel
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#9d8fd4',
                fontSize: 20,
                cursor: 'pointer',
              }}
              title="Notifications"
            >
              🔔
            </button>
            {user.imageUrl && (
              <Image
                src={user.imageUrl}
                alt="Admin"
                width={32}
                height={32}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
          </div>
        </div>

        {/* Page content */}
        <main style={{ flex: 1, padding: 32, color: '#e2d9f3' }}>{children}</main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-hamburger { display: block !important; }
        }
        @media (min-width: 769px) {
          .admin-sidebar-mobile { display: none !important; }
        }
      `}</style>
    </div>
  )
}
