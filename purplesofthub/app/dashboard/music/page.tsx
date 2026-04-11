'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { getServiceBySlug } from '@/lib/payments/service-plans'
import ServicePricingCards from '@/components/services/ServicePricingCards'
import MusicSubmitForm from '@/components/dashboard/MusicSubmitForm'

interface MusicCampaign {
  id: string
  track_title: string
  artist_name: string
  platforms: string[]
  status: string
  created_at: string
}

export default function ClientMusicPage() {
  const [campaigns, setCampaigns] = useState<MusicCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [submitFormOpen, setSubmitFormOpen] = useState(false)

  const service = getServiceBySlug('music-promotion')

  const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  // Load user and campaigns
  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        setLoading(false)
        return
      }

      setUser(authUser)

      const { data: campaignsData } = await supabase
        .from('music_campaigns')
        .select('*')
        .eq('client_id', authUser.id)
        .order('created_at', { ascending: false })

      setCampaigns(campaignsData || [])
      setLoading(false)
    }

    loadData()
  }, [])

  const handleFormSuccess = () => {
    setSubmitFormOpen(false)
    // Reload campaigns
    const loadCampaigns = async () => {
      const supabase = createClient()
      const { data: campaignsData } = await supabase
        .from('music_campaigns')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
      setCampaigns(campaignsData || [])
    }
    loadCampaigns()
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          <p className="mt-3 text-bodydark2">Loading your music campaigns...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return <div className="text-center py-12">Service not found</div>
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 py-6 w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-black dark:text-white">🎵 Music Promotion</h2>
          <p className="text-sm text-bodydark2 mt-1">Get your music heard worldwide</p>
        </div>

        {/* Pricing Cards - Using unified system */}
        <ServicePricingCards service={service} showAll={true} />

        {/* Existing campaigns */}
        {campaigns && campaigns.length > 0 && (
          <>
            <h3 className="text-lg font-bold text-black dark:text-white mb-4 mt-12">My Campaigns</h3>
            <div className="space-y-4">
              {campaigns.map((campaign: any) => (
                <div key={campaign.id} className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark p-5">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <h5 className="font-bold text-black dark:text-white">{campaign.track_title}</h5>
                      <p className="text-sm text-bodydark2">{campaign.artist_name}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {campaign.platforms?.slice(0, 4).map((p: string) => (
                          <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500">
                            {p}
                          </span>
                        ))}
                        {campaign.platforms?.length > 4 && (
                          <span className="text-xs text-bodydark2">+{campaign.platforms.length - 4} more</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${STATUS_STYLES[campaign.status] || STATUS_STYLES.pending}`}>
                        {campaign.status}
                      </span>
                      <p className="text-xs text-bodydark2 mt-2">{format(new Date(campaign.created_at), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!campaigns || campaigns.length === 0 && (
          <div className="rounded-xl border border-dashed border-stroke bg-gray-50 dark:border-strokedark dark:bg-boxdark-2 p-8 text-center mt-8">
            <p className="text-bodydark2">No music campaigns yet. Get started by choosing a plan above! 🎵</p>
          </div>
        )}
      </div>

      {/* Music Submit Form */}
      {submitFormOpen && (
        <MusicSubmitForm
          planName="Music Promotion"
          planPrice={30000}
          planType="promotion"
          onSuccess={handleFormSuccess}
          onClose={() => setSubmitFormOpen(false)}
        />
      )}
    </div>
  )
}
