export type CheckoutPlanDefinition = {
  serviceId: string
  serviceName: string
  planName: string
  amount: number
  deliveryTime: string
}

type ServicePlanCatalog = Record<
  string,
  {
    serviceName: string
    plans: Record<string, { amount: number; deliveryTime: string }>
  }
>

const SERVICE_PLAN_CATALOG: ServicePlanCatalog = {
  'meta-ads': {
    serviceName: 'Facebook Ads Management',
    plans: {
      'Flex Weekly': { amount: 42000, deliveryTime: 'Per Week' },
      'Flex Weekly (Testing)': { amount: 42000, deliveryTime: 'Per Week' },
      Starter: { amount: 150000, deliveryTime: 'Per Month' },
      Growth: { amount: 250000, deliveryTime: 'Per Month' },
      Scale: { amount: 400000, deliveryTime: 'Per Month' },
      Enterprise: { amount: 600000, deliveryTime: 'Per Month' },
    },
  },
  'web-dev': {
    serviceName: 'Website Development',
    plans: {
      'Starter - Basic Website': { amount: 450000, deliveryTime: '2 weeks' },
      'Essential - Business Site': { amount: 750000, deliveryTime: '3 weeks' },
      'Professional - E-commerce': { amount: 975000, deliveryTime: '4 weeks' },
    },
  },
  'mobile-app': {
    serviceName: 'Mobile App Development',
    plans: {
      'Basic App': { amount: 250000, deliveryTime: '4-5 weeks' },
      'Standard App': { amount: 400000, deliveryTime: '6-7 weeks' },
      'Advanced App': { amount: 600000, deliveryTime: '8-10 weeks' },
    },
  },
  'social-media-mgmt': {
    serviceName: 'Social Media Management',
    plans: {
      Starter: { amount: 75000, deliveryTime: 'Monthly' },
      Growth: { amount: 150000, deliveryTime: 'Monthly' },
      Premium: { amount: 250000, deliveryTime: 'Monthly' },
    },
  },
  'music-promotion': {
    serviceName: 'Music Promotion',
    plans: {
      Basic: { amount: 30000, deliveryTime: '2 weeks' },
      Standard: { amount: 60000, deliveryTime: '3 weeks' },
      Premium: { amount: 100000, deliveryTime: '4 weeks' },
    },
  },
  'music-distribution': {
    serviceName: 'Music Distribution',
    plans: {
      Single: { amount: 15000, deliveryTime: '1 week' },
      'EP (3-6 tracks)': { amount: 40000, deliveryTime: '1-2 weeks' },
      'Album (7+ tracks)': { amount: 75000, deliveryTime: '2 weeks' },
    },
  },
  'account-recovery': {
    serviceName: 'Account Recovery',
    plans: {
      'Basic Recovery': { amount: 42000, deliveryTime: '1-4 weeks' },
    },
  },
  'ui-ux-design': {
    serviceName: 'UI/UX Design',
    plans: {
      'Landing Page': { amount: 100000, deliveryTime: '1-2 weeks' },
      'Web App Design': { amount: 200000, deliveryTime: '2-3 weeks' },
      'Complete Product': { amount: 350000, deliveryTime: '4-6 weeks' },
    },
  },
  seo: {
    serviceName: 'SEO',
    plans: {
      'Basic SEO': { amount: 40000, deliveryTime: 'Monthly' },
      'Growth SEO': { amount: 80000, deliveryTime: 'Monthly' },
      'Enterprise SEO': { amount: 150000, deliveryTime: 'Monthly' },
    },
  },
}

export function resolveCheckoutPlan(input: {
  serviceId?: string
  planName?: string
  amount?: number
}) {
  const serviceId = input.serviceId?.trim()
  const planName = input.planName?.trim()
  const amount = Number.isFinite(input.amount as number)
    ? Math.round(Number(input.amount))
    : undefined

  if (!serviceId || !planName) {
    return null
  }

  const service = SERVICE_PLAN_CATALOG[serviceId]
  if (!service) {
    return null
  }

  const plan = service.plans[planName]
  if (!plan) {
    return null
  }

  if (typeof amount === 'number' && amount !== Math.round(plan.amount)) {
    return null
  }

  return {
    serviceId,
    serviceName: service.serviceName,
    planName,
    amount: plan.amount,
    deliveryTime: plan.deliveryTime,
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
