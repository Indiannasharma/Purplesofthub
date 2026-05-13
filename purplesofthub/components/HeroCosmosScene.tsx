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
  darkOpacity: number;
  lightOpacity: number;
};

type ParticleConfig = {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  accent: "purple" | "cyan" | "pink";
};

type OrbitDotConfig = {
  angle: number;
  radius: number;
  size: number;
  opacity: number;
  accent: "purple" | "cyan";
};

const STARS: StarConfig[] = Array.from({ length: 42 }, (_, index) => ({
  left: (index * 19) % 100,
  top: (index * 37) % 100,
  size: index % 7 === 0 ? 2 : 1,
  duration: 3.6 + (index % 6) * 0.7,
  delay: (index % 9) * 0.35,
  darkOpacity: 0.16 + (index % 5) * 0.045,
  lightOpacity: 0.1 + (index % 4) * 0.025,
}));

const PARTICLES: ParticleConfig[] = [
  { left: 18, top: 38, size: 4, duration: 8.6, delay: 0.2, drift: 16, accent: "purple" },
  { left: 26, top: 24, size: 5, duration: 9.8, delay: 1.4, drift: 20, accent: "cyan" },
  { left: 30, top: 64, size: 3, duration: 7.4, delay: 2.1, drift: 12, accent: "pink" },
  { left: 46, top: 30, size: 4, duration: 10.4, delay: 0.9, drift: 18, accent: "purple" },
  { left: 53, top: 58, size: 4, duration: 8.8, delay: 2.4, drift: 14, accent: "cyan" },
  { left: 68, top: 36, size: 3, duration: 7.2, delay: 1.2, drift: 10, accent: "pink" },
  { left: 74, top: 62, size: 5, duration: 9.2, delay: 1.8, drift: 18, accent: "cyan" },
];

const ORBIT_DOTS_BACK: OrbitDotConfig[] = Array.from({ length: 16 }, (_, index) => ({
  angle: (index / 16) * 360,
  radius: 252 + (index % 3) * 7,
  size: index % 4 === 0 ? 5 : 3,
  opacity: 0.3 + (index % 5) * 0.05,
  accent: index % 2 === 0 ? "cyan" : "purple",
}));

const ORBIT_DOTS_FRONT: OrbitDotConfig[] = Array.from({ length: 13 }, (_, index) => ({
  angle: (index / 13) * 360 + 16,
  radius: 224 + (index % 4) * 6,
  size: index % 3 === 0 ? 6 : 4,
  opacity: 0.4 + (index % 4) * 0.06,
  accent: index % 2 === 0 ? "purple" : "cyan",
}));

const ACCENTS = {
  purple: "#a855f7",
  cyan: "#22d3ee",
  pink: "#ec4899",
} as const;

function clampOpacity(value: number) {
  return Math.max(0, Math.min(1, value));
}

