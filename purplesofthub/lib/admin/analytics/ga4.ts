import 'server-only'
import { createHash, sign } from 'node:crypto'
import { dates, PRIVATE_PATH_PATTERN, PUBLIC_PATH_PATTERN, publicReportPath, type DateRange, type SourceResult, type Summary, type TrafficData } from './model'

type RawReport = {
  metricHeaders?: { name: string }[]; dimensionHeaders?: { name: string }[]
  rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[]
  rowCount?: number
  metadata?: { timeZone?: string; subjectToThresholding?: boolean; samplingMetadatas?: unknown[]; dataLossFromOtherRow?: boolean; emptyReason?: string }
}
class ReportingError extends Error { constructor(public status: number) { super('Google reporting unavailable') } }
let token: { fingerprint: string; value: Promise<string>; until: number } | undefined
const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
async function jsonRequest(url: string, init: RequestInit) {
  const timeout = AbortSignal.timeout(12000)
  const response = await fetch(url, { ...init, cache: 'no-store', signal: init.signal ? AbortSignal.any([init.signal, timeout]) : timeout })
  if (!response.ok) throw new ReportingError(response.status)
  return response.json()
}
async function accessToken(email: string, privateKey: string) {
  const fingerprint = createHash('sha256').update(email + privateKey).digest('hex')
  if (token?.fingerprint === fingerprint && token.until > Date.now()) return token.value
  const value = (async () => {
    const now = Math.floor(Date.now() / 1000)
    const unsigned = encode({ alg: 'RS256', typ: 'JWT' }) + '.' + encode({ iss: email, scope: 'https://www.googleapis.com/auth/analytics.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })
    const assertion = unsigned + '.' + sign('RSA-SHA256', Buffer.from(unsigned), privateKey.replace(/\\n/g, '\n')).toString('base64url')
    const result = await jsonRequest('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }) })
    if (typeof result.access_token !== 'string' || !result.access_token || !Number.isFinite(result.expires_in) || result.expires_in < 60) throw Error('Invalid token response')
    if (token?.fingerprint === fingerprint) token.until = Date.now() + Math.min(result.expires_in - 30, 3300) * 1000
    return result.access_token as string
  })()
  token = { fingerprint, value, until: Date.now() + 30000 }
  try { return await value } catch (error) { if (token?.fingerprint === fingerprint) token = undefined; throw error }
}
export function reportRows(report: RawReport, dimensionNames: string[], metricNames: string[]) {
  const mi = metricNames.map(name => report.metricHeaders?.findIndex(h => h.name === name) ?? -1)
  const di = dimensionNames.map(name => report.dimensionHeaders?.findIndex(h => h.name === name) ?? -1)
  if ([...mi, ...di].includes(-1) || report.metadata?.emptyReason) throw Error('Incomplete report')
  return (report.rows || []).map(row => ({
    dimensions: di.map(i => { const value = row.dimensionValues?.[i]?.value; if (typeof value !== 'string') throw Error('Invalid dimension'); return value }),
    metrics: mi.map(i => { const raw = row.metricValues?.[i]?.value; const value = Number(raw); if (!raw?.trim() || !Number.isFinite(value) || value < 0) throw Error('Invalid metric'); return value }),
  }))
}
export const PUBLIC_DIMENSION_FILTER = { andGroup: { expressions: [
  { filter: { fieldName: 'hostName', inListFilter: { values: ['www.purplesofthub.com', 'purplesofthub.com'], caseSensitive: false } } },
  { filter: { fieldName: 'pagePath', stringFilter: { matchType: 'FULL_REGEXP', value: PUBLIC_PATH_PATTERN, caseSensitive: true } } },
  { notExpression: { filter: { fieldName: 'pagePath', stringFilter: { matchType: 'PARTIAL_REGEXP', value: PRIVATE_PATH_PATTERN, caseSensitive: false } } } },
] } }
export function reportRequests(range: DateRange) {
  const request = (dimensions: string[], metrics: string[], previous = false, limit = 100) => ({
    dateRanges: [{ startDate: previous ? range.previousStart : range.start, endDate: previous ? range.previousEnd : range.end }],
    dimensions: dimensions.map(name => ({ name })), metrics: metrics.map(name => ({ name })),
    dimensionFilter: PUBLIC_DIMENSION_FILTER, limit: String(limit),
    orderBys: dimensions[0] === 'date' ? [{ dimension: { dimensionName: 'date' } }] : dimensions.length ? [{ metric: { metricName: metrics[0] }, desc: true }] : [],
  })
  const summary = ['activeUsers', 'sessions', 'screenPageViews', 'engagementRate']
  return [request([], summary), request([], summary, true), request(['date'], summary.slice(0, 3)),
    request(['pagePath'], ['screenPageViews', 'activeUsers', 'engagementRate']),
    request(['sessionDefaultChannelGroup'], ['sessions'], false, 12), request(['country'], ['activeUsers'], false, 8), request(['deviceCategory'], ['activeUsers'], false, 10)]
}
export function normalizeReports(reports: RawReport[], range: DateRange): TrafficData {
  if (reports.length !== 7 || reports.some(r => !r || typeof r !== 'object')) throw Error('Missing reports')
  const summary = (report: RawReport): Summary => {
    const rows = reportRows(report, [], ['activeUsers', 'sessions', 'screenPageViews', 'engagementRate'])
    if (rows.length > 1 || (!rows.length && report.metadata?.subjectToThresholding)) throw Error('Incomplete totals')
    const [users, sessions, views, engagement] = rows[0]?.metrics || [0, 0, 0, 0]
    if (![users, sessions, views].every(Number.isSafeInteger) || engagement > 1) throw Error('Invalid totals')
    return { users, sessions, views, engagement }
  }
  const current = summary(reports[0]), previous = summary(reports[1])
  const qualityLimited = reports.some(r => r.metadata?.subjectToThresholding || r.metadata?.samplingMetadatas?.length || r.metadata?.dataLossFromOtherRow)
  const points = new Map(reportRows(reports[2], ['date'], ['activeUsers', 'sessions', 'screenPageViews']).map(row => {
    const raw = row.dimensions[0], date = raw.slice(0, 4) + '-' + raw.slice(4, 6) + '-' + raw.slice(6)
    if (!/^\d{8}$/.test(raw) || !dates(range).includes(date) || !row.metrics.every(Number.isSafeInteger)) throw Error('Invalid daily data')
    return [date, { date, users: row.metrics[0], sessions: row.metrics[1], views: row.metrics[2] }] as const
  }))
  const trend = qualityLimited ? [...points.values()] : dates(range).map(date => points.get(date) || { date, users: 0, sessions: 0, views: 0 })
  const pages = reportRows(reports[3], ['pagePath'], ['screenPageViews', 'activeUsers', 'engagementRate']).flatMap(row => {
    const path = publicReportPath(row.dimensions[0]); if (!path) return []
    const [views, users, engagement] = row.metrics
    if (![views, users].every(Number.isSafeInteger) || engagement > 1) throw Error('Invalid page data')
    return [{ path, views, users, engagement, share: current.views > 0 ? views / current.views * 100 : null }]
  })
  const distribution = (index: number, dimension: string, metric: string) => reportRows(reports[index], [dimension], [metric]).map(row => {
    if (!Number.isSafeInteger(row.metrics[0])) throw Error('Invalid distribution')
    return { label: row.dimensions[0].slice(0, 80), count: row.metrics[0] }
  })
  const timezone = reports[0].metadata?.timeZone
  if (!timezone) throw Error('Reporting timezone unavailable')
  new Intl.DateTimeFormat('en', { timeZone: timezone }).format(new Date())
  return { current, previous, trend, pages, pageRowCount: reports[3].rowCount ?? pages.length, sources: distribution(4, 'sessionDefaultChannelGroup', 'sessions'), countries: distribution(5, 'country', 'activeUsers'), devices: distribution(6, 'deviceCategory', 'activeUsers'), timezone, qualityLimited }
}
export async function ga4Report(range: DateRange): Promise<SourceResult<TrafficData>> {
  const updatedAt = new Date().toISOString()
  const property = process.env.GA4_PROPERTY_ID, email = process.env.GA4_SERVICE_ACCOUNT_EMAIL, privateKey = process.env.GA4_PRIVATE_KEY
  if (!property || !email || !privateKey) return { status: 'disconnected', updatedAt, message: 'Connect your Google Analytics property to view verified website traffic and audience insights.' }
  try {
    if (!/^[1-9]\d{0,19}$/.test(property) || !/^[^\s@]+@[^\s@]+\.iam\.gserviceaccount\.com$/.test(email)) throw Error('Invalid configuration')
    const signal = AbortSignal.timeout(25000)
    const access = await accessToken(email, privateKey)
    const requests = reportRequests(range), reports: RawReport[] = []
    for (let offset = 0; offset < requests.length; offset += 5) {
      const result = await jsonRequest('https://analyticsdata.googleapis.com/v1beta/properties/' + property + ':batchRunReports', { method: 'POST', signal, headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json' }, body: JSON.stringify({ requests: requests.slice(offset, offset + 5) }) })
      if (!Array.isArray(result.reports) || result.reports.length !== Math.min(5, requests.length - offset)) throw Error('Incomplete batch')
      reports.push(...result.reports)
    }
    return { status: 'connected', data: normalizeReports(reports, range), updatedAt }
  } catch (error) {
    const message = error instanceof ReportingError && [401, 403].includes(error.status) ? 'Google denied reporting access. Verify the service account permissions and enabled Data API.'
      : error instanceof ReportingError && error.status === 429 ? 'Google reporting quota reached. Retry after the report cache refreshes.' : 'Google Analytics reports could not be verified. Check configuration or retry after a temporary network failure.'
    return { status: 'error', message, updatedAt }
  }
}
