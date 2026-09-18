import {
  LayoutDashboard,
  Users,
  Inbox,
  FolderKanban,
  Wrench,
  ReceiptText,
  CreditCard,
  Palette,
  PenLine,
  MessagesSquare,
  FolderOpen,
  Megaphone,
  Mail,
  Music4,
  BadgePercent,
  ShieldCheck,
  Settings,
  FolderPlus,
  type LucideIcon,
} from "lucide-react";

import type { BreadcrumbItem } from "@/lib/workspace";

/**
 * Single authoritative navigation configuration for the Admin shell.
 *
 * Rules:
 *  - Only routes that actually exist under `app/admin/**` may be listed here.
 *  - Navigation visibility is presentation only. Server-side authorization
 *    lives in `app/admin/layout.tsx` (see `getAuthenticatedProfile`).
 */
export type AdminNavItem = {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  /** Optional static badge. Never used for invented counts. */
  badge?: string;
};

export type AdminNavSection = {
  id: string;
  title: string;
  items: AdminNavItem[];
};

export const adminNavigationSections: AdminNavSection[] = [
  {
    id: "overview",
    title: "Overview",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "business",
    title: "Business",
    items: [
      { id: "clients", title: "Clients", href: "/admin/clients", icon: Users },
      { id: "leads", title: "Leads", href: "/admin/leads", icon: Inbox },
      {
        id: "projects",
        title: "Projects",
        href: "/admin/projects",
        icon: FolderKanban,
      },
      { id: "services", title: "Services", href: "/admin/services", icon: Wrench },
      {
        id: "invoices",
        title: "Invoices",
        href: "/admin/invoices",
        icon: ReceiptText,
      },
      {
        id: "payments",
        title: "Payments",
        href: "/admin/payments",
        icon: CreditCard,
      },
    ],
  },
  {
    id: "content",
    title: "Content",
    items: [
      { id: "portfolio", title: "Portfolio", href: "/admin/portfolio", icon: Palette },
      { id: "blog", title: "Blog", href: "/admin/blog", icon: PenLine },
      {
        id: "comments",
        title: "Comments",
        href: "/admin/comments",
        icon: MessagesSquare,
      },
      { id: "resources", title: "Resources", href: "/admin/resources", icon: FolderOpen },
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    items: [
      { id: "ads", title: "Ads", href: "/admin/ads", icon: Megaphone },
      { id: "subscribers", title: "Subscribers", href: "/admin/subscribers", icon: Mail },
      { id: "music", title: "Music", href: "/admin/music", icon: Music4 },
      {
        id: "promotions",
        title: "Promotions",
        href: "/admin/promotions",
        icon: BadgePercent,
      },
    ],
  },
  {
    id: "operations",
    title: "Operations",
    items: [
      {
        id: "recovery",
        title: "Account Recovery",
        href: "/admin/recovery",
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: "system",
    title: "System",
    items: [{ id: "settings", title: "Settings", href: "/admin/settings", icon: Settings }],
  },
];

/**
 * Create/shortcut routes that exist today. Used by the command palette only,
 * never rendered as primary sidebar navigation.
 */
export const adminQuickActions: AdminNavItem[] = [
  { id: "new-project", title: "New Project", href: "/admin/projects/new", icon: FolderPlus },
  { id: "new-invoice", title: "New Invoice", href: "/admin/invoices/new", icon: ReceiptText },
  { id: "new-service", title: "New Service", href: "/admin/services/new", icon: Wrench },
  {
    id: "new-portfolio-project",
    title: "New Portfolio Project",
    href: "/admin/portfolio/new",
    icon: Palette,
  },
  { id: "new-blog-post", title: "New Blog Post", href: "/admin/blog/create", icon: PenLine },
];

/** Static segment labels used by breadcrumbs. Unknown segments (ids) are skipped. */
const STATIC_SEGMENT_LABELS: Record<string, string> = {
  new: "New",
  create: "Create",
  edit: "Edit",
};

const ADMIN_ROOT = "/admin";

/** Normalise a pathname for comparison: no query/hash, no trailing slash. */
export function normalizeAdminPath(pathname: string | null | undefined): string {
  const raw = (pathname ?? "").split("?")[0].split("#")[0];
  const trimmed = raw.replace(/\/+$/, "");

  if (!trimmed || trimmed === ADMIN_ROOT) return ADMIN_ROOT;

  return trimmed;
}

export function flattenAdminNavItems(
  sections: AdminNavSection[] = adminNavigationSections
): AdminNavItem[] {
  return sections.flatMap((section) => section.items);
}

/**
 * Active match for nested routes:
 *   /admin/projects, /admin/projects/new, /admin/projects/[id] → Projects
 *   /admin/blog, /admin/blog/create, /admin/blog/edit/[id]     → Blog
 * `/admin` is matched exactly so it never shadows every other section.
 */
export function isAdminNavItemActive(
  pathname: string | null | undefined,
  item: AdminNavItem
): boolean {
  const clean = normalizeAdminPath(pathname);

  if (item.href === ADMIN_ROOT) return clean === ADMIN_ROOT;

  return clean === item.href || clean.startsWith(`${item.href}/`);
}

export function getActiveAdminNavItem(
  pathname: string | null | undefined
): AdminNavItem | undefined {
  const clean = normalizeAdminPath(pathname);

  return flattenAdminNavItems().find((item) => isAdminNavItemActive(clean, item));
}

/**
 * Breadcrumbs derived purely from the pathname — no database queries.
 * Dashboard / Projects / New
 */
export function getAdminBreadcrumbs(pathname: string | null | undefined): BreadcrumbItem[] {
  const clean = normalizeAdminPath(pathname);
  const crumbs: BreadcrumbItem[] = [{ label: "Dashboard", href: ADMIN_ROOT }];

  if (clean === ADMIN_ROOT) return crumbs;

  const item = getActiveAdminNavItem(clean);
  const segments = clean.replace(/^\/admin\/?/, "").split("/").filter(Boolean);

  if (item && item.href !== ADMIN_ROOT) {
    crumbs.push({ label: item.title, href: item.href });

    const itemDepth = item.href
      .replace(/^\/admin\/?/, "")
      .split("/")
      .filter(Boolean).length;

    for (const segment of segments.slice(itemDepth)) {
      const label = STATIC_SEGMENT_LABELS[segment.toLowerCase()];

      // Unknown segment (entity id) — entity breadcrumbs land with their module.
      if (!label) break;

      crumbs.push({ label });
    }
  }

  return crumbs;
}
