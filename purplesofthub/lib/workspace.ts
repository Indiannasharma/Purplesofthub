import {
  LayoutDashboard,
  GraduationCap,
  Music4,
  BriefcaseBusiness,
  Store,
  Sparkles,
  FolderKanban,
  CreditCard,
  LifeBuoy,
  BarChart3,
  Settings,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type WorkspaceKey =
  | "dashboard"
  | "academy"
  | "music"
  | "agency"
  | "marketplace"
  | "ai-hub"
  | "files"
  | "billing"
  | "support"
  | "analytics"
  | "settings"
  | "administration";

export type WorkspaceMeta = {
  key: WorkspaceKey;
  title: string;
  description: string;
  href: string;
  badge?: string;
  icon: LucideIcon;
};

export const platformWorkspaces: WorkspaceMeta[] = [
  {
    key: "dashboard",
    title: "Dashboard",
    description: "A single command center for activity, tasks, and high-level platform visibility.",
    href: "/platform/dashboard",
    badge: "Core",
    icon: LayoutDashboard,
  },
  {
    key: "academy",
    title: "Academy",
    description: "The learning workspace for courses, cohorts, lessons, and learner progress.",
    href: "/platform/academy",
    icon: GraduationCap,
  },
  {
    key: "music",
    title: "Music",
    description: "The future workspace for artist campaigns, releases, and promotion operations.",
    href: "/platform/music",
    icon: Music4,
  },
  {
    key: "agency",
    title: "Agency",
    description: "The client services workspace for project delivery, briefs, and execution.",
    href: "/platform/agency",
    icon: BriefcaseBusiness,
  },
  {
    key: "marketplace",
    title: "Marketplace",
    description: "A future commerce surface for digital products and platform offerings.",
    href: "/platform/marketplace",
    badge: "Soon",
    icon: Store,
  },
  {
    key: "ai-hub",
    title: "AI Hub",
    description: "A future workspace for AI-powered platform tools and automation.",
    href: "/platform/ai-hub",
    badge: "Coming Soon",
    icon: Sparkles,
  },
  {
    key: "files",
    title: "Files",
    description: "A shared asset area for documents, media, and workspace attachments.",
    href: "/platform/files",
    icon: FolderKanban,
  },
  {
    key: "billing",
    title: "Billing",
    description: "The financial workspace for invoices, subscriptions, and payment activity.",
    href: "/platform/billing",
    icon: CreditCard,
  },
  {
    key: "support",
    title: "Support",
    description: "A unified support workspace for tickets, messages, and customer help.",
    href: "/platform/support",
    icon: LifeBuoy,
  },
  {
    key: "analytics",
    title: "Analytics",
    description: "A reporting space for platform signals, performance, and insights.",
    href: "/platform/analytics",
    icon: BarChart3,
  },
  {
    key: "settings",
    title: "Settings",
    description: "Workspace preferences, account preferences, and platform configuration.",
    href: "/platform/settings",
    icon: Settings,
  },
  {
    key: "administration",
    title: "Administration",
    description: "Administrative controls reserved for privileged platform operators.",
    href: "/platform/administration",
    icon: Shield,
  },
];

export function getWorkspaceByPath(pathname: string): WorkspaceMeta {
  const found = platformWorkspaces.find((workspace) => {
    return pathname === workspace.href || pathname.startsWith(`${workspace.href}/`);
  });

  return (
    found ?? {
      key: "dashboard",
      title: "Platform Shell",
      description: "Shared authenticated workspace for all PurpleSoftHub products.",
      href: "/platform/dashboard",
      badge: "Platform",
      icon: LayoutDashboard,
    }
  );
}

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const workspace = getWorkspaceByPath(pathname);

  return [
    { label: "Platform", href: "/platform/dashboard" },
    { label: workspace.title, href: workspace.href },
  ];
}

