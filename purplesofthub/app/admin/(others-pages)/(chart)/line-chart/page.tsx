import Link from "next/link";
import type { Metadata } from "next";
import LineChart from "@/components/charts/LineChart";

export const metadata: Metadata = {
  title: "Line Chart | PurpleSoftHub Admin",
  description: "Monthly revenue, user growth, and subscription trends.",
};

const monthlyLineData = {
  categories: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  series: [
    {
      name: "Revenue",
      data: [18, 22, 28, 24, 31, 35, 42, 40, 48, 55, 62, 70],
    },
    {
      name: "Users",
      data: [120, 140, 155, 178, 196, 220, 248, 274, 302, 338, 365, 402],
    },
    {
      name: "Subscriptions",
      data: [30, 38, 44, 47, 53, 61, 69, 72, 79, 88, 96, 108],
    },
  ],
};

export default function LineChartPage() {
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
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(124,58,237,0.18)",
              color: "#c084fc",
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
            Line Chart
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
            Track monthly revenue growth, user growth, and subscription growth.
            The data below is mocked for now, but the structure is ready to swap
            to Supabase aggregates later.
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

      <LineChart
        title="Monthly Growth Trends"
        description="Revenue, users, and subscriptions across the current year."
        categories={monthlyLineData.categories}
        series={monthlyLineData.series}
        height={360}
        currencyPrefix="₦"
        yAxisFormatter={(value) => `${value.toLocaleString()}`}
      />
    </div>
  );
}
