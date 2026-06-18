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
    <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.06em] text-slate-600 dark:text-slate-300">
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
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-300/25 bg-gradient-to-br from-brand-500/18 to-cyan-400/10 text-brand-200 shadow-lg shadow-brand-950/20">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">{title}</h4>
        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
  )
}

const inputClass =
  'h-12 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#0d1424] dark:text-white dark:shadow-none dark:placeholder:text-slate-500 dark:focus:border-brand-300 dark:focus:bg-[#111a2e] dark:focus:ring-brand-300/15'

const formSectionClass =
  'border-b border-slate-200/80 p-3.5 last:border-b-0 dark:border-white/10 sm:p-5'

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
    <div className="fixed inset-0 z-[10000] flex items-stretch justify-center overflow-hidden bg-slate-950/80 p-0 backdrop-blur-md sm:p-4 lg:items-center">
      <div className="relative flex h-dvh max-h-dvh w-full max-w-full flex-col overflow-hidden border-0 border-white/10 bg-slate-50 shadow-2xl shadow-brand-950/40 dark:bg-[#070b16] sm:h-auto sm:max-h-[92dvh] sm:max-w-4xl sm:rounded-2xl sm:border">
        <div className="relative shrink-0 border-b border-white/10 bg-slate-950 px-3.5 py-3.5 text-white sm:px-6 sm:py-4">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(168,85,247,0.32),transparent_34%),radial-gradient(circle_at_84%_18%,rgba(34,211,238,0.18),transparent_30%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-300/30 bg-brand-400/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-brand-100">
                  <Sparkles size={13} />
                  Music campaign
                </span>
                <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100">
                  {planType}
                </span>
              </div>
              <h3 className="text-lg font-black leading-tight tracking-tight text-white min-[380px]:text-xl sm:text-2xl">
                Submit Your Music Campaign
              </h3>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm max-[420px]:hidden">
                Share the essentials once. The PurpleSoftHub music team will use this to prepare the rollout.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close form"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white shadow-lg shadow-black/20 transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/20"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3 sm:px-5 sm:py-5">
            <div className="mx-auto max-w-3xl">
              <div className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-950/5 dark:border-white/10 dark:bg-white/[0.045] dark:shadow-none sm:mb-4 sm:rounded-2xl">
                <div className="grid gap-px bg-slate-200/80 dark:bg-white/10 min-[560px]:grid-cols-3">
                  <div className="bg-white p-3.5 dark:bg-[#0d1424] sm:p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Selected package</p>
                    <p className="mt-1 truncate text-sm font-black text-slate-950 dark:text-white">{planName}</p>
                    <p className="mt-1 text-lg font-black text-brand-600 dark:text-brand-200">{displayPlanPrice}</p>
                  </div>
                  <div className="bg-white p-3.5 dark:bg-[#0d1424] sm:p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Status</p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-extrabold text-slate-950 dark:text-white">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                        <Check size={13} />
                      </span>
                      Ready for review
                    </p>
                  </div>
                  <div className="bg-white p-3.5 dark:bg-[#0d1424] sm:p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Next step</p>
                    <p className="mt-2 text-sm font-extrabold text-slate-950 dark:text-white">Team check-in</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">We confirm links and timing.</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-400/25 bg-red-500/10 p-4 text-sm font-semibold text-red-600 dark:text-red-300">
                  {error}
                </div>
              )}

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-950/5 dark:border-white/10 dark:bg-white/[0.045] dark:shadow-none sm:rounded-2xl">
                <div className={formSectionClass}>
                  <SectionTitle
                    icon={<Music2 size={18} />}
                    title="Release"
                    subtitle="Start with the song and artist details."
                  />

                  <div className="grid gap-3.5 lg:grid-cols-2 lg:gap-4">
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
                        <UserRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          value={form.artistName}
                          onChange={e => setForm(prev => ({ ...prev, artistName: e.target.value }))}
                          placeholder="Enter artist name"
                          className={`${inputClass} pl-10`}
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
                        <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="date"
                          value={form.releaseDate}
                          onChange={e => setForm(prev => ({ ...prev, releaseDate: e.target.value }))}
                          className={`${inputClass} pl-10`}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={formSectionClass}>
                  <SectionTitle
                    icon={<Target size={18} />}
                    title="Campaign"
                    subtitle="Choose the goal and platforms for this rollout."
                  />

                  <div className="grid gap-3.5 sm:gap-4">
                    <div>
                      <FieldLabel required>Campaign goal</FieldLabel>
                      <div className="relative">
                        <Target className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                          value={form.campaignGoal}
                          onChange={e => setForm(prev => ({ ...prev, campaignGoal: e.target.value }))}
                          className={`${inputClass} appearance-none pl-10 pr-10`}
                          disabled={loading}
                        >
                          {campaignGoals.map(goal => (
                            <option key={goal} value={goal}>{goal}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <FieldLabel required>Target platforms</FieldLabel>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {form.platforms.length} selected
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 min-[430px]:grid-cols-2 lg:grid-cols-3">
                        {commonPlatforms.map(platform => {
                          const selected = form.platforms.includes(platform)

                          return (
                            <button
                              key={platform}
                              type="button"
                              onClick={() => handlePlatformToggle(platform)}
                              disabled={loading}
                              className={`group flex min-h-11 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs font-extrabold leading-4 transition focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${
                                selected
                                  ? 'border-brand-300 bg-brand-600 text-white shadow-md shadow-brand-500/20'
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

                    <div>
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

                <div className={formSectionClass}>
                  <SectionTitle
                    icon={<Link2 size={18} />}
                    title="Links"
                    subtitle="Add streaming links, smart links, or reference links if available."
                  />

                  <div className="grid gap-3.5 lg:grid-cols-2 lg:gap-4">
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

                <div className={formSectionClass}>
                  <SectionTitle
                    icon={<Mail size={18} />}
                    title="Contact"
                    subtitle="So the team can confirm campaign details quickly."
                  />

                  <div className="grid gap-3.5 lg:grid-cols-2 lg:gap-4">
                    <div>
                      <FieldLabel>Contact email</FieldLabel>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="email"
                          value={form.contactEmail}
                          onChange={e => setForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                          placeholder="artist@email.com"
                          className={`${inputClass} pl-10`}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>WhatsApp / phone</FieldLabel>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="tel"
                          value={form.contactPhone}
                          onChange={e => setForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                          placeholder="+234..."
                          className={`${inputClass} pl-10`}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={formSectionClass}>
                  <SectionTitle
                    icon={<Send size={18} />}
                    title="Notes"
                    subtitle="Add audience details, references, instructions, or anything the team should know."
                  />

                  <textarea
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Example: Focus on Afrobeats listeners in Lagos, Accra, London, and Toronto..."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#0d1424] dark:text-white dark:shadow-none dark:placeholder:text-slate-500 dark:focus:border-brand-300"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white/95 p-2.5 backdrop-blur dark:border-white/10 dark:bg-[#080d1a]/95 sm:px-5 sm:py-3">
            <div className="mx-auto flex max-w-3xl flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400 max-sm:hidden">
                Required fields are marked with <span className="font-black text-brand-400">*</span>. Your submission goes straight to the Music dashboard.
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:shrink-0 sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10 sm:px-5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 rounded-lg bg-gradient-to-r from-brand-600 via-brand-500 to-fuchsia-500 px-4 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
                >
                  {loading ? 'Submitting...' : 'Submit music'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )

  if (!mounted) return null

  return createPortal(formContent, document.body)
}
