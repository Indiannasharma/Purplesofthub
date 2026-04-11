'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface MusicSubmitFormProps {
  planName: string
  planPrice: number
  planType: 'promotion' | 'distribution'
  onSuccess?: () => void
  onClose: () => void
}

export default function MusicSubmitForm({
  planName,
  planPrice,
  planType,
  onSuccess,
  onClose,
}: MusicSubmitFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    trackTitle: '',
    artistName: '',
    genre: '',
    releaseDate: '',
    spotifyUrl: '',
    appleUrl: '',
    description: '',
    platforms: [] as string[],
  })

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
  ]

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
          genre: form.genre.trim() || null,
          release_date: form.releaseDate || null,
          spotify_url: form.spotifyUrl.trim() || null,
          apple_url: form.appleUrl.trim() || null,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-boxdark max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 border-b border-stroke bg-gray-50 px-6 py-4 dark:border-strokedark dark:bg-boxdark-2 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white">
              Submit Your Music
            </h3>
            <p className="text-sm text-bodydark2">{planName} Plan</p>
          </div>
          <button
            onClick={onClose}
            className="text-bodydark2 hover:text-black dark:hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Track Title */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Track Title *
            </label>
            <input
              type="text"
              value={form.trackTitle}
              onChange={e => setForm(prev => ({ ...prev, trackTitle: e.target.value }))}
              placeholder="Enter your track title"
              className="w-full rounded-lg border border-stroke bg-white px-4 py-2 text-black outline-none transition dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
              disabled={loading}
            />
          </div>

          {/* Artist Name */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Artist Name *
            </label>
            <input
              type="text"
              value={form.artistName}
              onChange={e => setForm(prev => ({ ...prev, artistName: e.target.value }))}
              placeholder="Enter artist name"
              className="w-full rounded-lg border border-stroke bg-white px-4 py-2 text-black outline-none transition dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
              disabled={loading}
            />
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Genre
            </label>
            <input
              type="text"
              value={form.genre}
              onChange={e => setForm(prev => ({ ...prev, genre: e.target.value }))}
              placeholder="e.g., Afrobeats, Hip-Hop, Amapiano"
              className="w-full rounded-lg border border-stroke bg-white px-4 py-2 text-black outline-none transition dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
              disabled={loading}
            />
          </div>

          {/* Release Date */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Release Date
            </label>
            <input
              type="date"
              value={form.releaseDate}
              onChange={e => setForm(prev => ({ ...prev, releaseDate: e.target.value }))}
              className="w-full rounded-lg border border-stroke bg-white px-4 py-2 text-black outline-none transition dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
              disabled={loading}
            />
          </div>

          {/* Streaming URLs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Spotify URL
              </label>
              <input
                type="url"
                value={form.spotifyUrl}
                onChange={e => setForm(prev => ({ ...prev, spotifyUrl: e.target.value }))}
                placeholder="https://open.spotify.com/..."
                className="w-full rounded-lg border border-stroke bg-white px-4 py-2 text-black outline-none transition dark:border-strokedark dark:bg-boxdark-2 dark:text-white text-sm"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Apple Music URL
              </label>
              <input
                type="url"
                value={form.appleUrl}
                onChange={e => setForm(prev => ({ ...prev, appleUrl: e.target.value }))}
                placeholder="https://music.apple.com/..."
                className="w-full rounded-lg border border-stroke bg-white px-4 py-2 text-black outline-none transition dark:border-strokedark dark:bg-boxdark-2 dark:text-white text-sm"
                disabled={loading}
              />
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-3">
              Target Platforms *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonPlatforms.map(platform => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => handlePlatformToggle(platform)}
                  disabled={loading}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    form.platforms.includes(platform)
                      ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                      : 'border-stroke bg-white text-black dark:border-strokedark dark:bg-boxdark-2 dark:text-white'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Campaign Notes
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Any special instructions or details about your music..."
              rows={3}
              className="w-full rounded-lg border border-stroke bg-white px-4 py-2 text-black outline-none transition dark:border-strokedark dark:bg-boxdark-2 dark:text-white"
              disabled={loading}
            />
          </div>

          {/* Footer */}
          <div className="border-t border-stroke pt-5 dark:border-strokedark flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-stroke px-5 py-2 text-sm font-medium text-black transition hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-boxdark-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Music'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
