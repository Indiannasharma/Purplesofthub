'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// --- Types -------------------------------------------------------------------

interface Notification {
  id: string
  user_id: string | null
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

// --- Per-type icon / tint config ---------------------------------------------

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  signup:         { icon: '👤', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)' },
  recovery:       { icon: '🔐', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)'  },
  payment:        { icon: '💳', color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)'  },
  project:        { icon: '📁', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.25)'   },
  music_campaign: { icon: '🎵', color: '#ec4899', bg: 'rgba(236,72,153,0.1)',  border: 'rgba(236,72,153,0.25)'  },
  general:        { icon: '🔔', color: '#9d8fd4', bg: 'rgba(157,143,212,0.1)', border: 'rgba(157,143,212,0.2)'  },
}
const fallbackCfg = TYPE_CONFIG.general

function cfg(type: string) {
  return TYPE_CONFIG[type] ?? fallbackCfg
}

// --- Helpers -----------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1)  return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// --- Component ---------------------------------------------------------------

interface Props {
  adminId: string
}

/**
 * Admin notification bell — Command Center presentation.
 *
 * Behaviour is unchanged from the previous admin shell: initial 30-row fetch,
 * Supabase Realtime INSERT subscription, click-outside dismissal, per-item
 * mark-as-read and mark-all-read. Only the presentation moved from hardcoded
 * dark hex values to the shared `--cc-*` tokens, so the panel is legible in
 * BOTH light and dark themes (the old panel was dark in light mode too).
 */
export default function NotificationBell({ adminId }: Props) {
  const [open,          setOpen]          = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread,        setUnread]        = useState(0)
  const [loading,       setLoading]       = useState(true)
  const [ringing,       setRinging]       = useState(false)

  const dropRef  = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // -- Initial load -----------------------------------------------------------
  const loadNotifications = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false })
      .limit(30)

    if (data) {
      setNotifications(data)
      setUnread(data.filter((n: Notification) => !n.is_read).length)
    }
    setLoading(false)
  }, [adminId])

  useEffect(() => {
    if (adminId) loadNotifications()
  }, [adminId, loadNotifications])

  // -- Supabase Realtime ------------------------------------------------------
  useEffect(() => {
    if (!adminId) return

    const channel = supabase
      .channel(`admin-notifs-${adminId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'notifications',
          filter: `admin_id=eq.${adminId}`,
        },
        (payload) => {
          const n = payload.new as Notification
          setNotifications(prev => [n, ...prev].slice(0, 30))
          setUnread(prev => prev + 1)
          setRinging(true)
          setTimeout(() => setRinging(false), 900)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [adminId])

  // -- Click-outside to close -------------------------------------------------
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // -- Actions ----------------------------------------------------------------
  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
  }

  const markAllRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('admin_id', adminId)
      .eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnread(0)
  }

  // -- Render -----------------------------------------------------------------
  return (
    <div ref={dropRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        title="Notifications"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="true"
        className={`cc-icon-btn cc-icon-btn-sm relative ${
          open ? 'bg-[var(--cc-subtle)] text-[var(--cc-text)]' : ''
        }`}
      >
        <Bell
          className="h-[18px] w-[18px]"
          aria-hidden="true"
          style={{
            transform: ringing ? 'rotate(20deg)' : 'rotate(0deg)',
            transition: 'transform 0.1s ease',
          }}
        />

        {unread > 0 && (
          <span
            className="cc-tnum absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--cc-error)] px-1 text-[9px] font-extrabold leading-none text-white"
            style={{ animation: 'notif-badge-pulse 2s ease-in-out infinite' }}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="region"
          aria-label="Recent notifications"
          className="absolute right-0 top-full z-50 mt-2 flex w-[min(340px,calc(100vw_-_24px))] max-w-[calc(100vw_-_24px)] flex-col overflow-hidden rounded-xl border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-xl"
          style={{
            maxHeight: 'min(500px, calc(100vh - 120px))',
            animation: 'notif-panel-in 0.18s ease',
            transformOrigin: 'top right',
          }}
        >
          <div className="cc-hairline-bottom flex shrink-0 items-center justify-between gap-2 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-[var(--cc-text)]">Notifications</span>
              {unread > 0 && (
                <span className="cc-tnum rounded-full bg-[var(--cc-accent-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--cc-accent)]">
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[11px] font-semibold text-[var(--cc-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-accent)]"
              >
                Mark all read
              </button>
            )}
          </div>


          <div className="cc-scroll min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col gap-2.5 p-4" aria-hidden="true">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div
                      className="h-9 w-9 shrink-0 rounded-lg bg-[var(--cc-subtle)]"
                      style={{ animation: 'notif-shimmer 1.4s infinite' }}
                    />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <div
                        className="h-2.5 w-[70%] rounded-md bg-[var(--cc-subtle)]"
                        style={{ animation: 'notif-shimmer 1.4s infinite' }}
                      />
                      <div
                        className="h-2 w-[90%] rounded-md bg-[var(--cc-subtle)]"
                        style={{ animation: 'notif-shimmer 1.4s infinite' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-11 text-center">
                <p className="text-3xl" aria-hidden="true">🔔</p>
                <p className="mt-2.5 text-[13px] font-semibold text-[var(--cc-text-secondary)]">
                  All caught up!
                </p>
                <p className="mt-1 text-[11px] text-[var(--cc-text-muted)]">
                  New activity will appear here in real-time
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const c = cfg(n.type)
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && markRead(n.id)}
                    className={`cc-hairline-bottom flex gap-2.5 px-4 py-3 transition-colors last:border-b-0 ${
                      n.is_read ? '' : 'cursor-pointer bg-[var(--cc-accent-soft)]'
                    }`}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base"
                      style={{ background: c.bg, border: `1px solid ${c.border}` }}
                      aria-hidden="true"
                    >
                      {c.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-1.5">
                        <span
                          className={`truncate text-xs leading-4 ${
                            n.is_read
                              ? 'font-medium text-[var(--cc-text-muted)]'
                              : 'font-semibold text-[var(--cc-text)]'
                          }`}
                        >
                          {n.title}
                        </span>
                        <span className="cc-tnum shrink-0 text-[10px] text-[var(--cc-text-muted)]">
                          {timeAgo(n.created_at)}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-[var(--cc-text-muted)]">
                        {n.message}
                      </p>
                    </div>

                    {!n.is_read && (
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: c.color }}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                )
              })
            )}
          </div>


          {!loading && notifications.length > 0 && (
            <div className="cc-hairline-top shrink-0 px-4 py-2.5 text-center">
              <span className="cc-tnum text-[11px] text-[var(--cc-text-muted)]">
                Showing {notifications.length} most recent · updates in real-time
              </span>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes notif-panel-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes notif-badge-pulse {
          0%,100% { box-shadow: 0 0 6px  rgba(239,68,68,0.5); }
          50%     { box-shadow: 0 0 14px rgba(239,68,68,0.85); }
        }
        @keyframes notif-shimmer {
          0%   { opacity: 0.4; }
          50%  { opacity: 0.8; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
