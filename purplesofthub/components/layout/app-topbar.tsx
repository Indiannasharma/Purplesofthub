"use client";

import { Menu, PanelLeft, PanelLeftClose } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/workspace/theme-toggle";
import { NotificationMenu } from "@/components/notifications/notification-menu";
import { UserMenu } from "@/components/user/user-menu";
import { CommandSearch } from "@/components/search/command-search";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { QuickActions } from "@/components/workspace/quick-actions";
import { usePlatformShell } from "@/components/layout/platform-shell-context";
import type { BreadcrumbItem } from "@/lib/workspace";

type AppTopbarProps = {
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
};

export function AppTopbar({ title, description, breadcrumbs }: AppTopbarProps) {
  const { isCollapsed, toggleCollapsed, setMobileNavOpen } = usePlatformShell();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 md:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden h-10 w-10 md:inline-flex"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={isCollapsed}
            onClick={toggleCollapsed}
          >
            {isCollapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>

          <div className="min-w-0">
            <div className="hidden sm:block">
              <Breadcrumbs items={breadcrumbs} />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
                {title}
              </h1>
              <Badge variant="outline" className="hidden rounded-full sm:inline-flex">
                Platform Shell
              </Badge>
            </div>
            <p className="sr-only">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CommandSearch />

          <div className="hidden lg:block">
            <QuickActions />
          </div>
          <NotificationMenu />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
