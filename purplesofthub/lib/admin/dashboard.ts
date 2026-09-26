/**
 * PurpleSoftHub — Admin Overview data layer (Phase 1C)
 *
 * SERVER ONLY. This module is imported exclusively by the admin Server
 * Component tree. It must never be imported from a `'use client'` module.
 *
 * Design rules honoured here:
 *  - Every number is a real, computed value. There are no seeded fallbacks,
 *    no "demo" series, and no invented growth percentages.
 *  - A failing table degrades to `status: 'unavailable'` for that section only.
 *    The dashboard never crashes because one source is down, and it never
 *    substitutes fake data for a failure.
 *  - Multi-currency amounts are aggregated per currency. NGN/USD/GBP are never
 *    summed into one number, and no invented exchange rate is applied.
 *  - `payments` / `transactions` are deliberately NOT touched (RLS unverified);
 *    all financial metrics derive from `invoices` only.
 *  - Only the columns each metric needs are selected — never `select('*')`.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

import { createClient as createSessionClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/admin'

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type DashboardSectionStatus = 'ok' | 'unavailable'

export type CurrencyTotal = {
  currency: string
  amount: number
}

export type ClientGrowthPoint = {
  /** Sortable key, e.g. "2026-04". */
  month: string
  /** Display label, e.g. "Apr 26". */
  label: string
  clients: number
}

export type RecentClient = {
  id: string
  name: string
  email: string | null
  createdAt: string
}

export type ProjectStatusCount = {
  status: string
  label: string
  count: number
}

export type ProjectDeadline = {
  id: string
  title: string
  dueDate: string
  daysUntil: number
  status: string
  statusLabel: string
}

export type RecentLead = {
  id: string
  name: string
  service: string | null
  status: string | null
  statusLabel: string | null
  createdAt: string
}

export type ServiceInterestCount = {
  label: string
  count: number
}

export type OverdueInvoice = {
  id: string
  amount: number
  currency: string
  dueDate: string | null
  daysOverdue: number
}

export type LeadSource = 'contacts' | 'chat_leads'

export type ClientsData = {
  status: DashboardSectionStatus
  totalClients: number
  newThisMonth: number
  newLastMonth: number
  growth: ClientGrowthPoint[]
  recent: RecentClient[]
}

export type ProjectsData = {
  status: DashboardSectionStatus
  total: number
  active: number
  byStatus: ProjectStatusCount[]
  upcomingDeadlines: ProjectDeadline[]
}

export type LeadsData = {
  status: DashboardSectionStatus
  source: LeadSource
  total: number
  newCount: number
  recent: RecentLead[]
  topServices: ServiceInterestCount[]
}

export type FinanceData = {
  status: DashboardSectionStatus
  paidCount: number
  pendingCount: number
  overdueCount: number
  cancelledCount: number
  outstanding: CurrencyTotal[]
  /** Paid in the current calendar month, per currency. */
  paidThisMonth: CurrencyTotal[]
  /**
   * All-time settled invoice amounts, per currency. Money that invoice records
   * mark as paid — explicitly NOT a payment-provider revenue figure.
   */
  collected: CurrencyTotal[]
  /** All-time non-cancelled invoice amounts, per currency. */
  invoiced: CurrencyTotal[]
  overdueInvoices: OverdueInvoice[]
}

export type AttentionKind = 'invoice' | 'project' | 'lead' | 'recovery' | 'content'

export type AttentionItem = {
  id: string
  kind: AttentionKind
  title: string
  description: string
  href: string
  severity: 'info' | 'warning' | 'critical'
}

export type AttentionData = {
  items: AttentionItem[]
  /** True when more items existed than the display cap. */
  truncated: boolean
}

export type ActivityItem = {
  id: string
  title: string
  message: string
  type: string
  createdAt: string
}

export type ActivityData = {
  status: DashboardSectionStatus
  items: ActivityItem[]
}

export type BusinessInsight = {
  id: string
  text: string
}

export type OverviewData = {
  /** null means "could not be determined" and renders as an honest dash. */
  totalClients: number | null
  newClientsThisMonth: number | null
  activeProjects: number | null
  totalProjects: number | null
  totalLeads: number | null
  newLeads: number | null
  /**
   * Outstanding invoice count derived from invoices: every unpaid, non-cancelled
   * invoice. (The previous dashboard reported a `status = 'pending'` count which
   * silently excluded overdue invoices.)
   */
  outstandingInvoiceCount: number | null
  outstanding: CurrencyTotal[]
  paidThisMonth: CurrencyTotal[]
  overdueCount: number | null
  /** Context counts — real, but only surfaced inside section subtitles. */
  subscribers: number | null
  recoveryPending: number | null
}

