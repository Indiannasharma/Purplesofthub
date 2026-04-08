'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardSettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile')

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    projectUpdates: true,
    marketingEmails: false,
    smsAlerts: false,
  })

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const supabase = createClient()
    const { data: { user: u } } = await supabase.auth.getUser()
    
    if (!u) {
      router.push('/sign-in')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', u.id)
      .single()

    setUser(u)
    setProfileForm({
      fullName: profile?.full_name || u.user_metadata?.full_name || '',
      email: u.email || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
    })
    setLoading(false)
  }

  const saveProfile = async () => {
    setSaving(true)
    setError('')
    const supabase = createClient()
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: profileForm.fullName,
        phone: profileForm.phone,
        bio: profileForm.bio,
      })
      .eq('id', user.id)

    if (profileError) {
      setError(profileError.message)
    } else {
      setSuccess('Profile updated ✅')
      setTimeout(() => setSuccess(''), 3000)
    }
    setSaving(false)
  }

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setError('Password must be 8+ characters')
      return
    }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error: pwError } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    })

    if (pwError) {
      setError(pwError.message)
    } else {
      setSuccess('Password changed ✅')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSuccess(''), 3000)
    }
    setSaving(false)
  }

  const saveNotifications = async () => {
    setSaving(true)
    setError('')
    const supabase = createClient()
    
    const { error } = await supabase
      .from('profiles')
      .update({
        email_notifications: notifications.emailUpdates,
        project_notifications: notifications.projectUpdates,
        marketing_emails: notifications.marketingEmails,
        sms_notifications: notifications.smsAlerts,
      })
      .eq('id', user.id)

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Notification preferences saved ✅')
      setTimeout(() => setSuccess(''), 3000)
    }
    setSaving(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
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
    display: 'block',
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--cmd-body)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: '7px',
  }

  const sectionStyle = {
    background: 'var(--cmd-card)',
    border: '1px solid rgba(124,58,237,0.15)',
    borderRadius: '16px',
    padding: '24px',
  }

  const TABS = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'security', label: '🔐 Security' },
    { id: 'notifications', label: '🔔 Notifications' },
  ]

  if (loading) return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      color: 'var(--cmd-body)',
    }}>
      Loading settings...
    </div>
  )

  return (
    <div style={{ maxWidth: '800px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 900,
          color: 'var(--cmd-heading)',
          margin: '0 0 4px',
        }}>
          Settings ⚙️
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--cmd-body)',
          margin: 0,
        }}>
          Manage your account and preferences
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#ef4444',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          ⚠️ {error}
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>×</button>
        </div>
      )}

      {success && (
        <div style={{
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#10b981',
        }}>
          {success}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '24px',
        background: 'var(--cmd-card)',
        padding: '6px',
        borderRadius: '14px',
        border: '1px solid rgba(124,58,237,0.12)',
        flexWrap: 'wrap',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--cmd-body)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #22d3ee)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 900,
              color: '#fff',
              flexShrink: 0,
              boxShadow: '0 0 20px rgba(124,58,237,0.4)',
            }}>
              {profileForm.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
            </div>
            <div>
              <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--cmd-heading)', margin: '0 0 2px' }}>
                {profileForm.fullName || 'User'}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--cmd-body)', margin: 0 }}>
                {profileForm.email}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={profileForm.fullName}
                onChange={e => setProfileForm(p => ({ ...p, fullName: e.target.value }))}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={profileForm.email}
                disabled
                style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
              />
              <p style={{ fontSize: '11px', color: 'var(--cmd-muted)', margin: '4px 0 0' }}>
                Contact support to change your email
              </p>
            </div>

            <div>
              <label style={labelStyle}>Phone Number</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+234 906 446 1786"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Bio</label>
              <textarea
                value={profileForm.bio}
                onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' as const, minHeight: '80px' }}
              />
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: saving ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
              }}
            >
              {saving ? '⏳ Saving...' : '✅ Save Profile'}
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div style={sectionStyle}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cmd-heading)', margin: '0 0 20px' }}>
            🔐 Change Password
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="Min 8 characters"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repeat password"
                style={inputStyle}
              />
            </div>

            <button
              onClick={changePassword}
              disabled={saving}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: saving ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {saving ? '⏳ Updating...' : '🔐 Change Password'}
            </button>
          </div>

          {/* Danger zone */}
          <div style={{
            marginTop: '32px',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(239,68,68,0.2)',
            background: 'rgba(239,68,68,0.04)',
          }}>
            <p style={{ fontSize: '14px', fontWeight: 800, color: '#ef4444', margin: '0 0 8px' }}>
              ⚠️ Danger Zone
            </p>
            <p style={{ fontSize: '13px', color: 'var(--cmd-body)', margin: '0 0 14px', lineHeight: 1.5 }}>
              Signing out will end your current session. You will need to log in again.
            </p>
            <button
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                router.push('/sign-in')
              }}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid rgba(239,68,68,0.3)',
                background: 'rgba(239,68,68,0.08)',
                color: '#ef4444',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div style={sectionStyle}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cmd-heading)', margin: '0 0 20px' }}>
            🔔 Notification Preferences
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'emailUpdates', label: 'Email Updates', desc: 'Receive updates about your projects via email', icon: '📧' },
              { key: 'projectUpdates', label: 'Project Updates', desc: 'Get notified when your project status changes', icon: '📦' },
              { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive news about new services and promotions', icon: '📢' },
              { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Get important alerts via SMS', icon: '📱' },
            ].map(item => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: 'rgba(124,58,237,0.04)',
                  border: '1px solid rgba(124,58,237,0.1)',
                  borderRadius: '10px',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cmd-heading)', margin: '0 0 2px' }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--cmd-body)', margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => setNotifications(p => ({ ...p, [item.key]: !p[item.key as keyof typeof notifications] }))}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '100px',
                    background: notifications[item.key as keyof typeof notifications] ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(124,58,237,0.15)',
                    position: 'relative',
                    cursor: 'pointer',
                    flexShrink: 0,
                    border: '1px solid rgba(124,58,237,0.2)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: notifications[item.key as keyof typeof notifications] ? '20px' : '2px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  }}/>
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={saveNotifications}
            disabled={saving}
            style={{
              marginTop: '20px',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: saving ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {saving ? '⏳ Saving...' : '✅ Save Preferences'}
          </button>
        </div>
      )}
    </div>
  )
}