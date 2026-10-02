import "server-only";
import type { createClient } from "@/lib/supabase/server";
import { overviewSection, type OverviewSection, type QueryResult } from "@/lib/customer-overview";
import type { CustomerProject, CustomerInvoice } from "@/lib/customer-records";

type SessionClient = Awaited<ReturnType<typeof createClient>>;
async function readSection<T>(query: PromiseLike<QueryResult<T>>): Promise<OverviewSection<T>> {
  try { return overviewSection(await query); }
  catch { return { state: "failed", rows: [] }; }
}
export function readCustomerProjects(supabase: SessionClient, userId: string) {
  return readSection<CustomerProject>(supabase.from("projects")
    .select("id, title, description, service_type, status, progress, due_date, created_at, project_updates(id, message, created_at)")
    .eq("client_id", userId).order("created_at", { ascending: false }));
}
export function readCustomerInvoices(supabase: SessionClient, userId: string) {
  return readSection<CustomerInvoice>(supabase.from("invoices")
    .select("id, amount, currency, status, due_date, created_at, projects(title)")
    .eq("client_id", userId).eq("projects.client_id", userId).order("created_at", { ascending: false }));
}
