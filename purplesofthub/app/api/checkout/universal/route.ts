import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Guard against missing env vars
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY) {
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
    const {
      firstName,
      lastName,
      email,
      phone,
      businessName,
      password,
      serviceId,
      serviceName,
      planId,
      planName,
      amount,
      billingType,
      paymentReference,
      paymentMethod,
      isLoggedIn,
    } = await req.json()

    if (!email || !serviceId || !planId) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      )
    }

    let userId: string

    if (isLoggedIn) {
      // Get existing user from auth
      const { data: { user } } = await supabaseAdmin.auth.getUser()
      if (!user) {
        return NextResponse.json(
          { error: 'Not authenticated', success: false },
          { status: 401 }
        )
      }
      userId = user.id
    } else {
      // Check if user exists
      const { data: users } = await supabaseAdmin.auth.admin.listUsers()
      const existing = users?.users?.find(u => u.email === email)

      if (existing) {
        userId = existing.id
      } else {
        // Create new user
        const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: password || Math.random().toString(36).slice(-10),
          email_confirm: true,
          user_metadata: {
            full_name: `${firstName} ${lastName}`.trim(),
            role: 'client',
          },
        })

        if (error || !newUser.user) {
          return NextResponse.json(
            { error: error?.message || 'Failed to create account', success: false },
            { status: 500 }
          )
        }

        userId = newUser.user.id

        // Create profile
        await supabaseAdmin.from('profiles').upsert({
          id: userId,
          full_name: `${firstName} ${lastName}`.trim(),
          email,
          phone,
          business_name: businessName,
          role: 'client',
        })
      }
    }

    // Calculate expiration date based on billing type
    const expiresAt = new Date()
    if (billingType === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1)
    } else if (billingType === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)
    } else {
      // One-time: set 10 years in future
      expiresAt.setFullYear(expiresAt.getFullYear() + 10)
    }

    // Create subscription record
    const { error: subError } = await supabaseAdmin.from('subscriptions').insert({
      client_id: userId,
      plan_name: planName,
      plan_amount: amount,
      currency: 'NGN',
      status: 'active',
      payment_method: paymentMethod,
      payment_reference: paymentReference,
      service_id: serviceId,
      service_name: serviceName,
      plan_id: planId,
      billing_type: billingType,
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })

    if (subError) {
      console.error('Subscription creation error:', subError)
      return NextResponse.json(
        { error: 'Failed to create subscription', success: false },
        { status: 500 }
      )
    }

    // Update profile active plan
    await supabaseAdmin.from('profiles').update({
      active_plan: planName,
      plan_status: 'active',
    }).eq('id', userId)

    return NextResponse.json({
      success: true,
      userId,
      message: 'Payment processed successfully',
    })
  } catch (error: any) {
    console.error('Universal checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error', success: false },
      { status: 500 }
    )
  }
}
