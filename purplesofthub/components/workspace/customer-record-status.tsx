import { WorkspaceStatusBadge } from "@/components/workspace/status-badge";
import { recordStatusLabel } from "@/lib/customer-records";

/** Same presentation as Phase 2 Overview; stored status semantics remain untouched. */
export function CustomerRecordStatus({ value }: { value: string | null }) {
  const tone = value === "in_progress" ? "info" : value === "overdue" ? "error" : value === "sent" ? "warning" : undefined;
  return <WorkspaceStatusBadge status={recordStatusLabel(value)} tone={tone} />;
}
