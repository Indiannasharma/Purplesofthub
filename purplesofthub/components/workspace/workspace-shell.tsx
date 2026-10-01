"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, type LucideIcon } from "lucide-react";
import { WorkspaceButton as Button } from "@/components/workspace/button";
import { Sheet, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { WorkspaceSheetContent } from "@/components/workspace/overlays";
import { isWorkspaceDestinationActive } from "@/lib/workspace-navigation";
import { WorkspaceRoot, type WorkspaceKind } from "@/components/workspace/page";

type NavigationLink = { id: string; title: string; href: string; icon: LucideIcon; note?: string };

function Navigation({ items, pathname, rootHref, onNavigate }: { items: readonly NavigationLink[]; pathname: string; rootHref: string; onNavigate?: () => void }) {
  return <nav className="ws-navigation" aria-label="Workspace sections">{items.map(item => {
    const active = isWorkspaceDestinationActive(pathname, item.href, rootHref);
    return <Link key={item.id} href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined}><item.icon size={16} aria-hidden="true" /><span>{item.title}{item.note ? <small>{item.note}</small> : null}</span></Link>;
  })}</nav>;
}

/** A presentation boundary for later adoption. It does not fetch profiles or authorize routes.
 * Production Admin retains AdminShell; production customer routes retain their existing layout.
 * This shell uses document scrolling, not the Admin fixed viewport scroll contract.
 */
export function WorkspaceShell({ kind, title, navigation, pathname, actions, mainId = "workspace-main", children }: { kind: WorkspaceKind; title: string; navigation: readonly NavigationLink[]; pathname: string; actions?: React.ReactNode; mainId?: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <WorkspaceRoot kind={kind}>
    <a href={"#" + mainId} className="ws-skip">Skip to content</a>
    <div className="ws-shell">
      <aside className="ws-sidebar" aria-label="Workspace sidebar"><p className="mb-5 text-sm font-semibold">PurpleSoftHub</p><Navigation items={navigation} pathname={pathname} rootHref={kind === "admin" ? "/admin" : "/dashboard"} /></aside>
      <div className="min-w-0">
        <header className="ws-topbar">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild><Button type="button" variant="ghost" size="icon" className="ws-mobile-trigger" aria-label="Open workspace navigation"><Menu size={20} aria-hidden="true" /></Button></SheetTrigger>
              <WorkspaceSheetContent side="left" className="w-[288px]">
                <SheetTitle>Workspace navigation</SheetTitle><SheetDescription className="mb-6 mt-2">Navigate the existing PurpleSoftHub experiences.</SheetDescription>
                <Navigation items={navigation} pathname={pathname} rootHref={kind === "admin" ? "/admin" : "/dashboard"} onNavigate={() => setOpen(false)} />
              </WorkspaceSheetContent>
            </Sheet>
            <span className="text-sm font-semibold">{title}</span>
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
        <main id={mainId} tabIndex={-1}>{children}</main>
      </div>
    </div>
  </WorkspaceRoot>;
}
