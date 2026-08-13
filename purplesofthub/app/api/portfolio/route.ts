import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { toSlug } from '@/lib/portfolio'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const industry = searchParams.get('industry')
    const service = searchParams.get('service')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('portfolio_projects')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) query = query.eq('category', category)
    if (industry) query = query.eq('industry', industry)
    if (service) query = query.eq('service', service)
    if (featured === 'true') query = query.eq('featured', true)
    if (search) {
      const q = search.toLowerCase()
      query = query.or(`title.ilike.%${q}%,client_name.ilike.%${q}%,industry.ilike.%${q}%,category.ilike.%${q}%`)
    }

    const { data, error, count } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data, count })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const slug = body.slug || toSlug(body.title || '')
    
    if (!body.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const payload = {
      ...body,
      slug,
      status: body.status || 'draft',
      featured: body.featured || false,
      gallery: body.gallery || [],
      deliverables: body.deliverables || [],
      services_used: body.services_used || [],
      tags: body.tags || [],
      seo_keywords: body.seo_keywords || [],
      color: body.color || '#7c3aed',
      emoji: body.emoji || '🎨',
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from('portfolio_projects').insert(payload).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ── PUT: Update Project ──
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const projectId = body.id

    if (!projectId) return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })

    const payload = {
      ...body,
      slug: body.slug || toSlug(body.title || ''),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('portfolio_projects')
      .update(payload)
      .eq('id', projectId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ── DELETE / Archive Project ──
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')

    if (!projectId) return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })

    const { data, error } = await supabase
      .from('portfolio_projects')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}