'use client';

import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight, Check, X } from 'lucide-react';
import logo from '@/Assets/images/Purplesoft-logo-main.png';
import { NewsletterSubmission } from '@/lib/newsletter/client';
import { normalizeEmail } from '@/lib/newsletter/policy';
import styles from './newsletter-popup.module.css';

export default function NewsletterPopup({ open, onClose, onSubscribed, returnFocus }: {
  open: boolean; onClose(): void; onSubscribed(): void; returnFocus: RefObject<HTMLElement | null>;
}) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const title = useRef<HTMLHeadingElement>(null);
  const success = useRef<HTMLHeadingElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const submission = useRef(new NewsletterSubmission());
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => { if (!open) request.current?.abort(); }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submission.current.pending || state === 'success') return;
    if (!normalizeEmail(email)) { setState('error'); setError('Please enter a valid email address.'); input.current?.focus(); return; }
    setState('pending'); setError('');
    const controller = new AbortController();
    request.current = controller;
    try {
      const message = await submission.current.submit(email, 'newsletter-popup', fetch, controller.signal);
      if (controller.signal.aborted || message === null) return;
      onSubscribed();
      setState('success');
      // The confirmation is focused after React commits its new title.
      requestAnimationFrame(() => success.current?.focus());
    } catch {
      if (!controller.signal.aborted) { setState('error'); setError('We couldn’t complete your subscription. Please try again.'); }
    }
  }

  return <Dialog.Root open={open} onOpenChange={value => { if (!value) { request.current?.abort(); onClose(); } }}>
    <Dialog.Portal>
      <Dialog.Overlay className={styles.overlay} />
      <Dialog.Content className={styles.dialog} onOpenAutoFocus={event => { event.preventDefault(); title.current?.focus(); }} onCloseAutoFocus={event => {
        event.preventDefault();
        const target = returnFocus.current?.isConnected ? returnFocus.current : document.querySelector<HTMLElement>('nav a[href],main a[href]');
        target?.focus({ preventScroll: true });
      }}>
        <Dialog.Close className={styles.close} aria-label="Close newsletter popup"><X size={20} /></Dialog.Close>
        <aside className={styles.art} aria-hidden="true">
          <Image src={logo} alt="" width={150} height={44} className={styles.logo} />
          <div className={styles.motif}><span /><span /><span /><ArrowUpRight size={38} strokeWidth={1} /></div>
          <div className={styles.artCaption}><span>A FRESH PERSPECTIVE</span><p>Ideas for<br />what comes next.</p><span className={styles.edition}>TECHNOLOGY · CREATIVITY · CULTURE</span></div>
        </aside>
        <div className={styles.content}>
          <p className={styles.eyebrow}><span /> PURPLESOFTHUB INSIGHTS</p>
          {state === 'success' ? <div className={styles.success} role="status" aria-live="polite">
            <span className={styles.check}><Check size={26} /></span>
            <Dialog.Title ref={success} tabIndex={-1} className={styles.title}>You&apos;re on the list!</Dialog.Title>
            <Dialog.Description className={styles.description}>Thanks for subscribing. Watch your inbox for fresh ideas and digital insights.</Dialog.Description>
            <Dialog.Close className={styles.submit}>Back to exploring <ArrowUpRight size={18} /></Dialog.Close>
          </div> : <>
            <Dialog.Title ref={title} tabIndex={-1} className={styles.title}>The digital world moves fast.<br /><span>Stay ahead.</span></Dialog.Title>
            <Dialog.Description className={styles.description}>Fresh insights on technology, AI, design, marketing and digital innovation, delivered straight to your inbox.</Dialog.Description>
            <form onSubmit={submit} noValidate aria-busy={state === 'pending'}>
              <label htmlFor="newsletter-popup-email" className={styles.label}>Email address</label>
              <input ref={input} id="newsletter-popup-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="Enter your email address" maxLength={200} value={email} onChange={event => setEmail(event.target.value)} disabled={state === 'pending'} aria-invalid={state === 'error'} aria-describedby={error ? 'newsletter-popup-error' : undefined} required className={styles.input} />
              {error ? <p id="newsletter-popup-error" role="alert" className={styles.error}>{error}</p> : null}
              <button type="submit" disabled={state === 'pending'} className={styles.submit}>{state === 'pending' ? 'Subscribing…' : 'Keep Me Inspired →'}</button>
              <p className={styles.privacy}>No spam. Just valuable insights.<br />Unsubscribe anytime. <a href="/privacy">Privacy policy</a></p>
            </form>
            <Dialog.Close className={styles.defer}>Not now</Dialog.Close>
          </>}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
