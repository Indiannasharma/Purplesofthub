"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
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
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
        <h2
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: "#e2d9f3",
            marginBottom: 12,
            letterSpacing: "-0.5px",
          }}
        >
          Something went wrong
        </h2>
        <p style={{ color: "#9d8fd4", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
          We hit an unexpected error. Please try refreshing — if the issue
          persists, contact us on WhatsApp.
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
          <a href="/">
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
              Go Home
            </button>
          </a>
        </div>
        {process.env.NODE_ENV === "development" && (
          <pre
            style={{
              marginTop: 32,
              padding: 16,
              background: "rgba(239,68,68,.08)",
              border: "1px solid rgba(239,68,68,.2)",
              borderRadius: 12,
              color: "#fca5a5",
              fontSize: 12,
              textAlign: "left",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {error.message}
            {error.digest && `\nDigest: ${error.digest}`}
          </pre>
        )}
      </div>
    </div>
  );
}
