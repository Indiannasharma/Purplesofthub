'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import CheckoutModal from '@/app/services/_components/CheckoutModal'
import MusicSubmitForm from '@/components/dashboard/MusicSubmitForm'

interface MusicCampaign {
  id: string
  track_title: string
  artist_name: string
  platforms: string[]
  status: string
  created_at: string
}

interface Package {
  name: string
  price_ngn: number
  price_usd: number
  features: string[]
  color: string
  featured?: boolean
}

export default function ClientMusicPage() {
  const [campaigns, setCampaigns] = useState<MusicCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [submitFormOpen, setSubmitFormOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Package | null>(null)

  const PACKAGES: Package[] = [
    {
      name: 'Starter',
      price_ngn: 15000,
      price_usd: 10,
      features: ['5 platforms', '2 week campaign', 'Basic analytics', 'Email support'],
      color: 'border-gray-200 dark:border-strokedark'
    },
    {
      name: 'Growth',
      price_ngn: 45000,
      price_usd: 30,
      features: [
        '20 platforms',
        '4 week campaign',
        'Full analytics',
        'Priority support',
        'Playlist pitching'
      ],
      color: 'border-brand-500 ring-1 ring-brand-500/30',
      featured: true
    },
    {
      name: 'Pro',
      price_ngn: 100000,
      price_usd: 65,
      features: [
        '150+ platforms',
        '8 week campaign',
        'Advanced analytics',
        'Dedicated manager',
        'Playlist pitching',
        'Press release',
        'Social promotion'
      ],
      color: 'border-purple-500 ring-1 ring-purple-500/30'
    }
  ]

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

  const handleGetStarted = (pkg: Package) => {
    setSelectedPlan(pkg)
    setCheckoutModalOpen(true)
  }

  const handleCheckoutSuccess = () => {
    setCheckoutModalOpen(false)
    setSubmitFormOpen(true)
  }

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

  return (
    <div className="w-full overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 py-6 w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-black dark:text-white">🎵 Music Promotion</h2>
          <p className="text-sm text-bodydark2 mt-1">Get your music heard worldwide</p>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-8">
          {PACKAGES.map(pkg => (
            <div key={pkg.name} className={`rounded-xl border bg-white shadow-sm dark:bg-boxdark p-6 relative min-w-0 w-full ${pkg.color}`}>
              {pkg.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <h5 className="font-bold text-black dark:text-white text-lg mb-1">{pkg.name}</h5>

              <div className="mb-4">
                <span className="text-3xl font-bold text-brand-500">₦{pkg.price_ngn.toLocaleString()}</span>
                <span className="text-sm text-bodydark2 ml-2">/ ${pkg.price_usd}</span>
              </div>

              <ul className="space-y-2 mb-6">
                {pkg.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-bodydark2">
                    <span className="text-brand-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleGetStarted(pkg)}
                className="w-full rounded-lg bg-brand-500 text-white font-medium py-2.5 hover:bg-brand-600 transition"
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        {/* Existing campaigns */}
        {campaigns && campaigns.length > 0 && (
          <>
            <h3 className="text-lg font-bold text-black dark:text-white mb-4">My Campaigns</h3>
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
          <div className="rounded-xl border border-dashed border-stroke bg-gray-50 dark:border-strokedark dark:bg-boxdark-2 p-8 text-center">
            <p className="text-bodydark2">No music campaigns yet. Get started by choosing a plan above! 🎵</p>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {checkoutModalOpen && selectedPlan && (
        <CheckoutModal
          plan={selectedPlan.name}
          serviceId="music-promotion"
          serviceName="Music Promotion"
          amount={selectedPlan.price_ngn}
          isLoggedIn={!!user}
          onSuccess={handleCheckoutSuccess}
          onClose={() => setCheckoutModalOpen(false)}
        />
      )}

      {/* Music Submit Form */}
      {submitFormOpen && selectedPlan && (
        <MusicSubmitForm
          planName={selectedPlan.name}
          planPrice={selectedPlan.price_ngn}
          planType="promotion"
          onSuccess={handleFormSuccess}
          onClose={() => setSubmitFormOpen(false)}
        />
      )}
    </div>
  )
}
