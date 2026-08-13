"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { WorkspaceHeader } from "@/components/layout/workspace-header";
import { PlatformShellProvider } from "@/components/layout/platform-shell-context";
import { getBreadcrumbs, getWorkspaceByPath } from "@/lib/workspace";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  footer?: React.ReactNode;
};

function AppShellFrame({ children, rightPanel, footer }: AppShellProps) {
  const pathname = usePathname();
  const workspace = getWorkspaceByPath(pathname);
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#platform-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>

      <div className="flex min-h-dvh">
        <AppSidebar />

        <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
          <AppTopbar
            title={workspace.title}
            description={workspace.description}
            breadcrumbs={breadcrumbs}
          />

          <div className="flex min-h-0 flex-1">
            <main id="platform-main" className="min-w-0 flex-1 px-4 pb-6 pt-4 sm:px-6 lg:px-8">
              <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                <WorkspaceHeader workspace={workspace} />
                {children}
                {footer ? (
                  <div className="pt-2 text-sm text-muted-foreground">{footer}</div>
                ) : null}
              </div>
            </main>

            {rightPanel ? (
              <aside
                className={cn(
                  "hidden w-[320px] shrink-0 border-l border-border/60 bg-muted/20 xl:block"
                )}
                aria-label="Workspace context"
              >
                <div className="sticky top-16 h-[calc(100dvh-4rem)] overflow-y-auto p-6">
                  {rightPanel}
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <PlatformShellProvider>
      <AppShellFrame {...props} />
    </PlatformShellProvider>
  );
}
