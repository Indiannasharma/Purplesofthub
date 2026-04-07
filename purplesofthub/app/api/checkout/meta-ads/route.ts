import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
}

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  { auth: { autoRefreshToken: false } }
)

export async function POST(req: NextRequest) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      businessName,
      password,
      plan,
      amount,
      paymentReference,
      paymentMethod,
    } = await req.json()

    // Validate required fields
    if (!email || !password || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error('Error listing users:', listError)
    }

    const userExists = existingUser?.users?.some(u => u.email === email)

    let userId: string

    if (userExists) {
      // Get existing user
      const existing = existingUser?.users?.find(u => u.email === email)
      if (!existing) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      userId = existing.id

      // Update existing profile
      await supabaseAdmin
        .from('profiles')
        .update({
          full_name: `${firstName} ${lastName}`.trim(),
          phone,
          business_name: businessName,
          active_plan: plan,
          plan_status: 'active',
        })
        .eq('id', userId)
    } else {
      // Create new Supabase auth user
      const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: `${firstName} ${lastName}`.trim(),
          role: 'client',
          business_name: businessName,
        },
      })

      if (authError || !newUser.user) {
        console.error('Auth error:', authError)
        return NextResponse.json(
          { error: authError?.message || 'Failed to create account' },
          { status: 500 }
        )
      }
      userId = newUser.user.id

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          full_name: `${firstName} ${lastName}`.trim(),
          email,
          phone,
          business_name: businessName,
          active_plan: plan,
          plan_status: 'active',
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }
    }

    // Create subscription record
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        client_id: userId,
        plan_name: plan,
        plan_amount: amount,
        currency: 'NGN',
        status: 'active',
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        platforms: plan === 'Starter' ? ['facebook'] : ['facebook', 'instagram'],
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })

    if (subError) {
      console.error('Subscription error:', subError)
    }

    // Update profile plan status
    await supabaseAdmin
      .from('profiles')
      .update({
        active_plan: plan,
        plan_status: 'active',
      })
      .eq('id', userId)

    // Log the successful checkout (for debugging)
    console.log(`Checkout successful: ${email} - ${plan} plan - ${paymentReference}`)

    return NextResponse.json({
      success: true,
      userId,
      message: 'Account created and plan activated',
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}