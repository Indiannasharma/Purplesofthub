import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CustomerProjects } from "@/components/workspace/customer-projects";
import { CustomerRecordsLoading } from "@/components/workspace/customer-record-states";
import { readCustomerProjects } from "@/lib/customer-records.server";
import "@/app/styles/customer-records.css";

async function ProjectsContent({ supabase, userId }: { supabase: Awaited<ReturnType<typeof createClient>>; userId: string }) {
  return <CustomerProjects section={await readCustomerProjects(supabase, userId)} />;
}
export default async function ClientProjectsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) redirect("/sign-in");
  return <Suspense fallback={<CustomerRecordsLoading title="Projects" />}><ProjectsContent supabase={supabase} userId={user.id} /></Suspense>;
}
