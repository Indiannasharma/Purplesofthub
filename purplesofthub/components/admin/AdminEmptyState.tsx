import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function AdminEmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="cc-empty-state" role="status">
      <span className="cc-empty-state-icon"><Icon aria-hidden="true" size={22} /></span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action ? <div className="cc-empty-state-action">{action}</div> : null}
    </div>
  );
}
