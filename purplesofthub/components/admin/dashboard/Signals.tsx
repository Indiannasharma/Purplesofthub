import type { BusinessInsight } from "@/lib/admin/dashboard";

import { Panel, PanelHeader } from "@/components/command-center/primitives";

/**
 * Signals — deterministic one-line observations from current data. Rendered as
 * plain sentences with a quiet dot marker; omitted entirely when there is
 * nothing to say. Never AI-generated.
 *
 * Rendered as a compact panel in the executive right rail so the overview has
 * an immediate "what changed / what matters" surface without inventing data.
 */
export function Signals({ insights }: { insights: BusinessInsight[] }) {
  if (insights.length === 0) return null;

  return (
    <Panel labelledBy="signals-title">
      <PanelHeader id="signals-title" title="Signals" subtitle="Calculated from current records" />
      <ul className="cc-hairline-top grid gap-2.5 px-5 py-4">
        {insights.slice(0, 3).map((insight) => (
          <li key={insight.id} className="flex items-start gap-2.5 text-xs leading-5">
            <span
              aria-hidden="true"
              className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--cc-chart-2)]"
            />
            <span className="min-w-0 text-[var(--cc-text-secondary)]">{insight.text}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
