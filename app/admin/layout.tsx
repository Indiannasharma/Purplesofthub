import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SidebarProvider } from '@/src/context/SidebarContext'
import AdminSidebar from '@/src/components/admin/AdminSidebar'
import AdminHeader from '@/src/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, sessionClaims } = await auth()

  if (!userId) redirect('/sign-in')

  const claims = sessionClaims as Record<string, unknown> & {
    publicMetadata?: { role?: string }
    metadata?: { role?: string }
  }
  const role =
    claims?.publicMetadata?.role ||
    claims?.metadata?.role

  if (role !== 'admin') redirect('/dashboard')

  return (
    <SidebarProvider>
      <div className="min-h-screen xl:flex bg-gray-950 text-white">
        <AdminSidebar />
        <div className="flex-1 transition-all duration-300 ease-in-out lg:ml-[290px]">
          <AdminHeader />
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
