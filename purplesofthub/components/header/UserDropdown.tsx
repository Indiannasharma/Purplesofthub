'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function UserDropdown() {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [user, setUser] = useState<{
    name: string
    email: string
    avatar: string | null
    role: string
  } | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'User'

        setUser({
          name: fullName,
          email: user.email || '',
          avatar: user.user_metadata?.avatar_url || null,
          role: user.user_metadata?.role || 'client'
        })
      }
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-meta-4 transition-colors duration-200"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{user ? getInitials(user.name) : '...'}</span>
          )}
        </div>

        <div className="hidden xl:block text-left">
          <span className="block text-sm font-semibold text-black dark:text-white">
            {user?.name || 'Loading...'}
          </span>
          <span className="block text-xs text-bodydark2 truncate max-w-[140px]">
            {user?.email || ''}
          </span>
        </div>

        <svg
          className={`hidden xl:block w-4 h-4 text-bodydark2 transition-transform duration-200 ${
            dropdownOpen ? 'rotate-180' : ''
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {dropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
          />

          <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-stroke dark:border-strokedark bg-gray-50 dark:bg-meta-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <span>{user ? getInitials(user.name) : '?'}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-black dark:text-white truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-bodydark2 truncate">
                    {user?.email || ''}
                  </p>
                  <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 capitalize">
                    {user?.role || 'client'}
                  </span>
                </div>
              </div>
            </div>

            <div className="py-2">
              <Link
                href="/dashboard/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-5 py-3 text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors"
              >
                <svg className="w-4 h-4 text-bodydark2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Edit Profile
              </Link>

              <Link
                href="/dashboard/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-5 py-3 text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors"
              >
                <svg className="w-4 h-4 text-bodydark2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Account Settings
              </Link>

              <Link
                href="/contact"
                target="_blank"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-5 py-3 text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors"
              >
                <svg className="w-4 h-4 text-bodydark2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Support
              </Link>
            </div>

            <div className="border-t border-stroke dark:border-strokedark py-2">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-5 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
