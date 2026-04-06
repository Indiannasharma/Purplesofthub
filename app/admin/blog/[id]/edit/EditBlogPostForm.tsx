'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
// TODO: Restore RichTextEditor component from git
// import RichTextEditor from '@/components/Editor/RichTextEditor'
import Link from 'next/link'

const CATEGORIES = [
  'Tech', 'Marketing', 'SaaS',
  'Music', 'Web Dev', 'Mobile',
  'Business', 'AI', 'Design'
]

export default function EditBlogPostForm({ post }: { post: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [title, setTitle] = useState(post.title || '')
  const [slug, setSlug] = useState(post.slug || '')
  const [excerpt, setExcerpt] = useState(post.excerpt || '')
  const [content, setContent] = useState(post.content || '')
  const [category, setCategory] = useState(post.category || '')
  const [coverImage, setCoverImage] = useState(post.cover_image || '')
  const [seoTitle, setSeoTitle] = useState(post.seo_title || '')
  const [seoDescription, setSeoDescription] = useState(post.seo_description || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (publishStatus: 'draft' | 'published') => {
    if (!title || !content) {
      setError('Title and content are required')
      return
    }

    setSaving(true)
    setError('')

    const wordCount = content
      .replace(/<[^>]+>/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length

    const readTime = `${Math.ceil(wordCount / 200)} min read`

    const { error: err } = await supabase
      .from('blog_posts')
      .update({
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt,
        content,
        category,
        cover_image: coverImage,
        seo_title: seoTitle || title,
        seo_description: seoDescription || excerpt,
        status: publishStatus,
        read_time: readTime,
        updated_at: new Date().toISOString(),
        published_at: publishStatus === 'published' && post.status !== 'published'
          ? new Date().toISOString()
          : post.published_at
      })
      .eq('id', post.id)

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    router.push('/admin/blog')
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="text-bodydark2 hover:text-brand-500 transition-colors text-sm"
          >
            ← Blog
          </Link>
          <h2 className="text-2xl font-bold text-black dark:text-white">Edit Post</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg border border-stroke dark:border-strokedark text-sm font-medium text-bodydark2 hover:border-brand-500 hover:text-brand-500 transition-all disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Post'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <input
            type="text"
            placeholder="Post title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full text-2xl font-bold bg-transparent border-0 border-b-2 border-stroke dark:border-strokedark text-black dark:text-white placeholder-bodydark2 pb-3 focus:outline-none focus:border-brand-500"
          />

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your post here..."
            className="w-full h-96 p-4 border border-stroke dark:border-strokedark rounded-lg bg-white dark:bg-boxdark text-black dark:text-white placeholder-bodydark2 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
            <h6 className="font-semibold text-black dark:text-white mb-4">Post Settings</h6>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-bodydark2 mb-1.5">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stroke dark:border-strokedark bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-bodydark2 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-sm text-black dark:text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-bodydark2 mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={e => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-stroke dark:border-strokedark bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
            <h6 className="font-semibold text-black dark:text-white mb-3">Excerpt</h6>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="Brief description..."
              rows={3}
              maxLength={300}
              className="w-full px-3 py-2 rounded-lg border border-stroke dark:border-strokedark bg-transparent text-sm text-black dark:text-white placeholder-bodydark2 focus:outline-none focus:border-brand-500 resize-none"
            />
            <p className="text-xs text-bodydark2 mt-1 text-right">{excerpt.length}/300</p>
          </div>

          <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
            <h6 className="font-semibold text-black dark:text-white mb-3">SEO Settings</h6>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-bodydark2 mb-1.5">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={e => setSeoTitle(e.target.value)}
                  placeholder={title || 'SEO title...'}
                  className="w-full px-3 py-2 rounded-lg border border-stroke dark:border-strokedark bg-transparent text-sm text-black dark:text-white focus:outline-none focus:border-brand-500"
                />
                <p className="text-xs text-bodydark2 mt-1">{seoTitle.length}/60 chars</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-bodydark2 mb-1.5">
                  Meta Description
                </label>
                <textarea
                  value={seoDescription}
                  onChange={e => setSeoDescription(e.target.value)}
                  placeholder={excerpt || 'Meta description...'}
                  rows={3}
                  maxLength={160}
                  className="w-full px-3 py-2 rounded-lg border border-stroke dark:border-strokedark bg-transparent text-sm text-black dark:text-white placeholder-bodydark2 focus:outline-none focus:border-brand-500 resize-none"
                />
                <p className="text-xs text-bodydark2 mt-1 text-right">{seoDescription.length}/160</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
