import type { CSSProperties } from "react";

const ambientParticles = [
  { left: "7%", top: "14%", size: "4px", delay: "0s", duration: "7s", color: "var(--hero-particle-violet)" },
  { left: "16%", top: "62%", size: "6px", delay: "1.2s", duration: "9s", color: "var(--hero-particle-cyan)" },
  { left: "28%", top: "30%", size: "3px", delay: "0.8s", duration: "8s", color: "var(--hero-particle-soft)" },
  { left: "38%", top: "74%", size: "5px", delay: "2.1s", duration: "10s", color: "var(--hero-particle-cyan)" },
  { left: "49%", top: "18%", size: "4px", delay: "1.6s", duration: "7.5s", color: "var(--hero-particle-violet)" },
  { left: "56%", top: "52%", size: "6px", delay: "0.4s", duration: "11s", color: "var(--hero-particle-soft)" },
  { left: "66%", top: "9%", size: "3px", delay: "2.6s", duration: "8.5s", color: "var(--hero-particle-cyan)" },
  { left: "74%", top: "43%", size: "5px", delay: "1s", duration: "9.5s", color: "var(--hero-particle-violet)" },
  { left: "84%", top: "66%", size: "4px", delay: "2.8s", duration: "8.8s", color: "var(--hero-particle-cyan)" },
  { left: "92%", top: "22%", size: "3px", delay: "1.9s", duration: "10s", color: "var(--hero-particle-soft)" },
];

const sceneStars = [
  { left: "8%", top: "26%", size: "2px", delay: "0.2s" },
  { left: "12%", top: "72%", size: "3px", delay: "1.6s" },
  { left: "20%", top: "16%", size: "2px", delay: "0.8s" },
  { left: "24%", top: "48%", size: "4px", delay: "2.2s" },
  { left: "34%", top: "12%", size: "2px", delay: "1.4s" },
  { left: "42%", top: "82%", size: "3px", delay: "0.6s" },
  { left: "54%", top: "22%", size: "2px", delay: "2.4s" },
  { left: "62%", top: "68%", size: "3px", delay: "1.1s" },
  { left: "70%", top: "30%", size: "4px", delay: "2.8s" },
  { left: "78%", top: "12%", size: "2px", delay: "0.9s" },
  { left: "86%", top: "56%", size: "3px", delay: "1.8s" },
  { left: "92%", top: "34%", size: "2px", delay: "2.6s" },
];

const orbitNodes = [
  { orbit: "hero-orbit-1", color: "var(--hero-node-cyan)", size: "10px", duration: "13s", delay: "0s" },
  { orbit: "hero-orbit-2", color: "var(--hero-node-violet)", size: "8px", duration: "16s", delay: "1.2s" },
  { orbit: "hero-orbit-3", color: "var(--hero-node-cyan)", size: "6px", duration: "18s", delay: "0.8s" },
  { orbit: "hero-orbit-4", color: "var(--hero-node-violet)", size: "9px", duration: "15s", delay: "2.1s" },
  { orbit: "hero-orbit-5", color: "var(--hero-node-cyan)", size: "7px", duration: "20s", delay: "1.6s" },
];

type HeroCosmosSceneProps = {
  variant?: "planet" | "backdrop";
};

export default function HeroCosmosScene({
  variant = "planet",
}: HeroCosmosSceneProps) {
  if (variant === "backdrop") {
    return (
      <div className="hero-cosmos-backdrop" aria-hidden="true">
        <div className="hero-cosmos-nebula hero-cosmos-nebula-a" />
        <div className="hero-cosmos-nebula hero-cosmos-nebula-b" />
        <div className="hero-cosmos-grid" />

        {ambientParticles.map((particle, index) => (
          <span
            key={index}
            className="hero-ambient-particle"
            style={
              {
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                background: particle.color,
                color: particle.color,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
              } as CSSProperties
            }
          />
        ))}

        {sceneStars.map((star, index) => (
          <span
            key={index}
            className="hero-scene-star"
            style={
              {
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animationDelay: star.delay,
              } as CSSProperties
            }
          />
        ))}

        <span className="hero-shooting-star hero-shooting-star-a" />
        <span className="hero-shooting-star hero-shooting-star-b" />
        <span className="hero-shooting-star hero-shooting-star-c" />
      </div>
    );
  }

  return (
    <div className="hero-cosmos-shell" aria-hidden="true">
        <div className="hero-cosmos-aura" />
        <div className="hero-cosmos-halo" />

        <div className="hero-cosmos-float">
          <div className="hero-cosmos-tilt">
            <div className="hero-cosmos-planet">
              <div className="hero-cosmos-highlight" />
              <div className="hero-cosmos-surface" />
              <div className="hero-cosmos-core-stars" />
            </div>

            <div className="hero-cosmos-ring hero-cosmos-ring-a" />
            <div className="hero-cosmos-ring hero-cosmos-ring-b" />
            <div className="hero-cosmos-ring hero-cosmos-ring-c" />
            <div className="hero-cosmos-orbit-trail hero-cosmos-orbit-trail-a" />
            <div className="hero-cosmos-orbit-trail hero-cosmos-orbit-trail-b" />
            <div className="hero-cosmos-data-arc hero-cosmos-data-arc-a" />
            <div className="hero-cosmos-data-arc hero-cosmos-data-arc-b" />
            <div className="hero-cosmos-data-arc hero-cosmos-data-arc-c" />

            {orbitNodes.map((node, index) => (
              <span
                key={index}
                className={`hero-cosmos-node ${node.orbit}`}
                style={
                  {
                    width: node.size,
                    height: node.size,
                    background: node.color,
                    color: node.color,
                    animationDuration: node.duration,
                    animationDelay: node.delay,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>
    </div>
  );
}
