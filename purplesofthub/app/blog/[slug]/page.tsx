import { createClient } from '@supabase/supabase-js'
import {cache} from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlogReactions from '@/components/blog/BlogReactions'
import BlogComments from '@/components/blog/BlogComments'
import StoryCard, {StoryImage} from '@/components/blog/StoryCard'
import PublicationMasthead from '@/components/blog/PublicationMasthead'
import AdSlot from '@/components/blog/AdSlot'
import {HouseAd} from '@/components/blog/EditorialSidebar'
import { renderBlogMarkdown } from '@/lib/blog/rendering'
import { blogPosting, serializeBlogPosting } from '@/lib/blog/structured-data'
import {readingMinutes,relatedStories,articleMarkdown} from '@/lib/blog/editorial'
import {publicBlogCategories,type PublicArticle} from '@/lib/blog/public-feed'
import {editorialDate} from '@/lib/blog/queries'
import {httpsUrl} from '@/lib/blog/publishing'
import styles from '@/components/blog/magazine.module.css'
export const dynamic = 'force-dynamic'
const SITE_URL = 'https://www.purplesofthub.com'
interface Props {params:Promise<{slug:string}>}
const getPost=cache(async (slug:string)=>{
  const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const {data,error}=await supabase.from('blog_posts').select('*').eq('slug',slug).eq('status','published').single()
  return error||!data?null:data
})
async function getRelated(post:{id:string;category?:string|null;tags?:string[]|null}) {
  const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const query=()=>supabase.from('blog_posts').select('id,title,slug,excerpt,featured_image,featured_image_alt,category,author_name,published_at,tags').eq('status','published').neq('id',post.id).order('published_at',{ascending:false,nullsFirst:false}).limit(12)
  const [same,recent]=await Promise.all([post.category?query().eq('category',post.category):Promise.resolve({data:[]}),query()])
  return relatedStories([...(same.data||[]),...(recent.data||[])] as (PublicArticle&{tags:string[]})[],post)
}
export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { 
    title: 'Not Found | PurpleSoftHub' 
  }

  const ogImage = 
    post.featured_image ||
    `${SITE_URL}/opengraph-image`
  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`

  return {
    title: post.seo_title ||
      `${post.title} | PurpleSoftHub Blog`,
    description: 
      post.seo_description || post.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: 
        post.seo_description || post.excerpt,
      url: canonicalUrl,
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: post.featured_image_alt || post.title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: 
        post.seo_description || post.excerpt,
      images: [ogImage],
    },
  }
}


export default async function BlogPostPage({params}:Props) {
  const {slug}=await params
  const post=await getPost(slug)
  if(!post)notFound()
  const [related,categories]=await Promise.all([getRelated(post),publicBlogCategories()])
  const authorName=post.author_name?.trim()||'PurpleSoftHub'
  const sources=(Array.isArray(post.source_urls)?post.source_urls:[]).filter((url:unknown):url is string=>typeof url==='string'&&Boolean(httpsUrl(url)))
  const canonicalUrl=SITE_URL+'/blog/'+post.slug
  const category=categories.find(item=>item.name===post.category)
  const share=[{name:'Share on X',href:'https://twitter.com/intent/tweet?'+new URLSearchParams({text:post.title,url:canonicalUrl})},{name:'Share on WhatsApp',href:'https://wa.me/?'+new URLSearchParams({text:post.title+' — '+canonicalUrl})},{name:'Share on Telegram',href:'https://t.me/share/url?'+new URLSearchParams({url:canonicalUrl,text:post.title})}]
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeBlogPosting(blogPosting(post))}}/><Navbar/><main className={styles.publicationPage}><a className={styles.skipLink} href="#article-body">Skip to article</a><div className={styles.container}>
    <PublicationMasthead categories={categories.length?categories:post.category?[{name:post.category,slug:post.category}]:[]}/>
    <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/blog">Insights</Link>{post.category&&<><span aria-hidden="true">/</span><Link href={'/blog?'+new URLSearchParams({category:category?.slug||post.category})}>{post.category}</Link></>}</nav>
    <article><header className={styles.articleHeader}>{post.category&&<p className={styles.category}>{post.category}</p>}<h1>{post.title}</h1>{post.excerpt&&<p className={styles.articleDeck}>{post.excerpt}</p>}<div className={styles.articleMeta}><strong>{authorName}</strong><time dateTime={post.published_at||post.created_at}>{editorialDate(post.published_at||post.created_at)}</time><span>{readingMinutes(post.content||'')} min read</span></div></header>
    {post.featured_image&&<div className={styles.articleHero}><StoryImage post={post} lead sizes="(max-width: 1024px) 100vw, 1000px"/></div>}
    <div className={styles.readingLayout}><div className={styles.readingColumn}><div id="article-body" className={styles.body} dangerouslySetInnerHTML={{__html:renderBlogMarkdown(articleMarkdown(post.content||'',post.title)).replace(/<h1 class="article-h1">/g,'<h2 class="article-h2">').replace(/<\/h1>/g,'</h2>')}}/>
    {sources.length>0&&<section className={[styles.body,styles.sources].join(' ')} aria-labelledby="sources-heading"><h2 id="sources-heading">Sources</h2><ul>{sources.map((url:string)=><li key={url}><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></li>)}</ul></section>}
    {Array.isArray(post.tags)&&post.tags.length>0&&<div className={styles.tags} aria-label="Article topics">{post.tags.map((tag:string)=><span key={tag}>{tag}</span>)}</div>}
    <div className={styles.engagement}><BlogReactions postId={post.id}/><BlogComments postId={post.id}/></div></div>
    <aside className={styles.articleRail} aria-label="Article sharing and advertisement"><div className={styles.share}><h2>Share this perspective</h2>{share.map(item=><a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer">{item.name} ↗</a>)}</div><AdSlot placement="sidebar"/></aside></div></article>
    <div className={styles.related}>{related.length>0&&<section aria-labelledby="related-heading"><div className={styles.sectionHeading}><h2 id="related-heading">Related stories</h2><Link href="/blog">More from PurpleSoftHub ↗</Link></div><div className={styles.latestGrid}>{related.map(story=><StoryCard key={story.id} post={story}/>)}</div></section>}<div style={{maxWidth:750,margin:'48px auto 0'}}><AdSlot placement="after-article" house={<HouseAd/>}/></div><p style={{marginTop:32}}><Link href="/blog">← More from PurpleSoftHub</Link></p></div>
  </div></main><Footer/></>
}
