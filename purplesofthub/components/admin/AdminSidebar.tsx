"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Globe, PanelLeftClose } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  adminNavigationSections,
  isAdminNavItemActive,
  type AdminNavItem,
} from "@/lib/admin-navigation";
import { cn } from "@/lib/utils";
import { useAdminShell } from "@/components/admin/admin-shell-context";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

const BRAND_LOGO = "/images/logo/purplesoft-logo-main.png";

export function AdminSidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        "cc-hairline-bottom flex shrink-0 items-center",
        collapsed ? "justify-center px-2 py-3" : "gap-2.5 px-4 py-3.5"
      )}
    >
      <Link
        href="/admin"
        aria-label="PurpleSoftHub admin dashboard"
        className={cn(
          "flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-accent)] focus-visible:ring-offset-2",
          collapsed && "justify-center"
        )}
      >
        <Image
          src={BRAND_LOGO}
          alt="PurpleSoftHub"
          width={collapsed ? 36 : 118}
          height={collapsed ? 36 : 34}
          className={cn(
            "object-contain",
            collapsed ? "h-9 w-9 rounded-xl" : "h-7 w-auto"
          )}
          priority
        />
        {!collapsed ? (
          <span className="rounded-md bg-[var(--cc-subtle)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--cc-text-muted)]">
            Command Center
          </span>
        ) : null}
      </Link>
    </div>
  );
}

function AdminSidebarLink({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: AdminNavItem;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const active = isAdminNavItemActive(pathname, item);

  const row = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.title : undefined}
      title={collapsed ? item.title : undefined}
      data-active={active}
      className={cn("cc-nav-item", collapsed && "justify-center px-0")}
    >
      <item.icon className="cc-nav-icon h-4 w-4 shrink-0" aria-hidden="true" />

      {!collapsed ? <span className="truncate">{item.title}</span> : null}

      {!collapsed && item.badge ? (
        <span className="cc-tnum ml-auto rounded-full bg-[var(--cc-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--cc-text-muted)]">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );

  if (!collapsed) return row;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{row}</TooltipTrigger>
      <TooltipContent side="right">{item.title}</TooltipContent>
    </Tooltip>
  );
}

export function AdminSidebarNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname() ?? "";
  const { setCollapsed } = useAdminShell();

  return (
    <TooltipProvider delayDuration={120}>
      <nav
        aria-label="Admin sections"
        className={cn(
          "admin-sidebar-scroll cc-scroll min-h-0 flex-1 space-y-5 overflow-y-auto py-4",
          collapsed ? "px-2" : "px-3"
        )}
      >
        {adminNavigationSections.map((section) => (
          <div key={section.id}>
            {collapsed ? (
              <div className="mx-auto my-2 h-px w-6 bg-[var(--cc-border)]" aria-hidden="true" />
            ) : (
              <p className="px-2.5 pb-1.5 text-[11px] font-medium tracking-wide text-[var(--cc-text-muted)]">
                {section.title}
              </p>
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => (
                <AdminSidebarLink
                  key={item.id}
                  item={item}
                  pathname={pathname}
                  collapsed={collapsed}
                  onNavigate={collapsed ? () => setCollapsed(false) : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </TooltipProvider>
  );
}

export function AdminSidebarFooter({ collapsed = false }: { collapsed?: boolean }) {
  const { toggleCollapsed } = useAdminShell();

  return (
    <div
      className={cn(
        "cc-hairline-top flex shrink-0 flex-col gap-0.5 p-2.5",
        collapsed && "px-2"
      )}
    >
      {!collapsed ? (
        <Link href="/" className="cc-nav-item text-xs">
          <Globe className="cc-nav-icon h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          View website
        </Link>
      ) : null}

      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={collapsed}
        className={cn("cc-nav-item text-xs", collapsed && "justify-center px-0")}
      >
        <PanelLeftClose
          className={cn("h-4 w-4 shrink-0 transition-transform", collapsed && "rotate-180")}
          aria-hidden="true"
        />
        {!collapsed ? "Collapse" : null}
      </button>
    </div>
  );
}

export function AdminSidebarContent({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--cc-surface)]">
      <AdminSidebarBrand collapsed={collapsed} />
      <AdminSidebarNav collapsed={collapsed} />
      <AdminSidebarFooter collapsed={collapsed} />
    </div>
  );
}

export default function AdminSidebar() {
  const { isCollapsed } = useAdminShell();

  return (
    <>
      <aside
        aria-label="Admin sidebar"
        className={cn(
          "hidden h-full shrink-0 border-r border-[var(--cc-border)] bg-[var(--cc-surface)] transition-[width] duration-200 ease-out lg:block",
          isCollapsed ? "w-[72px]" : "w-[248px]"
        )}
      >
        <AdminSidebarContent collapsed={isCollapsed} />
      </aside>

      <AdminMobileNav>
        <AdminSidebarContent collapsed={false} />
      </AdminMobileNav>
    </>
  );
}
