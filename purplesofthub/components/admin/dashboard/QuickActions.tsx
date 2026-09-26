import Link from "next/link";
import { FileText, FolderPlus, Globe, MessagesSquare, PenSquare, Wrench } from "lucide-react";

import { Panel, PanelHeader } from "@/components/command-center/primitives";

type QuickAction = {
  label: string;
  href: string;
  icon: typeof FolderPlus;
};

/**
 * Quick actions — compact shortcuts in one panel, not a settings menu. Every
 * route is verified to exist under app/admin.
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
    <Panel labelledBy="quick-actions-title">
      <PanelHeader id="quick-actions-title" title="Quick actions" />

      <ul className="cc-hairline-top grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 xl:grid-cols-2">
        {ACTIONS.map((action) => (
          <li key={action.href}>
            <Link
              href={action.href}
              className="flex min-h-[76px] flex-col justify-between gap-2 rounded-lg border border-[var(--cc-border)] px-3 py-3 text-left transition-colors hover:border-[var(--cc-border-strong)] hover:bg-[var(--cc-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-accent)]"
            >
              <action.icon
                className="h-4 w-4 text-[var(--cc-accent)]"
                aria-hidden="true"
              />
              <span className="text-xs font-semibold leading-4 text-[var(--cc-text)]">
                {action.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
