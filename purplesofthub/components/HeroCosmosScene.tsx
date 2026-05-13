'use client'

import { useMemo } from "react";
import type { CSSProperties } from "react";
import { useTheme } from "@/context/ThemeContext";

type HeroCosmosSceneProps = {
  variant?: "planet" | "backdrop";
};

type StarConfig = {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
};

type ParticleConfig = {
  left: number;
  top: number;
  size: number;
  color: "violet" | "cyan" | "pink";
  duration: number;
  delay: number;
  drift: number;
};

type OrbitDotConfig = {
  angle: number;
  radius: number;
  size: number;
  color: "violet" | "cyan";
  opacity: number;
};

const ACCENT = {
  violet: "#a855f7",
  cyan: "#22d3ee",
  pink: "#ec4899",
} as const;

const STARS: StarConfig[] = Array.from({ length: 68 }, (_, index) => ({
  left: (index * 17 + 8) % 100,
  top: (index * 29 + 11) % 100,
  size: index % 13 === 0 ? 2.4 : index % 7 === 0 ? 1.7 : 1,
  duration: 3.6 + (index % 8) * 0.52,
  delay: (index % 11) * 0.26,
  opacity: 0.18 + (index % 6) * 0.075,
}));

const BACKDROP_PARTICLES: ParticleConfig[] = [
  { left: 78, top: 14, size: 3, color: "cyan", duration: 8.2, delay: 0.4, drift: 18 },
  { left: 92, top: 26, size: 4, color: "violet", duration: 9.2, delay: 1.1, drift: 20 },
  { left: 58, top: 44, size: 3, color: "pink", duration: 7.8, delay: 1.8, drift: 14 },
  { left: 70, top: 68, size: 5, color: "cyan", duration: 10.4, delay: 0.9, drift: 22 },
  { left: 36, top: 28, size: 3, color: "violet", duration: 8.8, delay: 2.2, drift: 16 },
  { left: 22, top: 62, size: 4, color: "pink", duration: 9.8, delay: 1.6, drift: 16 },
];

const PLANET_PARTICLES: ParticleConfig[] = [
  { left: 34, top: 38, size: 3, color: "cyan", duration: 8.4, delay: 0.3, drift: 12 },
  { left: 40, top: 58, size: 4, color: "pink", duration: 9.6, delay: 1.4, drift: 15 },
  { left: 58, top: 32, size: 5, color: "cyan", duration: 8.8, delay: 2.1, drift: 18 },
  { left: 65, top: 61, size: 3, color: "violet", duration: 7.8, delay: 0.7, drift: 13 },
  { left: 74, top: 45, size: 4, color: "cyan", duration: 9.4, delay: 1.9, drift: 17 },
  { left: 83, top: 59, size: 3, color: "pink", duration: 8.2, delay: 2.5, drift: 14 },
];

const ORBIT_DOTS_BACK: OrbitDotConfig[] = Array.from({ length: 20 }, (_, index) => ({
  angle: index * 18 + 4,
  radius: 250 + (index % 4) * 8,
  size: index % 5 === 0 ? 5 : 3,
  color: index % 2 === 0 ? "cyan" : "violet",
  opacity: 0.28 + (index % 5) * 0.05,
}));

const ORBIT_DOTS_FRONT: OrbitDotConfig[] = Array.from({ length: 16 }, (_, index) => ({
  angle: index * 22.5 + 12,
  radius: 232 + (index % 3) * 7,
  size: index % 4 === 0 ? 5 : 3.5,
  color: index % 2 === 0 ? "violet" : "cyan",
  opacity: 0.34 + (index % 4) * 0.06,
}));

const CIRCUIT_SEGMENTS = [
  "psh-cosmos-circuit--one",
  "psh-cosmos-circuit--two",
  "psh-cosmos-circuit--three",
  "psh-cosmos-circuit--four",
];

function twinkleOpacity(value: number, isDark: boolean) {
  return isDark ? value : Math.max(0.08, value * 0.52);
}

