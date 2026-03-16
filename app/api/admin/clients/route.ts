import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import User from '@/lib/models/User'
import Project from '@/lib/models/Project'
import Invoice from '@/lib/models/Invoice'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    await connectDB()

    const clients = await User.find({ role: 'client' }).sort({ createdAt: -1 }).lean()
    const clientIds = clients.map((c) => c._id)

    const [projectsAgg, invoicesAgg] = await Promise.all([
      Project.aggregate([
        { $match: { client: { $in: clientIds } } },
        { $group: { _id: '$client', count: { $sum: 1 } } },
      ]),
      Invoice.aggregate([
        { $match: { client: { $in: clientIds }, status: 'paid' } },
        { $group: { _id: '$client', total: { $sum: '$total' } } },
      ]),
    ])

    const projectsMap = new Map<string, number>()
    projectsAgg.forEach((item) => projectsMap.set(String(item._id), Number(item.count || 0)))

    const totalMap = new Map<string, number>()
    invoicesAgg.forEach((item) => totalMap.set(String(item._id), Number(item.total || 0)))

    const enriched = clients.map((client) => ({
      ...client,
      projectsCount: projectsMap.get(String(client._id)) || 0,
      totalSpent: totalMap.get(String(client._id)) || 0,
    }))

    return NextResponse.json({ clients: enriched }, { status: 200 })
  } catch (error) {
    console.error('Admin clients GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch clients.' }, { status: 500 })
  }
}