/** Everything the Overview needs, fully serializable across the RSC boundary. */
export type AdminDashboardData = {
  generatedAt: string
  overview: OverviewData
  clients: ClientsData
  projects: ProjectsData
  leads: LeadsData
  finance: FinanceData
  recentActivity: ActivityData
  attention: AttentionData
  insights: BusinessInsight[]
}

/* -------------------------------------------------------------------------- */
/* Constants & formatters                                                     */
/* -------------------------------------------------------------------------- */

const RECENT_LIMIT = 6
const RECENT_LEAD_WINDOW_DAYS = 30
const GROWTH_MONTHS = 12
const DEADLINE_HORIZON_DAYS = 30
const ATTENTION_CAP = 8
const FINANCE_CURRENCY_ORDER = ['NGN', 'USD', 'GBP', 'EUR']

/** Statuses actually used by the projects schema/module. */
const PROJECT_STATUS_ORDER = ['pending', 'in_progress', 'completed', 'on_hold', 'cancelled']

const PROJECT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
  on_hold: 'On hold',
  cancelled: 'Cancelled',
  active: 'Active',
}

const LEAD_STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  converted: 'Converted',
  lost: 'Lost',
}

/** Statuses that mean a project is no longer being worked on. */
const CLOSED_PROJECT_STATUSES = new Set(['completed', 'cancelled'])

const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  contacts: 'Website contact form',
  chat_leads: 'Puri chat assistant',
}

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/**
 * Derive a greeting from server time. Intentionally timezone-naive: the server
 * clock is a reasonable proxy and we are not adding timezone infrastructure for
 * a greeting.
 */
export function getGreeting(now: Date = new Date()): string {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function leadSourceLabel(source: LeadSource): string {
  return LEAD_SOURCE_LABELS[source]
}

export function projectStatusLabel(status: string): string {
  return PROJECT_STATUS_LABELS[status] ?? humanize(status)
}

export function leadStatusLabel(status: string | null): string | null {
  if (!status) return null
  const key = status.trim().toLowerCase()
  if (!key) return null
  return LEAD_STATUS_LABELS[key] ?? humanize(key)
}

function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase())
}

/**
 * Format an amount with its own currency symbol — never converts. Uses the
 * narrow symbol so NGN renders as ₦ and USD as $, matching how the rest of the
 * admin UI presents money.
 */
