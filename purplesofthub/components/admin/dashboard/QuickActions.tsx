import Link from "next/link";
import { ArrowUpRight, FileText, FolderPlus, Globe, Music4, PenSquare, Wrench } from "lucide-react";

import { DashboardCard, DashboardCardHeader } from "./shared";

type QuickAction = {
  label: string;
  href: string;
  icon: typeof FolderPlus;
};

/**
 * Quick Actions — every route verified to exist in app/admin. No invented
 * create-client route. The broken `/admin/blog/new` link is corrected to
 * `/admin/blog/create`.
 */
const ACTIONS: QuickAction[] = [
  { label: "New project", href: "/admin/projects/new", icon: FolderPlus },
  { label: "New invoice", href: "/admin/invoices/new", icon: FileText },
  { label: "New service", href: "/admin/services/new", icon: Wrench },
  { label: "New portfolio project", href: "/admin/portfolio/new", icon: Globe },
  { label: "New blog post", href: "/admin/blog/create", icon: PenSquare },
  { label: "View leads", href: "/admin/leads", icon: Music4 },
];

export function QuickActions() {
  return (
    <DashboardCard>
      <DashboardCardHeader title="Quick actions" description="Jump to a create flow" />
      <ul className="grid gap-1 px-2 pb-3 sm:grid-cols-2 lg:grid-cols-1">
        {ACTIONS.map((action) => (
          <li key={action.href}>
            <Link
              href={action.href}
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors group-hover:text-primary">
                <action.icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="flex-1 truncate">{action.label}</span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
