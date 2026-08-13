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
  Users,
  KeyRound,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "@/lib/roles";

export type NavigationItem = {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
  badge?: string;
  children?: NavigationItem[];
};

export type NavigationSection = {
  id: string;
  title: string;
  items: NavigationItem[];
};

export const platformNavigationSections: NavigationSection[] = [
  {
    id: "workspace",
    title: "Workspace",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        href: "/platform/dashboard",
        icon: LayoutDashboard,
        roles: [
          "guest",
          "client",
          "student",
          "instructor",
          "artist",
          "staff",
          "admin",
          "super-admin",
        ],
        badge: "Core",
      },
    ],
  },
  {
    id: "products",
    title: "Products",
    items: [
      {
        id: "academy",
        title: "Academy",
        href: "/platform/academy",
        icon: GraduationCap,
        roles: ["student", "instructor", "staff", "admin", "super-admin"],
      },
      {
        id: "music",
        title: "Music",
        href: "/platform/music",
        icon: Music4,
        roles: ["artist", "staff", "admin", "super-admin"],
      },
      {
        id: "agency",
        title: "Agency",
        href: "/platform/agency",
        icon: BriefcaseBusiness,
        roles: ["client", "staff", "admin", "super-admin"],
      },
      {
        id: "marketplace",
        title: "Marketplace",
        href: "/platform/marketplace",
        icon: Store,
        roles: [
          "client",
          "student",
          "instructor",
          "artist",
          "staff",
          "admin",
          "super-admin",
        ],
        badge: "Soon",
      },
      {
        id: "ai-hub",
        title: "AI Hub",
        href: "/platform/ai-hub",
        icon: Sparkles,
        roles: [
          "client",
          "student",
          "instructor",
          "artist",
          "staff",
          "admin",
          "super-admin",
        ],
        badge: "Coming Soon",
      },
    ],
  },
  {
    id: "operations",
    title: "Operations",
    items: [
      {
        id: "files",
        title: "Files",
        href: "/platform/files",
        icon: FolderKanban,
        roles: [
          "client",
          "student",
          "instructor",
          "artist",
          "staff",
          "admin",
          "super-admin",
        ],
      },
      {
        id: "billing",
        title: "Billing",
        href: "/platform/billing",
        icon: CreditCard,
        roles: ["client", "staff", "admin", "super-admin"],
      },
      {
        id: "support",
        title: "Support",
        href: "/platform/support",
        icon: LifeBuoy,
        roles: [
          "client",
          "student",
          "instructor",
          "artist",
          "staff",
          "admin",
          "super-admin",
        ],
      },
      {
        id: "analytics",
        title: "Analytics",
        href: "/platform/analytics",
        icon: BarChart3,
        roles: ["staff", "admin", "super-admin"],
      },
      {
        id: "settings",
        title: "Settings",
        href: "/platform/settings",
        icon: Settings,
        roles: [
          "client",
          "student",
          "instructor",
          "artist",
          "staff",
          "admin",
          "super-admin",
        ],
      },
    ],
  },
  {
    id: "administration",
    title: "Administration",
    items: [
      {
        id: "administration",
        title: "Administration",
        href: "/platform/administration",
        icon: Shield,
        roles: ["admin", "super-admin"],
        children: [
          {
            id: "users",
            title: "Users",
            href: "/platform/administration#users",
            icon: Users,
            roles: ["admin", "super-admin"],
          },
          {
            id: "permissions",
            title: "Permissions",
            href: "/platform/administration#permissions",
            icon: KeyRound,
            roles: ["admin", "super-admin"],
          },
          {
            id: "audit-log",
            title: "Audit Log",
            href: "/platform/administration#audit-log",
            icon: FileText,
            roles: ["admin", "super-admin"],
          },
        ],
      },
    ],
  },
];

export function getVisibleNavigation(role: Role) {
  return platformNavigationSections
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => item.roles.includes(role))
        .map((item) => ({
          ...item,
          children: item.children?.filter((child) => child.roles.includes(role)),
        })),
    }))
    .filter((section) => section.items.length > 0);
}

export function flattenNavigationItems(
  sections: NavigationSection[] = platformNavigationSections
): NavigationItem[] {
  return sections.flatMap((section) =>
    section.items.flatMap((item) => [item, ...(item.children ?? [])])
  );
}

export function isNavigationItemActive(pathname: string, item: NavigationItem): boolean {
  const href = item.href.split("#")[0];

  if (pathname === href) return true;

  if (
    href !== "/platform/dashboard" &&
    (pathname.startsWith(`${href}/`) || pathname.startsWith(`${href}#`))
  ) {
    return true;
  }

  return item.children?.some((child) => isNavigationItemActive(pathname, child)) ?? false;
}

export function getNavigationItemByHref(href: string) {
  return flattenNavigationItems().find((item) => item.href === href);
}

