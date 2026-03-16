import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import Task from '@/lib/models/Task'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { id } = await params
    await connectDB()
    const tasks = await Task.find({ project: id }).sort({ order: 1, createdAt: 1 }).lean()
    return NextResponse.json({ tasks }, { status: 200 })
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

    if (!title) {
      return NextResponse.json({ error: 'Task title is required.' }, { status: 400 })
    }

    await connectDB()
    const task = await Task.create({
      project: id,
      title,
      description: String(body?.description || ''),
      status: body?.status || 'todo',
      order: Number(body?.order || 0),
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Admin project task POST error:', error)
    return NextResponse.json({ error: 'Failed to create task.' }, { status: 500 })
  }
}
