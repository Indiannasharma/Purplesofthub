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
  blink?: number;
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

type TechStrokeConfig = {
  left: number;
  top: number;
  width: number;
  angle: number;
  accent: Accent;
  opacityDark: number;
  opacityLight: number;
  duration: number;
  delay: number;
  thickness: number;
};

const ACCENT_COLORS: Record<Accent, string> = {
  purple: "#A855F7",
  cyan: "#22D3EE",
  pink: "#EC4899",
};

const STAR_SEED: StarConfig[] = Array.from({ length: 90 }, (_, index) => ({
  left: (index * 17) % 100,
  top: (index * 31) % 100,
  size: index % 6 === 0 ? 2 : 1,
  duration: 3 + (index % 6) * 0.9,
  delay: (index % 8) * 0.35,
  opacityDark: 0.2 + (index % 5) * 0.05,
  opacityLight: 0.15 + (index % 4) * 0.03,
}));

const PLANET_PARTICLES: ParticleConfig[] = [
  { left: 6, top: 48, size: 4, accent: "purple", duration: 8, delay: 0.2, drift: 18, blink: 3.2 },
  { left: 14, top: 24, size: 7, accent: "cyan", duration: 10.5, delay: 1.4, drift: 26, blink: 4.8 },
  { left: 18, top: 76, size: 3, accent: "pink", duration: 9.1, delay: 2.1, drift: 16 },
  { left: 26, top: 16, size: 5, accent: "purple", duration: 7.6, delay: 0.9, drift: 20, blink: 2.9 },
  { left: 28, top: 58, size: 4, accent: "cyan", duration: 11.2, delay: 2.6, drift: 30, blink: 5.2 },
  { left: 34, top: 82, size: 2, accent: "pink", duration: 8.4, delay: 1.1, drift: 12 },
  { left: 42, top: 12, size: 6, accent: "purple", duration: 9.7, delay: 0.6, drift: 22, blink: 4.4 },
  { left: 48, top: 66, size: 3, accent: "cyan", duration: 6.8, delay: 1.8, drift: 14 },
  { left: 54, top: 20, size: 8, accent: "pink", duration: 10.8, delay: 2.2, drift: 26, blink: 5.5 },
  { left: 58, top: 48, size: 5, accent: "purple", duration: 8.7, delay: 1.5, drift: 18 },
  { left: 62, top: 78, size: 4, accent: "cyan", duration: 11.6, delay: 0.4, drift: 28, blink: 4.6 },
  { left: 68, top: 14, size: 3, accent: "pink", duration: 7.1, delay: 2.4, drift: 16, blink: 3.7 },
  { left: 74, top: 58, size: 6, accent: "purple", duration: 9.4, delay: 0.8, drift: 20 },
  { left: 78, top: 30, size: 2, accent: "cyan", duration: 6.4, delay: 1.7, drift: 12 },
  { left: 84, top: 68, size: 5, accent: "pink", duration: 10.1, delay: 2.8, drift: 24, blink: 4.9 },
  { left: 90, top: 42, size: 3, accent: "purple", duration: 8.2, delay: 1.2, drift: 18 },
  { left: 22, top: 42, size: 2, accent: "cyan", duration: 7.2, delay: 2.5, drift: 12 },
  { left: 38, top: 38, size: 4, accent: "pink", duration: 9.8, delay: 0.5, drift: 22, blink: 4.1 },
  { left: 66, top: 40, size: 3, accent: "purple", duration: 7.8, delay: 1.9, drift: 16 },
  { left: 82, top: 12, size: 4, accent: "cyan", duration: 8.9, delay: 0.7, drift: 20, blink: 3.8 },
];

