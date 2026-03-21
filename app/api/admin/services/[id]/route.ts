import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: service, error } = await supabase.from('services').select('*').eq('id', id).single()
    if (error || !service) return NextResponse.json({ error: 'Service not found.' }, { status: 404 })
    return NextResponse.json({ service })
  } catch (error) {
    console.error('Admin service GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch service.' }, { status: 500 })
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
    if (body?.name !== undefined) update.name = String(body.name).trim()
    if (body?.slug !== undefined) update.slug = slugify(String(body.slug))
    if (body?.category !== undefined) update.category = String(body.category)
    if (body?.shortDesc !== undefined) update.short_desc = String(body.shortDesc)
    if (body?.short_desc !== undefined) update.short_desc = String(body.short_desc)
    if (body?.description !== undefined) update.description = String(body.description)
    if (body?.features !== undefined) update.features = Array.isArray(body.features) ? body.features.filter(Boolean) : []
    if (body?.priceNGN !== undefined) update.price_ngn = Number(body.priceNGN)
    if (body?.priceUSD !== undefined) update.price_usd = Number(body.priceUSD)
    if (body?.deliveryDays !== undefined) update.delivery_days = Number(body.deliveryDays)
    if (body?.icon !== undefined) update.icon = String(body.icon)
    if (body?.isActive !== undefined) update.is_active = Boolean(body.isActive)
    if (body?.isFeatured !== undefined) update.is_featured = Boolean(body.isFeatured)
    if (body?.order !== undefined) update.order = Number(body.order)

    const { data: service, error } = await supabase
      .from('services').update(update).eq('id', id).select().single()

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Slug already exists.' }, { status: 409 })
      return NextResponse.json({ error: 'Service not found.' }, { status: 404 })
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Admin service PUT error:', error)
    return NextResponse.json({ error: 'Failed to update service.' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Service not found.' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin service DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete service.' }, { status: 500 })
  }
}
