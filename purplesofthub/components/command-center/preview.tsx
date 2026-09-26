"use client";

import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_DATA_NOTICE } from "@/lib/command-center/mock-data";
import { CcSidebar } from "./sidebar";
import { CcTopbar } from "./topbar";
import { KpiStrip } from "./kpi-strip";
import { RevenueAnalytics } from "./revenue-analytics";
import { ActionQueue } from "./action-queue";
import { ProjectHealth } from "./project-health";
import { LeadActivity } from "./lead-activity";
import { ActivityTimeline } from "./activity-timeline";
import { QuickActions } from "./quick-actions";

/**
 * Command Center preview shell — Phase 1.
 * Self-contained: theme + sidebar state live here, tokens come from the
 * scoped `.cc-root` layer. The live /admin area is untouched.
 */

type CcTheme = "light" | "dark";

export function CommandCenterPreview({ initialTheme }: { initialTheme: CcTheme }) {
  const [theme, setTheme] = useState<CcTheme>(initialTheme);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme]);

  return (
    <div
      className="cc-root fixed inset-0 flex overflow-hidden"
      data-cc-theme={theme}
    >
      <a
        href="#cc-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[90] focus:rounded-lg focus:bg-[var(--cc-surface)] focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        aria-label="Command Center sidebar"
        className={cn(
          "hidden h-full shrink-0 border-r border-[var(--cc-border)] transition-[width] duration-200 ease-out lg:block",
          collapsed ? "w-[72px]" : "w-[248px]"
        )}
      >
        <CcSidebar collapsed={collapsed} onCollapse={() => setCollapsed((v) => !v)} />
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            aria-hidden="true"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside
            aria-label="Command Center navigation"
            className="absolute inset-y-0 left-0 w-[280px] border-r border-[var(--cc-border)] bg-[var(--cc-surface)]"
          >
            <CcSidebar
              collapsed={false}
              onCollapse={() => setMobileNavOpen(false)}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <CcTopbar
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main id="cc-main" className="cc-scroll min-h-0 flex-1 overflow-y-auto">
          {/* Preview banner */}
          <div className="border-b border-[var(--cc-border)] bg-[var(--cc-warning-soft)] px-4 py-2 sm:px-6">
            <p className="mx-auto flex max-w-[1280px] items-center gap-2 text-[11px] font-medium text-[var(--cc-warning)]">
              <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Design preview — {MOCK_DATA_NOTICE}. Not connected to live business data.
            </p>
          </div>

          <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-6 sm:px-6">
            {/* Page header */}
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="cc-display text-[26px] font-semibold leading-8 text-[var(--cc-text)]">
                  Good morning, Ama
                </h1>
                <p className="mt-1 text-[13px] text-[var(--cc-text-muted)]">
                  Friday, 26 September · studio data as of 09:41{" "}
                  <span className="italic">(illustrative)</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="cc-btn cc-btn-ghost">Export report</button>
                <button type="button" className="cc-btn cc-btn-primary">New project</button>
              </div>
            </div>

            <KpiStrip />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
              <div className="min-w-0 space-y-6 xl:col-span-7">
                <RevenueAnalytics />
                <ActionQueue />
                <ActivityTimeline />
              </div>
              <div className="min-w-0 space-y-6 xl:col-span-5">
                <ProjectHealth />
                <LeadActivity />
              </div>
            </div>

            <QuickActions />

            <p className="pb-2 text-center text-[11px] text-[var(--cc-text-muted)]">
              PurpleSoftHub Command Center · Phase 1 design prototype · {MOCK_DATA_NOTICE}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