export function formatCurrencyAmount(amount: number, currency: string): string {
  const code = (currency || 'NGN').toUpperCase()
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${code} ${amount.toLocaleString('en-NG')}`
  }
}

/** Renders an honest dash when a value could not be determined. */
export function formatCount(value: number | null): string {
  return value === null ? '—' : value.toLocaleString('en-NG')
}

/* -------------------------------------------------------------------------- */
/* Query helpers                                                              */
/* -------------------------------------------------------------------------- */

type QueryResult<T> = { data: T[] | null; error: unknown }

const PAGE_SIZE = 500
const MAX_PAGES = 40

/**
 * Pages a select so totals are real counts over the whole table rather than
 * "however many rows the first response happened to contain". Bounded by
 * MAX_PAGES so a runaway table cannot stall the dashboard.
 */
async function fetchPaged<T>(
  build: (from: number, to: number) => PromiseLike<QueryResult<T>>
): Promise<QueryResult<T>> {
  const rows: T[] = []
  let from = 0

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const to = from + PAGE_SIZE - 1
    const { data, error } = await build(from, to)

    if (error) return { data: null, error }
    if (!data || data.length === 0) return { data: rows, error: null }

    rows.push(...data)
    if (data.length < PAGE_SIZE) return { data: rows, error: null }
    from += PAGE_SIZE
  }

  return { data: rows, error: null }
}

/** Exact (head-only) count — never downloads rows just to count them. */
async function countRows(
  supabase: SupabaseClient,
  table: string,
  column = 'id'
): Promise<number | null> {
  const { count, error } = await supabase
    .from(table)
    .select(column, { count: 'exact', head: true })

  if (error) {
    console.error(`[admin-dashboard] count failed for ${table}:`, error.message)
    return null
  }
  return safeCount(count)
}

function safeCount(count: number | null | undefined): number | null {
  return typeof count === 'number' && Number.isFinite(count) ? count : null
}

function addToTotals(map: Map<string, number>, currency: string | null, amount: number) {
  const key = (currency || 'NGN').trim().toUpperCase() || 'NGN'
  map.set(key, (map.get(key) ?? 0) + amount)
}

function toCurrencyTotals(map: Map<string, number>): CurrencyTotal[] {
  return Array.from(map.entries())
    .filter(([, amount]) => amount !== 0)
    .map(([currency, amount]) => ({ currency, amount }))
    .sort((a, b) => {
      const ai = FINANCE_CURRENCY_ORDER.indexOf(a.currency)
      const bi = FINANCE_CURRENCY_ORDER.indexOf(b.currency)
      if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
      return b.amount - a.amount
    })
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function startOfMonthsAgo(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() - months, 1)
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000)
}

function toDate(value: string | null): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isFinite(parsed.getTime()) ? parsed : null
}

function toAmount(value: number | string | null): number {
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : value
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : 0
}

function countInWindow(dates: (string | null)[], from: Date, to: Date): number {
  return dates.reduce((total, value) => {
    const date = toDate(value)
    if (!date) return total
    return date >= from && date < to ? total + 1 : total
  }, 0)
}

/* -------------------------------------------------------------------------- */
/* Row shapes (only the columns each query selects)                           */
/* -------------------------------------------------------------------------- */

type ProfileRow = {
  id: string
  full_name: string | null
  email: string | null
  created_at: string | null
}

type ProjectRow = {
  id: string
  title: string | null
  status: string | null
  end_date: string | null
  created_at: string | null
}

type InvoiceRow = {
  id: string
  amount: number | string | null
  currency: string | null
  status: string | null
  due_date: string | null
  paid_at: string | null
  created_at: string | null
}

type ChatLeadRow = {
  id: string | number
  name: string | null
  service_interest: string | null
  status: string | null
  created_at: string | null
}

type ContactLeadRow = {
  id: string | number
  name: string | null
  service: string | null
  status?: string | null
  created_at: string | null
}

type NotificationRow = {
  id: string
  title: string | null
  message: string | null
  type: string | null
  created_at: string | null
}

/* -------------------------------------------------------------------------- */
/* Leads                                                                      */
/* -------------------------------------------------------------------------- */

type NormalizedLead = {
  id: string
  name: string
  service: string | null
  status: string | null
  createdAt: string | null
}

type LeadsResult = { data: LeadsData; createdAt: (string | null)[] }

const EMPTY_LEADS: LeadsData = {
  status: 'unavailable',
  source: 'contacts',
  total: 0,
  newCount: 0,
  recent: [],
  topServices: [],
}

function isUncontacted(status: string | null): boolean {
  const value = (status || '').trim().toLowerCase()
  return value === '' || value === 'new'
}

/**
 * Aggregates real `service_interest` values. Empty strings are grouped under
 * "Not specified"; no category is ever invented or seeded with a fallback
 * percentage.
 */
function buildServiceInterest(labels: (string | null)[]): ServiceInterestCount[] {
  const counts = new Map<string, number>()
  let unspecified = 0

  labels.forEach((raw) => {
    const label = (raw || '').trim()
    if (!label) {
      unspecified += 1
      return
    }
    counts.set(label, (counts.get(label) ?? 0) + 1)
  })

  const rows: ServiceInterestCount[] = Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 5)

  if (unspecified > 0) rows.push({ label: 'Not specified', count: unspecified })

  return rows
}

function toLeadsResult(source: LeadSource, rows: NormalizedLead[], now: Date): LeadsResult {
  return {
    data: {
      status: 'ok',
      source,
      total: rows.length,
      newCount: rows.filter((row) => isUncontacted(row.status)).length,
      recent: buildRecentLeads(rows, now),
      topServices: buildServiceInterest(rows.map((row) => row.service)),
    },
    createdAt: rows.map((row) => row.createdAt),
  }
}

/**
 * Rows arrive newest-first from the database, so filtering in memory yields a
 * *bounded* recent list (never the whole table) while the total stays exact.
 */
function buildRecentLeads(rows: NormalizedLead[], now: Date): RecentLead[] {
  const cutoff = now.getTime() - RECENT_LEAD_WINDOW_DAYS * 24 * 60 * 60 * 1000
  const recent: RecentLead[] = []

  for (const row of rows) {
    if (recent.length >= RECENT_LIMIT) break
    const parsed = toDate(row.createdAt)
    if (!parsed || parsed.getTime() < cutoff) continue
    recent.push({
      id: row.id,
      name: row.name,
      service: row.service,
      status: row.status,
      statusLabel: leadStatusLabel(row.status),
      createdAt: row.createdAt ?? now.toISOString(),
    })
  }

  return recent
}

/**
 * `contacts` is created outside the repo's migrations, so `status` may not exist
 * in every environment. A column-safe retry keeps the section alive.
 */
async function fetchContactsLeads(session: SupabaseClient) {
  const withStatus = await fetchPaged<ContactLeadRow>((from, to) =>
    session
      .from('contacts')
      .select('id, name, service, status, created_at')
      .order('created_at', { ascending: false })
      .range(from, to)
  )

  if (!withStatus.error && withStatus.data) return withStatus

  return fetchPaged<ContactLeadRow>((from, to) =>
    session
      .from('contacts')
      .select('id, name, service, created_at')
      .order('created_at', { ascending: false })
      .range(from, to)
  )
}

/**
 * Lead source priority mirrors the existing /admin/leads module: the website
 * contact form (`contacts`) first, then the Puri chat assistant (`chat_leads`).
 * Exactly one source is used so a lead is never double counted.
 *
 * The total is a real paged count over the entire lead table — never limited to
 * the rows rendered in the recent list.
 *
 * `chat_leads` uses the real columns (`name`, `service_interest`) and is read
 * through the server-only service-role client because its RLS state is
 * unverified for admins: an admin-session read can silently return zero rows,
 * which would be reported as "0 leads" — a lie.
 */
async function fetchLeads(
  session: SupabaseClient,
  privileged: SupabaseClient | null,
  now: Date
): Promise<LeadsResult> {
  const contactsRes = await fetchContactsLeads(session)

  if (!contactsRes.error && contactsRes.data && contactsRes.data.length > 0) {
    return toLeadsResult(
      'contacts',
      contactsRes.data.map((row, index) => ({
        id: String(row.id ?? index),
        name: (row.name || '').trim() || 'Unnamed enquiry',
        service: row.service,
        status: row.status ?? null,
        createdAt: row.created_at ?? now.toISOString(),
      })),
      now
    )
  }

  const chatClient = privileged ?? session
  const chatRes = await fetchPaged<ChatLeadRow>((from, to) =>
    chatClient
      .from('chat_leads')
      .select('id, name, service_interest, status, created_at')
      .order('created_at', { ascending: false })
      .range(from, to)
  )

  if (!chatRes.error && chatRes.data) {
    return toLeadsResult(
      'chat_leads',
      chatRes.data.map((row, index) => ({
        id: String(row.id ?? index),
        name: (row.name || '').trim() || 'Unnamed enquiry',
        service: row.service_interest,
        status: row.status,
        createdAt: row.created_at ?? now.toISOString(),
      })),
      now
    )
  }

  // Both sources failed — report honestly instead of showing "0 leads".
  console.error('[admin-dashboard] leads unavailable:', contactsRes.error, chatRes.error)
  return { data: EMPTY_LEADS, createdAt: [] }
}

/* -------------------------------------------------------------------------- */
/* Finance — invoices only                                                    */
/* -------------------------------------------------------------------------- */

const EMPTY_FINANCE: FinanceData = {
  status: 'unavailable',
  paidCount: 0,
  pendingCount: 0,
  overdueCount: 0,
  cancelledCount: 0,
  outstanding: [],
  paidThisMonth: [],
  collected: [],
  invoiced: [],
  overdueInvoices: [],
}

/**
 * Invoice aggregation, always per currency: NGN/USD/GBP are never summed into a
 * single meaningless total and no invented exchange rate is applied.
 *
 * "Overdue" is derived (unpaid + past due date, or an explicit 'overdue'
 * status). Invoice rows are never mutated just to display overdue state.
 *
 * `payments` and `transactions` are intentionally NOT queried — their RLS state
 * is unverified, and the existing protected APIs expose no aggregate that this
 * dashboard could reuse safely.
 */
async function fetchFinance(
  session: SupabaseClient,
  privileged: SupabaseClient | null,
  now: Date
): Promise<FinanceData> {
  const primary = privileged ?? session
  const query = (client: SupabaseClient) =>
    fetchPaged<InvoiceRow>((from, to) =>
      client
      .from('invoices')
      .select('id, amount, currency, status, due_date, paid_at, created_at')
      .order('created_at', { ascending: false })
      .range(from, to)
    )

  let paged = await query(primary)
  if ((paged.error || !paged.data) && primary !== session) {
    const fallback = await query(session)
    if (!fallback.error && fallback.data) paged = fallback
    else {
      console.error('[admin-dashboard] invoices unavailable:', {
        privileged: paged.error,
        session: fallback.error,
      })
      return EMPTY_FINANCE
    }
  }

  if (paged.error || !paged.data) {
    console.error('[admin-dashboard] invoices unavailable:', paged.error)
    return EMPTY_FINANCE
  }

  const monthStart = startOfMonth(now)
  const outstandingTotals = new Map<string, number>()
  const paidTotals = new Map<string, number>()
  const collectedTotals = new Map<string, number>()
  const invoicedTotals = new Map<string, number>()
  const overdueInvoices: OverdueInvoice[] = []

  let paidCount = 0
  let pendingCount = 0
  let overdueCount = 0
  let cancelledCount = 0

  paged.data.forEach((row, index) => {
    const status = (row.status || '').trim().toLowerCase()
    const amount = toAmount(row.amount)
    const currency = (row.currency || 'NGN').toUpperCase()
    const isPaid = status === 'paid' || Boolean(row.paid_at)
    const isCancelled = status === 'cancelled'
    const dueDate = toDate(row.due_date)
    const isOverdue =
      !isPaid &&
      !isCancelled &&
      (status === 'overdue' || Boolean(dueDate && dueDate.getTime() < now.getTime()))

    if (isCancelled) {
      cancelledCount += 1
      return
    }

    // Every non-cancelled invoice contributes to the invoiced total, whether
    // or not it has been settled.
    addToTotals(invoicedTotals, currency, amount)

    if (isPaid) {
      paidCount += 1
      addToTotals(collectedTotals, currency, amount)
      const paidAt = toDate(row.paid_at) ?? toDate(row.created_at)
      if (paidAt && paidAt >= monthStart) addToTotals(paidTotals, currency, amount)
      return
    }

    addToTotals(outstandingTotals, currency, amount)

    if (isOverdue) {
      overdueCount += 1
      overdueInvoices.push({
        id: row.id ?? String(index),
        amount,
        currency,
        dueDate: row.due_date,
        daysOverdue: dueDate ? Math.max(0, daysBetween(dueDate, now)) : 0,
      })
      return
    }

    pendingCount += 1
  })

  overdueInvoices.sort((a, b) => b.daysOverdue - a.daysOverdue || b.amount - a.amount)

  return {
    status: 'ok',
    paidCount,
    pendingCount,
    overdueCount,
    cancelledCount,
    outstanding: toCurrencyTotals(outstandingTotals),
    paidThisMonth: toCurrencyTotals(paidTotals),
    collected: toCurrencyTotals(collectedTotals),
    invoiced: toCurrencyTotals(invoicedTotals),
    overdueInvoices: overdueInvoices.slice(0, 5),
  }
}

/* -------------------------------------------------------------------------- */
/* Clients                                                                    */
/* -------------------------------------------------------------------------- */

type ClientsResult = { data: ClientsData }

const EMPTY_CLIENTS: ClientsData = {
  status: 'unavailable',
  totalClients: 0,
  newThisMonth: 0,
  newLastMonth: 0,
  growth: [],
  recent: [],
}

function monthKeyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Builds the growth series for the trailing GROWTH_MONTHS window. Months with
 * no signups legitimately report 0 — they are not back-filled with invented
 * values, and no percentage growth is fabricated anywhere.
 */
function buildClientGrowth(rows: ProfileRow[], now: Date): ClientGrowthPoint[] {
  const buckets = new Map<string, number>()
  const start = startOfMonthsAgo(now, GROWTH_MONTHS - 1)

  for (let index = 0; index < GROWTH_MONTHS; index += 1) {
    const month = new Date(start.getFullYear(), start.getMonth() + index, 1)
    buckets.set(monthKeyOf(month), 0)
  }

  rows.forEach((row) => {
    const created = toDate(row.created_at)
    if (!created || created < start) return
    const key = monthKeyOf(created)
    if (!buckets.has(key)) return
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  })

  return Array.from(buckets.entries()).map(([month, clients]) => {
    const [year, monthIndex] = month.split('-').map(Number)
    return {
      month,
      label: `${MONTH_LABELS[monthIndex - 1]} ${String(year).slice(2)}`,
      clients,
    }
  })
}

/**
 * Client records come from `profiles` (role = 'client'). The privileged server
 * client is used when available so the count is exact — the dashboard must not
 * silently report a smaller number than reality if a policy is missing.
 */
async function fetchClients(
  session: SupabaseClient,
  privileged: SupabaseClient | null,
  now: Date
): Promise<ClientsResult> {
  const primary = privileged ?? session

  const query = (client: SupabaseClient) =>
    fetchPaged<ProfileRow>((from, to) =>
      client
        .from('profiles')
        .select('id, full_name, email, created_at')
        .eq('role', 'client')
        .order('created_at', { ascending: false })
        .range(from, to)
    )

  let result = await query(primary)
  if ((result.error || !result.data) && primary !== session) result = await query(session)

  if (result.error || !result.data) {
    console.error('[admin-dashboard] clients unavailable:', result.error)
    return { data: EMPTY_CLIENTS }
  }

  const rows = result.data
  const thisMonthStart = startOfMonth(now)
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const lastMonthStart = startOfMonthsAgo(now, 1)
  const createdDates = rows.map((row) => row.created_at)

  return {
    data: {
      status: 'ok',
      totalClients: rows.length,
      newThisMonth: countInWindow(createdDates, thisMonthStart, nextMonthStart),
      newLastMonth: countInWindow(createdDates, lastMonthStart, thisMonthStart),
      growth: buildClientGrowth(rows, now),
      recent: rows.slice(0, RECENT_LIMIT).map((row, index) => ({
        id: row.id ?? String(index),
        name: (row.full_name || '').trim() || 'Unnamed client',
        email: row.email ?? null,
        createdAt: row.created_at ?? now.toISOString(),
      })),
    },
  }
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

type ProjectsResult = { data: ProjectsData }

const EMPTY_PROJECTS: ProjectsData = {
  status: 'unavailable',
  total: 0,
  active: 0,
  byStatus: [],
  upcomingDeadlines: [],
}

/**
 * Statuses are taken from the projects module itself — no project state is
 * invented. Only statuses that actually occur in the data are returned, and
 * "Active" means any project that is not completed/cancelled.
 *
 * Deadlines are only reported when `end_date` genuinely exists; the section is
 * omitted rather than fabricated when it does not.
 */
async function fetchProjects(
  session: SupabaseClient,
  privileged: SupabaseClient | null,
  now: Date
): Promise<ProjectsResult> {
  const primary = privileged ?? session
  const query = (client: SupabaseClient) =>
    fetchPaged<ProjectRow>((from, to) =>
      client
      .from('projects')
      .select('id, title, status, end_date, created_at')
      .order('created_at', { ascending: false })
      .range(from, to)
    )

  let paged = await query(primary)
  if ((paged.error || !paged.data) && primary !== session) {
    const fallback = await query(session)
    if (!fallback.error && fallback.data) paged = fallback
    else {
      console.error('[admin-dashboard] projects unavailable:', {
        privileged: paged.error,
        session: fallback.error,
      })
      return { data: EMPTY_PROJECTS }
    }
  }

  if (paged.error || !paged.data) {
    console.error('[admin-dashboard] projects unavailable:', paged.error)
    return { data: EMPTY_PROJECTS }
  }

  const rows = paged.data
  const counts = new Map<string, number>()

  rows.forEach((row) => {
    const key = (row.status || 'pending').trim().toLowerCase() || 'pending'
    counts.set(key, (counts.get(key) ?? 0) + 1)
  })

  const orderedStatuses = [
    ...PROJECT_STATUS_ORDER.filter((status) => counts.has(status)),
    ...Array.from(counts.keys()).filter((status) => !PROJECT_STATUS_ORDER.includes(status)),
  ]

  const horizon = addDays(now, DEADLINE_HORIZON_DAYS)

  const deadlines: ProjectDeadline[] = rows
    .map((row, index) => {
      const status = (row.status || 'pending').trim().toLowerCase()
      const due = toDate(row.end_date)
      if (!due || CLOSED_PROJECT_STATUSES.has(status)) return null
      if (due.getTime() < now.getTime() || due.getTime() > horizon.getTime()) return null
      return {
        id: row.id ?? String(index),
        title: (row.title || '').trim() || 'Untitled project',
        dueDate: row.end_date as string,
        daysUntil: Math.max(0, daysBetween(now, due)),
        status,
        statusLabel: projectStatusLabel(status),
      }
    })
    .filter((item): item is ProjectDeadline => item !== null)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5)

  const active = rows.filter(
    (row) => !CLOSED_PROJECT_STATUSES.has((row.status || '').trim().toLowerCase())
  ).length

  return {
    data: {
      status: 'ok',
      total: rows.length,
      active,
      byStatus: orderedStatuses.map((status) => ({
        status,
        label: projectStatusLabel(status),
        count: counts.get(status) ?? 0,
      })),
      upcomingDeadlines: deadlines,
    },
  }
}

/* -------------------------------------------------------------------------- */
/* Recent activity — reuses the existing notifications table                  */
/* -------------------------------------------------------------------------- */

const EMPTY_ACTIVITY: ActivityData = { status: 'unavailable', items: [] }

/**
 * The activity feed intentionally reuses the real `notifications` rows that the
 * existing Realtime NotificationBell already consumes (same table, same
 * `admin_id` scoping, same types). No parallel activity-log system is invented,
 * and NotificationBell's business logic is untouched.
 *
 * Bounded to a small window — this is a "recent activity" list, not an audit log.
 */
async function fetchActivity(
  session: SupabaseClient,
  privileged: SupabaseClient | null,
  adminId: string
): Promise<ActivityData> {
  const primary = privileged ?? session
  const query = (client: SupabaseClient) =>
    client
      .from('notifications')
      .select('id, title, message, type, created_at')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false })
      .limit(RECENT_LIMIT)

  let result = await query(primary)
  if ((result.error || !result.data) && primary !== session) {
    const fallback = await query(session)
    if (!fallback.error && fallback.data) result = fallback
    else {
      console.error('[admin-dashboard] activity unavailable:', {
        privileged: result.error,
        session: fallback.error,
      })
      return EMPTY_ACTIVITY
    }
  }

  if (result.error || !result.data) {
    console.error('[admin-dashboard] activity unavailable:', result.error)
    return EMPTY_ACTIVITY
  }

  return {
    status: 'ok',
    items: (result.data as NotificationRow[]).map((row) => ({
      id: String(row.id),
      title: (row.title || '').trim() || 'Notification',
      message: (row.message || '').trim(),
      type: (row.type || 'general').trim() || 'general',
      createdAt: row.created_at ?? new Date().toISOString(),
    })),
  }
}

/* -------------------------------------------------------------------------- */
/* Needs attention — deterministic rules only                                 */
/* -------------------------------------------------------------------------- */

const SEVERITY_RANK: Record<AttentionItem['severity'], number> = {
  critical: 0,
  warning: 1,
  info: 2,
}

/** Short, stable invoice reference for the attention list. */
function invoiceRef(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`
}

