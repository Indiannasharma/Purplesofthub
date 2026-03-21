'use client'

import { useState } from 'react'
import {
  FiHome, FiUsers, FiBox, FiFileText, FiDownload,
  FiMusic, FiDollarSign, FiMessageCircle, FiMail, FiSettings, FiX,
} from 'react-icons/fi'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'

const adminSidebarItems = [
  { name: 'Overview', href: '/admin', icon: FiHome },
  { name: 'Clients', href: '/admin/clients', icon: FiUsers },
  { name: 'Projects', href: '/admin/projects', icon: FiBox },
  { name: 'Files', href: '/admin/files', icon: FiDownload },
  { name: 'Invoices', href: '/admin/invoices', icon: FiFileText },
  { name: 'Payments', href: '/admin/payments', icon: FiDollarSign },
  { name: 'Music Promotions', href: '/admin/music', icon: FiMusic },
  { name: 'Blog Manager', href: '/admin/blog', icon: FiFileText },
  { name: 'Promotions Manager', href: '/admin/promotions', icon: FiMessageCircle },
  { name: 'Chat Leads', href: '/admin/leads', icon: FiMessageCircle },
  { name: 'Newsletter', href: '/admin/newsletter', icon: FiMail },
  { name: 'Settings', href: '/admin/settings', icon: FiSettings },
]

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile overlay */}
      <div
        className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto bg-white dark:bg-gray-800 lg:static lg:inset-0 lg:translate-x-0 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-200 ease-in-out`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-purple-600 text-white">
          <h1 className="text-xl font-bold">PurpleSoftHub Admin</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <FiX className="w-6 h-6" />
          </button>
        </div>
        <Sidebar items={adminSidebarItems} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
