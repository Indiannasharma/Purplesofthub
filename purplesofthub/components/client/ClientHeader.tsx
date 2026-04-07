"use client"

import { useSidebar } from '@/context/SidebarContext'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ClientHeader() {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar()
  const [email, setEmail] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email ?? '')
    })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      toggleSidebar()
    } else {
      toggleMobileSidebar()
    }
  }

  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-3 lg:px-6">
      <button
        onClick={handleToggle}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        aria-label="Toggle sidebar"
      >
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path fillRule="evenodd" clipRule="evenodd"
            d="M0.583 1C0.583 0.586 0.919 0.25 1.333 0.25H14.667C15.081 0.25 15.417 0.586 15.417 1C15.417 1.414 15.081 1.75 14.667 1.75L1.333 1.75C0.919 1.75 0.583 1.414 0.583 1ZM0.583 11C0.583 10.586 0.919 10.25 1.333 10.25L14.667 10.25C15.081 10.25 15.417 10.586 15.417 11C15.417 11.414 15.081 11.75 14.667 11.75L1.333 11.75C0.919 11.75 0.583 11.414 0.583 11ZM1.333 5.25C0.919 5.25 0.583 5.586 0.583 6C0.583 6.414 0.919 6.75 1.333 6.75L8 6.75C8.414 6.75 8.75 6.414 8.75 6C8.75 5.586 8.414 5.25 8 5.25L1.333 5.25Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <div className="hidden text-sm text-gray-400 lg:block">
        <span className="text-brand-400 font-semibold">Client Portal</span>
        <span className="mx-2 text-gray-600">/</span>
        <span>PurpleSoftHub</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {email && <span className="hidden text-xs text-gray-400 sm:block">{email}</span>}
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  )
}
