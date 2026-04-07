"use client"

import React, { useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'

const navItems = [
  { icon: '🏠', label: 'Overview',        path: '/dashboard' },
  { icon: '🛍️', label: 'Services',        path: '/dashboard/services' },
  { icon: '📊', label: 'My Projects',     path: '/dashboard/projects' },
  { icon: '🎵', label: 'Music Promotion', path: '/dashboard/music' },
  { icon: '📁', label: 'My Files',        path: '/dashboard/files' },
  { icon: '🧾', label: 'Invoices',        path: '/dashboard/invoices' },
  { icon: '⚙️', label: 'Settings',        path: '/dashboard/settings' },
]

export default function ClientSidebar() {
  const pathname = usePathname()
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar()
  const sidebarRef = useRef<HTMLDivElement>(null)

  const isVisible = isExpanded || isHovered || isMobileOpen

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      <aside
        ref={sidebarRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col bg-gray-900 transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isVisible ? 'w-[290px]' : 'w-[90px]'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 border-b border-gray-800 px-6 py-5 ${!isVisible ? 'justify-center px-3' : ''}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500">
            <span className="text-lg font-bold text-white">P</span>
          </div>
          {isVisible && (
            <div>
              <span className="block text-sm font-bold text-white">PurpleSoftHub</span>
              <span className="block text-xs text-brand-400 font-medium tracking-widest uppercase">Client Portal</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path))
            return (
              <Link
                key={item.label}
                href={item.path}
                className={`mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-brand-500/20 text-brand-400 border-l-2 border-brand-500'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                  ${!isVisible ? 'justify-center' : ''}
                `}
                title={!isVisible ? item.label : undefined}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                {isVisible && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        {isVisible && (
          <div className="border-t border-gray-800 p-4 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <span>🌐</span>
              <span>View Website</span>
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
