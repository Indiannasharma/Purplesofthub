import { eligiblePage } from '@/lib/analytics/policy'

export type DateRange = { start: string; end: string; previousStart: string; previousEnd: string; days: number; period: string }
const DAY = 86400000
const iso = (time: number) => new Date(time).toISOString().slice(0, 10)
function day(value: unknown): number {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw Error('Use valid calendar dates.')
  const time = Date.parse(value + 'T00:00:00Z')
  if (!Number.isFinite(time) || iso(time) !== value) throw Error('Use valid calendar dates.')
  return time
}
export function dateRange(input: Record<string, unknown>, now = Date.now()): DateRange {
  const period = input.period ?? '30'
  const yesterday = Math.floor(now / DAY) * DAY - DAY
  let end = yesterday, start: number
  if (period === 'custom') { start = day(input.start); end = day(input.end) }
  else if (['7', '30', '90'].includes(String(period))) start = end - (Number(period) - 1) * DAY
  else throw Error('Choose 7, 30, 90 days or a custom range.')
  const days = (end - start) / DAY + 1
  if (days < 1 || days > 90 || end > yesterday || start < Date.UTC(2020, 0, 1)) throw Error('Select 1–90 completed calendar days, ending no later than yesterday (UTC).')
  return { start: iso(start), end: iso(end), previousStart: iso(start - days * DAY), previousEnd: iso(start - DAY), days, period: String(period) }
}
export function dates(range: DateRange): string[] { return Array.from({ length: range.days }, (_, i) => iso(Date.parse(range.start) + i * DAY)) }
export function exclusiveEnd(date: string) { return new Date(day(date) + DAY).toISOString() }
export function percentChange(current: number, previous: number): number | null { return previous > 0 ? (current - previous) / previous * 100 : null }

// Reuse the tracking policy; narrow further for historical preview/private records.
export function publicReportPath(value: string): string | null {
  if (value.includes('?') || value.includes('#') || /\/(preview|draft|checkout|payment|callback|account-recovery)(\/|$)/i.test(value)) return null
  return eligiblePage(value) ? value : null
}
const serviceSlugs = ['web-development','mobile-app-development','digital-marketing','ui-ux-design','saas-development','music-promotion','music-distribution','branding-design','branding-creative-design','logo-design','social-media-management','seo','seo-content','content-creation','video-content-creation','facebook-and-instagram-ads','facebook-ads','google-ads','ecommerce-development']
const fixed = ['/', '/about', '/contact', '/services', '/portfolio', '/insights', '/blog', '/academy', '/music', ...serviceSlugs.flatMap(slug => ['/services/' + slug, '/services/' + slug + '/pricing'])].filter(path => publicReportPath(path))
export const PUBLIC_PATH_PATTERN = '^(' + fixed.map(path => path === '/' ? '/' : path + '/?').join('|') + '|/(blog|insights|portfolio)/[a-z0-9-]+/?|/insights/category/[a-z0-9-]+/?)$'
export const PRIVATE_PATH_PATTERN = '/(preview|draft|checkout|payment|callback|account-recovery)(/|$)'

export type Summary = { users: number; sessions: number; views: number; engagement: number }
export type TrafficPoint = { date: string; users: number; sessions: number; views: number }
export type PageMetric = { path: string; views: number; users: number; engagement: number; share: number | null }
export type Distribution = { label: string; count: number }
export type TrafficData = { current: Summary; previous: Summary; trend: TrafficPoint[]; pages: PageMetric[]; pageRowCount: number; sources: Distribution[]; countries: Distribution[]; devices: Distribution[]; timezone: string; qualityLimited: boolean }
export type NewsletterData = { total: number; active: number; current: number; previous: number; trend: { date: string; count: number }[] | null; trendMessage: string | null }
export type SourceResult<T> = { status: 'connected'; data: T; updatedAt: string } | { status: 'disconnected' | 'error'; message: string; updatedAt: string }
export type AnalyticsSnapshot = { range: DateRange; traffic: SourceResult<TrafficData>; newsletter: SourceResult<NewsletterData> }
