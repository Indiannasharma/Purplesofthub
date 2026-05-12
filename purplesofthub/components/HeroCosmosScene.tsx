'use client'

import { useMemo } from "react";
import type { CSSProperties } from "react";
import { useTheme } from "@/context/ThemeContext";

type HeroCosmosSceneProps = {
  variant?: "planet" | "backdrop";
};

type Accent = "purple" | "cyan" | "pink";

type StarConfig = {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  darkOpacity: number;
  lightOpacity: number;
};

type SparkConfig = {
  left: number;
  top: number;
  size: number;
  accent: Accent;
  delay: number;
  duration: number;
};

type TechLineConfig = {
  left: number;
  top: number;
  width: number;
  angle: number;
  accent: Accent;
  duration: number;
  delay: number;
  darkOpacity: number;
  lightOpacity: number;
};

const PLANET_ART = "/images/hero/purplesofthub-reference-planet.png";

const ACCENTS: Record<Accent, string> = {
  purple: "#A855F7",
  cyan: "#22D3EE",
  pink: "#EC4899",
};

const STARS: StarConfig[] = Array.from({ length: 88 }, (_, index) => ({
  left: (index * 19) % 100,
  top: (index * 37) % 100,
  size: index % 7 === 0 ? 2 : 1,
  duration: 3.2 + (index % 6) * 0.8,
  delay: (index % 9) * 0.35,
  darkOpacity: 0.18 + (index % 5) * 0.045,
  lightOpacity: 0.1 + (index % 4) * 0.03,
}));

const SPARKS: SparkConfig[] = [
  { left: 24, top: 62, size: 4, accent: "purple", delay: 0.2, duration: 7.5 },
  { left: 32, top: 38, size: 6, accent: "cyan", delay: 1.1, duration: 8.8 },
  { left: 41, top: 68, size: 3, accent: "pink", delay: 2.2, duration: 6.9 },
  { left: 52, top: 34, size: 5, accent: "purple", delay: 0.8, duration: 9.5 },
  { left: 61, top: 58, size: 7, accent: "cyan", delay: 1.7, duration: 10.2 },
  { left: 70, top: 42, size: 4, accent: "pink", delay: 2.7, duration: 7.7 },
  { left: 78, top: 72, size: 3, accent: "purple", delay: 1.4, duration: 8.4 },
  { left: 86, top: 28, size: 5, accent: "cyan", delay: 0.4, duration: 9.2 },
  { left: 91, top: 52, size: 2, accent: "pink", delay: 2.1, duration: 6.8 },
  { left: 66, top: 20, size: 3, accent: "cyan", delay: 1, duration: 7.3 },
  { left: 56, top: 78, size: 4, accent: "purple", delay: 2.8, duration: 8.9 },
  { left: 36, top: 82, size: 3, accent: "pink", delay: 1.9, duration: 7.1 },
];

const TECH_LINES: TechLineConfig[] = [
  { left: 58, top: 18, width: 260, angle: -13, accent: "cyan", duration: 5.5, delay: 0.2, darkOpacity: 0.38, lightOpacity: 0.34 },
  { left: 72, top: 14, width: 230, angle: -24, accent: "pink", duration: 7.2, delay: 1.1, darkOpacity: 0.28, lightOpacity: 0.28 },
  { left: 61, top: 35, width: 360, angle: 10, accent: "purple", duration: 6.8, delay: 2, darkOpacity: 0.22, lightOpacity: 0.28 },
  { left: 76, top: 45, width: 260, angle: 6, accent: "cyan", duration: 4.8, delay: 0.8, darkOpacity: 0.32, lightOpacity: 0.35 },
  { left: 63, top: 62, width: 420, angle: -9, accent: "cyan", duration: 7.4, delay: 1.6, darkOpacity: 0.28, lightOpacity: 0.34 },
  { left: 74, top: 73, width: 280, angle: 27, accent: "pink", duration: 5.8, delay: 2.5, darkOpacity: 0.22, lightOpacity: 0.28 },
  { left: 55, top: 82, width: 320, angle: -28, accent: "purple", duration: 6.2, delay: 0.7, darkOpacity: 0.24, lightOpacity: 0.3 },
];

function clampOpacity(value: number) {
  return Math.max(0, Math.min(1, value));
}

