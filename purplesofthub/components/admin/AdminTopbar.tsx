"use client";

import { Menu, PanelLeft, PanelLeftClose } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ThemeToggle } from "@/components/workspace/theme-toggle";
import NotificationBell from "@/components/admin/NotificationBell";
import { AdminSearchTrigger } from "@/components/admin/AdminSearch";
import { AdminUserMenu, type AdminShellProfile } from "@/components/admin/AdminUserMenu";
import { useAdminShell } from "@/components/admin/admin-shell-context";
import { getAdminBreadcrumbs } from "@/lib/admin-navigation";

/**
 * Shared admin topbar: navigation triggers, page context, search,
 * theme, notifications and the account menu.
 */
export function AdminTopbar({ profile }: { profile: AdminShellProfile }) {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed, setMobileNavOpen, isMobileNavOpen } = useAdminShell();
  const breadcrumbs = getAdminBreadcrumbs(pathname);

  return (
    <header className="z-30 flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/85 px-4 py-2.5 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 lg:hidden"
          aria-label="Open admin navigation"
          aria-expanded={isMobileNavOpen}
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden h-10 w-10 lg:inline-flex"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={isCollapsed}
          onClick={toggleCollapsed}
        >
          {isCollapsed ? (
            <PanelLeft className="h-5 w-5" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>

        <div className="hidden min-w-0 sm:block">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <AdminSearchTrigger />
        <ThemeToggle />
        <NotificationBell adminId={profile.userId} />
        <AdminUserMenu profile={profile} />
      </div>
    </header>
  );
}

export default AdminTopbar;