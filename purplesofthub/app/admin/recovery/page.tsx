'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface RecoveryRequest {
  id: string
  first_name: string
  last_name: string | null
  email: string
  phone: string | null
  platform: string
  support_type: string | null
  handle: string | null
  status: string
  payment_status: string | null
  amount_paid: number | null
  payment_method: string | null
  id_document_url: string | null
  screenshot_url: string | null
  admin_notes: string | null
  appeal_message: string | null
  created_at: string
}

const platformColors: Record<string, {
  color: string
  bg: string
  icon: string
}> = {
  facebook: {
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    icon: '📘',
  },
  instagram: {
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.1)',
    icon: '📸',
  },
  tiktok: {
    color: '#9d8fd4',
    bg: 'rgba(157,143,212,0.1)',
    icon: '🎵',
  },
}

export default function RecoveryRequestsPage() {
  const [requests, setRequests] = useState<RecoveryRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updatingNote, setUpdatingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [creatingRequest, setCreatingRequest] = useState(false)
  const [newRequest, setNewRequest] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    platform: 'facebook',
    handle: '',
    issueType: 'hacked',
    appealMessage: '',
    idFile: null as File | null,
    screenshotFile: null as File | null,
  })

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('account_recovery_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Recovery requests error:', error)
    }
    setRequests(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase
      .from('account_recovery_requests')
      .update({ status })
      .eq('id', id)
    setRequests(p => p.map(r => 
      r.id === id ? { ...r, status } : r
    ))
  }

  const saveNote = async (id: string) => {
    const supabase = createClient()
    await supabase
      .from('account_recovery_requests')
      .update({ admin_notes: noteText })
      .eq('id', id)
    setRequests(p => p.map(r =>
      r.id === id ? { ...r, admin_notes: noteText } : r
    ))
    setUpdatingNote(null)
    setNoteText('')
  }

  const filtered = requests.filter(r => {
    const matchSearch = 
      r.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.handle?.toLowerCase().includes(search.toLowerCase()) ||
      r.platform?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = 
      filter === 'all' || 
      r.status === filter ||
      r.platform === filter
    return matchSearch && matchFilter
  })

  const newCount = requests.filter(
    r => r.status === 'pending' || !r.status
  ).length

  const createRecoveryRequest = async () => {
    if (!newRequest.email || !newRequest.firstName || !newRequest.appealMessage) {
      alert('Please fill in required fields: Email, First Name, and Appeal Message')
      return
    }
    
    setCreatingRequest(true)
    
    try {
      const supabase = createClient()
    
    // Upload files first if they exist
    let idDocumentUrl = null
    let screenshotUrl = null

    if (newRequest.idFile) {
      const idFileName = `id_${Date.now()}_${newRequest.idFile.name.replace(/[^a-zA-Z0-9]/g, '_')}`
      const { data, error } = await supabase.storage
        .from('account-recovery-documents')
        .upload(idFileName, newRequest.idFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (!error) {
        const { data: urlData } = supabase.storage
          .from('account-recovery-documents')
          .getPublicUrl(idFileName)
        idDocumentUrl = urlData.publicUrl
      }
    }

    if (newRequest.screenshotFile) {
      const screenshotFileName = `screenshot_${Date.now()}_${newRequest.screenshotFile.name.replace(/[^a-zA-Z0-9]/g, '_')}`
      const { data, error } = await supabase.storage
        .from('account-recovery-documents')
        .upload(screenshotFileName, newRequest.screenshotFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (!error) {
        const { data: urlData } = supabase.storage
          .from('account-recovery-documents')
          .getPublicUrl(screenshotFileName)
        screenshotUrl = urlData.publicUrl
      }
    }

    // Insert request into database
    const { error } = await supabase
      .from('account_recovery_requests')
      .insert({
        email: newRequest.email,
        first_name: newRequest.firstName,
        last_name: newRequest.lastName || null,
        phone: newRequest.phone || null,
        platform: newRequest.platform,
        handle: newRequest.handle || null,
        support_type: newRequest.issueType,
        appeal_message: newRequest.appealMessage || null,
        id_document_url: idDocumentUrl,
        screenshot_url: screenshotUrl,
        status: 'pending',
        admin_notes: null,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Error creating recovery request:', error)
      alert(`Failed to create request: ${error.message}`)
    } else {
      setShowForm(false)
      loadRequests()
      setNewRequest({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        platform: 'facebook',
        handle: '',
        issueType: 'hacked',
        appealMessage: '',
        idFile: null,
        screenshotFile: null,
      })
      alert('✅ Recovery request created successfully!')
    }
    
  } catch (err: any) {
    console.error('Exception creating recovery request:', err)
    alert(`Failed to create request: ${err.message || 'Unknown error'}`)
  } finally {
    setCreatingRequest(false)
  }
}

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid rgba(124,58,237,0.2)',
    background: 'rgba(124,58,237,0.06)',
    color: 'var(--cmd-heading)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--cmd-body)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: '6px',
    display: 'block',
  }

  return (
    <div style={{ maxWidth: '1100px' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
          }}
        >
          + New Request
        </button>

        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 900,
            color: 'var(--cmd-heading)',
            margin: '0 0 4px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            Recovery Requests 🔐
            {newCount > 0 && (
              <span style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#f59e0b',
                background: 'rgba(245,158,11,0.15)',
                border: '1px solid rgba(245,158,11,0.3)',
                padding: '2px 10px',
                borderRadius: '100px',
              }}>
                {newCount} new
              </span>
            )}
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--cmd-body)',
            margin: 0,
          }}>
            {requests.length} total requests
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '14px',
        marginBottom: '24px',
      }}>
        {[
          { label: 'Total', value: requests.length, icon: '🔐', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
          { label: 'Pending', value: requests.filter(r => !r.status || r.status === 'pending').length, icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'In Progress', value: requests.filter(r => r.status === 'in_progress').length, icon: '🔄', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Completed', value: requests.filter(r => r.status === 'completed').length, icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Facebook', value: requests.filter(r => r.platform === 'facebook').length, icon: '📘', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Instagram', value: requests.filter(r => r.platform === 'instagram').length, icon: '📸', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
        ].map(stat => (
          <div key={stat.label} className="cmd-stat-card">
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: stat.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              flexShrink: 0,
            }}>
              {stat.icon}
            </div>
            <p style={{
              fontSize: '20px',
              fontWeight: 900,
              color: stat.color,
              margin: '0 0 1px',
              lineHeight: 1,
            }}>
              {loading ? '...' : stat.value}
            </p>
            <p style={{
              fontSize: '11px',
              color: 'var(--cmd-body)',
              margin: 0,
            }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Create New Request Form */}
      {showForm && (
        <div style={{
          background: 'var(--cmd-card)',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 800,
            color: 'var(--cmd-heading)',
            margin: '0 0 20px',
          }}>
            ✍️ Create Manual Recovery Request
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Client Email *</label>
              <input
                type="email"
                value={newRequest.email}
                onChange={e => setNewRequest(p => ({ ...p, email: e.target.value }))}
                placeholder="client@example.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>First Name *</label>
              <input
                type="text"
                value={newRequest.firstName}
                onChange={e => setNewRequest(p => ({ ...p, firstName: e.target.value }))}
                placeholder="John"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Last Name</label>
              <input
                type="text"
                value={newRequest.lastName}
                onChange={e => setNewRequest(p => ({ ...p, lastName: e.target.value }))}
                placeholder="Doe"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Phone</label>
              <input
                type="tel"
                value={newRequest.phone}
                onChange={e => setNewRequest(p => ({ ...p, phone: e.target.value }))}
                placeholder="+234 906 446 1786"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Platform</label>
              <select
                value={newRequest.platform}
                onChange={e => setNewRequest(p => ({ ...p, platform: e.target.value }))}
                style={inputStyle}
              >
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="twitter">Twitter/X</option>
                <option value="youtube">YouTube</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Username / Handle</label>
              <input
                type="text"
                value={newRequest.handle}
                onChange={e => setNewRequest(p => ({ ...p, handle: e.target.value }))}
                placeholder="@username"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Issue Type</label>
              <select
                value={newRequest.issueType}
                onChange={e => setNewRequest(p => ({ ...p, issueType: e.target.value }))}
                style={inputStyle}
              >
                <option value="hacked">🔓 Account Hacked</option>
                <option value="disabled">🚫 Account Disabled</option>
                <option value="suspended">⏸️ Account Suspended</option>
                <option value="banned">⛔ Account Banned</option>
                <option value="compromised">⚠️ Account Compromised</option>
                <option value="appeal">📝 Appeal Decision</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Appeal Message */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Appeal Message *</label>
              <textarea
                value={newRequest.appealMessage}
                onChange={e => setNewRequest(p => ({ ...p, appealMessage: e.target.value }))}
                placeholder="Describe when you lost access, what happened, any details that could help recover the account faster..."
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
              />
            </div>

            {/* ID Upload */}
            <div>
              <label style={labelStyle}>Upload ID Document</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) setNewRequest(p => ({ ...p, idFile: file }))
                }}
                style={{ ...inputStyle, padding: '8px' }}
              />
              {newRequest.idFile && (
                <p style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>
                  ✓ {newRequest.idFile.name}
                </p>
              )}
            </div>

            {/* Screenshot Upload */}
            <div>
              <label style={labelStyle}>Upload Screenshot (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) setNewRequest(p => ({ ...p, screenshotFile: file }))
                }}
                style={{ ...inputStyle, padding: '8px' }}
              />
              {newRequest.screenshotFile && (
                <p style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>
                  ✓ {newRequest.screenshotFile.name}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={createRecoveryRequest}
              disabled={creatingRequest}
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                background: creatingRequest 
                  ? 'rgba(124,58,237,0.5)'
                  : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: creatingRequest ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {creatingRequest ? '⏳ Creating Request...' : '✅ Create Request'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: '12px 20px',
                borderRadius: '10px',
                border: '1px solid rgba(124,58,237,0.2)',
                background: 'transparent',
                color: 'var(--cmd-body)',
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--cmd-card)',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: '10px',
          padding: '10px 14px',
          flex: 1,
          minWidth: '200px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b5fa0" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, handle..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--cmd-heading)',
              fontSize: '13px',
              width: '100%',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {['all', 'pending', 'in_progress', 'completed', 'facebook', 'instagram', 'tiktok'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: filter === f ? 'none' : '1px solid rgba(124,58,237,0.2)',
              background: filter === f ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'transparent',
              color: filter === f ? '#fff' : 'var(--cmd-body)',
              fontWeight: 600,
              fontSize: '11px',
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <div style={{
          background: 'var(--cmd-card)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          color: 'var(--cmd-body)',
        }}>
          Loading requests...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: 'var(--cmd-card)',
          border: '1px solid rgba(124,58,237,0.12)',
          borderRadius: '20px',
          padding: '60px 24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '40px', margin: '0 0 12px' }}>🔐</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--cmd-heading)', margin: '0 0 6px' }}>
            {search ? 'No requests found' : 'No recovery requests yet'}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--cmd-body)', margin: 0 }}>
            {search ? 'Try a different search' : 'Requests from the account recovery page will appear here'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(request => {
            const platform = platformColors[request.platform] || platformColors.facebook
            const isExpanded = expanded === request.id

            return (
              <div
                key={request.id}
                style={{
                  background: 'var(--cmd-card)',
                  border: '1px solid rgba(124,58,237,0.12)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                }}
              >
                {/* Card header */}
                <div
                  onClick={() => setExpanded(isExpanded ? null : request.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: platform.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0,
                    }}>
                      {platform.icon}
                    </div>

                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--cmd-heading)', margin: '0 0 3px' }}>
                        {request.first_name} {request.last_name || ''}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--cmd-body)', margin: '0 0 2px' }}>
                        {request.email}{request.phone && ` · ${request.phone}`}
                      </p>
                      {request.handle && (
                        <p style={{ fontSize: '12px', color: platform.color, margin: 0, fontWeight: 600 }}>
                          @{request.handle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: platform.color,
                      background: platform.bg,
                      padding: '3px 10px',
                      borderRadius: '100px',
                      textTransform: 'capitalize',
                    }}>
                      {request.platform}
                    </span>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: request.status === 'completed' ? '#10b981' :
                             request.status === 'in_progress' ? '#3b82f6' : '#f59e0b',
                      background: request.status === 'completed' ? 'rgba(16,185,129,0.1)' :
                                  request.status === 'in_progress' ? 'rgba(59,130,246,0.1)' :
                                  'rgba(245,158,11,0.1)',
                      border: `1px solid ${
                        request.status === 'completed' ? 'rgba(16,185,129,0.25)' :
                        request.status === 'in_progress' ? 'rgba(59,130,246,0.25)' :
                        'rgba(245,158,11,0.25)'
                      }`,
                      padding: '3px 10px',
                      borderRadius: '100px',
                    }}>
                      {request.status === 'completed' ? '✅ Completed' :
                       request.status === 'in_progress' ? '🔄 In Progress' : '⏳ Pending'}
                    </span>

                    {request.amount_paid && (
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>
                        ₦{request.amount_paid.toLocaleString()}
                      </span>
                    )}

                    <span style={{ fontSize: '11px', color: 'var(--cmd-muted)' }}>
                      {new Date(request.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                    </span>

                    <span style={{
                      color: 'var(--cmd-muted)',
                      fontSize: '18px',
                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                      display: 'inline-block',
                    }}>
                      ⌄
                    </span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{
                    padding: '20px',
                    borderTop: '1px solid rgba(124,58,237,0.1)',
                    background: 'rgba(124,58,237,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}>
                    {request.support_type && (
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cmd-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>
                          Issue Type
                        </p>
                        <p style={{ fontSize: '14px', color: 'var(--cmd-heading)', margin: 0, textTransform: 'capitalize' }}>
                          {request.support_type.replace('_', ' ')}
                        </p>
                      </div>
                    )}

                    {/* Appeal Message (Read-only) */}
                    {request.appeal_message && (
                      <div style={{
                        background: 'rgba(34,211,238,0.06)',
                        border: '1px solid rgba(34,211,238,0.2)',
                        borderRadius: '12px',
                        padding: '16px',
                      }}>
                        <p style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#22d3ee',
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                          margin: '0 0 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}>
                          📝 User Appeal Message
                        </p>
                        <p style={{
                          fontSize: '14px',
                          color: 'var(--cmd-heading)',
                          lineHeight: 1.6,
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}>
                          {request.appeal_message}
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {request.id_document_url && (
                        <a href={request.id_document_url} target="_blank" rel="noopener noreferrer" style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '8px 16px', background: 'rgba(124,58,237,0.1)',
                          border: '1px solid rgba(124,58,237,0.2)', color: '#a855f7',
                          textDecoration: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                        }}>
                          🪪 View ID Document
                        </a>
                      )}
                      {request.screenshot_url && (
                        <a href={request.screenshot_url} target="_blank" rel="noopener noreferrer" style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '8px 16px', background: 'rgba(34,211,238,0.08)',
                          border: '1px solid rgba(34,211,238,0.2)', color: '#22d3ee',
                          textDecoration: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                        }}>
                          📸 View Screenshot
                        </a>
                      )}
                    </div>

                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cmd-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>
                        Admin Notes
                      </p>
                      {updatingNote === request.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <textarea
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            rows={3}
                            style={{
                              width: '100%', padding: '10px', borderRadius: '8px',
                              border: '1px solid rgba(124,58,237,0.25)',
                              background: 'rgba(124,58,237,0.06)',
                              color: 'var(--cmd-heading)', fontFamily: 'inherit',
                              fontSize: '13px', outline: 'none', resize: 'vertical',
                              boxSizing: 'border-box',
                            }}
                          />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => saveNote(request.id)} style={{
                              padding: '7px 16px', borderRadius: '8px', border: 'none',
                              background: '#7c3aed', color: '#fff', fontSize: '12px',
                              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                            }}>
                              Save Note
                            </button>
                            <button onClick={() => setUpdatingNote(null)} style={{
                              padding: '7px 14px', borderRadius: '8px',
                              border: '1px solid rgba(124,58,237,0.2)',
                              background: 'transparent', color: 'var(--cmd-body)',
                              fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
                            }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setUpdatingNote(request.id)
                            setNoteText(request.admin_notes || '')
                          }}
                          style={{
                            padding: '10px 14px', borderRadius: '8px',
                            background: 'rgba(124,58,237,0.04)',
                            border: '1px dashed rgba(124,58,237,0.2)',
                            cursor: 'pointer', minHeight: '40px',
                          }}
                        >
                          <p style={{
                            fontSize: '13px', color: request.admin_notes ? 'var(--cmd-body)' : 'var(--cmd-muted)',
                            margin: 0, fontStyle: request.admin_notes ? 'normal' : 'italic',
                          }}>
                            {request.admin_notes || 'Click to add notes...'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div style={{
                      display: 'flex', gap: '8px', flexWrap: 'wrap',
                      paddingTop: '8px', borderTop: '1px solid rgba(124,58,237,0.1)',
                    }}>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cmd-muted)', margin: '0 8px 0 0', alignSelf: 'center' }}>
                        Update Status:
                      </p>
                      {[
                        { status: 'pending', label: '⏳ Pending', color: '#f59e0b' },
                        { status: 'in_progress', label: '🔄 In Progress', color: '#3b82f6' },
                        { status: 'completed', label: '✅ Completed', color: '#10b981' },
                        { status: 'rejected', label: '❌ Rejected', color: '#ef4444' },
                      ].map(btn => (
                        <button
                          key={btn.status}
                          onClick={() => updateStatus(request.id, btn.status)}
                          style={{
                            padding: '7px 14px', borderRadius: '8px',
                            border: request.status === btn.status ? 'none' : '1px solid rgba(124,58,237,0.2)',
                            background: request.status === btn.status ? btn.color : 'transparent',
                            color: request.status === btn.status ? '#fff' : 'var(--cmd-body)',
                            fontSize: '12px', fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'all 0.2s',
                          }}
                        >
                          {btn.label}
                        </button>
                      ))}

                      <a href={`mailto:${request.email}?subject=Re: ${request.platform} Account Recovery Request`}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '7px 14px', background: 'rgba(124,58,237,0.1)',
                          border: '1px solid rgba(124,58,237,0.2)', color: '#a855f7',
                          textDecoration: 'none', borderRadius: '8px',
                          fontSize: '12px', fontWeight: 600, marginLeft: 'auto',
                        }}>
                        📧 Reply via Email
                      </a>

                      {request.phone && (
                        <a href={`https://wa.me/${request.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '7px 14px', background: 'rgba(37,211,102,0.1)',
                            border: '1px solid rgba(37,211,102,0.2)', color: '#25D366',
                            textDecoration: 'none', borderRadius: '8px',
                            fontSize: '12px', fontWeight: 600,
                          }}>
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}