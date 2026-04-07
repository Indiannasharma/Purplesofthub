"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#06030f" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 5%",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>💜</div>
            <h2
              style={{
                fontFamily: "Outfit, system-ui, sans-serif",
                fontSize: 28,
                fontWeight: 800,
                color: "#e2d9f3",
                marginBottom: 12,
              }}
            >
              PurpleSoftHub
            </h2>
            <p style={{ color: "#9d8fd4", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
              We encountered an unexpected issue. Please refresh the page.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "12px 32px",
                borderRadius: 100,
                background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                border: "none",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
