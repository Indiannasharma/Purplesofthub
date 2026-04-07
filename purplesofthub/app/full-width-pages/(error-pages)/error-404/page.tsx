import GridShape from "@/components/common/GridShape";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "404 Not Found — PurpleSoftHub",
  description: "The page you are looking for could not be found. Return to PurpleSoftHub home page.",
};

export default function Error404() {
  return (
    <div style={{
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "24px",
      overflow: "hidden",
      background: "var(--cyber-bg)",
      zIndex: 1,
    }}>
      <GridShape />

      {/* Decorative holographic planet */}
      <div style={{
        position: "absolute",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: "radial-gradient(circle at 30% 30%, rgba(34,211,238,0.2), rgba(124,58,237,0.1))",
        border: "2px solid rgba(34,211,238,0.3)",
        top: "10%",
        right: "-5%",
        opacity: 0.6,
        animation: "float 6s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      <div style={{
        margin: "0 auto",
        width: "100%",
        maxWidth: "472px",
        textAlign: "center",
        position: "relative",
        zIndex: 10,
      }}>
        <h1 style={{
          marginBottom: "32px",
          fontWeight: 900,
          fontSize: "clamp(32px, 6vw, 72px)",
          background: "linear-gradient(90deg, #7c3aed, #a855f7, #22d3ee)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-2px",
        }}>
          ERROR 404
        </h1>

        <Image
          src="/images/error/404.svg"
          alt="404"
          style={{ display: "block", margin: "0 auto", width: "100%", height: "auto" }}
          width={472}
          height={152}
        />

        <p style={{
          marginTop: "40px",
          marginBottom: "24px",
          fontSize: "16px",
          color: "var(--text-muted)",
          lineHeight: 1.6,
        }}>
          We can&apos;t seem to find the page you are looking for!
        </p>

        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            border: "1px solid var(--cyber-border)",
            background: "var(--cyber-card)",
            padding: "13px 32px",
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--text-primary)",
            textDecoration: "none",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
          }}
        >
          ← Back to Home Page
        </Link>
      </div>

      {/* Footer */}
      <p style={{
        position: "absolute",
        fontSize: "14px",
        textAlign: "center",
        color: "var(--text-muted)",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
      }}>
        &copy; {new Date().getFullYear()} - PurpleSoftHub
      </p>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
