import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AdminPage } from '@/components/admin/AdminPage'
import AnalyticsDashboard from '@/components/admin/analytics/AnalyticsDashboard'
import { authorizedAnalytics } from '@/lib/admin/analytics/service'
export const dynamic = 'force-dynamic'
export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const result = await authorizedAnalytics(await searchParams)
  if (!result.ok) {
    if (result.status === 401) redirect('/sign-in')
    if (result.status === 403) redirect('/dashboard')
    return <AdminPage><h1>Analytics unavailable</h1><p role="alert">{result.error}</p><Link href="/admin/analytics">Reset date filters</Link></AdminPage>
  }
  return <AdminPage><AnalyticsDashboard snapshot={result.snapshot} view="overview" /></AdminPage>
}
