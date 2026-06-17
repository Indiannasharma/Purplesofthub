'use client'

import type { ReactNode } from 'react'
import { CalendarDays, Check, ChevronDown, Link2, Mail, Music2, Phone, Send, Sparkles, Target, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { useCurrency } from '@/context/CurrencyContext'
import { formatRegionalPrice } from '@/lib/pricing/currency'

interface MusicSubmitFormProps {
  planName: string
  planPrice: number
  planPriceUSD: number
  planType: 'promotion' | 'distribution'
  onSuccess?: () => void
  onClose: () => void
}

function FieldLabel({
  children,
  required,
}: {
  children: ReactNode
  required?: boolean
}) {
  return (
    <label className="mb-2 block text-[12px] font-black uppercase tracking-[0.08em] text-slate-700 dark:text-slate-200">
      {children}
      {required && <span className="ml-1 text-brand-400">*</span>}
    </label>
  )
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-300/25 bg-gradient-to-br from-brand-500/20 to-cyan-400/10 text-brand-200 shadow-lg shadow-brand-950/20">
        {icon}
      </div>
      <div>
        <h4 className="text-[15px] font-black text-slate-950 dark:text-white">{title}</h4>
        <p className="mt-1 text-[13px] leading-5 text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
  )
}

const inputClass =
  'h-[52px] w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] font-bold text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#0d1424] dark:text-white dark:shadow-none dark:placeholder:text-slate-500 dark:focus:border-brand-300 dark:focus:bg-[#111a2e] dark:focus:ring-brand-300/15'

const panelClass =
  'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/5 dark:border-white/10 dark:bg-white/[0.045] dark:shadow-none sm:p-5'

