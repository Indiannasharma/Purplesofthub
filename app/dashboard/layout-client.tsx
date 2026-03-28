'use client'

import AppSidebar from '@/layout/AppSidebar'
import AppHeader from '@/layout/AppHeader'
import Backdrop from '@/layout/Backdrop'
import { SidebarProvider, useSidebar } from '@/context/SidebarContext'

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AppSidebar />

      {/* Backdrop for mobile */}
      <Backdrop />

      {/* Main content area */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden min-w-0 w-full">
        <AppHeader />
        <main className="mx-auto max-w-[1408px] w-full p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  )
}
