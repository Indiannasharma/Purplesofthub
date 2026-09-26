"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Globe2, Mail, ReceiptText, UserRound } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminDetailHeader } from "@/components/admin/AdminDetailHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminErrorState } from "@/components/admin/AdminErrorState";
import { AdminLoadingState } from "@/components/admin/AdminLoadingState";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { createClient } from "@/lib/supabase/client";

type Client = { id: string; full_name: string | null; email: string | null; country: string | null; avatar_url: string | null; created_at: string };
type Transaction = { id: string; amount: number | null; status: string | null; created_at: string; service_name: string | null };
const initial = (value: string | null) => (value || "?").split(" ").map((item) => item[0]).join("").slice(0, 2).toUpperCase();
const date = (value: string) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const clientId = params?.id;
  const [client, setClient] = React.useState<Client | null>(null);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!clientId) return;
    setLoading(true); setError(null);
    const supabase = createClient();
    const [{ data: clientData, error: clientError }, { data: transactionData, error: transactionError }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, country, avatar_url, created_at").eq("id", clientId).single(),
      supabase.from("transactions").select("id, amount, status, created_at, service_name").eq("user_id", clientId).order("created_at", { ascending: false }),
    ]);
    if (clientError || !clientData) { setClient(null); setTransactions([]); setError(clientError?.code === "PGRST116" ? "Client not found" : "We couldn’t load this client record."); }
    else if (transactionError) { setClient(clientData as Client); setTransactions([]); setError("The client loaded, but transaction history is unavailable."); }
    else { setClient(clientData as Client); setTransactions((transactionData || []) as Transaction[]); }
    setLoading(false);
  }, [clientId]);

  React.useEffect(() => { void load(); }, [load]);
  const columns = React.useMemo<ColumnDef<Transaction, unknown>[]>(() => [
    { accessorKey: "service_name", header: "Service", cell: ({ row }) => row.original.service_name || "Service" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <AdminStatusBadge status={row.original.status} /> },
    { accessorKey: "created_at", header: "Date", cell: ({ row }) => date(row.original.created_at) },
  ], []);
  const completed = transactions.filter((transaction) => ["completed", "paid"].includes((transaction.status || "").toLowerCase())).length;
  const pending = transactions.filter((transaction) => ["pending", "processing"].includes((transaction.status || "").toLowerCase())).length;

  if (loading) return <AdminPage className="cc-module"><AdminLoadingState /></AdminPage>;
  if (!client) return <AdminPage className="cc-module"><AdminErrorState title={error || "Client not found"} description="This record may have been removed or is not available to your Admin account." onRetry={() => void load()} /></AdminPage>;
  return <AdminPage className="cc-module">
    <AdminDetailHeader backHref="/admin/clients" backLabel="All clients" eyebrow="Client account" title={client.full_name || "Unnamed client"} subtitle={`Joined ${date(client.created_at)}`} status="Client" avatar={<span className="cc-avatar !h-[52px] !w-[52px] !text-base">{initial(client.full_name || client.email)}</span>} />
    {error ? <AdminErrorState title="Transaction history unavailable" description="The account details are available, but the transaction list could not be retrieved." onRetry={() => void load()} /> : null}
    <section className="cc-summary-grid" aria-label="Client account summary"><div className="cc-summary-item"><span>Recorded transactions</span><strong className="cc-tnum">{transactions.length}</strong></div><div className="cc-summary-item"><span>Completed</span><strong className="cc-tnum">{completed}</strong></div><div className="cc-summary-item"><span>Pending</span><strong className="cc-tnum">{pending}</strong></div></section>
    <div className="cc-detail-grid">
      <section className="cc-panel cc-section"><h2>Transaction history</h2><p className="cc-section-description">Recorded transaction statuses for this client. Amount totals are intentionally not combined because the existing client transaction contract does not expose a currency field.</p>{transactions.length ? <AdminDataTable data={transactions} columns={columns} getRowId={(item) => item.id} mobileCard={(item) => <article className="cc-client-card"><header><strong>{item.service_name || "Service"}</strong><AdminStatusBadge status={item.status} /></header><p>{date(item.created_at)}</p></article>} pageSize={8} /> : <AdminEmptyState icon={ReceiptText} title="No transactions recorded" description="This client has no transaction records in the current data source." />}</section>
      <aside className="cc-panel cc-section"><h2>Contact information</h2><p className="cc-section-description">Profile data available to the existing Admin client query.</p><dl className="cc-info-list"><div><dt><Mail className="mr-1 inline" size={13} aria-hidden="true" />Email</dt><dd>{client.email || "Not provided"}</dd></div><div><dt><Globe2 className="mr-1 inline" size={13} aria-hidden="true" />Country</dt><dd>{client.country || "Not provided"}</dd></div><div><dt><UserRound className="mr-1 inline" size={13} aria-hidden="true" />Account ID</dt><dd className="font-mono text-xs">{client.id}</dd></div></dl></aside>
    </div>
  </AdminPage>;
}
