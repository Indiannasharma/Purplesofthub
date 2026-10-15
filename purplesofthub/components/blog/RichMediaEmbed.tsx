'use client';
import { useEffect, useRef, useState } from 'react';
import { mediaDocument, recognizeMedia, validateMediaBlock, type MediaBlock } from '@/lib/blog/media';
import styles from './media.module.css';

export default function RichMediaEmbed({ block }: { block: MediaBlock }) {
  const [phase, setPhase] = useState<'idle' | 'loading' | 'loaded' | 'unavailable'>('idle');
  const frame = useRef<HTMLIFrameElement>(null);
  const loadButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const validated = validateMediaBlock(block);
  const spec = validated && recognizeMedia(validated.sourceUrl, validated.caption);
  useEffect(() => {
    if (phase === 'loading') frame.current?.focus();
    else if (restoreFocus.current) { restoreFocus.current = false; loadButton.current?.focus(); }
  }, [phase]);
  useEffect(() => {
    if (phase !== 'loading') return;
    const timer = window.setTimeout(() => setPhase('unavailable'), 15000);
    return () => window.clearTimeout(timer);
  }, [phase]);
  if (!spec) return <p>Media unavailable. The rest of this article is unchanged.</p>;
  const document = mediaDocument(spec);
  const supported = Boolean(spec.frameUrl || document);
  const active = phase === 'loading' || phase === 'loaded';
  const compactAudio = spec.variant === 'audio' && (/\/(?:track|song)\//.test(spec.sourceUrl) || spec.sourceUrl.includes('?i='));
  return <figure className={styles.media} data-media-provider={spec.provider}>
    <div className={styles.source}><span>{spec.label}</span><span>{spec.variant === 'audio' ? 'Listen' : spec.variant === 'post' ? 'Social perspective' : 'Watch'}</span></div>
    <div className={styles.stage + ' ' + styles[spec.variant] + (compactAudio ? ' ' + styles.compactAudio : '')}>
      {active ? <>
        {phase === 'loading' && <p className={styles.loading} role="status">Connecting to {spec.label}…</p>}
        <iframe ref={frame} title={spec.label + ' embedded media'} src={spec.frameUrl} srcDoc={document} loading="lazy" referrerPolicy="no-referrer" sandbox={'allow-scripts allow-popups allow-popups-to-escape-sandbox' + (document ? '' : ' allow-same-origin')} allow="encrypted-media; fullscreen; picture-in-picture" allowFullScreen onLoad={() => setPhase('loaded')} onError={() => setPhase('unavailable')} />
      </> : <div className={styles.placeholder}>
        <span className={styles.symbol} aria-hidden="true">{spec.variant === 'audio' ? '♫' : spec.variant === 'post' ? '↗' : '▷'}</span>
        <strong>{phase === 'unavailable' ? 'This media could not be loaded' : spec.label + (spec.variant === 'audio' ? ' player' : ' media')}</strong>
        <p>{!supported ? 'This link does not offer a supported player. Open the original to explore it.' : phase === 'unavailable' ? 'It may be private, restricted or temporarily unavailable. You can still open the original.' : 'Loading this media connects to ' + spec.label + ', which may use cookies and process data under its own privacy policy. Your analytics choice does not load this player.'}</p>
        {supported && <button ref={loadButton} type="button" onClick={() => setPhase('loading')}>{phase === 'unavailable' ? 'Try again' : 'Load ' + spec.label + ' media'}</button>}
      </div>}
    </div>
    <div className={styles.links}><a href={spec.sourceUrl} target="_blank" rel="noopener noreferrer">Open original on {spec.label} ↗</a>{active && <button type="button" onClick={() => { restoreFocus.current = true; setPhase('idle'); }}>Close media</button>}</div>
    {active && <p className={styles.note}>If the provider cannot display this content, use Open original. Availability and sign-in requirements are controlled by {spec.label}.</p>}
    {spec.caption && <figcaption>{spec.caption}</figcaption>}
  </figure>;
}
