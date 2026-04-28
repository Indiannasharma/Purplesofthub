import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import {
  getPaymentProvider,
  getPlanFromVerifiedPayment,
  readVerifiedPlanFields,
  verifyFlutterwavePayment,
  verifyPaystackPayment,
} from '@/lib/payments/checkout-verification'

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
        { error: 'Missing payment verification details', success: false },
        { status: 400 }
      )
    }

    const verifiedPayment =
      paymentProvider === 'paystack'
        ? await verifyPaystackPayment(paymentReference)
        : await verifyFlutterwavePayment(paymentReference)

    if (verifiedPayment.currency.toUpperCase() !== 'NGN') {
      return NextResponse.json(
        { error: 'Unsupported payment currency', success: false },
        { status: 400 }
      )
    }

    const verifiedPlan = getPlanFromVerifiedPayment({
      amount: verifiedPayment.amount,
      metadata: verifiedPayment.metadata,
    })

    if (!verifiedPlan) {
      return NextResponse.json(
        { error: 'Unable to resolve the purchased plan', success: false },
        { status: 400 }
      )
    }

    const planMeta = readVerifiedPlanFields(verifiedPayment.metadata)
    if (
      planMeta.serviceName &&
      planMeta.serviceName !== verifiedPlan.serviceName
    ) {
      return NextResponse.json(
        { error: 'Payment metadata mismatch', success: false },
        { status: 400 }
      )
    }

    const billingType = planMeta.billingType ?? 'one-time'

    const authClient = await createServerClient()
    const {
      data: { user: sessionUser },
    } = await authClient.auth.getUser()

    const verifiedEmail = verifiedPayment.customerEmail?.trim().toLowerCase() || ''
    const requestEmail = String(body.email ?? '').trim().toLowerCase()

    if (sessionUser?.email && verifiedEmail && sessionUser.email.toLowerCase() !== verifiedEmail) {
      return NextResponse.json(
        { error: 'Payment email does not match the signed-in account', success: false },
        { status: 403 }
      )
    }

    if (requestEmail && verifiedEmail && requestEmail !== verifiedEmail) {
      return NextResponse.json(
        { error: 'Payment email mismatch', success: false },
        { status: 400 }
      )
    }

    const userEmail = sessionUser?.email || verifiedEmail || requestEmail
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Verified customer email is required', success: false },
        { status: 400 }
      )
    }

    const firstName = String(body.firstName ?? '').trim()
    const lastName = String(body.lastName ?? '').trim()
    const fullName =
      [firstName, lastName].filter(Boolean).join(' ') ||
      verifiedPayment.customerName ||
      userEmail.split('@')[0]
    const phone = String(body.phone ?? verifiedPayment.customerPhone ?? '').trim()
    const businessName = String(body.businessName ?? '').trim()
    const password = String(body.password ?? '').trim()

    let userId = sessionUser?.id || ''

    if (!userId) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = users?.users?.find(
        (candidate) => candidate.email?.toLowerCase() === userEmail.toLowerCase()
      )

      if (existingUser) {
        userId = existingUser.id
      } else {
        const { data: newUser, error: authError } =
          await supabaseAdmin.auth.admin.createUser({
            email: userEmail,
            password: password || Math.random().toString(36).slice(-10),
            email_confirm: true,
            user_metadata: {
              full_name: fullName,
              role: 'client',
              business_name: businessName || undefined,
            },
          })

        if (authError || !newUser.user) {
          return NextResponse.json(
            {
              error: authError?.message || 'Failed to create account',
              success: false,
            },
            { status: 500 }
          )
        }

        userId = newUser.user.id

        const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
          id: userId,
          full_name: fullName,
          email: userEmail,
          phone: phone || null,
          business_name: businessName || null,
          role: 'client',
        })

        if (profileError) {
          return NextResponse.json(
            { error: 'Failed to create profile', success: false },
            { status: 500 }
          )
        }
      }
    } else {
      await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fullName,
          email: userEmail,
          phone: phone || null,
          business_name: businessName || null,
          role: 'client',
        })
    }

    const { data: existingSubscription } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('payment_reference', verifiedPayment.reference)
      .maybeSingle()

    if (existingSubscription) {
      return NextResponse.json({
        success: true,
        userId,
        message: 'Payment already processed',
      })
    }

    const expiresAt = new Date()
    if (billingType === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1)
    } else if (billingType === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 10)
    }

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
      billing_type: billingType,
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })

    if (subError) {
      return NextResponse.json(
        { error: 'Failed to create subscription', success: false },
        { status: 500 }
      )
    }

    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({
        active_plan: verifiedPlan.planName,
        plan_status: 'active',
      })
      .eq('id', userId)

    if (profileUpdateError) {
      return NextResponse.json(
        { error: 'Payment verified, but profile update failed', success: false },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      userId,
      message: 'Payment verified and subscription activated',
    })
  } catch (error: any) {
    console.error('Universal checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error', success: false },
      { status: 500 }
    )
  }
}