function deadlinePhrase(daysUntil: number): string {
  if (daysUntil <= 0) return 'is due today'
  if (daysUntil === 1) return 'is due tomorrow'
  return `is due in ${daysUntil} days`
}

type AttentionInput = {
  finance: FinanceData
  projects: ProjectsData
  leads: LeadsData
  recoveryPending: number | null
  draftPosts: number | null
}

/**
 * Every rule below is a deterministic calculation over data already fetched for
 * this page. No AI, no scoring heuristics, no invented urgency wording.
 *
 * A rule is skipped entirely when its source data is unavailable, so a failed
 * query produces a shorter honest list rather than a wrong one.
 */
function buildAttention(input: AttentionInput): AttentionData {
  const items: AttentionItem[] = []

  input.finance.overdueInvoices.forEach((invoice) => {
    items.push({
      id: `invoice-overdue-${invoice.id}`,
      kind: 'invoice',
      title: `Invoice ${invoiceRef(invoice.id)} is overdue by ${invoice.daysOverdue} ${
        invoice.daysOverdue === 1 ? 'day' : 'days'
      }`,
      description: `${formatCurrencyAmount(invoice.amount, invoice.currency)} outstanding`,
      href: '/admin/invoices',
      severity: 'critical',
    })
  })

  input.projects.upcomingDeadlines.forEach((deadline) => {
    items.push({
      id: `project-deadline-${deadline.id}`,
      kind: 'project',
      title: `“${deadline.title}” ${deadlinePhrase(deadline.daysUntil)}`,
      description: `${deadline.statusLabel} project`,
      href: '/admin/projects',
      severity: deadline.daysUntil <= 7 ? 'warning' : 'info',
    })
  })

  if (input.leads.status === 'ok' && input.leads.newCount > 0) {
    items.push({
      id: 'leads-uncontacted',
      kind: 'lead',
      title: `${input.leads.newCount} ${
        input.leads.newCount === 1 ? 'lead has' : 'leads have'
      } not been contacted`,
      description: `From ${leadSourceLabel(input.leads.source)}`,
      href: '/admin/leads',
      severity: 'info',
    })
  }

  if (input.recoveryPending !== null && input.recoveryPending > 0) {
    items.push({
      id: 'recovery-pending',
      kind: 'recovery',
      title: `${input.recoveryPending} account recovery ${
        input.recoveryPending === 1 ? 'request is' : 'requests are'
      } still open`,
      description: 'Awaiting review or completion',
      href: '/admin/recovery',
      severity: 'info',
    })
  }

  if (input.draftPosts !== null && input.draftPosts > 0) {
    items.push({
      id: 'content-drafts',
      kind: 'content',
      title: `${input.draftPosts} blog ${
        input.draftPosts === 1 ? 'post is' : 'posts are'
      } still in draft`,
      description: 'Not visible on the public site yet',
      href: '/admin/blog',
      severity: 'info',
    })
  }

  const sorted = items.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])

  return {
    items: sorted.slice(0, ATTENTION_CAP),
    truncated: sorted.length > ATTENTION_CAP,
  }
}

