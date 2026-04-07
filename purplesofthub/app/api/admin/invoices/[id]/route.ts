import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*, profiles:client_id(email, full_name), projects:project_id(title)')
      .eq('id', id)
      .single()

    if (error || !invoice) return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 })
    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Admin invoice GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoice.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { id } = await params
    const body = await req.json()
    const supabase = await createClient()

    const update: Record<string, unknown> = {}
    if (body?.status !== undefined) update.status = String(body.status)
    if (body?.amount !== undefined) update.amount = Number(body.amount)
    if (body?.currency !== undefined) update.currency = String(body.currency)
    if (body?.due_date !== undefined) update.due_date = body.due_date || null
    if (body?.paid_at !== undefined) update.paid_at = body.paid_at || null

    const { data: invoice, error } = await supabase
      .from('invoices').update(update).eq('id', id).select().single()

    if (error || !invoice) return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 })
    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Admin invoice PUT error:', error)
    return NextResponse.json({ error: 'Failed to update invoice.' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase.from('invoices').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin invoice DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete invoice.' }, { status: 500 })
  }
}
