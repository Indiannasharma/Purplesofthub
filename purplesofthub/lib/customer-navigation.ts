import { LayoutDashboard, Wrench, FolderKanban, ReceiptText, FolderOpen, Megaphone, Music4, GraduationCap, ShieldCheck, MessagesSquare, Settings, Link2, type LucideIcon } from "lucide-react";
import { isWorkspaceDestinationActive } from "@/lib/workspace-navigation";

/** Presentation inventory, not authorization or an alternative account/role model. */
export type CustomerNavItem = {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  destination: "workspace" | "public" | "external";
  note?: string;
};

/** Current destinations only. Groups can grow without changing the shell or identity model. */
export const customerNavigation: CustomerNavItem[] = [
  { id: "overview", title: "Overview", href: "/dashboard", icon: LayoutDashboard, destination: "workspace" },
  { id: "services", title: "Services", href: "/dashboard/services", icon: Wrench, destination: "workspace" },
  { id: "projects", title: "Projects", href: "/dashboard/projects", icon: FolderKanban, destination: "workspace" },
  { id: "invoices", title: "Invoices", href: "/dashboard/invoices", icon: ReceiptText, destination: "workspace" },
  { id: "files", title: "Files", href: "/dashboard/files", icon: FolderOpen, destination: "workspace" },
  { id: "advertising", title: "Advertising", href: "/dashboard/ads", icon: Megaphone, destination: "workspace" },
  { id: "music", title: "Music", href: "/dashboard/music", icon: Music4, destination: "workspace" },
  { id: "academy", title: "Academy", href: "/academy", icon: GraduationCap, destination: "public", note: "Public tracks and waitlist" },
  { id: "recovery", title: "Account Recovery", href: "/dashboard/recovery", icon: ShieldCheck, destination: "workspace" },
  { id: "support", title: "Support", href: "https://wa.me/qr/L36LMHQ4RLP2B1", icon: MessagesSquare, destination: "external", note: "WhatsApp support" },
  { id: "settings", title: "Settings", href: "/dashboard/settings", icon: Settings, destination: "workspace" },
];

/** Manual advertising setup instructions; not a provider connection. */
export const customerAdvertisingLinks: CustomerNavItem[] = [
  { id: "connect-meta", title: "Meta access guide", href: "/dashboard/connect-meta", icon: Link2, destination: "workspace" },
];

export function isCustomerNavItemActive(pathname: string | null | undefined, item: CustomerNavItem): boolean {
  if (item.destination === "external") return false;
  return isWorkspaceDestinationActive(pathname, item.href, "/dashboard");
}

export const customerNavigationGroups = [
  { title: "Your workspace", ids: ["overview", "projects", "invoices", "files"] },
  { title: "Grow with us", ids: ["services", "advertising", "music", "recovery"] },
  { title: "Explore & account", ids: ["academy", "settings"] },
] as const;
