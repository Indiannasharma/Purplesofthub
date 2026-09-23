import Link from "next/link";
import { FileText, FolderPlus, Globe, MessagesSquare, PenSquare, Wrench } from "lucide-react";

import { SectionTitle } from "./shared";

type QuickAction = {
  label: string;
  href: string;
  icon: typeof FolderPlus;
};

/**
 * Quick actions — compact shortcut pills, not a settings menu. Every route is
 * verified to exist under app/admin.
 */
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
    <section aria-labelledby="quick-actions-title">
      <SectionTitle id="quick-actions-title" title="Quick actions" />
      <ul className="mt-3 flex flex-wrap gap-1.5 border-t border-border/70 pt-3">
        {ACTIONS.map((action) => (
          <li key={action.href}>
            <Link
              href={action.href}
              className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border/70 px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <action.icon className="h-3 w-3" aria-hidden="true" />
              {action.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}