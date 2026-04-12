import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Security note: the role must be read from the server-owned profiles table.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  // If profile is missing (trigger may not have run), create it now
  if (!profile && !profileError && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false } }
    )

    const adminEmails = (process.env.ADMIN_EMAIL || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean)

    const isAdminEmail = adminEmails.includes((user.email || '').toLowerCase())

    await adminClient.from('profiles').insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || '',
      role: isAdminEmail ? 'admin' : 'client',
    })

    return NextResponse.json({ role: isAdminEmail ? 'admin' : 'client' })
  }

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // If logged-in email matches ADMIN_EMAIL env var but profile isn't admin yet, fix it
  const adminEmails = (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)

  if (adminEmails.includes((user.email || '').toLowerCase()) && profile.role !== 'admin') {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false } }
      )
      await adminClient.from('profiles').update({ role: 'admin' }).eq('id', user.id)
    }
    return NextResponse.json({ role: 'admin' })
  }

  return NextResponse.json({
    role: profile.role === 'admin' ? 'admin' : 'client',
  })
}
