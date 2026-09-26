"use client";

import Link from "next/link";
import {
  ChevronDown,
  FilePlus2,
  FileText,
  FolderPlus,
  Globe2,
  PenSquare,
  Wrench,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { RefreshButton } from "./RefreshButton";

const CREATE_ACTIONS = [
  { label: "New project", href: "/admin/projects/new", icon: FolderPlus },
  { label: "New invoice", href: "/admin/invoices/new", icon: FileText },
  { label: "New service", href: "/admin/services/new", icon: Wrench },
  { label: "New portfolio project", href: "/admin/portfolio/new", icon: Globe2 },
  { label: "New blog post", href: "/admin/blog/create", icon: PenSquare },
];

/**
 * Header actions: a real refresh plus a create menu over the real module
 * routes. Trigger uses the `.cc-btn` primitives; the Radix dropdown renders
 * through a portal, so its surface is driven by the body-level `--cc-*`
 * declaration in app/styles/command-center.css (overriding bg-popover here).
 */
export function DashboardCommandActions() {
  return (
    <div className="flex flex-wrap items-center gap-2 md:justify-end">
      <RefreshButton compact />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="cc-btn cc-btn-primary">
            <FilePlus2 className="h-3.5 w-3.5" aria-hidden="true" />
            Create
            <ChevronDown className="h-3 w-3 opacity-80" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-60 border-[var(--cc-border)] bg-[var(--cc-surface)] text-[var(--cc-text)]"
        >
          <DropdownMenuLabel className="text-xs text-[var(--cc-text-muted)]">
            Create in PurpleSoftHub
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[var(--cc-border)]" />

          {CREATE_ACTIONS.map((action) => (
            <DropdownMenuItem
              key={action.href}
              asChild
              className="focus:bg-[var(--cc-subtle)] focus:text-[var(--cc-text)]"
            >
              <Link href={action.href} className="gap-2.5">
                <action.icon
                  className="h-4 w-4 text-[var(--cc-text-muted)]"
                  aria-hidden="true"
                />
                {action.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
