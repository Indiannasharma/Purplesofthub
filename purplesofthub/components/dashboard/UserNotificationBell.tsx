'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ───────────────────────────────────────────────────────────────────

type ActivityType = 'project' | 'invoice' | 'music' | 'recovery' | 'general'

interface ActivityItem {
  id: string
  title: string
  message: string
  type: ActivityType
  time: string
}

// ─── Config ──────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<ActivityType, { icon: string; color: string; bg: string; border: string }> = {
  project:  { icon: '📁', color: '#a855f7', bg: 'rgba(168,85,247,0.1)',  border: 'rgba(168,85,247,0.22)' },
  invoice:  { icon: '🧾', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.22)'  },
  music:    { icon: '🎵', color: '#ec4899', bg: 'rgba(236,72,153,0.1)',  border: 'rgba(236,72,153,0.22)'  },
  recovery: { icon: '🔐', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.22)'   },
  general:  { icon: '🔔', color: '#9d8fd4', bg: 'rgba(157,143,212,0.1)', border: 'rgba(157,143,212,0.2)'  },
}

const STATUS_EMOJI: Record<string, string> = {
  completed:   '✅',
  in_progress: '🔄',
  pending:     '⏳',
  cancelled:   '❌',
  paid:        '💚',
  overdue:     '🔴',
  draft:       '📝',
  approved:    '✅',
  rejected:    '❌',
  processing:  '🔄',
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1)  return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// Read state stored in localStorage so no extra DB table needed
const STORAGE_KEY = 'psw_user_notif_read'
function getReadSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}
function saveReadSet(s: Set<string>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...s])) } catch { /* noop */ }
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  userId: string
  theme?: string
}

