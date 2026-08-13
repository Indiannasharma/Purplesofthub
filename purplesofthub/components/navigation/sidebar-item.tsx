"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { isNavigationItemActive, type NavigationItem } from "@/lib/navigation";
import { usePlatformShell } from "@/components/layout/platform-shell-context";

type SidebarItemProps = {
  item: NavigationItem;
  pathname: string;
  collapsed?: boolean;
};

function NavRow({
  item,
  active,
  collapsed,
  hasChildren,
  expanded,
}: {
  item: NavigationItem;
  active: boolean;
  collapsed: boolean;
  hasChildren?: boolean;
  expanded?: boolean;
}) {
  return (
    <span
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        collapsed && "justify-center px-0",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {!collapsed ? <span className="truncate">{item.title}</span> : null}
      {!collapsed && item.badge ? (
        <Badge variant="secondary" className="ml-auto rounded-full px-2 py-0 text-[10px]">
          {item.badge}
        </Badge>
      ) : null}
      {!collapsed && hasChildren ? (
        <ChevronRight
          className={cn(
            "ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-90",
            item.badge && "ml-1"
          )}
          aria-hidden="true"
        />
      ) : null}
    </span>
  );
}

export function SidebarItem({
  item,
  pathname,
  collapsed = false,
}: SidebarItemProps) {
  const { openSubmenuId, toggleSubmenu, setOpenSubmenuId, setCollapsed } =
    usePlatformShell();
  const active = isNavigationItemActive(pathname, item);
  const childActive =
    item.children?.some((child) => isNavigationItemActive(pathname, child)) ?? false;
  const expanded = openSubmenuId === item.id || childActive;

  React.useEffect(() => {
    if (childActive) {
      setOpenSubmenuId(item.id);
    }
  }, [childActive, item.id, setOpenSubmenuId]);

  const wrapped = (node: React.ReactNode) => {
    if (!collapsed) return node;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{node}</TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  };

  if (item.children?.length) {
    return (
      <Collapsible
        open={!collapsed && expanded}
        onOpenChange={() => {
          if (collapsed) {
            setCollapsed(false);
            setOpenSubmenuId(item.id);
            return;
          }

          toggleSubmenu(item.id);
        }}
      >
        {wrapped(
          <CollapsibleTrigger
            className="w-full"
            aria-current={active ? "page" : undefined}
            aria-expanded={!collapsed && expanded}
          >
            <NavRow
              item={item}
              active={active}
              collapsed={collapsed}
              hasChildren
              expanded={!collapsed && expanded}
            />
          </CollapsibleTrigger>
        )}

        <CollapsibleContent className="mt-1 space-y-1 pl-6">
          {item.children.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              pathname={pathname}
              collapsed={false}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return wrapped(
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.title : undefined}
    >
      <NavRow item={item} active={active} collapsed={collapsed} />
    </Link>
  );
}
