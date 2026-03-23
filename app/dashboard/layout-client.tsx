'use client'

import AppSidebar from '@/layout/AppSidebar'
import AppHeader from '@/layout/AppHeader'
import Backdrop from '@/layout/Backdrop'
import { SidebarProvider, useSidebar } from '@/context/SidebarContext'

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar()

  const mainContentMargin = isMobileOpen
    ? 'ml-0'
    : isExpanded || isHovered
    ? 'lg:ml-[290px]'
    : 'lg:ml-[90px]'

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />
        <div className="p-4 mx-auto max-w-[1408px] md:p-6">{children}</div>
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
