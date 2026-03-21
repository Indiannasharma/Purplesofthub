# PurpleSoftHub — Next.js Website

A full-stack Next.js 16 website for PurpleSoftHub digital innovation studio with admin and client dashboards.

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Styling:** Tailwind CSS + Custom CSS
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth (JWT-based)
- **Email:** Nodemailer (Gmail)
- **Analytics:** Google Analytics 4
- **Image CDN:** Cloudinary
- **Caching:** Upstash Redis
- **Hosting:** Vercel
- **Admin Panel:** TailAdmin (admin dashboard)

---

## ⚡ Quick Start

### 1. Clone and install dependencies

```bash
git clone https://github.com/yourusername/purplesofthub.git
cd purplesofthub
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your real values:

```env
# ─── Supabase (PostgreSQL + Auth) ───────────────────
NEXT_PUBLIC_SUPABASE_URL=https://japscxueoenflsucqtry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ─── Email (Gmail) ─────────────────────────────────
EMAIL_USER=hello@purplesofthub.com
EMAIL_PASS=your_gmail_app_password
EMAIL_TO=hello@purplesofthub.com

# ─── Analytics ─────────────────────────────────────
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://purplesofthub.com

# ─── APIs ──────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-api03-...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Setting Up Supabase Auth & Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to **Settings → API** to get your credentials:
   - Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **Anon Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy **Service Role Secret** → `SUPABASE_SERVICE_ROLE_KEY`
3. Set up authentication users in **Authentication → Users**
4. Create database tables as needed in **SQL Editor**

---

## 📧 Setting Up Gmail for Nodemailer

1. Go to your Google Account → Security
2. Enable **2-Factor Authentication**
3. Go to **App Passwords**
4. Generate a new app password for "Mail"
5. Use that password as `EMAIL_PASS` in `.env.local`

---

## 📊 Setting Up Google Analytics

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create a new GA4 property
3. Copy your Measurement ID (format: `G-XXXXXXXXXX`)
4. Add to `NEXT_PUBLIC_GA_ID` in `.env.local`

---

## 🌐 Deploying to Vercel

### Automatic Deployment (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Add New → Project
3. Import your GitHub repository
4. Vercel will automatically detect Next.js
5. Add all environment variables in **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_TO`
   - `NEXT_PUBLIC_GA_ID`
   - `ANTHROPIC_API_KEY`
   - `CLOUDINARY_CLOUD_NAME`
   - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
6. Click **Deploy**
7. Future pushes to `main` branch will auto-deploy

### Manual Deployment with Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 📁 Project Structure

```
purplesofthub/
├── app/
│   ├── layout.tsx                    ← Root layout + SEO + Analytics
│   ├── page.tsx                      ← Home page
│   ├── globals.css                   ← Global styles
│   ├── admin/                        ← Admin Dashboard (TailAdmin)
│   │   ├── page.tsx                  ← Admin overview
│   │   ├── clients/                  ← Client management
│   │   ├── projects/                 ← Project management
│   │   ├── invoices/                 ← Invoice management
│   │   ├── services/                 ← Service management
│   │   └── settings/                 ← Admin settings
│   ├── dashboard/                    ← Client Dashboard
│   │   ├── page.tsx                  ← Client overview
│   │   ├── projects/                 ← View projects
│   │   ├── invoices/                 ← View invoices
│   │   └── settings/                 ← Client settings
│   ├── services/
│   │   └── page.tsx                  ← Services listing page
│   ├── blog/
│   │   ├── page.tsx                  ← Blog listing
│   │   └── [slug]/page.tsx          ← Blog post (MDX)
│   ├── portfolio/
│   │   └── [slug]/page.tsx          ← Portfolio case studies
│   ├── contact/
│   │   └── page.tsx                  ← Contact page
│   ├── sign-in/                      ← Supabase Auth UI
│   ├── sign-up/                      ← Supabase Auth UI
│   └── api/
│       ├── admin/                    ← Admin API routes
│       ├── chat/                     ← Chat API
│       ├── contact/                  ← Contact form API
│       ├── newsletter/               ← Newsletter subscription
│       └── webhooks/                 ← Clerk/Supabase webhooks
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ContactForm.tsx
│   └── Reveal.tsx
├── lib/
│   ├── supabase.ts                   ← Supabase client
│   └── models/
│       ├── Client.ts
│       ├── Project.ts
│       └── Invoice.ts
├── .env.local.example
├── next.config.mjs
├── tailwind.config.js
├── tsconfig.json
└── middleware.ts                     ← Auth middleware
```

---

## 🔮 Development Phases

- **✅ Phase 1:** Landing page, blog, portfolio (Completed)
- **🔄 Phase 2:** Admin & Client dashboards, Supabase Auth, project management (In Progress)
- **📋 Phase 3:** Advanced features, analytics, team collaboration
- **🚀 Phase 4:** AI services, automation, enterprise features

---

## 📦 Build & Performance

- **Framework:** Next.js 16 with Turbopack (Fast builds)
- **Rendering:** Static generation + Server-Side Rendering
- **Database Query:** Optimized with caching
- **Image Optimization:** Cloudinary integration
- **Analytics:** Real-time GA4 tracking

---

## 🔗 Useful Links

- **Live Site:** [purplesofthub.vercel.app](https://purplesofthub.vercel.app)
- **Supabase Dashboard:** [supabase.com/dashboard](https://supabase.com/dashboard)
- **Vercel Dashboard:** [vercel.com/dashboard](https://vercel.com/dashboard)
- **GitHub Repository:** [github.com/Indiannasharma/Purplesofthub](https://github.com/Indiannasharma/Purplesofthub)
- **Admin Panel:** `/admin` (requires authentication)
- **Client Dashboard:** `/dashboard` (requires authentication)

---

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server at http://localhost:3000

# Production
npm run build            # Build for production
npm start                # Start production server

# Linting & Formatting
npm run lint             # Run ESLint

# Type Checking
npm run type-check       # Run TypeScript type checking
```

---

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -m "feat: add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

---

## 📄 License

This project is proprietary to PurpleSoftHub.

---

Built with 💜 by [PurpleSoftHub](https://purplesofthub.com)
