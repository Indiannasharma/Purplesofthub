import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Public routes — no auth needed
  const publicRoutes = [
    '/',
    '/about',
    '/services',
    '/portfolio',
    '/blog',
    '/contact',
    '/privacy',
    '/terms',
    '/sign-in',
    '/sign-up',
  ]

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  const isPublicApi =
    pathname.startsWith('/api/contact') ||
    pathname.startsWith('/api/chat') ||
    pathname.startsWith('/api/newsletter') ||
    pathname.startsWith('/api/webhooks')

  // Allow public routes and public APIs
  if (isPublicRoute || isPublicApi) {
    return res
  }

  // No session → redirect to sign-in
  if (!session) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Get user role from metadata
  const role =
    session.user.user_metadata?.role ||
    session.user.app_metadata?.role ||
    'client'

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/contact|api/chat|api/newsletter|api/webhooks).*)',
  ],
}
