'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { useCallback } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...'
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand-500 underline'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full'
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none min-h-[400px] px-6 py-4 focus:outline-none'
      }
    }
  })

  const setLink = useCallback(() => {
    const url = window.prompt('Enter URL')
    if (!url) return
    editor?.chain().focus().setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL')
    if (!url) return
    editor?.chain().focus().setImage({ src: url }).run()
  }, [editor])

  if (!editor) return null

  const ToolbarButton = ({
    onClick,
    isActive = false,
    title,
    children
  }: {
    onClick: () => void
    isActive?: boolean
    title: string
    children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded text-sm transition-all ${
        isActive
          ? 'bg-brand-500 text-white'
          : 'text-bodydark hover:bg-brand-500/10 hover:text-brand-500'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="rounded-xl border border-stroke dark:border-strokedark overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-3 border-b border-stroke dark:border-strokedark bg-gray-50 dark:bg-boxdark">
        {/* Text style */}
        <div className="flex gap-1 pr-2 border-r border-stroke dark:border-strokedark">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <u>U</u>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            title="Highlight"
          >
            H
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1 pr-2 border-r border-stroke dark:border-strokedark">
          {[1, 2, 3].map(level => (
            <ToolbarButton
              key={level}
              onClick={() => editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()}
              isActive={editor.isActive('heading', { level })}
              title={`Heading ${level}`}
            >
              H{level}
            </ToolbarButton>
          ))}
        </div>

        {/* Lists */}
        <div className="flex gap-1 pr-2 border-r border-stroke dark:border-strokedark">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            • List
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Ordered List"
          >
            1. List
          </ToolbarButton>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 pr-2 border-r border-stroke dark:border-strokedark">
          {['left', 'center', 'right'].map(align => (
            <ToolbarButton
              key={align}
              onClick={() => editor.chain().focus().setTextAlign(align).run()}
              isActive={editor.isActive({ textAlign: align })}
              title={`Align ${align}`}
            >
              {align === 'left' ? '⬅' : align === 'center' ? '↔' : '➡'}
            </ToolbarButton>
          ))}
        </div>

        {/* Other */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Blockquote"
          >
            ❝
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            {'</>'}
          </ToolbarButton>
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            🔗
          </ToolbarButton>
          <ToolbarButton
            onClick={addImage}
            isActive={false}
            title="Add Image"
          >
            🖼️
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            isActive={false}
            title="Undo"
          >
            ↩
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            isActive={false}
            title="Redo"
          >
            ↪
          </ToolbarButton>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-white dark:bg-boxdark min-h-[400px]">
        <EditorContent editor={editor} />
      </div>

      {/* Footer */}
      <div className="px-6 py-2 border-t border-stroke dark:border-strokedark bg-gray-50 dark:bg-boxdark flex justify-between items-center">
        <span className="text-xs text-bodydark2">
          {editor.storage.characterCount.characters()} characters
        </span>
        <span className="text-xs text-bodydark2">
          {editor.storage.characterCount.words()} words
        </span>
      </div>
    </div>
  )
}
