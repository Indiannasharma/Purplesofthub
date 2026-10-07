import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ArticleCard from '@/components/blog/ArticleCard'
import { publishedArticles, publicBlogCategories } from '@/lib/blog/public-feed'
import { editorialQuery } from '@/lib/blog/queries'
import styles from '@/components/blog/editorial.module.css'
export const dynamic='force-dynamic'
export const metadata: Metadata={title:'Blog',description:'Insights on technology, web development, digital marketing and digital growth from PurpleSoftHub.',alternates:{canonical:'https://www.purplesofthub.com/blog'}}
export default async function BlogPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const filters=editorialQuery(await searchParams)
  const categories=await publicBlogCategories()
  const category=categories.find(c=>c.slug===filters.category||c.name===filters.category)
  const result=await publishedArticles({limit:12,page:filters.page,search:filters.search,category:category?.name|| (filters.category||undefined)})
  const pages=Math.max(1,Math.ceil(result.total/12))
  function href(page:number){const params=new URLSearchParams();if(filters.search)params.set('q',filters.search);if(filters.category)params.set('category',filters.category);if(page>1)params.set('page',String(page));return '/blog'+(params.size?'?'+params:'')}
  if(result.ok&&filters.page>pages) redirect(href(pages))
  return <><Navbar/><main className={styles.archive}><div className={styles.archiveContainer}>
    <header className={styles.archiveHeader}><p className={styles.eyebrow}>The PurpleSoftHub Journal</p><h1>Ideas for what comes next.</h1><p>Practical insights on technology, design, and the tools shaping modern businesses.</p></header>
    <form action="/blog" method="get" className={styles.filters} role="search"><label htmlFor="archive-search">Search articles<input id="archive-search" name="q" type="search" defaultValue={filters.search} placeholder="Search articles…" maxLength={100}/></label><label htmlFor="archive-category">Category<select id="archive-category" name="category" defaultValue={category?.slug||''}><option value="">All categories</option>{categories.map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label><button type="submit">Search</button></form>
    {!result.ok?<div className={styles.empty} role="status"><h2>Articles are temporarily unavailable</h2><p>Please refresh in a moment. We’re keeping your search in the address bar.</p></div>:<>
      <h2 className="sr-only">Published articles</h2><div className={styles.results}><span>{result.total} {result.total===1?'article':'articles'}{filters.search?' matching your search':''}</span>{(filters.search||filters.category)&&<Link href="/blog">Clear filters</Link>}</div>
      {result.posts.length?<div className={styles.grid}>{result.posts.map(post=><ArticleCard key={post.id} post={post}/>)}</div>:<div className={styles.empty}><h2>{filters.search||filters.category?'No matching articles':'Our next insight is on the way'}</h2><p>{filters.search||filters.category?'Try another search or clear the filters.':'Come back soon for more ideas from PurpleSoftHub.'}</p></div>}
      {pages>1&&<nav className={styles.pagination} aria-label="Article pages">{filters.page>1?<Link href={href(filters.page-1)}>← Previous</Link>:<span/>}<span>Page {filters.page} of {pages}</span>{filters.page<pages?<Link href={href(filters.page+1)}>Next →</Link>:<span/>}</nav>}
    </>}
  </div></main><Footer/></>
}
