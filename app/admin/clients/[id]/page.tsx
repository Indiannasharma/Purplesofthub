export const dynamic = 'force-dynamic'

import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Project from '@/lib/models/Project'
import Invoice from '@/lib/models/Invoice'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const STATUS_COLORS: Record<string, string> = {
  planning:    'bg-blue-500/20 text-blue-400',
  design:      'bg-yellow-500/20 text-yellow-400',
  development: 'bg-brand-500/20 text-brand-400',
  review:      'bg-orange-500/20 text-orange-400',
  completed:   'bg-green-500/20 text-green-400',
  'on-hold':   'bg-gray-500/20 text-gray-400',
}

const INV_COLORS: Record<string, string> = {
  draft:     'bg-gray-500/20 text-gray-400',
  sent:      'bg-blue-500/20 text-blue-400',
  paid:      'bg-green-500/20 text-green-400',
  overdue:   'bg-red-500/20 text-red-400',
  cancelled: 'bg-gray-500/20 text-gray-400',
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()

  const client = await User.findById(id).lean() as Record<string, unknown> | null
  if (!client || client.role !== 'client') notFound()

  const [projects, invoices] = await Promise.all([
    Project.find({ client: client._id }).sort({ updatedAt: -1 }).lean() as Promise<Array<Record<string, unknown>>>,
    Invoice.find({ client: client._id }).sort({ createdAt: -1 }).lean() as Promise<Array<Record<string, unknown>>>,
  ])

  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.total ?? 0), 0)

  return (
    <>
      {/* Back + header */}
      <div className="mb-6">
        <Link href="/admin/clients" className="text-xs text-gray-400 hover:text-brand-400 mb-3 inline-block">
          ← Back to Clients
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {String(client.firstName || '')} {String(client.lastName || '')}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">{String(client.email)}</p>
          </div>
          <span className={`mt-1 rounded-full px-3 py-1 text-xs font-medium ${client.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
            {client.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Info cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Projects', value: projects.length, icon: '📦' },
          { label: 'Active Projects', value: projects.filter((p) => p.status !== 'completed').length, icon: '⚡' },
          { label: 'Invoices', value: invoices.length, icon: '🧾' },
          { label: 'Total Paid', value: `₦${totalPaid.toLocaleString()}`, icon: '💰' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <div className="mb-2 text-xl">{s.icon}</div>
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Profile info */}
      <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h5 className="mb-4 text-sm font-semibold text-white">Profile Details</h5>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { label: 'Company', value: client.company },
            { label: 'Phone', value: client.phone },
            { label: 'Country', value: client.country },
            { label: 'Member Since', value: new Date(String(client.createdAt)).toLocaleDateString() },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{f.label}</p>
              <p className="mt-0.5 text-sm text-gray-300">{String(f.value || '—')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <h5 className="text-sm font-semibold text-white">Projects ({projects.length})</h5>
          <Link href="/admin/projects/new" className="text-xs text-brand-400 hover:underline">+ New</Link>
        </div>
        {projects.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">No projects for this client.</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {projects.map((p) => (
              <div key={String(p._id)} className="flex items-center justify-between px-6 py-4 hover:bg-gray-800/40">
                <div>
                  <p className="text-sm font-medium text-white">{String(p.title)}</p>
                  <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[String(p.status)] || 'bg-gray-500/20 text-gray-400'}`}>
                    {String(p.status)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24">
                    <div className="mb-0.5 text-right text-xs text-gray-400">{Number(p.progress ?? 0)}%</div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${Number(p.progress ?? 0)}%` }} />
                    </div>
                  </div>
                  <Link href={`/admin/projects/${String(p._id)}`} className="text-xs text-brand-400 hover:underline">View →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <h5 className="text-sm font-semibold text-white">Invoices ({invoices.length})</h5>
          <Link href="/admin/invoices/new" className="text-xs text-brand-400 hover:underline">+ New</Link>
        </div>
        {invoices.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">No invoices for this client.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Due</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={String(inv._id)} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-6 py-3 font-mono text-xs text-brand-400">{String(inv.invoiceNumber)}</td>
                    <td className="px-6 py-3 font-medium text-white">{String(inv.currency === 'USD' ? '$' : '₦')}{Number(inv.total ?? 0).toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${INV_COLORS[String(inv.status)] || 'bg-gray-500/20 text-gray-400'}`}>
                        {String(inv.status)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400">{inv.dueDate ? new Date(String(inv.dueDate)).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-3">
                      <Link href={`/admin/invoices/${String(inv._id)}`} className="text-xs text-brand-400 hover:underline">View →</Link>
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
