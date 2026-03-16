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

export async function GET() {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    await connectDB()
    const services = await Service.find({}).sort({ order: 1, createdAt: -1 }).lean()
    return NextResponse.json({ services }, { status: 200 })
  } catch (error) {
    console.error('Admin services GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch services.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const body = await req.json()

    const name = String(body?.name || '').trim()
    const rawSlug = String(body?.slug || '').trim()
    const slug = rawSlug ? slugify(rawSlug) : slugify(name)
    const category = String(body?.category || '').trim()

    if (!name) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
    }

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required.' }, { status: 400 })
    }

    if (category && !CATEGORY_VALUES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category.' }, { status: 400 })
    }

    await connectDB()

    const service = await Service.create({
      name,
      slug,
      category,
      shortDesc: String(body?.shortDesc || ''),
      description: String(body?.description || ''),
      features: Array.isArray(body?.features) ? body.features.filter(Boolean) : [],
      priceNGN: Number(body?.priceNGN || 0),
      priceUSD: Number(body?.priceUSD || 0),
      deliveryDays: Number(body?.deliveryDays || 0),
      icon: String(body?.icon || ''),
      isActive: Boolean(body?.isActive),
      isFeatured: Boolean(body?.isFeatured),
      order: Number(body?.order || 0),
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (error: unknown) {
    const err = error as { code?: number }
    if (err?.code === 11000) {
      return NextResponse.json({ error: 'Slug already exists.' }, { status: 409 })
    }
    console.error('Admin services POST error:', error)
    return NextResponse.json({ error: 'Failed to create service.' }, { status: 500 })
  }
}
