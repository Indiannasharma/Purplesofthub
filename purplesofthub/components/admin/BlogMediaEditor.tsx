'use client';
import { useRef, useState, type RefObject } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ccFontVariables } from '@/components/command-center/fonts';
import { articleSegments, editMedia } from '@/lib/blog/media-content';
import { recognizeMedia, serializeMedia } from '@/lib/blog/media';
import RichMediaEmbed from '@/components/blog/RichMediaEmbed';
import styles from './editor.module.css';
import mediaStyles from './media-editor.module.css';

export default function BlogMediaEditor({ content, onChange, input }: { content: string; onChange: (value: string) => void; input: RefObject<HTMLTextAreaElement | null> }) {
  const [editing, setEditing] = useState<number | null>(null);
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [position, setPosition] = useState(0);
  const returnFocus = useRef<HTMLElement | null>(null);
  const blocks = articleSegments(content).filter(s => s.type === 'media');
  const spec = recognizeMedia(url, caption);
  function open(index = -1) {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPosition(input.current?.selectionEnd ?? content.length);
    setEditing(index); setUrl(index >= 0 ? blocks[index].block.sourceUrl : ''); setCaption(index >= 0 ? blocks[index].block.caption : '');
  }
  function insert() {
    if (!spec || editing === null) return;
    onChange(editing >= 0 ? editMedia(content, editing, 'replace', spec) : content.slice(0, position) + serializeMedia(spec) + content.slice(position));
    setEditing(null);
  }
  return <div className={mediaStyles.editor}>
    <button className={styles.button} type="button" onClick={() => open()}>Insert Media Embed</button>
    <p className={styles.hint}>Paste a video, social post or music URL into Insert Media. Ordinary links and Markdown remain unchanged.</p>
    {blocks.length > 0 && <ol className={mediaStyles.blocks} aria-label="Article media blocks">{blocks.map((item, index) => <li key={index}>
      <div><strong>{recognizeMedia(item.block.sourceUrl)?.label} · {index + 1}</strong><p>{item.block.caption || item.block.sourceUrl}</p></div>
      <div className={mediaStyles.controls}>
        <button type="button" className={styles.button} onClick={() => open(index)} aria-label={'Edit media ' + (index + 1)}>Edit</button>
        <button type="button" className={styles.button} disabled={index === 0} onClick={() => onChange(editMedia(content, index, 'up'))} aria-label={'Move media ' + (index + 1) + ' up'}>↑</button>
        <button type="button" className={styles.button} disabled={index === blocks.length - 1} onClick={() => onChange(editMedia(content, index, 'down'))} aria-label={'Move media ' + (index + 1) + ' down'}>↓</button>
        <button type="button" className={styles.button} onClick={() => onChange(editMedia(content, index, 'remove'))} aria-label={'Remove media ' + (index + 1)}>Remove</button>
      </div>
    </li>)}</ol>}
    <Dialog open={editing !== null} onOpenChange={open => { if (!open) setEditing(null); }}><DialogContent className={ccFontVariables + ' workspace-overlay ' + mediaStyles.dialog} onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus({ preventScroll: true }); }}>
      <DialogTitle>{editing === -1 ? 'Insert media' : 'Edit media'}</DialogTitle>
      <DialogDescription>Use the original content URL, not an iframe or script. Previewing the placeholder does not contact the provider.</DialogDescription>
      <label className={styles.field}><span className={styles.fieldLabel}>Media URL</span><input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" aria-invalid={Boolean(url && !spec)} aria-describedby="media-url-help" maxLength={2048}/></label>
      <p className={styles.hint} id="media-url-help">{spec ? spec.label + ' detected · ' + spec.variant + (spec.frameUrl || spec.script || spec.provider === 'cloudinary' ? ' player' : ' · original-link fallback') : url ? 'Unsupported URL. Use a full public content link. For TikTok short links, open the link and copy the full @creator/video URL. Embed snippets are not accepted.' : 'YouTube, TikTok, Facebook, X, Threads, Reddit, Instagram, Spotify, Audiomack, Apple Music and approved Cloudinary MP4/WebM clips.'}</p>
      <label className={styles.field}><span className={styles.fieldLabel}>Caption (optional)</span><input value={caption} maxLength={400} onChange={e => setCaption(e.target.value)}/></label>
      {spec && <RichMediaEmbed key={spec.sourceUrl} block={spec}/>}
      <div className={styles.actions}><button className={styles.button} type="button" onClick={() => setEditing(null)}>Cancel</button><button className={styles.button + ' ' + styles.primary} type="button" disabled={!spec} onClick={insert}>{editing === -1 ? 'Insert media block' : 'Save media block'}</button></div>
    </DialogContent></Dialog>
  </div>;
}
