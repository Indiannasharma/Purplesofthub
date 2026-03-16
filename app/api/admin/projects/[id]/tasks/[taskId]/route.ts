import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import Task from '@/lib/models/Task'

export async function PUT(req: NextRequest, { params }: { params: { id: string; taskId: string } }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const body = await req.json()
    const update: Record<string, unknown> = {}

    if (body?.title !== undefined) update.title = String(body.title).trim()
    if (body?.description !== undefined) update.description = String(body.description)
    if (body?.status !== undefined) update.status = String(body.status)
    if (body?.order !== undefined) update.order = Number(body.order || 0)

    await connectDB()
    const task = await Task.findOneAndUpdate(
      { _id: params.taskId, project: params.id },
      { $set: update },
      { new: true }
    ).lean()

    if (!task) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 })
    }

    return NextResponse.json({ task }, { status: 200 })
  } catch (error) {
    console.error('Admin task PUT error:', error)
    return NextResponse.json({ error: 'Failed to update task.' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string; taskId: string } }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    await connectDB()
    const task = await Task.findOneAndDelete({ _id: params.taskId, project: params.id }).lean()
    if (!task) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 })
    }
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Admin task DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete task.' }, { status: 500 })
  }
}
