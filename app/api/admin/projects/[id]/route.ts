import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import Project from '@/lib/models/Project'
import Task from '@/lib/models/Task'
import File from '@/lib/models/File'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    await connectDB()
    const project = await Project.findById(params.id)
      .populate('client', 'firstName lastName email avatar')
      .populate('service', 'name category')
      .lean()

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
    }

    const [tasks, files] = await Promise.all([
      Task.find({ project: project._id }).sort({ order: 1, createdAt: 1 }).lean(),
      File.find({ project: project._id }).sort({ createdAt: -1 }).lean(),
    ])

    return NextResponse.json({ project, tasks, files }, { status: 200 })
  } catch (error) {
    console.error('Admin project GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch project.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const body = await req.json()
    const update: Record<string, unknown> = {}

    if (body?.title !== undefined) update.title = String(body.title).trim()
    if (body?.description !== undefined) update.description = String(body.description)
    if (body?.status !== undefined) update.status = String(body.status)
    if (body?.progress !== undefined) update.progress = Number(body.progress || 0)
    if (body?.startDate !== undefined) update.startDate = body.startDate ? new Date(body.startDate) : null
    if (body?.dueDate !== undefined) update.dueDate = body.dueDate ? new Date(body.dueDate) : null

    await connectDB()
    const project = await Project.findByIdAndUpdate(params.id, { $set: update }, { new: true }).lean()

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
    }

    return NextResponse.json({ project }, { status: 200 })
  } catch (error) {
    console.error('Admin project PUT error:', error)
    return NextResponse.json({ error: 'Failed to update project.' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    await connectDB()
    const project = await Project.findByIdAndDelete(params.id).lean()
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
    }
    await Task.deleteMany({ project: project._id })
    await File.deleteMany({ project: project._id })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Admin project DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete project.' }, { status: 500 })
  }
}
