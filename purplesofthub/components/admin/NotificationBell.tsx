'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Notification {
  id: string
  user_id: string | null
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

// ─── Per-type icon / colour config ───────────────────────────────────────────

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  signup:         { icon: '👤', color: '#a855f7', bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.25)' },
  recovery:       { icon: '🔐', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)'  },
  payment:        { icon: '💳', color: '#10b981', bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.25)'  },
  project:        { icon: '📁', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',    border: 'rgba(6,182,212,0.25)'   },
  music_campaign: { icon: '🎵', color: '#ec4899', bg: 'rgba(236,72,153,0.1)',   border: 'rgba(236,72,153,0.25)'  },
  general:        { icon: '🔔', color: '#9d8fd4', bg: 'rgba(157,143,212,0.1)', border: 'rgba(157,143,212,0.2)'  },
}
const fallbackCfg = TYPE_CONFIG.general

function cfg(type: string) {
  return TYPE_CONFIG[type] ?? fallbackCfg
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1)  return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  adminId: string
}

export default function NotificationBell({ adminId }: Props) {
  const [open,          setOpen]          = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread,        setUnread]        = useState(0)
  const [loading,       setLoading]       = useState(true)
  const [ringing,       setRinging]       = useState(false)

  const dropRef  = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // ── Initial load ────────────────────────────────────────────────────────────
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

  // ── Supabase Realtime ───────────────────────────────────────────────────────
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
          // Ring animation
          setRinging(true)
          setTimeout(() => setRinging(false), 900)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [adminId])

  // ── Click-outside to close ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Actions ─────────────────────────────────────────────────────────────────
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

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div ref={dropRef} style={{ position: 'relative' }}>

      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Notifications"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          border: open
            ? '1px solid rgba(124,58,237,0.45)'
            : '1px solid rgba(124,58,237,0.15)',
          background: open ? 'rgba(124,58,237,0.12)' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: open ? '#a855f7' : '#9d8fd4',
          position: 'relative',
          transition: 'all 0.2s',
          flexShrink: 0,
        }}
      >
        <svg
          width="16" height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: ringing ? 'rotate(20deg)' : 'rotate(0deg)',
            transition: 'transform 0.1s ease',
          }}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>

        {/* Unread badge */}
        {unread > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              minWidth: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#ef4444,#dc2626)',
              color: '#fff',
              fontSize: '9px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              boxShadow: '0 0 8px rgba(239,68,68,0.6)',
              lineHeight: 1,
              animation: 'notif-badge-pulse 2s ease-in-out infinite',
            }}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '44px',
            right: 0,
            width: '340px',
            maxHeight: '500px',
            background: 'rgba(11,9,22,0.97)',
            border: '1px solid rgba(124,58,237,0.22)',
            borderRadius: '16px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.08), 0 0 40px rgba(124,58,237,0.08)',
            backdropFilter: 'blur(24px)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'notif-panel-in 0.18s ease',
          }}
        >
          {/* Top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg,transparent,#7c3aed,#a855f7,#7c3aed,transparent)',
          }} />

          {/* ── Header ── */}
          <div style={{
            padding: '14px 16px 12px',
            borderBottom: '1px solid rgba(124,58,237,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2d9f3', letterSpacing: '-0.2px' }}>
                Notifications
              </span>
              {unread > 0 && (
                <span style={{
                  fontSize: '10px', fontWeight: 700,
                  background: 'rgba(124,58,237,0.18)',
                  border: '1px solid rgba(124,58,237,0.35)',
                  color: '#a855f7', padding: '2px 7px', borderRadius: 100,
                }}>
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontSize: '11px', fontWeight: 600, color: '#a855f7',
                  cursor: 'pointer', background: 'none', border: 'none',
                  padding: 0, fontFamily: 'inherit',
                  opacity: 0.85,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* ── List ── */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              /* Skeleton shimmer */
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,58,237,0.08)', flexShrink: 0, animation: 'notif-shimmer 1.4s infinite' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ height: 11, borderRadius: 6, background: 'rgba(124,58,237,0.08)', width: '70%', animation: 'notif-shimmer 1.4s infinite' }} />
                      <div style={{ height: 9, borderRadius: 6, background: 'rgba(124,58,237,0.05)', width: '90%', animation: 'notif-shimmer 1.4s infinite' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '44px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: 10 }}>🔔</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#4b4270', marginBottom: 4 }}>
                  All caught up!
                </div>
                <div style={{ fontSize: '11px', color: '#3d3560' }}>
                  New activity will appear here in real-time
                </div>
              </div>
            ) : (
              notifications.map((n, idx) => {
                const c = cfg(n.type)
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && markRead(n.id)}
                    style={{
                      padding: '11px 16px',
                      borderBottom: idx < notifications.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                      display: 'flex',
                      gap: 11,
                      cursor: n.is_read ? 'default' : 'pointer',
                      background: n.is_read
                        ? 'transparent'
                        : 'rgba(124,58,237,0.04)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!n.is_read) (e.currentTarget as HTMLDivElement).style.background = 'rgba(124,58,237,0.08)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = n.is_read ? 'transparent' : 'rgba(124,58,237,0.04)'
                    }}
                  >
                    {/* Icon box */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: c.bg,
                      border: `1px solid ${c.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, flexShrink: 0,
                    }}>
                      {c.icon}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        gap: 6,
                        marginBottom: 3,
                      }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: n.is_read ? 500 : 700,
                          color: n.is_read ? '#7b6fa8' : '#ddd6fe',
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {n.title}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          color: '#4b4270',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}>
                          {timeAgo(n.created_at)}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '11px',
                        color: '#5a5080',
                        margin: 0,
                        lineHeight: 1.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as const,
                      } as React.CSSProperties}>
                        {n.message}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!n.is_read && (
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: c.color,
                        flexShrink: 0, marginTop: 5,
                        boxShadow: `0 0 6px ${c.color}`,
                      }} />
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* ── Footer ── */}
          {!loading && notifications.length > 0 && (
            <div style={{
              padding: '10px 16px',
              borderTop: '1px solid rgba(124,58,237,0.1)',
              textAlign: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: '11px', color: '#3d3560' }}>
                Showing {notifications.length} most recent · updates in real-time
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── CSS animations ── */}
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