/* -------------------------------------------------------------------------- */
/* Context counts (recovery queue, subscribers, drafts)                       */
/* -------------------------------------------------------------------------- */

/**
 * Recovery requests are "open" when they have no status yet, an explicit
 * 'pending' status, or the schema default 'pending_payment'. Those are the only
 * values the recovery module treats as pending — no other state is invented.
 */
async function fetchRecoveryPending(supabase: SupabaseClient): Promise<number | null> {
  const paged = await fetchPaged<{ status: string | null }>((from, to) =>
    supabase.from('account_recovery_requests').select('status').range(from, to)
  )

  if (paged.error || !paged.data) {
    console.error('[admin-dashboard] recovery unavailable:', paged.error)
    return null
  }

  return paged.data.reduce((total, row) => {
    const status = (row.status || '').trim().toLowerCase()
    return status === '' || status === 'pending' || status === 'pending_payment'
      ? total + 1
      : total
  }, 0)
}

/** Counts blog posts still in draft (the only non-published status in the schema). */
async function countBlogDrafts(supabase: SupabaseClient): Promise<number | null> {
  const { count, error } = await supabase
    .from('blog_posts')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'draft')

  if (error) {
    console.error('[admin-dashboard] blog drafts unavailable:', error.message)
    return null
  }
  return safeCount(count)
}

