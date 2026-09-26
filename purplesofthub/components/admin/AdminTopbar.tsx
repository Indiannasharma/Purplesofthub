"use client";

import { Menu, PanelLeft, PanelLeftClose } from "lucide-react";
import { usePathname } from "next/navigation";

import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { AdminThemeToggle } from "@/components/admin/AdminThemeToggle";
import NotificationBell from "@/components/admin/NotificationBell";
import { AdminSearchTrigger } from "@/components/admin/AdminSearch";
import { AdminUserMenu, type AdminShellProfile } from "@/components/admin/AdminUserMenu";
import { useAdminShell } from "@/components/admin/admin-shell-context";
import { getAdminBreadcrumbs } from "@/lib/admin-navigation";

/**
 * Shared admin topbar — Command Center presentation.
 *
 * Navigation triggers, page context, search, theme, notifications and the
 * account menu. Every control here is the same one the previous admin topbar
 * exposed; only its presentation and the theme control (single light/dark
 * toggle, matching the approved Command Center design) changed.
 */
export function AdminTopbar({ profile }: { profile: AdminShellProfile }) {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed, setMobileNavOpen, isMobileNavOpen } = useAdminShell();
  const breadcrumbs = getAdminBreadcrumbs(pathname);

  return (
    <header className="cc-hairline-bottom z-30 h-12 shrink-0 bg-[var(--cc-surface)]">
      <div className="mx-auto flex h-12 w-full max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            className="cc-icon-btn cc-icon-btn-sm lg:hidden"
            aria-label="Open admin navigation"
            aria-expanded={isMobileNavOpen}
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="cc-icon-btn cc-icon-btn-sm hidden lg:inline-flex"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={isCollapsed}
            onClick={toggleCollapsed}
          >
            {isCollapsed ? (
              <PanelLeft className="h-[18px] w-[18px]" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-[18px] w-[18px]" aria-hidden="true" />
            )}
          </button>

          <div className="hidden min-w-0 sm:block">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <AdminSearchTrigger />
          <AdminThemeToggle />
          <NotificationBell adminId={profile.userId} />
          <span
            className="mx-1.5 hidden h-5 w-px bg-[var(--cc-border)] sm:block"
            aria-hidden="true"
          />
          <AdminUserMenu profile={profile} />
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;
