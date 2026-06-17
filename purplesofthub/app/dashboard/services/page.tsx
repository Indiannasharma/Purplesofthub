'use client'

import { useState } from 'react'
import { SERVICES as SERVICE_CATALOG, type ServiceCategory } from '@/lib/payments/service-plans'
import ServicePlanModal from '@/components/dashboard/ServicePlanModal'
import CurrencySwitcher from '@/components/pricing/CurrencySwitcher'
import { useCurrency } from '@/context/CurrencyContext'
import { formatRegionalPrice } from '@/lib/pricing/currency'

type DashboardService = (typeof SERVICE_CATALOG)[number]

const categoryLabels: Record<ServiceCategory, string> = {
  development: 'Development',
  marketing: 'Marketing',
  design: 'Design',
  music: 'Music',
  support: 'Support',
  content: 'Content',
}

const categories = ['All', ...Array.from(new Set(SERVICE_CATALOG.map(service => categoryLabels[service.category])))]

function formatPrice(price: number) {
  if (price >= 1000000) {
    return `₦${(price / 1000000).toFixed(1)}M`
  }

  if (price >= 1000) {
    return `₦${(price / 1000).toFixed(0)}K`
  }

  return `₦${price.toLocaleString()}`
}

export default function DashboardServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedService, setSelectedService] = useState<DashboardService | null>(null)
  const { currency } = useCurrency()

  const filteredServices = selectedCategory === 'All'
    ? SERVICE_CATALOG
    : SERVICE_CATALOG.filter(service => categoryLabels[service.category] === selectedCategory)

  return (
    <>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 900,
          color: 'var(--cmd-heading)',
          margin: '0 0 4px',
        }}>
          Our Services
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--cmd-body)',
          margin: 0,
        }}>
          Choose a service to get started
        </p>
        <div style={{ marginTop: '14px' }}>
          <CurrencySwitcher compact />
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: selectedCategory === category ? 'none' : '1px solid rgba(124,58,237,0.2)',
              background: selectedCategory === category
                ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                : 'transparent',
              color: selectedCategory === category ? '#fff' : 'var(--cmd-body)',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {filteredServices.map(service => (
          <div
            key={service.id}
            style={{
              background: 'var(--cmd-card)',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: '16px',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s',
            }}
            onMouseEnter={event => {
              event.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'
              event.currentTarget.style.transform = 'translateY(-2px)'
              event.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.15)'
            }}
            onMouseLeave={event => {
              event.currentTarget.style.borderColor = 'rgba(124,58,237,0.15)'
              event.currentTarget.style.transform = 'translateY(0)'
              event.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #7c3aed, #a855f7, #22d3ee)',
            }} />

            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              marginBottom: '16px',
              boxShadow: '0 0 12px rgba(124,58,237,0.1)',
            }}>
              {service.icon}
            </div>

            <span style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: '100px',
              fontSize: '10px',
              fontWeight: 700,
              background: 'rgba(124,58,237,0.1)',
              color: '#a855f7',
              border: '1px solid rgba(124,58,237,0.2)',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {categoryLabels[service.category]}
            </span>

            <h3 style={{
              fontSize: '17px',
              fontWeight: 800,
              color: 'var(--cmd-heading)',
              margin: '0 0 8px',
            }}>
              {service.name}
            </h3>

            <p style={{
              fontSize: '13px',
              color: 'var(--cmd-body)',
              lineHeight: 1.6,
              margin: '0 0 16px',
              minHeight: '62px',
            }}>
              {service.description}
            </p>

            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '20px',
              fontSize: '12px',
              color: 'var(--cmd-muted)',
            }}>
              <span>{service.plans[0]?.delivery || 'Custom timeline'}</span>
              <span style={{
                fontWeight: 700,
                color: '#a855f7',
              }}>
                From {formatRegionalPrice(service.startingPriceNGN, service.startingPriceUSD, currency)}
              </span>
            </div>

            <button
              onClick={() => setSelectedService(service)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
                transition: 'all 0.2s',
              }}
            >
              Get Started →
            </button>
          </div>
        ))}
      </div>

      {selectedService && (
        <ServicePlanModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </>
  )
}
