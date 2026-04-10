import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { getAuthenticatedProfile } from '@/lib/auth'

export default async function AdminSubscribersPage() {
  const auth = await getAuthenticatedProfile()
  if (!auth.ok) {
    redirect(auth.response.status === 401 ? '/sign-in' : '/dashboard')
  }

  if (auth.role !== 'admin') redirect('/dashboard')

  const supabase = await createClient()

  const { data: subscribers } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false })

  const active = subscribers?.filter(s => s.status !== 'unsubscribed').length || 0

  return (
    <>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">Newsletter Subscribers</h2>
          <p className="text-sm text-bodydark2 mt-1">{active} active subscribers</p>
        </div>
        {/* Export CSV button */}
        <button
          onClick={() => {
            const csv = [
              'Email,Date,Status',
              ...(subscribers || []).map(
                s => `${s.email},${format(new Date(s.created_at || s.subscribed_at), 'yyyy-MM-dd')},${s.status || 'active'}`
              )
            ].join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'subscribers.csv'
            a.click()
          }}
          className="px-4 py-2.5 rounded-lg border border-stroke dark:border-strokedark text-sm font-medium text-bodydark2 hover:border-brand-500 hover:text-brand-500 transition-all"
        >
          Export CSV ↓
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: 'Total',
            value: subscribers?.length || 0,
            color: 'text-brand-500'
          },
          { label: 'Active', value: active, color: 'text-green-500' },
          {
            label: 'This Month',
            value: subscribers?.filter(s => {
              const d = new Date(s.created_at || s.subscribed_at)
              const now = new Date()
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            }).length || 0,
            color: 'text-purple-500'
          }
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
            <p className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
            <p className="text-sm text-bodydark2">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
        {!subscribers?.length ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-4">📧</p>
            <p className="font-medium text-black dark:text-white mb-2">No subscribers yet</p>
            <p className="text-sm text-bodydark2">Newsletter subscribers will appear here</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark">
                {['Email', 'Subscribed', 'Status'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-bodydark2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub: any) => (
                <tr key={sub.id} className="border-b border-stroke/50 dark:border-strokedark/50 hover:bg-brand-500/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-black dark:text-white">{sub.email}</td>
                  <td className="px-6 py-4 text-sm text-bodydark2">
                    {format(new Date(sub.created_at || sub.subscribed_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        sub.status === 'unsubscribed'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}
                    >
                      {sub.status || 'active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
