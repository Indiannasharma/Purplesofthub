import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'

export default async function AdminLeadsPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/sign-in')

  const role = user.user_metadata?.role || user.app_metadata?.role
  if (role !== 'admin') redirect('/dashboard')

  const { data: leads } = await supabase
    .from('chat_leads')
    .select('*')
    .order('created_at', { ascending: false })

  const newLeads = leads?.filter(l => l.status === 'new').length || 0

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">Chat Leads</h2>
        <p className="text-sm text-bodydark2 mt-1">
          {newLeads} new · {leads?.length || 0} total
        </p>
      </div>

      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark overflow-hidden">
        {!leads?.length ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-4">💬</p>
            <p className="font-medium text-black dark:text-white mb-2">No chat leads yet</p>
            <p className="text-sm text-bodydark2">Leads from Puri chatbot will appear here</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark">
                {['Name', 'Email', 'Summary', 'Source', 'Date', 'Status'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-bodydark2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead: any) => (
                <tr
                  key={lead.id}
                  className="border-b border-stroke/50 dark:border-strokedark/50 hover:bg-brand-500/5 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-black dark:text-white">{lead.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-bodydark2">
                    <a href={`mailto:${lead.email}`} className="hover:text-brand-500 transition-colors">
                      {lead.email}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm text-bodydark2 max-w-xs">
                    <p className="line-clamp-2">{lead.summary || '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-500 font-medium">
                      {lead.source || 'chatbot'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-bodydark2">
                    {format(new Date(lead.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        lead.status === 'new'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}
                    >
                      {lead.status || 'new'}
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
