import { createServerClient } from '@supabase/ssr'
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
