'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ServiceForm, { ServiceFormData } from '../../_components/ServiceForm'

export default function EditServicePage() {
  const params = useParams<{ id: string }>()
  const serviceId = params?.id
  const [initialData, setInitialData] = useState<Partial<ServiceFormData> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!serviceId) return
    const fetchService = async () => {
      try {
        const res = await fetch(`/api/admin/services/${serviceId}`, { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) {
          setError(data?.error || 'Failed to load service.')
          return
        }
        setInitialData({
          name: data?.service?.name || '',
          slug: data?.service?.slug || '',
          category: data?.service?.category || '',
          shortDesc: data?.service?.shortDesc || '',
          description: data?.service?.description || '',
          features: data?.service?.features || [''],
          priceNGN: Number(data?.service?.priceNGN || 0),
          priceUSD: Number(data?.service?.priceUSD || 0),
          deliveryDays: Number(data?.service?.deliveryDays || 0),
          icon: data?.service?.icon || '',
          isActive: Boolean(data?.service?.isActive),
          isFeatured: Boolean(data?.service?.isFeatured),
          order: Number(data?.service?.order || 0),
        })
      } catch (err) {
        console.error('Fetch service error:', err)
        setError('Failed to load service.')
      }
    }

    fetchService()
  }, [serviceId])

  if (!serviceId) return null

  if (error) {
    return (
      <div style={{ color: '#f87171', fontSize: 14, padding: 24 }}>
        {error}
      </div>
    )
  }

  if (!initialData) {
    return (
      <div style={{ color: '#9d8fd4', fontSize: 14, padding: 24 }}>
        Loading service...
      </div>
    )
  }

  return <ServiceForm mode="edit" serviceId={serviceId} initialData={initialData} />
}
