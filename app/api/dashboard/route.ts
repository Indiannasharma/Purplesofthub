import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const userRole = session.user.user_metadata?.role

  // Fetch dashboard data based on user role
  if (userRole === 'admin') {
    // Admin dashboard data
    const { data: clients } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .eq('role', 'client')

    const { data: projects } = await supabase
      .from('projects')
      .select('id, title, status, progress, created_at')
      .order('created_at', { ascending: false })

    const { data: revenue } = await supabase
      .from('invoices')
      .select('amount, status')
      .eq('status', 'paid')

    const totalRevenue = revenue?.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0) || 0

    return NextResponse.json({
      role: 'admin',
      stats: {
        totalClients: clients?.length || 0,
        totalProjects: projects?.length || 0,
        totalRevenue,
      },
      recentClients: clients?.slice(0, 5) || [],
      recentProjects: projects?.slice(0, 5) || [],
    })
  } else {
    // Client dashboard data
    const { data: projects } = await supabase
      .from('projects')
      .select('id, title, status, progress, service_type, created_at')
      .eq('client_id', userId)
      .order('created_at', { ascending: false })

    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, amount, status, due_date, created_at')
      .eq('client_id', userId)
      .order('created_at', { ascending: false })

    const { data: musicCampaigns } = await supabase
      .from('music_campaigns')
      .select('id, track_title, artist_name, status, created_at')
      .eq('client_id', userId)
      .order('created_at', { ascending: false })

    const activeProjects = projects?.filter((p: any) => p.status === 'in_progress').length || 0
    const pendingInvoices = invoices?.filter((i: any) => i.status === 'pending').length || 0

    return NextResponse.json({
      role: 'client',
      stats: {
        totalProjects: projects?.length || 0,
        activeProjects,
        totalInvoices: invoices?.length || 0,
        pendingInvoices,
      },
      recentProjects: projects?.slice(0, 3) || [],
      recentInvoices: invoices?.slice(0, 3) || [],
      recentMusicCampaigns: musicCampaigns?.slice(0, 3) || [],
    })
  }
}