import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import AdminContent from './admin-content'

export const metadata: Metadata = {
  title: 'Admin Dashboard | PurpleSoftHub',
  description: 'PurpleSoftHub Admin Dashboard',
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/sign-in')

  const role = session.user.user_metadata?.role || session.user.app_metadata?.role
  if (role !== 'admin') redirect('/dashboard')

  // Fetch all stats
  const [
    { count: totalClients },
    { count: totalProjects },
    { count: activeProjects },
    { count: pendingInvoices },
    { count: newLeads },
    { count: subscribers },
    { data: allInvoices },
    { data: allProjects },
    { data: recentClients },
    { data: recentProjects },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).not('status', 'eq', 'completed'),
    supabase.from('invoices').select('*', { count: 'exact', head: true }).in('status', ['pending', 'overdue']),
    supabase.from('chat_leads').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7*24*60*60*1000).toISOString()),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
    supabase.from('invoices').select('amount, status, created_at'),
    supabase.from('projects').select('status, created_at'),
    supabase.from('profiles').select('*').eq('role', 'client').order('created_at', { ascending: false }).limit(5),
    supabase.from('projects').select('*, profiles(full_name, email)').order('created_at', { ascending: false }).limit(5),
  ])

  // Revenue chart data (last 6 months)
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5-i)
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)
    const monthInvoices = allInvoices?.filter(inv => {
      const d = new Date(inv.created_at)
      return d >= monthStart && d <= monthEnd && inv.status === 'paid'
    }) || []
    const revenue = monthInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0)
    return { month: format(date, 'MMM'), revenue }
  })

  // Projects by status
  const statusCounts = (allProjects || []).reduce((acc: Record<string, number>, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})
  const projectsDonutData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

  // Client growth
  const { data: allClients } = await supabase.from('profiles').select('created_at').eq('role', 'client')
  const clientGrowthData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5-i)
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)
    const count = (allClients || []).filter(c => {
      const d = new Date(c.created_at)
      return d >= monthStart && d <= monthEnd
    }).length
    return { month: format(date, 'MMM'), count }
  })

  // Invoice stats
  const invoiceStatsData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5-i)
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)
    const monthInvs = (allInvoices || []).filter(inv => {
      const d = new Date(inv.created_at)
      return d >= monthStart && d <= monthEnd
    })
    const paid = monthInvs.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount || 0), 0)
    const pending = monthInvs.filter(i => i.status === 'pending').reduce((s, i) => s + (i.amount || 0), 0)
    const overdue = monthInvs.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.amount || 0), 0)
    return { month: format(date, 'MMM'), paid, pending, overdue }
  })

  // Total revenue
  const totalRevenue = (allInvoices || []).filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0)

  // Map data
  const mapData: Record<string, number> = {
    'NG': totalClients || 0,
    'US': 2,
    'GB': 1,
    'GH': 1,
    'ZA': 1,
  }

  return (
    <AdminContent
      totalClients={totalClients || 0}
      activeProjects={activeProjects || 0}
      totalRevenue={totalRevenue}
      pendingInvoices={pendingInvoices || 0}
      newLeads={newLeads || 0}
      subscribers={subscribers || 0}
      totalProjects={totalProjects || 0}
      revenueData={revenueData}
      projectsDonutData={projectsDonutData}
      clientGrowthData={clientGrowthData}
      invoiceStatsData={invoiceStatsData}
      mapData={mapData}
      recentClients={recentClients || []}
      recentProjects={recentProjects || []}
    />
  )
}
