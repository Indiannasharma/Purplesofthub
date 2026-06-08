import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { sendAuthNotificationEmail } from '@/lib/email/auth-notifications'
import { checkRateLimit, rateLimiters } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || null

  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    null
  )
}

async function getAuthenticatedUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {}
        },
      },
    }
  )

  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null

  return data.user
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const type = body?.type

    if (type !== 'welcome' && type !== 'login') {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    const rateLimit = await checkRateLimit(
      rateLimiters.authNotifications,
      getClientIp(request) || 'unknown'
    )

    if (!rateLimit.ok) {
      return NextResponse.json({ error: 'Too many email notification attempts' }, { status: 429 })
    }

    if (type === 'login') {
      const user = await getAuthenticatedUser()

      if (!user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const email = user.email.toLowerCase().trim()

      const result = await sendAuthNotificationEmail({
        type: 'login',
        email,
        fullName:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          email.split('@')[0],
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent'),
      })

      return NextResponse.json({ success: true, ...result })
    }

    const email = String(body?.email || '').toLowerCase().trim().slice(0, 200)
    const fullName = String(body?.fullName || '').trim().slice(0, 120)

    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
    }

    const result = await sendAuthNotificationEmail({
      type: 'welcome',
      email,
      fullName,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Auth notification email failed:', error)
    return NextResponse.json({ error: 'Failed to send auth notification' }, { status: 500 })
  }
}
