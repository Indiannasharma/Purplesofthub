import { getServiceBySlug, SERVICES, type BillingType } from '@/lib/payments/service-plans'

export type CheckoutPlanDefinition = {
  serviceId: string
  serviceName: string
  planId: string
  planName: string
  amount: number
  deliveryTime: string
  billingType: BillingType
}

const SERVICE_ID_ALIASES: Record<string, string> = {
  'meta-ads': 'facebook-ads',
  'web-dev': 'web-development',
  'mobile-app': 'mobile-app-development',
  'social-media-mgmt': 'social-media-management',
  seo: 'seo-content',
}

function normalizeKey(value?: string) {
  return value?.trim().toLowerCase() || ''
}

function resolveService(serviceId?: string) {
  const key = normalizeKey(serviceId)
  if (!key) return null

  return (
    getServiceBySlug(SERVICE_ID_ALIASES[key] || key) ||
    SERVICES.find(service => normalizeKey(service.name) === key) ||
    null
  )
}

export function resolveCheckoutPlan(input: {
  serviceId?: string
  planName?: string
  amount?: number
}) {
  const service = resolveService(input.serviceId)
  const planKey = normalizeKey(input.planName)
  const amount = Number.isFinite(input.amount as number)
    ? Math.round(Number(input.amount))
    : undefined

  if (!service || !planKey) {
    return null
  }

  const plan = service.plans.find(candidate =>
    normalizeKey(candidate.name) === planKey ||
    normalizeKey(candidate.id) === planKey
  )

  if (!plan || plan.isCustom || plan.priceNGN <= 0) {
    return null
  }

  if (typeof amount === 'number' && amount !== Math.round(plan.priceNGN)) {
    return null
  }

  return {
    serviceId: service.id,
    serviceName: service.name,
    planId: plan.id,
    planName: plan.name,
    amount: plan.priceNGN,
    deliveryTime: plan.delivery,
    billingType: plan.billingType,
  } satisfies CheckoutPlanDefinition
}

export function getCheckoutPlanAmount(input: {
  serviceId?: string
  planName?: string
  amount?: number
}) {
  const plan = resolveCheckoutPlan(input)
  return plan?.amount ?? null
}
