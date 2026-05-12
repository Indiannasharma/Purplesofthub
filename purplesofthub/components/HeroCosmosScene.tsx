'use client'

import { useLayoutEffect, useMemo, useRef } from "react";
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

type SnippetConfig = {
  text: string;
  left: number;
  top: number;
  rotate: number;
  delay: number;
  width: number;
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

const HUD_SNIPPETS: SnippetConfig[] = [
  { text: "renderOrbit()", left: 71, top: 20, rotate: -8, delay: 0.1, width: 132 },
  { text: "const glow = 0.86", left: 80, top: 29, rotate: 6, delay: 0.8, width: 150 },
  { text: "<Ring phase=\"slow\" />", left: 75, top: 40, rotate: -4, delay: 1.4, width: 158 },
  { text: "grid.mask('circuit')", left: 84, top: 53, rotate: 8, delay: 0.5, width: 170 },
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
            float fresnel = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 1.85);
            float rim = pow(1.0 - max(dot(normal, vec3(-0.85, 0.15, 0.52)), 0.0), 2.4);
            float topLight = smoothstep(-0.45, 0.75, vPosition.y);
            float sideShade = smoothstep(-0.75, 0.55, normal.x);
            float surface = noise(vPosition * 2.1) * 0.11 + noise(vPosition * 4.2 + uTime * 0.15) * 0.04;

            vec3 deepPurple = vec3(0.08, 0.03, 0.22);
            vec3 royalPurple = vec3(0.38, 0.12, 0.78);
            vec3 violet = vec3(0.62, 0.28, 0.95);
            vec3 magenta = vec3(0.88, 0.22, 0.58);
            vec3 cyan = vec3(0.13, 0.83, 0.93);
            vec3 rimPurple = vec3(0.75, 0.35, 1.0);

            vec3 color = mix(deepPurple, royalPurple, sideShade);
            color = mix(color, violet, topLight * 0.55);
            color = mix(color, magenta, topLight * 0.38);
            color += cyan * fresnel * (uDark > 0.5 ? 0.88 : 0.52);
            color += rimPurple * rim * (uDark > 0.5 ? 0.55 : 0.32);
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

const RING_TILT: [number, number, number] = [1.22, 0.15, -0.18];

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
    <mesh ref={ref} rotation={RING_TILT}>
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

function DataPacketRing({
  isDark,
  radius,
  colorHex,
  speed,
  reverse,
  tilt,
}: {
  isDark: boolean;
  radius: number;
  colorHex: string;
  speed: number;
  reverse?: boolean;
  tilt: [number, number, number];
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const count = 48;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: isDark ? 0.78 : 0.48,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [colorHex, isDark],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = radius + (i % 4) * 0.014;
      dummy.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
      dummy.rotation.set(0, 0, angle + Math.PI / 2);
      const w = 0.05 + (i % 5) * 0.012;
      const h = 0.011 + (i % 3) * 0.003;
      dummy.scale.set(w, h, 0.026);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count, dummy, radius]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z += delta * speed * (reverse ? -1 : 1);
  });

  return (
    <group ref={groupRef} rotation={tilt}>
      <instancedMesh ref={meshRef} args={[geo, mat, count]} />
    </group>
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
    <group ref={group} rotation={RING_TILT}>
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
    planet.current.rotation.y += delta * 0.09;
    planet.current.rotation.x = -0.12;
  });

  return (
    <>
      <ambientLight intensity={isDark ? 1.4 : 1.1} />
      <pointLight position={[-2.8, 2.6, 3.2]} color="#EC4899" intensity={isDark ? 5.5 : 3.4} />
      <pointLight position={[3, 1.2, 2.6]} color="#22D3EE" intensity={isDark ? 5 : 3.2} />
      <pointLight position={[0, -2.6, 2]} color="#7C3AED" intensity={isDark ? 3.8 : 2.4} />
      <pointLight position={[-1.2, -0.5, 3.8]} color="#A855F7" intensity={isDark ? 2.6 : 1.6} />

      <group position={[0.18, -0.08, 0]} scale={1.16}>
        <mesh ref={planet}>
          <sphereGeometry args={[1.1, 128, 128]} />
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
      <div className="planet-code-cloud" style={{ opacity: isDark ? 0.66 : 0.4 }} />

      <div className="planet-canvas-shell">
        <Canvas
          camera={{ position: [0, 0.08, 3.7], fov: 38 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
        >
          <PlanetScene isDark={isDark} />
        </Canvas>

        <div className="planet-orbit-stage">
          <span className="hero-cosmos-aura" />
          <span className="hero-cosmos-halo" />
          <span className="hero-cosmos-ring hero-cosmos-ring-a" />
          <span className="hero-cosmos-ring hero-cosmos-ring-b" />
          <span className="hero-cosmos-ring hero-cosmos-ring-c" />
          <span className="hero-cosmos-orbit-trail hero-cosmos-orbit-trail-a" />
          <span className="hero-cosmos-orbit-trail hero-cosmos-orbit-trail-b" />
          <span className="hero-cosmos-data-arc hero-cosmos-data-arc-a" />
          <span className="hero-cosmos-data-arc hero-cosmos-data-arc-b" />
          <span className="hero-cosmos-data-arc hero-cosmos-data-arc-c" />
          <span className="hero-cosmos-node hero-orbit-1" style={{ width: 7, height: 7, color: "#22D3EE", marginLeft: -3.5, marginTop: -3.5, animationDuration: "11s" }} />
          <span className="hero-cosmos-node hero-orbit-2" style={{ width: 5, height: 5, color: "#A855F7", marginLeft: -2.5, marginTop: -2.5, animationDuration: "14s" }} />
          <span className="hero-cosmos-node hero-orbit-3" style={{ width: 6, height: 6, color: "#D8B4FE", marginLeft: -3, marginTop: -3, animationDuration: "16s" }} />
          <span className="hero-cosmos-node hero-orbit-4" style={{ width: 5, height: 5, color: "#67E8F9", marginLeft: -2.5, marginTop: -2.5, animationDuration: "18s" }} />
          <span className="hero-cosmos-node hero-orbit-5" style={{ width: 8, height: 8, color: "#EC4899", marginLeft: -4, marginTop: -4, animationDuration: "20s" }} />
        </div>

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

        <div className="planet-code-snippets">
          {HUD_SNIPPETS.map((chip, index) => (
            <span
              key={index}
              className="planet-code-snippet"
              style={
                {
                  left: `${chip.left}%`,
                  top: `${chip.top}%`,
                  width: `${chip.width}px`,
                  ["--snippet-rotate" as string]: `${chip.rotate}deg`,
                  animationDelay: `${chip.delay}s`,
                } as CSSProperties
              }
            >
              {chip.text}
            </span>
          ))}
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
    min-height: clamp(240px, 32vw, 440px);
    overflow: visible;
  }

  .hero-nebula {
    position: absolute;
    top: 46%;
    right: -4%;
    width: min(72vw, 980px);
    height: min(66vw, 860px);
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
      linear-gradient(rgba(6,182,212,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(6,182,212,0.07) 1px, transparent 1px),
      linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px),
      linear-gradient(135deg, transparent 0 46%, rgba(34,211,238,0.09) 48% 50%, transparent 52%),
      linear-gradient(45deg, transparent 0 46%, rgba(168,85,247,0.07) 48% 50%, transparent 52%);
    background-size: 56px 56px, 56px 56px, 72px 72px, 72px 72px, 380px 240px, 440px 300px;
    mask-image: radial-gradient(circle at 72% 48%, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.72) 55%, transparent 100%);
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
    right: 8%;
    top: 50%;
    width: min(28vw, 360px);
    height: min(28vw, 360px);
    transform: translateY(-50%);
    border-radius: 50%;
    background:
      radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 28%),
      radial-gradient(circle, rgba(168,85,247,0.48) 0%, rgba(168,85,247,0.15) 38%, transparent 68%);
    filter: blur(54px);
  }

  .planet-code-cloud {
    display: none;
  }

  .planet-canvas-shell {
    position: absolute;
    right: 7%;
    top: 50%;
    width: clamp(220px, 28vw, 420px);
    aspect-ratio: 1 / 1;
    transform: translateY(-50%) scale(0.88);
    transform-origin: center center;
  }

  .planet-canvas-shell canvas {
    width: 100% !important;
    height: 100% !important;
    filter: drop-shadow(0 0 42px rgba(168,85,247,0.22)) drop-shadow(0 0 28px rgba(34,211,238,0.18));
  }

  .planet-orbit-stage {
    position: absolute;
    inset: 4% 0 0 0;
    overflow: visible;
    transform: scale(0.84);
    transform-origin: center center;
  }

  .hero-cosmos-aura {
    inset: 50% auto auto 54%;
    width: 112%;
    height: 112%;
  }

  .hero-cosmos-halo {
    inset: 50% auto auto 54%;
    width: 96%;
    height: 96%;
  }

  .hero-cosmos-ring-a {
    inset: 50% auto auto 56%;
    transform: translate(-50%, -50%) rotateX(70deg) rotateZ(16deg) scale(0.76);
  }

  .hero-cosmos-ring-b {
    inset: 50% auto auto 56%;
    transform: translate(-50%, -50%) rotateX(70deg) rotateZ(-14deg) scale(0.76);
  }

  .hero-cosmos-ring-c {
    inset: 50% auto auto 56%;
    transform: translate(-50%, -50%) rotateX(70deg) rotateZ(4deg) scale(0.76);
  }

  .hero-cosmos-orbit-trail-a {
    inset: 50% auto auto 56%;
  }

  .hero-cosmos-orbit-trail-b {
    inset: 50% auto auto 56%;
  }

  .hero-cosmos-data-arc-a,
  .hero-cosmos-data-arc-b,
  .hero-cosmos-data-arc-c {
    inset: 50% auto auto 56%;
  }

  .hero-cosmos-node {
    inset: 50% auto auto 56%;
  }

  .planet-overlay-sparks {
    position: absolute;
    inset: 0;
  }

  .planet-code-snippets {
    display: none;
  }

  .planet-code-snippet {
    position: absolute;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 20px;
    padding: 3px 9px;
    border-radius: 999px;
    border: 1px solid rgba(125, 211, 252, 0.24);
    background:
      linear-gradient(135deg, rgba(12, 8, 30, 0.52), rgba(44, 16, 82, 0.28)),
      linear-gradient(90deg, rgba(168, 85, 247, 0.14), rgba(34, 211, 238, 0.12));
    box-shadow:
      0 0 0 1px rgba(168, 85, 247, 0.08) inset,
      0 0 22px rgba(34, 211, 238, 0.08);
    color: rgba(230, 221, 255, 0.84);
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 8px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    white-space: nowrap;
    opacity: 0.78;
    backdrop-filter: blur(8px);
    animation: snippetFloat 6.8s ease-in-out infinite;
    pointer-events: none;
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

  @keyframes snippetFloat {
    0%, 100% { transform: translate(-50%, -50%) rotate(var(--snippet-rotate, 0deg)) translateY(0); }
    50% { transform: translate(-50%, -50%) rotate(var(--snippet-rotate, 0deg)) translateY(-8px); }
  }

  @keyframes nebulaDrift {
    from { transform: translateY(-50%) translateX(0) scale(1); }
    to { transform: translateY(-50%) translateX(-30px) scale(1.04); }
  }

  @media (max-width: 1023px) {
    .hero-cosmos--planet {
      min-height: clamp(260px, 50vw, 380px);
    }

    .planet-glow {
      right: 50%;
      top: 42%;
      width: min(78vw, 420px);
      height: min(78vw, 420px);
      transform: translate(50%, -50%);
      filter: blur(48px);
    }

    .planet-code-cloud {
      display: none;
    }

    .planet-canvas-shell {
      position: relative;
      right: auto;
      top: auto;
      transform: none;
      width: min(100%, 360px);
      margin-left: auto;
      margin-right: auto;
    }

    .hero-nebula {
      right: -18%;
      width: 900px;
      height: 760px;
      filter: blur(130px);
    }

    .hero-circuit-trace:nth-of-type(n + 5),
    .hero-hud-arc--three {
      display: none;
    }

    .planet-code-snippet:nth-of-type(n + 5) { display: none; }
  }

  @media (max-width: 640px) {
    .hero-nebula {
      right: -38%;
      width: 720px;
      height: 620px;
      filter: blur(115px);
    }

    .hero-hud-arc,
    .hero-circuit-trace:nth-of-type(n + 4) {
      display: none;
    }

    .planet-canvas-shell {
      width: min(100%, 360px);
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
