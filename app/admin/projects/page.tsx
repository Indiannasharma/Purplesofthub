import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminProjectsTable from '@/src/components/tables/AdminProjectsTable'

export default async function AdminProjectsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/sign-in')

  const role = session.user.user_metadata?.role || session.user.app_metadata?.role
  if (role !== 'admin') redirect('/dashboard')

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      profiles:client_id(
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">Projects</h2>
          <p className="text-sm text-bodydark2 mt-1">{projects?.length || 0} total</p>
        </div>
        <a
          href="/admin/projects/new"
          className="px-4 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all"
        >
          + New Project
        </a>
      </div>
      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark p-6">
        <AdminProjectsTable projects={projects || []} />
      </div>
    </>
  )
}
