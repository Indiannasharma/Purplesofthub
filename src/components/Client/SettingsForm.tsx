'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SettingsFormProps {
  userId: string
  userEmail: string
  profile: any
}

export default function SettingsForm({
  userId,
  userEmail,
  profile
}: SettingsFormProps) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    company: profile?.company || '',
    country: profile?.country || '',
    bio: profile?.bio || '',
  })

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)

    const { error: err } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone: form.phone,
        company: form.company,
        country: form.country,
        bio: form.bio,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (err) {
      setError(err.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const inputClass = `w-full px-4 py-2.5 rounded-lg border border-stroke dark:border-strokedark bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-brand-500`

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark p-6">
        <h5 className="font-semibold text-black dark:text-white mb-4">Profile Information</h5>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
            {error}
          </div>
        )}

        {saved && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 text-sm">
            ✅ Changes saved!
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-bodydark2 mb-1.5">Email</label>
            <input
              type="email"
              value={userEmail}
              disabled
              className={inputClass + ' opacity-50 cursor-not-allowed'}
            />
            <p className="text-xs text-bodydark2 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-bodydark2 mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="Your full name"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bodydark2 mb-1.5">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+234..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bodydark2 mb-1.5">Country</label>
              <input
                type="text"
                value={form.country}
                onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                placeholder="Nigeria"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-bodydark2 mb-1.5">Company / Business Name</label>
            <input
              type="text"
              value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              placeholder="Your company name"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bodydark2 mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Tell us about yourself..."
              rows={3}
              className={inputClass + ' resize-none'}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-red-500/30 bg-white shadow-sm dark:bg-boxdark p-6">
        <h5 className="font-semibold text-red-500 mb-2">Sign Out</h5>
        <p className="text-sm text-bodydark2 mb-4">
          Sign out of your PurpleSoftHub account on this device
        </p>
        <button
          onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            window.location.href = '/'
          }}
          className="px-4 py-2.5 rounded-lg border border-red-500 text-red-500 text-sm font-medium hover:bg-red-500 hover:text-white transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
