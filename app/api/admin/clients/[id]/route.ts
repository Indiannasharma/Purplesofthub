import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: client, error } = await supabase
      .from('profiles').select('*').eq('id', id).single()

    if (error || !client) return NextResponse.json({ error: 'Client not found.' }, { status: 404 })

    const [{ data: projects }, { data: invoices }, { data: files }, { data: chatLeads }] =
      await Promise.all([
        supabase.from('projects').select('*').eq('client_id', id).order('updated_at', { ascending: false }),
        supabase.from('invoices').select('*').eq('client_id', id).order('created_at', { ascending: false }),
        supabase.from('files').select('*').eq('client_id', id).order('created_at', { ascending: false }),
        supabase.from('chat_leads').select('*').eq('email', client.email).order('created_at', { ascending: false }),
      ])

    return NextResponse.json({ client, projects, invoices, files, chatLeads })
  } catch (error) {
    console.error('Admin client GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch client.' }, { status: 500 })
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
    if (body?.full_name !== undefined) update.full_name = String(body.full_name)
    if (body?.role !== undefined) update.role = String(body.role)

    const { data: client, error } = await supabase
      .from('profiles').update(update).eq('id', id).select().single()

    if (error || !client) return NextResponse.json({ error: 'Client not found.' }, { status: 404 })

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Admin client PUT error:', error)
    return NextResponse.json({ error: 'Failed to update client.' }, { status: 500 })
  }
}
