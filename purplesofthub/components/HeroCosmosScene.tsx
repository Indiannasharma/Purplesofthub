'use client'

import { useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
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

type ParticleConfig = {
  left: number;
  top: number;
  size: number;
  accent: Accent;
  duration: number;
  delay: number;
  drift: number;
};

type CircuitTraceConfig = {
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

const ACCENTS: Record<Accent, string> = {
  purple: "#A855F7",
  cyan: "#22D3EE",
  pink: "#EC4899",
};

const STARS: StarConfig[] = Array.from({ length: 96 }, (_, index) => ({
  left: (index * 19) % 100,
  top: (index * 37) % 100,
  size: index % 7 === 0 ? 2 : 1,
  duration: 3.2 + (index % 6) * 0.8,
  delay: (index % 9) * 0.35,
  darkOpacity: 0.18 + (index % 5) * 0.045,
  lightOpacity: 0.1 + (index % 4) * 0.03,
}));

const PARTICLES: ParticleConfig[] = [
  { left: 15, top: 44, size: 4, accent: "purple", duration: 8, delay: 0.2, drift: 18 },
  { left: 22, top: 28, size: 6, accent: "cyan", duration: 10.5, delay: 1.4, drift: 26 },
  { left: 28, top: 70, size: 3, accent: "pink", duration: 9.1, delay: 2.1, drift: 16 },
  { left: 38, top: 20, size: 5, accent: "purple", duration: 7.6, delay: 0.9, drift: 20 },
  { left: 44, top: 60, size: 4, accent: "cyan", duration: 11.2, delay: 2.6, drift: 30 },
  { left: 52, top: 76, size: 2, accent: "pink", duration: 8.4, delay: 1.1, drift: 12 },
  { left: 61, top: 26, size: 6, accent: "purple", duration: 9.7, delay: 0.6, drift: 22 },
  { left: 68, top: 58, size: 3, accent: "cyan", duration: 6.8, delay: 1.8, drift: 14 },
  { left: 78, top: 34, size: 7, accent: "pink", duration: 10.8, delay: 2.2, drift: 26 },
  { left: 85, top: 64, size: 4, accent: "cyan", duration: 8.7, delay: 1.5, drift: 18 },
  { left: 74, top: 18, size: 3, accent: "purple", duration: 7.1, delay: 2.4, drift: 16 },
  { left: 55, top: 47, size: 5, accent: "cyan", duration: 9.4, delay: 0.8, drift: 20 },
  { left: 48, top: 38, size: 2, accent: "pink", duration: 6.4, delay: 1.7, drift: 12 },
  { left: 36, top: 82, size: 4, accent: "purple", duration: 8.2, delay: 1.2, drift: 18 },
];

const CIRCUIT_TRACES: CircuitTraceConfig[] = [
  { left: 57, top: 15, width: 270, angle: -12, accent: "cyan", duration: 5.5, delay: 0.2, darkOpacity: 0.42, lightOpacity: 0.35 },
  { left: 74, top: 14, width: 230, angle: -24, accent: "pink", duration: 7.2, delay: 1.1, darkOpacity: 0.28, lightOpacity: 0.28 },
  { left: 62, top: 34, width: 360, angle: 10, accent: "purple", duration: 6.8, delay: 2, darkOpacity: 0.24, lightOpacity: 0.3 },
  { left: 78, top: 43, width: 260, angle: 6, accent: "cyan", duration: 4.8, delay: 0.8, darkOpacity: 0.36, lightOpacity: 0.38 },
  { left: 63, top: 61, width: 420, angle: -9, accent: "cyan", duration: 7.4, delay: 1.6, darkOpacity: 0.3, lightOpacity: 0.36 },
  { left: 73, top: 73, width: 280, angle: 27, accent: "pink", duration: 5.8, delay: 2.5, darkOpacity: 0.24, lightOpacity: 0.3 },
  { left: 55, top: 82, width: 320, angle: -28, accent: "purple", duration: 6.2, delay: 0.7, darkOpacity: 0.26, lightOpacity: 0.32 },
];

function clampOpacity(value: number) {
  return Math.max(0, Math.min(1, value));
}

function PlanetMaterial({ isDark }: { isDark: boolean }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uDark: { value: isDark ? 1 : 0 },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;

          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uDark;
          varying vec3 vNormal;
          varying vec3 vPosition;

          float noise(vec3 p) {
            return sin(p.x * 8.0 + uTime * 0.25) * sin(p.y * 7.0) * sin(p.z * 6.0);
          }

          void main() {
            vec3 normal = normalize(vNormal);
            float fresnel = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 2.2);
            float topLight = smoothstep(-0.45, 0.75, vPosition.y);
            float sideShade = smoothstep(-0.75, 0.55, normal.x);
            float surface = noise(vPosition * 1.4) * 0.08;

            vec3 deepPurple = vec3(0.10, 0.04, 0.26);
            vec3 royalPurple = vec3(0.42, 0.14, 0.82);
            vec3 violet = vec3(0.66, 0.33, 0.97);
            vec3 magenta = vec3(0.93, 0.28, 0.60);
            vec3 cyan = vec3(0.13, 0.83, 0.93);

            vec3 color = mix(deepPurple, royalPurple, sideShade);
            color = mix(color, violet, topLight * 0.55);
            color = mix(color, magenta, topLight * 0.42);
            color += cyan * fresnel * (uDark > 0.5 ? 0.72 : 0.48);
            color += surface;

            float alpha = 1.0;
            gl_FragColor = vec4(color, alpha);
          }
        `,
      }),
    [isDark],
  );

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uDark.value = isDark ? 1 : 0;
  });

  return <primitive object={material} attach="material" />;
}

function SaturnRing({
  color,
  radius,
  tube,
  speed,
  reverse,
  opacity,
}: {
  color: string;
  radius: number;
  tube: number;
  speed: number;
  reverse?: boolean;
  opacity: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z += delta * speed * (reverse ? -1 : 1);
  });

  return (
    <mesh ref={ref} rotation={[1.2, 0.16, -0.17]}>
      <torusGeometry args={[radius, tube, 24, 192]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function DottedRing({ isDark }: { isDark: boolean }) {
  const group = useRef<THREE.Group>(null);
  const dots = useMemo(
    () =>
      Array.from({ length: 82 }, (_, index) => ({
        angle: (index / 82) * Math.PI * 2,
        radius: 1.95 + (index % 5) * 0.012,
        size: index % 9 === 0 ? 0.018 : 0.01,
      })),
    [],
  );

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.z += delta * 0.1;
  });

  return (
    <group ref={group} rotation={[1.2, 0.16, -0.17]}>
      {dots.map((dot, index) => (
        <mesh
          key={index}
          position={[Math.cos(dot.angle) * dot.radius, Math.sin(dot.angle) * dot.radius, 0]}
        >
          <sphereGeometry args={[dot.size, 8, 8]} />
          <meshBasicMaterial
            color={index % 4 === 0 ? "#22D3EE" : "#A855F7"}
            transparent
            opacity={isDark ? 0.68 : 0.42}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

function PlanetScene({ isDark }: { isDark: boolean }) {
  const planet = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!planet.current) return;
    planet.current.rotation.y += delta * 0.12;
    planet.current.rotation.x = -0.08;
  });

  return (
    <>
      <ambientLight intensity={isDark ? 1.3 : 1} />
      <pointLight position={[-2.6, 2.8, 3]} color="#EC4899" intensity={isDark ? 5.4 : 3.4} />
      <pointLight position={[2.8, 1.4, 2.4]} color="#22D3EE" intensity={isDark ? 4.8 : 3.2} />
      <pointLight position={[0, -2.8, 1.8]} color="#7C3AED" intensity={isDark ? 3.2 : 2.2} />

      <group position={[0.24, -0.06, 0]} scale={1.04}>
        <SaturnRing color="#22D3EE" radius={1.78} tube={0.018} speed={0.19} opacity={isDark ? 0.9 : 0.62} />
        <SaturnRing color="#A855F7" radius={1.68} tube={0.026} speed={0.16} reverse opacity={isDark ? 0.72 : 0.5} />
        <SaturnRing color="#EC4899" radius={1.54} tube={0.012} speed={0.12} reverse opacity={isDark ? 0.58 : 0.38} />
        <DottedRing isDark={isDark} />

        <mesh ref={planet}>
          <sphereGeometry args={[1.1, 96, 96]} />
          <PlanetMaterial isDark={isDark} />
        </mesh>
      </group>
    </>
  );
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
        <div className="hero-nebula" style={{ opacity: isDark ? 0.62 : 0.28 }} />
        <div className="hero-circuit-grid" style={{ opacity: isDark ? 0.72 : 0.42 }} />

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

        {CIRCUIT_TRACES.map((trace, index) => {
          const color = ACCENTS[trace.accent];
          return (
            <span
              key={index}
              className="hero-circuit-trace"
              style={
                {
                  left: `${trace.left}%`,
                  top: `${trace.top}%`,
                  width: `${trace.width}px`,
                  background: color,
                  transform: `rotate(${trace.angle}deg)`,
                  filter: isDark ? `drop-shadow(0 0 10px ${color}99)` : "none",
                  ["--line-min" as string]: isDark ? trace.darkOpacity : trace.lightOpacity,
                  ["--line-max" as string]: isDark
                    ? clampOpacity(trace.darkOpacity + 0.16)
                    : clampOpacity(trace.lightOpacity + 0.08),
                  animationDuration: `${trace.duration}s`,
                  animationDelay: `${trace.delay}s`,
                } as CSSProperties
              }
            />
          );
        })}

        <span className="hero-circuit-corner hero-circuit-corner--left" />
        <span className="hero-circuit-corner hero-circuit-corner--right" />
        <span className="hero-hud-arc hero-hud-arc--one" />
        <span className="hero-hud-arc hero-hud-arc--two" />
        <span className="hero-hud-arc hero-hud-arc--three" />

        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="hero-cosmos hero-cosmos--planet" aria-hidden="true">
      <div className="planet-glow" style={{ opacity: isDark ? 0.68 : 0.36 }} />

      <div className="planet-canvas-shell">
        <Canvas
          camera={{ position: [0, 0.1, 4.2], fov: 40 }}
          dpr={[1, 1.8]}
          gl={{ alpha: true, antialias: true }}
        >
          <PlanetScene isDark={isDark} />
        </Canvas>

        <div className="planet-overlay-sparks">
          {PARTICLES.map((spark, index) => {
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
                    ["--spark-drift" as string]: `${spark.drift}px`,
                    animationDuration: `${spark.duration}s, ${3.2 + (index % 4) * 0.6}s`,
                    animationDelay: `${spark.delay}s, ${spark.delay / 2}s`,
                  } as CSSProperties
                }
              />
            );
          })}
        </div>
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
  .hero-circuit-trace,
  .hero-hud-arc,
  .hero-circuit-corner {
    position: absolute;
  }

  .hero-star {
    border-radius: 999px;
    opacity: var(--star-min, 0.2);
    animation: starTwinkle 5s ease-in-out infinite;
  }

  .hero-circuit-trace {
    height: 2px;
    transform-origin: left center;
    opacity: var(--line-min, 0.3);
    animation: circuitPulse 5s ease-in-out infinite;
  }

  .hero-circuit-trace::before,
  .hero-circuit-trace::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: inherit;
    transform: translateY(-50%);
  }

  .hero-circuit-trace::before {
    left: 0;
  }

  .hero-circuit-trace::after {
    right: 0;
  }

  .hero-circuit-corner {
    width: 180px;
    height: 120px;
    border-color: rgba(124,58,237,0.18);
    border-style: solid;
    opacity: 0.65;
  }

  .hero-circuit-corner--left {
    left: 0;
    bottom: 0;
    border-width: 1px 0 0 1px;
  }

  .hero-circuit-corner--right {
    right: 0;
    bottom: 0;
    border-width: 1px 1px 0 0;
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

  .planet-glow {
    position: absolute;
    right: 3%;
    top: 50%;
    width: min(48vw, 680px);
    height: min(48vw, 680px);
    transform: translateY(-50%);
    border-radius: 50%;
    background:
      radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 28%),
      radial-gradient(circle, rgba(168,85,247,0.48) 0%, rgba(168,85,247,0.15) 38%, transparent 68%);
    filter: blur(54px);
  }

  .planet-canvas-shell {
    position: absolute;
    right: -4%;
    top: 50%;
    width: clamp(430px, 44vw, 700px);
    aspect-ratio: 1 / 1;
    transform: translateY(-50%);
  }

  .planet-canvas-shell canvas {
    width: 100% !important;
    height: 100% !important;
    filter: drop-shadow(0 0 34px rgba(34,211,238,0.16));
  }

  .planet-overlay-sparks {
    position: absolute;
    inset: 0;
  }

  .planet-spark {
    position: absolute;
    border-radius: 50%;
    opacity: var(--spark-min, 0.6);
    animation: sparkFloat 8s ease-in-out infinite, sparkBlink 4s ease-in-out infinite;
  }

  @keyframes starTwinkle {
    0%, 100% { opacity: var(--star-min, 0.2); transform: scale(0.85); }
    50% { opacity: var(--star-max, 0.45); transform: scale(1.25); }
  }

  @keyframes circuitPulse {
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

    .hero-circuit-trace:nth-of-type(n + 5),
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
    .hero-circuit-trace:nth-of-type(n + 4) {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-nebula,
    .hero-star,
    .hero-circuit-trace,
    .planet-spark {
      animation: none !important;
    }
  }
`;
