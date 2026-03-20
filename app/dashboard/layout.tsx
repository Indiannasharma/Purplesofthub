'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import { FiHome, FiBox, FiFileText, FiDownload, FiMusic, FiSettings, FiMenu, FiX } from 'react-icons/fi'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session } = useSession()

  const clientSidebarItems = [
    { name: 'Overview', href: '/dashboard', icon: FiHome },
    { name: 'Services', href: '/dashboard/services', icon: FiBox },
    { name: 'My Projects', href: '/dashboard/projects', icon: FiFileText },
    { name: 'My Files', href: '/dashboard/files', icon: FiDownload },
    { name: 'My Invoices', href: '/dashboard/invoices', icon: FiFileText },
    { name: 'Music Promotion', href: '/dashboard/music', icon: FiMusic },
    { name: 'Settings', href: '/dashboard/settings', icon: FiSettings },
  ]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden`}></div>
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto bg-white dark:bg-gray-800 lg:static lg:inset-0 lg:translate-x-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out`}>
        <div className="flex items-center justify-between h-16 px-4 bg-purple-600 text-white">
          <h1 className="text-xl font-bold">PurpleSoftHub</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <FiX className="w-6 h-6" />
          </button>
        </div>
        <Sidebar items={clientSidebarItems} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}