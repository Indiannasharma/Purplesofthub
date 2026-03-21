import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayoutClient from './layout-client'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect('/sign-in')

  const role =
    session.user.user_metadata?.role ||
    session.user.app_metadata?.role ||
    'client'

  if (role !== 'admin') redirect('/dashboard')

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
