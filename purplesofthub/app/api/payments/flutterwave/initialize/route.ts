import { createClient } from '@/lib/supabase/server'
import { resolveCheckoutPlan } from '@/lib/payments/checkout-plans'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const {
      serviceId,
      serviceName,
      plan,
      planName,
      deliveryTime,
      email,
      name,
      phone,
      amount,
      currency,
      meta,
      redirect_url,
    } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = user
      ? await supabase
          .from('profiles')
          .select('full_name, phone, email')
          .eq('id', user.id)
          .maybeSingle()
      : { data: null }

    const flwSecretKey = process.env.FLUTTERWAVE_SECRET_KEY

    if (!flwSecretKey) {
      return NextResponse.json(
        { error: 'Flutterwave not configured' },
        { status: 500 }
      )
    }

    const requestedAmount = typeof amount === 'number' ? amount : Number(amount)
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than zero' },
        { status: 400 }
      )
    }

    const planInfo = resolveCheckoutPlan({
      serviceId: serviceId?.toString().trim(),
      planName: (planName || plan)?.toString().trim(),
      amount: requestedAmount,
    })

    if ((serviceId || planName || plan) && !planInfo) {
      return NextResponse.json(
        { error: 'Invalid service plan or amount mismatch' },
        { status: 400 }
      )
    }

    const txRef = planInfo
      ? `svc_${planInfo.serviceId}_${Date.now()}`
      : `psb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const customerEmail = user?.email || profile?.email || email
    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const customerName =
      profile?.full_name ||
      name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      'Donor'
    const customerPhone = profile?.phone || phone
    const finalRedirectUrl =
      redirect_url && new URL(redirect_url, request.url).origin === new URL(request.url).origin
        ? new URL(redirect_url, request.url).toString()
        : planInfo
          ? new URL('/services/checkout/success?provider=flutterwave', request.url).toString()
          : undefined

    const response = await fetch(
      'https://api.flutterwave.com/v3/payments',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${flwSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tx_ref: txRef,
          amount: planInfo?.amount ?? requestedAmount,
          currency: currency || 'NGN',
          redirect_url: finalRedirectUrl,
          customer: {
            email: customerEmail,
            name: customerName,
            ...(customerPhone ? { phone_number: customerPhone } : {}),
          },
          meta: {
            ...(meta || {}),
            ...(planInfo ? {
              service_id: planInfo.serviceId,
              service_name: planInfo.serviceName,
              plan_name: planInfo.planName,
              delivery_time: planInfo.deliveryTime,
              user_id: user?.id,
            } : {}),
          },
          customizations: {
            title: planInfo ? `PurpleSoftHub ${planInfo.serviceName}` : 'PurpleSoftHub Donation',
            description: planInfo
              ? `${planInfo.serviceName} - ${planInfo.planName}`
              : 'Supporting Tech Education in Africa',
            logo: 'https://www.purplesofthub.com/Purplesoft-logo-main.png',
          },
        }),
      }
    )

    const data = await response.json()

    if (data.status === 'success') {
      return NextResponse.json({
        payment_link: data.data.link,
        tx_ref: txRef,
        config: {
          public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
          tx_ref: txRef,
          amount: planInfo?.amount ?? requestedAmount,
          currency: currency || 'NGN',
          payment_options: 'card,banktransfer,ussd',
          customer: {
            email: customerEmail,
            name: customerName,
            ...(customerPhone ? { phone_number: customerPhone } : {}),
          },
          meta: {
            ...(meta || {}),
            ...(planInfo ? {
              service_id: planInfo.serviceId,
              service_name: planInfo.serviceName,
              plan_name: planInfo.planName,
              delivery_time: planInfo.deliveryTime,
              user_id: user?.id,
            } : {}),
          },
          customizations: {
            title: planInfo ? `PurpleSoftHub ${planInfo.serviceName}` : 'PurpleSoftHub Donation',
            description: planInfo
              ? `${planInfo.serviceName} - ${planInfo.planName}`
              : 'Supporting Tech Education in Africa',
            logo: 'https://www.purplesofthub.com/Purplesoft-logo-main.png',
          },
          redirect_url: finalRedirectUrl,
        },
      })
    }

    return NextResponse.json(
      { error: data.message || 'Payment failed' },
      { status: 400 }
    )

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Payment initialization failed' },
      { status: 500 }
    )
  }
}
