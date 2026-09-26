import {
  LayoutDashboard,
  Users,
  Inbox,
  FolderKanban,
  ReceiptText,
  CreditCard,
  Wrench,
  Megaphone,
  Mail,
  Music4,
  Palette,
  PenLine,
  MessagesSquare,
  FolderOpen,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";

/**
 * Command Center navigation — Phase 1 design preview.
 * Mirrors the approved Admin IA. Only routes that exist in the product are
 * listed; the Promotions placeholder is intentionally absent.
 * Badges are illustrative sample counts, not live data.
 */

export interface CcNavItem {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface CcNavSection {
  id: string;
  title: string;
  items: CcNavItem[];
}

export const CC_NAV_SECTIONS: CcNavSection[] = [
  {
    id: "overview",
    title: "Overview",
    items: [
      { id: "dashboard", title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    id: "crm",
    title: "Clients & CRM",
    items: [
      { id: "clients", title: "Clients", href: "/admin/clients", icon: Users, badge: "24" },
      { id: "leads", title: "Leads", href: "/admin/leads", icon: Inbox, badge: "7" },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    items: [
      { id: "projects", title: "Pipeline", href: "/admin/projects", icon: FolderKanban, badge: "18" },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    items: [
      { id: "invoices", title: "Invoices", href: "/admin/invoices", icon: ReceiptText, badge: "9" },
      { id: "payments", title: "Payments", href: "/admin/payments", icon: CreditCard },
    ],
  },
  {
    id: "services",
    title: "Services",
    items: [{ id: "services", title: "Catalog", href: "/admin/services", icon: Wrench }],
  },
  {
    id: "marketing",
    title: "Marketing",
    items: [
      { id: "ads", title: "Ads", href: "/admin/ads", icon: Megaphone },
      { id: "subscribers", title: "Subscribers", href: "/admin/subscribers", icon: Mail },
      { id: "music", title: "Music Promotion", href: "/admin/music", icon: Music4 },
    ],
  },
  {
    id: "content",
    title: "Content",
    items: [
      { id: "portfolio", title: "Portfolio", href: "/admin/portfolio", icon: Palette },
      { id: "blog", title: "Blog", href: "/admin/blog", icon: PenLine },
      { id: "comments", title: "Comments", href: "/admin/comments", icon: MessagesSquare, badge: "2" },
      { id: "resources", title: "Resources", href: "/admin/resources", icon: FolderOpen },
    ],
  },
  {
    id: "operations",
    title: "Operations",
    items: [
      { id: "recovery", title: "Account Recovery", href: "/admin/recovery", icon: ShieldCheck },
    ],
  },
  {
    id: "system",
    title: "System",
    items: [{ id: "settings", title: "Settings", href: "/admin/settings", icon: Settings }],
  },
];
