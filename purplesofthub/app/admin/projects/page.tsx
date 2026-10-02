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
import { AdminProjectRecords, type AdminProjectRecord } from "@/components/admin/operational-records";

export default function ProjectsPage() {
 const [rows,setRows]=useState<AdminProjectRecord[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [search,setSearch]=useState("");
 const [filter,setFilter]=useState("all");
 useEffect(()=>{
  const supabase=createClient();
  Promise.resolve(supabase.from("projects").select("*").order("created_at",{ascending:false})).then(({data,error})=>{
   if(error)setError("Could not read projects. Refresh to try again.");
   else setRows(data||[]);
   setLoading(false);
  }).catch(()=>{setError("Could not read records. Refresh to try again.");setLoading(false);});
 },[]);
 const statuses=[...new Set(rows.map(row=>row.status))];
 const filtered=rows.filter(row=>{
  const text=[row.title,row.name,row.client_name].filter(Boolean).join(" ").toLowerCase();
  return text.includes(search.toLowerCase())&&(filter==="all"||row.status===filter);
 });
 return <AdminPage className="cc-module admin-form">
  <AdminPageHeader title="Projects" description="Follow customer projects and their recorded progress." actions={<Button asChild><Link href="/admin/projects/new">New Project</Link></Button>}/>
  {loading?<AdminLoadingState/>:error?<AdminErrorState title="Records unavailable" description={error}/>:<>
   <div className="cc-toolbar">
    <AdminField id="admin-projects-search" label="Search projects"><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects..."/></AdminField>
    <AdminField id="admin-projects-status" label="Recorded status"><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option>{statuses.map(status=><option value={status} key={status}>{status.replace(/_/g," ")}</option>)}</select></AdminField>
   </div>
   <p className="admin-contract-note" aria-live="polite">Showing {filtered.length} of {rows.length} loaded projects · Project detail controls remain under restoration.</p>
   <AdminProjectRecords rows={filtered}/>
  </>}
 </AdminPage>;
}
