import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/services(.*)',
  '/portfolio(.*)',
  '/blog(.*)',
  '/contact',
  '/privacy',
  '/terms',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/contact(.*)',
  '/api/chat(.*)',
  '/api/newsletter(.*)',
  '/api/webhooks(.*)',
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const { userId, sessionClaims } = await auth()

    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    if (isAdminRoute(req)) {
      const role =
        (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role ||
        (sessionClaims?.metadata as { role?: string } | undefined)?.role
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  }
})

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
}
