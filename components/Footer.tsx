import Link from 'next/link'
import Image from 'next/image'
import purpleLogo from '@/Assets/images/Purplesoft-logo-main.png'

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
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    href: 'https://twitter.com/purplesofthub',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@purplesofthub',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/purplesofthub',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
      </svg>
    ),
  },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      {/* ── MAIN GRID ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <Image src={purpleLogo} alt="PurpleSoftHub" width={155} height={44} className="h-auto w-auto" />
            </Link>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 max-w-xs">
              Building smart digital products for businesses, startups, and creators worldwide.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-4">
              {socials.map(s => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-4">Services</p>
            <ul className="space-y-3">
              {serviceLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-4">Company</p>
            <ul className="space-y-3">
              {companyLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-4">Contact</p>

            <div className="space-y-3">
              <Link href="mailto:hello@purplesofthub.com" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                hello@purplesofthub.com
              </Link>

              <Link href="https://wa.me/message/BPNJE7CPON3OJ1" target="_blank" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.67-1.612-.918-2.207-.24-.579-.487-.501-.67-.51-.173-.008-.371-.01-.57-.01-.197 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.627.71.227 1.355.195 1.867.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.006a6.507 6.507 0 0 0-6.473 6.487c0 1.429.356 2.822 1.031 4.047L4.54 19.94l4.408-1.158a6.482 6.482 0 0 0 3.877 1.238h.005c3.582 0 6.479-2.907 6.479-6.49 0-1.733-.675-3.361-1.901-4.588-1.226-1.227-2.856-1.902-4.588-1.902" />
                </svg>
                WhatsApp Support
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-4">Legal</p>
            <ul className="space-y-3">
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>© {year} PurpleSoftHub. All rights reserved.</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Built with 💜 by PurpleSoftHub
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
