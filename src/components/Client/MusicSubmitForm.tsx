'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const PLATFORMS = [
  'Spotify',
  'Apple Music',
  'Audiomack',
  'Boomplay',
  'YouTube Music',
  'Deezer',
  'Tidal',
  'Amazon Music',
  'SoundCloud',
  'Shazam',
  'TikTok',
  'Instagram',
  'Facebook',
  'Twitter',
  'Pandora'
]

interface MusicSubmitFormProps {
  packageName: string
  priceNgn: number
  userId: string
}

export default function MusicSubmitForm({
  packageName,
  priceNgn,
  userId
}: MusicSubmitFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    track_title: '',
    artist_name: '',
    genre: '',
    release_date: '',
    music_link: '',
    notes: ''
  })
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    )
  }

  const handleSubmit = async () => {
    if (!form.track_title || !form.artist_name) {
      return
    }

    setSubmitting(true)
    const { error } = await supabase
      .from('music_campaigns')
      .insert({
        client_id: userId,
        track_title: form.track_title,
        artist_name: form.artist_name,
        genre: form.genre,
        release_date: form.release_date || null,
        music_link: form.music_link,
        notes: form.notes,
        platforms: selectedPlatforms,
        package: packageName,
        budget: priceNgn,
        status: 'pending'
      })

    if (!error) {
      setSuccess(true)
      setShowForm(false)
      setTimeout(() => {
        router.refresh()
      }, 1500)
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="w-full py-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 text-sm font-medium text-center">
        ✅ Submitted!
      </div>
    )
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-2.5 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-all"
      >
        Get Started →
      </button>
    )
  }

  return (
    <div className="space-y-3 mt-2">
      <input
        type="text"
        placeholder="Track title *"
        value={form.track_title}
        onChange={e => setForm(f => ({ ...f, track_title: e.target.value }))}
        className="w-full px-3 py-2 rounded-lg border border-stroke dark:border-strokedark bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-brand-500"
      />

      <input
        type="text"
        placeholder="Artist name *"
        value={form.artist_name}
        onChange={e => setForm(f => ({ ...f, artist_name: e.target.value }))}
        className="w-full px-3 py-2 rounded-lg border border-stroke dark:border-strokedark bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-brand-500"
      />

      <input
        type="text"
        placeholder="Genre (e.g. Afrobeats)"
        value={form.genre}
        onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
        className="w-full px-3 py-2 rounded-lg border border-stroke dark:border-strokedark bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-brand-500"
      />

      <input
        type="url"
        placeholder="Music link (Spotify, etc)"
        value={form.music_link}
        onChange={e => setForm(f => ({ ...f, music_link: e.target.value }))}
        className="w-full px-3 py-2 rounded-lg border border-stroke dark:border-strokedark bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-brand-500"
      />

      {/* Platform selection */}
      <div>
        <p className="text-xs font-medium text-bodydark2 mb-2">Select platforms:</p>
        <div className="flex flex-wrap gap-1">
          {PLATFORMS.map(platform => (
            <button
              key={platform}
              type="button"
              onClick={() => togglePlatform(platform)}
              className={`text-xs px-2 py-1 rounded-full transition-all ${
                selectedPlatforms.includes(platform)
                  ? 'bg-brand-500 text-white'
                  : 'border border-stroke dark:border-strokedark text-bodydark2 hover:border-brand-500 hover:text-brand-500'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      <textarea
        placeholder="Additional notes..."
        value={form.notes}
        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-stroke dark:border-strokedark bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-brand-500 resize-none"
      />

      <div className="flex gap-2">
        <button
          onClick={() => setShowForm(false)}
          className="flex-1 py-2 rounded-lg border border-stroke dark:border-strokedark text-xs text-bodydark2 hover:border-brand-500 hover:text-brand-500 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !form.track_title || !form.artist_name}
          className="flex-1 py-2 rounded-lg bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-all disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  )
}
