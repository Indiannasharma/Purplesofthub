"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import purpleLogo from "@/Assets/images/Purplesoft-logo-main.png";

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2"  x2="12" y2="4"  />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"  />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="2"  y1="12" x2="4"  y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

const NAV_LINKS = [
  { label: "Solutions", href: "/#services" },
  { label: "Academy", href: "/blog" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Music", href: "/#music" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false); // default light

  useEffect(() => {
    // Determine initial theme
    const saved = localStorage.getItem("theme");
    let isDark = false;
    if (saved) {
      isDark = saved === "dark";
    } else {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    setDark(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navBg = dark
    ? scrolled ? "rgba(6,3,15,.97)" : "rgba(6,3,15,.75)"
    : scrolled ? "rgba(255,255,255,.97)" : "rgba(255,255,255,.88)";

  const navLinkColor = dark ? "#b8a9d9" : "#4a2d6b";
  const navLinkHover = dark ? "#e2d9f3" : "#7c3aed";

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 68, padding: "0 5%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: navBg,
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderBottom: dark
          ? "1px solid rgba(124,58,237,.18)"
          : "1px solid rgba(124,58,237,.15)",
        boxShadow: dark ? "none" : "0 1px 0 rgba(124,58,237,.08)",
        transition: "all .3s",
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <Image
          src={purpleLogo}
          alt="PurpleSoftHub"
          width={180}
          height={56}
          style={{ objectFit: "contain" }}
          priority
        />
      </Link>

      {/* Desktop Nav Links */}
      <div className="nav-desktop" style={{ gap: 28, alignItems: "center" }}>
        {NAV_LINKS.map((l) => (
          <Link key={l.label} href={l.href}
            style={{ fontSize: 14, fontWeight: 500, color: navLinkColor, textDecoration: "none", transition: "color .2s", whiteSpace: "nowrap" }}
            onMouseEnter={e => (e.currentTarget.style.color = navLinkHover)}
            onMouseLeave={e => (e.currentTarget.style.color = navLinkColor)}
          >{l.label}</Link>
        ))}
      </div>

      {/* Desktop Actions */}
      <div className="nav-desktop" style={{ gap: 10, alignItems: "center" }}>
        <button
          onClick={toggleTheme}
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="theme-toggle"
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
        <Link href="/contact">
          <button className="btn-outline" style={{ padding: "9px 18px", fontSize: 13 }}>Book a Call</button>
        </Link>
        <Link href="/contact">
          <button className="btn-main" style={{ padding: "9px 20px", fontSize: 13 }}>Start a Project</button>
        </Link>
      </div>

      {/* Mobile Controls */}
      <div className="nav-mobile" style={{ gap: 10, alignItems: "center" }}>
        <button
          onClick={toggleTheme}
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="theme-toggle"
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: "none",
            border: `1px solid ${dark ? "rgba(124,58,237,.3)" : "rgba(124,58,237,.25)"}`,
            borderRadius: 8, color: dark ? "#fff" : "#4a2d6b",
            fontSize: 18, padding: "6px 10px", cursor: "pointer",
          }}
        >{mobileOpen ? "✕" : "☰"}</button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          position: "fixed", top: 68, left: 0, right: 0,
          background: dark ? "rgba(6,3,15,.98)" : "rgba(255,255,255,.98)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(124,58,237,.15)",
          padding: "20px 5% 28px", zIndex: 99,
        }}>
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
              style={{
                display: "block", padding: "13px 0",
                borderBottom: `1px solid ${dark ? "rgba(255,255,255,.04)" : "rgba(124,58,237,.08)"}`,
                color: dark ? "#9d8fd4" : "#4a2d6b",
                fontSize: 16, textDecoration: "none",
              }}>
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
