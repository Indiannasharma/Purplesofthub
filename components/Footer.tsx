"use client";
import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaTwitter, FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";
import purpleLogo from "@/Assets/images/Purplesoft-logo-main.png";

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com/purplesofthub", icon: FaFacebook },
  { label: "Twitter", href: "https://twitter.com/purplesofthub", icon: FaTwitter },
  { label: "TikTok", href: "https://tiktok.com/@purplesofthub", icon: FaTiktok },
  { label: "Instagram", href: "https://instagram.com/purplesofthub", icon: FaInstagram },
  { label: "YouTube", href: "https://youtube.com/@purplesofthub", icon: FaYoutube },
];

const SERVICE_LINKS: [string, string][] = [
  ["Web Development", "/services/web-development"],
  ["Mobile Apps", "/services/mobile-app-development"],
  ["Digital Marketing", "/services/digital-marketing"],
  ["UI/UX Design", "/services/ui-ux-design"],
  ["SaaS Development", "/services/saas-development"],
  ["Music Promo", "/services/music-promotion"],
];
const COMPANY_LINKS: [string, string][] = [["About Us", "/about"], ["Portfolio", "/portfolio"], ["Blog", "/blog"], ["Contact", "/contact"]];

export default function Footer() {
  return (
    <footer style={{
      background: "var(--footer-bg)",
      borderTop: "1px solid rgba(124,58,237,.2)",
      padding: "56px 5% 28px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>

          {/* Brand */}
          <div>
            <div style={{ marginBottom: 18 }}>
              <Image
                src={purpleLogo}
                alt="PurpleSoftHub Logo"
                width={210}
                height={70}
                style={{ objectFit: "contain" }}
              />
            </div>
            <p style={{ color: "#9d8fd4", fontSize: 14, lineHeight: 1.8, maxWidth: 260, marginBottom: 22 }}>
              Building smart digital products for businesses, startups, and creators worldwide.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {SOCIALS.map((s) => {
                const IconComponent = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    style={{
                      color: "#a855f7",
                      textDecoration: "none",
                      transition: "all .2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = "#c084fc";
                      e.currentTarget.style.transform = "scale(1.2)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = "#a855f7";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <IconComponent size={24} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Services */}
          <div>
            <div style={{ fontFamily: "Outfit", fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 18 }}>Services</div>
            {SERVICE_LINKS.map(([l, h]) => (
              <Link key={l} href={h}
                style={{ display: "block", color: "#9d8fd4", fontSize: 13, marginBottom: 11, textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#a855f7")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9d8fd4")}
              >{l}</Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <div style={{ fontFamily: "Outfit", fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 18 }}>Company</div>
            {COMPANY_LINKS.map(([l, h]) => (
              <Link key={l} href={h}
                style={{ display: "block", color: "#9d8fd4", fontSize: 13, marginBottom: 11, textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#a855f7")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9d8fd4")}
              >{l}</Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontFamily: "Outfit", fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 18 }}>Contact</div>
            <div style={{ color: "#c084fc", fontSize: 13, marginBottom: 11 }}>hello@purplesofthub.com</div>
            <div style={{ fontSize: 13, marginBottom: 11 }}>
              <a href="https://purplesofthub.com" target="_blank" rel="noopener noreferrer" style={{ color: "#c084fc", textDecoration: "none" }}>purplesofthub.com</a>
            </div>
            <Link href="/contact">
              <button className="btn-main" style={{ marginTop: 12, padding: "9px 18px", fontSize: 13 }}>
                Book a Discovery Call
              </button>
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,.06)",
          paddingTop: 24,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ color: "#5b4d8a", fontSize: 13 }}>© 2026 Purplesofthub. All rights reserved.</div>
          <div style={{ display: "flex", gap: 24 }}>
            {[["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]].map(([t, h]) => (
              <Link key={t} href={h}
                style={{ color: "#5b4d8a", fontSize: 13, textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#a855f7")}
                onMouseLeave={e => (e.currentTarget.style.color = "#5b4d8a")}
              >{t}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
