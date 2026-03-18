import Link from 'next/link'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

export default async function AdminClientsPage() {
  await connectDB()
  const clients = await User.find({ role: 'client' })
    .sort({ createdAt: -1 })
    .lean() as Array<Record<string, unknown>>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Clients</h1>
        <span className="text-sm text-gray-400">{clients.length} total</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase pb-3">Name</th>
              <th className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase pb-3">Email</th>
              <th className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase pb-3">Company</th>
              <th className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase pb-3">Joined</th>
              <th className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No clients found.
                </td>
              </tr>
            )}
            {clients.map((client) => {
              const id = String(client._id)
              const name = [client.firstName, client.lastName].filter(Boolean).join(' ') || '—'
              return (
                <tr key={id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">{name}</td>
                  <td className="py-3 text-sm text-gray-700 dark:text-gray-300">{String(client.email || '—')}</td>
                  <td className="py-3 text-sm text-gray-700 dark:text-gray-300">{String(client.company || '—')}</td>
                  <td className="py-3 text-sm text-gray-500 dark:text-gray-400">
                    {client.createdAt ? new Date(client.createdAt as string).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 text-sm">
                    <Link href={`/admin/clients/${id}`} className="text-purple-400 hover:text-purple-300 font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
