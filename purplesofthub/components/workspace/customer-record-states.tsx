import Link from "next/link";
import { WorkspacePage } from "@/components/workspace/page";
import { WorkspacePageHeader } from "@/components/workspace/page-header";
import { WorkspaceLoadingState } from "@/components/workspace/loading-state";
import { WorkspaceErrorState } from "@/components/workspace/error-state";
import type { OverviewSection } from "@/lib/customer-overview";

export function CustomerRecordsLoading({ title }: { title: string }) {
  return <WorkspacePage kind="customer" className="customer-records"><WorkspacePageHeader title={title} description="Loading your records…" /><WorkspaceLoadingState rows={4} /></WorkspacePage>;
}
export function CustomerRecordsError({ state }: { state: Exclude<OverviewSection<unknown>["state"], "ready"> }) {
  return <WorkspaceErrorState title={state === "unauthorized" ? "Access unavailable" : state === "unavailable" ? "These records are unavailable" : "Could not load your records"} description={state === "unauthorized" ? "Your current session cannot read these records. Try signing in again or contact the team." : state === "unavailable" ? "This information is unavailable right now. Contact the team if you need assistance." : "Refresh this page to try again. If the problem continues, contact the team."} />;
}
export function CustomerRecordsSupport() {
  return <aside className="customer-records-support" aria-label="Help with your records"><p>Questions about your work or an invoice? Use Nova in the corner or <a href="https://wa.me/qr/L36LMHQ4RLP2B1" target="_blank" rel="noopener noreferrer">talk to the team on WhatsApp<span className="sr-only"> (opens a new tab)</span></a>.</p><Link href="/dashboard">Back to Overview</Link></aside>;
}