export default function UserNotificationBell({ userId, theme = 'dark' }: Props) {
  const [open,     setOpen]     = useState(false)
  const [items,    setItems]    = useState<ActivityItem[]>([])
  const [readIds,  setReadIds]  = useState<Set<string>>(new Set())
  const [loading,  setLoading]  = useState(true)
  const [ringing,  setRinging]  = useState(false)

  const dropRef  = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const isDark = theme === 'dark'
  const unread = items.filter(i => !readIds.has(i.id)).length

  // ── Build unified activity list from DB tables ──────────────────────────────
  const loadActivity = useCallback(async () => {
    setLoading(true)

    const [
      { data: projects },
      { data: invoices },
      { data: campaigns },
      { data: recovery },
    ] = await Promise.all([
      supabase
        .from('projects')
        .select('id, title, status, updated_at, created_at')
        .eq('client_id', userId)
        .order('updated_at', { ascending: false })
        .limit(8),

      supabase
        .from('invoices')
        .select('id, amount, currency, status, created_at, updated_at')
        .eq('client_id', userId)
        .order('created_at', { ascending: false })
        .limit(8),

      supabase
        .from('music_campaigns')
        .select('id, track_title, artist_name, status, updated_at, created_at')
        .eq('client_id', userId)
        .order('updated_at', { ascending: false })
        .limit(8),

      supabase
        .from('account_recovery_requests')
        .select('id, email, status, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    const list: ActivityItem[] = []

    // Projects
    projects?.forEach(p => {
      const emoji = STATUS_EMOJI[p.status] ?? '📌'
      const isNew = new Date(p.created_at).getTime() === new Date(p.updated_at).getTime()
      list.push({
        id:      `project-${p.id}-${p.updated_at}`,
        title:   isNew ? 'Project Created 📁' : 'Project Updated 📁',
        message: `"${p.title ?? 'Untitled'}" — ${emoji} ${p.status?.replace(/_/g, ' ')}`,
        type:    'project',
        time:    p.updated_at ?? p.created_at,
      })
    })

    // Invoices
    invoices?.forEach(inv => {
      const emoji = STATUS_EMOJI[inv.status] ?? '🧾'
      const cur = inv.currency ?? 'NGN'
      const amt = inv.amount ? Number(inv.amount).toLocaleString() : '—'
      list.push({
        id:      `invoice-${inv.id}-${inv.updated_at}`,
        title:   inv.status === 'paid' ? 'Invoice Paid 💚' : `Invoice ${inv.status?.replace(/_/g, ' ') ?? ''} 🧾`,
        message: `${cur} ${amt} — ${emoji} ${inv.status?.replace(/_/g, ' ')}`,
        type:    'invoice',
        time:    inv.updated_at ?? inv.created_at,
      })
    })

    // Music campaigns
    campaigns?.forEach(c => {
      const emoji = STATUS_EMOJI[c.status] ?? '🎵'
      const isNew = new Date(c.created_at).getTime() === new Date(c.updated_at).getTime()
      list.push({
        id:      `music-${c.id}-${c.updated_at}`,
        title:   isNew ? 'Campaign Submitted 🎵' : 'Campaign Updated 🎵',
        message: `"${c.track_title ?? 'Track'}" by ${c.artist_name ?? 'You'} — ${emoji} ${c.status?.replace(/_/g, ' ')}`,
        type:    'music',
        time:    c.updated_at ?? c.created_at,
      })
    })

    // Recovery requests
    recovery?.forEach(r => {
      const emoji = STATUS_EMOJI[r.status] ?? '🔐'
      list.push({
        id:      `recovery-${r.id}-${r.updated_at ?? r.created_at}`,
        title:   'Account Recovery 🔐',
        message: `Recovery request — ${emoji} ${r.status?.replace(/_/g, ' ')}`,
        type:    'recovery',
        time:    r.updated_at ?? r.created_at,
      })
    })

    // Sort newest first, keep top 20
    list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    const top20 = list.slice(0, 20)

    setItems(top20)
    setReadIds(getReadSet())
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (userId) loadActivity()
  }, [userId, loadActivity])

  // ── Realtime subscriptions ──────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return

    const ring = () => { setRinging(true); setTimeout(() => setRinging(false), 900) }

    const projectsCh = supabase
      .channel(`user-projects-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `client_id=eq.${userId}` },
        () => { loadActivity(); ring() })
      .subscribe()

    const invoicesCh = supabase
      .channel(`user-invoices-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices', filter: `client_id=eq.${userId}` },
        () => { loadActivity(); ring() })
      .subscribe()

    const musicCh = supabase
      .channel(`user-music-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'music_campaigns', filter: `client_id=eq.${userId}` },
        () => { loadActivity(); ring() })
      .subscribe()

    return () => {
      supabase.removeChannel(projectsCh)
      supabase.removeChannel(invoicesCh)
      supabase.removeChannel(musicCh)
    }
  }, [userId, loadActivity])

  // ── Click-outside ───────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // ── Actions ─────────────────────────────────────────────────────────────────
  const markRead = (id: string) => {
    const next = new Set(readIds)
    next.add(id)
    setReadIds(next)
    saveReadSet(next)
  }

  const markAllRead = () => {
    const next = new Set(items.map(i => i.id))
    setReadIds(next)
    saveReadSet(next)
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  const borderColor = isDark ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.1)'
  const openBorderColor = 'rgba(124,58,237,0.45)'
  const textMuted = isDark ? '#9d8fd4' : '#6b7280'

  return (
    <div ref={dropRef} style={{ position: 'relative' }}>
      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Notifications"
        style={{
          width: '36px', height: '36px', borderRadius: '8px',
          border: `1px solid ${open ? openBorderColor : borderColor}`,
          background: open
            ? 'rgba(124,58,237,0.1)'
            : 'transparent',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: open ? '#a855f7' : textMuted,
          position: 'relative',
          transition: 'all 0.2s',
          flexShrink: 0,
        }}
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          style={{
            transform: ringing ? 'rotate(20deg)' : 'rotate(0deg)',
            transition: 'transform 0.1s ease',
          }}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>

        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '-3px', right: '-3px',
            minWidth: '16px', height: '16px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#ef4444,#dc2626)',
            color: '#fff', fontSize: '9px', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px', lineHeight: 1,
            boxShadow: '0 0 8px rgba(239,68,68,0.6)',
            animation: 'ubadge-pulse 2s ease-in-out infinite',
          }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 'min(320px, calc(100vw - 24px))',
          maxWidth: 'calc(100vw - 24px)',
          maxHeight: 'min(460px, calc(100vh - 120px))',
          background: isDark ? 'rgba(13,11,24,0.97)' : 'rgba(255,255,255,0.98)',
          border: `1px solid ${isDark ? 'rgba(124,58,237,0.22)' : 'rgba(124,58,237,0.15)'}`,
          borderRadius: '16px',
          boxShadow: isDark
            ? '0 20px 60px rgba(0,0,0,0.55), 0 0 30px rgba(124,58,237,0.08)'
            : '0 20px 40px rgba(0,0,0,0.12), 0 0 20px rgba(124,58,237,0.06)',
          backdropFilter: 'blur(24px)',
          zIndex: 2000,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'unotif-in 0.18s ease',
          transformOrigin: 'top right',
        }}>
          {/* Top accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg,transparent,#7c3aed,#a855f7,#7c3aed,transparent)',
          }} />

          {/* Header */}
          <div style={{
            padding: '14px 16px 12px',
            borderBottom: `1px solid ${isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.1)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: '13px', fontWeight: 700,
                color: isDark ? '#e2d9f3' : '#1a1a2e',
              }}>
                Activity
              </span>
              {unread > 0 && (
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: 100,
                  background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                  color: '#a855f7',
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
                  padding: 0, fontFamily: 'inherit', opacity: 0.85,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(124,58,237,0.08)', flexShrink: 0, animation: 'unotif-shimmer 1.4s infinite' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ height: 10, borderRadius: 5, background: 'rgba(124,58,237,0.08)', width: '65%', animation: 'unotif-shimmer 1.4s infinite' }} />
                      <div style={{ height: 8, borderRadius: 5, background: 'rgba(124,58,237,0.05)', width: '85%', animation: 'unotif-shimmer 1.4s infinite' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '34px', marginBottom: 10 }}>📭</div>
                <div style={{
                  fontSize: '13px', fontWeight: 600,
                  color: isDark ? '#4b4270' : '#9ca3af',
                  marginBottom: 4,
                }}>
                  No activity yet
                </div>
                <div style={{ fontSize: '11px', color: isDark ? '#3a3060' : '#d1d5db' }}>
                  Your project updates will appear here
                </div>
              </div>
            ) : (
              items.map((item, idx) => {
                const c = TYPE_CFG[item.type] ?? TYPE_CFG.general
                const isRead = readIds.has(item.id)
                return (
                  <div
                    key={item.id}
                    onClick={() => !isRead && markRead(item.id)}
                    style={{
                      padding: '11px 16px',
                      borderBottom: idx < items.length - 1
                        ? `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'}`
                        : 'none',
                      display: 'flex', gap: 11,
                      cursor: isRead ? 'default' : 'pointer',
                      background: isRead ? 'transparent' : (isDark ? 'rgba(124,58,237,0.04)' : 'rgba(124,58,237,0.02)'),
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => {
                      if (!isRead) (e.currentTarget as HTMLDivElement).style.background =
                        isDark ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.04)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.background =
                        isRead ? 'transparent' : (isDark ? 'rgba(124,58,237,0.04)' : 'rgba(124,58,237,0.02)')
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: c.bg, border: `1px solid ${c.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, flexShrink: 0,
                    }}>
                      {c.icon}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'baseline', gap: 6, marginBottom: 3,
                      }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: isRead ? 500 : 700,
                          color: isRead
                            ? (isDark ? '#7b6fa8' : '#9ca3af')
                            : (isDark ? '#ddd6fe' : '#1a1a2e'),
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {item.title}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          color: isDark ? '#4b4270' : '#d1d5db',
                          whiteSpace: 'nowrap', flexShrink: 0,
                        }}>
                          {timeAgo(item.time)}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '11px',
                        color: isDark ? '#5a5080' : '#9ca3af',
                        margin: 0, lineHeight: 1.5,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as const,
                      } as React.CSSProperties}>
                        {item.message}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!isRead && (
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

          {/* Footer */}
          {!loading && items.length > 0 && (
            <div style={{
              padding: '9px 16px',
              borderTop: `1px solid ${isDark ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.08)'}`,
              textAlign: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: '11px', color: isDark ? '#3d3560' : '#d1d5db' }}>
                Recent activity · updates live
              </span>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes unotif-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ubadge-pulse {
          0%,100% { box-shadow: 0 0 6px  rgba(239,68,68,0.5); }
          50%      { box-shadow: 0 0 14px rgba(239,68,68,0.85); }
        }
        @keyframes unotif-shimmer {
          0%,100% { opacity: 0.4; }
          50%     { opacity: 0.75; }
        }
      `}</style>
    </div>
  )
}
