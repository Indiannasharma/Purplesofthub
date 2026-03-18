export const dynamic = 'force-dynamic'

import connectDB from '@/lib/mongodb'
import BlogPost from '@/lib/models/BlogPost'
import Link from 'next/link'

async function getPosts() {
  await connectDB()
  return BlogPost.find({}).sort({ createdAt: -1 }).lean() as Promise<Array<Record<string, unknown>>>
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Blog Manager</h2>
          <p className="text-sm text-gray-400 mt-0.5">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/blog/new" className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-all">
          + New Post
        </Link>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={String(post._id)} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white max-w-xs">
                    <span className="line-clamp-1">{String(post.title)}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{String(post.category || '—')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${post.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {String(post.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{Number(post.views ?? 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                    {new Date(String(post.createdAt)).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/blog/${String(post._id)}/edit`} className="text-xs text-brand-400 hover:underline">
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No blog posts yet. <Link href="/admin/blog/new" className="text-brand-400 hover:underline">Write one →</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
