"use client";

import { cn } from "@/lib/utils";
import type { NavigationSection } from "@/lib/navigation";
import { SidebarItem } from "@/components/navigation/sidebar-item";

type SidebarNavProps = {
  pathname: string;
  sections: NavigationSection[];
  collapsed?: boolean;
};

export function SidebarNav({
  pathname,
  sections,
  collapsed = false,
}: SidebarNavProps) {
  return (
    <nav aria-label="Platform modules" className="space-y-6">
      {sections.map((section) => (
        <div key={section.id} className="space-y-2">
          <div className={cn("px-3", collapsed && "px-0 text-center")}>
            <p
              className={cn(
                "text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground",
                collapsed && "sr-only"
              )}
            >
              {section.title}
            </p>
            {collapsed ? (
              <div
                className="mx-auto h-px w-6 bg-border/80"
                aria-hidden="true"
              />
            ) : null}
          </div>
          <div className="space-y-1">
            {section.items.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
