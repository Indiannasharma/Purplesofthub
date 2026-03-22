'use client'

import ClientSidebar from '@/components/client/ClientSidebar'
import ClientHeader from '@/components/client/ClientHeader'
import { SidebarProvider } from '@/context/SidebarContext'

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-900">
        <ClientSidebar />
        <div className="flex flex-1 flex-col lg:ml-[90px]">
          <ClientHeader />
          <main className="flex-1 overflow-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