export default function HeroCosmosScene({ variant = "planet" }: HeroCosmosSceneProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const stars = useMemo(() => (isDark ? STARS : STARS.slice(0, 46)), [isDark]);

  if (variant === "backdrop") {
    return (
      <div className="psh-cosmos psh-cosmos--backdrop" data-theme={theme} aria-hidden="true">
        <div className="psh-cosmos-grid" />
        <div className="psh-cosmos-vignette" />
        <div className="psh-cosmos-nebula psh-cosmos-nebula--cyan" />
        <div className="psh-cosmos-nebula psh-cosmos-nebula--violet" />
        <div className="psh-cosmos-nebula psh-cosmos-nebula--magenta" />

        {CIRCUIT_SEGMENTS.map((segment) => (
          <span key={segment} className={`psh-cosmos-circuit ${segment}`} />
        ))}

        {stars.map((star, index) => (
          <span
            key={index}
            className="psh-cosmos-star"
            style={
              {
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                ["--star-min" as string]: twinkleOpacity(star.opacity, isDark),
                ["--star-max" as string]: Math.min(1, twinkleOpacity(star.opacity + 0.3, isDark)),
                animationDuration: `${star.duration}s`,
                animationDelay: `${star.delay}s`,
              } as CSSProperties
            }
          />
        ))}

        {BACKDROP_PARTICLES.map((particle, index) => (
          <span
            key={index}
            className="psh-cosmos-particle"
            style={
              {
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                color: ACCENT[particle.color],
                background: ACCENT[particle.color],
                ["--particle-drift" as string]: `${particle.drift}px`,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`,
              } as CSSProperties
            }
          />
        ))}

        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="psh-cosmos psh-cosmos--planet" data-theme={theme} aria-hidden="true">
      <div className="psh-planet-scene">
        <div className="psh-planet-scene__aura" />
        <div className="psh-planet-scene__scan psh-planet-scene__scan--top" />
        <div className="psh-planet-scene__scan psh-planet-scene__scan--bottom" />

        <div className="psh-planet-orbit psh-planet-orbit--wide" />
        <div className="psh-planet-orbit psh-planet-orbit--back" />
        <div className="psh-planet-dots psh-planet-dots--back">
          {ORBIT_DOTS_BACK.map((dot, index) => (
            <span
              key={index}
              className="psh-planet-dot"
              style={
                {
                  ["--dot-angle" as string]: `${dot.angle}deg`,
                  ["--dot-radius" as string]: `${dot.radius}px`,
                  ["--dot-scale" as string]: `${dot.size / 4}`,
                  ["--dot-opacity" as string]: isDark ? dot.opacity : dot.opacity * 0.7,
                  color: ACCENT[dot.color],
                  animationDelay: `${index * 0.13}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="psh-planet">
          <span className="psh-planet__rim" />
          <span className="psh-planet__shine" />
          <span className="psh-planet__storm psh-planet__storm--one" />
          <span className="psh-planet__storm psh-planet__storm--two" />
          <span className="psh-planet__texture psh-planet__texture--one" />
          <span className="psh-planet__texture psh-planet__texture--two" />
          <span className="psh-planet__shadow" />
        </div>

        <div className="psh-planet-orbit psh-planet-orbit--front" />
        <div className="psh-planet-orbit psh-planet-orbit--foreground" />
        <div className="psh-planet-dots psh-planet-dots--front">
          {ORBIT_DOTS_FRONT.map((dot, index) => (
            <span
              key={index}
              className="psh-planet-dot"
              style={
                {
                  ["--dot-angle" as string]: `${dot.angle}deg`,
                  ["--dot-radius" as string]: `${dot.radius}px`,
                  ["--dot-scale" as string]: `${dot.size / 4}`,
                  ["--dot-opacity" as string]: isDark ? dot.opacity : dot.opacity * 0.72,
                  color: ACCENT[dot.color],
                  animationDelay: `${index * 0.15}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        {PLANET_PARTICLES.map((particle, index) => (
          <span
            key={index}
            className="psh-planet-particle"
            style={
              {
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                color: ACCENT[particle.color],
                background: ACCENT[particle.color],
                ["--particle-drift" as string]: `${particle.drift}px`,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .psh-cosmos {
    pointer-events: none;
    --cosmos-bg: linear-gradient(180deg, #05020d 0%, #070416 48%, #030108 100%);
    --cosmos-texture: rgba(168, 85, 247, 0.09);
    --cosmos-grid-a: rgba(168, 85, 247, 0.13);
    --cosmos-grid-b: rgba(34, 211, 238, 0.08);
    --cosmos-circuit: rgba(103, 232, 249, 0.18);
    --cosmos-circuit-soft: rgba(192, 132, 252, 0.16);
    --cosmos-star: rgba(255, 255, 255, 0.92);
    --cosmos-nebula-cyan: radial-gradient(circle, rgba(34, 211, 238, 0.28) 0%, rgba(34, 211, 238, 0.1) 26%, transparent 70%);
    --cosmos-nebula-violet: radial-gradient(circle, rgba(124, 58, 237, 0.24) 0%, rgba(124, 58, 237, 0.08) 34%, transparent 72%);
    --cosmos-nebula-magenta: radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%);
    --planet-base: radial-gradient(circle at 27% 18%, #f5d7ff 0%, #d58aff 10%, #9b4dff 27%, #4c168f 56%, #15072d 78%, #05020c 100%);
    --planet-rim: radial-gradient(circle at 72% 33%, rgba(34, 211, 238, 0.48), transparent 38%);
    --planet-shadow: 0 0 90px rgba(168, 85, 247, 0.5), 0 0 170px rgba(34, 211, 238, 0.28), inset -76px -66px 104px rgba(2, 1, 9, 0.9), inset 18px 18px 36px rgba(255, 255, 255, 0.16);
    --ring-core: rgba(103, 232, 249, 0.72);
    --ring-violet: rgba(192, 132, 252, 0.66);
    --ring-faint: rgba(255, 255, 255, 0.14);
    --ring-shadow: 0 0 28px rgba(34, 211, 238, 0.22), 0 0 46px rgba(168, 85, 247, 0.16);
  }

  .psh-cosmos[data-theme="light"] {
    --cosmos-bg: linear-gradient(180deg, #fbf8ff 0%, #f1eaff 50%, #e8dcfb 100%);
    --cosmos-texture: rgba(124, 58, 237, 0.06);
    --cosmos-grid-a: rgba(109, 40, 217, 0.08);
    --cosmos-grid-b: rgba(14, 165, 233, 0.05);
    --cosmos-circuit: rgba(14, 116, 144, 0.15);
    --cosmos-circuit-soft: rgba(124, 58, 237, 0.14);
    --cosmos-star: rgba(83, 52, 128, 0.64);
    --cosmos-nebula-cyan: radial-gradient(circle, rgba(34, 211, 238, 0.18) 0%, rgba(34, 211, 238, 0.07) 28%, transparent 70%);
    --cosmos-nebula-violet: radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.07) 36%, transparent 72%);
    --cosmos-nebula-magenta: radial-gradient(circle, rgba(236, 72, 153, 0.13) 0%, transparent 70%);
    --planet-base: radial-gradient(circle at 27% 18%, #fff3ff 0%, #e1adff 11%, #9f58ff 30%, #5e24aa 58%, #1d0d38 79%, #070213 100%);
    --planet-rim: radial-gradient(circle at 72% 33%, rgba(34, 211, 238, 0.36), transparent 38%);
    --planet-shadow: 0 0 70px rgba(124, 58, 237, 0.24), 0 0 138px rgba(34, 211, 238, 0.16), inset -68px -60px 94px rgba(7, 3, 18, 0.78), inset 18px 18px 34px rgba(255, 255, 255, 0.18);
    --ring-core: rgba(8, 145, 178, 0.52);
    --ring-violet: rgba(124, 58, 237, 0.48);
    --ring-faint: rgba(76, 29, 149, 0.12);
    --ring-shadow: 0 0 22px rgba(34, 211, 238, 0.16), 0 0 34px rgba(124, 58, 237, 0.12);
  }

  .psh-cosmos--backdrop {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: var(--cosmos-bg);
  }

  .psh-cosmos-grid,
  .psh-cosmos-vignette,
  .psh-cosmos-nebula,
  .psh-cosmos-circuit,
  .psh-cosmos-star,
  .psh-cosmos-particle {
    position: absolute;
  }

  .psh-cosmos-grid {
    inset: 0;
    background-image:
      linear-gradient(var(--cosmos-grid-a) 1px, transparent 1px),
      linear-gradient(90deg, var(--cosmos-grid-a) 1px, transparent 1px),
      linear-gradient(var(--cosmos-grid-b) 1px, transparent 1px),
      linear-gradient(90deg, var(--cosmos-grid-b) 1px, transparent 1px);
    background-size: 64px 64px, 64px 64px, 128px 128px, 128px 128px;
    opacity: 0.74;
    mask-image: radial-gradient(circle at 72% 42%, #000 0%, rgba(0, 0, 0, 0.8) 48%, transparent 96%);
  }

  .psh-cosmos-grid::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(115deg, transparent 0 18%, var(--cosmos-texture) 18.2% 18.6%, transparent 18.8% 100%),
      linear-gradient(155deg, transparent 0 44%, var(--cosmos-texture) 44.2% 44.5%, transparent 44.7% 100%);
  }

  .psh-cosmos-vignette {
    inset: 0;
    background:
      radial-gradient(circle at 74% 42%, transparent 0%, rgba(3, 1, 10, 0.04) 48%, rgba(3, 1, 10, 0.44) 100%),
      linear-gradient(90deg, rgba(3, 1, 10, 0.34) 0%, transparent 42%, rgba(3, 1, 10, 0.08) 100%);
  }

  .psh-cosmos[data-theme="light"] .psh-cosmos-vignette {
    background:
      radial-gradient(circle at 74% 42%, transparent 0%, rgba(255, 255, 255, 0.04) 48%, rgba(233, 221, 251, 0.26) 100%),
      linear-gradient(90deg, rgba(255, 255, 255, 0.28) 0%, transparent 44%, rgba(255, 255, 255, 0.14) 100%);
  }

  .psh-cosmos-nebula {
    border-radius: 999px;
    filter: blur(72px);
    animation: pshNebulaDrift 18s ease-in-out infinite alternate;
  }

  .psh-cosmos-nebula--cyan {
    top: -6%;
    right: 7%;
    width: min(48vw, 620px);
    height: min(34vw, 430px);
    background: var(--cosmos-nebula-cyan);
  }

  .psh-cosmos-nebula--violet {
    top: 26%;
    left: 38%;
    width: min(34vw, 460px);
    height: min(28vw, 360px);
    background: var(--cosmos-nebula-violet);
    animation-delay: 2.4s;
  }

  .psh-cosmos-nebula--magenta {
    bottom: -8%;
    left: 12%;
    width: min(36vw, 480px);
    height: min(28vw, 360px);
    background: var(--cosmos-nebula-magenta);
    animation-delay: 4.8s;
  }

  .psh-cosmos-circuit {
    width: 260px;
    height: 120px;
    opacity: 0.72;
    background:
      linear-gradient(90deg, transparent 0 12%, var(--cosmos-circuit) 12% 13%, transparent 13% 100%),
      linear-gradient(180deg, transparent 0 44%, var(--cosmos-circuit-soft) 44% 45%, transparent 45% 100%);
  }

  .psh-cosmos-circuit::before,
  .psh-cosmos-circuit::after {
    content: "";
    position: absolute;
    border: 1px solid var(--cosmos-circuit);
    border-left: 0;
    border-bottom: 0;
  }

  .psh-cosmos-circuit::before {
    right: 18px;
    top: 18px;
    width: 96px;
    height: 54px;
  }

  .psh-cosmos-circuit::after {
    right: 112px;
    top: 70px;
    width: 42px;
    height: 28px;
    border-radius: 0 10px 0 0;
  }

  .psh-cosmos-circuit--one {
    top: 9%;
    left: 2%;
  }

  .psh-cosmos-circuit--two {
    right: 2%;
    top: 20%;
    transform: rotate(8deg);
  }

  .psh-cosmos-circuit--three {
    right: 8%;
    bottom: 10%;
    transform: rotate(-12deg) scale(1.2);
  }

  .psh-cosmos-circuit--four {
    left: 4%;
    bottom: 12%;
    transform: rotate(180deg) scale(1.1);
  }

  .psh-cosmos-star {
    border-radius: 999px;
    background: var(--cosmos-star);
    box-shadow: 0 0 12px currentColor;
    opacity: var(--star-min);
    animation: pshStarTwinkle ease-in-out infinite;
  }

  .psh-cosmos-particle,
  .psh-planet-particle {
    border-radius: 999px;
    box-shadow: 0 0 14px currentColor, 0 0 28px currentColor;
    animation: pshParticleDrift ease-in-out infinite;
  }

  .psh-cosmos--planet {
    position: relative;
    width: min(55vw, 720px);
    max-width: 100%;
    aspect-ratio: 1.38 / 1;
    overflow: visible;
  }

  .psh-planet-scene {
    position: absolute;
    inset: 0;
    overflow: visible;
    perspective: 1300px;
    perspective-origin: 64% 50%;
    transform: translateZ(0);
  }

  .psh-planet-scene__aura,
  .psh-planet-scene__scan,
  .psh-planet-orbit,
  .psh-planet-dots,
  .psh-planet,
  .psh-planet-particle {
    position: absolute;
  }

  .psh-planet-scene__aura {
    right: 0%;
    top: 50%;
    width: 78%;
    aspect-ratio: 1;
    transform: translateY(-50%);
    border-radius: 999px;
    background:
      radial-gradient(circle, rgba(34, 211, 238, 0.34) 0%, transparent 54%),
      radial-gradient(circle, rgba(168, 85, 247, 0.48) 0%, transparent 66%);
    filter: blur(54px);
    opacity: 0.86;
    animation: pshAuraPulse 7s ease-in-out infinite alternate;
  }

  .psh-cosmos[data-theme="light"] .psh-planet-scene__aura {
    opacity: 0.58;
  }

  .psh-planet-scene__scan {
    right: 0%;
    width: 40%;
    height: 18%;
    border-top: 1px solid var(--cosmos-circuit);
    border-right: 1px solid var(--cosmos-circuit);
    opacity: 0.54;
  }

  .psh-planet-scene__scan--top {
    top: 16%;
    transform: skewX(16deg);
  }

  .psh-planet-scene__scan--bottom {
    bottom: 12%;
    transform: skewX(-18deg);
  }

  .psh-planet {
    right: 6%;
    top: 50%;
    width: min(29vw, 360px);
    aspect-ratio: 1;
    transform: translateY(-50%);
    overflow: hidden;
    z-index: 5;
    border-radius: 50%;
    background: var(--planet-base);
    box-shadow: var(--planet-shadow);
    animation: pshPlanetFloat 7.5s ease-in-out infinite;
  }

  .psh-planet::before,
  .psh-planet::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
  }

  .psh-planet::before {
    background:
      radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.22) 0%, transparent 18%),
      radial-gradient(circle at 46% 38%, rgba(236, 72, 153, 0.28) 0%, transparent 16%),
      radial-gradient(circle at 30% 64%, rgba(124, 58, 237, 0.34) 0%, transparent 20%),
      radial-gradient(circle at 64% 58%, rgba(34, 211, 238, 0.18) 0%, transparent 20%),
      conic-gradient(from 124deg, transparent 0 18%, rgba(255, 255, 255, 0.1) 20%, transparent 34%, rgba(34, 211, 238, 0.09) 48%, transparent 65%, rgba(236, 72, 153, 0.08) 78%, transparent 100%);
    filter: blur(3px);
    opacity: 0.9;
  }

  .psh-planet::after {
    background:
      radial-gradient(circle at 88% 38%, rgba(34, 211, 238, 0.38) 0%, transparent 32%),
      radial-gradient(circle at 72% 76%, rgba(2, 1, 10, 0.9) 0%, transparent 42%),
      linear-gradient(142deg, transparent 0 44%, rgba(2, 1, 10, 0.56) 76%, rgba(1, 1, 8, 0.92) 100%);
    mix-blend-mode: multiply;
  }

  .psh-planet__rim,
  .psh-planet__shine,
  .psh-planet__storm,
  .psh-planet__texture,
  .psh-planet__shadow {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
  }

  .psh-planet__rim {
    background: var(--planet-rim);
    box-shadow: inset -12px 0 24px rgba(34, 211, 238, 0.42), inset 8px -10px 30px rgba(168, 85, 247, 0.22);
    mix-blend-mode: screen;
    opacity: 0.78;
  }

  .psh-planet__shine {
    background:
      radial-gradient(circle at 26% 17%, rgba(255, 255, 255, 0.42) 0%, transparent 18%),
      radial-gradient(circle at 38% 28%, rgba(255, 255, 255, 0.16) 0%, transparent 20%);
    filter: blur(1px);
  }

  .psh-planet__storm--one {
    inset: 10% 6% 34% 8%;
    background:
      radial-gradient(ellipse at 28% 52%, rgba(226, 170, 255, 0.28) 0%, transparent 32%),
      radial-gradient(ellipse at 62% 48%, rgba(34, 211, 238, 0.12) 0%, transparent 30%);
    filter: blur(10px);
    transform: rotate(-14deg);
    mix-blend-mode: screen;
  }

  .psh-planet__storm--two {
    inset: 42% 2% 8% 12%;
    background:
      radial-gradient(ellipse at 48% 42%, rgba(124, 58, 237, 0.34) 0%, transparent 40%),
      radial-gradient(ellipse at 72% 62%, rgba(0, 0, 0, 0.55) 0%, transparent 30%);
    filter: blur(13px);
    transform: rotate(18deg);
  }

  .psh-planet__texture--one {
    background:
      radial-gradient(circle at 18% 34%, rgba(255, 255, 255, 0.1) 0 2%, transparent 10%),
      radial-gradient(circle at 42% 22%, rgba(236, 72, 153, 0.22) 0 2%, transparent 12%),
      radial-gradient(circle at 55% 44%, rgba(168, 85, 247, 0.26) 0 3%, transparent 17%),
      radial-gradient(circle at 66% 72%, rgba(34, 211, 238, 0.16) 0 2%, transparent 12%);
    filter: blur(7px);
    opacity: 0.86;
  }

  .psh-planet__texture--two {
    inset: -6%;
    background:
      linear-gradient(18deg, transparent 0 30%, rgba(255, 255, 255, 0.08) 32%, transparent 38%),
      linear-gradient(-24deg, transparent 0 56%, rgba(34, 211, 238, 0.1) 58%, transparent 64%);
    filter: blur(8px);
    opacity: 0.7;
    animation: pshSurfaceShift 24s linear infinite;
  }

  .psh-planet__shadow {
    background: radial-gradient(circle at 54% 88%, rgba(1, 1, 7, 0.9) 0%, transparent 42%);
  }

  .psh-planet-orbit {
    left: 63%;
    top: 51%;
    border-radius: 999px;
    z-index: 2;
    transform-style: preserve-3d;
    transform-origin: 50% 50%;
    mix-blend-mode: screen;
  }

  .psh-planet-orbit::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: var(--ring-width, 2px);
    background: linear-gradient(90deg, transparent 0%, var(--ring-violet) 20%, var(--ring-core) 48%, var(--ring-violet) 72%, transparent 100%);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    box-shadow: var(--ring-shadow);
  }

  .psh-planet-orbit--wide {
    width: min(74vw, 700px);
    height: min(25vw, 220px);
    transform: translate(-50%, -50%) rotateX(73deg) rotateZ(-18deg);
    opacity: 0.46;
    --ring-width: 1px;
  }

  .psh-planet-orbit--back {
    width: min(70vw, 640px);
    height: min(23vw, 190px);
    transform: translate(-50%, -50%) rotateX(73deg) rotateZ(-18deg);
    opacity: 0.84;
    --ring-width: 3px;
  }

  .psh-planet-orbit--front {
    width: min(66vw, 600px);
    height: min(21vw, 172px);
    transform: translate(-50%, -50%) rotateX(73deg) rotateZ(18deg);
    z-index: 7;
    opacity: 0.9;
    clip-path: polygon(0 44%, 100% 34%, 100% 74%, 0 88%);
    --ring-width: 4px;
  }

  .psh-planet-orbit--foreground {
    width: min(60vw, 545px);
    height: min(19vw, 152px);
    transform: translate(-50%, -50%) rotateX(73deg) rotateZ(18deg);
    z-index: 8;
    opacity: 0.7;
    clip-path: polygon(6% 50%, 96% 40%, 95% 72%, 8% 82%);
    --ring-width: 1px;
  }

  .psh-planet-dots {
    left: 63%;
    top: 51%;
    width: 0;
    height: 0;
    transform: translate(-50%, -50%) rotateX(73deg) rotateZ(-18deg);
  }

  .psh-planet-dots--back {
    z-index: 3;
    animation: pshOrbitShimmer 30s linear infinite;
  }

  .psh-planet-dots--front {
    z-index: 9;
    animation: pshOrbitShimmer 36s linear infinite reverse;
    clip-path: polygon(-340px 12px, 440px -80px, 450px 180px, -340px 260px);
  }

  .psh-planet-dot {
    position: absolute;
    left: 0;
    top: 0;
    width: 5px;
    height: 5px;
    border-radius: 999px;
    background: currentColor;
    opacity: var(--dot-opacity);
    box-shadow: 0 0 12px currentColor, 0 0 26px currentColor;
    transform: rotate(var(--dot-angle)) translateX(var(--dot-radius)) translateY(-50%) scale(var(--dot-scale));
    transform-origin: 0 0;
    animation: pshDotPulse 4.8s ease-in-out infinite;
  }

  .psh-planet-particle {
    z-index: 10;
    opacity: 0.72;
  }

  @keyframes pshStarTwinkle {
    0%, 100% { opacity: var(--star-min); transform: scale(0.88); }
    48% { opacity: var(--star-max); transform: scale(1.28); }
  }

  @keyframes pshNebulaDrift {
    from { transform: translate3d(0, 0, 0) scale(1); }
    to { transform: translate3d(-22px, 16px, 0) scale(1.06); }
  }

  @keyframes pshParticleDrift {
    0%, 100% { opacity: 0.48; transform: translate3d(0, 0, 0) scale(0.92); }
    48% { opacity: 1; transform: translate3d(10px, calc(-1 * var(--particle-drift)), 0) scale(1.16); }
  }

  @keyframes pshAuraPulse {
    from { transform: translateY(-50%) scale(0.96); opacity: 0.58; }
    to { transform: translateY(-50%) scale(1.05); opacity: 0.92; }
  }

  @keyframes pshPlanetFloat {
    0%, 100% { transform: translateY(-50%) translateY(0); }
    50% { transform: translateY(-50%) translateY(-12px); }
  }

  @keyframes pshSurfaceShift {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pshOrbitShimmer {
    from { transform: translate(-50%, -50%) rotateX(73deg) rotateZ(-18deg); }
    to { transform: translate(-50%, -50%) rotateX(73deg) rotateZ(342deg); }
  }

  @keyframes pshDotPulse {
    0%, 100% {
      opacity: var(--dot-opacity);
      transform: rotate(var(--dot-angle)) translateX(var(--dot-radius)) translateY(-50%) scale(calc(var(--dot-scale) * 0.88));
    }
    50% {
      opacity: calc(var(--dot-opacity) + 0.18);
      transform: rotate(var(--dot-angle)) translateX(var(--dot-radius)) translateY(-50%) scale(calc(var(--dot-scale) * 1.08));
    }
  }

  @media (max-width: 1023px) {
    .psh-cosmos-grid {
      background-size: 48px 48px, 48px 48px, 96px 96px, 96px 96px;
    }

    .psh-cosmos-circuit--two,
    .psh-cosmos-circuit--three {
      display: none;
    }

    .psh-cosmos--planet {
      width: min(100%, 560px);
      aspect-ratio: 1.2 / 1;
    }

    .psh-planet {
      right: 50%;
      width: min(64vw, 320px);
      transform: translate(50%, -50%);
    }

    .psh-planet-scene__aura {
      right: 50%;
      width: min(84vw, 410px);
      transform: translate(50%, -50%);
    }

    .psh-planet-orbit,
    .psh-planet-dots {
      left: 50%;
    }

    .psh-planet-orbit--wide,
    .psh-planet-orbit--back {
      width: min(102vw, 520px);
      height: min(32vw, 150px);
    }

    .psh-planet-orbit--front {
      width: min(94vw, 480px);
      height: min(30vw, 136px);
    }

    .psh-planet-orbit--foreground {
      width: min(84vw, 420px);
      height: min(26vw, 118px);
    }

    .psh-planet-scene__scan {
      display: none;
    }
  }

  @media (max-width: 520px) {
    .psh-cosmos--planet {
      aspect-ratio: 1 / 0.9;
    }

    .psh-planet {
      width: min(72vw, 280px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .psh-cosmos-nebula,
    .psh-cosmos-star,
    .psh-cosmos-particle,
    .psh-planet-scene__aura,
    .psh-planet,
    .psh-planet__texture--two,
    .psh-planet-dots,
    .psh-planet-dot,
    .psh-planet-particle {
      animation: none !important;
    }
  }
`;
