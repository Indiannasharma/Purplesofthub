import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminInvoicesTable from '@/src/components/tables/AdminInvoicesTable'

export default async function AdminInvoicesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/sign-in')

  const role = session.user.user_metadata?.role || session.user.app_metadata?.role
  if (role !== 'admin') redirect('/dashboard')

  const { data: invoices } = await supabase
    .from('invoices')
    .select(`
      *,
      profiles:client_id(
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  const totalPaid = (invoices || [])
    .filter(i => i.status === 'paid')
    .reduce((s, i) => s + (i.amount || 0), 0)

  const totalPending = (invoices || [])
    .filter(i => i.status === 'pending')
    .reduce((s, i) => s + (i.amount || 0), 0)

  return (
    <>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">Invoices</h2>
          <p className="text-sm text-bodydark2 mt-1">{invoices?.length || 0} total</p>
        </div>
        <a
          href="/admin/invoices/new"
          className="px-4 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all"
        >
          + New Invoice
        </a>
      </div>

      {/* Invoice summary cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        {[
          {
            label: 'Total Paid',
            value: `₦${totalPaid.toLocaleString()}`,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
          },
          {
            label: 'Total Pending',
            value: `₦${totalPending.toLocaleString()}`,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10'
          },
          {
            label: 'Total Invoices',
            value: invoices?.length || 0,
            color: 'text-brand-500',
            bg: 'bg-brand-500/10'
          },
        ].map(card => (
          <div key={card.label} className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
            <p className={`text-2xl font-bold ${card.color} mb-1`}>{card.value}</p>
            <p className="text-sm text-bodydark2">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark p-6">
        <AdminInvoicesTable invoices={invoices || []} />
      </div>
    </>
  )
}
