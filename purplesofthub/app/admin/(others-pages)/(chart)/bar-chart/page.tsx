import Link from "next/link";
import type { Metadata } from "next";
import BarChart from "@/components/charts/BarChart";

export const metadata: Metadata = {
  title: "Bar Chart | PurpleSoftHub Admin",
  description: "Revenue and order breakdown by service.",
};

const serviceChartData = {
  categories: ["Web Dev", "Ads", "SEO", "Branding", "Music", "SaaS"],
  revenueSeries: [
    {
      name: "Revenue",
      data: [4200, 3100, 2400, 1900, 2600, 3500],
    },
    {
      name: "Orders",
      data: [18, 26, 14, 11, 16, 20],
    },
  ],
};

export default function BarChartPage() {
  return (
    <div
      style={{
        minHeight: "100%",
        background: "#06030f",
        color: "#fff",
        padding: "clamp(16px, 2.5vw, 28px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(34,211,238,0.1)",
              border: "1px solid rgba(34,211,238,0.18)",
              color: "#22d3ee",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Analytics
          </div>
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "clamp(24px, 3vw, 34px)",
              lineHeight: 1.05,
              fontWeight: 900,
              letterSpacing: "-0.04em",
            }}
          >
            Bar Chart
          </h1>
          <p
            style={{
              margin: 0,
              color: "#9d8fd4",
              maxWidth: 760,
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Compare revenue by service and order volume side by side. Replace
            the mock arrays with Supabase service aggregates when you connect
            real data.
          </p>
        </div>

        <Link
          href="/admin"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "11px 16px",
            borderRadius: 12,
            border: "1px solid rgba(124,58,237,0.18)",
            background: "rgba(255,255,255,0.03)",
            color: "#e2d9f3",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Back to Admin
        </Link>
      </div>

      <BarChart
        title="Revenue by Service"
        description="Compare revenue and orders for the core PurpleSoftHub services."
        categories={serviceChartData.categories}
        series={serviceChartData.revenueSeries}
        height={360}
        formatter={(value) => `₦${value.toLocaleString()}`}
      />
    </div>
  );
}
