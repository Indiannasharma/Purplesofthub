import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: project, error } = await supabase
      .from('projects').select('*, profiles:client_id(email, full_name)').eq('id', id).single()

    if (error || !project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 })

    const [{ data: tasks }, { data: files }] = await Promise.all([
      supabase.from('tasks').select('*').eq('project_id', id).order('order', { ascending: true }),
      supabase.from('files').select('*').eq('project_id', id).order('created_at', { ascending: false }),
    ])

    return NextResponse.json({ project, tasks: tasks ?? [], files: files ?? [] })
  } catch (error) {
    console.error('Admin project GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch project.' }, { status: 500 })
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
    if (body?.title !== undefined) update.title = String(body.title).trim()
    if (body?.description !== undefined) update.description = String(body.description)
    if (body?.status !== undefined) update.status = String(body.status)
    if (body?.progress !== undefined) update.progress = Number(body.progress || 0)
    if (body?.start_date !== undefined) update.start_date = body.start_date || null
    if (body?.end_date !== undefined) update.end_date = body.end_date || null
    if (body?.budget !== undefined) update.budget = body.budget ? Number(body.budget) : null

    const { data: project, error } = await supabase
      .from('projects').update(update).eq('id', id).select().single()

    if (error || !project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
    return NextResponse.json({ project })
  } catch (error) {
    console.error('Admin project PUT error:', error)
    return NextResponse.json({ error: 'Failed to update project.' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { id } = await params
    const supabase = await createClient()

    await Promise.all([
      supabase.from('tasks').delete().eq('project_id', id),
      supabase.from('files').delete().eq('project_id', id),
    ])

    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin project DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete project.' }, { status: 500 })
  }
}
