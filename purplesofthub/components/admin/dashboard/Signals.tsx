import type { BusinessInsight } from "@/lib/admin/dashboard";

import { SectionTitle } from "./shared";

/**
 * Signals — deterministic one-line observations from current data. Rendered as
 * plain sentences with a quiet dot marker; omitted entirely when there is
 * nothing to say. Never AI-generated.
 *
 * Deliberately NOT a panel: the Overview already has enough surface area, and
 * this reads better as a quiet footnote in the right rail.
 */
export function Signals({ insights }: { insights: BusinessInsight[] }) {
  if (insights.length === 0) return null;

  return (
    <section aria-labelledby="signals-title">
      <SectionTitle id="signals-title" title="Signals" />
      <ul className="cc-hairline-top mt-3 grid gap-1.5 pt-3">
        {insights.slice(0, 3).map((insight) => (
          <li key={insight.id} className="flex items-baseline gap-2.5 text-xs leading-5">
            <span
              aria-hidden="true"
              className="relative top-[-1px] h-1.5 w-1.5 shrink-0 self-center rounded-full bg-[var(--cc-chart-2)]"
            />
            <span className="min-w-0 text-[var(--cc-text-muted)]">{insight.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
