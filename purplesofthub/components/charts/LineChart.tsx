"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions, ApexAxisChartSeries } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

type LineChartProps = {
  title: string;
  description?: string;
  categories: string[];
  series: ApexAxisChartSeries;
  height?: number;
  currencyPrefix?: string;
  yAxisFormatter?: (value: number) => string;
};

function ChartSkeleton() {
  return (
    <div
      style={{
        height: 320,
        borderRadius: 18,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
        border: "1px solid rgba(124,58,237,0.12)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 14,
        padding: 20,
        animation: "psh-pulse 1.4s ease-in-out infinite",
      }}
    >
      <div
        style={{
          width: "38%",
          height: 18,
          borderRadius: 999,
          background: "rgba(124,58,237,0.14)",
        }}
      />
      <div
        style={{
          width: "58%",
          height: 12,
          borderRadius: 999,
          background: "rgba(34,211,238,0.12)",
        }}
      />
      <div
        style={{
          flex: 1,
          borderRadius: 16,
          background:
            "linear-gradient(180deg, rgba(124,58,237,0.08), rgba(34,211,238,0.04))",
          border: "1px dashed rgba(124,58,237,0.12)",
        }}
      />
    </div>
  );
}

export default function LineChart({
  title,
  description,
  categories,
  series,
  height = 340,
  currencyPrefix = "",
  yAxisFormatter,
}: LineChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const options: ApexOptions = {
    chart: {
      type: "area",
      height,
      toolbar: { show: false },
      background: "transparent",
      fontFamily: "Outfit, sans-serif",
      foreColor: "#9d8fd4",
      animations: {
        enabled: true,
        speed: 700,
      },
      zoom: { enabled: false },
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
    },
    colors: ["#7c3aed", "#22d3ee", "#a855f7"],
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: [3, 3, 3],
      lineCap: "round",
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.25,
        opacityFrom: 0.38,
        opacityTo: 0.04,
        stops: [0, 70, 100],
      },
    },
    grid: {
      borderColor: "rgba(124,58,237,0.12)",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { left: 4, right: 8 },
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      strokeColors: "#06030f",
      colors: ["#7c3aed", "#22d3ee", "#a855f7"],
      hover: { size: 6 },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      labels: { colors: "#b8a9d9" },
      fontSize: "12px",
      fontWeight: 700,
      itemMargin: { horizontal: 12, vertical: 6 },
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) =>
          `${currencyPrefix}${value.toLocaleString()}`,
      },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#9d8fd4", fontSize: "12px" },
      },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        formatter: (value: number) =>
          yAxisFormatter ? yAxisFormatter(value) : value.toLocaleString(),
        style: { colors: "#9d8fd4", fontSize: "12px" },
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: { height: Math.max(280, height - 20) },
          legend: { position: "bottom", horizontalAlign: "center" },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: { height: 300 },
          legend: {
            position: "bottom",
            horizontalAlign: "center",
            fontSize: "11px",
          },
          markers: { size: 3 },
          xaxis: {
            labels: { style: { fontSize: "10px", colors: "#9d8fd4" } },
          },
        },
      },
    ],
  };

  return (
    <section
      style={{
        background:
          "linear-gradient(180deg, rgba(26,31,46,0.96), rgba(15,18,32,0.96))",
        border: "1px solid rgba(124,58,237,0.15)",
        borderRadius: 20,
        padding: "18px",
        boxShadow: "0 16px 40px rgba(0,0,0,0.24)",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <h3
          style={{
            margin: "0 0 6px",
            color: "#ffffff",
            fontSize: "clamp(18px, 2vw, 22px)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </h3>
        {description ? (
          <p
            style={{
              margin: 0,
              color: "#9d8fd4",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {description}
          </p>
        ) : null}
      </div>

      <div style={{ minHeight: Math.max(300, height), width: "100%" }}>
        {mounted ? (
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={height}
          />
        ) : (
          <ChartSkeleton />
        )}
      </div>

      <style>{`
        @keyframes psh-pulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
