import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import StoryCard from '@/components/blog/StoryCard'
import PublicationMasthead from '@/components/blog/PublicationMasthead'
import AdSlot from '@/components/blog/AdSlot'
import EditorialSidebar from '@/components/blog/EditorialSidebar'
import { publishedArticles, publicBlogCategories } from '@/lib/blog/public-feed'
import { newsletterAvailable } from '@/lib/blog/newsletter'
import { editorialQuery } from '@/lib/blog/queries'
import { storyLayout, categoryGroups } from '@/lib/blog/editorial'
import styles from '@/components/blog/magazine.module.css'
export const dynamic='force-dynamic'
export const metadata: Metadata={title:'Blog',description:'Insights on technology, web development, digital marketing and digital growth from PurpleSoftHub.',alternates:{canonical:'https://www.purplesofthub.com/blog'}}
export default async function BlogPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const filters=editorialQuery(await searchParams)
  const [categoryRecords,signupAvailable]=await Promise.all([publicBlogCategories(),newsletterAvailable()])
  let categories=categoryRecords
  const category=categories.find(c=>c.slug===filters.category||c.name===filters.category)
  const result=await publishedArticles({limit:12,page:filters.page,search:filters.search,category:category?.name||filters.category||undefined})
  if(!categories.length) categories=[...new Set(result.posts.map(post=>post.category).filter((name):name is string=>Boolean(name)))].map(name=>({name,slug:name}))
  const filtered=Boolean(filters.search||filters.category)
  const trending=filtered||filters.page>1?await publishedArticles({limit:5}):result
  const pages=Math.max(1,Math.ceil(result.total/12))
  function href(page:number){const params=new URLSearchParams();if(filters.search)params.set('q',filters.search);if(filters.category)params.set('category',filters.category);if(page>1)params.set('page',String(page));return '/blog'+(params.size?'?'+params:'')}
  if(result.ok&&filters.page>pages)redirect(href(pages))
  const layout=storyLayout(result.posts)
  const groups=!filtered?categoryGroups(result.posts):[]
  const magazine=!filtered&&filters.page===1
  return <><Navbar/><main className={styles.publicationPage}><a className={styles.skipLink} href="#stories">Skip to stories</a><div className={styles.container}>
    <PublicationMasthead categories={categories} search={filters.search} category={category?.slug||filters.category}/>
    <h1 className="sr-only">PurpleSoftHub Insights — Technology, business and creativity</h1>
    {!result.ok?<section className={styles.empty} role="status"><h2>Stories are temporarily unavailable</h2><p>Please refresh in a moment. Your search is kept in the address bar.</p></section>:<>
      {magazine&&layout.lead&&<section className={styles.leadArea} aria-label="Featured stories"><h2 className="sr-only">Featured stories</h2><StoryCard post={layout.lead} variant="lead"/><div className={styles.secondary}>{layout.secondary.map(post=><StoryCard key={post.id} post={post} variant="feature"/>)}</div></section>}
      <section id="stories" className={styles.latestSection} aria-labelledby="latest-heading"><div className={styles.sectionHeading}><h2 id="latest-heading">{filters.search?'Search results':category?.name||filters.category||'Latest stories'}</h2><span>{result.total} {result.total===1?'story':'stories'}{filtered&&<> · <Link href="/blog">Clear filters</Link></>}</span></div>
        {(magazine?layout.latest:result.posts).length?<div className={styles.latestGrid}>{(magazine?layout.latest:result.posts).map(post=><StoryCard key={post.id} post={post}/>)}</div>:<div className={styles.empty}><h3>{result.posts.length?'You’re up to date.':'No stories found.'}</h3><p>{result.posts.length?'Explore our featured stories above and discover more by category below.':'Try another category or search term.'}</p></div>}
      </section>
      <div className={styles.editorialColumns}><div className={styles.categorySections}>{groups.length?groups.map((group,index)=><section key={group.name} className={styles.categorySection}><div className={styles.sectionHeading}><h2>{group.name}</h2><Link href={'/blog?'+new URLSearchParams({category:categories.find(c=>c.name===group.name)?.slug||group.name})}>Explore category ↗</Link></div><div className={index%2?styles.categoryRows:styles.categoryMix}>{group.stories.map((post,i)=><StoryCard key={post.id} post={post} variant={index%2?'compact':i===0?'feature':'compact'}/>)}</div>{index===0&&<div className={styles.mobileAd}><AdSlot placement="in-feed"/></div>}</section>):<section className={styles.aboutPublication}><p className={styles.kicker}>A different perspective</p><h2>Ideas worth<br/>paying attention to.</h2><p>Practical thinking on technology, digital business and creativity. Written for people building what comes next.</p><Link href="/blog">More from PurpleSoftHub ↗</Link></section>}</div><EditorialSidebar posts={trending.posts} newsletterAvailable={signupAvailable}/></div>
      <nav className={styles.pagination} aria-label="Article pages">{filters.page>1?<Link href={href(filters.page-1)}>← Previous</Link>:<span/>}<span>Page {filters.page} of {pages}</span>{filters.page<pages?<Link href={href(filters.page+1)}>Next →</Link>:<span/>}</nav>
    </>}
  </div></main><Footer/></>
}
