import { createClient } from '@supabase/supabase-js'
import {
  getPaymentProvider,
  getPlanFromVerifiedPayment,
  readVerifiedPlanFields,
  verifyFlutterwavePayment,
  verifyPaystackPayment,
} from '@/lib/payments/checkout-verification'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { error: 'Server not configured' },
      { status: 503 }
    )
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false } }
  )

  try {
    const body = await req.json()

    const paymentProvider = getPaymentProvider(
      body.paymentMethod ?? body.provider
    )
    const paymentReference = String(
      body.paymentReference ?? body.reference ?? ''
    ).trim()

    if (!paymentProvider || !paymentReference) {
      return NextResponse.json(
        { error: 'Missing payment verification details' },
        { status: 400 }
      )
    }

    const verifiedPayment =
      paymentProvider === 'paystack'
        ? await verifyPaystackPayment(paymentReference)
        : await verifyFlutterwavePayment(paymentReference)

    if (verifiedPayment.currency.toUpperCase() !== 'NGN') {
      return NextResponse.json(
        { error: 'Unsupported payment currency' },
        { status: 400 }
      )
    }

    const verifiedPlan = getPlanFromVerifiedPayment({
      amount: verifiedPayment.amount,
      metadata: verifiedPayment.metadata,
    })

    if (!verifiedPlan) {
      return NextResponse.json(
        { error: 'Unable to resolve the purchased plan' },
        { status: 400 }
      )
    }

    const planMeta = readVerifiedPlanFields(verifiedPayment.metadata)
    if (
      planMeta.serviceName &&
      planMeta.serviceName !== verifiedPlan.serviceName
    ) {
      return NextResponse.json(
        { error: 'Payment metadata mismatch' },
        { status: 400 }
      )
    }

    const authClient = await createServerClient()
    const {
      data: { user: sessionUser },
    } = await authClient.auth.getUser()

    const verifiedEmail = verifiedPayment.customerEmail?.trim().toLowerCase() || ''
    const requestEmail = String(body.email ?? '').trim().toLowerCase()

    if (sessionUser?.email && verifiedEmail && sessionUser.email.toLowerCase() !== verifiedEmail) {
      return NextResponse.json(
        { error: 'Payment email does not match the signed-in account' },
        { status: 403 }
      )
    }

    if (requestEmail && verifiedEmail && requestEmail !== verifiedEmail) {
      return NextResponse.json(
        { error: 'Payment email mismatch' },
        { status: 400 }
      )
    }

    const email = sessionUser?.email || verifiedEmail || requestEmail
    if (!email) {
      return NextResponse.json(
        { error: 'Verified customer email is required' },
        { status: 400 }
      )
    }

    const firstName = String(body.firstName ?? '').trim()
    const lastName = String(body.lastName ?? '').trim()
    const fullName =
      [firstName, lastName].filter(Boolean).join(' ') ||
      verifiedPayment.customerName ||
      email.split('@')[0]
    const phone = String(body.phone ?? verifiedPayment.customerPhone ?? '').trim()
    const businessName = String(body.businessName ?? '').trim()
    const password = String(body.password ?? '').trim()

    let userId = sessionUser?.id || ''

    if (!userId) {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(
        (candidate) => candidate.email?.toLowerCase() === email.toLowerCase()
      )

      if (existingUser) {
        userId = existingUser.id
      } else {
        const { data: newUser, error: authError } =
          await supabaseAdmin.auth.admin.createUser({
            email,
            password: password || Math.random().toString(36).slice(-10),
            email_confirm: true,
            user_metadata: {
              full_name: fullName,
              role: 'client',
            },
          })

        if (authError || !newUser.user) {
          return NextResponse.json(
            { error: authError?.message || 'Failed to create account' },
            { status: 500 }
          )
        }

        userId = newUser.user.id
      }
    }

    await supabaseAdmin.from('profiles').upsert({
      id: userId,
      full_name: fullName,
      email,
      phone: phone || null,
      business_name: businessName || null,
      active_plan: verifiedPlan.planName,
      plan_status: 'active',
      role: 'client',
    })

    const { data: existingSubscription } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('payment_reference', verifiedPayment.reference)
      .maybeSingle()

    if (!existingSubscription) {
      const { error: subError } = await supabaseAdmin.from('subscriptions').insert({
        client_id: userId,
        plan_name: verifiedPlan.planName,
        plan_amount: verifiedPlan.amount,
        currency: verifiedPayment.currency.toUpperCase(),
        status: 'active',
        payment_method: paymentProvider,
        payment_reference: verifiedPayment.reference,
        service_id: verifiedPlan.serviceId,
        service_name: verifiedPlan.serviceName,
        plan_id: verifiedPlan.planName,
        started_at: new Date().toISOString(),
      })

      if (subError) {
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500 }
        )
      }
    }

    await supabaseAdmin
      .from('profiles')
      .update({
        active_plan: verifiedPlan.planName,
        plan_status: 'active',
      })
      .eq('id', userId)

    return NextResponse.json({
      success: true,
      userId,
      message: 'Payment verified and plan activated',
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
