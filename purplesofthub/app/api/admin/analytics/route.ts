import { NextRequest, NextResponse } from 'next/server'
import { authorizedAnalytics } from '@/lib/admin/analytics/service'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function GET(request: NextRequest) {
  try {
    const result = await authorizedAnalytics(Object.fromEntries(request.nextUrl.searchParams))
    return NextResponse.json(result.ok ? result.snapshot : { error: result.error }, { status: result.ok ? 200 : result.status, headers: { 'Cache-Control': 'private, no-store', 'Vary': 'Cookie' } })
  } catch { return NextResponse.json({ error: 'Reporting is temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'private, no-store' } }) }
}
