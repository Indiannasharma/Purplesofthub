'use client'

import { useMemo } from "react";
import type { CSSProperties } from "react";
import { useTheme } from "@/context/ThemeContext";

type HeroCosmosSceneProps = {
  variant?: "planet" | "backdrop";
};

type Accent = "purple" | "cyan" | "pink";

type ParticleConfig = {
  left: number;
  top: number;
  size: number;
  accent: Accent;
  duration: number;
  delay: number;
  drift: number;
  blink: number;
};

type TechLineConfig = {
  left: number;
  top: number;
  width: number;
  angle: number;
  accent: Accent;
  duration: number;
  delay: number;
  thickness: number;
  opacityDark: number;
  opacityLight: number;
};

type StarConfig = {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  opacityDark: number;
  opacityLight: number;
};

const ACCENT_COLORS: Record<Accent, string> = {
  purple: "#A855F7",
  cyan: "#22D3EE",
  pink: "#EC4899",
};

const PLANET_PARTICLES: ParticleConfig[] = [
  { left: 12, top: 46, size: 4, accent: "purple", duration: 7.4, delay: 0.4, drift: 16, blink: 3.4 },
  { left: 18, top: 24, size: 6, accent: "cyan", duration: 10.2, delay: 1.3, drift: 28, blink: 4.8 },
  { left: 24, top: 74, size: 3, accent: "pink", duration: 8.6, delay: 2.6, drift: 18, blink: 0 },
  { left: 29, top: 14, size: 5, accent: "purple", duration: 9.4, delay: 1.1, drift: 22, blink: 2.8 },
  { left: 35, top: 34, size: 2, accent: "cyan", duration: 7.8, delay: 0.8, drift: 14, blink: 0 },
  { left: 38, top: 66, size: 7, accent: "pink", duration: 11.4, delay: 2.2, drift: 30, blink: 5.2 },
  { left: 42, top: 18, size: 4, accent: "purple", duration: 8.2, delay: 1.7, drift: 18, blink: 3.1 },
  { left: 46, top: 82, size: 3, accent: "cyan", duration: 10.8, delay: 0.2, drift: 20, blink: 0 },
  { left: 52, top: 12, size: 8, accent: "pink", duration: 9.1, delay: 1.5, drift: 24, blink: 4.2 },
  { left: 58, top: 30, size: 5, accent: "purple", duration: 7.2, delay: 0.9, drift: 18, blink: 0 },
  { left: 62, top: 74, size: 2, accent: "cyan", duration: 11.8, delay: 2.8, drift: 32, blink: 5.4 },
  { left: 68, top: 18, size: 4, accent: "pink", duration: 8.8, delay: 1.8, drift: 20, blink: 3.5 },
  { left: 72, top: 50, size: 6, accent: "purple", duration: 10.4, delay: 0.6, drift: 24, blink: 0 },
  { left: 76, top: 68, size: 3, accent: "cyan", duration: 6.9, delay: 2.1, drift: 16, blink: 2.7 },
  { left: 82, top: 22, size: 5, accent: "pink", duration: 8.3, delay: 0.4, drift: 18, blink: 0 },
  { left: 86, top: 56, size: 2, accent: "purple", duration: 9.7, delay: 1.9, drift: 22, blink: 4.6 },
  { left: 15, top: 62, size: 7, accent: "cyan", duration: 11.2, delay: 2.5, drift: 28, blink: 5 },
  { left: 22, top: 42, size: 3, accent: "pink", duration: 7.6, delay: 1.4, drift: 16, blink: 0 },
  { left: 32, top: 86, size: 4, accent: "purple", duration: 9.9, delay: 0.7, drift: 20, blink: 4.1 },
  { left: 49, top: 4, size: 3, accent: "cyan", duration: 8.7, delay: 2.3, drift: 14, blink: 0 },
  { left: 57, top: 88, size: 6, accent: "pink", duration: 10.5, delay: 1.2, drift: 30, blink: 5.5 },
  { left: 65, top: 6, size: 2, accent: "purple", duration: 6.8, delay: 0.3, drift: 12, blink: 2.5 },
  { left: 74, top: 10, size: 4, accent: "cyan", duration: 8.4, delay: 2.7, drift: 22, blink: 0 },
  { left: 80, top: 80, size: 5, accent: "pink", duration: 10.7, delay: 1.6, drift: 26, blink: 4.8 },
  { left: 90, top: 42, size: 3, accent: "purple", duration: 7.9, delay: 0.5, drift: 18, blink: 0 },
];

