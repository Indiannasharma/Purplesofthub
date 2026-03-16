import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis'

export const rateLimiters = {
  contact: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    prefix: 'rl:contact',
  }),
  chat: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '5 m'),
    prefix: 'rl:chat',
  }),
  chatLead: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 m'),
    prefix: 'rl:chatLead',
  }),
  newsletter: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    prefix: 'rl:newsletter',
  }),
}

export async function checkRateLimit(
  limiter: Ratelimit,
  key: string
): Promise<{ ok: boolean; remaining: number; resetAt: number }> {
  const { success, remaining, reset } = await limiter.limit(key)
  return { ok: success, remaining, resetAt: reset }
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  return headers.get('x-real-ip') || 'unknown'
}
