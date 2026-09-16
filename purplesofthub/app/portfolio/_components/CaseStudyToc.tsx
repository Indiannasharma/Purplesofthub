"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface CaseStudySection {
  id: string;
  label: string;
}

interface CaseStudyTocProps {
  sections: CaseStudySection[];
  title: string;
  eyebrow: string;
  year?: string | null;
}

/**
 * Sticky case-study sub navigation.
 *
 * Mirrors the portfolio index toolbar (sticky under the fixed navbar) and adds two premium
 * affordances: a reading-progress line and scroll-spy highlighting, so a long case study
 * stays navigable without a permanent sidebar on mobile.
 */
export default function CaseStudyToc({ sections, title, eyebrow, year }: CaseStudyTocProps) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [progress, setProgress] = useState(0);
  const frame = useRef<number | null>(null);
  const sectionKey = sections.map((section) => section.id).join("|");

  useEffect(() => {
    const update = () => {
      frame.current = null;
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0);
    };

    const onScroll = () => {
      if (frame.current !== null) return;
      frame.current = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  useEffect(() => {
    const ids = sectionKey ? sectionKey.split("|") : [];
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-132px 0px -58% 0px", threshold: [0, 0.15, 1] }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [sectionKey]);

  return (
    <div className="pf-cs-toc">
      <div className="pf-shell pf-cs-toc-inner">
        <Link href="/portfolio" className="pf-cs-crumb">
          <span className="pf-cs-crumb-arrow" aria-hidden="true">
            ←
          </span>
          <span className="pf-cs-crumb-label">Selected work</span>
          <span className="pf-cs-crumb-sep" aria-hidden="true">
            /
          </span>
          <span className="pf-cs-crumb-current">{title}</span>
        </Link>

        {sections.length ? (
          <nav className="pf-cs-toc-links" aria-label="Case study sections">
            {sections.map((section) => {
              const isActive = active === section.id;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={isActive ? "pf-cs-toc-link is-active" : "pf-cs-toc-link"}
                  aria-current={isActive ? "true" : undefined}
                >
                  {section.label}
                </a>
              );
            })}
          </nav>
        ) : null}

        <span className="pf-cs-toc-meta">
          {eyebrow}
          {year ? ` · ${year}` : ""}
        </span>
      </div>

      <span className="pf-cs-progress" aria-hidden="true">
        <span className="pf-cs-progress-bar" style={{ transform: `scaleX(${progress})` }} />
      </span>
    </div>
  );
}