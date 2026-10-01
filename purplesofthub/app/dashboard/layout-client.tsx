"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import UserNotificationBell from "@/components/dashboard/UserNotificationBell";
import { CustomerShell, type CustomerIdentity } from "@/components/workspace/customer-shell";

export default function DashboardLayoutClient({ identity, children }: { identity: CustomerIdentity; children: React.ReactNode }) {
  const pathname = usePathname() || "/dashboard";
  const { theme } = useTheme();
  return <CustomerShell identity={identity} pathname={pathname} notifications={<UserNotificationBell userId={identity.id} theme={theme} />}>{children}</CustomerShell>;
}
