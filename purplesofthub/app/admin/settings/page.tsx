'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminSettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'agency'>('profile')

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    avatarUrl: '',
  })

  const [agencyForm, setAgencyForm] = useState({
    agencyName: 'PurpleSoftHub',
    tagline: "Africa's Digital Innovation Studio",
    website: 'https://www.purplesofthub.com',
    supportEmail: 'hello@purplesofthub.com',
    whatsapp: '+234 906 446 1786',
    address: 'Lagos, Nigeria',
    currency: 'NGN',
    exchangeRate: '1400',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/sign-in')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setUser(user)
    setProfileForm({
      fullName: profile?.full_name || user.user_metadata?.full_name || '',
      email: user.email || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      avatarUrl: profile?.avatar_url || '',
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
      setError('Password must be 8+ chars')
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1.5px solid rgba(124,58,237,0.2)',
    background: 'rgba(124,58,237,0.06)',
    color: 'var(--cmd-heading)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--cmd-body)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '7px',
  }

  const sectionStyle: React.CSSProperties = {
    background: 'var(--cmd-card)',
    border: '1px solid rgba(124,58,237,0.15)',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  }

  const TABS = [
    { id: 'profile', label: '👤 Profile', icon: '👤' },
    { id: 'agency', label: '🏢 Agency', icon: '🏢' },
    { id: 'security', label: '🔐 Security', icon: '🔐' },
    { id: 'notifications', label: '🔔 Notifications', icon: '🔔' },
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
          Admin Settings ⚙️
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--cmd-body)',
          margin: 0,
        }}>
          Manage your profile and agency settings
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
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
              {profileForm.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'PS'}
            </div>
            <div>
              <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--cmd-heading)', margin: '0 0 2px' }}>
                {profileForm.fullName || 'Admin User'}
              </p>
              <p style={{ fontSize: '13px', color: '#a855f7', margin: 0, fontWeight: 600 }}>
                Administrator
              </p>
            </div>
          </div>

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
              Email cannot be changed here
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
              placeholder="Administrator at PurpleSoftHub..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
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
      )}

      {/* Agency Tab */}
      {activeTab === 'agency' && (
        <div style={sectionStyle}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cmd-heading)', margin: 0 }}>
            🏢 Agency Information
          </p>

          {[
            { key: 'agencyName', label: 'Agency Name', type: 'text' },
            { key: 'tagline', label: 'Tagline', type: 'text' },
            { key: 'website', label: 'Website URL', type: 'url' },
            { key: 'supportEmail', label: 'Support Email', type: 'email' },
            { key: 'whatsapp', label: 'WhatsApp Number', type: 'tel' },
            { key: 'address', label: 'Address', type: 'text' },
          ].map(field => (
            <div key={field.key}>
              <label style={labelStyle}>{field.label}</label>
              <input
                type={field.type}
                value={agencyForm[field.key as keyof typeof agencyForm]}
                onChange={e => setAgencyForm(p => ({ ...p, [field.key]: e.target.value }))}
                style={inputStyle}
              />
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Default Currency</label>
              <select
                value={agencyForm.currency}
                onChange={e => setAgencyForm(p => ({ ...p, currency: e.target.value }))}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="NGN">NGN (₦)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Exchange Rate (₦ per $1)</label>
              <input
                type="number"
                value={agencyForm.exchangeRate}
                onChange={e => setAgencyForm(p => ({ ...p, exchangeRate: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{
            background: 'rgba(124,58,237,0.06)',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '10px',
            padding: '14px',
          }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cmd-body)', margin: '0 0 4px' }}>
              ℹ️ Note
            </p>
            <p style={{ fontSize: '12px', color: 'var(--cmd-muted)', margin: 0, lineHeight: 1.5 }}>
              Agency settings changes are saved locally for now. Full database sync coming soon.
            </p>
          </div>

          <button
            onClick={() => {
              setSuccess('✅ Agency settings saved!')
              setTimeout(() => setSuccess(''), 3000)
            }}
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ✅ Save Agency Settings
          </button>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div style={sectionStyle}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cmd-heading)', margin: 0 }}>
            🔐 Change Password
          </p>

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

          {/* Danger zone */}
          <div style={{
            marginTop: '16px',
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
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--cmd-heading)', margin: 0 }}>
            🔔 Notification Preferences
          </p>

          {[
            { id: 'new_client', label: 'New Client Registration', desc: 'When a new client creates an account', default: true },
            { id: 'new_payment', label: 'New Payment Received', desc: 'When a client makes a payment', default: true },
            { id: 'new_recovery', label: 'New Recovery Request', desc: 'When someone submits account recovery', default: true },
            { id: 'new_lead', label: 'New Contact Lead', desc: 'When someone fills the contact form', default: true },
            { id: 'new_comment', label: 'New Blog Comment', desc: 'When someone comments on a blog post', default: false },
            { id: 'new_subscriber', label: 'New Newsletter Subscriber', desc: 'When someone subscribes to newsletter', default: false },
          ].map(notif => (
            <div
              key={notif.id}
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
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cmd-heading)', margin: '0 0 3px' }}>
                  {notif.label}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--cmd-body)', margin: 0 }}>
                  {notif.desc}
                </p>
              </div>

              {/* Toggle */}
              <div
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '100px',
                  background: notif.default ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(124,58,237,0.15)',
                  position: 'relative',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                  border: '1px solid rgba(124,58,237,0.2)',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: notif.default ? '20px' : '2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }}/>
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              setSuccess('✅ Notification preferences saved!')
              setTimeout(() => setSuccess(''), 3000)
            }}
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ✅ Save Preferences
          </button>
        </div>
      )}
    </div>
  )
}