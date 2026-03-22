'use client'

import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { SidebarProvider } from '@/context/SidebarContext'

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-900">
        <AdminSidebar />
        <div className="flex flex-1 flex-col lg:ml-[90px]">
          <AdminHeader />
          <main className="flex-1 overflow-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
