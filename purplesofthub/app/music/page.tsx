"use client";

import Image from "next/image";
import Link from "next/link";
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

const distributionPlans = [
  {
    name: "Single Release",
    price: "₦15,000",
    usd: "$10",
    cadence: "per release",
    desc: "Best for artists releasing one single.",
    features: ["1 single", "150+ platforms", "ISRC support", "Release scheduling", "Royalty support"],
    href: "/dashboard/music?service=distribution&plan=dist-single",
  },
  {
    name: "EP / Album",
    price: "₦35,000",
    usd: "$25",
    cadence: "per release",
    desc: "For projects with multiple tracks.",
    features: ["Up to 15 tracks", "UPC + ISRC support", "All major DSPs", "Metadata review", "Playlist pitch support"],
    href: "/dashboard/music?service=distribution&plan=dist-album",
    featured: true,
  },
  {
    name: "Artist Yearly",
    price: "₦75,000",
    usd: "$53",
    cadence: "per year",
    desc: "For artists releasing consistently.",
    features: ["Unlimited releases", "Priority support", "Release calendar", "Profile setup help", "Promotion boost"],
    href: "/dashboard/music?service=distribution&plan=dist-artist",
  },
  {
    name: "Label Plan",
    price: "₦180,000",
    usd: "$120",
    cadence: "per year",
    desc: "For managers, labels, and collectives.",
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
    desc: "Playlist pitching, listener growth, and Spotify-focused rollout support.",
    tiers: ["Starter ₦75k", "Growth ₦150k", "Pro ₦300k", "Major custom"],
  },
  {
    name: "Influencer Promotion",
    price: "from ₦100,000",
    usd: "from $70",
    icon: Users,
    desc: "TikTok, Reels, creator posts, story mentions, and short-form content pushes.",
    tiers: ["Micro push ₦100k", "Viral push ₦250k", "Multi-influencer ₦500k+"],
  },
  {
    name: "YouTube Promotion",
    price: "from ₦120,000",
    usd: "from $80",
    icon: Youtube,
    desc: "Music video, Shorts, YouTube discovery, audience targeting, and campaign reporting.",
    tiers: ["Starter ₦120k", "Growth ₦250k", "Scale ₦500k"],
  },
  {
    name: "Meta Ads Promotion",
    price: "from ₦75,000",
    usd: "from $50 + ad budget",
    icon: Instagram,
    desc: "Instagram/Facebook campaign setup, targeting, creative direction, and ad reporting.",
    tiers: ["Setup ₦75k", "Growth ₦150k", "Scale ₦300k", "Ad budget separate"],
  },
];

const growthGoals = [
  { icon: UploadCloud, title: "Release my song", desc: "Get your music live on global stores and streaming platforms." },
  { icon: Headphones, title: "Get Spotify listeners", desc: "Run a focused Spotify campaign for new listeners and saves." },
  { icon: Youtube, title: "Promote my video", desc: "Push a music video, lyric video, visualizer, or Shorts campaign." },
  { icon: Share2, title: "Go social", desc: "Build TikTok, Reels, and influencer momentum around the song." },
  { icon: Target, title: "Run ads", desc: "Use Meta Ads to target real fans by country, genre, and interest." },
  { icon: Radio, title: "Full rollout", desc: "Plan distribution, content, playlists, ads, and reporting together." },
];

const processSteps = [
  "Choose distribution, promotion, or a full rollout",
  "Submit artist, track, release, and platform details",
  "PurpleSoftHub prepares the release or campaign",
  "Track campaign progress from your dashboard",
];

