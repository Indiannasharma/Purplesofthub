"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Mail, MessageSquareText, Phone, UserPlus } from "lucide-react";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminErrorState } from "@/components/admin/AdminErrorState";
import { AdminLoadingState } from "@/components/admin/AdminLoadingState";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { createClient } from "@/lib/supabase/client";

type LeadSource = "contacts" | "chat_leads";
type StatusFilter = "all" | "new" | "contacted" | "converted" | "lost" | "unknown";

type Lead = {
  id: string;
  source: LeadSource;
  name: string;
  email: string | null;
  phone: string | null;
  service: string | null;
  message: string | null;
  created_at: string;
  status: string | null;
};

type ContactLeadRow = {
  id: string | number;
  name: string | null;
  email: string | null;
  phone?: string | null;
  service?: string | null;
  message?: string | null;
  created_at: string | null;
  status?: string | null;
};

type ChatLeadRow = {
  id: string | number;
  name: string | null;
  email: string | null;
  phone: string | null;
  service_interest: string | null;
  message: string | null;
  created_at: string | null;
  status: string | null;
};

function initials(value: string | null) {
  return (value || "?")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeStatus(value: string | null): StatusFilter {
  const status = (value || "").trim().toLowerCase();
  if (status === "new" || status === "contacted" || status === "converted" || status === "lost") {
    return status;
  }
  return "unknown";
}

function isAwaitingContact(value: string | null) {
  const status = normalizeStatus(value);
  return status === "new" || status === "unknown";
}

function leadSourceLabel(source: LeadSource) {
  return source === "contacts" ? "Contact form" : "Puri chat";
}

function toWhatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

function contactToLead(row: ContactLeadRow, index: number): Lead {
  return {
    id: `contacts-${row.id ?? index}`,
    source: "contacts",
    name: (row.name || "").trim() || "Unnamed lead",
    email: row.email || null,
    phone: row.phone || null,
    service: row.service || null,
    message: row.message || null,
    created_at: row.created_at || new Date().toISOString(),
    status: row.status ?? null,
  };
}

function chatToLead(row: ChatLeadRow, index: number): Lead {
  return {
    id: `chat-${row.id ?? index}`,
    source: "chat_leads",
    name: (row.name || "").trim() || "Unnamed lead",
    email: row.email || null,
    phone: row.phone || null,
    service: row.service_interest || null,
    message: row.message || null,
    created_at: row.created_at || new Date().toISOString(),
    status: row.status,
  };
}

async function fetchContactLeads() {
  const supabase = createClient();
  const withStatus = await supabase
    .from("contacts")
    .select("id, name, email, phone, service, message, status, created_at")
    .order("created_at", { ascending: false });

  if (!withStatus.error) return withStatus;

  return supabase
    .from("contacts")
    .select("id, name, email, phone, service, message, created_at")
    .order("created_at", { ascending: false });
}

async function fetchChatLeads() {
  return createClient()
    .from("chat_leads")
    .select("id, name, email, phone, service_interest, message, status, created_at")
    .order("created_at", { ascending: false });
}

export default function LeadsPage() {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = React.useState<"all" | LeadSource>("all");

  const loadLeads = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const [contactsResult, chatResult] = await Promise.all([fetchContactLeads(), fetchChatLeads()]);
    const contactRows = !contactsResult.error && contactsResult.data ? contactsResult.data : [];
    const chatRows = !chatResult.error && chatResult.data ? chatResult.data : [];

    if (contactsResult.error && chatResult.error) {
      setLeads([]);
      setError("We could not load the lead pipeline. Your access may have changed.");
    } else {
      setLeads([
        ...(contactRows as ContactLeadRow[]).map(contactToLead),
        ...(chatRows as ChatLeadRow[]).map(chatToLead),
      ].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)));
    }

    setLoading(false);
  }, []);

  React.useEffect(() => {
    // Existing client-side Supabase load pattern for admin module pages.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadLeads();
  }, [loadLeads]);

  const stats = React.useMemo(() => {
    const today = new Date();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    return {
      total: leads.length,
      newToday: leads.filter((lead) => new Date(lead.created_at).toDateString() === today.toDateString()).length,
      awaitingContact: leads.filter((lead) => isAwaitingContact(lead.status)).length,
      thisWeek: leads.filter((lead) => new Date(lead.created_at) >= weekStart).length,
    };
  }, [leads]);

  const visibleLeads = React.useMemo(() => {
    const term = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesSearch =
        !term ||
        [lead.name, lead.email, lead.phone, lead.service, lead.message].some((field) =>
          field?.toLowerCase().includes(term)
        );
      const matchesStatus =
        statusFilter === "all" ? true : normalizeStatus(lead.status) === statusFilter;
      const matchesSource = sourceFilter === "all" ? true : lead.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [leads, search, sourceFilter, statusFilter]);

  const columns = React.useMemo<ColumnDef<Lead, unknown>[]>(
    () => [
      {
        id: "lead",
        header: "Lead",
        accessorFn: (row) => row.name,
        cell: ({ row }) => (
          <div className="cc-client-identity">
            <span className="cc-avatar">{initials(row.original.name || row.original.email)}</span>
            <span className="grid min-w-0 gap-0.5">
              <span className="truncate">{row.original.name}</span>
              <span className="truncate text-xs font-normal text-[var(--cc-text-muted)]">
                {row.original.email || "No email recorded"}
              </span>
            </span>
          </div>
        ),
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => leadSourceLabel(row.original.source),
      },
      {
        accessorKey: "service",
        header: "Service",
        cell: ({ row }) =>
          row.original.service || <span className="text-[var(--cc-text-muted)]">General enquiry</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <AdminStatusBadge status={row.original.status || "new"} />,
      },
      {
        accessorKey: "created_at",
        header: "Received",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.email ? (
              <a className="cc-link" href={`mailto:${row.original.email}`}>
                Email
              </a>
            ) : null}
            {row.original.phone && toWhatsappHref(row.original.phone) ? (
              <a
                className="cc-link"
                href={toWhatsappHref(row.original.phone) ?? undefined}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            ) : null}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <AdminPage className="cc-module">
      <AdminPageHeader
        title="Leads"
        description="Contact-form and Puri chat enquiries, ready for follow-up."
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Leads" }]}
      />

      {loading ? (
        <AdminLoadingState />
      ) : error ? (
        <AdminErrorState description={error} onRetry={() => void loadLeads()} />
      ) : (
        <>
          <section className="cc-summary-grid" aria-label="Lead summary">
            <div className="cc-summary-item">
              <span>Total leads</span>
              <strong className="cc-tnum">{stats.total}</strong>
            </div>
            <div className="cc-summary-item">
              <span>New today</span>
              <strong className="cc-tnum">{stats.newToday}</strong>
            </div>
            <div className="cc-summary-item">
              <span>Awaiting contact</span>
              <strong className="cc-tnum">{stats.awaitingContact}</strong>
            </div>
          </section>

          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search name, email, phone, service, or message"
          >
            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value as "all" | LeadSource)}
              aria-label="Filter lead source"
            >
              <option value="all">All sources</option>
              <option value="contacts">Contact form</option>
              <option value="chat_leads">Puri chat</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              aria-label="Filter lead status"
            >
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
              <option value="unknown">Unknown</option>
            </select>
          </AdminToolbar>

          {visibleLeads.length ? (
            <AdminDataTable
              data={visibleLeads}
              columns={columns}
              getRowId={(lead) => lead.id}
              mobileCard={(lead) => (
                <article className="cc-client-card">
                  <header>
                    <div className="cc-client-identity">
                      <span className="cc-avatar">{initials(lead.name || lead.email)}</span>
                      <span className="grid min-w-0 gap-0.5">
                        <span className="truncate">{lead.name}</span>
                        <span className="truncate text-xs font-normal text-[var(--cc-text-muted)]">
                          {leadSourceLabel(lead.source)}
                        </span>
                      </span>
                    </div>
                    <AdminStatusBadge status={lead.status || "new"} />
                  </header>

                  <p>
                    <Mail className="mr-1 inline" size={13} aria-hidden="true" />
                    {lead.email || "No email recorded"}
                  </p>
                  {lead.phone ? (
                    <p>
                      <Phone className="mr-1 inline" size={13} aria-hidden="true" />
                      {lead.phone}
                    </p>
                  ) : null}
                  <p>
                    <MessageSquareText className="mr-1 inline" size={13} aria-hidden="true" />
                    {lead.service || "General enquiry"} · {formatDate(lead.created_at)}
                  </p>
                  {lead.message ? <p>{lead.message}</p> : null}
                </article>
              )}
            />
          ) : (
            <AdminEmptyState
              icon={UserPlus}
              title={search || statusFilter !== "all" || sourceFilter !== "all" ? "No matching leads" : "No leads yet"}
              description={
                search || statusFilter !== "all" || sourceFilter !== "all"
                  ? "Try a different search, source, or status filter."
                  : "Contact-form and Puri chat leads will appear here when prospects reach out."
              }
            />
          )}
        </>
      )}
    </AdminPage>
  );
}
