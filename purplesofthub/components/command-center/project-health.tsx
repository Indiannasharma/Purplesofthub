"use client";

import { pipeline, projectHealth, type Health } from "@/lib/command-center/mock-data";
import { Panel, PanelHeader, Pill, type PillTone } from "./primitives";

/** Project pipeline summary + delivery health — illustrative data. */

const healthMeta: Record<Health, { tone: PillTone; label: string }> = {
  "on-track": { tone: "success", label: "On track" },
  "at-risk": { tone: "warning", label: "At risk" },
  stalled: { tone: "error", label: "Stalled" },
};

const stageColor: Record<string, string> = {
  accent: "var(--cc-accent)",
  info: "var(--cc-info)",
  warning: "var(--cc-warning)",
  success: "var(--cc-success)",
};

export function ProjectHealth() {
  const total = pipeline.reduce((sum, stage) => sum + stage.count, 0);

  return (
    <Panel labelledBy="cc-pipeline-title">
      <PanelHeader
        id="cc-pipeline-title"
        title="Projects"
        subtitle="Pipeline & delivery health · illustrative"
        action={
          <button type="button" className="text-xs font-semibold text-[var(--cc-accent)]">
            Pipeline
          </button>
        }
      />

      {/* Segmented pipeline bar */}
      <div className="px-5">
        <div
          className="flex h-2 w-full overflow-hidden rounded-full"
          role="img"
          aria-label={`Pipeline: ${pipeline.map((s) => `${s.count} ${s.stage.toLowerCase()}`).join(", ")}.`}
        >
          {pipeline.map((stage) => (
            <span
              key={stage.stage}
              style={{
                width: `${(stage.count / total) * 100}%`,
                background: stageColor[stage.tone],
              }}
            />
          ))}
        </div>
        <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
          {pipeline.map((stage) => (
            <li key={stage.stage} className="flex items-center gap-1.5 text-[11px] text-[var(--cc-text-muted)]">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{ background: stageColor[stage.tone] }}
              />
              {stage.stage}
              <span className="cc-tnum font-semibold text-[var(--cc-text-secondary)]">{stage.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Health rows */}
      <ul className="mt-3">
        {projectHealth.map((project) => {
          const meta = healthMeta[project.health];
          return (
            <li key={project.id} className="cc-hairline-top px-5 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-[var(--cc-text)]">
                    {project.name}
                  </p>
                  <p className="truncate text-xs text-[var(--cc-text-muted)]">
                    {project.client} · due {project.due}
                  </p>
                </div>
                <Pill tone={meta.tone}>{meta.label}</Pill>
              </div>
              <div className="mt-2 flex items-center gap-2.5">
                <div
                  className="cc-progress flex-1"
                  role="progressbar"
                  aria-valuenow={project.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${project.name} progress`}
                >
                  <span style={{ width: `${project.progress}%` }} />
                </div>
                <span className="cc-tnum w-9 text-right text-[11px] font-semibold text-[var(--cc-text-secondary)]">
                  {project.progress}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
