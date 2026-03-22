import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'

export default async function AdminBlogPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/sign-in')

  const role = user.user_metadata?.role || user.app_metadata?.role
  if (role !== 'admin') redirect('/dashboard')

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  const published = posts?.filter(p => p.status === 'published').length || 0
  const drafts = posts?.filter(p => p.status === 'draft').length || 0

  return (
    <>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">Blog Manager</h2>
          <p className="text-sm text-bodydark2 mt-1">
            {published} published · {drafts} drafts
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="px-4 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all"
        >
          + New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        {[
          { label: 'Total Posts', value: posts?.length || 0, color: 'text-brand-500' },
          { label: 'Published', value: published, color: 'text-green-500' },
          { label: 'Drafts', value: drafts, color: 'text-yellow-500' },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark"
          >
            <p className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
            <p className="text-sm text-bodydark2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Posts table */}
      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
        {!posts?.length ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-4">✍️</p>
            <p className="font-medium text-black dark:text-white mb-2">No blog posts yet</p>
            <p className="text-sm text-bodydark2 mb-4">
              Create your first post to start driving organic traffic
            </p>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all"
            >
              + Write First Post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke dark:border-strokedark">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-bodydark2">
                    Post
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-bodydark2 hidden md:table-cell">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-bodydark2">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-bodydark2 hidden lg:table-cell">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-bodydark2">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post: any) => (
                  <tr key={post.id} className="border-b border-stroke/50 dark:border-strokedark/50 hover:bg-brand-500/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-black dark:text-white text-sm line-clamp-1">
                          {post.title}
                        </p>
                        <p className="text-xs text-bodydark2 mt-0.5 line-clamp-1">
                          {post.excerpt || 'No excerpt'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-500 font-medium">
                        {post.category || 'Uncategorised'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-sm text-bodydark2">
                      {format(new Date(post.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="text-xs px-3 py-1.5 rounded-lg border border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white transition-all"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="text-xs px-3 py-1.5 rounded-lg border border-stroke dark:border-strokedark text-bodydark2 hover:border-brand-500 hover:text-brand-500 transition-all"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
