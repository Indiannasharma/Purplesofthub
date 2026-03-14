"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import goldLogo from "@/Assets/images/Purplesoft-Gold-logo.png";
import purpleLogo from "@/Assets/images/Purple logo.png";

const NAV_LINKS = [
  { label: "Solutions", href: "/#services" },
  { label: "Academy", href: "/blog" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Music", href: "/#music" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/#about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved ? saved === "dark" : true;
    setDark(isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    const theme = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 68, padding: "0 5%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(6,3,15,.93)" : "rgba(6,3,15,.6)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(124,58,237,.15)",
        transition: "all .3s",
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <Image
          src={dark ? goldLogo : purpleLogo}
          alt="PurpleSoftHub Logo"
          height={dark ? 120 : 40}
          style={{ objectFit: "contain" }}
        />
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex" style={{ gap: 32, alignItems: "center" }}>
        {NAV_LINKS.map((l) => (
          <Link key={l.label} href={l.href}
            style={{ fontSize: 14, fontWeight: 500, color: "#b8a9d9", textDecoration: "none", transition: "color .2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#e2d9f3")}
            onMouseLeave={e => (e.currentTarget.style.color = "#b8a9d9")}
          >{l.label}</Link>
        ))}
      </div>

      <div className="hidden md:flex" style={{ gap: 12, alignItems: "center" }}>
        <button
          onClick={toggleTheme}
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="theme-toggle"
        >{dark ? "☀️" : "🌙"}</button>
        <Link href="/contact">
          <button className="btn-outline" style={{ padding: "9px 20px", fontSize: 14 }}>Book a Call</button>
        </Link>
        <Link href="/contact">
          <button className="btn-main" style={{ padding: "9px 22px", fontSize: 14 }}>Start a Project</button>
        </Link>
      </div>

      {/* Mobile Hamburger */}
      <div className="flex md:hidden" style={{ gap: 10, alignItems: "center" }}>
        <button
          onClick={toggleTheme}
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="theme-toggle"
        >{dark ? "☀️" : "🌙"}</button>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "none", border: "1px solid rgba(124,58,237,.3)", borderRadius: 8, color: "#fff", fontSize: 18, padding: "6px 10px", cursor: "pointer" }}
        >{mobileOpen ? "✕" : "☰"}</button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{ position: "fixed", top: 68, left: 0, right: 0, background: "rgba(6,3,15,.98)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(124,58,237,.2)", padding: "20px 5% 28px", zIndex: 99 }}>
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
              style={{ display: "block", padding: "13px 0", borderBottom: "1px solid rgba(255,255,255,.04)", color: "#9d8fd4", fontSize: 16, textDecoration: "none" }}>
              {l.label}
            </Link>
          ))}
          <Link href="/contact" onClick={() => setMobileOpen(false)}>
            <button className="btn-main" style={{ width: "100%", padding: 14, fontSize: 15, marginTop: 20 }}>
              Start a Project
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}
