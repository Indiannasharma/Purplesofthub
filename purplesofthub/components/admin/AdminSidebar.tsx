"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";

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
        "flex shrink-0 items-center border-b border-border/70",
        collapsed ? "justify-center px-3 py-3" : "px-4 py-4"
      )}
    >
      <Link
        href="/admin"
        aria-label="PurpleSoftHub admin dashboard"
        className={cn(
          "flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          collapsed && "justify-center"
        )}
      >
        {collapsed ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10">
            <Image
              src={BRAND_LOGO}
              alt=""
              width={26}
              height={26}
              className="h-6 w-6 object-contain"
              priority
            />
          </span>
        ) : (
          <span className="flex min-w-0 items-center gap-3">
            <Image
              src={BRAND_LOGO}
              alt="PurpleSoftHub"
              width={118}
              height={34}
              className="h-7 w-auto object-contain"
              priority
            />
            <span className="h-7 w-px bg-border" aria-hidden="true" />
            <span className="max-w-16 text-[9px] font-semibold uppercase leading-3 tracking-[0.14em] text-muted-foreground">
              Admin workspace
            </span>
          </span>
        )}
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
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-lg text-[13px] font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        collapsed ? "justify-center px-0 py-2" : "px-3 py-2",
        active
          ? "bg-primary/[0.08] text-foreground"
          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      )}
    >
      {active ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary"
        />
      ) : null}

      <item.icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} aria-hidden="true" />

      {!collapsed ? <span className="truncate">{item.title}</span> : null}

      {!collapsed && item.badge ? (
        <span className="ml-auto rounded-full border border-border/60 bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
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
          "admin-sidebar-scroll min-h-0 flex-1 space-y-4 overflow-y-auto py-4",
          collapsed ? "px-2" : "px-3"
        )}
      >
        {adminNavigationSections.map((section) => (
          <div key={section.id} className="space-y-1">
            {collapsed ? (
              <div className="mx-auto h-px w-6 bg-border/80" aria-hidden="true" />
            ) : (
              <p className="px-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
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
  if (collapsed) return null;

  return (
    <div className="shrink-0 border-t border-border/70 p-2.5">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Globe className="h-3.5 w-3.5" aria-hidden="true" />
        View website
      </Link>
    </div>
  );
}

export function AdminSidebarContent({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
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
          "hidden h-full shrink-0 border-r border-border/70 bg-card transition-[width] duration-200 ease-out lg:block",
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
