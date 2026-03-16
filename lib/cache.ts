import { redis } from './redis'

export async function getCached<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = await redis.get<T>(key)
  if (cached !== null) return cached
  const data = await fetchFn()
  await redis.set(key, data, { ex: ttlSeconds })
  return data
}

export async function invalidateCache(...keys: string[]): Promise<void> {
  if (keys.length === 0) return
  await redis.del(...keys)
}
