import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

function buildInvoiceNumber() {
  const now = new Date()
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `INV-${stamp}-${random}`
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const supabase = await createClient()

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*, profiles:client_id(email, full_name), projects:project_id(title)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Admin invoices GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const body = await req.json()
    const clientId = String(body?.client_id || body?.client || '').trim()

    if (!clientId) return NextResponse.json({ error: 'Client is required.' }, { status: 400 })

    const amount = Number(body?.amount || 0)
    if (!amount) return NextResponse.json({ error: 'Amount is required.' }, { status: 400 })

    const supabase = await createClient()

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        client_id: clientId,
        project_id: body?.project_id || null,
        amount,
        currency: body?.currency || 'USD',
        status: body?.status || 'pending',
        due_date: body?.due_date || null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    console.error('Admin invoices POST error:', error)
    return NextResponse.json({ error: 'Failed to create invoice.' }, { status: 500 })
  }
}
