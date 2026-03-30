import Link from 'next/link'
import Image from 'next/image'

const serviceLinks = [
  { label: 'Web Development', href: '/services/web-development' },
  { label: 'Mobile Apps', href: '/services/mobile-app-development' },
  { label: 'Digital Marketing', href: '/services/digital-marketing' },
  { label: 'UI/UX Design', href: '/services/ui-ux-design' },
  { label: 'SaaS Development', href: '/services/saas-development' },
  { label: 'Music Promo', href: '/services/music-promotion' },
]

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Blog', href: '/blog' },
  { label: 'Donate 💜', href: '/donate' },
  { label: 'Contact', href: '/contact' },
]

const socials = [
  {
    label: 'Facebook',
    href: 'https://facebook.com/purplesofthub',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'Twitter/X',
    href: 'https://twitter.com/purplesofthub',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@purplesofthub',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/purplesofthub',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@purplesofthub',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
      </svg>
    ),
  },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <>
      <footer className="purplefoot-wrapper">

        {/* ── MAIN GRID ── */}
        <div className="purplefoot-container">
          <div className="purplefoot-grid">

            {/* Brand column */}
            <div className="purplefoot-brand">
              <Link href="/" style={{
                display: 'inline-block',
                marginBottom: '20px',
              }}>
                <Image
                  src="/images/logo/purplesoft-logo-main.png"
                  alt="PurpleSoftHub"
                  width={155}
                  height={44}
                  priority
                />
              </Link>

              <p className="purplefoot-tagline">
                Building smart digital products for businesses, startups, and creators worldwide.
              </p>

              {/* Social icons */}
              <div className="purplefoot-socials">
                {socials.map(s => (
                  <Link
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    className="purplefoot-social">
                    {s.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <p className="purplefoot-heading">Services</p>
              <ul className="purplefoot-list">
                {serviceLinks.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="purplefoot-link">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="purplefoot-heading">Company</p>
              <ul className="purplefoot-list">
                {companyLinks.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="purplefoot-link">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="purplefoot-heading">Contact</p>

              <div className="purplefoot-contact-list">

                <Link href="mailto:hello@purplesofthub.com" className="purplefoot-contact">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  hello@purplesofthub.com
                </Link>

                <Link href="https://wa.me/message/BPNJE7CPON3OJ1" target="_blank" className="purplefoot-contact">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp Us
                </Link>

                <Link href="https://purplesofthub.com" className="purplefoot-contact">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  purplesofthub.com
                </Link>
              </div>

              {/* CTA Button */}
              <Link href="/contact" className="purplefoot-cta">
                Book a Discovery Call →
              </Link>
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="purplefoot-bottom">
          <div className="purplefoot-bottom-inner">
            <p className="purplefoot-copy">
              © {year} PurpleSoftHub (Purplesoft Nigeria). All rights reserved.
            </p>
            <div className="purplefoot-bottom-links">
              <Link href="/privacy" className="purplefoot-link">
                Privacy Policy
              </Link>
              <Link href="/terms" className="purplefoot-link">
                Terms of Service
              </Link>
              <Link href="/donate" className="purplefoot-link">
                Donate 💜
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <style>{`

        /* ═══════════════════════════
           THEME VARIABLES
        ═══════════════════════════ */
        :root {
          --f-bg:         #f8f5ff;
          --f-border:     rgba(124,58,237,0.12);
          --f-heading:    #1a1a1a;
          --f-body:       #555555;
          --f-link:       #555555;
          --f-link-hover: #7c3aed;
          --f-copy:       #888888;
          --f-social-bg:  rgba(124,58,237,0.08);
          --f-social-br:  rgba(124,58,237,0.15);
          --f-social-fg:  #7c3aed;
        }

        .dark {
          --f-bg:         #0a0520;
          --f-border:     rgba(124,58,237,0.15);
          --f-heading:    #ffffff;
          --f-body:       #9d8fd4;
          --f-link:       #9d8fd4;
          --f-link-hover: #c084fc;
          --f-copy:       #6b5fa0;
          --f-social-bg:  rgba(124,58,237,0.12);
          --f-social-br:  rgba(124,58,237,0.22);
          --f-social-fg:  #a855f7;
        }

        /* ═══════════════════════════
           WRAPPER
        ═══════════════════════════ */
        .purplefoot-wrapper {
          background: var(--f-bg) !important;
          border-top: 1px solid var(--f-border) !important;
          margin-top: auto;
        }

        /* ═══════════════════════════
           CONTAINER
        ═══════════════════════════ */
        .purplefoot-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 64px 24px 48px;
        }

        /* ═══════════════════════════
           4-COLUMN GRID
        ═══════════════════════════ */
        .purplefoot-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
          gap: 48px;
        }

        /* ═══════════════════════════
           BRAND COLUMN
        ═══════════════════════════ */
        .purplefoot-tagline {
          font-size: 14px;
          line-height: 1.75;
          color: var(--f-body);
          margin: 0 0 28px;
          max-width: 260px;
        }

        .purplefoot-socials {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .purplefoot-social {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--f-social-bg);
          border: 1px solid var(--f-social-br);
          color: var(--f-social-fg) !important;
          text-decoration: none;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .purplefoot-social:hover {
          background: rgba(124,58,237,0.18);
          color: #a855f7 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(124,58,237,0.2);
        }

        /* ═══════════════════════════
           COLUMN HEADINGS
        ═══════════════════════════ */
        .purplefoot-heading {
          font-size: 12px !important;
          font-weight: 700 !important;
          letter-spacing: 0.09em !important;
          text-transform: uppercase !important;
          color: var(--f-heading) !important;
          margin: 0 0 20px !important;
        }

        /* ═══════════════════════════
           LINK LISTS
        ═══════════════════════════ */
        .purplefoot-list {
          list-style: none !important;
          padding: 0 !important;
          margin: 0 !important;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* ═══════════════════════════
           LINKS
        ═══════════════════════════ */
        .purplefoot-link {
          font-size: 14px !important;
          color: var(--f-link) !important;
          text-decoration: none !important;
          display: inline-block;
          transition: all 0.2s;
          line-height: 1.4;
        }

        .purplefoot-link:hover {
          color: var(--f-link-hover) !important;
          transform: translateX(3px);
        }

        /* ═══════════════════════════
           CONTACT ITEMS
        ═══════════════════════════ */
        .purplefoot-contact-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .purplefoot-contact {
          font-size: 13px !important;
          color: var(--f-link) !important;
          text-decoration: none !important;
          display: flex !important;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          line-height: 1.4;
        }

        .purplefoot-contact:hover {
          color: var(--f-link-hover) !important;
        }

        /* ═══════════════════════════
           CTA BUTTON
        ═══════════════════════════ */
        .purplefoot-cta {
          display: inline-flex !important;
          align-items: center;
          background: linear-gradient(135deg, #7c3aed, #a855f7) !important;
          color: #ffffff !important;
          padding: 11px 22px;
          border-radius: 100px;
          text-decoration: none !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          box-shadow: 0 4px 18px rgba(124,58,237,0.28);
          transition: all 0.2s;
          white-space: nowrap;
          margin-top: 4px;
        }

        .purplefoot-cta:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(124,58,237,0.38);
        }

        /* ═══════════════════════════
           BOTTOM BAR
        ═══════════════════════════ */
        .purplefoot-bottom {
          border-top: 1px solid var(--f-border);
          padding: 20px 24px;
        }

        .purplefoot-bottom-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .purplefoot-copy {
          font-size: 13px !important;
          color: var(--f-copy) !important;
          margin: 0 !important;
        }

        .purplefoot-bottom-links {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        /* ═══════════════════════════
           RESPONSIVE
        ═══════════════════════════ */
        @media (max-width: 1024px) {
          .purplefoot-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 600px) {
          .purplefoot-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .purplefoot-container {
            padding: 48px 20px 36px;
          }
          .purplefoot-bottom-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          .purplefoot-bottom-links {
            gap: 14px;
          }
        }
      `}</style>
    </>
  )
}