const TECH_LINES: TechLineConfig[] = [
  { left: 56, top: 16, width: 220, angle: -12, accent: "cyan", duration: 4.8, delay: 0.6, thickness: 2, opacityDark: 0.34, opacityLight: 0.42 },
  { left: 62, top: 26, width: 340, angle: 14, accent: "purple", duration: 7.1, delay: 2.1, thickness: 1, opacityDark: 0.22, opacityLight: 0.35 },
  { left: 70, top: 20, width: 150, angle: -26, accent: "pink", duration: 5.2, delay: 1.2, thickness: 2, opacityDark: 0.3, opacityLight: 0.44 },
  { left: 66, top: 42, width: 280, angle: 10, accent: "cyan", duration: 6.6, delay: 0.4, thickness: 1, opacityDark: 0.24, opacityLight: 0.36 },
  { left: 58, top: 54, width: 400, angle: -8, accent: "purple", duration: 7.8, delay: 1.4, thickness: 2, opacityDark: 0.28, opacityLight: 0.4 },
  { left: 74, top: 48, width: 190, angle: 28, accent: "pink", duration: 4.1, delay: 2.4, thickness: 1, opacityDark: 0.2, opacityLight: 0.33 },
  { left: 60, top: 68, width: 260, angle: -18, accent: "cyan", duration: 5.6, delay: 0.9, thickness: 2, opacityDark: 0.32, opacityLight: 0.46 },
  { left: 72, top: 72, width: 120, angle: 12, accent: "purple", duration: 3.9, delay: 1.8, thickness: 1, opacityDark: 0.26, opacityLight: 0.38 },
  { left: 79, top: 60, width: 310, angle: -30, accent: "pink", duration: 6.1, delay: 2.9, thickness: 1, opacityDark: 0.24, opacityLight: 0.34 },
  { left: 82, top: 34, width: 90, angle: 6, accent: "cyan", duration: 4.6, delay: 0.7, thickness: 2, opacityDark: 0.36, opacityLight: 0.48 },
];

const STARS: StarConfig[] = Array.from({ length: 84 }, (_, index) => ({
  left: (index * 13) % 100,
  top: (index * 29) % 100,
  size: index % 5 === 0 ? 2 : 1,
  duration: 3 + (index % 6) * 0.9,
  delay: (index % 7) * 0.45,
  opacityDark: 0.2 + (index % 5) * 0.05,
  opacityLight: 0.15 + (index % 4) * 0.03,
}));

function clampOpacity(value: number) {
  return Math.max(0, Math.min(1, value));
}

