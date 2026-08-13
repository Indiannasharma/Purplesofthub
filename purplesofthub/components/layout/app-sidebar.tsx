"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getVisibleNavigation } from "@/lib/navigation";
import { previewPlatformRole, roleLabels } from "@/lib/roles";
import { SidebarNav } from "@/components/navigation/sidebar-nav";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { usePlatformShell } from "@/components/layout/platform-shell-context";
import { cn } from "@/lib/utils";

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn("border-b border-border/60", collapsed ? "px-3 py-4" : "px-5 py-4")}>
      <Link
        href="/platform/dashboard"
        className={cn(
          "flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          collapsed && "justify-center"
        )}
        aria-label="PurpleSoftHub dashboard"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Image
            src="/images/logo/purplesoft-logo-main.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
          />
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-none">PurpleSoftHub</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">Platform Shell</p>
          </div>
        ) : null}
      </Link>
    </div>
  );
}

function SidebarWorkspace({ collapsed }: { collapsed: boolean }) {
  if (collapsed) return null;

  return (
    <div className="border-b border-border/60 px-5 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Workspace
      </p>
      <p className="mt-1 truncate text-sm font-medium">
        {roleLabels[previewPlatformRole]} preview
      </p>
    </div>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="border-t border-border/60 p-3">
        <Avatar className="mx-auto h-9 w-9">
          <AvatarImage src="/images/logo/purplesoft-logo-main.png" alt="" />
          <AvatarFallback>PS</AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="border-t border-border/60 p-4">
      <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/images/logo/purplesoft-logo-main.png" alt="" />
          <AvatarFallback>PS</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">PurpleSoftHub</p>
          <p className="truncate text-xs text-muted-foreground">Shared authenticated shell</p>
        </div>
        <Badge variant="secondary" className="rounded-full">
          Live
        </Badge>
      </div>
    </div>
  );
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const visibleNavigation = getVisibleNavigation(previewPlatformRole);

  return (
    <div className="flex h-full flex-col bg-background">
      <SidebarBrand collapsed={collapsed} />
      <SidebarWorkspace collapsed={collapsed} />
      <div className={cn("flex-1 overflow-y-auto py-4", collapsed ? "px-2" : "px-3")}>
        <TooltipProvider delayDuration={100}>
          <SidebarNav
            pathname={pathname}
            sections={visibleNavigation}
            collapsed={collapsed}
          />
        </TooltipProvider>
      </div>
      <SidebarFooter collapsed={collapsed} />
    </div>
  );
}

export function AppSidebar() {
  const { isCollapsed } = usePlatformShell();

  return (
    <>
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 border-r border-border/60 bg-background transition-[width] duration-200 md:block",
          isCollapsed ? "w-[76px]" : "w-[288px]"
        )}
        aria-label="Platform sidebar"
      >
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      <MobileNavigation>
        <SidebarContent collapsed={false} />
      </MobileNavigation>
    </>
  );
}
