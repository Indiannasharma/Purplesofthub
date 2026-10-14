import 'server-only'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { dates, exclusiveEnd, type DateRange, type NewsletterData, type SourceResult } from './model'

/** Counts aggregate in Postgres; only bounded, selected-period timestamps leave it. */
export async function newsletterReport(range: DateRange): Promise<SourceResult<NewsletterData>> {
  const updatedAt = new Date().toISOString()
  const db = createServiceRoleClient()
  if (!db) return { status: 'error', message: 'Newsletter reporting is not configured.', updatedAt }
  try {
    const signal = AbortSignal.timeout(15000)
    const count = () => db.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).abortSignal(signal)
    const results = await Promise.all([
      count(), count().eq('status', 'active'),
      count().gte('created_at', range.start + 'T00:00:00Z').lt('created_at', exclusiveEnd(range.end)),
      count().gte('created_at', range.previousStart + 'T00:00:00Z').lt('created_at', exclusiveEnd(range.previousEnd)),
    ])
    if (results.some(r => r.error || r.count === null || !Number.isSafeInteger(r.count) || r.count! < 0)) throw Error('Counts unavailable')
    const [total, active, current, previous] = results.map(r => r.count!)
    let trend: NewsletterData['trend'] = null
    let trendMessage: string | null = null
    if (current > 10000) trendMessage = 'Daily detail exceeds the 10,000-record safety limit. Verified aggregate counts remain available.'
    else {
      const buckets = new Map(dates(range).map(date => [date, 0]))
      let read = 0
      for (let offset = 0; offset < current; offset += 1000) {
        const result = await db.from('newsletter_subscribers').select('created_at').gte('created_at', range.start + 'T00:00:00Z').lt('created_at', exclusiveEnd(range.end))
          .order('created_at').order('id').range(offset, Math.min(offset + 999, current - 1)).abortSignal(signal)
        if (result.error || !result.data) throw Error('Daily detail unavailable')
        for (const row of result.data) {
          const date = new Date(row.created_at).toISOString().slice(0, 10)
          if (!buckets.has(date)) throw Error('Invalid timestamp')
          buckets.set(date, buckets.get(date)! + 1); read++
        }
      }
      if (read !== current) trendMessage = 'Subscriptions changed during this read. Daily detail will be retried after the cache refresh.'
      else trend = [...buckets].map(([date, count]) => ({ date, count }))
    }
    return { status: 'connected', updatedAt, data: { total, active, current, previous, trend, trendMessage } }
  } catch { return { status: 'error', message: 'Newsletter records could not be verified. Retry shortly; no estimated counts are shown.', updatedAt } }
}
