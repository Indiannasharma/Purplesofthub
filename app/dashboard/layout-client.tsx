'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiHome, FiBox, FiFileText, FiDownload, FiMusic, FiSettings, FiX, FiMenu, FiLogOut } from 'react-icons/fi'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const clientSidebarItems = [
  { name: 'Overview', href: '/dashboard', icon: FiHome },
  { name: 'My Projects', href: '/dashboard/projects', icon: FiFileText },
  { name: 'My Files', href: '/dashboard/files', icon: FiDownload },
  { name: 'My Invoices', href: '/dashboard/invoices', icon: FiFileText },
  { name: 'Music Promotion', href: '/dashboard/music', icon: FiMusic },
  { name: 'Settings', href: '/dashboard/settings', icon: FiSettings },
]

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  return (
    <div className="flex h-screen" style={{ background: '#060311' }}>
      {/* Mobile overlay */}
      <div
        className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-20 transition-opacity bg-black/60 lg:hidden`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-72 overflow-y-auto lg:static lg:inset-0 lg:translate-x-0 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
        style={{ background: 'rgba(10, 3, 20, 0.95)', borderRight: '1px solid rgba(124,58,237,0.2)' }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-purple-900/30">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">PurpleSoftHub</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white transition">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Items */}
        <nav className="px-4 py-6 space-y-2">
          {clientSidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-all group"
                onClick={() => setSidebarOpen(false)}
                style={{
                  background: 'rgba(124,58,237,0.05)',
                  borderLeft: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(124,58,237,0.15)'
                  e.currentTarget.style.borderLeftColor = '#a855f7'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(124,58,237,0.05)'
                  e.currentTarget.style.borderLeftColor = 'transparent'
                }}
              >
                <Icon className="w-5 h-5 text-purple-400" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-purple-900/30 bg-gradient-to-t from-purple-950/50 to-transparent p-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-red-400 transition-colors"
            style={{ background: 'rgba(124,58,237,0.05)' }}
          >
            <FiLogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-20 border-b border-purple-900/30 px-6 flex items-center justify-between" style={{ background: 'rgba(10, 3, 20, 0.7)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-purple-400 hover:text-purple-300 transition"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          </div>
          <div className="text-sm text-gray-400">Welcome back! 👋</div>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