export default function HeroCosmosScene({
  variant = "planet",
}: HeroCosmosSceneProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const visibleStars = isDark ? STARS : STARS.slice(0, 32);
  const particles = useMemo(() => PLANET_PARTICLES, []);
  const techLines = useMemo(() => TECH_LINES, []);

  if (variant === "backdrop") {
    return (
      <div className="psh-hero-shell psh-hero-shell--backdrop" aria-hidden="true">
        <div
          className="psh-nebula"
          style={{
            opacity: isDark ? 0.6 : 0.3,
          }}
        />

        <div className="psh-starfield">
          {visibleStars.map((star, index) => (
            <span
              key={index}
              className="psh-star"
              style={
                {
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  background: isDark ? "#FFFFFF" : "#666666",
                  ["--star-min" as string]: isDark ? star.opacityDark : star.opacityLight,
                  ["--star-max" as string]: isDark
                    ? clampOpacity(star.opacityDark + 0.2)
                    : clampOpacity(star.opacityLight + 0.1),
                  opacity: isDark ? star.opacityDark : star.opacityLight,
                  animationDuration: `${star.duration}s`,
                  animationDelay: `${star.delay}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="psh-tech-lines">
          {techLines.map((line, index) => (
            <span
              key={index}
              className="psh-tech-line"
              style={
                {
                  left: `${line.left}%`,
                  top: `${line.top}%`,
                  width: `${line.width}px`,
                  height: `${line.thickness}px`,
                  background: ACCENT_COLORS[line.accent],
                  ["--line-min" as string]: isDark ? line.opacityDark : line.opacityLight,
                  ["--line-max" as string]: isDark
                    ? clampOpacity(line.opacityDark + 0.18)
                    : clampOpacity(line.opacityLight + 0.1),
                  opacity: isDark ? line.opacityDark : line.opacityLight,
                  transform: `rotate(${line.angle}deg)`,
                  filter: isDark
                    ? `drop-shadow(0 0 10px ${ACCENT_COLORS[line.accent]}99)`
                    : "none",
                  animationDuration: `${line.duration}s`,
                  animationDelay: `${line.delay}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="psh-hero-shell psh-hero-shell--planet" aria-hidden="true">
      <div
        className="psh-planet-aura"
        style={{
          opacity: isDark ? 0.5 : 0.3,
        }}
      />

      <div className="psh-planet-container">
        <div
          className="psh-planet"
          style={{
            boxShadow: isDark
              ? "0 0 80px rgba(168,85,247,0.4), inset -20px -20px 60px rgba(0,0,0,0.3)"
              : "0 0 80px rgba(168,85,247,0.2), inset -20px -20px 40px rgba(0,0,0,0.1)",
            filter: isDark
              ? "drop-shadow(0 0 80px rgba(168,85,247,0.4))"
              : "drop-shadow(0 0 80px rgba(168,85,247,0.2))",
          }}
        >
          <div className="psh-planet-sheen" />
          <div className="psh-planet-texture" />
        </div>

        <svg className="psh-rings-svg psh-ring-layer psh-ring-layer--one" viewBox="0 0 800 800">
          <defs>
            <linearGradient id="psh-ring-one" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
          <ellipse
            className="psh-ring psh-ring--one"
            cx="400"
            cy="400"
            rx="350"
            ry="112"
            style={{
              filter: isDark
                ? "drop-shadow(0 0 30px rgba(34,211,238,0.6))"
                : "drop-shadow(0 0 30px rgba(34,211,238,0.4))",
            }}
          />
        </svg>

        <svg className="psh-rings-svg psh-ring-layer psh-ring-layer--two" viewBox="0 0 800 800">
          <defs>
            <linearGradient id="psh-ring-two" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>
          <ellipse
            className="psh-ring psh-ring--two"
            cx="400"
            cy="400"
            rx="325"
            ry="104"
            style={{
              filter: isDark
                ? "drop-shadow(0 0 20px rgba(236,72,153,0.5))"
                : "drop-shadow(0 0 20px rgba(236,72,153,0.3))",
            }}
          />
        </svg>

        <svg className="psh-rings-svg psh-ring-layer psh-ring-layer--three" viewBox="0 0 800 800">
          <ellipse
            className="psh-ring psh-ring--three"
            cx="400"
            cy="400"
            rx="372"
            ry="118"
            style={{
              opacity: isDark ? 0.4 : 0.25,
            }}
          />
        </svg>

        {particles.map((particle, index) => {
          const color = ACCENT_COLORS[particle.accent];
          const opacityDark = clampOpacity(0.6 + ((index * 7) % 5) * 0.09);
          const opacityLight = clampOpacity(0.4 + ((index * 5) % 4) * 0.08);

          return (
            <span
              key={index}
              className={`psh-particle ${particle.blink ? "psh-particle--blink" : ""}`}
              style={
                {
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  background: color,
                  opacity: isDark ? opacityDark : opacityLight,
                  boxShadow: isDark
                    ? `0 0 ${particle.size * 3}px ${color}`
                    : `0 0 ${particle.size * 2}px ${color}66`,
                  animationDuration: particle.blink
                    ? `${particle.duration}s, ${particle.blink}s`
                    : `${particle.duration}s`,
                  animationDelay: particle.blink
                    ? `${particle.delay}s, ${particle.delay / 2}s`
                    : `${particle.delay}s`,
                  ["--particle-drift" as string]: `${particle.drift}px`,
                  ["--blink-min" as string]: isDark ? opacityDark : opacityLight,
                  ["--blink-peak" as string]: isDark
                    ? clampOpacity(opacityDark + 0.18)
                    : clampOpacity(opacityLight + 0.08),
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
  .psh-hero-shell {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    transition: opacity 0.5s ease, filter 0.5s ease;
  }

  .psh-hero-shell--planet {
    position: relative;
    inset: auto;
    width: 100%;
    height: 100%;
    min-height: 560px;
    overflow: visible;
  }

  .psh-nebula {
    position: absolute;
    top: 50%;
    right: 3%;
    width: min(86vw, 1320px);
    height: min(86vw, 1320px);
    transform: translateY(-50%);
    background: radial-gradient(
      circle at center,
      rgba(168,85,247,0.15) 0%,
      rgba(34,211,238,0.08) 36%,
      transparent 74%
    );
    filter: blur(220px);
    animation: pshNebulaDrift 18s ease-in-out infinite alternate;
  }

  .psh-starfield,
  .psh-tech-lines {
    position: absolute;
    inset: 0;
  }

  .psh-star {
    position: absolute;
    border-radius: 999px;
    animation: pshTwinkleStar 5s ease-in-out infinite;
    transition: opacity 0.5s ease, background 0.5s ease;
  }

  .psh-tech-line {
    position: absolute;
    transform-origin: left center;
    animation: pshPulseTechLine 5s ease-in-out infinite;
    transition: opacity 0.5s ease, filter 0.5s ease;
  }

  .psh-planet-aura {
    position: absolute;
    top: 50%;
    left: 50%;
    width: min(75vw, 1000px);
    height: min(75vw, 1000px);
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(168,85,247,0.45) 0%, rgba(168,85,247,0.15) 38%, transparent 68%);
    filter: blur(60px);
    transition: opacity 0.5s ease;
  }

  .psh-planet-container {
    position: absolute;
    right: 5%;
    top: 50%;
    transform: translateY(-50%);
    width: clamp(400px, 50vw, 800px);
    height: clamp(400px, 50vw, 800px);
  }

  .psh-planet {
    position: absolute;
    inset: 12%;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 26%, #EC4899 0%, #A855F7 38%, #7C3AED 100%);
    transition: filter 0.5s ease, box-shadow 0.5s ease;
    overflow: hidden;
  }

  .psh-planet-sheen {
    position: absolute;
    top: 10%;
    left: 14%;
    width: 36%;
    height: 24%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 72%);
    filter: blur(10px);
  }

  .psh-planet-texture {
    position: absolute;
    inset: -5%;
    border-radius: 50%;
    background:
      radial-gradient(circle at 66% 34%, rgba(236,72,153,0.22) 0%, transparent 24%),
      radial-gradient(circle at 44% 70%, rgba(255,255,255,0.08) 0%, transparent 20%),
      conic-gradient(from 20deg, transparent 0%, rgba(255,255,255,0.08) 16%, transparent 34%, rgba(34,211,238,0.06) 56%, transparent 80%, rgba(255,255,255,0.06) 100%);
    animation: pshPlanetTextureSpin 20s linear infinite;
  }

  .psh-rings-svg {
    position: absolute;
    inset: 0;
    overflow: visible;
  }

  .psh-ring-layer {
    transform-origin: 50% 50%;
  }

  .psh-ring-layer--one {
    animation: pshRotateRingOne 20s linear infinite;
  }

  .psh-ring-layer--two {
    animation: pshRotateRingTwo 25s linear infinite;
  }

  .psh-ring-layer--three {
    animation: pshRotateRingThree 30s linear infinite;
  }

  .psh-ring {
    fill: none;
    stroke-linecap: round;
    transform-origin: center;
  }

  .psh-ring--one {
    stroke: url(#psh-ring-one);
    stroke-width: 5;
    transform: rotate(20deg);
  }

  .psh-ring--two {
    stroke: url(#psh-ring-two);
    stroke-width: 3;
    transform: rotate(45deg);
  }

  .psh-ring--three {
    stroke: #22D3EE;
    stroke-width: 2;
    transform: rotate(-30deg);
  }

  .psh-particle {
    position: absolute;
    border-radius: 999px;
    animation-name: pshFloatParticle;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    transition: opacity 0.5s ease, box-shadow 0.5s ease;
  }

  .psh-particle--blink {
    animation-name: pshFloatParticle, pshSoftBlink;
    animation-timing-function: ease-in-out, ease-in-out;
    animation-iteration-count: infinite, infinite;
  }

  @keyframes pshRotateRingOne {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pshRotateRingTwo {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }

  @keyframes pshRotateRingThree {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pshFloatParticle {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(calc(-1 * var(--particle-drift, 24px))); }
  }

  @keyframes pshSoftBlink {
    0%, 100% { opacity: var(--blink-min, 0.7); }
    50% { opacity: var(--blink-peak, 0.85); }
  }

  @keyframes pshTwinkleStar {
    0%, 100% { transform: scale(0.9); opacity: var(--star-min, 0.2); }
    50% { transform: scale(1.2); opacity: var(--star-max, 0.4); }
  }

  @keyframes pshPulseTechLine {
    0%, 100% { opacity: var(--line-min, 0.3); }
    50% { opacity: var(--line-max, 0.45); }
  }

  @keyframes pshNebulaDrift {
    from { transform: translateY(-50%) translateX(0px) scale(1); }
    to { transform: translateY(-50%) translateX(-36px) scale(1.05); }
  }

  @keyframes pshPlanetTextureSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @media (max-width: 1023px) {
    .psh-hero-shell--planet {
      display: none;
    }

    .psh-nebula {
      right: -22%;
      width: 920px;
      height: 920px;
      filter: blur(180px);
    }

    .psh-tech-line:nth-child(n + 7) {
      display: none;
    }
  }

  @media (max-width: 640px) {
    .psh-nebula {
      right: -40%;
      width: 760px;
      height: 760px;
      filter: blur(150px);
    }

    .psh-tech-line:nth-child(n + 5) {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .psh-nebula,
    .psh-star,
    .psh-tech-line,
    .psh-ring-layer,
    .psh-particle,
    .psh-planet-texture {
      animation: none !important;
    }
  }
`;
