import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

export function AdminDetailHeader({
  backHref,
  backLabel,
  eyebrow,
  title,
  subtitle,
  status,
  avatar,
  actions,
}: {
  backHref: string;
  backLabel: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  status?: string;
  avatar?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="cc-detail-header">
      <Link href={backHref} className="cc-back-link"><ArrowLeft size={15} />{backLabel}</Link>
      <div className="cc-detail-heading-row">
        {avatar ? <div className="cc-detail-avatar">{avatar}</div> : null}
        <div className="min-w-0 flex-1">
          {eyebrow ? <p className="cc-eyebrow">{eyebrow}</p> : null}
          <div className="flex flex-wrap items-center gap-2"><h1>{title}</h1>{status ? <AdminStatusBadge status={status} tone="accent" /> : null}</div>
          {subtitle ? <p className="cc-detail-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="cc-detail-actions">{actions}</div> : null}
      </div>
    </header>
  );
}
