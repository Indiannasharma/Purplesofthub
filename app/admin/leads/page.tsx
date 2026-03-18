export const dynamic = 'force-dynamic'

import connectDB from '@/lib/mongodb'
import ChatLead from '@/lib/models/ChatLead'

const STATUS_COLORS: Record<string, string> = {
  new:       'bg-brand-500/20 text-brand-400',
  contacted: 'bg-blue-500/20 text-blue-400',
  converted: 'bg-green-500/20 text-green-400',
  dismissed: 'bg-gray-500/20 text-gray-400',
}

async function getLeads() {
  await connectDB()
  return ChatLead.find({}).sort({ createdAt: -1 }).lean() as Promise<Array<Record<string, unknown>>>
}

export default async function LeadsPage() {
  const leads = await getLeads()
  const newCount = leads.filter((l) => l.status === 'new').length

  async function markContacted(formData: FormData) {
    'use server'
    const { default: connectDBFn } = await import('@/lib/mongodb')
    const { default: ChatLeadModel } = await import('@/lib/models/ChatLead')
    await connectDBFn()
    await ChatLeadModel.findByIdAndUpdate(String(formData.get('id')), { status: 'contacted' })
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/admin/leads')
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Chat Leads</h2>
          <p className="text-sm text-gray-400 mt-0.5">{leads.length} total — <span className="text-brand-400">{newCount} new</span></p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'New', count: leads.filter((l) => l.status === 'new').length, color: 'text-brand-400' },
          { label: 'Contacted', count: leads.filter((l) => l.status === 'contacted').length, color: 'text-blue-400' },
          { label: 'Converted', count: leads.filter((l) => l.status === 'converted').length, color: 'text-green-400' },
          { label: 'Total', count: leads.length, color: 'text-white' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {leads.map((lead) => (
          <div key={String(lead._id)} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-semibold text-white">{String(lead.name || 'Anonymous')}</p>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[String(lead.status)] || 'bg-gray-500/20 text-gray-400'}`}>
                    {String(lead.status || 'new')}
                  </span>
                </div>
                {!!lead.email && (
                  <p className="text-sm text-brand-400 mb-2">
                    <a href={`mailto:${String(lead.email)}`} className="hover:underline">{String(lead.email)}</a>
                  </p>
                )}
                {!!lead.summary && (
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{String(lead.summary)}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(String(lead.createdAt)).toLocaleString()} · via {String(lead.source || 'chatbot')}
                </p>
              </div>
              {lead.status === 'new' && (
                <form action={markContacted}>
                  <input type="hidden" name="id" value={String(lead._id)} />
                  <button type="submit" className="shrink-0 rounded-full border border-brand-500/50 px-3 py-1.5 text-xs font-medium text-brand-400 hover:bg-brand-500 hover:text-white transition-all">
                    Mark Contacted
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
        {leads.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-800 bg-gray-900/50 p-12 text-center">
            <p className="text-5xl mb-4">💬</p>
            <p className="text-sm font-semibold text-white mb-1">No chat leads yet</p>
            <p className="text-xs text-gray-400">Leads from your website chatbot will appear here.</p>
          </div>
        )}
      </div>
    </>
  )
}
