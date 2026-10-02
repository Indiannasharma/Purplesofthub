import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { BadgePercent } from "lucide-react";
export default function AdminPromotions() {
 return <AdminPage className="cc-module"><AdminPageHeader title="Promotions" description="Pending product definition." /><AdminEmptyState title="Promotion management is not available" description="This area has no operational workflow yet." icon={BadgePercent} /></AdminPage>;
}
