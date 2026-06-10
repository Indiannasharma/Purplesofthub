"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Disc3,
  Globe2,
  Headphones,
  Instagram,
  Megaphone,
  Music2,
  PlayCircle,
  Radio,
  Share2,
  Sparkles,
  Target,
  UploadCloud,
  Users,
  Youtube,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const platforms = [
  "Spotify",
  "Apple Music",
  "TikTok",
  "YouTube Music",
  "Boomplay",
  "Audiomack",
  "Deezer",
  "Tidal",
  "Amazon Music",
  "Instagram/Facebook",
];

const heroStats = [
  { value: "150+", label: "Stores & DSPs" },
  { value: "24-72h", label: "Release review" },
  { value: "4", label: "Promotion channels" },
];

const heroHighlights = [
  "DSP distribution",
  "Spotify campaigns",
  "Influencer rollouts",
  "Meta ads setup",
];

const distributionPlans = [
  {
    name: "Single Release",
    price: "₦15,000",
    usd: "$10",
    cadence: "per release",
    desc: "A focused launch package for one official single.",
    features: ["1 single", "150+ platforms", "ISRC support", "Release scheduling", "Royalty support"],
    href: "/dashboard/music?service=distribution&plan=dist-single",
  },
  {
    name: "EP / Album",
    price: "₦35,000",
    usd: "$25",
    cadence: "per release",
    desc: "A clean release setup for projects with multiple tracks.",
    features: ["Up to 15 tracks", "UPC + ISRC support", "All major DSPs", "Metadata review", "Playlist pitch support"],
    href: "/dashboard/music?service=distribution&plan=dist-album",
    featured: true,
  },
  {
    name: "Artist Yearly",
    price: "₦75,000",
    usd: "$53",
    cadence: "per year",
    desc: "Built for artists with a consistent release calendar.",
    features: ["Unlimited releases", "Priority support", "Release calendar", "Profile setup help", "Promotion boost"],
    href: "/dashboard/music?service=distribution&plan=dist-artist",
  },
  {
    name: "Label Plan",
    price: "₦180,000",
    usd: "$120",
    cadence: "per year",
    desc: "Release coordination for managers, labels, and collectives.",
    features: ["Multiple artists", "Campaign dashboard", "Release coordination", "Priority review", "Dedicated support"],
    href: "/dashboard/music?service=distribution&plan=dist-label",
  },
];

const promotionPlans = [
  {
    name: "Spotify Promotion",
    price: "from ₦75,000",
    usd: "from $50",
    icon: Headphones,
    desc: "Spotify-focused listener growth, playlist outreach, and rollout support.",
    tiers: ["Starter ₦75k", "Growth ₦150k", "Pro ₦300k", "Major custom"],
  },
  {
    name: "Influencer Promotion",
    price: "from ₦100,000",
    usd: "from $70",
    icon: Users,
    desc: "Creator-led TikTok, Reels, story, and short-form content campaigns.",
    tiers: ["Micro push ₦100k", "Viral push ₦250k", "Multi-influencer ₦500k+"],
  },
  {
    name: "YouTube Promotion",
    price: "from ₦120,000",
    usd: "from $80",
    icon: Youtube,
    desc: "YouTube discovery, Shorts promotion, audience targeting, and reporting.",
    tiers: ["Starter ₦120k", "Growth ₦250k", "Scale ₦500k"],
  },
  {
    name: "Meta Ads Promotion",
    price: "from ₦75,000",
    usd: "from $50 + ad budget",
    icon: Instagram,
    desc: "Instagram and Facebook campaign setup, targeting, creative direction, and reporting.",
    tiers: ["Setup ₦75k", "Growth ₦150k", "Scale ₦300k", "Ad budget separate"],
  },
];

const growthGoals = [
  { icon: UploadCloud, title: "Release my song", desc: "Prepare your release and send it to global stores and streaming platforms." },
  { icon: Headphones, title: "Get Spotify listeners", desc: "Run a focused Spotify campaign for discovery, saves, and listener growth." },
  { icon: Youtube, title: "Promote my video", desc: "Push a music video, lyric video, visualizer, or Shorts campaign." },
  { icon: Share2, title: "Go social", desc: "Build TikTok, Reels, and creator momentum around the record." },
  { icon: Target, title: "Run ads", desc: "Use Meta Ads to reach fans by country, genre, interest, and behavior." },
  { icon: Radio, title: "Full rollout", desc: "Plan distribution, content, playlists, ads, and reporting as one campaign." },
];