export default function MusicPage() {
  return (
    <main className="music-page">
      <Navbar />

      <section className="music-hero">
        <div className="music-grid-bg" />
        <div className="music-hero-inner">
          <div className="music-hero-copy">
            <span className="music-kicker">
              <Sparkles size={15} />
              PurpleSoftHub Music
            </span>
            <h1>
              Release, Promote & Grow Your Music <span>Worldwide</span>
            </h1>
            <p>
              Distribute your music to Spotify, Apple Music, TikTok, YouTube Music, Boomplay, Audiomack and 150+ platforms, then promote it with Spotify, influencer, YouTube, and Meta Ads campaigns.
            </p>
            <div className="music-actions">
              <Link className="music-primary" href="/dashboard/music?service=distribution">
                Start Distribution
                <ArrowRight size={18} />
              </Link>
              <Link className="music-secondary" href="/dashboard/music?service=promotion">
                Promote My Song
              </Link>
            </div>
          </div>

          <div className="music-visual" aria-label="Music distribution and promotion dashboard preview">
            <div className="music-orbit" />
            <div className="music-cover">
              <Image
                src="/images/logo/purplesoft-logo-main.png"
                alt="PurpleSoftHub"
                width={180}
                height={62}
                priority
              />
              <Disc3 size={92} />
              <span>Distribution + Promotion</span>
            </div>
            <div className="music-wave" aria-hidden="true">
              {[18, 34, 52, 26, 72, 44, 58, 30, 64, 40, 24].map((height, index) => (
                <i key={index} style={{ height }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="music-pillars">
        <article>
          <Music2 size={28} />
          <h2>Music Distribution</h2>
          <p>Release singles, EPs, albums, and yearly artist catalogs to 150+ platforms with metadata, codes, scheduling, and royalty support.</p>
        </article>
        <article>
          <Megaphone size={28} />
          <h2>Music Promotion</h2>
          <p>Grow attention with Spotify campaigns, influencer pushes, YouTube promotion, Meta Ads, playlist outreach, and reporting.</p>
        </article>
      </section>

      <section className="music-section">
        <div className="music-section-head">
          <span className="music-label">
            <Globe2 size={15} />
            Global distribution
          </span>
          <h2>Share your music with the world.</h2>
          <p>Simple release packages inspired by DistroKid and TuneCore, priced for PurpleSoftHub artists.</p>
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
          <h2>Build a real rollout, not just a release.</h2>
          <p>Promotion should be transparent: campaign fee, platform focus, ad budget where needed, and no fake stream guarantees.</p>
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
          <h2>Pick the outcome, then submit the right artist data.</h2>
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
          <h2>Ready to release or promote your next song?</h2>
          <p>
            Start in the dashboard so PurpleSoftHub receives the right artist name, track title, release date, platform links, campaign goal, budget, and notes.
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
          padding: 132px 5% 78px;
          overflow: hidden;
          background:
            radial-gradient(circle at 76% 26%, rgba(6,182,212,0.18), transparent 28%),
            radial-gradient(circle at 16% 22%, rgba(168,85,247,0.24), transparent 32%),
            linear-gradient(180deg, rgba(124,58,237,0.08), transparent 72%),
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
          grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
          gap: clamp(34px, 6vw, 72px);
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
          max-width: 780px;
          margin-top: 22px;
          font-size: clamp(42px, 7vw, 82px);
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
          max-width: 680px;
          margin: 22px 0 30px;
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
          min-height: 520px;
          border: 1px solid var(--cyber-border);
          border-radius: 8px;
          background:
            linear-gradient(145deg, rgba(124,58,237,0.2), transparent 42%),
            color-mix(in srgb, var(--cyber-card) 88%, transparent);
          position: relative;
          overflow: hidden;
          display: grid;
          place-items: center;
          box-shadow: 0 28px 90px rgba(3, 7, 18, 0.22);
        }

        .music-orbit {
          position: absolute;
          width: 340px;
          height: 340px;
          border: 1px solid rgba(6,182,212,0.28);
          border-radius: 50%;
          animation: music-spin 18s linear infinite;
        }

        .music-orbit::before,
        .music-orbit::after {
          content: "";
          position: absolute;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #06b6d4;
          box-shadow: 0 0 20px rgba(6,182,212,0.8);
        }

        .music-orbit::before {
          left: 50%;
          top: -7px;
        }

        .music-orbit::after {
          right: 22px;
          bottom: 52px;
          background: #a855f7;
          box-shadow: 0 0 20px rgba(168,85,247,0.8);
        }

        .music-cover {
          width: min(310px, 78%);
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          text-align: center;
          border: 1px solid rgba(168,85,247,0.28);
          border-radius: 8px;
          background:
            radial-gradient(circle at 50% 22%, rgba(6,182,212,0.18), transparent 40%),
            rgba(10,5,25,0.72);
          position: relative;
          z-index: 1;
        }

        .music-cover img {
          width: 178px;
          height: auto;
        }

        .music-cover svg {
          color: #a855f7;
          filter: drop-shadow(0 0 24px rgba(168,85,247,0.48));
          animation: music-disc 8s linear infinite;
        }

        .music-cover span {
          color: var(--cyber-heading);
          font-weight: 900;
        }

        .music-wave {
          position: absolute;
          left: 24px;
          right: 24px;
          bottom: 26px;
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

        @keyframes music-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes music-disc {
          to { transform: rotate(360deg); }
        }

        @keyframes wave {
          from { transform: scaleY(0.58); opacity: 0.58; }
          to { transform: scaleY(1.12); opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .music-orbit,
          .music-cover svg,
          .music-wave i {
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
        }

        @media (max-width: 560px) {
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
