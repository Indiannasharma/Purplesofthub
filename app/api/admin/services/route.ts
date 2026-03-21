import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  try {
    const supabase = await createClient()
    const { data: services, error } = await supabase
      .from('services').select('*').order('order', { ascending: true })

    if (error) throw error
    return NextResponse.json({ services })
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
    const slug = body?.slug ? slugify(String(body.slug)) : slugify(name)

    if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
    if (!slug) return NextResponse.json({ error: 'Slug is required.' }, { status: 400 })

    const supabase = await createClient()

    const { data: service, error } = await supabase
      .from('services')
      .insert({
        name, slug,
        category: String(body?.category || ''),
        short_desc: String(body?.shortDesc || body?.short_desc || ''),
        description: String(body?.description || ''),
        features: Array.isArray(body?.features) ? body.features.filter(Boolean) : [],
        price_ngn: Number(body?.priceNGN || body?.price_ngn || 0),
        price_usd: Number(body?.priceUSD || body?.price_usd || 0),
        delivery_days: Number(body?.deliveryDays || body?.delivery_days || 0),
        icon: String(body?.icon || ''),
        is_active: Boolean(body?.isActive ?? body?.is_active ?? true),
        is_featured: Boolean(body?.isFeatured ?? body?.is_featured ?? false),
        order: Number(body?.order || 0),
      })
      .select().single()

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Slug already exists.' }, { status: 409 })
      throw error
    }

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error('Admin services POST error:', error)
    return NextResponse.json({ error: 'Failed to create service.' }, { status: 500 })
  }
}
