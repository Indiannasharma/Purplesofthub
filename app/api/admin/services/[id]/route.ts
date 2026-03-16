import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Service from '@/lib/models/Service'
import { requireAdmin } from '@/lib/auth'

const CATEGORY_VALUES = [
  'web-development',
  'mobile-apps',
  'digital-marketing',
  'ui-ux-design',
  'saas-development',
  'music-promotion',
  'content-creation',
  'seo',
  'social-media',
]

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    await connectDB()
    const service = await Service.findById(params.id).lean()
    if (!service) {
      return NextResponse.json({ error: 'Service not found.' }, { status: 404 })
    }
    return NextResponse.json({ service }, { status: 200 })
  } catch (error) {
    console.error('Admin services GET by id error:', error)
    return NextResponse.json({ error: 'Failed to fetch service.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const body = await req.json()
    const update: Record<string, unknown> = {}

    if (body?.name !== undefined) update.name = String(body.name).trim()
    if (body?.slug !== undefined) update.slug = slugify(String(body.slug))
    if (body?.category !== undefined) {
      const category = String(body.category).trim()
      if (category && !CATEGORY_VALUES.includes(category)) {
        return NextResponse.json({ error: 'Invalid category.' }, { status: 400 })
      }
      update.category = category
    }

    if (body?.shortDesc !== undefined) update.shortDesc = String(body.shortDesc)
    if (body?.description !== undefined) update.description = String(body.description)
    if (body?.features !== undefined) {
      update.features = Array.isArray(body.features) ? body.features.filter(Boolean) : []
    }
    if (body?.priceNGN !== undefined) update.priceNGN = Number(body.priceNGN || 0)
    if (body?.priceUSD !== undefined) update.priceUSD = Number(body.priceUSD || 0)
    if (body?.deliveryDays !== undefined) update.deliveryDays = Number(body.deliveryDays || 0)
    if (body?.icon !== undefined) update.icon = String(body.icon)
    if (body?.isActive !== undefined) update.isActive = Boolean(body.isActive)
    if (body?.isFeatured !== undefined) update.isFeatured = Boolean(body.isFeatured)
    if (body?.order !== undefined) update.order = Number(body.order || 0)

    await connectDB()
    const service = await Service.findByIdAndUpdate(params.id, { $set: update }, { new: true }).lean()

    if (!service) {
      return NextResponse.json({ error: 'Service not found.' }, { status: 404 })
    }

    return NextResponse.json({ service }, { status: 200 })
  } catch (error: unknown) {
    const err = error as { code?: number }
    if (err?.code === 11000) {
      return NextResponse.json({ error: 'Slug already exists.' }, { status: 409 })
    }
    console.error('Admin services PUT error:', error)
    return NextResponse.json({ error: 'Failed to update service.' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    await connectDB()
    const service = await Service.findByIdAndDelete(params.id).lean()
    if (!service) {
      return NextResponse.json({ error: 'Service not found.' }, { status: 404 })
    }
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Admin services DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete service.' }, { status: 500 })
  }
}
