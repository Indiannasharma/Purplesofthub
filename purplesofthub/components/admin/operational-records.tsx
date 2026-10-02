"use client";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { FolderKanban, ReceiptText } from "lucide-react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { invoiceAmount, overviewDate, projectProgress } from "@/lib/customer-overview";

export type AdminProjectRecord = {
 id: string; name?: string | null; title?: string | null; client_name: string | null;
 status: string; progress: number; due_date: string | null; created_at: string; service: string | null;
};
export type AdminInvoiceRecord = {
 id: string | number; invoice_number: string | null; client_name: string | null;
 client_email: string | null; amount: number | string | null; currency: string | null;
 status: string; due_date: string | null; created_at: string; service: string | null;
};
function Status({value}:{value:string}) { return <AdminStatusBadge status={value.replace(/_/g," ")} tone={value === "in_progress" ? "info" : undefined} />; }
function Progress({row}:{row:AdminProjectRecord}) {
 const progress=projectProgress(row.progress);
 return <span>{progress===null?"Unavailable":progress+"%"}</span>;
}
export function AdminProjectRecords({rows}:{rows:AdminProjectRecord[]}) {
 const columns:ColumnDef<AdminProjectRecord,unknown>[]=[
  {id:"title",accessorFn:row=>row.title||row.name,header:"Project",cell:({row})=><Link className="cc-link" href={"/admin/projects/"+row.original.id}>{row.original.title||row.original.name||"Untitled project"}</Link>},
  {accessorKey:"client_name",header:"Client",cell:({row})=>row.original.client_name||"Not specified"},
  {accessorKey:"service",header:"Service",cell:({row})=>row.original.service||"Not specified"},
  {accessorKey:"status",header:"Status",cell:({row})=><Status value={row.original.status}/>},
  {accessorKey:"progress",header:"Progress",cell:({row})=><Progress row={row.original}/>},
  {accessorKey:"due_date",header:"Due",cell:({row})=>row.original.due_date?overviewDate(row.original.due_date):"Not specified"},
 ];
 return rows.length?<AdminDataTable data={rows} columns={columns} getRowId={row=>String(row.id)} mobileCard={row=><article className="admin-record-card"><header><Link className="cc-link" href={"/admin/projects/"+row.id}>{row.title||row.name||"Untitled project"}</Link><Status value={row.status}/></header><dl><div><dt>Client</dt><dd>{row.client_name||"Not specified"}</dd></div><div><dt>Service</dt><dd>{row.service||"Not specified"}</dd></div><div><dt>Progress</dt><dd><Progress row={row}/></dd></div><div><dt>Due</dt><dd>{row.due_date?overviewDate(row.due_date):"Not specified"}</dd></div></dl></article>}/>:<AdminEmptyState title="No matching projects" description="Adjust the filters, or create a project for a customer." icon={FolderKanban}/>;
}
export function AdminInvoiceRecords({rows}:{rows:AdminInvoiceRecord[]}) {
 const reference=(row:AdminInvoiceRecord)=>row.invoice_number||"#"+row.id;
 const columns:ColumnDef<AdminInvoiceRecord,unknown>[]=[
  {id:"reference",accessorFn:reference,header:"Invoice reference"},
  {accessorKey:"client_name",header:"Client",cell:({row})=><div>{row.original.client_name||"Not specified"}<p>{row.original.client_email}</p></div>},
  {accessorKey:"amount",header:"Recorded amount",cell:({row})=>invoiceAmount(row.original.amount,row.original.currency)},
  {accessorKey:"status",header:"Status",cell:({row})=><Status value={row.original.status}/>},
  {accessorKey:"due_date",header:"Due",cell:({row})=>row.original.due_date?overviewDate(row.original.due_date):"Not specified"},
 ];
 return rows.length?<AdminDataTable data={rows} columns={columns} getRowId={row=>String(row.id)} mobileCard={row=><article className="admin-record-card"><header><h2>{reference(row)}</h2><Status value={row.status}/></header><dl><div><dt>Client</dt><dd>{row.client_name||"Not specified"}</dd></div><div><dt>Email</dt><dd>{row.client_email||"Not specified"}</dd></div><div><dt>Recorded amount</dt><dd>{invoiceAmount(row.amount,row.currency)}</dd></div><div><dt>Due</dt><dd>{row.due_date?overviewDate(row.due_date):"Not specified"}</dd></div></dl></article>}/>:<AdminEmptyState title="No matching invoices" description="Adjust the filters, or create an invoice." icon={ReceiptText}/>;
}
