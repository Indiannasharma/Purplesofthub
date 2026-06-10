"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  Film,
  Filter,
  GraduationCap,
  LayoutTemplate,
  Megaphone,
  Music2,
  PenTool,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { academyCategories, academyFaqs, academyTracks, learningPaths, type AcademyCategory } from "@/app/academy/_data/tracks";

const trackIcons = {
  "web-development": Code2,
  "mobile-app-development": Phone,
  "ui-ux-design": LayoutTemplate,
  "graphic-design": PenTool,
  "digital-marketing": Megaphone,
  "ai-productivity": Bot,
  "saas-product-development": Blocks,
  "cybersecurity-basics": ShieldCheck,
  "business-automation": BriefcaseBusiness,
  "music-business-distribution": Music2,
  "content-creation-video-editing": Film,
  "youth-digital-foundation": GraduationCap,
};

const categoryCounts = academyCategories.reduce(
  (acc, category) => {
    acc[category] = category === "All" ? academyTracks.length : academyTracks.filter((track) => track.category === category).length;
    return acc;
  },
  {} as Record<AcademyCategory, number>
);

export default function AcademyPage() {
  const [activeCategory, setActiveCategory] = useState<AcademyCategory>("All");
  const [selectedTrack, setSelectedTrack] = useState(academyTracks[0].slug);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const visibleTracks = useMemo(
    () => academyTracks.filter((track) => activeCategory === "All" || track.category === activeCategory),
    [activeCategory]
  );

  const selectedTrackTitle = academyTracks.find((track) => track.slug === selectedTrack)?.title ?? "Academy updates";

  async function handleWaitlist() {
    if (!email.includes("@")) return;

    setStatus("loading");
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: `academy-${selectedTrack}` }),
      });
    } catch {}
    setStatus("success");
  }

  return (
    <main className="academy-page">
      <Navbar />

      <section className="academy-hero">
        <div className="grid-bg academy-grid-bg" />
        <div className="academy-hero-inner">
          <div className="academy-hero-copy">
            <span className="academy-kicker">
              <Sparkles size={15} />
              Practical digital skills for African learners
            </span>

            <h1>
              PurpleSoftHub <span className="grad-text">Academy</span>
            </h1>

            <p className="academy-lead">
              Learn web, mobile, design, marketing, AI, music business, and automation skills through hands-on projects built around real business needs.
            </p>

            <div className="academy-actions">
              <a className="btn-main academy-primary" href="#courses">
                View Courses
                <ArrowRight size={18} />
              </a>
              <a className="academy-secondary" href="#waitlist">
                Join Waitlist
              </a>
            </div>
          </div>

          <div className="academy-visual" aria-label="PurpleSoftHub Academy learning tracks">
            <Image
              src="/images/logo/purplesoft-logo-main.png"
              alt="PurpleSoftHub"
              width={210}
              height={72}
              priority
              className="academy-logo"
            />
            <div className="academy-map">
              {["Tech", "Design", "Marketing", "Music", "Youth"].map((item, index) => (
                <span key={item} style={{ "--i": index } as React.CSSProperties}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="academy-stats" aria-label="Academy overview">
        {[
          ["12", "Course tracks"],
          ["5", "Learning categories"],
          ["100%", "Project-based"],
          ["Africa", "Market focus"],
        ].map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className="academy-section academy-band" id="courses">
        <div className="academy-section-head">
          <span className="academy-label">
            <Filter size={15} />
            Course catalog
          </span>
          <h2>Choose a track that matches the learner's goal.</h2>
          <p>
            Each course is designed to end with a useful project, not just lesson notes.
          </p>
        </div>

        <div className="academy-filters" role="tablist" aria-label="Course categories">
          {academyCategories.map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? "active" : ""}
              onClick={() => setActiveCategory(category)}
            >
              {category}
              <span>{categoryCounts[category]}</span>
            </button>
          ))}
        </div>

        <div className="academy-course-grid">
          {visibleTracks.map((track) => {
            const Icon = trackIcons[track.slug as keyof typeof trackIcons] ?? BookOpen;

            return (
              <article className="academy-course-card" key={track.slug} style={{ "--accent": track.accent } as React.CSSProperties}>
                <div className="course-topline">
                  <div className="course-icon">
                    <Icon size={24} />
                  </div>
                  <span>{track.category}</span>
                </div>

                <h3>{track.title}</h3>
                <p>{track.outcome}</p>

                <div className="course-meta">
                  <span>{track.level}</span>
                  <span>{track.duration}</span>
                </div>

                <div className="module-list" aria-label={`${track.title} modules`}>
                  {track.modules.slice(0, 6).map((module) => (
                    <span key={module}>{module}</span>
                  ))}
                </div>

                <div className="course-project">
                  <CheckCircle2 size={16} />
                  {track.project}
                </div>

                <div className="course-actions">
                  <a
                    href="#waitlist"
                    onClick={() => setSelectedTrack(track.slug)}
                  >
                    Join waitlist
                    <ArrowRight size={16} />
                  </a>
                  {track.relatedServiceSlug ? (
                    <Link href={`/services/${track.relatedServiceSlug}`}>Related service</Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="academy-section">
        <div className="academy-section-head">
          <span className="academy-label">
            <Wand2 size={15} />
            Learning paths
          </span>
          <h2>Simple routes for different kinds of learners.</h2>
        </div>

        <div className="learning-path-grid">
          {learningPaths.map((path) => (
            <article key={path.title} className="learning-path">
              <h3>{path.title}</h3>
              <p>{path.desc}</p>
              <div>
                {path.tracks.map((track) => (
                  <span key={track}>{track}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="academy-section academy-support">
        <div>
          <span className="academy-label">
            <Users size={15} />
            Scholarships and support
          </span>
          <h2>Built to support African youth, not just sell courses.</h2>
          <p>
            The Academy can connect directly to PurpleSoftHub's donation mission: scholarships, laptops, internet access, mentorship, and local learning hubs for young people who need a real path into tech and digital creativity.
          </p>
        </div>
        <Link href="/donate" className="academy-donate-link">
          Support the mission
          <ArrowRight size={17} />
        </Link>
      </section>

      <section className="academy-section academy-faq">
        <div className="academy-section-head">
          <span className="academy-label">
            <BookOpen size={15} />
            FAQ
          </span>
          <h2>What learners and sponsors need to know.</h2>
        </div>

        <div className="faq-grid">
          {academyFaqs.map((faq) => (
            <article key={faq.q}>
              <h3>{faq.q}</h3>
              <p>{faq.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="academy-section academy-waitlist" id="waitlist">
        <div className="academy-section-head">
          <span className="academy-label">Enrollment interest</span>
          <h2>Join the Academy waitlist.</h2>
          <p>Pick a course interest and leave an email so PurpleSoftHub can follow up when enrollment opens.</p>
        </div>

        <div className="waitlist-form">
          <select value={selectedTrack} onChange={(event) => setSelectedTrack(event.target.value)} aria-label="Select course interest">
            {academyTracks.map((track) => (
              <option key={track.slug} value={track.slug}>
                {track.title}
              </option>
            ))}
          </select>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleWaitlist()}
            type="email"
            placeholder="your@email.com"
            aria-label="Email address"
          />
          <button type="button" onClick={handleWaitlist} disabled={status === "loading" || !email.includes("@")}>
            {status === "loading" ? "Saving..." : "Get updates"}
          </button>
        </div>

        {status === "success" ? (
          <p className="waitlist-success">Saved. You are on the list for {selectedTrackTitle}.</p>
        ) : null}
      </section>

      <Footer />

      <style>{`
        .academy-page {
          min-height: 100vh;
          background: var(--cyber-bg);
          color: var(--cyber-heading);
          overflow-x: hidden;
        }

        .academy-hero {
          position: relative;
          padding: 132px 5% 72px;
          overflow: hidden;
          background:
            linear-gradient(135deg, rgba(124,58,237,0.16), transparent 38%),
            linear-gradient(225deg, rgba(6,182,212,0.12), transparent 36%),
            var(--cyber-bg);
        }

        .academy-grid-bg {
          position: absolute;
          inset: 0;
          opacity: 0.42;
          pointer-events: none;
        }

        .academy-hero-inner,
        .academy-section,
        .academy-stats {
          width: min(1120px, 100%);
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .academy-hero-inner {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr);
          gap: clamp(32px, 5vw, 64px);
          align-items: center;
        }

        .academy-kicker,
        .academy-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          color: var(--accent);
          background: rgba(124,58,237,0.11);
          border: 1px solid rgba(168,85,247,0.24);
          border-radius: 999px;
          padding: 7px 13px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .academy-hero h1 {
          margin: 22px 0 18px;
          max-width: 780px;
          font-family: Outfit, Inter, sans-serif;
          font-size: clamp(42px, 7vw, 82px);
          line-height: 0.98;
          font-weight: 900;
          letter-spacing: 0;
        }

        .academy-lead,
        .academy-section-head p,
        .academy-support p {
          color: var(--text-muted);
          font-size: clamp(16px, 2vw, 19px);
          line-height: 1.75;
        }

        .academy-lead {
          max-width: 680px;
          margin: 0 0 30px;
        }

        .academy-actions,
        .course-actions,
        .academy-donate-link {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .academy-primary {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
          border-radius: 8px;
        }

        .academy-secondary,
        .course-actions a,
        .academy-donate-link {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 18px;
          border-radius: 8px;
          border: 1px solid rgba(6,182,212,0.34);
          color: #67e8f9;
          text-decoration: none;
          font-weight: 800;
          transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
        }

        .academy-secondary:hover,
        .course-actions a:hover,
        .academy-donate-link:hover {
          transform: translateY(-2px);
          border-color: rgba(6,182,212,0.7);
          background: rgba(6,182,212,0.08);
        }

        .academy-visual {
          border: 1px solid var(--cyber-border);
          border-radius: 8px;
          padding: clamp(22px, 4vw, 34px);
          background: color-mix(in srgb, var(--cyber-card) 86%, transparent);
          box-shadow: 0 24px 80px rgba(4, 8, 28, 0.18);
        }

        .academy-logo {
          width: min(210px, 100%);
          height: auto;
          margin-bottom: 26px;
          object-fit: contain;
        }

        .academy-map {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .academy-map span {
          min-height: 78px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(124,58,237,0.18);
          border-radius: 8px;
          color: var(--cyber-heading);
          font-weight: 900;
          background: linear-gradient(135deg, rgba(124,58,237,0.16), rgba(6,182,212,0.05));
        }

        .academy-map span:nth-child(5) {
          grid-column: 1 / -1;
        }

        .academy-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1px;
          margin-top: -28px;
          border: 1px solid var(--cyber-border);
          border-radius: 8px;
          overflow: hidden;
          background: var(--cyber-border);
          z-index: 2;
        }

        .academy-stats div {
          padding: 22px 18px;
          background: var(--cyber-card);
        }

        .academy-stats strong {
          display: block;
          color: var(--accent);
          font-size: clamp(24px, 4vw, 34px);
          font-weight: 900;
          margin-bottom: 4px;
        }

        .academy-stats span {
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 700;
        }

        .academy-section {
          padding: clamp(58px, 8vw, 96px) 0;
        }

        .academy-band {
          width: 100%;
          max-width: none;
          padding-left: max(5%, calc((100% - 1120px) / 2));
          padding-right: max(5%, calc((100% - 1120px) / 2));
          background: linear-gradient(180deg, transparent, rgba(124,58,237,0.06), transparent);
        }

        .academy-section-head {
          max-width: 740px;
          margin-bottom: 28px;
        }

        .academy-section-head h2,
        .academy-support h2 {
          font-family: Outfit, Inter, sans-serif;
          font-size: clamp(28px, 4vw, 48px);
          line-height: 1.08;
          font-weight: 900;
          letter-spacing: 0;
          margin: 14px 0 10px;
        }

        .academy-filters {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 26px;
        }

        .academy-filters button {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 15px;
          border-radius: 8px;
          border: 1px solid var(--cyber-border);
          background: var(--cyber-card);
          color: var(--cyber-heading);
          font: inherit;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .academy-filters button.active {
          border-color: rgba(168,85,247,0.72);
          background: rgba(124,58,237,0.18);
          color: #d8b4fe;
        }

        .academy-filters span {
          color: var(--text-muted);
          font-size: 12px;
        }

        .academy-course-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 18px;
        }

        .academy-course-card,
        .learning-path,
        .faq-grid article {
          border: 1px solid var(--cyber-border);
          border-radius: 8px;
          background: var(--cyber-card);
        }

        .academy-course-card {
          display: flex;
          flex-direction: column;
          min-height: 430px;
          padding: 22px;
          position: relative;
          overflow: hidden;
        }

        .academy-course-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 3px;
          background: var(--accent);
        }

        .course-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .course-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          color: var(--accent);
          background: color-mix(in srgb, var(--accent) 15%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent) 34%, transparent);
        }

        .course-topline span,
        .course-meta span,
        .module-list span,
        .learning-path span {
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
        }

        .course-topline span {
          color: var(--accent);
          background: color-mix(in srgb, var(--accent) 13%, transparent);
          padding: 6px 10px;
        }

        .academy-course-card h3,
        .learning-path h3,
        .faq-grid h3 {
          color: var(--cyber-heading);
          font-size: 20px;
          line-height: 1.25;
          font-weight: 900;
          margin: 0 0 10px;
        }

        .academy-course-card p,
        .learning-path p,
        .faq-grid p,
        .course-project {
          color: var(--text-muted);
          font-size: 14px;
          line-height: 1.65;
        }

        .course-meta,
        .module-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
        }

        .course-meta span,
        .module-list span,
        .learning-path span {
          color: var(--cyber-heading);
          background: rgba(124,58,237,0.1);
          border: 1px solid rgba(124,58,237,0.16);
          padding: 6px 10px;
        }

        .course-project {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-top: 18px;
        }

        .course-project svg {
          color: #22c55e;
          flex: 0 0 auto;
          margin-top: 3px;
        }

        .course-actions {
          margin-top: auto;
          padding-top: 20px;
        }

        .course-actions a {
          min-height: 40px;
          padding: 9px 12px;
          font-size: 13px;
        }

        .learning-path-grid,
        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 18px;
        }

        .learning-path,
        .faq-grid article {
          padding: 22px;
        }

        .learning-path div {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 18px;
        }

        .academy-support {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
          border-top: 1px solid var(--cyber-border);
          border-bottom: 1px solid var(--cyber-border);
        }

        .academy-support > div {
          max-width: 760px;
        }

        .academy-waitlist {
          text-align: center;
        }

        .academy-waitlist .academy-section-head {
          margin-left: auto;
          margin-right: auto;
        }

        .waitlist-form {
          display: grid;
          grid-template-columns: minmax(220px, 1.2fr) minmax(220px, 1fr) auto;
          gap: 10px;
          max-width: 860px;
          margin: 0 auto;
        }

        .waitlist-form select,
        .waitlist-form input {
          min-height: 48px;
          border: 1px solid var(--cyber-border);
          border-radius: 8px;
          background: var(--cyber-card);
          color: var(--cyber-heading);
          padding: 0 14px;
          font: inherit;
          outline: none;
        }

        .waitlist-form button {
          min-height: 48px;
          border: 0;
          border-radius: 8px;
          padding: 0 22px;
          background: linear-gradient(135deg, #7c3aed, #06b6d4);
          color: white;
          font: inherit;
          font-weight: 900;
          cursor: pointer;
        }

        .waitlist-form button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .waitlist-success {
          margin: 14px auto 0;
          color: #22c55e;
          font-weight: 800;
        }

        @media (max-width: 860px) {
          .academy-hero {
            padding-top: 110px;
          }

          .academy-hero-inner,
          .waitlist-form {
            grid-template-columns: 1fr;
          }

          .academy-visual {
            order: -1;
          }

          .academy-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            margin-left: 5%;
            margin-right: 5%;
            width: auto;
          }

          .academy-support {
            align-items: flex-start;
            flex-direction: column;
          }

          .waitlist-form button {
            width: 100%;
          }
        }

        @media (max-width: 520px) {
          .academy-map {
            grid-template-columns: 1fr;
          }

          .academy-map span:nth-child(5) {
            grid-column: auto;
          }

          .academy-stats {
            grid-template-columns: 1fr;
          }

          .academy-actions a,
          .academy-filters button,
          .academy-secondary {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
