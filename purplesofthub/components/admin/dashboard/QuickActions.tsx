import Link from "next/link";
import { ArrowUpRight, FileText, FolderPlus, Globe, MessagesSquare, PenSquare, Wrench } from "lucide-react";

import { DashboardCard, DashboardCardHeader } from "./shared";

type QuickAction = {
  label: string;
  href: string;
  icon: typeof FolderPlus;
};

const ACTIONS: QuickAction[] = [
  { label: "New project", href: "/admin/projects/new", icon: FolderPlus },
  { label: "New invoice", href: "/admin/invoices/new", icon: FileText },
  { label: "New service", href: "/admin/services/new", icon: Wrench },
  { label: "Portfolio project", href: "/admin/portfolio/new", icon: Globe },
  { label: "New blog post", href: "/admin/blog/create", icon: PenSquare },
  { label: "View leads", href: "/admin/leads", icon: MessagesSquare },
];

export function QuickActions() {
  return (
    <DashboardCard>
      <DashboardCardHeader title="Quick actions" description="Verified studio shortcuts" />
      <ul className="grid grid-cols-2 gap-2 px-4 pb-4">
        {ACTIONS.map((action) => (
          <li key={action.href}>
            <Link
              href={action.href}
              className="group flex min-h-[76px] flex-col items-start justify-between gap-3 rounded-lg border border-border/70 bg-background p-3 text-sm font-medium text-foreground transition-[border-color,background-color] hover:border-primary/25 hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex w-full items-start justify-between">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <action.icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </span>
              <span className="line-clamp-2 leading-4">{action.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
