'use client'
import {useRef,useState,type FormEvent} from 'react'
import styles from './magazine.module.css'
export default function Newsletter({available=false}:{available?:boolean}) {
  const [state,setState]=useState<'idle'|'pending'|'success'|'error'>('idle')
  const [message,setMessage]=useState('')
  const lock=useRef(false)
  async function subscribe(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(!available||lock.current)return;lock.current=true;setState('pending');setMessage('')
    const email=new FormData(event.currentTarget).get('email')
    try {const response=await fetch('/api/newsletter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,source:'blog-insights'}),signal:AbortSignal.timeout(15000)});const result=await response.json();if(!response.ok||!result.success)throw new Error();setState('success');setMessage(result.message||'You’re subscribed. Welcome to PurpleSoftHub Insights.')}catch{setState('error');setMessage('We couldn’t complete your subscription. Please try again.')}finally{lock.current=false}
  }
  return <section className={styles.newsletter} aria-labelledby="newsletter-title"><p className={styles.kicker}>The next perspective</p><h2 id="newsletter-title">Stay ahead<span>.</span></h2><p>Technology, digital business and creative insights from PurpleSoftHub.</p>{available?<><form onSubmit={subscribe}><label htmlFor="insights-email">Email address</label><input id="insights-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={200} disabled={state==='pending'||state==='success'}/><button type="submit" disabled={state==='pending'||state==='success'}>{state==='pending'?'Subscribing…':state==='success'?'Subscribed ✓':'Subscribe →'}</button></form><p className={styles.newsletterNote}>By subscribing, you agree to our <a href="/privacy">Privacy Policy</a>. Unsubscribe anytime.</p><p className={styles.formMessage} role="status" aria-live="polite">{message}</p></>:<><p className={styles.newsletterNote}>Email signup is currently unavailable. Follow our latest insights on Telegram.</p><a className={styles.channelLink} href="https://t.me/purplesofthub" target="_blank" rel="noopener noreferrer">Follow our updates ↗</a></>}</section>
}
