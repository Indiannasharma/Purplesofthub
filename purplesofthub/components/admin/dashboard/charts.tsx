"use client";

import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type ChartPoint = { label: string; value: number };

/**
 * Theme-aware area chart. Colors resolve from the existing shadcn CSS tokens
 * (reads custom properties at runtime), so light/dark both work without any
 * hardcoded hex values.
 */
export function AreaChart({ data, seriesName }: { data: ChartPoint[]; seriesName: string }) {
  const primary = resolveToken("--primary", "#7c3aed");
  const border = resolveToken("--border", "#e5e7eb");
  const muted = resolveToken("--muted-foreground", "#6b7280");

  const options = {
    chart: { type: "area" as const, toolbar: { show: false }, zoom: { enabled: false }, fontFamily: "inherit" },
    colors: [primary],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" as const, width: 2 },
    fill: {
      type: "gradient" as const,
      gradient: { shadeIntensity: 0.25, opacityFrom: 0.3, opacityTo: 0.02 },
    },
    grid: { borderColor: border, strokeDashArray: 4, padding: { top: 8 } },
    xaxis: {
      categories: data.map((point) => point.label),
      labels: { style: { colors: muted, fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: muted, fontSize: "11px" } },
      min: 0,
      tickAmount: 4,
    },
    tooltip: {
      theme: "light" as const,
      y: { formatter: (value: number) => `${value.toLocaleString("en-NG")}` },
    },
    legend: { show: false },
  };

  return (
    <ReactApexChart
      type="area"
      height={250}
      options={options}
      series={[{ name: seriesName, data: data.map((point) => point.value) }]}
    />
  );
}

/**
 * Theme-aware donut chart for categorical status/count data. The accompanying
 * textual legend is rendered separately (see ProjectStatusList) so information
 * is never conveyed by the chart alone.
 */
export function DonutChart({ data }: { data: ChartPoint[] }) {
  const primary = resolveToken("--primary", "#7c3aed");
  const muted = resolveToken("--muted-foreground", "#6b7280");
  const card = resolveToken("--card", "#ffffff");

  const options = {
    chart: { type: "donut" as const, fontFamily: "inherit" },
    labels: data.map((point) => point.label),
    colors: ["#8b5cf6", "#22c55e", "#3b82f6", "#f59e0b", "#94a3b8", "#ef4444"],
    dataLabels: { enabled: false },
    legend: {
      position: "bottom" as const,
      fontSize: "11px",
      labels: { colors: muted },
      markers: { size: 6 },
    },
    stroke: { width: 2, colors: [card] },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              color: muted,
              fontSize: "11px",
              formatter: (w: { globals: { seriesTotals: number[] } }) =>
                `${w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)}`,
            },
            value: { color: primary, fontSize: "22px", fontWeight: 700 },
          },
        },
      },
    },
  };

  return <ReactApexChart type="donut" height={260} options={options} series={data.map((p) => p.value)} />;
}

function resolveToken(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}