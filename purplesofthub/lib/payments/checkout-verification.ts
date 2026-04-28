import { resolveCheckoutPlan } from '@/lib/payments/checkout-plans'

export type PaymentProvider = 'paystack' | 'flutterwave'

export type VerifiedCheckoutPayment = {
  provider: PaymentProvider
  reference: string
  amount: number
  currency: string
  status: string
  customerEmail: string | null
  customerName: string | null
  customerPhone: string | null
  metadata: Record<string, unknown>
  raw: unknown
}

export type VerifiedCheckoutPlan = ReturnType<typeof resolveCheckoutPlan>

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function normalizeMetadata(value: unknown): Record<string, unknown> {
  if (isRecord(value)) return value

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return isRecord(parsed) ? parsed : {}
    } catch {
      return {}
    }
  }

  return {}
}

function toStringValue(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || null
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    const normalized = toStringValue(value)
    if (normalized) return normalized
  }

  return null
}

function getCustomField(metadata: Record<string, unknown>, variableName: string) {
  const fields = Array.isArray(metadata.custom_fields) ? metadata.custom_fields : []

  for (const field of fields) {
    if (
      isRecord(field) &&
      pickString(field.variable_name) === variableName
    ) {
      return pickString(field.value)
    }
  }

  return null
}

function getVerifiedPlanMetadata(metadata: Record<string, unknown>) {
  const serviceId = pickString(
    metadata.service_id,
    metadata.serviceId,
    getCustomField(metadata, 'service_id'),
    getCustomField(metadata, 'service')
  )

  const planName = pickString(
    metadata.plan_name,
    metadata.planName,
    getCustomField(metadata, 'plan_name'),
    getCustomField(metadata, 'plan')
  )

  const billingType = pickString(
    metadata.billing_type,
    metadata.billingType
  )

  const serviceName = pickString(
    metadata.service_name,
    metadata.serviceName
  )

  return {
    serviceId,
    planName,
    billingType,
    serviceName,
  }
}

function normalizeProvider(value: unknown): PaymentProvider | null {
  const provider = pickString(value)?.toLowerCase()
  if (provider === 'paystack' || provider === 'flutterwave') return provider
  return null
}

export function getPaymentProvider(value: unknown): PaymentProvider | null {
  return normalizeProvider(value)
}

export function getPlanFromVerifiedPayment(payment: {
  amount: number
  metadata: Record<string, unknown>
}) {
  const { serviceId, planName } = getVerifiedPlanMetadata(payment.metadata)

  if (!serviceId || !planName) {
    return null
  }

  return resolveCheckoutPlan({
    serviceId,
    planName,
    amount: payment.amount,
  })
}

export async function verifyPaystackPayment(reference: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    throw new Error('Paystack not configured')
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    }
  )

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to verify Paystack payment')
  }

  const tx = payload?.data
  if (!payload?.status || !tx || tx.status !== 'success') {
    throw new Error('Paystack payment was not successful')
  }

  const metadata = normalizeMetadata(tx.metadata)
  const amount = Number(tx.amount) / 100
  const currency = pickString(tx.currency) || 'NGN'

  return {
    provider: 'paystack' as const,
    reference: pickString(tx.reference) || reference,
    amount,
    currency,
    status: pickString(tx.status) || 'success',
    customerEmail: pickString(tx.customer?.email, tx.customer?.email_address),
    customerName: pickString(tx.customer?.name, tx.customer?.first_name, tx.customer?.last_name),
    customerPhone: pickString(tx.customer?.phone, tx.customer?.phone_number),
    metadata,
    raw: tx,
  } satisfies VerifiedCheckoutPayment
}

export async function verifyFlutterwavePayment(reference: string) {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY
  if (!secret) {
    throw new Error('Flutterwave not configured')
  }

  const response = await fetch(
    `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(reference)}/verify`,
    {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    }
  )

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to verify Flutterwave payment')
  }

  const tx = payload?.data
  if (!payload?.status || !tx || tx.status !== 'successful') {
    throw new Error('Flutterwave payment was not successful')
  }

  const metadata = normalizeMetadata(tx.meta ?? tx.metadata)
  const amount = Number(tx.amount)
  const currency = pickString(tx.currency) || 'NGN'

  return {
    provider: 'flutterwave' as const,
    reference: pickString(tx.id) || reference,
    amount,
    currency,
    status: pickString(tx.status) || 'successful',
    customerEmail: pickString(tx.customer?.email),
    customerName: pickString(tx.customer?.name, tx.customer?.name?.first_name),
    customerPhone: pickString(tx.customer?.phone_number, tx.customer?.phone),
    metadata,
    raw: tx,
  } satisfies VerifiedCheckoutPayment
}

export function readVerifiedPlanFields(metadata: Record<string, unknown>) {
  return getVerifiedPlanMetadata(metadata)
}
