import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis'

// Only create rate limiters if Redis is configured
type RateLimiters = {
  contact?: Ratelimit
  chat?: Ratelimit
  chatLead?: Ratelimit
  newsletter?: Ratelimit
  authNotifications?: Ratelimit
  recovery?: Ratelimit
}

const rateLimiters: RateLimiters = {}

if (redis) {
  rateLimiters.contact = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    prefix: 'rl:contact',
  })
  rateLimiters.chat = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '5 m'),
    prefix: 'rl:chat',
  })
  rateLimiters.chatLead = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 m'),
    prefix: 'rl:chatLead',
  })
  rateLimiters.newsletter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    prefix: 'rl:newsletter',
  })
  rateLimiters.authNotifications = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    prefix: 'rl:authNotifications',
  })
  // Account-recovery submissions: a legitimate applicant needs one submission
  // (maybe a retry). The key is a salted hash of the client IP — the raw
  // address is never stored or logged.
  rateLimiters.recovery = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    prefix: 'rl:recovery',
  })
}

export { rateLimiters }

export async function checkRateLimit(
  limiter: Ratelimit | undefined,
  key: string
): Promise<{ ok: boolean; remaining: number; resetAt: number }> {
  // If rate limiter is not configured, allow all requests
  if (!limiter) {
    return { ok: true, remaining: 999, resetAt: Date.now() + 600000 }
  }

  try {
    const { success, remaining, reset } = await limiter.limit(key)
    return { ok: success, remaining, resetAt: reset }
  } catch (error) {
    // Fail OPEN. An unreachable or misconfigured rate-limit backend (for
    // example placeholder Upstash credentials in the environment) must never
    // take a public endpoint down with a 500. Callers still enforce schema,
    // size, MIME/signature and CAPTCHA checks, and the failure is logged.
    console.warn(
      '[rateLimit] limiter unavailable — allowing request:',
      error instanceof Error ? error.message : 'unknown error'
    )
    return { ok: true, remaining: 999, resetAt: Date.now() + 60000 }
  }
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  return headers.get('x-real-ip') || 'unknown'
}
