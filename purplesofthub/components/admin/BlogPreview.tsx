'use client'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ccFontVariables } from '@/components/command-center/fonts'
import ArticleDocument, { type ArticleDocumentProps } from '@/components/blog/ArticleDocument'
import styles from './editor.module.css'
export default function BlogPreview({open,onClose,article}:{open:boolean;onClose:()=>void;article:ArticleDocumentProps}) {
  return <Dialog open={open} onOpenChange={value=>{if(!value)onClose()}}><DialogContent className={ccFontVariables+' workspace-overlay '+styles.previewDialog}><DialogTitle className={styles.previewTitle}>Article preview</DialogTitle><DialogDescription className={styles.previewDescription}>A private preview of your current edits. Unsaved changes have not been published.</DialogDescription><ArticleDocument {...article}/></DialogContent></Dialog>
}
