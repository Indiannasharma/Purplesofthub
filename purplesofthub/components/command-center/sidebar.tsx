"use client";

import Link from "next/link";
import { Globe, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { CC_NAV_SECTIONS, type CcNavSection } from "./nav-config";

/** Command Center sidebar — Phase 1 design preview. */

function NavSection({
  section,
  collapsed,
  onNavigate,
}: {
  section: CcNavSection;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div>
      {collapsed ? (
        <div aria-hidden="true" className="mx-auto my-2 h-px w-6 bg-[var(--cc-border)]" />
      ) : (
        <p className="px-2.5 pb-1.5 text-[11px] font-medium tracking-wide text-[var(--cc-text-muted)]">
          {section.title}
        </p>
      )}
      <div className="space-y-0.5">
        {section.items.map((item) => {
          const active = item.id === "dashboard";
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              aria-label={collapsed ? item.title : undefined}
              title={collapsed ? item.title : undefined}
              data-active={active}
              className={cn("cc-nav-item", collapsed && "justify-center px-0")}
            >
              <item.icon className="cc-nav-icon h-4 w-4 shrink-0" aria-hidden="true" />
              {!collapsed && <span className="truncate">{item.title}</span>}
              {!collapsed && item.badge && (
                <span className="cc-tnum ml-auto rounded-full bg-[var(--cc-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--cc-text-muted)]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function CcSidebar({
  collapsed,
  onCollapse,
  onNavigate,
}: {
  collapsed: boolean;
  onCollapse: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--cc-surface)]">
      <div
        className={cn(
          "cc-hairline-bottom flex shrink-0 items-center",
          collapsed ? "justify-center px-2 py-3" : "gap-2.5 px-4 py-3.5"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={collapsed ? "/android-chrome-192x192.png" : "/Purplesoft-logo-main.png"}
          alt="PurpleSoftHub"
          className={cn("object-contain", collapsed ? "h-9 w-9 rounded-xl" : "h-8 w-auto")}
        />
        {!collapsed && (
          <span className="rounded-md bg-[var(--cc-subtle)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--cc-text-muted)]">
            Command Center
          </span>
        )}
      </div>

      <nav
        aria-label="Command Center sections"
        className={cn(
          "cc-scroll min-h-0 flex-1 space-y-5 overflow-y-auto py-4",
          collapsed ? "px-2" : "px-3"
        )}
      >
        {CC_NAV_SECTIONS.map((section) => (
          <NavSection
            key={section.id}
            section={section}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className={cn("cc-hairline-top shrink-0 space-y-1 p-2.5", collapsed && "px-2")}>
        {!collapsed && (
          <Link href="/" className="cc-nav-item text-xs">
            <Globe className="cc-nav-icon h-3.5 w-3.5" aria-hidden="true" />
            View website
          </Link>
        )}
        <button
          type="button"
          onClick={onCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn("cc-nav-item text-xs", collapsed && "justify-center px-0")}
        >
          <PanelLeftClose
            className={cn("h-4 w-4 shrink-0 transition-transform", collapsed && "rotate-180")}
            aria-hidden="true"
          />
          {!collapsed && "Collapse"}
        </button>
      </div>
    </div>
  );
}
