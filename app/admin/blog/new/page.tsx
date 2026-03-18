import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function NewBlogPostPage() {
  async function createPost(formData: FormData) {
    'use server'
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: BlogPostModel } = await import('@/lib/models/BlogPost')
    await connectDB()
    const title = String(formData.get('title') || '').trim()
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 100) + '-' + Date.now()
    const status = formData.get('status') === 'published' ? 'published' : 'draft'
    await BlogPostModel.create({
      title,
      slug,
      content: formData.get('content'),
      excerpt: formData.get('excerpt'),
      category: formData.get('category'),
      tags: String(formData.get('tags') || '').split(',').map((t) => t.trim()).filter(Boolean),
      status,
      publishedAt: status === 'published' ? new Date() : undefined,
      seoTitle: formData.get('seoTitle') || title,
      seoDescription: formData.get('seoDescription'),
    })
    redirect('/admin/blog')
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/blog" className="text-xs text-gray-400 hover:text-brand-400 mb-3 inline-block">
          ← Back to Blog
        </Link>
        <h2 className="text-2xl font-bold text-white">New Blog Post</h2>
      </div>

      <div className="max-w-3xl">
        <form action={createPost} className="space-y-5">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Title <span className="text-red-400">*</span></label>
              <input type="text" name="title" required placeholder="Post title…" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Excerpt</label>
              <input type="text" name="excerpt" placeholder="Short summary for preview cards…" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Content</label>
              <textarea name="content" rows={12} placeholder="Write your post in Markdown or plain text…" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none resize-y font-mono" />
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
            <h5 className="text-sm font-semibold text-white">Settings</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Category</label>
                <input type="text" name="category" placeholder="e.g. Tech, Music, Business" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Tags <span className="text-xs text-gray-500">(comma-separated)</span></label>
                <input type="text" name="tags" placeholder="nextjs, web design, seo" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Status</label>
              <select name="status" defaultValue="draft" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">SEO Title <span className="text-xs text-gray-500">(optional)</span></label>
              <input type="text" name="seoTitle" placeholder="Leave blank to use post title" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">SEO Description</label>
              <textarea name="seoDescription" rows={2} placeholder="Meta description for search engines…" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none resize-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-all">
              Save Post
            </button>
            <Link href="/admin/blog" className="text-sm text-gray-400 hover:text-white">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  )
}
