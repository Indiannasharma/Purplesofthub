'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Notification {
  id: string
  title: string
  message: string
  type: 'order' | 'project' | 'invoice' | 'system'
  read: boolean
  created_at: string
  link?: string
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error || !data || data.length === 0) {
        setNotifications([{
          id: '1',
          title: 'Welcome to PurpleSoftHub!',
          message: 'Your dashboard is ready. Explore your services and projects.',
          type: 'system',
          read: false,
          created_at: new Date().toISOString(),
          link: '/dashboard'
        }])
      } else {
        setNotifications(data)
      }
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
    }

    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getIcon = (type: string) => {
    switch(type) {
      case 'order': return '🛒'
      case 'project': return '📁'
      case 'invoice': return '💳'
      default: return '🔔'
    }
  }

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-meta-4 transition-colors"
      >
        <svg className="w-5 h-5 text-black dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark shadow-xl overflow-hidden">

            <div className="flex items-center justify-between px-5 py-4 border-b border-stroke dark:border-strokedark">
              <h5 className="font-semibold text-black dark:text-white">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                    {unreadCount} new
                  </span>
                )}
              </h5>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-purple-500 hover:text-purple-700 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="py-8 text-center text-sm text-bodydark2">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-3xl mb-2">🔔</p>
                  <p className="text-sm text-bodydark2">
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`flex gap-3 px-5 py-4 border-b border-stroke dark:border-strokedark last:border-0 hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors ${
                      !notif.read ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black dark:text-white truncate">
                        {notif.title}
                      </p>
                      <p className="text-xs text-bodydark2 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-bodydark2 mt-1">
                        {getTimeAgo(notif.created_at)}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="px-5 py-3 border-t border-stroke dark:border-strokedark text-center">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="text-sm text-purple-500 hover:text-purple-700 font-medium"
              >
                View all notifications →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
