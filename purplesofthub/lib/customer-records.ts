import type { OverviewProject, OverviewInvoice } from "@/lib/customer-overview";

export type CustomerProject = Omit<OverviewProject, "id"> & {
  id: string | number;
  description: string | null;
  due_date: string | null;
  project_updates: { id: string | number; message: string | null; created_at: string | null }[] | null;
};
export type CustomerInvoice = Omit<OverviewInvoice, "id" | "invoice_number"> & {
  id: string | number;
  projects: { title: string | null } | { title: string | null }[] | null;
};
export function recordStatusLabel(status: string | null): string {
  return status?.trim().replace(/_/g, " ") || "Status unavailable";
}
/** Exact recorded statuses; no inferred Active group or due-date-derived overdue. */
export function projectStatusOptions(rows: CustomerProject[]): { value: string; label: string }[] {
  return [...new Set(rows.map(row => row.status))].map(status => ({ value: status === null ? "missing" : "status:" + status, label: recordStatusLabel(status) }));
}
export function filterProjects(rows: CustomerProject[], value: string): CustomerProject[] {
  if (value === "all") return rows;
  return rows.filter(row => (row.status === null ? "missing" : "status:" + row.status) === value);
}
/** Preserve the customer update preview; never call an unordered first update the latest. */
export function recentProjectUpdate(project: CustomerProject) {
  return project.project_updates?.filter(update => update.message?.trim()).slice().sort((a, b) => {
    const time = (value: string | null) => value && Number.isFinite(Date.parse(value)) ? Date.parse(value) : -Infinity;
    return time(b.created_at) - time(a.created_at);
  })[0] || null;
}

export function invoiceProjectTitle(projects: CustomerInvoice["projects"]): string {
  return (Array.isArray(projects) ? projects[0]?.title : projects?.title) || "Project not specified";
}
