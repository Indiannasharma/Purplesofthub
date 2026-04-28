import { createClient } from '@/lib/supabase/server'
import {
  getPaymentProvider,
  getPlanFromVerifiedPayment,
  readVerifiedPlanFields,
  verifyFlutterwavePayment,
  verifyPaystackPayment,
} from '@/lib/payments/checkout-verification'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()
    const paymentProvider = getPaymentProvider(
      body.paymentMethod ?? body.provider
    )
    const paymentReference = String(
      body.paymentReference ?? body.reference ?? ''
    ).trim()

    if (!paymentProvider || !paymentReference) {
      return new Response(JSON.stringify({ error: 'Missing payment verification details' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const verifiedPayment =
      paymentProvider === 'paystack'
        ? await verifyPaystackPayment(paymentReference)
        : await verifyFlutterwavePayment(paymentReference)

    if (verifiedPayment.currency.toUpperCase() !== 'NGN') {
      return new Response(JSON.stringify({ error: 'Unsupported payment currency' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const verifiedPlan = getPlanFromVerifiedPayment({
      amount: verifiedPayment.amount,
      metadata: verifiedPayment.metadata,
    })

    if (!verifiedPlan) {
      return new Response(JSON.stringify({ error: 'Unable to resolve the purchased plan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const planMeta = readVerifiedPlanFields(verifiedPayment.metadata)
    const verifiedUserId = String(verifiedPayment.metadata.user_id ?? '').trim()
    if (verifiedUserId && verifiedUserId !== user.id) {
      return new Response(JSON.stringify({ error: 'Payment does not belong to the signed-in account' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (
      planMeta.serviceName &&
      planMeta.serviceName !== verifiedPlan.serviceName
    ) {
      return new Response(JSON.stringify({ error: 'Payment metadata mismatch' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const verifiedEmail = verifiedPayment.customerEmail?.trim().toLowerCase() || ''
    if (verifiedEmail && user.email && verifiedEmail !== user.email.toLowerCase()) {
      return new Response(JSON.stringify({ error: 'Payment email does not match the signed-in account' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const resolvedAmount = verifiedPlan.amount
    const resolvedServiceName = verifiedPlan.serviceName
    const resolvedDeliveryTime = verifiedPlan.deliveryTime

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        client_id: user.id,
        title: `${resolvedServiceName} - ${verifiedPlan.planName}`,
        description: `Service: ${resolvedServiceName}\nPlan: ${verifiedPlan.planName}\nDelivery: ${resolvedDeliveryTime}`,
        service_type: resolvedServiceName,
        status: 'in_progress',
        progress: 0,
        start_date: new Date().toISOString(),
        budget: resolvedAmount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (projectError) {
      console.error('Project creation error:', projectError)
      return new Response(JSON.stringify({ error: 'Failed to create project' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        project_id: project.id,
        client_id: user.id,
        amount: resolvedAmount,
        currency: verifiedPayment.currency.toUpperCase(),
        status: 'paid',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (invoiceError) {
      console.error('Invoice creation error:', invoiceError)
    }

    return new Response(JSON.stringify({
      success: true,
      projectId: project.id,
      invoiceId: invoice?.id,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Create project error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
