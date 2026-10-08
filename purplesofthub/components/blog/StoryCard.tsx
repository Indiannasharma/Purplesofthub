import Image from 'next/image'
import Link from 'next/link'
import type { PublicArticle } from '@/lib/blog/public-feed'
import { editorialDate } from '@/lib/blog/queries'
import { httpsUrl } from '@/lib/blog/publishing'
import styles from './magazine.module.css'

export function StoryImage({post, lead=false, sizes}: {post: Pick<PublicArticle,'featured_image'|'featured_image_alt'|'title'>; lead?:boolean; sizes?:string}) {
  const image = post.featured_image && httpsUrl(post.featured_image) ? post.featured_image : null
  const optimize = !image || new URL(image).hostname === 'res.cloudinary.com'
  return <div className={styles.storyImage}><Image src={image || '/images/logo/purplesoft-logo-main.png'} alt={image ? post.featured_image_alt || post.title : 'PurpleSoftHub Insights'} fill sizes={sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px'} loading={lead?'eager':'lazy'} fetchPriority={lead?'high':'low'} unoptimized={!optimize} className={image ? styles.photo : styles.fallback}/></div>
}
export function StoryByline({post}: {post:Pick<PublicArticle,'author_name'|'published_at'>}) {
  return <div className={styles.byline}><span>{post.author_name?.trim() || 'PurpleSoftHub'}</span>{post.published_at && <time dateTime={post.published_at}>{editorialDate(post.published_at)}</time>}</div>
}
export default function StoryCard({post,variant='standard'}: {post:PublicArticle;variant?:'lead'|'standard'|'compact'|'feature'}) {
  const compact=variant==='compact'
  return <article className={[styles.story,styles[variant]].join(' ')} data-article-slug={post.slug}>
    <Link href={'/blog/'+post.slug} className={styles.storyLink}>
      <StoryImage post={post} lead={variant==='lead'} sizes={variant==='lead'?'(max-width: 767px) 100vw, (max-width: 1280px) 65vw, 820px':compact?'(max-width: 640px) 112px, 160px':undefined}/>
      <div className={styles.storyText}>{post.category && <p className={styles.category}>{post.category}</p>}<h3>{post.title}</h3>{!compact && post.excerpt && <p className={styles.deck}>{post.excerpt}</p>}<StoryByline post={post}/>{!compact && <span className={styles.read}>Read article <span aria-hidden="true">↗</span></span>}</div>
    </Link>
  </article>
}