export default function HeroCosmosScene({
  variant = "planet",
}: HeroCosmosSceneProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const stars = useMemo(() => (isDark ? STARS : STARS.slice(0, 36)), [isDark]);

  if (variant === "backdrop") {
    return (
      <div className="hero-cosmos hero-cosmos--backdrop" aria-hidden="true">
        <div
          className="hero-nebula"
          style={{ opacity: isDark ? 0.62 : 0.28 }}
        />
        <div
          className="hero-circuit-grid"
          style={{ opacity: isDark ? 0.72 : 0.42 }}
        />

        {stars.map((star, index) => (
          <span
            key={index}
            className="hero-star"
            style={
              {
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                background: isDark ? "#ffffff" : "#5f5578",
                ["--star-min" as string]: isDark ? star.darkOpacity : star.lightOpacity,
                ["--star-max" as string]: isDark
                  ? clampOpacity(star.darkOpacity + 0.22)
                  : clampOpacity(star.lightOpacity + 0.1),
                animationDuration: `${star.duration}s`,
                animationDelay: `${star.delay}s`,
              } as CSSProperties
            }
          />
        ))}

        {TECH_LINES.map((line, index) => {
          const color = ACCENTS[line.accent];
          return (
            <span
              key={index}
              className="hero-tech-line"
              style={
                {
                  left: `${line.left}%`,
                  top: `${line.top}%`,
                  width: `${line.width}px`,
                  background: color,
                  transform: `rotate(${line.angle}deg)`,
                  filter: isDark ? `drop-shadow(0 0 10px ${color}99)` : "none",
                  ["--line-min" as string]: isDark ? line.darkOpacity : line.lightOpacity,
                  ["--line-max" as string]: isDark
                    ? clampOpacity(line.darkOpacity + 0.16)
                    : clampOpacity(line.lightOpacity + 0.08),
                  animationDuration: `${line.duration}s`,
                  animationDelay: `${line.delay}s`,
                } as CSSProperties
              }
            />
          );
        })}

        <span className="hero-hud-arc hero-hud-arc--one" />
        <span className="hero-hud-arc hero-hud-arc--two" />
        <span className="hero-hud-arc hero-hud-arc--three" />

        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="hero-cosmos hero-cosmos--planet" aria-hidden="true">
      <div
        className="planet-asset-glow"
        style={{ opacity: isDark ? 0.68 : 0.36 }}
      />

      <div className="planet-art-wrap">
        <img
          className="planet-art"
          src={PLANET_ART}
          alt=""
          draggable={false}
        />

        <div className="ring-spin ring-spin--main">
          <span />
        </div>
        <div className="ring-spin ring-spin--accent">
          <span />
        </div>
        <div className="ring-spin ring-spin--dotted">
          <span />
        </div>

        {SPARKS.map((spark, index) => {
          const color = ACCENTS[spark.accent];
          const opacity = isDark ? 0.72 + (index % 3) * 0.09 : 0.44 + (index % 3) * 0.07;

          return (
            <span
              key={index}
              className="planet-spark"
              style={
                {
                  left: `${spark.left}%`,
                  top: `${spark.top}%`,
                  width: `${spark.size}px`,
                  height: `${spark.size}px`,
                  background: color,
                  boxShadow: isDark
                    ? `0 0 ${spark.size * 4}px ${color}`
                    : `0 0 ${spark.size * 3}px ${color}88`,
                  ["--spark-min" as string]: opacity,
                  ["--spark-max" as string]: clampOpacity(opacity + (isDark ? 0.18 : 0.08)),
                  ["--spark-drift" as string]: `${14 + (index % 4) * 5}px`,
                  animationDuration: `${spark.duration}s, ${3.2 + (index % 4) * 0.6}s`,
                  animationDelay: `${spark.delay}s, ${spark.delay / 2}s`,
                } as CSSProperties
              }
            />
          );
        })}
      </div>

      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .hero-cosmos {
    pointer-events: none;
  }

  .hero-cosmos--backdrop {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .hero-cosmos--planet {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 560px;
    overflow: visible;
  }

  .hero-nebula {
    position: absolute;
    top: 46%;
    right: -4%;
    width: min(96vw, 1380px);
    height: min(86vw, 1220px);
    transform: translateY(-50%);
    background:
      radial-gradient(circle at 56% 38%, rgba(34,211,238,0.16) 0%, transparent 28%),
      radial-gradient(circle at 42% 54%, rgba(168,85,247,0.2) 0%, rgba(168,85,247,0.08) 32%, transparent 70%);
    filter: blur(110px);
    animation: nebulaDrift 18s ease-in-out infinite alternate;
  }

  .hero-circuit-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(124,58,237,0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,58,237,0.08) 1px, transparent 1px),
      linear-gradient(135deg, transparent 0 47%, rgba(34,211,238,0.08) 48% 49%, transparent 50%),
      linear-gradient(45deg, transparent 0 47%, rgba(124,58,237,0.07) 48% 49%, transparent 50%);
    background-size: 72px 72px, 72px 72px, 340px 220px, 420px 280px;
    mask-image: radial-gradient(circle at 74% 52%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.68) 58%, transparent 100%);
  }

  .hero-star,
  .hero-tech-line,
  .hero-hud-arc {
    position: absolute;
  }

  .hero-star {
    border-radius: 999px;
    opacity: var(--star-min, 0.2);
    animation: starTwinkle 5s ease-in-out infinite;
  }

  .hero-tech-line {
    height: 2px;
    transform-origin: left center;
    opacity: var(--line-min, 0.3);
    animation: techPulse 5s ease-in-out infinite;
  }

  .hero-hud-arc {
    right: 5%;
    border-radius: 50%;
    border: 1px solid rgba(125,211,252,0.22);
    filter: drop-shadow(0 0 10px rgba(34,211,238,0.12));
  }

  .hero-hud-arc--one {
    top: 24%;
    width: 420px;
    height: 210px;
    border-left-color: transparent;
    border-bottom-color: transparent;
    transform: rotate(18deg);
  }

  .hero-hud-arc--two {
    top: 47%;
    right: 10%;
    width: 500px;
    height: 260px;
    border-right-color: transparent;
    border-top-color: transparent;
    transform: rotate(-13deg);
    opacity: 0.72;
  }

  .hero-hud-arc--three {
    top: 14%;
    right: 20%;
    width: 240px;
    height: 120px;
    border-right-color: transparent;
    border-bottom-color: transparent;
    transform: rotate(-16deg);
    opacity: 0.55;
  }

  .planet-asset-glow {
    position: absolute;
    right: 0;
    top: 50%;
    width: min(52vw, 720px);
    height: min(52vw, 720px);
    transform: translateY(-50%);
    border-radius: 50%;
    background:
      radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 28%),
      radial-gradient(circle, rgba(168,85,247,0.48) 0%, rgba(168,85,247,0.15) 38%, transparent 68%);
    filter: blur(54px);
  }

  .planet-art-wrap {
    position: absolute;
    right: -4%;
    top: 50%;
    width: clamp(480px, 46vw, 710px);
    aspect-ratio: 499 / 464;
    transform: translateY(-50%);
  }

  .planet-art {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    user-select: none;
    filter: saturate(1.12) contrast(1.06) drop-shadow(0 0 38px rgba(34,211,238,0.16));
  }

  .ring-spin {
    position: absolute;
    left: 8%;
    top: 20%;
    width: 92%;
    height: 67%;
    transform-origin: center;
    mix-blend-mode: screen;
  }

  .ring-spin span {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    transform: rotate(-12deg);
  }

  .ring-spin--main {
    animation: ringRotateMain 20s linear infinite;
  }

  .ring-spin--main span {
    border-top: 5px solid rgba(34,211,238,0.72);
    border-bottom: 5px solid rgba(168,85,247,0.62);
    box-shadow: 0 0 24px rgba(34,211,238,0.42), inset 0 0 18px rgba(168,85,247,0.22);
  }

  .ring-spin--accent {
    left: 12%;
    top: 24%;
    width: 84%;
    height: 58%;
    animation: ringRotateAccent 26s linear infinite;
  }

  .ring-spin--accent span {
    border-top: 3px solid rgba(236,72,153,0.58);
    border-bottom: 3px solid rgba(168,85,247,0.44);
    box-shadow: 0 0 18px rgba(236,72,153,0.28);
  }

  .ring-spin--dotted {
    left: 2%;
    top: 13%;
    width: 104%;
    height: 78%;
    animation: ringRotateDotted 34s linear infinite;
  }

  .ring-spin--dotted span {
    border: 2px dashed rgba(125,211,252,0.34);
    box-shadow: 0 0 12px rgba(34,211,238,0.16);
  }

  .planet-spark {
    position: absolute;
    border-radius: 50%;
    opacity: var(--spark-min, 0.6);
    animation: sparkFloat 8s ease-in-out infinite, sparkBlink 4s ease-in-out infinite;
  }

  @keyframes ringRotateMain {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes ringRotateAccent {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }

  @keyframes ringRotateDotted {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes starTwinkle {
    0%, 100% { opacity: var(--star-min, 0.2); transform: scale(0.85); }
    50% { opacity: var(--star-max, 0.45); transform: scale(1.25); }
  }

  @keyframes techPulse {
    0%, 100% { opacity: var(--line-min, 0.24); }
    50% { opacity: var(--line-max, 0.42); }
  }

  @keyframes sparkFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(calc(-1 * var(--spark-drift, 18px))); }
  }

  @keyframes sparkBlink {
    0%, 100% { opacity: var(--spark-min, 0.6); }
    50% { opacity: var(--spark-max, 0.8); }
  }

  @keyframes nebulaDrift {
    from { transform: translateY(-50%) translateX(0) scale(1); }
    to { transform: translateY(-50%) translateX(-30px) scale(1.04); }
  }

  @media (max-width: 1023px) {
    .hero-cosmos--planet {
      display: none;
    }

    .hero-nebula {
      right: -28%;
      width: 900px;
      height: 760px;
      filter: blur(130px);
    }

    .hero-tech-line:nth-of-type(n + 5),
    .hero-hud-arc--three {
      display: none;
    }
  }

  @media (max-width: 640px) {
    .hero-nebula {
      right: -48%;
      width: 720px;
      height: 620px;
      filter: blur(115px);
    }

    .hero-hud-arc,
    .hero-tech-line:nth-of-type(n + 4) {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-nebula,
    .hero-star,
    .hero-tech-line,
    .ring-spin,
    .planet-spark {
      animation: none !important;
    }
  }
`;
