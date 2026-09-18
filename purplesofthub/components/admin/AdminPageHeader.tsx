import Link from "next/link";

import { cn } from "@/lib/utils";
import type { BreadcrumbItem } from "@/lib/workspace";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  /**
   * Optional breadcrumb trail. Keep it lightweight — derive it from
   * `getAdminBreadcrumbs(pathname)`; never query the database for it.
   */
  breadcrumbs?: BreadcrumbItem[];
  /** Optional action buttons rendered to the right on desktop. */
  actions?: React.ReactNode;
  className?: string;
};

/**
 * Shared page-header foundation for Admin modules.
 *
 * Server-component safe (no hooks): upgraded modules can render it directly
 * from their page components. Existing admin pages are intentionally NOT
 * migrated to it in this phase.
 *
 * <AdminPageHeader
 *   title="Clients"
 *   description="Manage PurpleSoftHub clients"
 *   actions={<Button>+ New Client</Button>}
 * />
 */
export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {breadcrumbs?.length ? (
          <nav aria-label="Breadcrumb" className="mb-1.5">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              {breadcrumbs.map((crumb, index) => {
                const last = index === breadcrumbs.length - 1;

                return (
                  <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                    {crumb.href && !last ? (
                      <Link
                        href={crumb.href}
                        className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        className={cn(last ? "font-medium text-foreground" : undefined)}
                        aria-current={last ? "page" : undefined}
                      >
                        {crumb.label}
                      </span>
                    )}
                    {!last ? (
                      <span aria-hidden="true" className="text-muted-foreground/60">
                        /
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}

        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export default AdminPageHeader;