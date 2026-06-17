import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InvoicesClient from './InvoicesClient'

export default async function ClientInvoicesPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/sign-in')

  const { data: invoices } = await supabase
    .from('invoices')
    .select(`*, projects(title)`)
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return <InvoicesClient invoices={invoices || []} />
}
