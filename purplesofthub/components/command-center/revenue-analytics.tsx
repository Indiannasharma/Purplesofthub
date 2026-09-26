"use client";

import { useId } from "react";
import {
  revenueSeries,
  revenueTotal,
  revenuePeriod,
  paymentComposition,
} from "@/lib/command-center/mock-data";
import { Panel, PanelHeader, Pill } from "./primitives";

/**
 * Revenue & payment analytics — Phase 1 design preview.
 * Charts are original zero-dependency SVG (SSR-safe, deterministic data).
 * The Recharts vs ApexCharts decision is deferred to Phase 2.
 */

const W = 640;
const H = 200;
const PAD = { top: 16, right: 8, bottom: 24, left: 40 };

function buildPath(points: number[]): { line: string; area: string; coords: { x: number; y: number }[] } {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const coords = points.map((value, i) => ({
    x: PAD.left + (i / (points.length - 1)) * innerW,
    y: PAD.top + innerH - ((value - min) / range) * innerH,
  }));

  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${coords[coords.length - 1].x.toFixed(1)},${H - PAD.bottom} L${coords[0].x.toFixed(1)},${H - PAD.bottom} Z`;

  return { line, area, coords };
}

export function RevenueAnalytics() {
  const gradientId = useId();
  const { line, area, coords } = buildPath(revenueSeries);
  const min = Math.min(...revenueSeries);
  const max = Math.max(...revenueSeries);
  const last = coords[coords.length - 1];
  const xTicks = ["Sep 1", "Sep 8", "Sep 15", "Sep 22", "Sep 29"];

  return (
    <Panel labelledBy="cc-revenue-title">
      <PanelHeader
        id="cc-revenue-title"
        title="Revenue & payments"
        subtitle={`${revenuePeriod} · illustrative sample data`}
        action={
          <div className="flex items-center gap-2">
            <Pill tone="muted">30d</Pill>
            <Pill tone="muted">90d</Pill>
            <Pill tone="muted">12m</Pill>
          </div>
        }
      />

      <div className="px-5">
        <div className="flex items-baseline gap-3">
          <span className="cc-display cc-tnum text-[22px] font-semibold text-[var(--cc-text)]">
            {revenueTotal}
          </span>
          <Pill tone="success">+12.4%</Pill>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Revenue trend, ${revenuePeriod}. Values between ₦${min}K and ₦${max}K per day. Illustrative sample data.`}
          className="mt-3 h-48 w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--cc-chart-1)" stopOpacity="0.14" />
              <stop offset="100%" stopColor="var(--cc-chart-1)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={PAD.top + (H - PAD.top - PAD.bottom) * ratio}
              y2={PAD.top + (H - PAD.top - PAD.bottom) * ratio}
              stroke="var(--cc-border)"
              strokeDasharray="3 5"
              strokeWidth="1"
            />
          ))}

          <path d={area} fill={`url(#${gradientId})`} />
          <path d={line} fill="none" stroke="var(--cc-chart-1)" strokeWidth="2" strokeLinejoin="round" />

          <circle cx={last.x} cy={last.y} r="4" fill="var(--cc-chart-1)" />
          <circle cx={last.x} cy={last.y} r="8" fill="none" stroke="var(--cc-chart-1)" strokeOpacity="0.3" />

          <text x={4} y={PAD.top + 4} fontSize="10" fill="var(--cc-text-muted)" className="cc-tnum">₦{max}K</text>
          <text x={4} y={H - PAD.bottom} fontSize="10" fill="var(--cc-text-muted)" className="cc-tnum">₦{min}K</text>
          {xTicks.map((tick, i) => (
            <text
              key={tick}
              x={PAD.left + (i / (xTicks.length - 1)) * (W - PAD.left - PAD.right)}
              y={H - 6}
              fontSize="10"
              textAnchor="middle"
              fill="var(--cc-text-muted)"
            >
              {tick}
            </text>
          ))}
        </svg>
      </div>

      {/* Payment composition */}
      <div className="cc-hairline-top mt-2 space-y-3 px-5 py-4">
        {paymentComposition.map((slice) => (
          <div key={slice.label} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-xs font-medium text-[var(--cc-text-secondary)]">
              {slice.label}
            </span>
            <div className="cc-progress h-1.5 flex-1">
              <span
                style={{
                  width: `${slice.percent}%`,
                  background:
                    slice.tone === "success"
                      ? "var(--cc-success)"
                      : slice.tone === "warning"
                        ? "var(--cc-warning)"
                        : "var(--cc-error)",
                }}
              />
            </div>
            <span className="cc-tnum w-16 shrink-0 text-right text-xs font-semibold text-[var(--cc-text)]">
              {slice.amount}
            </span>
            <span className="cc-tnum w-9 shrink-0 text-right text-[11px] text-[var(--cc-text-muted)]">
              {slice.percent}%
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
