'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Circle, Eye, FileText, ImagePlus, List, Save, Search, Send, Settings2, Upload, X } from 'lucide-react'
import { AdminPage } from '@/components/admin/AdminPage'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ccFontVariables } from '@/components/command-center/fonts'
import { blogSlug, excerptDescription, type BlogPost, type BlogStatus } from '@/lib/blog/publishing'
import { editorialDate } from '@/lib/blog/queries'
import styles from './editor.module.css'
const BlogPreview=dynamic(()=>import('./BlogPreview'))
type Form={title:string;slug:string;content:string;excerpt:string;featured_image:string;featured_image_alt:string;category:string;tags:string;source_urls:string;seo_title:string;seo_description:string;author:string;author_type:'Person'|'Organization';status:BlogStatus}
const empty:Form={title:'',slug:'',content:'',excerpt:'',featured_image:'',featured_image_alt:'',category:'',tags:'',source_urls:'',seo_title:'',seo_description:'',author:'PurpleSoftHub',author_type:'Organization',status:'draft'}
function fromPost(post:BlogPost):Form{return {title:post.title,slug:post.slug,content:post.content||'',excerpt:post.excerpt||'',featured_image:post.featured_image||'',featured_image_alt:post.featured_image_alt||'',category:post.category||'',tags:post.tags?.join(', ')||'',source_urls:post.source_urls?.join('\n')||'',seo_title:post.seo_title||'',seo_description:post.seo_description||'',author:post.author_name||'PurpleSoftHub',author_type:post.author_name==='PurpleSoftHub'?'Organization':post.author_type||'Person',status:post.status}}
export default function BlogEditor({id}:{id?:string}) {
  const router=useRouter()
  const [form,setForm]=useState<Form>(empty)
  const [baseline,setBaseline]=useState<Form>(empty)
  const [post,setPost]=useState<BlogPost|null>(null)
  const [categories,setCategories]=useState<{name:string;slug:string}[]>([])
  const [file,setFile]=useState<File|null>(null)
  const [image,setImage]=useState('')
  const [loading,setLoading]=useState(true)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [fields,setFields]=useState<Record<string,string>>({})
  const [success,setSuccess]=useState('')
  const [retry,setRetry]=useState(0)
  const [preview,setPreview]=useState(false)
  const [navigationTarget,setNavigationTarget]=useState<string|null>(null)
  const allowNavigation=useRef(false)
  const saveLock=useRef(false)
  const fileInput=useRef<HTMLInputElement>(null)
  const contentInput=useRef<HTMLTextAreaElement>(null)
  const dirty=!loading&&(Boolean(file)||JSON.stringify(form)!==JSON.stringify(baseline))
  const slug=form.slug||blogSlug(form.title)
  const canonical='https://www.purplesofthub.com/blog/'+(slug||'your-article-slug')
  const seoTitle=form.seo_title||excerptDescription(form.title,70)
  const seoDescription=form.seo_description||excerptDescription(form.excerpt)
  const words=form.content.trim().split(/\s+/).filter(Boolean).length
  useEffect(()=>{
    const controller=new AbortController()
    async function load(){setLoading(true);try {
      const response=await fetch('/api/admin/blog/publish'+(id?'?id='+encodeURIComponent(id):''),{signal:controller.signal})
      const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not load the editor.')
      if(controller.signal.aborted)return
      setCategories(result.categories)
      const next=result.post?fromPost(result.post):empty;setForm(next);setBaseline(next);setPost(result.post||null);setError('')
    }catch(error){if(!controller.signal.aborted)setError(error instanceof Error?error.message:'Could not load the editor.')}
    finally{if(!controller.signal.aborted)setLoading(false)}}
    void Promise.resolve().then(load);return()=>controller.abort()
  },[id,retry])
  useEffect(()=>{let active=true;const url=file?URL.createObjectURL(file):form.featured_image;void Promise.resolve().then(()=>{if(active)setImage(url)});return()=>{active=false;if(file)URL.revokeObjectURL(url)}},[file,form.featured_image])
  useEffect(()=>{
    if(!dirty)return
    const unload=(event:BeforeUnloadEvent)=>{if(!allowNavigation.current){event.preventDefault();event.returnValue=''}}
    const navigation=(event:MouseEvent)=>{
      if(allowNavigation.current||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return
      const anchor=event.target instanceof Element?event.target.closest('a[href]') as HTMLAnchorElement|null:null
      if(!anchor||anchor.target==='_blank'||anchor.hasAttribute('download'))return
      const next=new URL(anchor.href,window.location.href)
      if(next.pathname===window.location.pathname&&next.search===window.location.search)return
      event.preventDefault();event.stopPropagation();setNavigationTarget(next.href)
    }
    window.addEventListener('beforeunload',unload);document.addEventListener('click',navigation,true)
    return()=>{window.removeEventListener('beforeunload',unload);document.removeEventListener('click',navigation,true)}
  },[dirty])
  const update=useCallback((name:keyof Form,value:string)=>{
    setForm(current=>({...current,[name]:value,...(name==='author'?{author_type:value.trim()==='PurpleSoftHub'?'Organization' as const:'Person' as const}:{})}))
    setFields(current=>{const next={...current};delete next[name];return next});setSuccess('')
  },[])
  async function save(status:BlogStatus) {
    if(saveLock.current)return
    saveLock.current=true;setBusy(true);setError('');setFields({});setSuccess('')
    try {
      const payload={...form,operation:id?'update':'create',status,...(id?{id,expected_updated_at:post?.updated_at??undefined}:{}),
        slug:form.slug||(!post?.published_at?blogSlug(form.title):undefined),featured_image:file?undefined:form.featured_image,
        tags:form.tags.split(',').map(t=>t.trim()).filter(Boolean),source_urls:form.source_urls.split(/\r?\n/).map(t=>t.trim()).filter(Boolean),content_format:'markdown'}
      const body=new FormData();body.append('payload',JSON.stringify(payload));if(file)body.append('image',file)
      const response=await fetch('/api/admin/blog/publish',{method:'POST',body});const result=await response.json()
      if(!response.ok){setFields(result.fields||{});throw new Error(result.error||'The article was not saved.')}
      const next=fromPost(result.post);setPost(result.post);setForm(next);setBaseline(next);setFile(null);if(fileInput.current)fileInput.current.value=''
      setSuccess(status==='published'?'Your article is published and ready to read.':'Draft saved. Only administrators can preview it.')
      if(!id)router.replace('/admin/blog/edit/'+result.post.id);router.refresh()
    }catch(error){setError(error instanceof Error?error.message:'The article was not saved.')}
    finally{saveLock.current=false;setBusy(false)}
  }
  function chooseImage(event:React.ChangeEvent<HTMLInputElement>){const candidate=event.target.files?.[0];if(!candidate)return
    if(candidate.size>3*1024*1024||!['image/png','image/jpeg','image/webp','image/avif'].includes(candidate.type)){setError('Choose a PNG, JPG, WebP or AVIF image of at most 3 MB.');event.target.value='';return}
    setFile(candidate);setError('');setSuccess('')}
  function removeImage(){setFile(null);update('featured_image','');update('featured_image_alt','');if(fileInput.current)fileInput.current.value=''}
  function formatting(kind:string){const el=contentInput.current;if(!el)return;const selected=form.content.slice(el.selectionStart,el.selectionEnd)
    const formats:Record<string,string>={h2:'\n## '+(selected||'Section heading')+'\n',h3:'\n### '+(selected||'Subheading')+'\n',bold:'**'+(selected||'bold text')+'**',list:'\n- '+(selected||'List item')+'\n',link:'['+(selected||'link text')+'](https://example.com)'}
    update('content',form.content.slice(0,el.selectionStart)+formats[kind]+form.content.slice(el.selectionEnd));el.focus()}
  function fieldError(name:string){return fields[name]?<small id={'blog-error-'+name} className={styles.errorText}>{fields[name]}</small>:null}
  function text(name:keyof Form,label:string,max?:number,placeholder?:string){return <label className={styles.field} htmlFor={'blog-'+name}><span className={styles.fieldLabel}>{label}</span><input id={'blog-'+name} value={form[name]} maxLength={max} placeholder={placeholder} onChange={e=>update(name,e.target.value)} className={name==='title'?styles.titleInput:undefined} readOnly={name==='slug'&&Boolean(post?.published_at)} aria-invalid={Boolean(fields[name])} aria-describedby={fields[name]?'blog-error-'+name:undefined}/>{fieldError(name)}</label>}
  return <AdminPage className="cc-module">
    <header className={styles.header}><div><Link className={styles.back} href="/admin/blog"><ArrowLeft size={12} aria-hidden="true"/>Blog Management</Link><h1>{id?'Edit article':'Create an article'}</h1><div className={styles.headerMeta}><span>{words} words{words?' · ~'+Math.max(1,Math.ceil(words/200))+' min read':''}</span><span>{form.status==='published'?'Published':'Draft'}</span>{dirty?<span className={styles.dirty}><Circle size={7} fill="currentColor" aria-hidden="true"/>Unsaved changes</span>:post&&<span><Check size={11} aria-hidden="true"/> Saved</span>}</div></div>
      <div className={styles.actions}><button className={styles.button} type="button" disabled={loading||busy} onClick={()=>setPreview(true)}><Eye size={13} aria-hidden="true"/>Preview</button><button className={styles.button} type="button" disabled={loading||busy} onClick={()=>save('draft')}><Save size={13} aria-hidden="true"/>{busy?'Saving…':'Save Draft'}</button><button className={styles.button+' '+styles.primary} type="button" disabled={loading||busy} onClick={()=>save(post?.status==='published'?form.status:'published')}><Send size={13} aria-hidden="true"/>{busy?'Saving…':post?.status==='published'?'Update article':'Publish'}</button></div>
    </header>
    {error&&<div className={styles.alert} role="alert">{error}{Object.keys(fields).length>0&&<ul>{Object.entries(fields).map(([name,message])=><li key={name}><a href={'#blog-'+name}>{message}</a></li>)}</ul>}{!categories.length&&<button type="button" className={styles.button} onClick={()=>setRetry(n=>n+1)}>Retry loading</button>}</div>}
    {success&&<div className={styles.success} role="status">{success}</div>}
    {loading?<div className={styles.skeleton} role="status" aria-label="Loading article editor"><Skeleton className="h-40 w-full"/><Skeleton className="h-96 w-full"/></div>:<fieldset disabled={busy} className={styles.layout}>
      <div className={styles.main}><section className={styles.card}><h2 className={styles.sectionTitle}><FileText size={15} aria-hidden="true"/>The story</h2>{text('title','Article title',200,'Give your insight a clear, compelling title')}{text('slug','URL slug',post?.published_at?undefined:100,blogSlug(form.title)||'Generated from your title')}<p className={styles.hint}>{post?.published_at?'Published URLs stay unchanged to preserve existing links.':'Leave blank to generate a URL from the title.'}</p></section>
        <section className={styles.card}><h2 className={styles.sectionTitle}><PencilIcon/>Article content</h2><div className={styles.toolbar}>{[{key:'h2',text:'H2'},{key:'h3',text:'H3'},{key:'bold',text:'Bold'},{key:'list',text:'List'},{key:'link',text:'Link'}].map(item=><button key={item.key} type="button" className={styles.button} onClick={()=>formatting(item.key)} aria-label={'Insert '+item.text}>{item.text}</button>)}</div><label className={styles.field} htmlFor="blog-content"><span className="sr-only">Article content in Markdown</span><textarea id="blog-content" ref={contentInput} className={styles.content} value={form.content} onChange={e=>update('content',e.target.value)} maxLength={100000} placeholder={'## Begin with an idea\n\nWrite your article here…'} aria-invalid={Boolean(fields.content)} aria-describedby="content-help"/>{fieldError('content')}</label><p className={styles.hint} id="content-help">Markdown supports headings, paragraphs, lists, emphasis, and links. Use Preview to see your formatting.</p></section>
        <section className={styles.card}><h2 className={styles.sectionTitle}><List size={15} aria-hidden="true"/>Excerpt</h2><p className={styles.sectionDescription}>A concise introduction for article cards and search results.</p><label className={styles.field} htmlFor="blog-excerpt"><span className="sr-only">Article excerpt</span><textarea id="blog-excerpt" rows={4} maxLength={500} value={form.excerpt} onChange={e=>update('excerpt',e.target.value)} placeholder="What will your reader learn?" aria-invalid={Boolean(fields.excerpt)}/>{fieldError('excerpt')}<span className={styles.counter}>{form.excerpt.length}/500 characters</span></label></section>
      </div>
      <aside className={styles.sidebar}>
        <section className={styles.card}><h2 className={styles.sectionTitle}><Settings2 size={15} aria-hidden="true"/>Publishing</h2><label className={styles.field} htmlFor="blog-status"><span className={styles.fieldLabel}>Status</span><select id="blog-status" value={form.status} onChange={e=>update('status',e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select>{fieldError('status')}</label><label className={styles.field} htmlFor="blog-category"><span className={styles.fieldLabel}>Category</span><select id="blog-category" value={form.category} onChange={e=>update('category',e.target.value)}><option value="">Uncategorized</option>{categories.map(c=><option key={c.slug} value={c.name}>{c.name}</option>)}</select>{fieldError('category')}</label>{text('tags','Tags · comma separated',undefined,'technology, design')}{text('author','Author',120)}<label className={styles.field} htmlFor="blog-author_type"><span className={styles.fieldLabel}>Author type</span><select id="blog-author_type" value={form.author_type} disabled={form.author.trim()==='PurpleSoftHub'} onChange={e=>update('author_type',e.target.value)}><option value="Organization">Organization</option><option value="Person">Person</option></select></label><div className={styles.date}>{post?.published_at?<>First published <time dateTime={post.published_at}>{editorialDate(post.published_at)}</time></>:'The publication date is set when you first publish.'}</div></section>
        <section className={styles.card}><h2 className={styles.sectionTitle}><ImagePlus size={15} aria-hidden="true"/>Featured image</h2>{image?<div className={styles.imagePreview}><Image src={image} alt={form.featured_image_alt||'Featured image preview'} fill sizes="(max-width: 1050px) 50vw, 330px" unoptimized/></div>:<div className={styles.imageEmpty}><ImagePlus size={24} aria-hidden="true"/>Give your story a strong first impression.<br/>Recommended: 1200 × 675 px · 16:9</div>}<input ref={fileInput} id="blog-image" aria-label="Upload featured image" className={styles.fileInput} type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={chooseImage}/><div className={styles.imageActions}><button id="blog-upload" className={styles.button} type="button" onClick={()=>fileInput.current?.click()}><Upload size={12} aria-hidden="true"/>{image?'Replace':'Upload'}</button>{image&&<button className={styles.button} type="button" onClick={removeImage}><X size={12} aria-hidden="true"/>Remove</button>}</div><p className={styles.hint}>PNG, JPG, WebP, or AVIF · up to 3 MB.<br/>1200 × 675 px is recommended; images are cropped to 16:9.</p><div style={{marginTop:18}}>{!file&&text('featured_image','Existing image URL',2048,'https://…')}{fieldError('featured_image')}{text('featured_image_alt','Featured image alt text',300,'Describe what the image shows')}</div></section>
        <section className={styles.card}><h2 className={styles.sectionTitle}><Search size={15} aria-hidden="true"/>SEO & discovery</h2>{text('seo_title','SEO title',200,excerptDescription(form.title,70)||'Uses your title when blank')}<p className={styles.counter}><span className={seoTitle.length>70?styles.recommended:undefined}>{seoTitle.length} characters</span><span>Recommended: 50–70</span></p><label className={styles.field} htmlFor="blog-seo_description" style={{marginTop:18}}><span className={styles.fieldLabel}>Meta description</span><textarea id="blog-seo_description" value={form.seo_description} onChange={e=>update('seo_description',e.target.value)} maxLength={500} rows={4} placeholder={excerptDescription(form.excerpt)||'Uses your excerpt when blank'}/>{fieldError('seo_description')}<span className={styles.counter}><span className={seoDescription.length>160?styles.recommended:undefined}>{seoDescription.length} characters</span><span>Recommended: 140–160</span></span></label><p className={styles.hint}>Longer titles and descriptions may be shortened in search results.</p><p className={styles.fieldLabel} style={{marginTop:18}}>Canonical URL</p><div className={styles.canonical}>{canonical}</div><div className={styles.searchPreview} aria-label="Search result preview"><strong>{seoTitle||'Your article title'}</strong><p>{seoDescription||'Your search description will appear here.'}</p></div></section>
        <section className={styles.card}><h2 className={styles.sectionTitle}>Source references</h2><label className={styles.field} htmlFor="blog-source_urls"><span className={styles.fieldLabel}>Source URLs · one per line</span><textarea id="blog-source_urls" rows={3} value={form.source_urls} onChange={e=>update('source_urls',e.target.value)} placeholder="https://example.com/source"/>{fieldError('source_urls')}</label></section>
      </aside>
    </fieldset>}
    <Dialog open={Boolean(navigationTarget)} onOpenChange={open=>{if(!open)setNavigationTarget(null)}}><DialogContent className={ccFontVariables+' workspace-overlay'} role="alertdialog"><DialogTitle>Leave without saving?</DialogTitle><DialogDescription>Your current edits have not been saved. Keep editing or leave this article and discard the changes.</DialogDescription><div className={styles.actions}><button type="button" className={styles.button} onClick={()=>setNavigationTarget(null)}>Keep editing</button><button type="button" className={styles.button+' '+styles.primary} onClick={()=>{if(!navigationTarget)return;allowNavigation.current=true;const next=new URL(navigationTarget);setNavigationTarget(null);if(next.origin===window.location.origin)router.push(next.pathname+next.search+next.hash);else window.location.assign(next.href)}}>Leave without saving</button></div></DialogContent></Dialog>
    {preview&&<BlogPreview open={preview} onClose={()=>setPreview(false)} article={{title:form.title,content:form.content,excerpt:form.excerpt,image,alt:form.featured_image_alt,category:form.category,author:form.author,publishedAt:post?.published_at,sources:form.source_urls.split(/\r?\n/)}}/>}
  </AdminPage>
}
function PencilIcon(){return <FileText size={15} aria-hidden="true"/>}
