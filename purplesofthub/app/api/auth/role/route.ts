import { createClient } from '@/lib/supabase/server'
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

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    role: profile.role === 'admin' ? 'admin' : 'client',
  })
}