export default function HeroCosmosScene({
  variant = "planet",
}: HeroCosmosSceneProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const stars = useMemo(() => (isDark ? STARS : STARS.slice(0, 28)), [isDark]);

  if (variant === "backdrop") {
    return (
      <div className="hero-cosmos hero-cosmos--backdrop" data-theme={theme} aria-hidden="true">
        <div className="hero-cosmos-grid" />
        <div className="hero-cosmos-nebula hero-cosmos-nebula--a" style={{ opacity: 0.72 }} />
        <div className="hero-cosmos-nebula hero-cosmos-nebula--b" style={{ opacity: 0.58 }} />
        <div className="hero-cosmos-nebula hero-cosmos-nebula--c" style={{ opacity: 0.46 }} />

        {stars.map((star, index) => (
          <span
            key={index}
            className="hero-cosmos-star"
            style={
              {
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                background: isDark ? "#ffffff" : "#74618e",
                ["--star-min" as string]: isDark ? star.darkOpacity : star.lightOpacity * 0.9,
                ["--star-max" as string]: isDark
                  ? clampOpacity(star.darkOpacity + 0.22)
                  : clampOpacity(star.lightOpacity + 0.09),
                animationDuration: `${star.duration}s`,
                animationDelay: `${star.delay}s`,
              } as CSSProperties
            }
          />
        ))}

        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="hero-cosmos hero-cosmos--planet" data-theme={theme} aria-hidden="true">
      <div className="hero-planet-scene">
        <div className="hero-planet-scene__grid" />
        <div className="hero-planet-scene__nebula hero-planet-scene__nebula--a" />
        <div className="hero-planet-scene__nebula hero-planet-scene__nebula--b" />
        <div className="hero-planet-scene__nebula hero-planet-scene__nebula--c" />
        <div className="hero-planet-scene__halo" />

        <div className="hero-planet-scene__orbit hero-planet-scene__orbit--back" />
        <div className="hero-planet-scene__orbit hero-planet-scene__orbit--mid" />
        <div className="hero-planet-scene__orbit hero-planet-scene__orbit--front" />

        <div className="hero-planet-scene__orbit-dots hero-planet-scene__orbit-dots--back">
          {ORBIT_DOTS_BACK.map((dot, index) => (
            <span
              key={index}
              className="hero-planet-scene__orbit-dot"
              style={
                {
                  ["--dot-angle" as string]: `${dot.angle}deg`,
                  ["--dot-radius" as string]: `${dot.radius}px`,
                  ["--dot-opacity" as string]: isDark ? dot.opacity : dot.opacity * 0.72,
                  ["--dot-scale" as string]: `${dot.size / 4}`,
                  color: ACCENTS[dot.accent],
                  animationDelay: `${index * 0.16}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="hero-planet-scene__planet">
          <span className="hero-planet-scene__planet-shine" />
          <span className="hero-planet-scene__planet-shade" />
          <span className="hero-planet-scene__planet-core" />
          <span className="hero-planet-scene__planet-texture hero-planet-scene__planet-texture--a" />
          <span className="hero-planet-scene__planet-texture hero-planet-scene__planet-texture--b" />
          <span className="hero-planet-scene__planet-texture hero-planet-scene__planet-texture--c" />
        </div>

        <div className="hero-planet-scene__ring hero-planet-scene__ring--back" />
        <div className="hero-planet-scene__ring hero-planet-scene__ring--front" />

        <div className="hero-planet-scene__orbit-dots hero-planet-scene__orbit-dots--front">
          {ORBIT_DOTS_FRONT.map((dot, index) => (
            <span
              key={index}
              className="hero-planet-scene__orbit-dot"
              style={
                {
                  ["--dot-angle" as string]: `${dot.angle}deg`,
                  ["--dot-radius" as string]: `${dot.radius}px`,
                  ["--dot-opacity" as string]: isDark ? dot.opacity : dot.opacity * 0.72,
                  ["--dot-scale" as string]: `${dot.size / 4}`,
                  color: ACCENTS[dot.accent],
                  animationDelay: `${index * 0.18}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        {PARTICLES.map((particle, index) => {
          const color = ACCENTS[particle.accent];
          const opacity = isDark
            ? 0.72 + (index % 3) * 0.06
            : 0.44 + (index % 3) * 0.05;

          return (
            <span
              key={index}
              className="hero-planet-scene__particle"
              style={
                {
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  color,
                  background: color,
                  boxShadow: isDark
                    ? `0 0 ${particle.size * 4}px ${color}`
                    : `0 0 ${particle.size * 3}px ${color}88`,
                  ["--particle-min" as string]: opacity,
                  ["--particle-max" as string]: clampOpacity(opacity + (isDark ? 0.16 : 0.08)),
                  ["--particle-drift" as string]: `${particle.drift}px`,
                  animationDuration: `${particle.duration}s, ${3.4 + (index % 4) * 0.55}s`,
                  animationDelay: `${particle.delay}s, ${particle.delay / 2}s`,
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
    --hero-bg: linear-gradient(180deg, #05020c 0%, #06040f 48%, #040209 100%);
    --hero-grid-line-a: rgba(168, 85, 247, 0.08);
    --hero-grid-line-b: rgba(34, 211, 238, 0.05);
    --hero-grid-opacity: 0.32;
    --hero-grid-mask-mid: 0.68;
    --hero-halo-opacity: 1;
    --hero-nebula-a: radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, rgba(34, 211, 238, 0.08) 24%, rgba(34, 211, 238, 0) 70%);
    --hero-nebula-b: radial-gradient(circle, rgba(168, 85, 247, 0.16) 0%, rgba(168, 85, 247, 0) 66%);
    --hero-nebula-c: radial-gradient(circle, rgba(236, 72, 153, 0.16) 0%, rgba(236, 72, 153, 0) 72%);
    --hero-halo-a: radial-gradient(circle, rgba(34, 211, 238, 0.42) 0%, rgba(34, 211, 238, 0.2) 30%, transparent 66%);
    --hero-halo-b: radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(168, 85, 247, 0.18) 40%, transparent 74%);
    --hero-orbit-back-opacity: 0.72;
    --hero-orbit-mid-opacity: 0.94;
    --hero-orbit-front-opacity: 0.74;
    --hero-orbit-back: linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.28) 24%, rgba(34, 211, 238, 0.72) 50%, rgba(168, 85, 247, 0.28) 76%, transparent 100%);
    --hero-orbit-mid: linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.24) 22%, rgba(216, 180, 254, 0.68) 50%, rgba(34, 211, 238, 0.24) 78%, transparent 100%);
    --hero-orbit-front: linear-gradient(90deg, transparent 0%, rgba(216, 180, 254, 0.24) 20%, rgba(34, 211, 238, 0.56) 50%, rgba(216, 180, 254, 0.24) 80%, transparent 100%);
    --hero-ring-back-opacity: 0.72;
    --hero-ring-front-opacity: 0.74;
    --hero-ring-back: linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.18) 18%, rgba(34, 211, 238, 0.56) 50%, rgba(168, 85, 247, 0.18) 82%, transparent 100%);
    --hero-ring-front: linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.18) 20%, rgba(216, 180, 254, 0.52) 50%, rgba(34, 211, 238, 0.18) 80%, transparent 100%);
    --hero-ring-back-shadow: 0 0 30px rgba(34, 211, 238, 0.16), 0 0 18px rgba(168, 85, 247, 0.1);
    --hero-ring-front-shadow: 0 0 28px rgba(34, 211, 238, 0.16);
    --hero-planet-base: linear-gradient(135deg, #090311 0%, #22074e 26%, #6d28d9 52%, #b455ff 78%, #f4b3ff 100%);
    --hero-planet-shadow: 0 0 88px rgba(168, 85, 247, 0.44), 0 0 164px rgba(34, 211, 238, 0.26), inset -62px -58px 96px rgba(3, 2, 12, 0.84), inset 18px 18px 36px rgba(255, 255, 255, 0.12);
    --hero-planet-shine: radial-gradient(circle at 24% 18%, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0) 22%), radial-gradient(circle at 34% 28%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 18%);
    --hero-planet-shade: radial-gradient(circle at 72% 76%, rgba(2, 1, 10, 0.92) 0%, rgba(2, 1, 10, 0) 36%), radial-gradient(circle at 64% 62%, rgba(15, 8, 34, 0.42) 0%, rgba(15, 8, 34, 0) 24%), radial-gradient(circle at 60% 82%, rgba(6, 4, 18, 0.7) 0%, rgba(6, 4, 18, 0) 24%);
    --hero-planet-texture-a: radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 12%), radial-gradient(circle at 24% 42%, rgba(89, 27, 178, 0.42) 0%, rgba(89, 27, 178, 0) 18%), radial-gradient(circle at 42% 28%, rgba(236, 72, 153, 0.28) 0%, rgba(236, 72, 153, 0) 12%), radial-gradient(circle at 58% 74%, rgba(34, 211, 238, 0.24) 0%, rgba(34, 211, 238, 0) 14%), radial-gradient(circle at 76% 64%, rgba(4, 6, 18, 0.55) 0%, rgba(4, 6, 18, 0) 18%);
    --hero-planet-texture-b: radial-gradient(circle at 64% 30%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 10%), radial-gradient(circle at 70% 50%, rgba(168, 85, 247, 0.34) 0%, rgba(168, 85, 247, 0) 16%), radial-gradient(circle at 74% 68%, rgba(15, 8, 34, 0.3) 0%, rgba(15, 8, 34, 0) 18%), radial-gradient(circle at 58% 82%, rgba(34, 211, 238, 0.12) 0%, rgba(34, 211, 238, 0) 12%);
    --hero-planet-texture-c: radial-gradient(circle at 32% 66%, rgba(1, 1, 8, 0.62) 0%, rgba(1, 1, 8, 0) 18%), radial-gradient(circle at 48% 56%, rgba(123, 58, 237, 0.3) 0%, rgba(123, 58, 237, 0) 16%), radial-gradient(circle at 72% 82%, rgba(2, 2, 12, 0.76) 0%, rgba(2, 2, 12, 0) 22%), radial-gradient(circle at 70% 74%, rgba(34, 211, 238, 0.1) 0%, rgba(34, 211, 238, 0) 12%);
    --hero-star-glow: 0 0 10px rgba(255, 255, 255, 0.55);
    --hero-particle-glow: 0 0 16px rgba(34, 211, 238, 0.32);
  }

  .hero-cosmos[data-theme="light"] {
    --hero-bg: linear-gradient(180deg, #fbf8ff 0%, #f2ebff 48%, #e9ddfb 100%);
    --hero-grid-line-a: rgba(109, 40, 217, 0.06);
    --hero-grid-line-b: rgba(34, 211, 238, 0.035);
    --hero-grid-opacity: 0.18;
    --hero-grid-mask-mid: 0.46;
    --hero-halo-opacity: 0.78;
    --hero-nebula-a: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(191, 219, 254, 0.24) 26%, rgba(191, 219, 254, 0) 68%);
    --hero-nebula-b: radial-gradient(circle, rgba(168, 85, 247, 0.14) 0%, rgba(168, 85, 247, 0) 66%);
    --hero-nebula-c: radial-gradient(circle, rgba(34, 211, 238, 0.12) 0%, rgba(34, 211, 238, 0) 72%);
    --hero-halo-a: radial-gradient(circle, rgba(196, 181, 253, 0.46) 0%, rgba(196, 181, 253, 0.18) 32%, transparent 68%);
    --hero-halo-b: radial-gradient(circle, rgba(34, 211, 238, 0.24) 0%, rgba(34, 211, 238, 0.08) 42%, transparent 76%);
    --hero-orbit-back-opacity: 0.5;
    --hero-orbit-mid-opacity: 0.72;
    --hero-orbit-front-opacity: 0.56;
    --hero-orbit-back: linear-gradient(90deg, transparent 0%, rgba(124, 58, 237, 0.2) 24%, rgba(34, 211, 238, 0.34) 50%, rgba(124, 58, 237, 0.2) 76%, transparent 100%);
    --hero-orbit-mid: linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.14) 22%, rgba(196, 181, 253, 0.42) 50%, rgba(34, 211, 238, 0.14) 78%, transparent 100%);
    --hero-orbit-front: linear-gradient(90deg, transparent 0%, rgba(196, 181, 253, 0.16) 20%, rgba(34, 211, 238, 0.3) 50%, rgba(196, 181, 253, 0.16) 80%, transparent 100%);
    --hero-ring-back-opacity: 0.58;
    --hero-ring-front-opacity: 0.62;
    --hero-ring-back: linear-gradient(90deg, transparent 0%, rgba(124, 58, 237, 0.12) 18%, rgba(34, 211, 238, 0.34) 50%, rgba(124, 58, 237, 0.12) 82%, transparent 100%);
    --hero-ring-front: linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.12) 20%, rgba(196, 181, 253, 0.38) 50%, rgba(34, 211, 238, 0.12) 80%, transparent 100%);
    --hero-ring-back-shadow: 0 0 24px rgba(34, 211, 238, 0.14), 0 0 10px rgba(124, 58, 237, 0.08);
    --hero-ring-front-shadow: 0 0 22px rgba(34, 211, 238, 0.14);
    --hero-planet-base: linear-gradient(135deg, #130928 0%, #311161 26%, #7c3aed 52%, #b86cff 76%, #f0ccff 100%);
    --hero-planet-shadow: 0 0 72px rgba(124, 58, 237, 0.22), 0 0 122px rgba(34, 211, 238, 0.14), inset -56px -52px 92px rgba(11, 7, 24, 0.7), inset 18px 18px 32px rgba(255, 255, 255, 0.16);
    --hero-planet-shine: radial-gradient(circle at 24% 18%, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0) 22%), radial-gradient(circle at 34% 28%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 18%);
    --hero-planet-shade: radial-gradient(circle at 72% 76%, rgba(9, 5, 20, 0.84) 0%, rgba(9, 5, 20, 0) 36%), radial-gradient(circle at 64% 62%, rgba(28, 12, 58, 0.42) 0%, rgba(28, 12, 58, 0) 24%), radial-gradient(circle at 60% 82%, rgba(11, 7, 24, 0.62) 0%, rgba(11, 7, 24, 0) 24%);
    --hero-planet-texture-a: radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 12%), radial-gradient(circle at 24% 42%, rgba(109, 40, 217, 0.34) 0%, rgba(109, 40, 217, 0) 18%), radial-gradient(circle at 42% 28%, rgba(236, 72, 153, 0.24) 0%, rgba(236, 72, 153, 0) 12%), radial-gradient(circle at 58% 74%, rgba(34, 211, 238, 0.18) 0%, rgba(34, 211, 238, 0) 14%), radial-gradient(circle at 76% 64%, rgba(10, 7, 26, 0.44) 0%, rgba(10, 7, 26, 0) 18%);
    --hero-planet-texture-b: radial-gradient(circle at 64% 30%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 10%), radial-gradient(circle at 70% 50%, rgba(168, 85, 247, 0.28) 0%, rgba(168, 85, 247, 0) 16%), radial-gradient(circle at 74% 68%, rgba(15, 8, 34, 0.24) 0%, rgba(15, 8, 34, 0) 18%), radial-gradient(circle at 58% 82%, rgba(34, 211, 238, 0.1) 0%, rgba(34, 211, 238, 0) 12%);
    --hero-planet-texture-c: radial-gradient(circle at 32% 66%, rgba(11, 6, 25, 0.5) 0%, rgba(11, 6, 25, 0) 18%), radial-gradient(circle at 48% 56%, rgba(123, 58, 237, 0.24) 0%, rgba(123, 58, 237, 0) 16%), radial-gradient(circle at 72% 82%, rgba(2, 2, 12, 0.7) 0%, rgba(2, 2, 12, 0) 22%), radial-gradient(circle at 70% 74%, rgba(34, 211, 238, 0.08) 0%, rgba(34, 211, 238, 0) 12%);
    --hero-star-glow: 0 0 8px rgba(91, 33, 182, 0.22);
    --hero-particle-glow: 0 0 12px rgba(124, 58, 237, 0.2);
  }

  .hero-cosmos--backdrop {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: var(--hero-bg);
  }

  .hero-cosmos-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(var(--hero-grid-line-a) 1px, transparent 1px),
      linear-gradient(90deg, var(--hero-grid-line-a) 1px, transparent 1px),
      linear-gradient(var(--hero-grid-line-b) 1px, transparent 1px),
      linear-gradient(90deg, var(--hero-grid-line-b) 1px, transparent 1px);
    background-size: 72px 72px, 72px 72px, 144px 144px, 144px 144px;
    opacity: var(--hero-grid-opacity);
    mask-image: radial-gradient(circle at 70% 42%, rgba(0, 0, 0, 0.96) 0%, rgba(0, 0, 0, var(--hero-grid-mask-mid)) 52%, transparent 100%);
  }

  .hero-cosmos-nebula {
    position: absolute;
    border-radius: 999px;
    filter: blur(92px);
    animation: nebulaDrift 18s ease-in-out infinite alternate;
  }

  .hero-cosmos-nebula--a {
    top: 8%;
    right: 6%;
    width: min(40vw, 560px);
    height: min(30vw, 400px);
    background: var(--hero-nebula-a);
  }

  .hero-cosmos-nebula--b {
    bottom: 4%;
    left: 18%;
    width: min(34vw, 440px);
    height: min(26vw, 340px);
    background: var(--hero-nebula-b);
    animation-delay: 2.2s;
  }

  .hero-cosmos-nebula--c {
    top: 28%;
    left: 34%;
    width: min(22vw, 300px);
    height: min(20vw, 260px);
    background: var(--hero-nebula-c);
    animation-delay: 4.2s;
  }

  .hero-cosmos-star {
    position: absolute;
    border-radius: 999px;
    opacity: var(--star-min, 0.2);
    animation: starTwinkle 5.5s ease-in-out infinite;
    box-shadow: var(--hero-star-glow);
  }

  .hero-cosmos--planet {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: clamp(220px, 30vw, 380px);
    overflow: visible;
  }

  .hero-planet-scene {
    position: absolute;
    inset: 0;
    overflow: visible;
  }

  .hero-planet-scene__grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(var(--hero-grid-line-a) 1px, transparent 1px),
      linear-gradient(90deg, var(--hero-grid-line-a) 1px, transparent 1px),
      linear-gradient(var(--hero-grid-line-b) 1px, transparent 1px),
      linear-gradient(90deg, var(--hero-grid-line-b) 1px, transparent 1px);
    background-size: 64px 64px, 64px 64px, 128px 128px, 128px 128px;
    opacity: var(--hero-grid-opacity);
    mask-image: radial-gradient(circle at 72% 42%, rgba(0, 0, 0, 0.98) 0%, rgba(0, 0, 0, var(--hero-grid-mask-mid)) 52%, transparent 100%);
  }

  .hero-planet-scene__nebula {
    position: absolute;
    border-radius: 999px;
    filter: blur(36px);
    opacity: 0.85;
  }

  .hero-planet-scene__nebula--a {
    right: 4%;
    top: 34%;
    width: min(32vw, 380px);
    height: min(30vw, 360px);
    background: var(--hero-nebula-a);
  }

  .hero-planet-scene__nebula--b {
    right: 14%;
    top: 10%;
    width: min(24vw, 280px);
    height: min(24vw, 280px);
    background: var(--hero-nebula-b);
    animation: glowPulse 8s ease-in-out infinite alternate;
  }

  .hero-planet-scene__nebula--c {
    right: 2%;
    top: 42%;
    width: min(24vw, 280px);
    height: min(22vw, 260px);
    background: var(--hero-nebula-c);
    filter: blur(54px);
    animation-delay: 3.4s;
  }

  .hero-planet-scene__halo {
    position: absolute;
    right: 8%;
    top: 50%;
    width: min(34vw, 430px);
    height: min(34vw, 430px);
    transform: translateY(-50%);
    border-radius: 50%;
    background:
      var(--hero-halo-a),
      var(--hero-halo-b);
    filter: blur(66px);
    opacity: var(--hero-halo-opacity);
  }

  .hero-planet-scene__orbit {
    position: absolute;
    left: 59%;
    top: 53%;
    border-radius: 50%;
    border: 1px solid rgba(125, 211, 252, 0.2);
    transform-style: preserve-3d;
    mix-blend-mode: screen;
  }

  .hero-planet-scene__orbit--back {
    width: min(68vw, 520px);
    height: min(22vw, 170px);
    transform: translate(-50%, -50%) rotateX(72deg) rotateZ(-18deg);
    border: 4px solid transparent;
    background: var(--hero-orbit-back) border-box;
    box-shadow: 0 0 44px rgba(34, 211, 238, 0.22), 0 0 18px rgba(168, 85, 247, 0.14);
    opacity: var(--hero-orbit-back-opacity);
  }

  .hero-planet-scene__orbit--mid {
    width: min(62vw, 480px);
    height: min(20vw, 150px);
    transform: translate(-50%, -50%) rotateX(72deg) rotateZ(10deg);
    border: 2px solid transparent;
    background: var(--hero-orbit-mid) border-box;
    box-shadow: 0 0 36px rgba(34, 211, 238, 0.24), 0 0 14px rgba(216, 180, 254, 0.1);
    opacity: var(--hero-orbit-mid-opacity);
  }

  .hero-planet-scene__orbit--front {
    width: min(58vw, 430px);
    height: min(18vw, 132px);
    transform: translate(-50%, -50%) rotateX(72deg) rotateZ(28deg);
    border: 2px solid transparent;
    background: var(--hero-orbit-front) border-box;
    box-shadow: 0 0 28px rgba(216, 180, 254, 0.18), 0 0 12px rgba(34, 211, 238, 0.16);
    opacity: var(--hero-orbit-front-opacity);
  }

  .hero-planet-scene__orbit-dots {
    position: absolute;
    left: 59%;
    top: 53%;
    width: 0;
    height: 0;
    pointer-events: none;
  }

  .hero-planet-scene__orbit-dots--back {
    transform: translate(-50%, -50%) rotateX(72deg) rotateZ(-18deg);
    animation: ringSpinA 28s linear infinite;
  }

  .hero-planet-scene__orbit-dots--front {
    transform: translate(-50%, -50%) rotateX(72deg) rotateZ(28deg);
    animation: ringSpinB 34s linear infinite;
  }

  .hero-planet-scene__orbit-dot {
    position: absolute;
    left: 0;
    top: 0;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: currentColor;
    opacity: var(--dot-opacity, 0.4);
    box-shadow: 0 0 14px currentColor, 0 0 24px rgba(255, 255, 255, 0.16);
    transform: rotate(var(--dot-angle)) translateX(var(--dot-radius)) translateY(-50%) scale(var(--dot-scale, 1));
    transform-origin: 0 0;
  }

  .hero-planet-scene__ring {
    position: absolute;
    left: 59%;
    top: 53%;
    border-radius: 50%;
    border: 2px solid transparent;
    transform-style: preserve-3d;
    mix-blend-mode: screen;
  }

  .hero-planet-scene__ring--back {
    width: min(70vw, 560px);
    height: min(24vw, 180px);
    transform: translate(-50%, -50%) rotateX(72deg) rotateZ(-22deg);
    border: 4px solid transparent;
    background: var(--hero-ring-back) border-box;
    box-shadow: var(--hero-ring-back-shadow);
    animation: ringSpinA 28s linear infinite;
    clip-path: inset(52% 0 0 0);
    opacity: var(--hero-ring-back-opacity);
  }

  .hero-planet-scene__ring--front {
    width: min(66vw, 520px);
    height: min(22vw, 162px);
    transform: translate(-50%, -50%) rotateX(72deg) rotateZ(14deg);
    border: 3px solid transparent;
    background: var(--hero-ring-front) border-box;
    box-shadow: var(--hero-ring-front-shadow);
    animation: ringSpinB 34s linear infinite;
    clip-path: inset(0 0 48% 0);
    opacity: var(--hero-ring-front-opacity);
  }

  .hero-planet-scene__planet {
    position: absolute;
    right: 11%;
    top: 52%;
    width: min(30vw, 360px);
    aspect-ratio: 1;
    transform: translateY(-50%);
    border-radius: 50%;
    overflow: hidden;
    background: var(--hero-planet-base);
    box-shadow: var(--hero-planet-shadow);
    animation: planetFloat 8s ease-in-out infinite;
  }

  .hero-planet-scene__planet::before,
  .hero-planet-scene__planet::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
  }

  .hero-planet-scene__planet::before {
    background:
      radial-gradient(circle at 28% 22%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 22%),
      radial-gradient(circle at 42% 30%, rgba(168, 85, 247, 0.34) 0%, rgba(168, 85, 247, 0) 18%),
      radial-gradient(circle at 58% 46%, rgba(123, 58, 237, 0.4) 0%, rgba(123, 58, 237, 0) 26%),
      radial-gradient(circle at 72% 64%, rgba(34, 211, 238, 0.18) 0%, rgba(34, 211, 238, 0) 22%),
      radial-gradient(circle at 52% 80%, rgba(10, 7, 26, 0.72) 0%, rgba(10, 7, 26, 0) 30%);
    opacity: 0.95;
    filter: blur(2px);
  }

  .hero-planet-scene__planet::after {
    inset: -6%;
    background:
      radial-gradient(circle at 35% 28%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 16%),
      radial-gradient(circle at 66% 38%, rgba(168, 85, 247, 0.18) 0%, rgba(168, 85, 247, 0) 12%),
      radial-gradient(circle at 52% 58%, rgba(34, 211, 238, 0.1) 0%, rgba(34, 211, 238, 0) 10%);
    opacity: 0.84;
    filter: blur(8px);
  }

  .hero-planet-scene__planet-shine,
  .hero-planet-scene__planet-shade,
  .hero-planet-scene__planet-texture {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
  }

  .hero-planet-scene__planet-shine {
    background: var(--hero-planet-shine);
    opacity: 0.82;
  }

  .hero-planet-scene__planet-shade {
    background: var(--hero-planet-shade);
    opacity: 0.9;
  }

  .hero-planet-scene__planet-core {
    position: absolute;
    inset: 10%;
    border-radius: inherit;
    background:
      radial-gradient(circle at 28% 24%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 18%),
      radial-gradient(circle at 42% 34%, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 24%),
      radial-gradient(circle at 26% 58%, rgba(123, 58, 237, 0.26) 0%, rgba(123, 58, 237, 0) 16%),
      radial-gradient(circle at 52% 48%, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0) 20%),
      radial-gradient(circle at 76% 68%, rgba(34, 211, 238, 0.14) 0%, rgba(34, 211, 238, 0) 16%),
      radial-gradient(circle at 74% 80%, rgba(4, 6, 18, 0.88) 0%, rgba(4, 6, 18, 0) 28%);
    mix-blend-mode: screen;
    opacity: 0.8;
    filter: blur(12px);
    transform: scale(1.04);
  }

  .hero-planet-scene__planet-texture--a {
    background: var(--hero-planet-texture-a);
    opacity: 0.96;
    filter: blur(6px);
  }

  .hero-planet-scene__planet-texture--b {
    background: var(--hero-planet-texture-b);
    opacity: 0.84;
    filter: blur(8px);
  }

  .hero-planet-scene__planet-texture--c {
    background: var(--hero-planet-texture-c);
    opacity: 0.84;
    filter: blur(9px);
  }

  .hero-planet-scene__particle {
    position: absolute;
    border-radius: 999px;
    opacity: var(--particle-min, 0.6);
    animation: particleFloat 8s ease-in-out infinite, particleBlink 4.4s ease-in-out infinite;
  }

  .hero-planet-scene__orbit-dot {
    animation: dotPulse 4.8s ease-in-out infinite;
  }

  @keyframes starTwinkle {
    0%, 100% { opacity: var(--star-min, 0.2); transform: scale(0.9); }
    50% { opacity: var(--star-max, 0.45); transform: scale(1.25); }
  }

  @keyframes nebulaDrift {
    from { transform: translate3d(0, 0, 0) scale(1); }
    to { transform: translate3d(-24px, 14px, 0) scale(1.05); }
  }

  @keyframes planetFloat {
    0%, 100% { transform: translateY(-50%) translateY(0); }
    50% { transform: translateY(-50%) translateY(-10px); }
  }

  @keyframes glowPulse {
    0%, 100% { transform: translateY(-50%) scale(0.98); opacity: 0.72; }
    50% { transform: translateY(-50%) scale(1.04); opacity: 1; }
  }

  @keyframes ringSpinA {
    from { transform: translate(-50%, -50%) rotateX(72deg) rotateZ(-22deg); }
    to { transform: translate(-50%, -50%) rotateX(72deg) rotateZ(338deg); }
  }

  @keyframes ringSpinB {
    from { transform: translate(-50%, -50%) rotateX(72deg) rotateZ(14deg); }
    to { transform: translate(-50%, -50%) rotateX(72deg) rotateZ(374deg); }
  }

  @keyframes dotPulse {
    0%, 100% { opacity: var(--dot-opacity, 0.4); transform: rotate(var(--dot-angle)) translateX(var(--dot-radius)) translateY(-50%) scale(calc(var(--dot-scale, 1) * 0.88)); }
    50% { opacity: calc(var(--dot-opacity, 0.4) + 0.2); transform: rotate(var(--dot-angle)) translateX(var(--dot-radius)) translateY(-50%) scale(calc(var(--dot-scale, 1) * 1.05)); }
  }

  @keyframes particleFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(calc(-1 * var(--particle-drift, 14px))); }
  }

  @keyframes particleBlink {
    0%, 100% { opacity: var(--particle-min, 0.6); }
    50% { opacity: var(--particle-max, 0.82); }
  }

  @media (max-width: 1023px) {
    .hero-cosmos--planet {
      min-height: clamp(220px, 42vw, 320px);
    }

    .hero-planet-scene__planet {
      right: 50%;
      top: 58%;
      width: min(72vw, 300px);
      transform: translate(50%, -50%);
    }

    .hero-planet-scene__halo {
      right: 50%;
      top: 50%;
      width: min(60vw, 260px);
      height: min(60vw, 260px);
      transform: translate(50%, -50%);
    }

    .hero-planet-scene__orbit--back,
    .hero-planet-scene__orbit--mid,
    .hero-planet-scene__orbit--front,
    .hero-planet-scene__ring--back,
    .hero-planet-scene__ring--front {
      left: 50%;
    }

    .hero-planet-scene__orbit-dots--back,
    .hero-planet-scene__orbit-dots--front {
      left: 50%;
    }

    .hero-planet-scene__ring--back {
      width: min(88vw, 420px);
      height: min(28vw, 130px);
    }

    .hero-planet-scene__ring--front {
      width: min(80vw, 380px);
      height: min(24vw, 118px);
    }
  }

  @media (max-width: 640px) {
    .hero-cosmos-nebula--a {
      right: -10%;
      width: 300px;
      height: 220px;
      filter: blur(84px);
    }

    .hero-cosmos-nebula--b {
      left: -8%;
      width: 260px;
      height: 200px;
      filter: blur(82px);
    }

    .hero-cosmos-nebula--c {
      left: 22%;
      top: 34%;
      width: 180px;
      height: 140px;
      filter: blur(72px);
    }

    .hero-planet-scene__planet {
      width: min(72vw, 260px);
      top: 56%;
    }

    .hero-planet-scene__ring--back {
      width: min(94vw, 360px);
      height: min(30vw, 116px);
    }

    .hero-planet-scene__ring--front {
      width: min(86vw, 330px);
      height: min(26vw, 106px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-cosmos-grid,
    .hero-cosmos-nebula,
    .hero-cosmos-star,
    .hero-planet-scene__planet,
    .hero-planet-scene__orbit,
    .hero-planet-scene__ring,
    .hero-planet-scene__particle {
      animation: none !important;
    }
  }
`;
