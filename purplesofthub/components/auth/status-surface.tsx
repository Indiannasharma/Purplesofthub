"use client";

import { AuthFrame } from "@/components/auth/auth-view";
import { WorkspaceButton } from "@/components/workspace/button";
import Link from "next/link";

export function StatusSurface({ title = "Page not found", description = "The page you are looking for could not be found.", code = "404", reset, showTheme = true, details }: { title?: string; description?: string; code?: string; reset?: () => void; showTheme?: boolean; details?: string }) {
  return <AuthFrame title={title} description={description} showTheme={showTheme}><p className="auth-status-code">{code}</p><div className="auth-status-actions">{reset ? <WorkspaceButton type="button" onClick={reset}>Try again</WorkspaceButton> : null}<WorkspaceButton asChild variant="outline"><Link href="/">Go home</Link></WorkspaceButton></div>{details ? <pre>{details}</pre> : null}</AuthFrame>;
}