const processSteps = [
  "Choose distribution, promotion, or a full rollout",
  "Submit artist, track, release, and platform details",
  "PurpleSoftHub reviews and prepares the release or campaign",
  "Track submissions and campaign progress from your dashboard",
];

export default function MusicPage() {
  return (
    <main className="music-page">
      <Navbar />

      <section className="music-hero">
        <div className="music-grid-bg" />
        <div className="music-noise" />
        <div className="music-hero-inner">
          <motion.div
            className="music-hero-copy"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="music-kicker">
              <Sparkles size={15} />
              Distribution + promotion for serious artists
            </span>
            <h1>
              Launch your next record like a real campaign.
            </h1>
            <p>
              PurpleSoftHub helps artists release music worldwide, prepare clean artist data, and run promotion across Spotify, creators, YouTube, and Meta ads from one dashboard-ready flow.
            </p>
            <div className="music-actions">
              <Link className="music-primary" href="/dashboard/music?service=distribution">
                Start a Release
                <ArrowRight size={18} />
              </Link>
              <Link className="music-secondary" href="/dashboard/music?service=promotion">
                Build a Campaign
              </Link>
            </div>

            <div className="hero-stat-grid" aria-label="PurpleSoftHub Music highlights">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="hero-highlight-row">
              {heroHighlights.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="music-visual"
            aria-label="Music distribution and promotion dashboard preview"
            initial={{ opacity: 0, scale: 0.96, y: 22 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="launch-console">
              <div className="console-topline">
                <span>Release console</span>
                <strong>Live rollout</strong>
              </div>

              <div className="console-main">
                <div className="album-art">
                  <Image
                    src="/images/logo/purplesoft-logo-main.png"
                    alt="PurpleSoftHub"
                    width={170}
                    height={58}
                    priority
                  />
                  <Disc3 size={70} />
                </div>

                <div className="campaign-panel">
                  <span className="panel-label">Next drop</span>
                  <h2>Single release + promotion push</h2>
                  <p>Spotify, Apple Music, TikTok, YouTube Music, Boomplay, Audiomack</p>
                  <div className="progress-track">
                    <i />
                  </div>
                  <div className="panel-meta">
                    <span>Metadata checked</span>
                    <span>Campaign brief ready</span>
                  </div>
                </div>
              </div>

              <div className="music-wave" aria-hidden="true">
                {[22, 40, 58, 34, 76, 46, 68, 38, 62, 48, 28, 54, 36].map((height, index) => (
                  <i key={index} style={{ height }} />
                ))}
              </div>

              <div className="platform-marquee" aria-hidden="true">
                <div>
                  {[...platforms, ...platforms].map((platform, index) => (
                    <span key={`${platform}-${index}`}>{platform}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="floating-signal signal-one">
              <BadgeCheck size={16} />
              Artist data received
            </div>
            <div className="floating-signal signal-two">
              <BarChart3 size={16} />
              Promotion plan active
            </div>
          </motion.div>
        </div>
      </section>

      <section className="music-pillars">
        <article>
          <Music2 size={28} />
          <h2>Music Distribution</h2>
          <p>Release singles, EPs, albums, and artist catalogs to 150+ platforms with metadata review, release scheduling, ISRC/UPC support, and royalty guidance.</p>
        </article>
        <article>
          <Megaphone size={28} />
          <h2>Music Promotion</h2>
          <p>Build demand with Spotify campaigns, creator rollouts, YouTube promotion, Meta Ads, playlist outreach, audience targeting, and clear reporting.</p>
        </article>
      </section>

      <section className="music-section">
        <div className="music-section-head">
          <span className="music-label">
            <Globe2 size={15} />
            Global distribution
          </span>
          <h2>Share your music with the world.</h2>
          <p>Professional release packages for independent artists, labels, and managers who want global distribution without a confusing process.</p>
        </div>

        <div className="platform-strip">
          {platforms.map((platform) => (
            <span key={platform}>{platform}</span>
          ))}
        </div>

        <div className="plan-grid distribution-grid">
          {distributionPlans.map((plan) => (
            <article className={plan.featured ? "music-plan featured" : "music-plan"} key={plan.name}>
              {plan.featured ? <span className="plan-badge">Best value</span> : null}
              <h3>{plan.name}</h3>
              <p>{plan.desc}</p>
              <strong>{plan.price}</strong>
              <small>{plan.usd} · {plan.cadence}</small>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <BadgeCheck size={15} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href={plan.href}>
                Submit artist details
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="music-section music-promo-section">
        <div className="music-section-head">
          <span className="music-label">
            <BarChart3 size={15} />
            Music promotion
          </span>
          <h2>Build a rollout around the record.</h2>
          <p>Choose the channels that match your goal, budget, and audience. We keep the campaign transparent with clear fees, platform focus, and reporting.</p>
        </div>

        <div className="promo-grid">
          {promotionPlans.map((plan) => (
            <article className="promo-card" key={plan.name}>
              <span className="promo-icon">
                <plan.icon size={24} />
              </span>
              <h3>{plan.name}</h3>
              <p>{plan.desc}</p>
              <strong>{plan.price}</strong>
              <small>{plan.usd}</small>
              <div>
                {plan.tiers.map((tier) => (
                  <span key={tier}>{tier}</span>
                ))}
              </div>
              <Link href="/dashboard/music?service=promotion">
                Book campaign
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="music-section music-goals">
        <div className="music-section-head">
          <span className="music-label">
            <Target size={15} />
            Choose your goal
          </span>
          <h2>Pick the outcome. We collect the right artist data.</h2>
        </div>

        <div className="goal-grid">
          {growthGoals.map((goal) => (
            <article key={goal.title}>
              <goal.icon size={22} />
              <h3>{goal.title}</h3>
              <p>{goal.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="music-section music-process">
        <div className="music-section-head">
          <span className="music-label">
            <PlayCircle size={15} />
            How it works
          </span>
          <h2>From song link to campaign dashboard.</h2>
        </div>

        <div className="process-grid">
          {processSteps.map((step, index) => (
            <article key={step}>
              <strong>{String(index + 1).padStart(2, "0")}</strong>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="music-final-cta">
        <div>
          <span className="music-label">Artist dashboard intake</span>
          <h2>Ready to release or promote your next record?</h2>
          <p>
            Start in the dashboard so PurpleSoftHub receives the artist name, track title, release date, platform links, campaign goal, budget range, and notes needed to manage the release correctly.
          </p>
          <div className="music-actions">
            <Link className="music-primary" href="/dashboard/music?service=distribution">
              Submit Music Details
              <ArrowRight size={18} />
            </Link>
            <Link className="music-secondary" href="/services/music-promotion">
              View Service Page
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .music-page {
          min-height: 100vh;
          overflow-x: hidden;
          background: var(--cyber-bg);
          color: var(--cyber-heading);
        }

        .music-hero {
          position: relative;
          padding: 124px 5% 86px;
          overflow: hidden;
          background:
            linear-gradient(135deg, rgba(124,58,237,0.18), transparent 36%),
            linear-gradient(180deg, rgba(6,182,212,0.08), transparent 70%),
            var(--cyber-bg);
        }

        .music-grid-bg {
          position: absolute;
          inset: 0;
          opacity: 0.35;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(124,58,237,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.12) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: linear-gradient(to bottom, black, transparent 86%);
        }

        .music-noise {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.18;
          background-image:
            linear-gradient(115deg, transparent 0 42%, rgba(255,255,255,0.12) 42% 43%, transparent 43% 100%),
            linear-gradient(90deg, rgba(168,85,247,0.16), transparent 28%, rgba(6,182,212,0.12) 62%, transparent);
          mix-blend-mode: screen;
        }

        .music-hero-inner,
        .music-pillars,
        .music-section,
        .music-final-cta {
          width: min(1120px, 100%);
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .music-hero-inner {
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(360px, 1.08fr);
          gap: clamp(34px, 5vw, 66px);
          align-items: center;
        }

        .music-kicker,
        .music-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          border: 1px solid rgba(168,85,247,0.28);
          border-radius: 999px;
          background: rgba(124,58,237,0.12);
          color: #c084fc;
          padding: 7px 13px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .music-hero h1,
        .music-section-head h2,
        .music-final-cta h2 {
          font-family: Outfit, Inter, sans-serif;
          font-weight: 900;
          line-height: 1.02;
          letter-spacing: 0;
          margin: 0;
        }

        .music-hero h1 {
          max-width: 680px;
          margin-top: 22px;
          font-size: clamp(42px, 6vw, 76px);
        }

        .music-hero h1 span,
        .music-section-head h2 span {
          color: #a855f7;
        }

        .music-hero p,
        .music-section-head p,
        .music-final-cta p {
          color: var(--text-muted);
          font-size: clamp(16px, 2vw, 19px);
          line-height: 1.75;
        }

        .music-hero p {
          max-width: 640px;
          margin: 22px 0 28px;
        }

        .music-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .music-primary,
        .music-secondary {
          min-height: 46px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border-radius: 8px;
          padding: 13px 19px;
          text-decoration: none;
          font-weight: 900;
          transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
        }

        .music-primary {
          color: white;
          background: linear-gradient(135deg, #7c3aed, #06b6d4);
          box-shadow: 0 18px 42px rgba(124,58,237,0.28);
        }

        .music-secondary {
          color: #67e8f9;
          border: 1px solid rgba(6,182,212,0.36);
          background: rgba(6,182,212,0.07);
        }

        .music-primary:hover,
        .music-secondary:hover {
          transform: translateY(-2px);
        }

        .music-visual {
          min-height: 540px;
          border: 1px solid var(--cyber-border);
          border-radius: 8px;
          background:
            linear-gradient(145deg, rgba(124,58,237,0.26), transparent 40%),
            linear-gradient(315deg, rgba(6,182,212,0.16), transparent 44%),
            color-mix(in srgb, var(--cyber-card) 88%, transparent);
          position: relative;
          overflow: hidden;
          display: grid;
          place-items: center;
          box-shadow: 0 28px 90px rgba(3, 7, 18, 0.22);
        }

        .hero-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          max-width: 620px;
          margin-top: 30px;
        }

        .hero-stat-grid div {
          border: 1px solid rgba(124,58,237,0.22);
          border-radius: 8px;
          background: color-mix(in srgb, var(--cyber-card) 80%, transparent);
          padding: 14px;
        }

        .hero-stat-grid strong {
          display: block;
          color: var(--cyber-heading);
          font-size: clamp(22px, 3vw, 34px);
          line-height: 1;
          font-weight: 950;
        }

        .hero-stat-grid span {
          display: block;
          margin-top: 7px;
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 800;
        }

        .hero-highlight-row {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 16px;
        }

        .hero-highlight-row span {
          border: 1px solid rgba(6,182,212,0.2);
          border-radius: 999px;
          background: rgba(6,182,212,0.08);
          color: var(--cyber-heading);
          font-size: 12px;
          font-weight: 850;
          padding: 7px 11px;
        }

        .launch-console {
          width: min(520px, calc(100% - 42px));
          min-height: 420px;
          border: 1px solid rgba(168,85,247,0.3);
          border-radius: 8px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.08), transparent),
            rgba(10,5,25,0.76);
          position: relative;
          z-index: 1;
          overflow: hidden;
          padding: 18px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 28px 80px rgba(0,0,0,0.18);
        }

        .launch-console::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, transparent, rgba(6,182,212,0.12), transparent),
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 100% 100%, 100% 34px;
          animation: console-scan 5s linear infinite;
          pointer-events: none;
        }

        .console-topline,
        .console-main,
        .music-wave,
        .platform-marquee {
          position: relative;
          z-index: 1;
        }

        .console-topline {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 18px;
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .console-topline strong {
          color: #67e8f9;
        }

        .console-main {
          display: grid;
          grid-template-columns: 0.86fr 1.14fr;
          gap: 16px;
          align-items: stretch;
        }

        .album-art,
        .campaign-panel {
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          background: rgba(255,255,255,0.06);
        }

        .album-art {
          min-height: 250px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
          text-align: center;
        }

        .album-art img {
          width: min(150px, 76%);
          height: auto;
        }

        .album-art svg {
          color: #a855f7;
          filter: drop-shadow(0 0 24px rgba(168,85,247,0.48));
          animation: music-disc 8s linear infinite;
        }

        .campaign-panel {
          padding: 20px;
        }

        .panel-label {
          display: inline-flex;
          color: #67e8f9;
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 14px;
        }

        .campaign-panel h2 {
          color: white;
          margin: 0;
          font-size: clamp(21px, 2.6vw, 30px);
          line-height: 1.05;
          font-weight: 950;
        }

        .campaign-panel p {
          margin: 14px 0 20px;
          color: rgba(255,255,255,0.66);
          font-size: 13px;
          line-height: 1.62;
        }

        .progress-track {
          height: 9px;
          border-radius: 999px;
          background: rgba(255,255,255,0.1);
          overflow: hidden;
        }

        .progress-track i {
          display: block;
          width: 78%;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #7c3aed, #06b6d4, #22c55e);
          animation: progress-pulse 2s ease-in-out infinite alternate;
        }

        .panel-meta {
          display: grid;
          gap: 8px;
          margin-top: 18px;
        }

        .panel-meta span {
          color: rgba(255,255,255,0.72);
          font-size: 12px;
          font-weight: 800;
        }

        .panel-meta span::before {
          content: "";
          display: inline-block;
          width: 7px;
          height: 7px;
          margin-right: 8px;
          border-radius: 999px;
          background: #22c55e;
          box-shadow: 0 0 12px rgba(34,197,94,0.7);
        }

        .music-wave {
          height: 92px;
          margin: 26px 0 18px;
          display: flex;
          align-items: end;
          justify-content: center;
          gap: 7px;
        }

        .music-wave i {
          width: 7px;
          border-radius: 999px;
          background: linear-gradient(180deg, #a855f7, #06b6d4);
          animation: wave 1.5s ease-in-out infinite alternate;
        }

        .music-wave i:nth-child(2n) {
          animation-delay: 180ms;
        }

        .music-wave i:nth-child(3n) {
          animation-delay: 320ms;
        }

        .platform-marquee {
          overflow: hidden;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 16px;
        }

        .platform-marquee div {
          display: flex;
          gap: 10px;
          width: max-content;
          animation: platform-scroll 22s linear infinite;
        }

        .platform-marquee span {
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 999px;
          color: rgba(255,255,255,0.78);
          background: rgba(255,255,255,0.06);
          font-size: 11px;
          font-weight: 900;
          padding: 7px 10px;
          white-space: nowrap;
        }

        .floating-signal {
          position: absolute;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(6,182,212,0.3);
          border-radius: 8px;
          background: rgba(10,5,25,0.72);
          color: rgba(255,255,255,0.86);
          padding: 10px 12px;
          font-size: 12px;
          font-weight: 900;
          box-shadow: 0 18px 48px rgba(0,0,0,0.18);
          z-index: 2;
          animation: signal-float 4s ease-in-out infinite alternate;
        }

        .floating-signal svg {
          color: #67e8f9;
        }

        .signal-one {
          top: 60px;
          right: 26px;
        }

        .signal-two {
          left: 24px;
          bottom: 56px;
          animation-delay: 600ms;
        }

        .music-pillars {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: -34px;
          z-index: 2;
        }

        .music-pillars article,
        .music-plan,
        .promo-card,
        .goal-grid article,
        .process-grid article {
          border: 1px solid var(--cyber-border);
          border-radius: 8px;
          background: color-mix(in srgb, var(--cyber-card) 92%, transparent);
          box-shadow: 0 18px 54px rgba(3,7,18,0.12);
        }

        .music-pillars article {
          padding: 24px;
        }

        .music-pillars svg {
          color: #67e8f9;
          margin-bottom: 16px;
        }

        .music-pillars h2,
        .music-plan h3,
        .promo-card h3,
        .goal-grid h3 {
          margin: 0 0 10px;
          color: var(--cyber-heading);
          font-size: 21px;
          line-height: 1.2;
          font-weight: 900;
        }

        .music-pillars p,
        .music-plan p,
        .promo-card p,
        .goal-grid p,
        .process-grid p {
          margin: 0;
          color: var(--text-muted);
          font-size: 14px;
          line-height: 1.68;
        }

        .music-section {
          padding: clamp(62px, 8vw, 104px) 0;
        }

        .music-promo-section {
          width: 100%;
          max-width: none;
          padding-left: max(5%, calc((100% - 1120px) / 2));
          padding-right: max(5%, calc((100% - 1120px) / 2));
          background: linear-gradient(180deg, transparent, rgba(6,182,212,0.055), transparent);
        }

        .music-section-head {
          max-width: 760px;
          margin-bottom: 30px;
        }

        .music-section-head h2 {
          margin-top: 15px;
          font-size: clamp(30px, 4.6vw, 52px);
        }

        .music-section-head p {
          margin: 12px 0 0;
        }

        .platform-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 28px;
        }

        .platform-strip span,
        .promo-card div span {
          border: 1px solid rgba(124,58,237,0.2);
          border-radius: 999px;
          background: rgba(124,58,237,0.1);
          color: var(--cyber-heading);
          font-size: 12px;
          font-weight: 850;
          padding: 7px 11px;
        }

        .plan-grid,
        .promo-grid,
        .goal-grid,
        .process-grid {
          display: grid;
          gap: 18px;
        }

        .distribution-grid,
        .promo-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .music-plan,
        .promo-card {
          min-height: 100%;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .music-plan.featured {
          border-color: rgba(6,182,212,0.52);
          box-shadow: 0 24px 62px rgba(6,182,212,0.12);
        }

        .plan-badge {
          display: inline-flex;
          margin-bottom: 14px;
          border-radius: 999px;
          background: rgba(6,182,212,0.14);
          color: #67e8f9;
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .music-plan strong,
        .promo-card strong {
          display: block;
          margin-top: 18px;
          color: var(--cyber-heading);
          font-size: 29px;
          line-height: 1;
          font-weight: 950;
        }

        .music-plan small,
        .promo-card small {
          display: block;
          margin-top: 7px;
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 800;
        }

        .music-plan ul {
          list-style: none;
          margin: 22px 0;
          padding: 0;
          display: grid;
          gap: 10px;
        }

        .music-plan li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: var(--text-muted);
          font-size: 13px;
          line-height: 1.45;
        }

        .music-plan li svg {
          flex: 0 0 auto;
          color: #22c55e;
          margin-top: 2px;
        }

        .music-plan a,
        .promo-card a {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          border-radius: 8px;
          background: linear-gradient(135deg, #7c3aed, #06b6d4);
          color: white;
          padding: 11px 13px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 900;
        }

        .promo-icon {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(6,182,212,0.28);
          border-radius: 8px;
          background: rgba(6,182,212,0.1);
          color: #67e8f9;
          margin-bottom: 18px;
        }

        .promo-card div {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 20px 0 22px;
        }

        .goal-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .goal-grid article {
          padding: 22px;
        }

        .goal-grid svg {
          color: #a855f7;
          margin-bottom: 14px;
        }

        .process-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .process-grid article {
          padding: 24px;
        }

        .process-grid strong {
          display: block;
          color: #67e8f9;
          font-size: 30px;
          margin-bottom: 14px;
        }

        .music-final-cta {
          margin-bottom: 90px;
          padding: clamp(42px, 6vw, 72px);
          border: 1px solid rgba(168,85,247,0.32);
          border-radius: 8px;
          background:
            radial-gradient(circle at 82% 18%, rgba(6,182,212,0.18), transparent 34%),
            linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.08));
        }

        .music-final-cta > div {
          max-width: 760px;
        }

        .music-final-cta h2 {
          margin-top: 14px;
          font-size: clamp(30px, 5vw, 58px);
        }

        @keyframes music-disc {
          to { transform: rotate(360deg); }
        }

        @keyframes wave {
          from { transform: scaleY(0.58); opacity: 0.58; }
          to { transform: scaleY(1.12); opacity: 1; }
        }

        @keyframes console-scan {
          from { transform: translateX(-52%); }
          to { transform: translateX(52%); }
        }

        @keyframes progress-pulse {
          from { filter: saturate(0.9); transform: scaleX(0.92); transform-origin: left; }
          to { filter: saturate(1.25); transform: scaleX(1); transform-origin: left; }
        }

        @keyframes platform-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes signal-float {
          from { transform: translateY(0); }
          to { transform: translateY(-10px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .album-art svg,
          .music-wave i,
          .launch-console::before,
          .platform-marquee div,
          .floating-signal,
          .progress-track i {
            animation: none;
          }

          .music-primary,
          .music-secondary {
            transition: none;
          }
        }

        @media (max-width: 1080px) {
          .distribution-grid,
          .promo-grid,
          .process-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 860px) {
          .music-hero {
            padding-top: 112px;
          }

          .music-hero-inner,
          .music-pillars,
          .goal-grid {
            grid-template-columns: 1fr;
          }

          .music-visual {
            min-height: 420px;
          }

          .launch-console {
            width: min(560px, 100%);
          }

          .signal-one,
          .signal-two {
            display: none;
          }
        }

        @media (max-width: 560px) {
          .music-hero {
            padding-bottom: 64px;
          }

          .hero-stat-grid,
          .console-main {
            grid-template-columns: 1fr;
          }

          .album-art {
            min-height: 190px;
          }

          .launch-console {
            min-height: auto;
            padding: 14px;
          }

          .music-wave {
            height: 74px;
            margin: 20px 0 14px;
          }

          .distribution-grid,
          .promo-grid,
          .process-grid {
            grid-template-columns: 1fr;
          }

          .music-actions a {
            width: 100%;
          }

          .music-final-cta {
            margin-left: 5%;
            margin-right: 5%;
          }
        }
      `}</style>
    </main>
  );
}
