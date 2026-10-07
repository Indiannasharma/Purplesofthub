'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, ChevronLeft, ChevronRight, FileText, PencilLine, Plus, Tags, Eye, Trash2, Send, RefreshCw } from 'lucide-react'
import { AdminPage } from '@/components/admin/AdminPage'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminEmptyState } from '@/components/admin/AdminEmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ccFontVariables } from '@/components/command-center/fonts'
import { editorialDate } from '@/lib/blog/queries'
import type { BlogPost } from '@/lib/blog/publishing'
import styles from '@/components/admin/blog-editorial.module.css'
type Row=Omit<BlogPost,'content'|'seo_title'|'seo_description'|'author_id'|'author_type'|'source_urls'>
type Data={posts:Row[];total:number;page:number;pageSize:number;stats:{total:number;published:number;drafts:number;categories:number};categories:{name:string;slug:string}[];authors:string[]}
export default function BlogManager() {
  const [data,setData]=useState<Data|null>(null)
  const [filters,setFilters]=useState({q:'',status:'all',category:'',author:'',sort:'newest',page:1})
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [feedback,setFeedback]=useState('')
  const [busy,setBusy]=useState<string|null>(null)
  const [target,setTarget]=useState<Row|null>(null)
  const [version,setVersion]=useState(0)
  const actionLock=useRef(false)
  useEffect(()=>{
    const controller=new AbortController()
    const timer=setTimeout(async()=>{
      setLoading(true);setError('')
      try {
        const params=new URLSearchParams(Object.entries(filters).map(([k,v])=>[k,String(v)]))
        const response=await fetch('/api/admin/blog?'+params,{signal:controller.signal})
        const result=await response.json()
        if(!response.ok) throw new Error(result.error||'Could not load the articles.')
        if(!controller.signal.aborted){setData(result);if(result.page!==filters.page)setFilters(current=>({...current,page:result.page}))}
      } catch(error){if(!controller.signal.aborted)setError(error instanceof Error?error.message:'Could not load the articles.')}
      finally{if(!controller.signal.aborted)setLoading(false)}
    },filters.q||filters.author?250:0)
    return()=>{clearTimeout(timer);controller.abort()}
  },[filters,version])
  function filter(key:string,value:string){setFilters(current=>({...current,[key]:value,page:1}))}
  async function mutate(post:Row,operation:'status'|'delete') {
    if(actionLock.current)return
    actionLock.current=true;setBusy(post.id);setError('');setFeedback('')
    try {
      const response=await fetch('/api/admin/blog/publish'+(operation==='delete'?'?id='+post.id:''),operation==='delete'?{method:'DELETE'}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operation:'update',id:post.id,status:post.status==='published'?'draft':'published',expected_updated_at:post.updated_at})})
      const result=await response.json()
      if(!response.ok) throw new Error(result.error||'Could not update the article.')
      setTarget(null);setFeedback(operation==='delete'?'Article deleted.':post.status==='published'?'Article moved to drafts.':'Article published.')
      setVersion(n=>n+1)
    }catch(error){setError(error instanceof Error?error.message:'Could not update the article.')}
    finally{actionLock.current=false;setBusy(null)}
  }
  function actions(post:Row){return <div className={styles.rowActions}>
    <Link className={styles.button} href={'/admin/blog/edit/'+post.id}><PencilLine size={12} aria-hidden="true"/>Edit</Link>
    <Link className={styles.button} href={post.status==='published'?'/blog/'+post.slug:'/admin/blog/preview/'+post.id} target="_blank" rel="noopener noreferrer"><Eye size={12} aria-hidden="true"/>{post.status==='published'?'View':'Preview'}</Link>
    <button className={styles.button} type="button" disabled={Boolean(busy)} onClick={()=>mutate(post,'status')} aria-label={(post.status==='published'?'Unpublish ':'Publish ')+post.title}><Send size={12} aria-hidden="true"/>{post.status==='published'?'Unpublish':'Publish'}</button>
    <button className={styles.button+' '+styles.danger} type="button" disabled={Boolean(busy)} onClick={()=>setTarget(post)} aria-label={'Delete '+post.title}><Trash2 size={12} aria-hidden="true"/></button>
  </div>}
  function identity(post:Row){return <div className={styles.postCell}><div className={styles.thumbnail}><Image src={post.featured_image||'/images/logo/purplesoft-logo-main.png'} alt={post.featured_image_alt||post.title} fill sizes="92px" unoptimized className={post.featured_image?'':styles.brand}/></div><div className={styles.postText}><Link href={'/admin/blog/edit/'+post.id} className={styles.postTitle}>{post.title}</Link><div className={styles.postMeta}>{post.category||'Uncategorized'} · {post.author_name?.trim()||'PurpleSoftHub'}</div>{post.tags&&post.tags.length>0&&<div className={styles.postTags}>{post.tags.slice(0,2).map(tag=><span className={styles.tag} key={tag}>{tag}</span>)}</div>}</div></div>}
  function status(post:Row){return <span className={styles.badge+' '+(post.status==='published'?styles.published:'')}>{post.status==='published'?<CheckCircle2 size={11} aria-hidden="true"/>:<PencilLine size={11} aria-hidden="true"/>}{post.status==='published'?'Published':'Draft'}</span>}
  const pages=Math.max(1,Math.ceil((data?.total||0)/12))
  const active=filters.q||filters.status!=='all'||filters.category||filters.author
  const stats=[{key:'total',label:'Total posts',icon:FileText},{key:'published',label:'Published',icon:CheckCircle2},{key:'drafts',label:'Drafts',icon:PencilLine},{key:'categories',label:'Categories',icon:Tags}] as const
  return <AdminPage className={'cc-module '+styles.dashboard}>
    <AdminPageHeader title="Blog Management" description="Create, manage and publish PurpleSoftHub insights." breadcrumbs={[{label:'Editorial'},{label:'Blog Management'}]} actions={<Link className={styles.primary} href="/admin/blog/create"><Plus size={15} aria-hidden="true"/>New Post</Link>}/>
    <div className={styles.stats}>{stats.map(item=><div className={styles.stat} key={item.key}><span className={styles.statIcon}><item.icon size={18} aria-hidden="true"/></span><div><span className={styles.statLabel}>{item.label}</span>{data?<strong className={styles.statValue}>{data.stats[item.key]}</strong>:<Skeleton className="h-7 w-12"/>}</div></div>)}</div>
    {feedback&&<div className={styles.notice} role="status">{feedback}</div>}
    {error&&<div className={styles.notice+' '+styles.error} role="alert">{error}<button type="button" className={styles.button} onClick={()=>setVersion(n=>n+1)}>Retry</button></div>}
    <section className={styles.panel} aria-label="Article management" aria-busy={loading}>
      <div className={styles.panelHeader}><div><p className={styles.eyebrow}>Your publication</p><h2>Articles</h2><p>A clear view of everything in your editorial pipeline.</p></div><button type="button" className={styles.button} disabled={loading} onClick={()=>setVersion(n=>n+1)}><RefreshCw size={13} aria-hidden="true"/>Refresh</button></div>
      <div className={styles.filters}>
        <label htmlFor="posts-search">Search<input id="posts-search" type="search" placeholder="Search posts…" value={filters.q} onChange={e=>filter('q',e.target.value)} maxLength={100}/></label>
        <label htmlFor="posts-status">Status<select id="posts-status" value={filters.status} onChange={e=>filter('status',e.target.value)}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Drafts</option></select></label>
        <label htmlFor="posts-category">Category<select id="posts-category" value={filters.category} onChange={e=>filter('category',e.target.value)}><option value="">All categories</option>{data?.categories.map(c=><option key={c.slug} value={c.name}>{c.name}</option>)}</select></label>
        <label htmlFor="posts-author">Author<input id="posts-author" list="blog-authors" placeholder="All authors" value={filters.author} onChange={e=>filter('author',e.target.value)}/><datalist id="blog-authors">{data?.authors.map(author=><option key={author} value={author}/>)}</datalist></label>
        <label htmlFor="posts-sort">Sort by<select id="posts-sort" value={filters.sort} onChange={e=>filter('sort',e.target.value)}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="updated">Recently updated</option></select></label>
      </div>
      <div className={styles.resultLine}><span aria-live="polite">{loading?'Loading articles…':data?data.total+' '+(data.total===1?'article':'articles'):'Articles unavailable'}</span>{active&&<button type="button" onClick={()=>setFilters({q:'',status:'all',category:'',author:'',sort:'newest',page:1})}>Clear filters</button>}</div>
      {loading?<div className={styles.skeletonRows} role="status" aria-label="Loading articles">{[1,2,3].map(i=><div className={styles.skeletonRow} key={i}><Skeleton className={styles.skeletonImage}/><div className={styles.skeletonText}><Skeleton className={styles.skeletonTitle}/><Skeleton className={styles.skeletonLine}/></div></div>)}</div>:data?.posts.length?<>
        <table className={styles.table}><thead><tr><th scope="col">Article</th><th scope="col">Status</th><th scope="col">Last updated</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead><tbody>{data.posts.map(post=><tr key={post.id}><td>{identity(post)}</td><td>{status(post)}</td><td><time dateTime={post.updated_at||post.created_at}>{editorialDate(post.updated_at||post.created_at)}</time>{post.published_at&&<span className={styles.rowDate}>Published {editorialDate(post.published_at)}</span>}</td><td>{actions(post)}</td></tr>)}</tbody></table>
        <div className={styles.mobilePosts}>{data.posts.map(post=><article key={post.id} className={styles.mobileCard}>{identity(post)}<div className={styles.mobileMeta}>{status(post)}<span className={styles.rowDate}>Updated {editorialDate(post.updated_at||post.created_at)}</span></div>{actions(post)}</article>)}</div>
      </>:!error&&<AdminEmptyState icon={FileText} title={active?'No matching articles':'Start your next great story'} description={active?'Try another search or clear your filters.':'Create your first draft and turn an idea into an insight.'} action={<Link className={styles.button} href="/admin/blog/create">New Post</Link>}/>}
      {data&&data.total>0&&<nav className={styles.pagination} aria-label="Article pagination"><span>Showing {(filters.page-1)*12+1}–{Math.min(filters.page*12,data.total)} of {data.total}</span><div className={styles.paginationControls}><button className={styles.button} disabled={filters.page<=1||loading} onClick={()=>setFilters(f=>({...f,page:f.page-1}))}><ChevronLeft size={14} aria-hidden="true"/>Previous</button><span>Page {filters.page} of {pages}</span><button className={styles.button} disabled={filters.page>=pages||loading} onClick={()=>setFilters(f=>({...f,page:f.page+1}))}>Next<ChevronRight size={14} aria-hidden="true"/></button></div></nav>}
    </section>
    <Dialog open={Boolean(target)} onOpenChange={open=>{if(!open&&!busy)setTarget(null)}}><DialogContent className={ccFontVariables+' workspace-overlay '+styles.dialog} role="alertdialog"><DialogTitle className={styles.dialogTitle}>Delete article?</DialogTitle><DialogDescription className={styles.dialogDescription}>“{target?.title}” will be permanently removed from the publication. This cannot be undone.</DialogDescription>{error&&<p role="alert" className={styles.danger}>{error}</p>}<div className={styles.dialogFooter}><button type="button" className={styles.button} disabled={Boolean(busy)} onClick={()=>setTarget(null)}>Cancel</button><button type="button" className={styles.primary} disabled={Boolean(busy)} onClick={()=>target&&mutate(target,'delete')}>{busy?'Deleting…':'Delete article'}</button></div></DialogContent></Dialog>
  </AdminPage>
}
