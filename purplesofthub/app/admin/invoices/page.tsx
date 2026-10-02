"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminField } from "@/components/admin/AdminField";
import { AdminLoadingState } from "@/components/admin/AdminLoadingState";
import { AdminErrorState } from "@/components/admin/AdminErrorState";
import { WorkspaceButton as Button } from "@/components/workspace/button";
import { AdminInvoiceRecords, type AdminInvoiceRecord } from "@/components/admin/operational-records";

export default function InvoicesPage() {
 const [rows,setRows]=useState<AdminInvoiceRecord[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [search,setSearch]=useState("");
 const [filter,setFilter]=useState("all");
 useEffect(()=>{
  const supabase=createClient();
  Promise.resolve(supabase.from("invoices").select("*").order("created_at",{ascending:false})).then(({data,error})=>{
   if(error)setError("Could not read invoices. Refresh to try again.");
   else setRows(data||[]);
   setLoading(false);
  }).catch(()=>{setError("Could not read records. Refresh to try again.");setLoading(false);});
 },[]);
 const statuses=[...new Set(rows.map(row=>row.status))];
 const filtered=rows.filter(row=>{
  const text=[row.client_name,row.invoice_number,String(row.id)].filter(Boolean).join(" ").toLowerCase();
  return text.includes(search.toLowerCase())&&(filter==="all"||row.status===filter);
 });
 return <AdminPage className="cc-module admin-form">
  <AdminPageHeader title="Invoices" description="Review invoices in their recorded currencies." actions={<Button asChild><Link href="/admin/invoices/new">New Invoice</Link></Button>}/>
  {loading?<AdminLoadingState/>:error?<AdminErrorState title="Records unavailable" description={error}/>:<>
   <div className="cc-toolbar">
    <AdminField id="admin-invoices-search" label="Search invoices"><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search invoices..."/></AdminField>
    <AdminField id="admin-invoices-status" label="Recorded status"><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option>{statuses.map(status=><option value={status} key={status}>{status.replace(/_/g," ")}</option>)}</select></AdminField>
   </div>
   <p className="admin-contract-note" aria-live="polite">Showing {filtered.length} of {rows.length} loaded invoices · Amounts are shown in each invoice’s recorded currency.</p>
   <AdminInvoiceRecords rows={filtered}/>
  </>}
 </AdminPage>;
}
