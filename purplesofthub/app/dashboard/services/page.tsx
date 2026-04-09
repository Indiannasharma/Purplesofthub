'use client'

import { useState } from 'react'
import CheckoutModal from '@/app/services/_components/CheckoutModal'
import ServicePlanModal from '@/components/dashboard/ServicePlanModal'

interface Service {
  id: string
  name: string
  description: string
  category: string
  delivery_time: string
  starting_price: number
  icon?: string
}

const SERVICES: Service[] = [
  {
    id: 'web-dev',
    name: 'Web Development',
    description: 'Business sites, SaaS platforms, e-commerce stores built with Next.js & React.',
    category: 'Development',
    delivery_time: '2-6 weeks',
    starting_price: 150000,
    icon: '🌐',
  },
  {
    id: 'mobile-app',
    name: 'Mobile App Development',
    description: 'Cross-platform Flutter & React Native apps for iOS and Android.',
    category: 'Development',
    delivery_time: '4-8 weeks',
    starting_price: 250000,
    icon: '📱',
  },
  {
    id: 'meta-ads',
    name: 'Facebook & Instagram Ads',
    description: 'Professional ad campaigns with targeting, creative, and analytics.',
    category: 'Marketing',
    delivery_time: 'Ongoing',
    starting_price: 50000,
    icon: '📣',
  },
  {
    id: 'flex-weekly',
    name: 'Flex Weekly Ads',
    description: 'Weekly ad management with flexible budget and creative updates.',
    category: 'Marketing',
    delivery_time: 'Weekly',
    starting_price: 25000,
    icon: '⚡',
  },
  {
    id: 'social-media-mgmt',
    name: 'Social Media Management',
    description: 'Full social media management including content creation and scheduling.',
    category: 'Marketing',
    delivery_time: 'Monthly',
    starting_price: 75000,
    icon: '📱',
  },
  {
    id: 'music-promotion',
    name: 'Music Promotion',
    description: 'Promote your music on TikTok, Instagram Reels, and YouTube.',
    category: 'Music',
    delivery_time: '2-4 weeks',
    starting_price: 30000,
    icon: '🎵',
  },
  {
    id: 'music-distribution',
    name: 'Music Distribution',
    description: 'Distribute your music to 150+ platforms including Spotify & Apple Music.',
    category: 'Music',
    delivery_time: '1-2 weeks',
    starting_price: 15000,
    icon: '🎧',
  },
  {
    id: 'account-recovery',
    name: 'Account Recovery',
    description: 'Professional help recovering suspended Facebook, Instagram, or TikTok accounts.',
    category: 'Support',
    delivery_time: '14-30 business days',
    starting_price: 42000,
    icon: '🔐',
  },
  {
    id: 'ui-ux-design',
    name: 'UI/UX Design',
    description: 'Pixel-perfect product design with Figma prototypes and user research.',
    category: 'Design',
    delivery_time: '2-4 weeks',
    starting_price: 100000,
    icon: '🎨',
  },
  {
    id: 'seo',
    name: 'SEO & Content',
    description: 'Search engine optimization and content strategy to boost organic traffic.',
    category: 'Marketing',
    delivery_time: 'Ongoing',
    starting_price: 40000,
    icon: '🔍',
  },
]

const categories = ['All', 'Development', 'Marketing', 'Music', 'Design', 'Support']

export default function DashboardServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)

  const filteredServices = selectedCategory === 'All'
    ? SERVICES
    : SERVICES.filter(s => s.category === selectedCategory)

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `₦${(price / 1000).toFixed(0)}K`
    }
    return `₦${price.toLocaleString()}`
  }

  const handleGetStarted = (service: Service) => {
    setSelectedService(service)
    setShowPlanModal(true)
  }

  return (
    <>
      {/* Header */}
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
      </div>

      {/* Category Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: selectedCategory === cat ? 'none' : '1px solid rgba(124,58,237,0.2)',
              background: selectedCategory === cat
                ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                : 'transparent',
              color: selectedCategory === cat ? '#fff' : 'var(--cmd-body)',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
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
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.15)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(124,58,237,0.15)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {/* Gradient top border */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #7c3aed, #a855f7, #22d3ee)',
            }} />

            {/* Icon */}
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

            {/* Category badge */}
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
              {service.category}
            </span>

            {/* Title */}
            <h3 style={{
              fontSize: '17px',
              fontWeight: 800,
              color: 'var(--cmd-heading)',
              margin: '0 0 8px',
            }}>
              {service.name}
            </h3>

            {/* Description */}
            <p style={{
              fontSize: '13px',
              color: 'var(--cmd-body)',
              lineHeight: 1.6,
              margin: '0 0 16px',
              minHeight: '40px',
            }}>
              {service.description}
            </p>

            {/* Meta info */}
            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '20px',
              fontSize: '12px',
              color: 'var(--cmd-muted)',
            }}>
              <span>⏱️ {service.delivery_time}</span>
              <span style={{
                fontWeight: 700,
                color: '#a855f7',
              }}>
                From {formatPrice(service.starting_price)}
              </span>
            </div>

      {/* CTA Button */}
      <button
        onClick={() => handleGetStarted(service)}
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
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.5)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.3)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        Get Started →
      </button>
          </div>
        ))}
      </div>

      {/* Service Plan Modal */}
      {showPlanModal && selectedService && (
        <ServicePlanModal
          service={selectedService}
          onClose={() => {
            setShowPlanModal(false)
            setSelectedService(null)
          }}
        />
      )}
    </>
  )
}