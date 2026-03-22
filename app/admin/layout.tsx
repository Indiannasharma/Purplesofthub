import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayoutClient from './layout-client'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/sign-in')

  const role =
    user.user_metadata?.role ||
    user.app_metadata?.role

  if (role !== 'admin') redirect('/dashboard')

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
