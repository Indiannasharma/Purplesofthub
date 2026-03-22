import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminClientsTable from '@/src/components/tables/AdminClientsTable'

export default async function AdminClientsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/sign-in')

  const role = session.user.user_metadata?.role || session.user.app_metadata?.role
  if (role !== 'admin') redirect('/dashboard')

  const { data: clients } = await supabase
    .from('profiles')
    .select(`
      *,
      projects:projects(count),
      invoices:invoices(count)
    `)
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">Clients</h2>
          <p className="text-sm text-bodydark2 mt-1">{clients?.length || 0} total clients</p>
        </div>
      </div>

      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="p-6">
          <AdminClientsTable clients={clients || []} />
        </div>
      </div>
    </>
  )
}
