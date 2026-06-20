'use client'

import type { ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Headphones,
  Link2,
  Mail,
  Music2,
  Phone,
  Send,
  Sparkles,
  Target,
  UploadCloud,
  UserRound,
  X,
} from 'lucide-react'
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

type Step = 'release' | 'campaign' | 'assets' | 'review'

const steps: { id: Step; short: string; title: string }[] = [
  { id: 'release', short: 'Release', title: 'Release Information' },
  { id: 'campaign', short: 'Campaign', title: 'Campaign Details' },
  { id: 'assets', short: 'Assets', title: 'Assets & Links' },
  { id: 'review', short: 'Review', title: 'Review & Submit' },
]

function FieldLabel({
  children,
  required,
}: {
  children: ReactNode
  required?: boolean
}) {
  return (
    <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
      {children}
      {required && <span className="ml-1 text-brand-300">*</span>}
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
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-300/25 bg-brand-400/10 text-brand-200 shadow-[0_0_24px_rgba(168,85,247,0.14)]">
        {icon}
      </div>
      <div className="min-w-0">
        <h4 className="text-base font-black leading-tight text-slate-950 dark:text-white">{title}</h4>
        <p className="mt-1 max-w-2xl text-[13px] leading-5 text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
  )
}

function StepProgress({ currentStep }: { currentStep: Step }) {
  const currentIndex = steps.findIndex(item => item.id === currentStep)
  const progressWidth = `${(currentIndex / (steps.length - 1)) * 100}%`

  return (
    <div className="mb-4" aria-label="Submission progress">
      <div className="relative">
        <div className="absolute left-0 right-0 top-4 h-px bg-white/10" aria-hidden="true" />
        <div
          className="absolute left-0 top-4 h-px rounded-full bg-gradient-to-r from-brand-400 via-fuchsia-400 to-cyan-300 transition-all duration-500 ease-out"
          style={{ width: progressWidth }}
          aria-hidden="true"
        />
        <div className="relative grid grid-cols-4 gap-1">
          {steps.map((item, index) => {
            const active = index === currentIndex
            const complete = index < currentIndex

            return (
              <div key={item.id} className="flex min-w-0 flex-col items-center text-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black transition-all duration-300 ${
                    active
                      ? 'scale-105 border-brand-200 bg-brand-500 text-white shadow-lg shadow-brand-500/35'
                      : complete
                        ? 'border-emerald-300/40 bg-emerald-500 text-white'
                        : 'border-white/10 bg-white/[0.06] text-slate-400'
                  }`}
                >
                  {complete ? <Check size={15} /> : index + 1}
                </div>
                <span
                  className={`mt-1.5 max-w-full truncate text-[9px] font-black uppercase tracking-[0.08em] sm:text-[10px] ${
                    active ? 'text-white' : complete ? 'text-emerald-200' : 'text-slate-500'
                  }`}
                >
                  {item.short}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-2.5 py-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-100">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
        <p className="truncate text-xs font-black text-white">{value}</p>
      </div>
    </div>
  )
}

const inputClass =
  'h-11 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-950 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-brand-300 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.055] dark:text-white dark:shadow-none dark:placeholder:text-slate-500 dark:hover:border-brand-300/50 dark:hover:bg-white/[0.075] dark:focus:border-brand-300 dark:focus:bg-white/[0.08] dark:focus:ring-brand-300/15'

const iconInputClass = `${inputClass} pl-10`

const textareaClass =
  'min-h-[96px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold leading-6 text-slate-950 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-brand-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.055] dark:text-white dark:shadow-none dark:placeholder:text-slate-500 dark:hover:border-brand-300/50 dark:focus:border-brand-300'

export default function MusicSubmitForm({
  planName,
  planPrice,
  planPriceUSD,
  planType,
  onSuccess,
  onClose,
}: MusicSubmitFormProps) {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<Step>('release')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stepError, setStepError] = useState('')
  const { currency } = useCurrency()
  const displayPlanPrice = formatRegionalPrice(planPrice, planPriceUSD, currency)
  const currentIndex = steps.findIndex(item => item.id === step)
  const currentStep = steps[currentIndex]
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
    const loadUserData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setForm(prev => ({
          ...prev,
          contactEmail: user.email || prev.contactEmail,
        }))

        const { data: profile } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', user.id)
          .single()

        if (profile?.phone) {
          setForm(prev => ({
            ...prev,
            contactPhone: profile.phone,
          }))
        }
      }
    }

    loadUserData()
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

  const platformsToShow = planType === 'distribution'
    ? commonPlatforms.filter(p => !['Meta Ads', 'Influencers'].includes(p))
    : commonPlatforms

  const handlePlatformToggle = (platform: string) => {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }))
  }

  const validateStep = (currentStepId: Step): boolean => {
    setStepError('')

    switch (currentStepId) {
      case 'release':
        if (!form.trackTitle.trim()) {
          setStepError('Track title is required')
          return false
        }
        if (!form.artistName.trim()) {
          setStepError('Artist name is required')
          return false
        }
        return true

      case 'campaign':
        if (!form.campaignGoal.trim()) {
          setStepError('Select a campaign goal')
          return false
        }
        if (form.platforms.length === 0) {
          setStepError('Select at least one platform')
          return false
        }
        return true

      case 'assets':
      case 'review':
        return true

      default:
        return true
    }
  }

  const handleNext = () => {
    if (!validateStep(step)) return

    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1].id)
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1].id)
      setStepError('')
    }
  }

  const goToStep = (targetStep: Step) => {
    setStep(targetStep)
    setStepError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be signed in to submit music')
        setLoading(false)
        return
      }

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

      onSuccess?.()
      onClose()
    } catch (err: any) {
      console.error('Submit error:', err)
      setError(err.message || 'An error occurred while submitting your music')
    } finally {
      setLoading(false)
    }
  }

  const ReleaseStep = () => (
    <div className="wizard-step-panel">
      <SectionTitle
        icon={<Music2 size={18} />}
        title="Release Information"
        subtitle="Tell us what is being released and how the artist should be credited."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <div>
          <FieldLabel required>Track title</FieldLabel>
          <input
            type="text"
            value={form.trackTitle}
            onChange={e => setForm(prev => ({ ...prev, trackTitle: e.target.value }))}
            placeholder="Enter track title"
            className={inputClass}
            disabled={loading}
            autoFocus
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
              className={iconInputClass}
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
              className={iconInputClass}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const CampaignStep = () => (
    <div className="wizard-step-panel">
      <SectionTitle
        icon={<Target size={18} />}
        title="Campaign Details"
        subtitle="Choose the rollout objective, target platforms, and working budget."
      />

      <div className="grid grid-cols-1 gap-4 sm:gap-5">
        <div>
          <FieldLabel required>Campaign goal</FieldLabel>
          <div className="relative">
            <Target className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <select
              value={form.campaignGoal}
              onChange={e => setForm(prev => ({ ...prev, campaignGoal: e.target.value }))}
              className={`${iconInputClass} appearance-none pr-11`}
              disabled={loading}
            >
              {campaignGoals.map(goal => (
                <option key={goal} value={goal}>{goal}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <FieldLabel required>Target platforms</FieldLabel>
            <span className="shrink-0 text-xs font-black text-brand-200">
              {form.platforms.length} selected
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2.5 min-[390px]:grid-cols-2 lg:grid-cols-3">
            {platformsToShow.map(platform => {
              const selected = form.platforms.includes(platform)

              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => handlePlatformToggle(platform)}
                  disabled={loading}
                  aria-pressed={selected}
                  className={`group flex min-h-[48px] items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-left text-sm font-black leading-5 transition duration-200 focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                    selected
                      ? 'border-brand-300 bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                      : 'border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 dark:border-white/10 dark:bg-white/[0.055] dark:text-white dark:hover:border-brand-300/50 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  <span className="min-w-0 break-words">{platform}</span>
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                    selected
                      ? 'border-white/30 bg-white/20 text-white'
                      : 'border-slate-300 text-transparent group-hover:border-brand-300 dark:border-white/20'
                  }`}>
                    <Check size={14} />
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <FieldLabel>Budget / campaign range</FieldLabel>
          <div className="relative">
            <CircleDollarSign className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              value={form.budgetRange}
              onChange={e => setForm(prev => ({ ...prev, budgetRange: e.target.value }))}
              placeholder="Example: N150,000 promotion budget"
              className={iconInputClass}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const AssetsStep = () => (
    <div className="wizard-step-panel">
      <SectionTitle
        icon={<UploadCloud size={18} />}
        title="Assets & Links"
        subtitle="Add contact details and any links the team should use for review."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <div>
          <FieldLabel>Contact email</FieldLabel>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="email"
              value={form.contactEmail}
              onChange={e => setForm(prev => ({ ...prev, contactEmail: e.target.value }))}
              placeholder="artist@email.com"
              className={iconInputClass}
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
              className={iconInputClass}
              disabled={loading}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <FieldLabel>Song upload or smart link</FieldLabel>
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="url"
              value={form.trackUrl}
              onChange={e => setForm(prev => ({ ...prev, trackUrl: e.target.value }))}
              placeholder="https://..."
              className={iconInputClass}
              disabled={loading}
            />
          </div>
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

        <div className="sm:col-span-2">
          <FieldLabel>Notes</FieldLabel>
          <textarea
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Add audience details, references, instructions, or anything the team should know..."
            rows={4}
            className={textareaClass}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  )

  const ReviewCard = ({
    title,
    targetStep,
    children,
  }: {
    title: string
    targetStep: Step
    children: ReactNode
  }) => (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-sm transition hover:border-brand-300/30 hover:bg-white/[0.065]">
      <button
        type="button"
        onClick={() => goToStep(targetStep)}
        className="mb-3 flex min-h-[44px] w-full items-center justify-between gap-3 text-left transition hover:text-brand-200 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
      >
        <h4 className="font-black text-white">{title}</h4>
        <ArrowRight size={16} className="shrink-0 text-slate-400" />
      </button>
      <div className="space-y-1.5 text-sm leading-6 text-slate-400">{children}</div>
    </div>
  )

  const ReviewStep = () => (
    <div className="wizard-step-panel">
      <SectionTitle
        icon={<Check size={18} />}
        title="Review & Submit"
        subtitle="Confirm the campaign details before sending them to PurpleSoftHub."
      />

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        <ReviewCard title="Release Information" targetStep="release">
          <p><span className="font-bold text-white">{form.trackTitle || '-'}</span> by <span className="font-bold text-white">{form.artistName || '-'}</span></p>
          {form.genre && <p>Genre: {form.genre}</p>}
          {form.releaseDate && <p>Release: {new Date(form.releaseDate).toLocaleDateString()}</p>}
        </ReviewCard>

        <ReviewCard title="Campaign Details" targetStep="campaign">
          <p>Goal: <span className="font-bold text-white">{form.campaignGoal}</span></p>
          <p>Platforms: <span className="font-bold text-white">{form.platforms.join(', ') || '-'}</span></p>
          {form.budgetRange && <p>Budget: {form.budgetRange}</p>}
        </ReviewCard>

        <ReviewCard title="Assets & Links" targetStep="assets">
          {form.contactEmail && <p>Email: {form.contactEmail}</p>}
          {form.contactPhone && <p>Phone: {form.contactPhone}</p>}
          {(form.spotifyUrl || form.appleUrl || form.trackUrl) ? (
            <p>Links added: {[form.spotifyUrl, form.appleUrl, form.trackUrl].filter(Boolean).length}</p>
          ) : (
            <p>No links added yet.</p>
          )}
        </ReviewCard>
      </div>
    </div>
  )

  const formContent = (
    <div className="fixed inset-0 z-[10000] flex items-stretch justify-center overflow-hidden bg-slate-950/88 p-0 backdrop-blur-xl sm:p-4 lg:items-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(124,58,237,0.24),transparent_30%),radial-gradient(circle_at_88%_20%,rgba(236,72,153,0.16),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(34,211,238,0.12),transparent_34%)]" />
      <div className="relative flex h-dvh max-h-dvh w-full max-w-[940px] flex-col overflow-hidden border-0 border-white/10 bg-[#060913] shadow-2xl shadow-brand-950/50 sm:h-auto sm:max-h-[90dvh] sm:rounded-3xl sm:border">
        <div className="relative shrink-0 overflow-hidden border-b border-white/10 bg-[#080d1a]/95 px-4 py-3 text-white sm:px-5 sm:py-4">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(124,58,237,0.2),transparent_42%),linear-gradient(90deg,rgba(255,255,255,0.06),transparent)]" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-300/30 bg-brand-400/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-brand-100">
                  <Sparkles size={13} />
                  Music campaign
                </span>
                <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-cyan-100">
                  {planType}
                </span>
              </div>
              <h3 className="text-lg font-black leading-tight tracking-tight text-white sm:text-2xl">
                Submit Your Music Campaign
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close form"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white shadow-lg shadow-black/20 transition hover:scale-[1.03] hover:bg-white/15 active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/20"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 lg:px-6">
            <div className="mx-auto max-w-[840px]">
              <div className="mb-4 grid grid-cols-1 gap-2 rounded-2xl border border-white/10 bg-white/[0.045] p-2 shadow-[0_20px_80px_rgba(0,0,0,0.22)] backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
                <SummaryItem icon={<Headphones size={16} />} label="Plan" value={planName} />
                <SummaryItem icon={<CircleDollarSign size={16} />} label="Price" value={displayPlanPrice} />
                <SummaryItem icon={<Check size={16} />} label="Status" value="Ready to submit" />
                <SummaryItem icon={<Target size={16} />} label="Progress" value={`Step ${currentIndex + 1} of 4`} />
              </div>

              <StepProgress currentStep={step} />

              {(stepError || error) && (
                <div className="mb-4 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm font-bold text-red-200 shadow-lg shadow-red-950/15" role="alert">
                  {stepError || error}
                </div>
              )}

              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220]/90 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur sm:p-5">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/70 to-transparent" />
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-200">
                      Step {currentIndex + 1} of 4
                    </p>
                    <h4 className="mt-1 truncate text-base font-black text-white sm:text-lg">{currentStep.title}</h4>
                  </div>
                  <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-brand-100 sm:flex">
                    {step === 'release' && <Music2 size={18} />}
                    {step === 'campaign' && <Target size={18} />}
                    {step === 'assets' && <UploadCloud size={18} />}
                    {step === 'review' && <Check size={18} />}
                  </div>
                </div>

                {step === 'release' && <ReleaseStep />}
                {step === 'campaign' && <CampaignStep />}
                {step === 'assets' && <AssetsStep />}
                {step === 'review' && <ReviewStep />}
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-white/10 bg-[#080d1a]/95 p-3 backdrop-blur sm:px-5">
            <div className="mx-auto flex max-w-[840px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="hidden text-xs leading-5 text-slate-400 sm:block">
                {step === 'review' ? 'Review your information before submitting.' : 'Required fields are marked with *'}
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:shrink-0 sm:gap-3">
                {step !== 'release' ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-4 text-sm font-black text-white transition hover:bg-white/[0.09] active:scale-[0.98] disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-white/15"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="min-h-11 rounded-xl border border-white/10 bg-white/[0.055] px-4 text-sm font-black text-white transition hover:bg-white/[0.09] active:scale-[0.98] disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-white/15"
                  >
                    Cancel
                  </button>
                )}

                {step !== 'review' ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-fuchsia-500 px-5 text-sm font-black text-white shadow-lg shadow-brand-500/30 transition hover:-translate-y-0.5 hover:shadow-brand-500/45 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-brand-400/30"
                  >
                    <span>Next</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="col-span-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-fuchsia-500 px-5 text-sm font-black text-white shadow-lg shadow-brand-500/30 transition hover:-translate-y-0.5 hover:shadow-brand-500/45 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-brand-400/30 sm:col-span-1"
                  >
                    {loading ? 'Submitting...' : 'Submit Campaign'}
                    {!loading && <Send size={16} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      <style jsx global>{`
        @keyframes wizardFade {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .wizard-step-panel {
          animation: wizardFade 260ms ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .wizard-step-panel {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )

  if (!mounted) return null

  return createPortal(formContent, document.body)
}
