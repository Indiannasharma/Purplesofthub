# PurpleSoftHub — Next.js Website

A full-stack Next.js 14 website for PurpleSoftHub digital innovation studio.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Custom CSS
- **Database:** MongoDB (via Mongoose)
- **Email:** Nodemailer (Gmail)
- **Analytics:** Google Analytics 4
- **Hosting:** Netlify

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
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/purplesofthub
EMAIL_USER=hello@purplesofthub.com
EMAIL_PASS=your_gmail_app_password
EMAIL_TO=hello@purplesofthub.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://purplesofthub.netlify.app
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📧 Setting Up Gmail for Nodemailer

1. Go to your Google Account → Security
2. Enable **2-Factor Authentication**
3. Go to **App Passwords**
4. Generate a new app password for "Mail"
5. Use that password as `EMAIL_PASS` in `.env.local`

---

## 🍃 Setting Up MongoDB

1. Go to [mongodb.com](https://mongodb.com) and create a free cluster
2. Create a database user with read/write permissions
3. Get your connection string and add to `MONGODB_URI`
4. Whitelist `0.0.0.0/0` in Network Access (or Netlify IPs)

---

## 📊 Setting Up Google Analytics

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create a new GA4 property
3. Copy your Measurement ID (format: `G-XXXXXXXXXX`)
4. Add to `NEXT_PUBLIC_GA_ID` in `.env.local`

---

## 🌐 Deploying to Netlify

### Option A — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Option B — GitHub Integration

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com) → New Site from Git
3. Connect your GitHub repo
4. Build command: `npm run build`
5. Publish directory: `.next`
6. Add the Netlify Next.js plugin: `@netlify/plugin-nextjs`
7. Add all environment variables in Netlify dashboard

---

## 📁 Project Structure

```
purplesofthub/
├── app/
│   ├── layout.tsx              ← Root layout + SEO + Analytics
│   ├── page.tsx                ← Home page
│   ├── globals.css             ← Global styles
│   ├── services/
│   │   └── page.tsx            ← Services page
│   ├── blog/
│   │   ├── page.tsx            ← Blog listing
│   │   └── [slug]/page.tsx     ← Blog post
│   ├── contact/
│   │   └── page.tsx            ← Contact page
│   └── api/
│       └── contact/
│           └── route.ts        ← Contact API (Nodemailer + MongoDB)
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ContactForm.tsx
│   └── Reveal.tsx
├── lib/
│   ├── mongodb.ts              ← MongoDB connection
│   └── models/
│       └── Contact.ts          ← Contact form model
├── .env.local.example
├── netlify.toml
├── next.config.mjs
├── tailwind.config.js
└── tsconfig.json
```

---

## 🔮 Future Phases

- **Phase 2:** Portfolio page, case studies, MDX blog
- **Phase 3:** Client dashboard, project tracking, login (Clerk)
- **Phase 4:** SaaS tools, AI services, automation platform

---

Built with 💜 by PurpleSoftHub
