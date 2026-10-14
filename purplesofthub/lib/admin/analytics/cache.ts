import 'server-only'

/** Bounded per-process cache + in-flight deduplication. Authorization belongs outside. */
export class ReportCache {
  private values = new Map<string, { until: number; value: Promise<unknown> }>()
  async get<T>(key: string, load: () => Promise<T>, ttl = 600000): Promise<T> {
    const hit = this.values.get(key)
    if (hit && hit.until > Date.now()) return hit.value as Promise<T>
    if (this.values.size >= 20) this.values.delete(this.values.keys().next().value!)
    const value = load()
    this.values.set(key, { until: Date.now() + ttl, value })
    try { return await value } catch (error) { this.values.delete(key); throw error }
  }
}
