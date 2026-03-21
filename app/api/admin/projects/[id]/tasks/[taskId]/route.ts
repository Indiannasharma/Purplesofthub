import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { taskId } = await params
    const body = await req.json()
    const supabase = await createClient()

    const update: Record<string, unknown> = {}
    if (body?.title !== undefined) update.title = String(body.title).trim()
    if (body?.description !== undefined) update.description = String(body.description)
    if (body?.status !== undefined) update.status = String(body.status)
    if (body?.order !== undefined) update.order = Number(body.order || 0)

    const { data: task, error } = await supabase
      .from('tasks').update(update).eq('id', taskId).select().single()

    if (error || !task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 })
    return NextResponse.json({ task })
  } catch (error) {
    console.error('Admin task PUT error:', error)
    return NextResponse.json({ error: 'Failed to update task.' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { taskId } = await params
    const supabase = await createClient()

    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) return NextResponse.json({ error: 'Task not found.' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin task DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete task.' }, { status: 500 })
  }
}
