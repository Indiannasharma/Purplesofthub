import Link from 'next/link'
import type { PublicArticle } from '@/lib/blog/public-feed'
import AdSlot from './AdSlot'
import Newsletter from './Newsletter'
import styles from './magazine.module.css'
/** Ordering is supplied by the data layer so future real analytics can replace recent-story ranking. */
export function TrendingStories({posts}:{posts:PublicArticle[]}) {
  if(!posts.length)return null
  return <section className={styles.trending} aria-labelledby="trending-heading"><h2 id="trending-heading" className={styles.sectionLabel}>Trending now</h2><p className={styles.trendingNote}>Fresh perspectives from our latest stories.</p><ol>{posts.slice(0,5).map((post,index)=><li key={post.id}><span className={styles.rank} aria-hidden="true">{String(index+1).padStart(2,'0')}</span><div><Link href={'/blog/'+post.slug}>{post.title}</Link><p>{post.category||'Insights'}</p></div></li>)}</ol></section>
}
export function HouseAd(){return <div className={styles.house}><p className={styles.kicker}>PurpleSoftHub</p><h2>Turn ideas into<br/>digital experiences<span>.</span></h2><p>Websites · Apps · Branding<br/>Marketing · Creative</p><Link href="/contact">Start a Project <span aria-hidden="true">↗</span></Link></div>}
export default function EditorialSidebar({posts,newsletterAvailable=false}:{posts:PublicArticle[];newsletterAvailable?:boolean}){return <aside className={styles.sidebar} aria-label="From PurpleSoftHub"><TrendingStories posts={posts}/><AdSlot placement="sidebar"/><AdSlot placement="sidebar" house={<HouseAd/>}/><Newsletter available={newsletterAvailable}/></aside>}
