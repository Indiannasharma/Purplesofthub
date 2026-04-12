import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const requestedNext = requestUrl.searchParams.get('next') ?? '/dashboard'
  const next =
    requestedNext.startsWith('/') && !requestedNext.startsWith('//')
      ? requestedNext
      : '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get the freshly authenticated user
      const { data: { user } } = await supabase.auth.getUser()

      if (user && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // Use the service-role admin client to bypass RLS for profile upsert
        const adminClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { autoRefreshToken: false } }
        )

        // Check if a profile row already exists
        const { data: existingProfile } = await adminClient
          .from('profiles')
          .select('id, role')
          .eq('id', user.id)
          .maybeSingle()

        // Determine role: use ADMIN_EMAIL env var to designate the admin account
        const adminEmails = (process.env.ADMIN_EMAIL || '')
          .split(',')
          .map(e => e.trim().toLowerCase())
          .filter(Boolean)

        const isAdminEmail = adminEmails.length > 0 &&
          adminEmails.includes((user.email || '').toLowerCase())

        if (!existingProfile) {
          // No profile row — create one now (trigger may not have run)
          await adminClient.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            role: isAdminEmail ? 'admin' : 'client',
          })
        } else if (isAdminEmail && existingProfile.role !== 'admin') {
          // Profile exists but role is wrong — promote to admin
          await adminClient
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', user.id)
        }
      }

      // Security note: role comes from the server-owned profiles table.
      const auth = await getAuthenticatedProfile()

      if (auth.ok && auth.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }

      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Auth failed — redirect to sign-in with error
  return NextResponse.redirect(
    new URL('/sign-in?error=auth_failed', request.url)
  )
}
