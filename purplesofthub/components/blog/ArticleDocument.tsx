import Image from 'next/image'
import { renderBlogMarkdown } from '@/lib/blog/rendering'
import { editorialDate } from '@/lib/blog/queries'
import { httpsUrl } from '@/lib/blog/publishing'
import styles from './document.module.css'
export type ArticleDocumentProps={title:string;content:string;excerpt:string;image?:string;alt?:string;category?:string;author?:string;publishedAt?:string|null;sources?:string[]}
export default function ArticleDocument(props:ArticleDocumentProps) {
  const sources=props.sources?.filter(httpsUrl)||[]
  return <article className={styles.document}>
    <header>{props.category&&<p className={styles.category}>{props.category}</p>}<h1>{props.title||'Your article title'}</h1>{props.excerpt&&<p className={styles.excerpt}>{props.excerpt}</p>}<div className={styles.meta}><span>{props.author?.trim()||'PurpleSoftHub'}</span>{props.publishedAt&&<time dateTime={props.publishedAt}>{editorialDate(props.publishedAt)}</time>}</div></header>
    {props.image&&<div className={styles.image}><Image src={props.image} alt={props.alt||'Featured image preview'} fill sizes="(max-width: 768px) 100vw, 800px" unoptimized/></div>}
    {props.content?<div className={styles.content} dangerouslySetInnerHTML={{__html:renderBlogMarkdown(props.content)}}/>:<p className={styles.placeholder}>Your story will appear here as you write.</p>}
    {sources.length>0&&<section className={styles.content}><h2>Sources</h2><ul>{sources.map(url=><li key={url}><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></li>)}</ul></section>}
  </article>
}
