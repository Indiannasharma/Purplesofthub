import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardLayoutClient from './layout-client'
import { customerName } from '@/lib/customer-overview'
import '@/app/styles/command-center.css'
import '@/app/styles/customer-workspace.css'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) redirect('/sign-in')

  return <DashboardLayoutClient identity={{ id: user.id, name: customerName(user.user_metadata?.full_name) || customerName(user.user_metadata?.name), email: user.email || '' }}>{children}</DashboardLayoutClient>
}
