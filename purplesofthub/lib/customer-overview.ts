/** Read-only presentation contracts. No auth, mutations, currency conversion or account totals. */
export type OverviewProject = { id: string; title: string | null; service_type: string | null; status: string | null; progress: number | null; created_at: string | null };
export type OverviewInvoice = { id: string; invoice_number: string | null; amount: number | string | null; currency: string | null; status: string | null; due_date: string | null; created_at: string | null };
export type OverviewMusic = { id: string; track_title: string | null; artist_name: string | null; plan_name: string | null; status: string | null; created_at: string | null };
export type OverviewSection<T> = { state: "ready"; rows: T[] } | { state: "failed" | "unavailable" | "unauthorized"; rows: [] };
export type CustomerOverviewData = { firstName: string; projects: OverviewSection<OverviewProject>; invoices: OverviewSection<OverviewInvoice>; music: OverviewSection<OverviewMusic> };
export type QueryResult<T> = { data: T[] | null; error: { code?: string } | null };
export function overviewSection<T>(result: QueryResult<T>): OverviewSection<T> {
  if (result.error) {
    const code = result.error.code;
    return { state: code === "42501" || code === "PGRST301" ? "unauthorized" : code === "42P01" || code === "42703" || code === "PGRST204" || code === "PGRST205" ? "unavailable" : "failed", rows: [] };
  }
  if (result.data === null) return { state: "unavailable", rows: [] };
  return { state: "ready", rows: result.data };
}
export function customerName(value: unknown): string {
  return typeof value === "string" && value.trim() && !value.includes("@") ? value.trim() : "";
}
export function overviewFirstName(profileName: unknown, metadataName: unknown): string {
  return (customerName(profileName) || customerName(metadataName)).split(/\s+/)[0] || "there";
}
export function overviewDate(value: string | null): string {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
}
export function invoiceAmount(amount: OverviewInvoice["amount"], currency: string | null): string {
  if (amount === null || amount === "" || !Number.isFinite(Number(amount))) return "Amount unavailable";
  const number = Number(amount);
  if (!currency || !/^[A-Za-z]{3}$/.test(currency)) return "Currency unavailable";
  try { return new Intl.NumberFormat("en", { style: "currency", currency: currency.toUpperCase(), currencyDisplay: "code" }).format(number); }
  catch { return "Currency unavailable"; }
}
export function projectProgress(value: number | null): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;
}
export function nextOverviewAction(data: CustomerOverviewData): { title: string; description: string; href: string; label: string } {
  if (data.invoices.state === "ready") {
    const invoice = data.invoices.rows.find(row => ["pending", "sent", "overdue"].includes(row.status || ""));
    if (invoice) return { title: "Review a recent invoice", description: (invoice.invoice_number || "A recent invoice") + " is marked " + invoice.status + ". Open your invoices for the details.", href: "/dashboard/invoices", label: "View invoices" };
  }
  if (data.projects.state === "ready") {
    const project = data.projects.rows.find(row => row.status === "in_progress");
    if (project) return { title: "Check in on your project", description: (project.title || "Your recent project") + " is in progress. See the available project updates.", href: "/dashboard/projects", label: "View projects" };
  }
  if (data.music.state === "ready" && data.music.rows.length) return { title: "Your music, in one place", description: "See your submitted campaign details and the status recorded by the team.", href: "/dashboard/music", label: "Open Music" };
  return { title: "What would you like to build next?", description: "Explore our services, or speak with the team about your next idea.", href: "/dashboard/services", label: "Explore services" };
}
