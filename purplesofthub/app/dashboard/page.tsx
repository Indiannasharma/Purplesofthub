import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CustomerOverview, CustomerOverviewLoading } from "@/components/workspace/customer-overview";
import { readCustomerOverview } from "@/lib/customer-overview.server";
import { overviewFirstName } from "@/lib/customer-overview";

async function OverviewContent({ supabase, userId, metadataName }: { supabase: Awaited<ReturnType<typeof createClient>>; userId: string; metadataName: unknown }) {
  const { profileName, ...sections } = await readCustomerOverview(supabase, userId);
  return <CustomerOverview data={{ firstName: overviewFirstName(profileName, metadataName), ...sections }} />;
}
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) redirect("/sign-in");
  return <Suspense fallback={<CustomerOverviewLoading />}><OverviewContent supabase={supabase} userId={user.id} metadataName={user.user_metadata?.full_name || user.user_metadata?.name} /></Suspense>;
}
