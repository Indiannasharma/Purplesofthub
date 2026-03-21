import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const supabase = await createClient()

    const { data: clients, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .eq('role', 'client')
      .order('created_at', { ascending: false })

    if (error) throw error

    const clientIds = (clients ?? []).map((c) => c.id)

    const [{ data: projectCounts }, { data: paidInvoices }] = await Promise.all([
      supabase.from('projects').select('client_id').in('client_id', clientIds),
      supabase.from('invoices').select('client_id, amount').in('client_id', clientIds).eq('status', 'paid'),
    ])

    const projectsMap = new Map<string, number>()
    ;(projectCounts ?? []).forEach((p) => {
      projectsMap.set(p.client_id, (projectsMap.get(p.client_id) ?? 0) + 1)
    })

    const revenueMap = new Map<string, number>()
    ;(paidInvoices ?? []).forEach((inv) => {
      revenueMap.set(inv.client_id, (revenueMap.get(inv.client_id) ?? 0) + Number(inv.amount ?? 0))
    })

    const enriched = (clients ?? []).map((client) => ({
      ...client,
      projectsCount: projectsMap.get(client.id) ?? 0,
      totalSpent: revenueMap.get(client.id) ?? 0,
    }))

    return NextResponse.json({ clients: enriched })
  } catch (error) {
    console.error('Admin clients GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch clients.' }, { status: 500 })
  }
}
