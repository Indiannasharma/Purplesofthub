import "server-only";
import type { createClient } from "@/lib/supabase/server";
import { overviewSection, type OverviewInvoice, type OverviewMusic, type OverviewProject, type QueryResult } from "@/lib/customer-overview";

/** Same session client and ownership filters as the existing customer pages.
 * Four independent, bounded reads; never reuse the role-dependent dashboard API.
 */
export async function readCustomerOverview(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  async function safely<T>(query: PromiseLike<QueryResult<T>>) {
    try { return overviewSection(await query); }
    catch { return overviewSection<T>({ data: null, error: { code: "NETWORK" } }); }
  }
  async function profileName() {
    try { const result = await supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(); return result.error ? null : result.data?.full_name; }
    catch { return null; }
  }
  const [name, projects, invoices, music] = await Promise.all([
    profileName(),
    safely<OverviewProject>(supabase.from("projects").select("id, title, service_type, status, progress, created_at").eq("client_id", userId).order("created_at", { ascending: false }).limit(5)),
    safely<OverviewInvoice>(supabase.from("invoices").select("id, invoice_number, amount, currency, status, due_date, created_at").eq("client_id", userId).order("created_at", { ascending: false }).limit(5)),
    safely<OverviewMusic>(supabase.from("music_campaigns").select("id, track_title, artist_name, plan_name, status, created_at").eq("client_id", userId).order("created_at", { ascending: false }).limit(3)),
  ]);
  return { profileName: name, projects, invoices, music };
}
