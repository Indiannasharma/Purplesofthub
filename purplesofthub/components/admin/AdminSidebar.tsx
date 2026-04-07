"use client"

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'

type NavItem = {
  icon: string
  label: string
  path?: string
  children?: { label: string; path: string }[]
}

const navGroups: { group: string; items: NavItem[] }[] = [
  {
    group: 'OVERVIEW',
    items: [
      { icon: '📊', label: 'Dashboard', path: '/admin' },
    ],
  },
  {
    group: 'CONTENT',
    items: [
      { icon: '✍️', label: 'Blog Manager', path: '/admin/blog' },
      { icon: '📣', label: 'Promotions', path: '/admin/promotions' },
    ],
  },
  {
    group: 'CLIENTS',
    items: [
      { icon: '👥', label: 'All Clients', path: '/admin/clients' },
      { icon: '💬', label: 'Chat Leads', path: '/admin/leads' },
      { icon: '📧', label: 'Subscribers', path: '/admin/subscribers' },
    ],
  },
  {
    group: 'PROJECTS',
    items: [
      { icon: '📦', label: 'All Projects', path: '/admin/projects' },
      { icon: '🎵', label: 'Music Promos', path: '/admin/music' },
    ],
  },
  {
    group: 'FINANCE',
    items: [
      { icon: '🧾', label: 'Invoices', path: '/admin/invoices' },
      { icon: '💰', label: 'Payments', path: '/admin/payments' },
    ],
  },
  {
    group: 'SETTINGS',
    items: [
      { icon: '⚙️', label: 'Settings', path: '/admin/settings' },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar()
  const sidebarRef = useRef<HTMLDivElement>(null)

  const isVisible = isExpanded || isHovered || isMobileOpen

  return (
    <>
      {/* Overlay */}
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
              <span className="block text-xs text-brand-400 font-medium tracking-widest uppercase">Admin Panel</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navGroups.map(({ group, items }) => (
            <div key={group} className="mb-4">
              {isVisible && (
                <p className="mb-1 px-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  {group}
                </p>
              )}
              {items.map((item) => {
                const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path!))
                return (
                  <Link
                    key={item.label}
                    href={item.path!}
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
            </div>
          ))}
        </nav>

        {/* Footer */}
        {isVisible && (
          <div className="border-t border-gray-800 p-4">
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
