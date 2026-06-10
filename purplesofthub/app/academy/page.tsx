"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Blocks,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Film,
  Filter,
  Globe2,
  GraduationCap,
  LayoutTemplate,
  Laptop,
  Megaphone,
  MessageCircle,
  Music2,
  PenTool,
  Phone,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wand2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AnimatedCard, CountUp, FadeInUp, StaggerContainer, StaggerItem } from "@/components/motion";
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

const academyStats = [
  {
    value: 12,
    suffix: "",
    label: "Course tracks",
    detail: "Tech, design, business, music, and youth programs",
    icon: BookOpen,
    accent: "#a855f7",
  },
  {
    value: 5,
    suffix: "",
    label: "Learning categories",
    detail: "Clear paths for beginners, creators, and founders",
    icon: GraduationCap,
    accent: "#06b6d4",
  },
  {
    value: 100,
    suffix: "%",
    label: "Project-based",
    detail: "Every track ends with practical portfolio work",
    icon: Target,
    accent: "#22c55e",
  },
  {
    value: null,
    text: "Africa",
    label: "Market focus",
    detail: "Built around local opportunities with global standards",
    icon: Globe2,
    accent: "#f472b6",
  },
];

const academyBenefits = [
  {
    title: "Live cohort structure",
    desc: "Guided lessons, weekly milestones, and clear deadlines so learners stay accountable.",
    icon: CalendarDays,
  },
  {
    title: "Portfolio-ready projects",
    desc: "Every track ends with work students can show to clients, employers, or sponsors.",
    icon: Laptop,
  },
  {
    title: "Mentorship and review",
    desc: "Support from practical builders, with feedback on projects, presentation, and next steps.",
    icon: MessageCircle,
  },
  {
    title: "Career and business focus",
    desc: "Training connects skills to freelance work, digital jobs, startups, and local business needs.",
    icon: Award,
  },
];

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
          <FadeInUp className="academy-hero-copy">
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
          </FadeInUp>

          <FadeInUp className="academy-visual" delay={0.12}>
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
          </FadeInUp>
        </div>
      </section>

      <StaggerContainer className="academy-stats" aria-label="Academy overview">
        {academyStats.map((stat) => (
          <StaggerItem className="academy-stat-shell" key={stat.label}>
            <div className="academy-stat" style={{ "--stat-accent": stat.accent } as React.CSSProperties}>
              <div className="academy-stat-top">
                <span className="academy-stat-icon">
                  <stat.icon size={19} />
                </span>
                <span className="academy-stat-label">{stat.label}</span>
              </div>
              <strong>
                {typeof stat.value === "number" ? (
                  <CountUp end={stat.value} suffix={stat.suffix} duration={1.35} />
                ) : (
                  <span className="academy-word-stat">{stat.text}</span>
                )}
              </strong>
              <p>{stat.detail}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <section className="academy-section academy-benefits" aria-labelledby="academy-benefits-title">
        <FadeInUp className="academy-section-head">
          <span className="academy-label">
            <ClipboardCheck size={15} />
            Academy experience
          </span>
          <h2 id="academy-benefits-title">More than video lessons and certificates.</h2>
          <p>
            The Academy should feel like a guided launchpad: structured learning, real projects, review, and a clear path from beginner skill to useful digital work.
          </p>
        </FadeInUp>

        <StaggerContainer className="academy-benefit-grid">
          {academyBenefits.map((benefit) => (
            <StaggerItem key={benefit.title}>
              <AnimatedCard className="academy-benefit-card">
                <span>
                  <benefit.icon size={22} />
                </span>
                <h3>{benefit.title}</h3>
                <p>{benefit.desc}</p>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="academy-section academy-band" id="courses">
        <FadeInUp className="academy-section-head">
          <span className="academy-label">
            <Filter size={15} />
            Course catalog
          </span>
          <h2>Choose a track that matches the learner's goal.</h2>
          <p>
            Each course is designed to end with a useful project, not just lesson notes.
          </p>
        </FadeInUp>

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

        <StaggerContainer className="academy-course-grid">
          {visibleTracks.map((track) => {
            const Icon = trackIcons[track.slug as keyof typeof trackIcons] ?? BookOpen;

            return (
              <StaggerItem className="academy-course-motion" key={track.slug}>
                <AnimatedCard className="academy-course-card" style={{ "--accent": track.accent } as React.CSSProperties}>
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
                </AnimatedCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      <section className="academy-section">
        <FadeInUp className="academy-section-head">
          <span className="academy-label">
            <Wand2 size={15} />
            Learning paths
          </span>
          <h2>Simple routes for different kinds of learners.</h2>
        </FadeInUp>

        <StaggerContainer className="learning-path-grid">
          {learningPaths.map((path) => (
            <StaggerItem key={path.title}>
              <AnimatedCard className="learning-path">
                <h3>{path.title}</h3>
                <p>{path.desc}</p>
                <div>
                  {path.tracks.map((track) => (
                    <span key={track}>{track}</span>
                  ))}
                </div>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <FadeInUp className="academy-section academy-support">
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
      </FadeInUp>

      <section className="academy-section academy-faq">
        <FadeInUp className="academy-section-head">
          <span className="academy-label">
            <BookOpen size={15} />
            FAQ
          </span>
          <h2>What learners and sponsors need to know.</h2>
        </FadeInUp>

        <StaggerContainer className="faq-grid">
          {academyFaqs.map((faq) => (
            <StaggerItem key={faq.q}>
              <AnimatedCard className="faq-card">
                <h3>{faq.q}</h3>
                <p>{faq.a}</p>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <FadeInUp className="academy-section academy-waitlist" id="waitlist">
        <div className="academy-section-head">
          <span className="academy-label">Enrollment interest</span>
          <h2>Join the Academy waitlist.</h2>
          <p>Pick a course interest and leave an email so PurpleSoftHub can follow up when enrollment opens. Sponsors and partners can use the links below to support a learner or start a conversation.</p>
        </div>

        <div className="academy-enrollment-options" aria-label="Enrollment options">
          <a href="#waitlist">
            <strong>Learners</strong>
            <span>Get cohort updates and course launch notices.</span>
          </a>
          <Link href="/donate">
            <strong>Sponsors</strong>
            <span>Support scholarships, devices, internet, and hubs.</span>
          </Link>
          <Link href="/contact">
            <strong>Partners</strong>
            <span>Talk to PurpleSoftHub about training or collaboration.</span>
          </Link>
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
            {status === "loading" ? "Saving..." : "Join waitlist"}
          </button>
        </div>

        {status === "success" ? (
          <p className="waitlist-success">Saved. You are on the list for {selectedTrackTitle}.</p>
        ) : null}
      </FadeInUp>

      <Footer />

      <style>{`
        .academy-page {
          min-height: 100vh;
          background: var(--cyber-bg);
          color: var(--cyber-heading);
          overflow-x: hidden;
          overflow-wrap: break-word;
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
          animation: academy-grid-drift 16s ease-in-out infinite alternate;
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
          line-height: 1.35;
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
          justify-content: center;
          gap: 9px;
          text-decoration: none;
          border-radius: 8px;
          text-align: center;
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
          text-align: center;
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
          position: relative;
          overflow: hidden;
        }

        .academy-visual::before {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          right: -84px;
          top: -86px;
          background: radial-gradient(circle, rgba(6,182,212,0.24), transparent 68%);
          animation: academy-orbit-glow 7s ease-in-out infinite;
          pointer-events: none;
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
          animation: academy-card-float 4.6s ease-in-out infinite;
          animation-delay: calc(var(--i) * 120ms);
        }

        .academy-map span:nth-child(5) {
          grid-column: 1 / -1;
        }

        .academy-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: -34px;
          z-index: 2;
          padding-inline: 5%;
        }

        .academy-stat-shell {
          min-width: 0;
        }

        .academy-stat {
          min-height: 178px;
          height: 100%;
          position: relative;
          overflow: hidden;
          padding: 20px;
          border: 1px solid color-mix(in srgb, var(--stat-accent) 34%, var(--cyber-border));
          border-radius: 8px;
          background:
            linear-gradient(145deg, color-mix(in srgb, var(--stat-accent) 15%, transparent), transparent 44%),
            linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015)),
            color-mix(in srgb, var(--cyber-card) 92%, #05020d);
          box-shadow:
            0 18px 44px rgba(4, 8, 28, 0.22),
            inset 0 1px 0 rgba(255,255,255,0.07);
          transform: translateZ(0);
        }

        .academy-stat::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 3px;
          background: linear-gradient(90deg, var(--stat-accent), transparent);
          opacity: 0.95;
        }

        .academy-stat::after {
          content: "";
          position: absolute;
          width: 96px;
          height: 96px;
          right: -34px;
          top: -34px;
          border-radius: 50%;
          background: radial-gradient(circle, color-mix(in srgb, var(--stat-accent) 34%, transparent), transparent 68%);
          opacity: 0.85;
          animation: academy-stat-pulse 4.8s ease-in-out infinite;
          pointer-events: none;
        }

        .academy-stat-top {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .academy-stat-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          color: var(--stat-accent);
          border: 1px solid color-mix(in srgb, var(--stat-accent) 34%, transparent);
          background: color-mix(in srgb, var(--stat-accent) 13%, transparent);
          box-shadow: 0 0 28px color-mix(in srgb, var(--stat-accent) 18%, transparent);
        }

        .academy-stat-label {
          color: color-mix(in srgb, var(--cyber-heading) 76%, var(--stat-accent));
          font-size: 11px;
          line-height: 1.35;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-align: right;
          text-transform: uppercase;
          overflow-wrap: anywhere;
        }

        .academy-stats strong {
          position: relative;
          z-index: 1;
          display: block;
          color: var(--cyber-heading);
          font-family: Outfit, Inter, sans-serif;
          font-size: clamp(34px, 5vw, 52px);
          line-height: 0.9;
          font-weight: 900;
          margin-bottom: 14px;
          text-shadow: 0 0 24px color-mix(in srgb, var(--stat-accent) 28%, transparent);
        }

        .academy-word-stat {
          display: inline-block;
          animation: academy-word-pop 900ms cubic-bezier(.21,.47,.32,.98) both;
        }

        .academy-stat p {
          position: relative;
          z-index: 1;
          max-width: 230px;
          margin: 0;
          color: var(--text-muted);
          font-size: 13px;
          line-height: 1.55;
          font-weight: 750;
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

        .academy-benefits {
          padding-bottom: clamp(42px, 6vw, 72px);
        }

        .academy-benefit-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .academy-benefit-card {
          height: 100%;
          min-height: 220px;
          padding: 22px;
          border: 1px solid var(--cyber-border);
          border-radius: 8px;
          background:
            linear-gradient(145deg, rgba(124,58,237,0.11), transparent 48%),
            color-mix(in srgb, var(--cyber-card) 92%, transparent);
          box-shadow: 0 18px 50px rgba(4, 8, 28, 0.12);
          position: relative;
          overflow: hidden;
        }

        .academy-benefit-card::after {
          content: "";
          position: absolute;
          inset: auto 18px 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(6,182,212,0.64), transparent);
          opacity: 0.8;
        }

        .academy-benefit-card > span {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          color: #67e8f9;
          border: 1px solid rgba(6,182,212,0.3);
          background: rgba(6,182,212,0.1);
          margin-bottom: 18px;
        }

        .academy-benefit-card h3 {
          margin: 0 0 10px;
          color: var(--cyber-heading);
          font-size: 18px;
          line-height: 1.25;
          font-weight: 900;
        }

        .academy-benefit-card p {
          margin: 0;
          color: var(--text-muted);
          font-size: 14px;
          line-height: 1.65;
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
          text-align: left;
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
        .faq-card {
          border: 1px solid var(--cyber-border);
          border-radius: 8px;
          background: var(--cyber-card);
        }

        .academy-course-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 430px;
          padding: 22px;
          position: relative;
          overflow: hidden;
          transition: border-color 180ms ease, box-shadow 180ms ease;
        }

        .academy-course-motion {
          height: 100%;
        }

        .academy-course-card:hover {
          border-color: color-mix(in srgb, var(--accent) 44%, var(--cyber-border));
          box-shadow: 0 18px 46px rgba(124,58,237,0.13);
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
          line-height: 1.3;
          text-align: right;
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
          flex: 1 1 150px;
          text-align: center;
        }

        .learning-path-grid,
        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 18px;
        }

        .learning-path,
        .faq-card {
          padding: 22px;
          height: 100%;
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

        .academy-enrollment-options {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          max-width: 900px;
          margin: 0 auto 18px;
        }

        .academy-enrollment-options a {
          min-height: 112px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 8px;
          padding: 18px;
          border: 1px solid var(--cyber-border);
          border-radius: 8px;
          background:
            linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.05)),
            var(--cyber-card);
          color: var(--cyber-heading);
          text-align: left;
          text-decoration: none;
          transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
        }

        .academy-enrollment-options a:hover {
          transform: translateY(-2px);
          border-color: rgba(168,85,247,0.5);
          background:
            linear-gradient(135deg, rgba(124,58,237,0.18), rgba(6,182,212,0.08)),
            var(--cyber-card);
        }

        .academy-enrollment-options strong {
          font-size: 15px;
          font-weight: 900;
        }

        .academy-enrollment-options span {
          color: var(--text-muted);
          font-size: 13px;
          line-height: 1.5;
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
          white-space: nowrap;
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

        @keyframes academy-grid-drift {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(18px, -12px, 0);
          }
        }

        @keyframes academy-orbit-glow {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.64;
          }
          50% {
            transform: translate3d(-24px, 26px, 0) scale(1.12);
            opacity: 0.92;
          }
        }

        @keyframes academy-card-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes academy-word-pop {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes academy-stat-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.68;
          }
          50% {
            transform: scale(1.16);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .academy-grid-bg,
          .academy-visual::before,
          .academy-map span,
          .academy-word-stat,
          .academy-stat::after {
            animation: none;
          }

          .academy-secondary,
          .course-actions a,
          .academy-donate-link,
          .academy-course-card {
            transition: none;
          }
        }

        @media (max-width: 1080px) {
          .academy-benefit-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 860px) {
          .academy-hero {
            padding-top: 110px;
            padding-bottom: 58px;
          }

          .academy-hero-inner,
          .waitlist-form {
            grid-template-columns: 1fr;
          }

          .academy-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            margin-left: 5%;
            margin-right: 5%;
            width: auto;
            padding-inline: 0;
          }

          .academy-benefit-grid,
          .academy-enrollment-options {
            grid-template-columns: 1fr;
          }

          .academy-support {
            align-items: flex-start;
            flex-direction: column;
          }

          .waitlist-form button {
            width: 100%;
          }

          .academy-hero-copy,
          .academy-section-head,
          .academy-support,
          .academy-waitlist {
            text-align: left;
          }

          .academy-waitlist .academy-section-head {
            margin-left: 0;
            margin-right: 0;
          }
        }

        @media (max-width: 520px) {
          .academy-hero {
            padding: 104px 4.5% 48px;
          }

          .academy-hero h1 {
            font-size: clamp(34px, 13vw, 44px);
            line-height: 1.04;
          }

          .academy-section-head h2,
          .academy-support h2 {
            font-size: clamp(26px, 9vw, 34px);
            line-height: 1.12;
          }

          .academy-lead,
          .academy-section-head p,
          .academy-support p {
            font-size: 16px;
            line-height: 1.68;
          }

          .academy-kicker,
          .academy-label {
            align-items: flex-start;
            width: 100%;
            border-radius: 8px;
          }

          .academy-visual {
            padding: 18px;
          }

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
            min-width: 0;
          }

          .academy-filters {
            display: grid;
            grid-template-columns: 1fr;
          }

          .academy-filters button {
            justify-content: space-between;
          }

          .academy-course-grid,
          .learning-path-grid,
          .faq-grid {
            grid-template-columns: 1fr;
          }

          .academy-course-card,
          .learning-path,
          .faq-card,
          .academy-benefit-card {
            padding: 18px;
          }

          .course-topline {
            align-items: flex-start;
          }

          .course-actions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .course-actions a {
            width: 100%;
          }

          .academy-enrollment-options a {
            min-height: auto;
          }

          .waitlist-form {
            gap: 12px;
          }

          .waitlist-form select,
          .waitlist-form input,
          .waitlist-form button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
