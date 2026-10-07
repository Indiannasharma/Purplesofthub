import Link from 'next/link'
import { ArrowRight, Newspaper } from 'lucide-react'
import { publishedArticles } from '@/lib/blog/public-feed'
import ArticleCard from './ArticleCard'
import styles from './editorial.module.css'
function Heading() { return <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>Latest Insights</p><h2>Trending Blog Posts</h2><p className={styles.subtitle}>Ideas, updates, and practical perspectives for a digital world.</p></div><Link href="/blog" className={styles.viewAll}>View All Articles <ArrowRight size={17} aria-hidden="true"/></Link></div> }
export default async function HomeBlogSection() {
  const result=await publishedArticles({limit:3})
  return <section id="latest-insights" className={styles.section} aria-label="Latest blog insights" data-testid="homepage-blog"><div className={styles.container}><Heading/>
    {!result.ok?<div className={styles.empty} role="status"><Newspaper size={28} aria-hidden="true"/><h3>Insights are temporarily unavailable</h3><p>Please try again soon, or explore our article archive.</p></div>
      :result.posts.length?<div className={styles.grid}>{result.posts.map(post=><ArticleCard key={post.id} post={post}/>)}</div>
      :<div className={styles.empty}><Newspaper size={28} aria-hidden="true"/><h3>Our next insight is on the way</h3><p>Check back soon for trending blog posts.</p></div>}
  </div></section>
}
export function HomeBlogSkeleton() { return <section id="latest-insights" className={styles.section} aria-label="Loading latest blog insights" aria-busy="true"><div className={styles.container}><Heading/><div className={styles.grid}>{[1,2,3].map(i=><div key={i} className={styles.skeleton}/>)}</div></div></section> }
