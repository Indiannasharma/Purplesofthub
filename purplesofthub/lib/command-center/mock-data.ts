/**
 * PurpleSoftHub Command Center — Phase 1 design prototype data.
 *
 * ⚠️  EVERYTHING IN THIS FILE IS ILLUSTRATIVE SAMPLE DATA.
 * It exists only to review the proposed visual design. None of it is
 * production data, and it must never be presented as real business metrics.
 * Phase 4 replaces this module with the existing `lib/admin/dashboard.ts`
 * contract (which stays functionally unchanged).
 */

export const MOCK_DATA_NOTICE =
  "Illustrative sample data — not production metrics";

export type Trend = "up" | "down" | "flat";

export interface Kpi {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: Trend;
  hint: string;
}

export const kpis: Kpi[] = [
  { id: "revenue", label: "Revenue · 30 days", value: "₦4.82M", delta: "+12.4%", trend: "up", hint: "vs previous 30 days" },
  { id: "projects", label: "Active projects", value: "18", delta: "+3", trend: "up", hint: "across 11 clients" },
  { id: "leads", label: "New leads · 7 days", value: "23", delta: "−2", trend: "down", hint: "Nova chat + contact forms" },
  { id: "outstanding", label: "Outstanding invoices", value: "₦1.34M", delta: "9 open", trend: "flat", hint: "3 overdue" },
];

/** Deterministic 30-point daily revenue series (thousands of ₦). Formula-based so SSR and hydration always match. */
export const revenueSeries: number[] = Array.from({ length: 30 }, (_, i) => {
  const base = 118 + i * 2.1;
  const wave = Math.sin(i / 3.1) * 16 + Math.sin(i / 1.7) * 7;
  return Math.round(base + wave);
});

export const revenueTotal = "₦4.82M";
export const revenuePeriod = "Last 30 days";

export interface PaymentSlice {
  label: string;
  amount: string;
  percent: number;
  tone: "success" | "warning" | "error";
}

export const paymentComposition: PaymentSlice[] = [
  { label: "Collected", amount: "₦3.48M", percent: 78, tone: "success" },
  { label: "Pending", amount: "₦0.92M", percent: 17, tone: "warning" },
  { label: "Overdue", amount: "₦0.42M", percent: 5, tone: "error" },
];

export type Priority = "high" | "medium" | "low";

export interface ActionItem {
  id: string;
  priority: Priority;
  title: string;
  context: string;
  due: string;
  actionLabel: string;
}

export const actionQueue: ActionItem[] = [
  { id: "a1", priority: "high", title: "Invoice INV-2041 is 12 days overdue", context: "KudiPay Ltd · ₦310,000", due: "Today", actionLabel: "Review" },
  { id: "a2", priority: "high", title: "3 new leads awaiting assignment", context: "Nova chat · last 24 hours", due: "Today", actionLabel: "Assign" },
  { id: "a3", priority: "medium", title: "Project “Nova SaaS” stalled 6 days", context: "In progress · no milestone updates", due: "Tomorrow", actionLabel: "Open" },
  { id: "a4", priority: "medium", title: "2 account-recovery requests to verify", context: "Operations · identity review", due: "Sep 27", actionLabel: "Verify" },
  { id: "a5", priority: "low", title: "Monthly client reports ready to send", context: "4 clients · September", due: "Sep 30", actionLabel: "Send" },
];

export interface PipelineStage {
  stage: string;
  count: number;
  tone: "accent" | "info" | "warning" | "success";
}

export const pipeline: PipelineStage[] = [
  { stage: "Discovery", count: 4, tone: "info" },
  { stage: "In progress", count: 11, tone: "accent" },
  { stage: "Review", count: 3, tone: "warning" },
  { stage: "Completed", count: 26, tone: "success" },
];

export type Health = "on-track" | "at-risk" | "stalled";

export interface ProjectHealthRow {
  id: string;
  name: string;
  client: string;
  progress: number;
  health: Health;
  due: string;
}

export const projectHealth: ProjectHealthRow[] = [
  { id: "p1", name: "Website Redesign", client: "KudiPay Ltd", progress: 68, health: "on-track", due: "Oct 04" },
  { id: "p2", name: "Nova SaaS Platform", client: "Helios Energy", progress: 41, health: "stalled", due: "Oct 18" },
  { id: "p3", name: "SEO Retainer — Q4", client: "Adaeze Stores", progress: 82, health: "on-track", due: "Sep 30" },
  { id: "p4", name: "Mobile App MVP", client: "FarmGrid", progress: 24, health: "at-risk", due: "Nov 02" },
];

export interface LeadRow {
  id: string;
  name: string;
  company: string;
  interest: string;
  source: string;
  time: string;
  status: "new" | "contacted" | "qualified";
}

export const leadsActivity: LeadRow[] = [
  { id: "l1", name: "Tolu Adeyemi", company: "Fintech startup", interest: "SaaS development", source: "Nova chat", time: "2h ago", status: "new" },
  { id: "l2", name: "Sarah Mensah", company: "Retail group, Accra", interest: "E-commerce build", source: "Contact form", time: "5h ago", status: "contacted" },
  { id: "l3", name: "David Okafor", company: "Independent artist", interest: "Music distribution", source: "Nova chat", time: "1d ago", status: "qualified" },
  { id: "l4", name: "Amara Nwosu", company: "Logistics firm", interest: "Brand + website", source: "Referral", time: "2d ago", status: "new" },
];

export type ActivityKind = "payment" | "client" | "project" | "content" | "system";

export interface ActivityEvent {
  id: string;
  time: string;
  title: string;
  detail: string;
  kind: ActivityKind;
}

export const activityTimeline: ActivityEvent[] = [
  { id: "e1", time: "09:12", title: "Invoice INV-2042 paid", detail: "₦180,000 · Paystack · Adaeze Stores", kind: "payment" },
  { id: "e2", time: "08:47", title: "New client account created", detail: "Kudi Technologies · onboarding started", kind: "client" },
  { id: "e3", time: "08:20", title: "Milestone completed", detail: "“Homepage wireframes” · Website Redesign", kind: "project" },
  { id: "e4", time: "Yesterday", title: "Blog post published", detail: "“Design systems for African startups”", kind: "content" },
  { id: "e5", time: "Yesterday", title: "Payment received", detail: "₦95,000 · Flutterwave · Music promotion", kind: "payment" },
  { id: "e6", time: "Sep 24", title: "Backup verification passed", detail: "System · nightly check", kind: "system" },
];

export interface CcNotification {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
}

export const ccNotifications: CcNotification[] = [
  { id: "n1", title: "Payment received", detail: "INV-2042 · ₦180,000", time: "9m", unread: true },
  { id: "n2", title: "New lead via Nova", detail: "Tolu Adeyemi · SaaS development", time: "2h", unread: true },
  { id: "n3", title: "Comment awaiting moderation", detail: "Blog · “Design systems…”", time: "5h", unread: false },
];
