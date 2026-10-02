import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import InvoicesClient from "./InvoicesClient";
import { CustomerRecordsLoading } from "@/components/workspace/customer-record-states";
import { readCustomerInvoices } from "@/lib/customer-records.server";
import "@/app/styles/customer-records.css";

async function InvoicesContent({ supabase, userId }: { supabase: Awaited<ReturnType<typeof createClient>>; userId: string }) {
  return <InvoicesClient section={await readCustomerInvoices(supabase, userId)} />;
}
export default async function ClientInvoicesPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) redirect("/sign-in");
  return <Suspense fallback={<CustomerRecordsLoading title="Invoices" />}><InvoicesContent supabase={supabase} userId={user.id} /></Suspense>;
}
