import type { BusinessInsight } from "@/lib/admin/dashboard";

/**
 * Signals — deterministic one-line observations from current data. Rendered as
 * plain sentences with a quiet dot marker; omitted entirely when there is
 * nothing to say. Never AI-generated.
 */
export function Signals({ insights }: { insights: BusinessInsight[] }) {
  if (insights.length === 0) return null;

  return (
    <section aria-labelledby="signals-title">
      <h2 id="signals-title" className="text-xs font-semibold tracking-tight text-foreground">
        Signals
      </h2>
      <ul className="mt-3 grid gap-1.5 border-t border-border/70 pt-3">
        {insights.slice(0, 3).map((insight) => (
          <li key={insight.id} className="flex items-baseline gap-2.5 text-xs leading-5">
            <span
              aria-hidden="true"
              className="relative top-[-1px] h-1 w-1 shrink-0 self-center rounded-full bg-primary/70"
            />
            <span className="min-w-0 text-muted-foreground">{insight.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}