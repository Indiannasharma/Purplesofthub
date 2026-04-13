"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import purpleLogo from "@/Assets/images/Purplesoft-logo-main.png";
import { createClient } from "@/lib/supabase/client";

function SunIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function MoonIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function UserIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}

function DashboardIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}

function MenuIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Academy", href: "/academy" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Music", href: "/#music" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const mobileMenuVariants = {
  closed: { opacity: 0, height: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const } },
  open: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const } },
};

const listItemVariants = {
  closed: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

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
        const role = session.user.user_metadata?.role || session.user.app_metadata?.role || 'client';
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
        const role = session.user.user_metadata?.role || session.user.app_metadata?.role || 'client';
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
    let isDark = saved ? saved === "dark" : true;
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const toggleMobile = useCallback(() => setMobileOpen(prev => !prev), []);

  const navBg = dark
    ? scrolled ? "rgba(6, 3, 15, 0.98)" : "rgba(6, 3, 15, 0.75)"
    : scrolled ? "rgba(255, 255, 255, 0.98)" : "rgba(255, 255, 255, 0.82)";

  const navBorder = dark ? "rgba(124, 58, 237, 0.25)" : "rgba(124, 58, 237, 0.12)";
  const navShadow = scrolled
    ? dark ? "0 4px 32px rgba(124, 58, 237, 0.15), 0 1px 0 rgba(168, 85, 247, 0.1) inset" : "0 4px 32px rgba(124, 58, 237, 0.08), 0 1px 0 rgba(255, 255, 255, 0.5) inset"
    : dark ? "0 2px 16px rgba(124, 58, 237, 0.08)" : "0 2px 16px rgba(124, 58, 237, 0.04)";

  const blurAmount = scrolled ? "blur(24px) saturate(180%)" : "blur(16px) saturate(150%)";
  const linkColor = dark ? "#9d8fd4" : "#4a3f6b";
  const linkHoverColor = dark ? "#e2d9f3" : "#1a0533";
  const linkHoverBg = dark ? "rgba(124, 58, 237, 0.12)" : "rgba(124, 58, 237, 0.06)";

  const outlineBtnBase = {
    background: "transparent" as const,
    border: `1.5px solid ${dark ? "rgba(168, 85, 247, 0.4)" : "rgba(124, 58, 237, 0.35)"}`,
    borderRadius: 10,
    color: dark ? "#c084fc" : "#6d28d9",
    fontFamily: "Outfit, sans-serif",
    fontWeight: 600,
    cursor: "pointer" as const,
    padding: "0 18px",
    fontSize: 13.5,
    height: 40,
    display: "inline-flex" as const,
    alignItems: "center" as const,
    gap: 6,
    transition: "all 0.25s ease",
    whiteSpace: "nowrap" as const,
    textDecoration: "none" as const,
    boxSizing: "border-box" as const,
  };

  const ctaBtnBase = {
    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
    border: "none",
    borderRadius: 10,
    color: "#fff",
    fontFamily: "Outfit, sans-serif",
    fontWeight: 700,
    cursor: "pointer" as const,
    padding: "0 24px",
    fontSize: 14,
    height: 40,
    display: "inline-flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    whiteSpace: "nowrap" as const,
    textDecoration: "none" as const,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: dark
      ? "0 4px 20px rgba(124, 58, 237, 0.4), 0 0 0 1px rgba(168, 85, 247, 0.2)"
      : "0 4px 16px rgba(124, 58, 237, 0.3)",
    position: "relative" as const,
    overflow: "hidden" as const,
    boxSizing: "border-box" as const,
  };

  return (
    <nav
      className="premium-navbar border-b border-[var(--color-stroke)]/30"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        minHeight: 72,
        background: navBg,
        backdropFilter: blurAmount,
        WebkitBackdropFilter: blurAmount,
        borderBottom: `1px solid ${navBorder}`,
        boxShadow: navShadow,
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Top Glow Line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: dark
            ? "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.5), rgba(34, 211, 238, 0.3), transparent)"
            : "linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.3), rgba(34, 211, 238, 0.2), transparent)",
          opacity: scrolled ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="relative z-[2] flex shrink-0 items-center no-underline"
        >
          <Image
            src={purpleLogo}
            alt="PurpleSoftHub"
            width={170}
            height={52}
            className="cyber-logo h-9 w-auto max-w-[140px] sm:h-10 sm:max-w-[170px] lg:h-[52px]"
            priority
            style={{
              filter: dark
                ? "drop-shadow(0 0 10px rgba(124, 58, 237, 0.5))"
                : "drop-shadow(0 0 6px rgba(124, 58, 237, 0.3))",
              transition: "filter 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.filter = dark
                ? "drop-shadow(0 0 18px rgba(168, 85, 247, 0.8))"
                : "drop-shadow(0 0 12px rgba(124, 58, 237, 0.6))")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.filter = dark
                ? "drop-shadow(0 0 10px rgba(124, 58, 237, 0.5))"
                : "drop-shadow(0 0 6px rgba(124, 58, 237, 0.3))")
            }
          />
        </Link>

        {/* Desktop Nav Links — display controlled by globals.css (.nav-desktop); never set display inline here */}
        <div className="nav-desktop nav-desktop-links">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="nav-link-desktop"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: linkColor,
                textDecoration: "none",
                padding: "8px 10px",
                borderRadius: 8,
                whiteSpace: "nowrap",
                position: "relative",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = linkHoverColor;
                e.currentTarget.style.background = linkHoverBg;
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = linkColor;
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {l.label}
              <span
                style={{
                  position: "absolute",
                  bottom: 4,
                  left: "50%",
                  transform: "translateX(-50%) scaleX(0)",
                  width: "80%",
                  height: "2px",
                  borderRadius: 1,
                  background: dark
                    ? "linear-gradient(90deg, #a855f7, #22d3ee)"
                    : "linear-gradient(90deg, #7c3aed, #a855f7)",
                  transition: "transform 0.25s ease",
                  boxShadow: dark
                    ? "0 0 8px rgba(168, 85, 247, 0.5)"
                    : "0 0 6px rgba(124, 58, 237, 0.3)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateX(-50%) scaleX(1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateX(-50%) scaleX(0)")
                }
              />
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="nav-desktop shrink-0 gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="theme-toggle-btn"
            style={{
              background: dark ? "rgba(124, 58, 237, 0.12)" : "rgba(124, 58, 237, 0.06)",
              border: `1px solid ${dark ? "rgba(168, 85, 247, 0.3)" : "rgba(124, 58, 237, 0.15)"}`,
              borderRadius: 10,
              color: dark ? "#c084fc" : "#7c3aed",
              fontSize: 16,
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.25s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = dark
                ? "rgba(124, 58, 237, 0.25)"
                : "rgba(124, 58, 237, 0.12)";
              e.currentTarget.style.boxShadow = dark
                ? "0 0 16px rgba(168, 85, 247, 0.3)"
                : "0 0 12px rgba(124, 58, 237, 0.2)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = dark
                ? "rgba(124, 58, 237, 0.12)"
                : "rgba(124, 58, 237, 0.06)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {!isSignedIn && (
            <Link
              href="/sign-in"
              className="nav-btn-outline"
              style={outlineBtnBase}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = dark ? "#a855f7" : "#7c3aed";
                e.currentTarget.style.background = dark
                  ? "rgba(124, 58, 237, 0.1)"
                  : "rgba(124, 58, 237, 0.06)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = dark
                  ? "0 4px 16px rgba(168, 85, 247, 0.2)"
                  : "0 4px 12px rgba(124, 58, 237, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = dark
                  ? "rgba(168, 85, 247, 0.4)"
                  : "rgba(124, 58, 237, 0.35)";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <UserIcon /> Client Login
            </Link>
          )}
          {isSignedIn && (
            <Link
              href={portalHref}
              className="nav-btn-outline"
              style={outlineBtnBase}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = dark ? "#a855f7" : "#7c3aed";
                e.currentTarget.style.background = dark
                  ? "rgba(124, 58, 237, 0.1)"
                  : "rgba(124, 58, 237, 0.06)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = dark
                  ? "0 4px 16px rgba(168, 85, 247, 0.2)"
                  : "0 4px 12px rgba(124, 58, 237, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = dark
                  ? "rgba(168, 85, 247, 0.4)"
                  : "rgba(124, 58, 237, 0.35)";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <DashboardIcon /> {portalLabel}
            </Link>
          )}

          <Link
            href="/contact"
            className="nav-cta-btn"
            style={ctaBtnBase}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = dark
                ? "0 8px 32px rgba(124, 58, 237, 0.6), 0 0 0 1px rgba(168, 85, 247, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
                : "0 8px 28px rgba(124, 58, 237, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = dark
                ? "0 4px 20px rgba(124, 58, 237, 0.4), 0 0 0 1px rgba(168, 85, 247, 0.2)"
                : "0 4px 16px rgba(124, 58, 237, 0.3)";
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                transition: "left 0.5s ease",
                pointerEvents: "none",
              }}
            />
            Start a Project
          </Link>
        </div>

        {/* Mobile Controls — single theme toggle + menu; visibility from globals only */}
        <div className="nav-mobile relative z-[2] shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              background: dark ? "rgba(124, 58, 237, 0.12)" : "rgba(124, 58, 237, 0.06)",
              border: `1px solid ${dark ? "rgba(168, 85, 247, 0.3)" : "rgba(124, 58, 237, 0.15)"}`,
              borderRadius: 10,
              color: dark ? "#c084fc" : "#7c3aed",
              fontSize: 16,
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.25s ease",
              flexShrink: 0,
            }}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          <button
            type="button"
            onClick={toggleMobile}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen ? "true" : "false"}
            style={{
              background: dark ? "rgba(124, 58, 237, 0.15)" : "rgba(124, 58, 237, 0.08)",
              border: `1px solid ${dark ? "rgba(168, 85, 247, 0.3)" : "rgba(124, 58, 237, 0.2)"}`,
              borderRadius: 10,
              color: dark ? "#e2d9f3" : "#1a0533",
              fontSize: 18,
              padding: "9px 12px",
              cursor: "pointer",
              transition: "all 0.25s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = dark
                ? "rgba(124, 58, 237, 0.25)"
                : "rgba(124, 58, 237, 0.15)";
              e.currentTarget.style.borderColor = dark ? "#a855f7" : "#7c3aed";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = dark
                ? "rgba(124, 58, 237, 0.15)"
                : "rgba(124, 58, 237, 0.08)";
              e.currentTarget.style.borderColor = dark
                ? "rgba(168, 85, 247, 0.3)"
                : "rgba(124, 58, 237, 0.2)";
            }}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div variants={mobileMenuVariants} initial="closed" animate="open" exit="closed" style={{
            position: "fixed", top: 72, left: 0, right: 0,
            background: dark ? "rgba(6, 3, 15, 0.98)" : "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)",
            borderBottom: `1px solid ${dark ? "rgba(124, 58, 237, 0.25)" : "rgba(124, 58, 237, 0.12)"}`,
            boxShadow: dark ? "0 16px 48px rgba(124, 58, 237, 0.15)" : "0 16px 48px rgba(124, 58, 237, 0.08)",
            padding: "24px 5% 32px", zIndex: 999, overflow: "hidden",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {NAV_LINKS.map((l, i) => (
                <motion.div key={l.label} custom={i} variants={listItemVariants}>
                  <Link href={l.href} onClick={() => setMobileOpen(false)} style={{
                    display: "block", padding: "14px 16px",
                    borderBottom: `1px solid ${dark ? "rgba(124, 58, 237, 0.1)" : "rgba(124, 58, 237, 0.06)"}`,
                    color: dark ? "#9d8fd4" : "#4a3f6b", fontSize: 16, fontWeight: 500,
                    textDecoration: "none", borderRadius: 8, transition: "all 0.2s ease",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = dark ? "#e2d9f3" : "#1a0533"; e.currentTarget.style.background = dark ? "rgba(124, 58, 237, 0.1)" : "rgba(124, 58, 237, 0.05)"; e.currentTarget.style.paddingLeft = "24px"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = dark ? "#9d8fd4" : "#4a3f6b"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.paddingLeft = "16px"; }}
                  >{l.label}</Link>
                </motion.div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              {!isSignedIn && (
                <Link href="/sign-in" onClick={() => setMobileOpen(false)} style={{
                  flex: 1, width: "100%", background: "transparent",
                  border: `1.5px solid ${dark ? "rgba(168, 85, 247, 0.4)" : "rgba(124, 58, 237, 0.35)"}`,
                  borderRadius: 12, color: dark ? "#c084fc" : "#6d28d9",
                  fontFamily: "Outfit, sans-serif", fontWeight: 600, cursor: "pointer",
                  padding: 14, fontSize: 15, display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8, transition: "all 0.25s ease",
                  textDecoration: "none",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = dark ? "#a855f7" : "#7c3aed"; e.currentTarget.style.background = dark ? "rgba(124, 58, 237, 0.1)" : "rgba(124, 58, 237, 0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = dark ? "rgba(168, 85, 247, 0.4)" : "rgba(124, 58, 237, 0.35)"; e.currentTarget.style.background = "transparent"; }}
                ><UserIcon /> Client Login
                </Link>
              )}
              {isSignedIn && (
                <Link href={portalHref} onClick={() => setMobileOpen(false)} style={{
                  flex: 1, width: "100%", background: "transparent",
                  border: `1.5px solid ${dark ? "rgba(168, 85, 247, 0.4)" : "rgba(124, 58, 237, 0.35)"}`,
                  borderRadius: 12, color: dark ? "#c084fc" : "#6d28d9",
                  fontFamily: "Outfit, sans-serif", fontWeight: 600, cursor: "pointer",
                  padding: 14, fontSize: 15, display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8, transition: "all 0.25s ease",
                  textDecoration: "none",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = dark ? "#a855f7" : "#7c3aed"; e.currentTarget.style.background = dark ? "rgba(124, 58, 237, 0.1)" : "rgba(124, 58, 237, 0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = dark ? "rgba(168, 85, 247, 0.4)" : "rgba(124, 58, 237, 0.35)"; e.currentTarget.style.background = "transparent"; }}
                ><DashboardIcon /> {portalLabel}
                </Link>
              )}
              <Link href="/contact" onClick={() => setMobileOpen(false)} className="cyber-btn-primary" style={{
                flex: 1, width: "100%", padding: 14, fontSize: 15, borderRadius: 12,
                boxShadow: dark ? "0 4px 20px rgba(124, 58, 237, 0.4)" : "0 4px 16px rgba(124, 58, 237, 0.3)",
                textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                Start a Project
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}