const TECH_STROKES: TechStrokeConfig[] = [
  { left: 58, top: 18, width: 150, angle: -14, accent: "cyan", opacityDark: 0.42, opacityLight: 0.44, duration: 5.4, delay: 0.2, thickness: 2 },
  { left: 74, top: 14, width: 220, angle: -24, accent: "pink", opacityDark: 0.32, opacityLight: 0.38, duration: 6.1, delay: 1.1, thickness: 2 },
  { left: 63, top: 34, width: 320, angle: 10, accent: "purple", opacityDark: 0.24, opacityLight: 0.34, duration: 7.5, delay: 2.4, thickness: 1 },
  { left: 80, top: 38, width: 120, angle: 6, accent: "cyan", opacityDark: 0.36, opacityLight: 0.46, duration: 4.2, delay: 0.9, thickness: 2 },
  { left: 60, top: 54, width: 360, angle: -10, accent: "cyan", opacityDark: 0.28, opacityLight: 0.4, duration: 6.8, delay: 1.7, thickness: 1 },
  { left: 75, top: 60, width: 260, angle: 28, accent: "pink", opacityDark: 0.24, opacityLight: 0.35, duration: 5.5, delay: 2.3, thickness: 1 },
  { left: 68, top: 72, width: 180, angle: -18, accent: "purple", opacityDark: 0.22, opacityLight: 0.34, duration: 4.8, delay: 0.5, thickness: 1 },
  { left: 53, top: 76, width: 300, angle: -30, accent: "cyan", opacityDark: 0.38, opacityLight: 0.48, duration: 7.2, delay: 1.4, thickness: 2 },
  { left: 72, top: 82, width: 140, angle: 8, accent: "purple", opacityDark: 0.24, opacityLight: 0.34, duration: 5.1, delay: 2.8, thickness: 1 },
];

