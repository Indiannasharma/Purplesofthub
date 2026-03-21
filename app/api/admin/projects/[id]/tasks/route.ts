import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: tasks, error } = await supabase
      .from('tasks').select('*').eq('project_id', id).order('order', { ascending: true })

    if (error) throw error
    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Admin project tasks GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { id } = await params
    const body = await req.json()
    const title = String(body?.title || '').trim()

    if (!title) return NextResponse.json({ error: 'Task title is required.' }, { status: 400 })

    const supabase = await createClient()

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        project_id: id,
        title,
        description: String(body?.description || ''),
        status: body?.status || 'todo',
        order: Number(body?.order || 0),
      })
      .select().single()

    if (error) throw error
    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Admin project task POST error:', error)
    return NextResponse.json({ error: 'Failed to create task.' }, { status: 500 })
  }
}
