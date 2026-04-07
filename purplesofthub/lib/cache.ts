import { redis } from './redis'

export async function getCached<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // If Redis is not configured, skip caching
  if (!redis) {
    return fetchFn()
  }

  try {
    const cached = await redis.get<T>(key)
    if (cached !== null) return cached
    const data = await fetchFn()
    await redis.set(key, data, { ex: ttlSeconds })
    return data
  } catch (error) {
    console.error('Cache error, falling back to direct fetch:', error)
    return fetchFn()
  }
}

export async function invalidateCache(...keys: string[]): Promise<void> {
  if (keys.length === 0) return

  // If Redis is not configured, skip invalidation
  if (!redis) {
    return
  }

  try {
    await redis.del(...keys)
  } catch (error) {
    console.error('Cache invalidate error:', error)
  }
}