export default function MusicSubmitForm({
  planName,
  planPrice,
  planPriceUSD,
  planType,
  onSuccess,
  onClose,
}: MusicSubmitFormProps) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { currency } = useCurrency()
  const displayPlanPrice = formatRegionalPrice(planPrice, planPriceUSD, currency)
  const [form, setForm] = useState({
    trackTitle: '',
    artistName: '',
    genre: '',
    releaseDate: '',
    trackUrl: '',
    spotifyUrl: '',
    appleUrl: '',
    contactEmail: '',
    contactPhone: '',
    campaignGoal: planType === 'distribution' ? 'Music distribution' : 'Music promotion',
    budgetRange: '',
    description: '',
    platforms: [] as string[],
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const commonPlatforms = [
    'Spotify',
    'Apple Music',
    'YouTube Music',
    'Amazon Music',
    'Tidal',
    'SoundCloud',
    'Deezer',
    'TikTok',
    'Instagram',
    'Meta Ads',
    'Influencers',
    'All major platforms',
  ]

  const campaignGoals = planType === 'distribution'
    ? ['Music distribution', 'Single release', 'EP/Album release', 'Yearly artist plan', 'Label distribution']
    : ['Spotify promotion', 'Influencer promotion', 'YouTube promotion', 'Meta ads promotion', 'Full rollout campaign']

  const handlePlatformToggle = (platform: string) => {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate required fields
      if (!form.trackTitle.trim()) {
        setError('Track title is required')
        setLoading(false)
        return
      }

      if (!form.artistName.trim()) {
        setError('Artist name is required')
        setLoading(false)
        return
      }

      if (!form.campaignGoal.trim()) {
        setError('Select a campaign goal')
        setLoading(false)
        return
      }

      if (form.platforms.length === 0) {
        setError('Select at least one platform')
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be signed in to submit music')
        setLoading(false)
        return
      }

      // Submit to database
      const { error: dbError } = await supabase
        .from('music_campaigns')
        .insert({
          client_id: user.id,
          track_title: form.trackTitle.trim(),
          artist_name: form.artistName.trim(),
          track_url: form.trackUrl.trim() || form.spotifyUrl.trim() || form.appleUrl.trim() || 'Pending upload',
          campaign_type: form.campaignGoal.trim(),
          genre: form.genre.trim() || null,
          release_date: form.releaseDate || null,
          spotify_url: form.spotifyUrl.trim() || null,
          apple_url: form.appleUrl.trim() || null,
          contact_email: form.contactEmail.trim() || user.email || null,
          contact_phone: form.contactPhone.trim() || null,
          campaign_goal: form.campaignGoal.trim(),
          budget_range: form.budgetRange.trim() || null,
          description: form.description.trim() || null,
          platforms: form.platforms,
          plan_name: planName,
          plan_type: planType,
          plan_price: planPrice,
          status: 'pending',
          created_at: new Date().toISOString(),
        })

      if (dbError) {
        console.error('Database error:', dbError)
        setError(dbError.message || 'Failed to submit music campaign')
        setLoading(false)
        return
      }

      // Success
      onSuccess?.()
      onClose()
    } catch (err: any) {
      console.error('Submit error:', err)
      setError(err.message || 'An error occurred while submitting your music')
    } finally {
      setLoading(false)
    }
  }

  const formContent = (
    <div className="fixed inset-0 z-[10000] flex items-stretch justify-center overflow-hidden bg-slate-950/80 p-0 backdrop-blur-md sm:p-5 lg:items-center">
      <div className="relative flex h-dvh max-h-dvh w-full max-w-full flex-col overflow-hidden border-0 border-white/10 bg-white shadow-2xl shadow-brand-950/40 dark:bg-[#080d1a] sm:h-auto sm:max-h-[92dvh] sm:max-w-6xl sm:rounded-[22px] sm:border">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_18%_0%,rgba(168,85,247,0.42),transparent_36%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.22),transparent_34%),linear-gradient(135deg,rgba(124,58,237,0.14),transparent_42%)]" />

        <div className="relative border-b border-white/10 bg-slate-950/95 px-4 py-4 text-white sm:px-7 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-300/30 bg-brand-400/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-brand-100">
                  <Sparkles size={13} />
                  Artist intake
                </span>
                <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100">
                  {planType}
                </span>
              </div>
              <h3 className="max-w-3xl text-2xl font-black leading-none tracking-tight text-white sm:text-4xl">
                Submit your music campaign
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 max-sm:hidden">
                Send us the release details, platform links, contact information, and campaign target so the team can prepare your rollout properly.
              </p>
              <p className="mt-2 max-w-[18rem] truncate text-xs font-bold text-slate-300 sm:hidden">
                {planName} · {displayPlanPrice}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close form"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white shadow-lg shadow-black/20 transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/20"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-6 hidden gap-3 sm:grid sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Plan</p>
              <p className="mt-1 truncate text-base font-black text-white">{planName}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Package</p>
              <p className="mt-1 text-base font-black text-white">{displayPlanPrice}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Status</p>
              <p className="mt-1 inline-flex items-center gap-2 text-base font-black text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]" />
                Ready for review
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-3 dark:bg-[#070b16] sm:p-6">
            {error && (
              <div className="mb-4 rounded-xl border border-red-400/25 bg-red-500/10 p-4 text-sm font-semibold text-red-600 dark:text-red-300 sm:mb-5">
                {error}
              </div>
            )}

            <div className="mx-auto grid max-w-5xl gap-4 sm:gap-5">
              <div className={panelClass}>
                <SectionTitle
                  icon={<Music2 size={18} />}
                  title="Release details"
                  subtitle="Tell us what you are submitting and the exact campaign direction."
                />

                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <FieldLabel required>Track title</FieldLabel>
                    <input
                      type="text"
                      value={form.trackTitle}
                      onChange={e => setForm(prev => ({ ...prev, trackTitle: e.target.value }))}
                      placeholder="Enter your track title"
                      className={inputClass}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <FieldLabel required>Artist name</FieldLabel>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                      <input
                        type="text"
                        value={form.artistName}
                        onChange={e => setForm(prev => ({ ...prev, artistName: e.target.value }))}
                        placeholder="Enter artist name"
                        className={`${inputClass} pl-11`}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Genre</FieldLabel>
                    <input
                      type="text"
                      value={form.genre}
                      onChange={e => setForm(prev => ({ ...prev, genre: e.target.value }))}
                      placeholder="Afrobeats, Hip-Hop, Amapiano"
                      className={inputClass}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <FieldLabel>Release date</FieldLabel>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                      <input
                        type="date"
                        value={form.releaseDate}
                        onChange={e => setForm(prev => ({ ...prev, releaseDate: e.target.value }))}
                        className={`${inputClass} pl-11`}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <FieldLabel required>Campaign goal</FieldLabel>
                    <div className="relative">
                      <Target className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                      <select
                        value={form.campaignGoal}
                        onChange={e => setForm(prev => ({ ...prev, campaignGoal: e.target.value }))}
                        className={`${inputClass} appearance-none pl-11 pr-11`}
                        disabled={loading}
                      >
                        {campaignGoals.map(goal => (
                          <option key={goal} value={goal}>{goal}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    </div>
                  </div>
                </div>
              </div>

              <div className={panelClass}>
                <SectionTitle
                  icon={<Link2 size={18} />}
                  title="Music links"
                  subtitle="Add existing streaming links, smart links, or upload references if available."
                />

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <FieldLabel>Song upload or smart link</FieldLabel>
                    <input
                      type="url"
                      value={form.trackUrl}
                      onChange={e => setForm(prev => ({ ...prev, trackUrl: e.target.value }))}
                      placeholder="https://..."
                      className={inputClass}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <FieldLabel>Spotify URL</FieldLabel>
                    <input
                      type="url"
                      value={form.spotifyUrl}
                      onChange={e => setForm(prev => ({ ...prev, spotifyUrl: e.target.value }))}
                      placeholder="https://open.spotify.com/..."
                      className={inputClass}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <FieldLabel>Apple Music URL</FieldLabel>
                    <input
                      type="url"
                      value={form.appleUrl}
                      onChange={e => setForm(prev => ({ ...prev, appleUrl: e.target.value }))}
                      placeholder="https://music.apple.com/..."
                      className={inputClass}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className={panelClass}>
                <SectionTitle
                  icon={<Mail size={18} />}
                  title="Contact and budget"
                  subtitle="This helps the team confirm campaign scope and follow up fast."
                />

                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <FieldLabel>Contact email</FieldLabel>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                      <input
                        type="email"
                        value={form.contactEmail}
                        onChange={e => setForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                        placeholder="artist@email.com"
                        className={`${inputClass} pl-11`}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>WhatsApp / phone</FieldLabel>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                      <input
                        type="tel"
                        value={form.contactPhone}
                        onChange={e => setForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                        placeholder="+234..."
                        className={`${inputClass} pl-11`}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <FieldLabel>Budget / campaign range</FieldLabel>
                    <input
                      type="text"
                      value={form.budgetRange}
                      onChange={e => setForm(prev => ({ ...prev, budgetRange: e.target.value }))}
                      placeholder="Example: N150,000 promotion budget or distribution only"
                      className={inputClass}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className={panelClass}>
                <SectionTitle
                  icon={<Sparkles size={18} />}
                  title="Target platforms"
                  subtitle="Select every platform or channel you want included in the release or campaign."
                />

                <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3">
                  {commonPlatforms.map(platform => {
                    const selected = form.platforms.includes(platform)

                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => handlePlatformToggle(platform)}
                        disabled={loading}
                        className={`group flex min-h-12 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                          selected
                            ? 'border-brand-300 bg-gradient-to-r from-brand-600 to-fuchsia-500 text-white shadow-lg shadow-brand-500/25'
                            : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-brand-300 hover:bg-brand-50 dark:border-white/10 dark:bg-[#0d1424] dark:text-white dark:hover:border-brand-300/50 dark:hover:bg-brand-500/10'
                        }`}
                      >
                        <span className="min-w-0 break-words">{platform}</span>
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                          selected
                            ? 'border-white/30 bg-white/20 text-white'
                            : 'border-slate-300 text-transparent group-hover:border-brand-300 dark:border-white/20'
                        }`}>
                          <Check size={13} />
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className={panelClass}>
                <SectionTitle
                  icon={<Send size={18} />}
                  title="Campaign notes"
                  subtitle="Add references, release instructions, audience details, or anything the team should know."
                />

                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Example: Focus on Afrobeats listeners in Lagos, Accra, London, and Toronto..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] font-semibold text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#0d1424] dark:text-white dark:shadow-none dark:placeholder:text-slate-500 dark:focus:border-brand-300"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-200 bg-white/95 p-3 backdrop-blur dark:border-white/10 dark:bg-[#080d1a]/95 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400 max-sm:hidden">
              Required fields are marked with <span className="font-black text-brand-400">*</span>. Your submission goes straight to the Music dashboard.
            </p>
            <div className="flex gap-3 sm:shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="h-12 flex-1 rounded-xl border border-slate-200 px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10 sm:flex-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-12 flex-1 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-fuchsia-500 px-6 text-sm font-black text-white shadow-lg shadow-brand-500/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              >
                {loading ? 'Submitting...' : 'Submit music'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )

  if (!mounted) return null

  return createPortal(formContent, document.body)
}
