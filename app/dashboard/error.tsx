"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06030f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 5%",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 500 }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>💜</div>
        <h2
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 26,
            fontWeight: 800,
            color: "#e2d9f3",
            marginBottom: 12,
          }}
        >
          Dashboard failed to load
        </h2>
        <p style={{ color: "#9d8fd4", fontSize: 15, lineHeight: 1.75, marginBottom: 8 }}>
          This can happen if your browser&apos;s privacy settings block authentication scripts.
        </p>
        <p style={{ color: "#6d5a9c", fontSize: 13, lineHeight: 1.7, marginBottom: 32 }}>
          <strong style={{ color: "#9d8fd4" }}>Firefox users:</strong> Click the shield icon 🛡️ in the address bar
          and disable Enhanced Tracking Protection for this site, then refresh.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{
              padding: "12px 28px",
              borderRadius: 100,
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              border: "none",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
          <Link href="/sign-in">
            <button
              style={{
                padding: "12px 28px",
                borderRadius: 100,
                background: "rgba(124,58,237,.12)",
                border: "1px solid rgba(168,85,247,.3)",
                color: "#c084fc",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Sign In Again
            </button>
          </Link>
          <Link href="/">
            <button
              style={{
                padding: "12px 28px",
                borderRadius: 100,
                background: "transparent",
                border: "1px solid rgba(124,58,237,.2)",
                color: "#6d5a9c",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Go Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
