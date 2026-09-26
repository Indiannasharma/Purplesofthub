"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpRight, Globe2, Mail, Users } from "lucide-react";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminErrorState } from "@/components/admin/AdminErrorState";
import { AdminLoadingState } from "@/components/admin/AdminLoadingState";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { createClient } from "@/lib/supabase/client";

type Client = { id: string; full_name: string | null; email: string | null; country: string | null; avatar_url: string | null; created_at: string };
type SortMode = "newest" | "oldest" | "name";

function initials(value: string | null) { return (value || "?").split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase(); }
function joinedAt(value: string) { return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)); }

export default function ClientsPage() {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<SortMode>("newest");

  const loadClients = React.useCallback(async () => {
    setLoading(true); setError(null);
    const { data, error: queryError } = await createClient().from("profiles").select("id, full_name, email, country, avatar_url, created_at").order("created_at", { ascending: false });
    if (queryError) { setError("We couldn’t load the client directory. Your access may have changed."); setClients([]); }
    else setClients((data || []) as Client[]);
    setLoading(false);
  }, []);

  React.useEffect(() => { void loadClients(); }, [loadClients]);

  const stats = React.useMemo(() => {
    const now = new Date();
    const countries = new Set(clients.map((client) => client.country).filter(Boolean));
    return { total: clients.length, joinedThisMonth: clients.filter((client) => { const date = new Date(client.created_at); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); }).length, countries: countries.size };
  }, [clients]);

  const visibleClients = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = clients.filter((client) => !term || [client.full_name, client.email, client.country].some((field) => field?.toLowerCase().includes(term)));
    return result.sort((a, b) => sort === "name" ? (a.full_name || a.email || "").localeCompare(b.full_name || b.email || "") : sort === "oldest" ? +new Date(a.created_at) - +new Date(b.created_at) : +new Date(b.created_at) - +new Date(a.created_at));
  }, [clients, search, sort]);

  const columns = React.useMemo<ColumnDef<Client, unknown>[]>(() => [
    { id: "client", header: "Client", accessorFn: (row) => row.full_name || row.email || "Unknown", cell: ({ row }) => <div className="cc-client-identity"><span className="cc-avatar">{initials(row.original.full_name || row.original.email)}</span><span>{row.original.full_name || "Unnamed client"}</span></div> },
    { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email || <span className="text-[var(--cc-text-muted)]">Not provided</span> },
    { accessorKey: "country", header: "Location", cell: ({ row }) => row.original.country || <span className="text-[var(--cc-text-muted)]">Not provided</span> },
    { accessorKey: "created_at", header: "Joined", cell: ({ row }) => joinedAt(row.original.created_at) },
    { id: "action", header: "", enableSorting: false, cell: ({ row }) => <Link className="cc-link inline-flex items-center gap-1" href={`/admin/clients/${row.original.id}`}>View <ArrowUpRight size={14} aria-hidden="true" /></Link> },
  ], []);

  return <AdminPage className="cc-module">
    <AdminPageHeader title="Clients" description="Your registered client directory and account records." breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Clients" }]} />
    {loading ? <AdminLoadingState /> : error ? <AdminErrorState description={error} onRetry={() => void loadClients()} /> : <>
      <section className="cc-summary-grid" aria-label="Client summary">
        <div className="cc-summary-item"><span>Total clients</span><strong className="cc-tnum">{stats.total}</strong></div>
        <div className="cc-summary-item"><span>Joined this month</span><strong className="cc-tnum">{stats.joinedThisMonth}</strong></div>
        <div className="cc-summary-item"><span>Countries represented</span><strong className="cc-tnum">{stats.countries}</strong></div>
      </section>
      <AdminToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search name, email, or country">
        <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} aria-label="Sort clients"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name">Name A–Z</option></select>
      </AdminToolbar>
      {visibleClients.length ? <AdminDataTable data={visibleClients} columns={columns} getRowId={(client) => client.id} mobileCard={(client) => <article className="cc-client-card"><header><div className="cc-client-identity"><span className="cc-avatar">{initials(client.full_name || client.email)}</span><span>{client.full_name || "Unnamed client"}</span></div><Link className="cc-link" href={`/admin/clients/${client.id}`}>View</Link></header><p><Mail className="mr-1 inline" size={13} aria-hidden="true" />{client.email || "No email recorded"}</p><p><Globe2 className="mr-1 inline" size={13} aria-hidden="true" />{client.country || "Location not provided"} · Joined {joinedAt(client.created_at)}</p></article>} /> : <AdminEmptyState icon={Users} title={search ? "No matching clients" : "No clients yet"} description={search ? "Try a different name, email, or location." : "Clients will appear here when accounts are registered."} />}
    </>}
  </AdminPage>;
}
