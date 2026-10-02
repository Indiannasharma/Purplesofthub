"use client";
import { useState } from "react";
import { Bell } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminLoadingState } from "@/components/admin/AdminLoadingState";
import { AdminErrorState } from "@/components/admin/AdminErrorState";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminField } from "@/components/admin/AdminField";
import { AdminProjectRecords, AdminInvoiceRecords, type AdminProjectRecord, type AdminInvoiceRecord } from "@/components/admin/operational-records";
import { WorkspaceButton as Button } from "@/components/workspace/button";
import { WorkspaceCheckbox } from "@/components/workspace/checkbox";

// Isolated presentation fixtures. No authenticated loader, notification identity,
// database client, network request, upload, payment or persistence is invoked.
const projects: AdminProjectRecord[] = [
 {id:"fixture-1",title:"A deliberately long customer project covering digital products, brand foundations and a worldwide platform launch",client_name:"A customer with a deliberately long company name",status:"in_progress",progress:0,due_date:"2026-11-01",created_at:"2026-09-01",service:"Digital product design and development"},
 {id:"fixture-2",title:"Completed brand foundations",client_name:null,status:"completed",progress:100,due_date:null,created_at:"2026-09-01",service:null},
 {id:"fixture-3",title:"Status wrapping",client_name:"Customer",status:"awaiting_customer_confirmation_for_extended_delivery",progress:42,due_date:null,created_at:"2026-09-01",service:"Branding"},
];
const invoices: AdminInvoiceRecord[] = [
 {id:"fixture-ngn",invoice_number:"PSH-2026-A-deliberately-long-recorded-invoice-reference",client_name:"A customer with a deliberately long company name",client_email:"long-customer-address@example.test",amount:125000,currency:"NGN",status:"pending",due_date:"2026-11-01",created_at:"2026-09-01",service:"Product development"},
 {id:"fixture-usd",invoice_number:null,client_name:"Customer",client_email:null,amount:0,currency:"USD",status:"paid",due_date:null,created_at:"2026-09-01",service:null},
 {id:"fixture-missing",invoice_number:null,client_name:null,client_email:null,amount:null,currency:null,status:"a_deliberately_long_recorded_status",due_date:null,created_at:"2026-09-01",service:null},
];
export default function AdminSprintPreview() {
 const [view,setView]=useState("projects");
 const [state,setState]=useState("ready");
 const [checked,setChecked]=useState(false);
 const [submitted,setSubmitted]=useState(false);
 return <AdminShell profile={{userId:"presentation-only",fullName:"A deliberately long administrator name",email:"preview@example.test",role:"admin"}} notifications={<span aria-label="Notification presentation fixture" className="cc-icon-btn"><Bell size={18} aria-hidden="true" /></span>}>
  <AdminPage className="cc-module admin-form admin-sprint-fixture">
   <style>{'body:has(.admin-sprint-fixture) .nova-shell { display: block !important; }'}</style>
   <AdminPageHeader title="Command Center UI verification" description="Isolated synthetic presentation. No account or operational records are accessed." />
   <div className="cc-toolbar">{["projects","invoices","forms"].map(item=><Button key={item} variant={view===item?"default":"secondary"} onClick={()=>setView(item)} aria-pressed={view===item}>Show {item}</Button>)}<label>Data state <select aria-label="Fixture data state" value={state} onChange={event=>setState(event.target.value)}>{["ready","loading","error","empty"].map(value=><option key={value}>{value}</option>)}</select></label></div>
   {state==="loading"?<AdminLoadingState />:state==="error"?<AdminErrorState description="An isolated failed-read fixture. No zero totals are presented." onRetry={()=>setState("ready")} />:state==="empty"?<AdminEmptyState title="No records yet" description="Only a successful empty read uses this state." />:view==="projects"?<AdminProjectRecords rows={projects} />:view==="invoices"?<AdminInvoiceRecords rows={invoices} />:<form className="admin-form-panel" onSubmit={event=>{event.preventDefault();setSubmitted(true)}}>
    <div className="admin-form-grid"><AdminField label="Project title" id="fixture-title"><input id="fixture-title" required placeholder="Project title" /></AdminField><AdminField label="Recorded status" id="fixture-status"><select id="fixture-status"><option>Pending</option><option>In progress</option></select></AdminField><AdminField label="Due date" id="fixture-date"><input id="fixture-date" type="date" /></AdminField><AdminField label="Notes" id="fixture-notes"><textarea id="fixture-notes" rows={3} /></AdminField></div>
    <div className="admin-line-item"><AdminField label="Description" id="fixture-description"><input id="fixture-description" /></AdminField><AdminField label="Quantity" id="fixture-quantity"><input id="fixture-quantity" type="number" defaultValue={1} /></AdminField><AdminField label="Unit price" id="fixture-price"><input id="fixture-price" type="number" defaultValue={0} /></AdminField><span>NGN 0</span><Button type="button" size="icon" variant="ghost" aria-label="Remove fixture line">×</Button></div>
    <div style={{display:"grid",gap:16,marginTop:20}}><WorkspaceCheckbox id="fixture-consent" label="Consent fixture" checked={checked} onChange={setChecked} /><WorkspaceCheckbox id="fixture-disabled" label="Disabled unchecked fixture" checked={false} disabled onChange={()=>{throw new Error("Disabled checkbox changed")}} /><WorkspaceCheckbox label="Disabled checked fixture" checked disabled onChange={()=>{throw new Error("Disabled checkbox changed")}} /><output aria-live="polite">Boolean callback: {String(checked)}</output></div>
    <div className="admin-form-actions"><Button type="submit">Validate fixture form</Button></div>{submitted?<p role="status">Native form validation passed. No record was created.</p>:null}
   </form>}
  </AdminPage>
 </AdminShell>;
}
