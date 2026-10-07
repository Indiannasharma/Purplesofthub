import { NextRequest, NextResponse } from 'next/server'
import { requireBlogAdmin } from '@/lib/blog/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { editorialQuery, EDITORIAL_PAGE_SIZE } from '@/lib/blog/queries'
export const dynamic = 'force-dynamic'
const reply = (body: unknown,status=200) => NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}})
export async function GET(request: NextRequest) {
  const auth=await requireBlogAdmin(request)
  if(!auth.ok) return reply({ok:false,error:auth.error},auth.status)
  const db=createServiceRoleClient()
  if(!db) return reply({ok:false,error:'The editorial dashboard is not configured.'},503)
  try {
    const filters=editorialQuery(Object.fromEntries(request.nextUrl.searchParams))
    let list=db.from('blog_posts').select('id,title,slug,excerpt,featured_image,featured_image_alt,category,tags,author_name,status,published_at,created_at,updated_at',{count:'exact'})
    if(filters.status!=='all') list=list.eq('status',filters.status)
    if(filters.category) list=list.eq('category',filters.category)
    if(filters.author) list=list.ilike('author_name','%'+filters.author+'%')
    if(filters.search) list=list.or('title.ilike.%'+filters.search+'%,excerpt.ilike.%'+filters.search+'%')
    list=list.order(filters.sort==='updated'?'updated_at':'created_at',{ascending:filters.sort==='oldest',nullsFirst:false}).order('id',{ascending:false})
    const results=await Promise.all([
      list.range((filters.page-1)*EDITORIAL_PAGE_SIZE,filters.page*EDITORIAL_PAGE_SIZE-1),
      db.from('blog_posts').select('id',{count:'exact',head:true}),
      db.from('blog_posts').select('id',{count:'exact',head:true}).eq('status','published'),
      db.from('blog_posts').select('id',{count:'exact',head:true}).eq('status','draft'),
      db.from('blog_categories').select('name,slug',{count:'exact'}).order('name').limit(100),
      db.from('blog_posts').select('author_name').order('updated_at',{ascending:false}).limit(500),
    ])
    if(results.some(r=>r.error)) throw new Error('Editorial query unavailable')
    const [posts,total,published,drafts,categories,authors]=results
    if([posts.count,total.count,published.count,drafts.count,categories.count].some(n=>n===null)) throw new Error('Editorial counts unavailable')
    const page=Math.min(filters.page,Math.max(1,Math.ceil((posts.count||0)/EDITORIAL_PAGE_SIZE)))
    const pageResult=page===filters.page?posts:await list.range((page-1)*EDITORIAL_PAGE_SIZE,page*EDITORIAL_PAGE_SIZE-1)
    if(pageResult.error)throw new Error('Editorial page unavailable')
    return reply({ok:true,posts:pageResult.data,total:posts.count,page,pageSize:EDITORIAL_PAGE_SIZE,
      stats:{total:total.count,published:published.count,drafts:drafts.count,categories:categories.count},
      categories:categories.data,authors:[...new Set((authors.data||[]).map(p=>p.author_name?.trim()).filter(Boolean))],filters})
  } catch { return reply({ok:false,error:'Could not load the editorial dashboard. Please try again.'},503) }
}
