/**
 * One-time admin setup endpoint.
 *
 * Promotes a user to admin role in the profiles table.
 * Protected by SETUP_ADMIN_SECRET env var.
 *
 * Usage (run once after deploy):
 *   GET /api/auth/setup-admin?email=purplesofthub@gmail.com&secret=YOUR_SECRET
 *
 * Set SETUP_ADMIN_SECRET in your hosting env vars.
 * After use you can leave it set — the secret keeps it safe.
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email  = searchParams.get('email')?.toLowerCase().trim()
  const secret = searchParams.get('secret')

  // Basic guard
  const expectedSecret = process.env.SETUP_ADMIN_SECRET
  if (!expectedSecret || !secret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!email) {
    return NextResponse.json({ error: 'email param required' }, { status: 400 })
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 503 })
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false } }
  )

  // Find user by email in auth.users via admin API
  const { data: usersData } = await adminClient.auth.admin.listUsers()
  const authUser = usersData?.users?.find(u => u.email?.toLowerCase() === email)

  if (!authUser) {
    return NextResponse.json({ error: `No auth user found for ${email}` }, { status: 404 })
  }

  // Check if profile exists
  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id, role')
    .eq('id', authUser.id)
    .maybeSingle()

  if (existingProfile) {
    // Update role to admin
    const { error } = await adminClient
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', authUser.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({
      success: true,
      message: `✅ ${email} promoted to admin`,
      previousRole: existingProfile.role,
    })
  } else {
    // Create profile with admin role
    const { error } = await adminClient.from('profiles').insert({
      id: authUser.id,
      email: authUser.email,
      full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
      role: 'admin',
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({
      success: true,
      message: `✅ ${email} profile created with admin role`,
    })
  }
}
