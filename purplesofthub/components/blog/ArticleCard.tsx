import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { editorialDate } from '@/lib/blog/queries'
import { httpsUrl } from '@/lib/blog/publishing'
import type { PublicArticle } from '@/lib/blog/public-feed'
import styles from './editorial.module.css'
export default function ArticleCard({ post }: { post: PublicArticle }) {
  const hasImage=Boolean(post.featured_image&&httpsUrl(post.featured_image))
  const image=hasImage?post.featured_image!:'/images/logo/purplesoft-logo-main.png'
  let optimize=true
  try { if(hasImage) optimize=new URL(image).hostname==='res.cloudinary.com' } catch { optimize=false }
  return <article className={styles.card} data-article-slug={post.slug}>
    <Link href={'/blog/'+post.slug} className={styles.cardLink} aria-label={'Read '+post.title}>
      <div className={styles.image}>
        <Image src={image} alt={post.featured_image_alt|| (hasImage ? post.title : 'PurpleSoftHub publication')}
          fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" loading="lazy" fetchPriority="low" unoptimized={!optimize}
          className={hasImage?styles.cover:styles.brandFallback}/>
      </div>
      <div className={styles.cardBody}>
        {post.category&&<span className={styles.category}>{post.category}</span>}
        <h3>{post.title}</h3><p className={styles.excerpt}>{post.excerpt}</p>
        <div className={styles.byline}><span>{post.author_name?.trim()||'PurpleSoftHub'}</span>
          {post.published_at&&<time dateTime={post.published_at}>{editorialDate(post.published_at)}</time>}</div>
        <span className={styles.readLink}>Read Article <ArrowUpRight size={16} aria-hidden="true"/></span>
      </div>
    </Link>
  </article>
}
