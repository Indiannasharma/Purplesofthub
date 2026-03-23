import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public routes — ALWAYS allow these
  const publicPaths = [
    '/',
    '/sign-in',
    '/sign-up',
    '/auth',
    '/auth/callback',
    '/auth/signout',
    '/about',
    '/services',
    '/portfolio',
    '/blog',
    '/contact',
    '/privacy',
    '/terms',
    '/forgot-password',
    '/full-width-pages',
    '/api/contact',
    '/api/chat',
    '/api/newsletter',
    '/api/auth',
    '/api/webhooks',
    '/api/payments/paystack/verify',
    '/_next',
    '/favicon',
    '/images',
    '/fonts',
  ]

  const isPublic = publicPaths.some(
    path => pathname === path || pathname.startsWith(path + '/')
  )

  // Always allow public paths
  if (isPublic) {
    return supabaseResponse
  }

  // No user — redirect to sign in
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    const role = user.user_metadata?.role || user.app_metadata?.role

    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
