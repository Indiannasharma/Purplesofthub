import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientServicesGrid from '@/src/components/Client/ServicesGrid'

export default async function ClientServicesPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/sign-in')

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('order')

  const { data: existingOrders } = await supabase
    .from('projects')
    .select('id, title, status')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-black dark:text-white">Our Services</h2>
        <p className="text-sm text-bodydark2 mt-1">Choose a service to get started</p>
      </div>
      <ClientServicesGrid
        services={services || []}
        userId={user.id}
        existingProjects={existingOrders || []}
      />
    </>
  )
}
