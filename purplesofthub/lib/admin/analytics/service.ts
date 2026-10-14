import 'server-only'
import { createHash } from 'node:crypto'
import { requireAdmin } from '@/lib/auth'
import { dateRange, type AnalyticsSnapshot } from './model'
import { ga4Report } from './ga4'
import { newsletterReport } from './newsletter'
import { ReportCache } from './cache'

const cache = new ReportCache()
/** Called by BOTH server pages and API. The authorization check is never cached. */
export async function authorizedAnalytics(query: Record<string, unknown>) {
  const auth = await requireAdmin()
  if (!auth.ok) return { ok: false as const, status: auth.response.status, error: auth.response.status === 401 ? 'Authentication required.' : 'Administrator access required.' }
  let range
  try { range = dateRange(query) } catch (error) { return { ok: false as const, status: 400, error: error instanceof Error ? error.message : 'Invalid date range.' } }
  const identity = createHash('sha256').update(['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GA4_PROPERTY_ID', 'GA4_SERVICE_ACCOUNT_EMAIL', 'GA4_PRIVATE_KEY'].map(key => process.env[key] || '').join('|')).digest('hex')
  const snapshot = await cache.get<AnalyticsSnapshot>(identity + range.start + range.end, async () => {
    const [traffic, newsletter] = await Promise.all([ga4Report(range), newsletterReport(range)])
    return { range, traffic, newsletter }
  })
  return { ok: true as const, snapshot: { ...snapshot, range } }
}
