import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SidebarProvider } from '@/src/context/SidebarContext'
import ClientSidebar from '@/src/components/client/ClientSidebar'
import ClientHeader from '@/src/components/client/ClientHeader'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) redirect('/sign-in')

  return (
    <SidebarProvider>
      <div className="min-h-screen xl:flex bg-gray-950 text-white">
        <ClientSidebar />
        <div className="flex-1 transition-all duration-300 ease-in-out lg:ml-[290px]">
          <ClientHeader />
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
