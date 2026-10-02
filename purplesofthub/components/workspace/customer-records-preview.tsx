"use client";
import { useState } from "react";
import { CustomerShell } from "@/components/workspace/customer-shell";
import { CustomerProjects } from "@/components/workspace/customer-projects";
import InvoicesClient from "@/app/dashboard/invoices/InvoicesClient";
import { CustomerRecordsLoading } from "@/components/workspace/customer-record-states";
import { WorkspaceButton as Button } from "@/components/workspace/button";
import type { OverviewSection } from "@/lib/customer-overview";
import type { CustomerProject, CustomerInvoice } from "@/lib/customer-records";

// Synthetic visual states only. No loader, session override, bell identity or persistence.
const projects: CustomerProject[] = [
  { id: "qa-project-1", title: "A deliberately long project name for a worldwide digital product and brand experience", description: "A customer-visible brief for a thoughtful digital experience. This text wraps naturally on narrow screens.", service_type: "A long service name covering digital product design and development", status: "in_progress", progress: 0, due_date: "2026-11-01", created_at: "2026-09-01", project_updates: [{ id: "qa-update", message: "Your initial direction is ready for discussion with the team.", created_at: "2026-09-20" }] },
  { id: "qa-project-2", title: "Brand foundations", description: null, service_type: "branding", status: "completed", progress: 100, due_date: null, created_at: "2026-09-02", project_updates: [] },
  { id: "qa-project-3", title: "Missing optional fields", description: null, service_type: null, status: null, progress: null, due_date: null, created_at: null, project_updates: null },
  { id: "qa-project-4", title: "A recorded status beyond the known vocabulary", description: null, service_type: "web_development", status: "a_deliberately_long_recorded_status_for_visual_wrapping", progress: 101, due_date: "invalid", created_at: "invalid", project_updates: [] },
];
const invoices: CustomerInvoice[] = [
  { id: "QA-REFERENCE-WITH-A-DELIBERATELY-LONG-IDENTIFIER", amount: "1234567890.75", currency: "USD", status: "sent", due_date: "2026-11-01", created_at: "2026-09-21", projects: { title: projects[0].title } },
  { id: "QA-NGN", amount: 0, currency: "NGN", status: "paid", due_date: null, created_at: "2026-09-20", projects: null },
  { id: "QA-GBP", amount: "125.50", currency: "GBP", status: "overdue", due_date: "2026-09-01", created_at: "2026-08-01", projects: { title: "Brand foundations" } },
  { id: "QA-CAD", amount: 99.99, currency: "CAD", status: "pending", due_date: null, created_at: "2026-09-22", projects: null },
  { id: "QA-MISSING", amount: null, currency: null, status: null, due_date: "invalid", created_at: null, projects: null },
  { id: "QA-LONG-STATUS", amount: 75, currency: "USD", status: "a_deliberately_long_recorded_status_for_visual_wrapping", due_date: null, created_at: null, projects: null },
];
export function CustomerRecordsPreview() {
  const [domain, setDomain] = useState("projects");
  const [state, setState] = useState("populated");
  function section<T>(rows: T[]): OverviewSection<T> {
    if (state === "failed" || state === "unavailable" || state === "unauthorized") return { state, rows: [] };
    return { state: "ready", rows: state === "empty" ? [] : rows };
  }
  return <CustomerShell identity={{ id: "visual-qa-only", name: "Alexandra With A Deliberately Long Customer Name", email: "fixture@example.invalid" }} pathname={"/dashboard/" + domain}><div className="customer-qa-controls"><strong>Local visual QA · synthetic fixtures · no authenticated session</strong><div>{["projects", "invoices"].map(value => <Button key={value} variant={domain === value ? "default" : "outline"} aria-pressed={domain === value} onClick={() => setDomain(value)}>{value}</Button>)}</div><div>{["populated", "empty", "failed", "unavailable", "unauthorized", "loading"].map(value => <Button key={value} size="sm" variant={state === value ? "default" : "outline"} aria-pressed={state === value} onClick={() => setState(value)}>{value}</Button>)}</div></div>{state === "loading" ? <CustomerRecordsLoading title={domain === "projects" ? "Projects" : "Invoices"} /> : domain === "projects" ? <CustomerProjects section={section(projects)} /> : <InvoicesClient section={section(invoices)} />}</CustomerShell>;
}
