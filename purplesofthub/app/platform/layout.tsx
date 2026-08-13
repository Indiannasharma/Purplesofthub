import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Platform",
  description: "Shared authenticated PurpleSoftHub workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
