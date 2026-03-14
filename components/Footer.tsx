"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import goldLogo from "@/Assets/images/Purplesoft-Gold-logo.png";
import purpleLogo from "@/Assets/images/Purple logo.png";

const SOCIALS = [
  { icon: "f", label: "Facebook", href: "https://facebook.com/purplesofthub", color: "#1877f2" },
  { icon: "𝕏", label: "Twitter", href: "https://twitter.com/purplesofthub", color: "#fff" },
  { icon: "♪", label: "TikTok", href: "https://tiktok.com/@purplesofthub", color: "#ff0050" },
  { icon: "◎", label: "Instagram", href: "https://instagram.com/purplesofthub", color: "#e1306c" },
  { icon: "▶", label: "YouTube", href: "https://youtube.com/@purplesofthub", color: "#ff0000" },
];

export default function Footer() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const update = () => {
      setDark(document.documentElement.getAttribute("data-theme") !== "light");
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <footer style={{ background: "#04020c", borderTop: "1px solid rgba(124,58,237,.15)", padding: "52px 5% 28px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <Image
                src={dark ? goldLogo : purpleLogo}
                alt="PurpleSoftHub Logo"
                height={dark ? 120 : 38}
                style={{ objectFit: "contain" }}
              />
            </div>
            <p style={{ color: "#3d2f60", fontSize: 14, lineHeight: 1.8, maxWidth: 260, marginBottom: 20 }}>
              Building smart digital products for businesses, startups, and creators worldwide.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", color: s.color, fontSize: 14, textDecoration: "none", transition: "all .2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(124,58,237,.2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.06)")}
                  aria-label={s.label}
                >{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <div style={{ fontFamily: "Outfit", fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 18 }}>Services</div>
            {["Web Development", "Mobile Apps", "Digital Marketing", "UI/UX Design", "SaaS Development", "Music Promo"].map((l) => (
              <Link key={l} href="/#services"
                style={{ display: "block", color: "#3d2f60", fontSize: 13, marginBottom: 11, textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#a855f7")}
                onMouseLeave={e => (e.currentTarget.style.color = "#3d2f60")}
              >{l}</Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <div style={{ fontFamily: "Outfit", fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 18 }}>Company</div>
            {[["About Us", "/#about"], ["Portfolio", "/#portfolio"], ["Blog", "/blog"], ["Contact", "/contact"]].map(([l, h]) => (
              <Link key={l} href={h}
                style={{ display: "block", color: "#3d2f60", fontSize: 13, marginBottom: 11, textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#a855f7")}
                onMouseLeave={e => (e.currentTarget.style.color = "#3d2f60")}
              >{l}</Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontFamily: "Outfit", fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 18 }}>Contact</div>
            <div style={{ color: "#3d2f60", fontSize: 13, marginBottom: 11 }}>hello@purplesofthub.com</div>
            <div style={{ color: "#3d2f60", fontSize: 13, marginBottom: 11 }}>purplesofthub.netlify.app</div>
            <Link href="/contact">
              <button className="btn-main" style={{ marginTop: 12, padding: "9px 18px", fontSize: 13 }}>
                Book a Discovery Call
              </button>
            </Link>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,.05)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ color: "#2a1f45", fontSize: 13 }}>© 2026 Purplesofthub. All rights reserved.</div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy Policy", "Terms of Service"].map((t) => (
              <Link key={t} href="/"
                style={{ color: "#2a1f45", fontSize: 13, textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#7c3aed")}
                onMouseLeave={e => (e.currentTarget.style.color = "#2a1f45")}
              >{t}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
