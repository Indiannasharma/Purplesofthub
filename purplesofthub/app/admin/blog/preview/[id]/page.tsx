import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { AdminPage } from '@/components/admin/AdminPage'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import ArticleDocument from '@/components/blog/ArticleDocument'
export const dynamic='force-dynamic'
export const metadata:Metadata={title:'Private article preview | PurpleSoftHub',robots:{index:false,follow:false}}
export default async function Preview({params}:{params:Promise<{id:string}>}) {
  const auth=await requireAdmin(); if(!auth.ok)redirect('/sign-in')
  const {id}=await params; const db=createServiceRoleClient();if(!db)notFound()
  const {data:post,error}=await db.from('blog_posts').select('*').eq('id',id).maybeSingle()
  if(error||!post)notFound()
  return <AdminPage><AdminPageHeader title="Article preview" description={post.status==='published'?'Published article · private editorial view':'Draft · only visible to administrators'} actions={<Link href={'/admin/blog/edit/'+post.id} className="cc-btn cc-btn-primary">Continue editing</Link>}/><div style={{background:'var(--cc-surface)',border:'1px solid var(--cc-border)',borderRadius:12,padding:'clamp(20px,4vw,48px)'}}><ArticleDocument title={post.title} content={post.content||''} excerpt={post.excerpt||''} image={post.featured_image||undefined} alt={post.featured_image_alt||undefined} category={post.category||undefined} author={post.author_name||undefined} publishedAt={post.published_at} sources={post.source_urls||[]}/></div></AdminPage>
}
