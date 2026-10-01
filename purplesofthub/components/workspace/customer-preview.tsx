"use client";

import { useState } from "react";
import { CustomerShell } from "@/components/workspace/customer-shell";
import { CustomerOverview, CustomerOverviewLoading } from "@/components/workspace/customer-overview";
import type { CustomerOverviewData } from "@/lib/customer-overview";
import { WorkspaceButton as Button } from "@/components/workspace/button";

/** Isolated visual QA fixtures. Never imported by any authenticated production route. */
const populated: CustomerOverviewData = {
  firstName: "Alexandra",
  projects: { state: "ready", rows: [{ id: "qa-project", title: "A deliberately long project name for a worldwide digital product and brand experience", service_type: "web_development", status: "in_progress", progress: 64, created_at: "2026-09-14T12:00:00Z" }, { id: "qa-project-2", title: "Brand foundations", service_type: "branding", status: "completed", progress: 100, created_at: "2026-09-01T12:00:00Z" }] },
  invoices: { state: "ready", rows: [{ id: "qa-invoice", invoice_number: "INV-QA-0001", amount: "1234567890.75", currency: "USD", status: "sent", due_date: "2026-10-12", created_at: "2026-09-25T12:00:00Z" }, { id: "qa-invoice-2", invoice_number: "INV-QA-0002", amount: 0, currency: "NGN", status: "paid", due_date: null, created_at: "2026-09-12T12:00:00Z" }] },
  music: { state: "ready", rows: [{ id: "qa-campaign", track_title: "A long track title that should wrap gracefully across small screens", artist_name: "Alexandra and the Worldwide Ensemble", plan_name: "Distribution plan", status: "pending", created_at: "2026-09-18T12:00:00Z" }] },
};
const empty: CustomerOverviewData = { firstName: "there", projects: { state: "ready", rows: [] }, invoices: { state: "ready", rows: [] }, music: { state: "ready", rows: [] } };
const errors: CustomerOverviewData = { firstName: "Alexandra", projects: { state: "failed", rows: [] }, invoices: { state: "unavailable", rows: [] }, music: { state: "unauthorized", rows: [] } };
export function CustomerWorkspacePreview() {
  const [state, setState] = useState("populated");
  return <CustomerShell identity={{ id: "visual-qa-only", name: "Alexandra With A Deliberately Long Customer Name", email: "fixture@example.invalid" }} pathname="/dashboard"><div className="customer-qa-controls"><strong>Local visual QA · synthetic fixtures · no authenticated session</strong><div>{["populated", "empty", "errors", "loading"].map(value => <Button key={value} variant={state === value ? "default" : "outline"} size="sm" aria-pressed={state === value} onClick={() => setState(value)}>{value}</Button>)}</div></div>{state === "loading" ? <CustomerOverviewLoading /> : <CustomerOverview data={state === "empty" ? empty : state === "errors" ? errors : populated} />}</CustomerShell>;
}
