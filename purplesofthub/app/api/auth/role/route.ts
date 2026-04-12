import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Helper: check if an email should be admin
function isAdminByEmail(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.length > 0 && adminEmails.includes(email.toLowerCase())
}

// Helper: get service-role admin client (bypasses RLS)
function getAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false } }
  )
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  console.log('[/api/auth/role] Session:', {
    hasUser: !!user,
    email: user?.email,
    error: error?.message,
  })

  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userEmail = (user.email || '').toLowerCase()
  const shouldBeAdmin = isAdminByEmail(userEmail)
  const adminClient = getAdminClient()

  if (!adminClient) {
    console.error('[/api/auth/role] ❌ No service role key — cannot read/write profiles')
    return NextResponse.json({ role: shouldBeAdmin ? 'admin' : 'client' })
  }

  // ALWAYS use service role to read profiles (bypasses RLS)
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  console.log('[/api/auth/role] Profile read (service role):', {
    userId: user.id,
    profile: profile?.role,
    profileError: profileError?.message,
  })

  // No profile row — create it now
  if (!profile) {
    const { error: insertError } = await adminClient.from('profiles').insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      role: shouldBeAdmin ? 'admin' : 'client',
    })
    console.log('[/api/auth/role] Created profile:', {
      role: shouldBeAdmin ? 'admin' : 'client',
      insertError: insertError?.message,
    })
    return NextResponse.json({ role: shouldBeAdmin ? 'admin' : 'client' })
  }

  // Profile exists but role needs promotion
  if (shouldBeAdmin && profile.role !== 'admin') {
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', user.id)
    console.log('[/api/auth/role] Promoted to admin:', {
      updateError: updateError?.message,
    })
    return NextResponse.json({ role: 'admin' })
  }

  return NextResponse.json({
    role: profile.role === 'admin' ? 'admin' : 'client',
  })
}
