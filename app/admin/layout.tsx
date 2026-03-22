import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppHeader from '@/layout/AppHeader'
import AppSidebar from '@/layout/AppSidebar'
import Backdrop from '@/layout/Backdrop'

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
    session.user.app_metadata?.role

  if (role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div className="flex-1 transition-all duration-300 ease-in-out lg:ml-[290px]">
        <AppHeader />
        <div className="p-4 mx-auto max-w-screen-2xl md:p-6 2xl:p-10">
          {children}
        </div>
      </div>
    </div>
  )
}