/* -------------------------------------------------------------------------- */
/* PurpleSoftHub Insights — deterministic, no generative AI                   */
/* -------------------------------------------------------------------------- */

type InsightsInput = {
  clients: ClientsData
  projects: ProjectsData
  leads: LeadsData
  finance: FinanceData
}

/**
 * Every statement is a plain calculation over data already fetched for this
 * page. Nothing here calls an AI service, and a statement is only emitted when
 * the section it depends on actually loaded.
 */
function buildInsights(input: InsightsInput): BusinessInsight[] {
  const insights: BusinessInsight[] = []

  if (input.finance.status === 'ok' && input.finance.overdueCount > 0) {
    insights.push({
      id: 'insight-overdue',
      text: `${input.finance.overdueCount} ${
        input.finance.overdueCount === 1 ? 'invoice is' : 'invoices are'
      } currently overdue.`,
    })
  }

  if (input.finance.status === 'ok' && input.finance.outstanding.length > 0) {
    const outstandingText = input.finance.outstanding
      .map((total) => formatCurrencyAmount(total.amount, total.currency))
      .join(' + ')
    insights.push({
      id: 'insight-outstanding',
      text: `${outstandingText} outstanding across ${
        input.finance.pendingCount + input.finance.overdueCount
      } unpaid invoices.`,
    })
  }

  if (input.clients.status === 'ok' && input.clients.newThisMonth > 0) {
    insights.push({
      id: 'insight-new-clients',
      text: `${input.clients.newThisMonth} new ${
        input.clients.newThisMonth === 1 ? 'client' : 'clients'
      } joined this month.`,
    })
  }

  if (input.leads.status === 'ok') {
    const topService = input.leads.topServices.find((row) => row.label !== 'Not specified')
    if (topService) {
      insights.push({
        id: 'insight-top-service',
        text: `${topService.label} is the most requested service among leads (${topService.count}).`,
      })
    }
  }

  if (input.projects.status === 'ok' && input.projects.upcomingDeadlines.length > 0) {
    insights.push({
      id: 'insight-deadlines',
      text: `${input.projects.upcomingDeadlines.length} active ${
        input.projects.upcomingDeadlines.length === 1 ? 'project has' : 'projects have'
      } a deadline in the next ${DEADLINE_HORIZON_DAYS} days.`,
    })
  }

  if (input.leads.status === 'ok' && input.leads.newCount > 0) {
    insights.push({
      id: 'insight-open-leads',
      text: `${input.leads.newCount} ${
        input.leads.newCount === 1 ? 'lead is' : 'leads are'
      } awaiting first contact.`,
    })
  }

  return insights.slice(0, 5)
}

