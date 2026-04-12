import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminSupabase } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

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

    console.log('[OAuth Callback] exchangeCodeForSession result:', { error: error?.message })

    if (!error) {
      // Use the SAME supabase client (which already has the new session in its
      // cookie store) — NOT a new createClient() call which would read stale
      // request cookies and see no session.
      const { data: { user } } = await supabase.auth.getUser()
      console.log('[OAuth Callback] User after getUser:', { userId: user?.id, email: user?.email })

      // Determine if this email is designated as admin
      const adminEmails = (process.env.ADMIN_EMAIL || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean)

      const isAdminEmail =
        adminEmails.length > 0 &&
        adminEmails.includes((user?.email || '').toLowerCase())

      console.log('[OAuth Callback] Email check:', {
        userEmail: user?.email,
        adminEmails,
        isAdminEmail,
      })

      if (user && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const adminClient = createAdminSupabase(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { autoRefreshToken: false } }
        )

        // Check if profile row exists
        const { data: existingProfile, error: profileCheckError } = await adminClient
          .from('profiles')
          .select('id, role')
          .eq('id', user.id)
          .maybeSingle()

        console.log('[OAuth Callback] Profile check:', {
          userId: user.id,
          existingProfile: existingProfile?.id,
          existingRole: existingProfile?.role,
          profileCheckError: profileCheckError?.message,
        })

        if (!existingProfile) {
          // Create profile — no row yet
          const { error: insertError } = await adminClient.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            role: isAdminEmail ? 'admin' : 'client',
          })
          console.log('[OAuth Callback] Profile created:', {
            userId: user.id,
            role: isAdminEmail ? 'admin' : 'client',
            insertError: insertError?.message,
          })
        } else if (isAdminEmail && existingProfile.role !== 'admin') {
          // Promote to admin if needed
          const { error: updateError } = await adminClient
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', user.id)
          console.log('[OAuth Callback] Profile promoted:', {
            userId: user.id,
            updateError: updateError?.message,
          })
        }
      }

      // Redirect decision: use isAdminEmail directly — do NOT call
      // getAuthenticatedProfile() here because the new session cookies were
      // just set on the response and a fresh createClient() would still see
      // the old (empty) request cookies and return ok:false.
      if (isAdminEmail) {
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
