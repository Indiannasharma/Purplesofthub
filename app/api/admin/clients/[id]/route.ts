import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import User from '@/lib/models/User'
import Project from '@/lib/models/Project'
import Invoice from '@/lib/models/Invoice'
import File from '@/lib/models/File'
import ChatLead from '@/lib/models/ChatLead'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    await connectDB()
    const client = await User.findById(params.id).lean()
    if (!client) {
      return NextResponse.json({ error: 'Client not found.' }, { status: 404 })
    }

    const clientId = client._id

    const [projects, invoices, files, chatLeads] = await Promise.all([
      Project.find({ client: clientId })
        .sort({ updatedAt: -1 })
        .populate('service', 'name category')
        .lean(),
      Invoice.find({ client: clientId }).sort({ createdAt: -1 }).lean(),
      File.find({ client: clientId }).sort({ createdAt: -1 }).lean(),
      ChatLead.find({ email: client.email }).sort({ createdAt: -1 }).lean(),
    ])

    return NextResponse.json({ client, projects, invoices, files, chatLeads }, { status: 200 })
  } catch (error) {
    console.error('Admin client GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch client.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const body = await req.json()
    const isActive = Boolean(body?.isActive)

    await connectDB()
    const client = await User.findByIdAndUpdate(
      params.id,
      { $set: { isActive } },
      { new: true }
    ).lean()

    if (!client) {
      return NextResponse.json({ error: 'Client not found.' }, { status: 404 })
    }

    return NextResponse.json({ client }, { status: 200 })
  } catch (error) {
    console.error('Admin client PUT error:', error)
    return NextResponse.json({ error: 'Failed to update client.' }, { status: 500 })
  }
}