function clampOpacity(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getParticleOpacity(index: number, isDark: boolean) {
  const base = isDark ? 0.62 : 0.42;
  const spread = isDark ? 0.32 : 0.2;
  return clampOpacity(base + ((index * 7) % 5) * (spread / 5));
}

export default function HeroCosmosScene({
  variant = "planet",
}: HeroCosmosSceneProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const stars = useMemo(
    () => (isDark ? STAR_SEED : STAR_SEED.slice(0, 34)),
    [isDark],
  );

  if (variant === "backdrop") {
    return (
      <div className="psh-shell psh-shell--backdrop" aria-hidden="true">
        <div
          className="psh-nebula"
          style={{ opacity: isDark ? 0.6 : 0.3 }}
        />
        <div className="psh-grid-field" />

        <div className="psh-stars">
          {stars.map((star, index) => (
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
                    ? clampOpacity(star.opacityDark + 0.22)
                    : clampOpacity(star.opacityLight + 0.1),
                  animationDuration: `${star.duration}s`,
                  animationDelay: `${star.delay}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="psh-tech-strokes">
          {TECH_STROKES.map((line, index) => (
            <span
              key={index}
              className="psh-tech-stroke"
              style={
                {
                  left: `${line.left}%`,
                  top: `${line.top}%`,
                  width: `${line.width}px`,
                  height: `${line.thickness}px`,
                  background: ACCENT_COLORS[line.accent],
                  transform: `rotate(${line.angle}deg)`,
                  ["--line-min" as string]: isDark ? line.opacityDark : line.opacityLight,
                  ["--line-max" as string]: isDark
                    ? clampOpacity(line.opacityDark + 0.16)
                    : clampOpacity(line.opacityLight + 0.08),
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

        <div className="psh-hud-arcs">
          <span className="psh-hud-arc psh-hud-arc--a" />
          <span className="psh-hud-arc psh-hud-arc--b" />
          <span className="psh-hud-arc psh-hud-arc--c" />
        </div>

        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="psh-shell psh-shell--planet" aria-hidden="true">
      <div
        className="psh-planet-glow"
        style={{ opacity: isDark ? 0.5 : 0.3 }}
      />

      <div className="psh-planet-wrap">
        <svg className="psh-orbit-layer psh-orbit-layer--back" viewBox="0 0 1000 1000">
          <defs>
            <linearGradient id="psh-main-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="42%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
            <linearGradient id="psh-accent-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>

          <ellipse
            className="psh-back-ring psh-back-ring--main"
            cx="500"
            cy="500"
            rx="360"
            ry="110"
            style={{
              filter: isDark
                ? "drop-shadow(0 0 30px rgba(34,211,238,0.6))"
                : "drop-shadow(0 0 30px rgba(34,211,238,0.4))",
            }}
          />
          <ellipse
            className="psh-back-ring psh-back-ring--accent"
            cx="500"
            cy="500"
            rx="332"
            ry="98"
            style={{
              filter: isDark
                ? "drop-shadow(0 0 20px rgba(236,72,153,0.5))"
                : "drop-shadow(0 0 20px rgba(236,72,153,0.3))",
            }}
          />
          <ellipse
            className="psh-back-ring psh-back-ring--subtle"
            cx="500"
            cy="500"
            rx="388"
            ry="120"
            style={{ opacity: isDark ? 0.4 : 0.25 }}
          />
        </svg>

        <div
          className="psh-planet"
          style={{
            boxShadow: isDark
              ? "0 0 80px rgba(168,85,247,0.4), inset -24px -30px 72px rgba(0,0,0,0.35)"
              : "0 0 80px rgba(168,85,247,0.2), inset -18px -22px 50px rgba(0,0,0,0.12)",
            filter: isDark
              ? "drop-shadow(0 0 80px rgba(168,85,247,0.4))"
              : "drop-shadow(0 0 80px rgba(168,85,247,0.2))",
          }}
        >
          <div className="psh-planet-highlight" />
          <div className="psh-planet-rim" />
          <div className="psh-planet-texture" />
          <div className="psh-planet-specks" />
        </div>

        <svg className="psh-orbit-layer psh-orbit-layer--front" viewBox="0 0 1000 1000">
          <ellipse
            className="psh-front-ring psh-front-ring--main"
            cx="500"
            cy="500"
            rx="360"
            ry="110"
            style={{
              filter: isDark
                ? "drop-shadow(0 0 30px rgba(34,211,238,0.6))"
                : "drop-shadow(0 0 30px rgba(34,211,238,0.4))",
            }}
          />
          <ellipse
            className="psh-front-ring psh-front-ring--accent"
            cx="500"
            cy="500"
            rx="332"
            ry="98"
            style={{
              filter: isDark
                ? "drop-shadow(0 0 20px rgba(236,72,153,0.5))"
                : "drop-shadow(0 0 20px rgba(236,72,153,0.3))",
            }}
          />
          <ellipse
            className="psh-front-ring psh-front-ring--subtle"
            cx="500"
            cy="500"
            rx="388"
            ry="120"
            style={{ opacity: isDark ? 0.4 : 0.25 }}
          />
        </svg>

        <div className="psh-planet-particles">
          {PLANET_PARTICLES.map((particle, index) => {
            const color = ACCENT_COLORS[particle.accent];
            const opacity = getParticleOpacity(index, isDark);

            return (
              <span
                key={index}
                className={`psh-particle${particle.blink ? " psh-particle--blink" : ""}`}
                style={
                  {
                    left: `${particle.left}%`,
                    top: `${particle.top}%`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    background: color,
                    boxShadow: isDark
                      ? `0 0 ${particle.size * 3}px ${color}`
                      : `0 0 ${particle.size * 2}px ${color}88`,
                    ["--particle-drift" as string]: `${particle.drift}px`,
                    ["--particle-min" as string]: opacity,
                    ["--particle-max" as string]: isDark
                      ? clampOpacity(opacity + 0.18)
                      : clampOpacity(opacity + 0.08),
                    animationDuration: particle.blink
                      ? `${particle.duration}s, ${particle.blink}s`
                      : `${particle.duration}s`,
                    animationDelay: particle.blink
                      ? `${particle.delay}s, ${particle.delay / 2}s`
                      : `${particle.delay}s`,
                  } as CSSProperties
                }
              />
            );
          })}
        </div>

        <div className="psh-ring-sparkles">
          <span className="psh-ring-spark psh-ring-spark--a" />
          <span className="psh-ring-spark psh-ring-spark--b" />
          <span className="psh-ring-spark psh-ring-spark--c" />
          <span className="psh-ring-spark psh-ring-spark--d" />
        </div>
      </div>

      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .psh-shell {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .psh-shell--planet {
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
    right: -2%;
    width: min(92vw, 1380px);
    height: min(92vw, 1380px);
    transform: translateY(-50%);
    background:
      radial-gradient(circle at 50% 44%, rgba(168,85,247,0.15) 0%, rgba(34,211,238,0.08) 34%, transparent 72%);
    filter: blur(220px);
    animation: pshNebulaDrift 18s ease-in-out infinite alternate;
  }

  .psh-grid-field {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(110, 72, 196, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(110, 72, 196, 0.08) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: radial-gradient(circle at 70% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.65) 55%, transparent 96%);
    opacity: 0.7;
  }

  .psh-stars,
  .psh-tech-strokes,
  .psh-hud-arcs,
  .psh-planet-particles,
  .psh-ring-sparkles {
    position: absolute;
    inset: 0;
  }

  .psh-star {
    position: absolute;
    border-radius: 999px;
    animation: pshStarTwinkle 5s ease-in-out infinite;
  }

  .psh-tech-stroke {
    position: absolute;
    transform-origin: left center;
    animation: pshTechPulse 5.8s ease-in-out infinite;
  }

  .psh-hud-arc {
    position: absolute;
    border-radius: 999px;
    border: 1px solid rgba(125, 211, 252, 0.22);
    filter: blur(0.1px);
  }

  .psh-hud-arc--a {
    right: 8%;
    top: 28%;
    width: 380px;
    height: 200px;
    border-left: none;
    border-bottom: none;
    transform: rotate(18deg);
    opacity: 0.6;
  }

  .psh-hud-arc--b {
    right: 13%;
    top: 52%;
    width: 460px;
    height: 240px;
    border-right: none;
    border-top: none;
    transform: rotate(-16deg);
    opacity: 0.42;
  }

  .psh-hud-arc--c {
    right: 22%;
    top: 16%;
    width: 220px;
    height: 120px;
    border-right: none;
    border-bottom: none;
    transform: rotate(-14deg);
    opacity: 0.35;
  }

  .psh-planet-glow {
    position: absolute;
    right: 4%;
    top: 50%;
    width: min(54vw, 820px);
    height: min(54vw, 820px);
    transform: translateY(-50%);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(168,85,247,0.48) 0%, rgba(168,85,247,0.18) 32%, transparent 68%);
    filter: blur(60px);
  }

  .psh-planet-wrap {
    position: absolute;
    right: -6%;
    top: 50%;
    transform: translateY(-50%);
    width: clamp(430px, 46vw, 760px);
    height: clamp(430px, 46vw, 760px);
  }

  .psh-planet {
    position: absolute;
    left: 22%;
    top: 19%;
    width: 58%;
    height: 58%;
    border-radius: 50%;
    overflow: hidden;
    background:
      radial-gradient(circle at 34% 28%, rgba(255,255,255,0.16) 0%, transparent 18%),
      radial-gradient(circle at 32% 24%, #EC4899 0%, #A855F7 42%, #7C3AED 100%);
  }

  .psh-planet-highlight {
    position: absolute;
    top: 8%;
    left: 10%;
    width: 34%;
    height: 24%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.32) 0%, transparent 74%);
    filter: blur(10px);
  }

  .psh-planet-rim {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    box-shadow:
      inset 22px 0 50px rgba(255,255,255,0.08),
      inset -34px -26px 72px rgba(18, 5, 40, 0.52);
  }

  .psh-planet-texture {
    position: absolute;
    inset: -6%;
    border-radius: 50%;
    background:
      radial-gradient(circle at 22% 22%, rgba(255,255,255,0.14) 0%, transparent 24%),
      radial-gradient(circle at 64% 18%, rgba(255,255,255,0.07) 0%, transparent 18%),
      radial-gradient(circle at 66% 54%, rgba(111, 53, 214, 0.28) 0%, transparent 22%),
      radial-gradient(circle at 44% 72%, rgba(66, 31, 142, 0.24) 0%, transparent 28%),
      conic-gradient(from 20deg, transparent 0%, rgba(255,255,255,0.04) 20%, transparent 38%, rgba(34,211,238,0.08) 58%, transparent 78%, rgba(255,255,255,0.03) 100%);
    animation: pshPlanetTexture 24s linear infinite;
  }

  .psh-planet-specks {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 62% 48%, rgba(255,255,255,0.9) 0 1px, transparent 2px),
      radial-gradient(circle at 56% 56%, rgba(255,255,255,0.72) 0 1px, transparent 2px),
      radial-gradient(circle at 68% 58%, rgba(255,255,255,0.84) 0 1px, transparent 2px),
      radial-gradient(circle at 74% 52%, rgba(255,255,255,0.78) 0 1px, transparent 2px),
      radial-gradient(circle at 60% 62%, rgba(216,180,254,0.94) 0 1.4px, transparent 2.4px),
      radial-gradient(circle at 71% 46%, rgba(103,232,249,0.9) 0 1px, transparent 2px);
    opacity: 0.86;
  }

  .psh-orbit-layer {
    position: absolute;
    inset: 0;
    overflow: visible;
  }

  .psh-orbit-layer--back {
    animation: pshOrbitMain 20s linear infinite;
  }

  .psh-orbit-layer--front {
    animation: pshOrbitMain 20s linear infinite;
  }

  .psh-back-ring,
  .psh-front-ring {
    fill: none;
    transform-origin: center;
  }

  .psh-back-ring--main,
  .psh-front-ring--main {
    stroke: url(#psh-main-ring);
    stroke-width: 8;
  }

  .psh-back-ring--accent,
  .psh-front-ring--accent {
    stroke: url(#psh-accent-ring);
    stroke-width: 4;
  }

  .psh-back-ring--subtle,
  .psh-front-ring--subtle {
    stroke: #22D3EE;
    stroke-width: 2;
  }

  .psh-back-ring {
    transform: rotate(16deg);
  }

  .psh-front-ring {
    transform: rotate(16deg);
  }

  .psh-back-ring--accent,
  .psh-front-ring--accent {
    transform: rotate(42deg);
  }

  .psh-back-ring--subtle,
  .psh-front-ring--subtle {
    transform: rotate(-24deg);
  }

  .psh-front-ring--main,
  .psh-front-ring--accent,
  .psh-front-ring--subtle {
    clip-path: inset(49% 0 0 0);
  }

  .psh-back-ring--main,
  .psh-back-ring--accent,
  .psh-back-ring--subtle {
    opacity: 0.7;
  }

  .psh-particle {
    position: absolute;
    border-radius: 50%;
    opacity: var(--particle-min, 0.7);
    animation: pshParticleFloat 8s ease-in-out infinite;
  }

  .psh-particle--blink {
    animation: pshParticleFloat 8s ease-in-out infinite, pshParticleBlink 4s ease-in-out infinite;
  }

  .psh-ring-spark {
    position: absolute;
    border-radius: 50%;
  }

  .psh-ring-spark--a {
    left: 70%;
    top: 48%;
    width: 10px;
    height: 10px;
    background: #22D3EE;
    box-shadow: 0 0 20px #22D3EE;
  }

  .psh-ring-spark--b {
    left: 31%;
    top: 66%;
    width: 8px;
    height: 8px;
    background: #A855F7;
    box-shadow: 0 0 18px #A855F7;
  }

  .psh-ring-spark--c {
    left: 79%;
    top: 78%;
    width: 7px;
    height: 7px;
    background: #EC4899;
    box-shadow: 0 0 18px #EC4899;
  }

  .psh-ring-spark--d {
    left: 53%;
    top: 22%;
    width: 12px;
    height: 12px;
    background: rgba(236,72,153,0.9);
    box-shadow: 0 0 22px rgba(236,72,153,0.9);
  }

  @keyframes pshOrbitMain {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pshPlanetTexture {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pshParticleFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(calc(-1 * var(--particle-drift, 20px))); }
  }

  @keyframes pshParticleBlink {
    0%, 100% { opacity: var(--particle-min, 0.7); }
    50% { opacity: var(--particle-max, 0.88); }
  }

  @keyframes pshStarTwinkle {
    0%, 100% { opacity: var(--star-min, 0.2); transform: scale(0.9); }
    50% { opacity: var(--star-max, 0.4); transform: scale(1.2); }
  }

  @keyframes pshTechPulse {
    0%, 100% { opacity: var(--line-min, 0.24); }
    50% { opacity: var(--line-max, 0.42); }
  }

  @keyframes pshNebulaDrift {
    from { transform: translateY(-50%) translateX(0px) scale(1); }
    to { transform: translateY(-50%) translateX(-34px) scale(1.05); }
  }

  @media (max-width: 1023px) {
    .psh-shell--planet {
      display: none;
    }

    .psh-nebula {
      right: -28%;
      width: 980px;
      height: 980px;
      filter: blur(180px);
    }

    .psh-grid-field {
      background-size: 54px 54px;
      opacity: 0.45;
    }

    .psh-tech-stroke:nth-child(n + 7),
    .psh-hud-arc--c {
      display: none;
    }
  }

  @media (max-width: 640px) {
    .psh-nebula {
      right: -44%;
      width: 760px;
      height: 760px;
      filter: blur(150px);
    }

    .psh-tech-stroke:nth-child(n + 5),
    .psh-hud-arcs {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .psh-nebula,
    .psh-star,
    .psh-tech-stroke,
    .psh-orbit-layer,
    .psh-particle,
    .psh-planet-texture {
      animation: none !important;
    }
  }
`;