/* -------------------------------------------------------------------------- */
/* Public entry point                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Loads everything the Admin Overview needs, server-side.
 *
 * CALLER CONTRACT: only call this from an authenticated admin context
 * (`getAuthenticatedProfile()` / `requireAdmin()`). It performs no authorization
 * of its own — `app/admin/layout.tsx` remains the authoritative gate.
 *
 * Failure isolation: each section is fetched independently and degrades to
 * `status: 'unavailable'` on its own. One failing table never blanks the page
 * and never produces a fabricated number.
 */
export async function getAdminDashboardData(adminId: string): Promise<AdminDashboardData> {
  const now = new Date()
  const session = await createSessionClient()
  const privileged = createServiceRoleClient()
  const countClient = privileged ?? session

  const [clientsResult, projectsResult, leadsResult, finance, activity] = await Promise.all([
    fetchClients(session, privileged, now),
    fetchProjects(session, privileged, now),
    fetchLeads(session, privileged, now),
    fetchFinance(session, privileged, now),
    fetchActivity(session, privileged, adminId),
  ])

  const [subscribers, recoveryPending, draftPosts] = await Promise.all([
    countRows(countClient, 'newsletter_subscribers'),
    fetchRecoveryPending(countClient),
    countBlogDrafts(countClient),
  ])

  const clients = clientsResult.data
  const projects = projectsResult.data
  const leads = leadsResult.data

  const overview: OverviewData = {
    totalClients: clients.status === 'ok' ? clients.totalClients : null,
    newClientsThisMonth: clients.status === 'ok' ? clients.newThisMonth : null,
    activeProjects: projects.status === 'ok' ? projects.active : null,
    totalProjects: projects.status === 'ok' ? projects.total : null,
    totalLeads: leads.status === 'ok' ? leads.total : null,
    newLeads: leads.status === 'ok' ? leads.newCount : null,
    outstandingInvoiceCount:
      finance.status === 'ok' ? finance.pendingCount + finance.overdueCount : null,
    outstanding: finance.outstanding,
    paidThisMonth: finance.paidThisMonth,
    overdueCount: finance.status === 'ok' ? finance.overdueCount : null,
    subscribers,
    recoveryPending,
  }

  return {
    generatedAt: now.toISOString(),
    overview,
    clients,
    projects,
    leads,
    finance,
    recentActivity: activity,
    attention: buildAttention({ finance, projects, leads, recoveryPending, draftPosts }),
    insights: buildInsights({ clients, projects, leads, finance }),
  }
}
