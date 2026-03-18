export const dynamic = 'force-dynamic'

import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Project from '@/lib/models/Project'
import Invoice from '@/lib/models/Invoice'
import Link from 'next/link'
import mongoose from 'mongoose'

async function getClients() {
  await connectDB()
  const clients = await User.find({ role: 'client' }).sort({ createdAt: -1 }).lean() as Array<Record<string, unknown>>
  const ids = clients.map((c) => c._id as mongoose.Types.ObjectId)
  const [projectCounts, invoiceCounts] = await Promise.all([
    Project.aggregate([{ $match: { client: { $in: ids } } }, { $group: { _id: '$client', count: { $sum: 1 } } }]),
    Invoice.aggregate([{ $match: { client: { $in: ids } } }, { $group: { _id: '$client', count: { $sum: 1 } } }]),
  ])
  const pMap = Object.fromEntries(projectCounts.map((p) => [String(p._id), p.count]))
  const iMap = Object.fromEntries(invoiceCounts.map((i) => [String(i._id), i.count]))
  return clients.map((c) => ({ ...(c as Record<string, unknown>), projectCount: pMap[String((c as Record<string, unknown>)._id)] ?? 0, invoiceCount: iMap[String((c as Record<string, unknown>)._id)] ?? 0 })) as Array<Record<string, unknown>>
}

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Clients</h2>
          <p className="text-sm text-gray-400 mt-0.5">{clients.length} registered client{clients.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <h5 className="text-sm font-semibold text-white">All Clients</h5>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Projects</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Invoices</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={String(client._id)} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                    {String(client.firstName || '')} {String(client.lastName || '')}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{String(client.email || '')}</td>
                  <td className="px-6 py-4 text-gray-400">{String(client.company || '—')}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-medium text-brand-400">
                      {client.projectCount as number}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center rounded-full bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                      {client.invoiceCount as number}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                    {new Date(String(client.createdAt)).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${client.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {client.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/clients/${String(client._id)}`} className="text-xs text-brand-400 hover:underline">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No clients yet.
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
