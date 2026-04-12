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

// Helper: get service-role admin client
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

  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userEmail = (user.email || '').toLowerCase()
  const shouldBeAdmin = isAdminByEmail(userEmail)

  // Read profile from DB
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const adminClient = getAdminClient()

  // No profile row — create it now (DB trigger may not have fired)
  if (!profile) {
    if (adminClient) {
      await adminClient.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        role: shouldBeAdmin ? 'admin' : 'client',
      }).select().single()
    }
    return NextResponse.json({ role: shouldBeAdmin ? 'admin' : 'client' })
  }

  // Profile exists but role needs to be promoted to admin
  if (shouldBeAdmin && profile.role !== 'admin') {
    if (adminClient) {
      await adminClient.from('profiles').update({ role: 'admin' }).eq('id', user.id)
    }
    return NextResponse.json({ role: 'admin' })
  }

  // Profile exists and role is correct
  return NextResponse.json({
    role: profile.role === 'admin' ? 'admin' : 'client',
  })
}
