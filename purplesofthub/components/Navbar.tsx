"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import purpleLogo from "@/Assets/images/Purplesoft-logo-main.png";
import { createClient } from "@/lib/supabase/client";

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
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/services/web-development/pricing" },
  { label: "Academy", href: "/academy" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Music", href: "/#music" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const portalHref = isAdmin ? '/admin' : '/dashboard';
  const portalLabel = isAdmin ? 'Admin Panel' : 'Dashboard';

  useEffect(() => {
    const supabase = createClient();

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsSignedIn(true);
        const role =
          session.user.user_metadata?.role ||
          session.user.app_metadata?.role ||
          'client';
        setIsAdmin(role === 'admin');
      } else {
        setIsSignedIn(false);
        setIsAdmin(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsSignedIn(true);
        const role =
          session.user.user_metadata?.role ||
          session.user.app_metadata?.role ||
          'client';
        setIsAdmin(role === 'admin');
      } else {
        setIsSignedIn(false);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    let isDark = false;
    if (saved) {
      isDark = saved === "dark";
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
    : scrolled ? "rgba(240,235,255,.97)" : "rgba(240,235,255,.85)";

  const navLinkColor = dark ? "#9d8fd4" : "#4a3f6b";
  const navLinkHover = "#a855f7";
  const navLinkActive = "#7c3aed";

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 68, padding: "0 5%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: navBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid var(--cyber-border)`,
        boxShadow: "0 4px 24px var(--cyber-glow)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <Image
          src={purpleLogo}
          alt="PurpleSoftHub"
          width={180}
          height={56}
          className="cyber-logo"
          priority
        />
      </Link>

      {/* Desktop Nav Links */}
      <div className="nav-desktop" style={{ gap: 28, alignItems: "center" }}>
        {NAV_LINKS.map((l) => (
          <Link key={l.label} href={l.href}
            style={{
              fontSize: 14, fontWeight: 500, color: navLinkColor,
              textDecoration: "none", transition: "all .2s",
              whiteSpace: "nowrap", position: "relative",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = navLinkHover;
              e.currentTarget.style.textShadow = "0 0 10px rgba(124,58,237,0.3)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = navLinkColor;
              e.currentTarget.style.textShadow = "none";
            }}
          >{l.label}</Link>
        ))}
      </div>

      {/* Desktop Actions */}
      <div className="nav-desktop" style={{ gap: 10, alignItems: "center" }}>
        <button
          onClick={toggleTheme}
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            background: "var(--cyber-input-bg)",
            border: "1px solid var(--cyber-border)",
            borderRadius: 8,
            color: dark ? "#c084fc" : "#7c3aed",
            fontSize: 16,
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            transition: "all .2s",
            flexShrink: 0,
          }}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
        {!isSignedIn && (
          <Link href="/sign-in">
            <button
              style={{
                background: "transparent",
                border: "1.5px solid rgba(124,58,237,0.4)",
                borderRadius: 10,
                color: dark ? "#c084fc" : "#6d28d9",
                fontFamily: "Outfit, sans-serif",
                fontWeight: 600,
                cursor: "pointer",
                padding: "10px 18px",
                fontSize: 13,
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#a855f7";
                e.currentTarget.style.background = "rgba(124,58,237,0.08)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              Client Login
            </button>
          </Link>
        )}
        {isSignedIn && (
          <Link href={portalHref}>
            <button
              style={{
                background: "transparent",
                border: "1.5px solid rgba(124,58,237,0.4)",
                borderRadius: 10,
                color: dark ? "#c084fc" : "#6d28d9",
                fontFamily: "Outfit, sans-serif",
                fontWeight: 600,
                cursor: "pointer",
                padding: "10px 18px",
                fontSize: 13,
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#a855f7";
                e.currentTarget.style.background = "rgba(124,58,237,0.08)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              {portalLabel}
            </button>
          </Link>
        )}
        <Link href="/contact">
          <button
            className="cyber-btn-primary"
            style={{ padding: "10px 22px", fontSize: 14 }}
          >
            Start a Project
          </button>
        </Link>
      </div>

      {/* Mobile Controls */}
      <div className="nav-mobile" style={{ gap: 10, alignItems: "center" }}>
        <button
          onClick={toggleTheme}
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            background: "var(--cyber-input-bg)",
            border: "1px solid var(--cyber-border)",
            borderRadius: 8,
            color: dark ? "#c084fc" : "#7c3aed",
            fontSize: 16,
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            transition: "all .2s",
            flexShrink: 0,
          }}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: "var(--cyber-card)",
            border: `1px solid var(--cyber-border)`,
            borderRadius: 8,
            color: dark ? "#fff" : "#1a1a2e",
            fontSize: 18,
            padding: "8px 12px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >{mobileOpen ? "✕" : "☰"}</button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              position: "fixed", top: 68, left: 0, right: 0,
              background: dark ? "var(--cyber-bg)" : "var(--cyber-bg)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid var(--cyber-border)",
              padding: "20px 5% 28px", zIndex: 99,
              overflow: "hidden",
            }}>
            {NAV_LINKS.map((l) => (
              <Link key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                style={{
                  display: "block", padding: "13px 0",
                  borderBottom: `1px solid var(--cyber-border)`,
                  color: dark ? "#9d8fd4" : "#4a3f6b",
                  fontSize: 16, textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "#a855f7";
                  e.currentTarget.style.background = "rgba(124,58,237,0.08)";
                  (e.currentTarget as HTMLElement).style.paddingLeft = "12px";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = dark ? "#9d8fd4" : "#4a3f6b";
                  e.currentTarget.style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.paddingLeft = "0px";
                }}
              >
                {l.label}
              </Link>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {!isSignedIn && (
                <Link href="/sign-in" onClick={() => setMobileOpen(false)} style={{ flex: 1 }}>
                  <button
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "1.5px solid rgba(124,58,237,0.4)",
                      borderRadius: 10,
                      color: dark ? "#c084fc" : "#6d28d9",
                      fontFamily: "Outfit, sans-serif",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 14,
                      fontSize: 15,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      transition: "all 0.2s",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    Client Login
                  </button>
                </Link>
              )}
              {isSignedIn && (
                <Link href={portalHref} onClick={() => setMobileOpen(false)} style={{ flex: 1 }}>
                  <button
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "1.5px solid rgba(124,58,237,0.4)",
                      borderRadius: 10,
                      color: dark ? "#c084fc" : "#6d28d9",
                      fontFamily: "Outfit, sans-serif",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 14,
                      fontSize: 15,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      transition: "all 0.2s",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    {portalLabel}
                  </button>
                </Link>
              )}
              <Link href="/contact" onClick={() => setMobileOpen(false)} style={{ flex: 1 }}>
                <button className="cyber-btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }}>
                  Start a Project
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}