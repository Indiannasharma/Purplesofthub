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

const ACCENTS: Record<Accent, string> = {
  purple: "#A855F7",
  cyan: "#22D3EE",
  pink: "#EC4899",
};

// Reduced from 96 to 40 stars for cleaner starfield
const STARS: StarConfig[] = Array.from({ length: 40 }, (_, index) => ({
  left: (index * 19) % 100,
  top: (index * 37) % 100,
  size: index % 7 === 0 ? 2 : 1,
  duration: 3.2 + (index % 6) * 0.8,
  delay: (index % 9) * 0.35,
  darkOpacity: 0.18 + (index % 5) * 0.045,
  lightOpacity: 0.1 + (index % 4) * 0.03,
}));

// Reduced to 5 particles for cleaner look
const PARTICLES: ParticleConfig[] = [
  { left: 15, top: 44, size: 4, accent: "purple", duration: 8, delay: 0.2, drift: 18 },
  { left: 22, top: 28, size: 6, accent: "cyan", duration: 10.5, delay: 1.4, drift: 26 },
  { left: 61, top: 26, size: 6, accent: "purple", duration: 9.7, delay: 0.6, drift: 22 },
  { left: 78, top: 34, size: 7, accent: "pink", duration: 10.8, delay: 2.2, drift: 26 },
  { left: 85, top: 64, size: 4, accent: "cyan", duration: 8.7, delay: 1.5, drift: 18 },
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
  const stars = useMemo(() => (isDark ? STARS : STARS.slice(0, 20)), [isDark]);

  if (variant === "backdrop") {
    return (
      <div className="hero-cosmos hero-cosmos--backdrop" aria-hidden="true">
        <div className="hero-nebula" style={{ opacity: isDark ? 0.62 : 0.28 }} />

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

        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="hero-cosmos hero-cosmos--planet" aria-hidden="true">
      <div className="planet-glow" style={{ opacity: isDark ? 0.68 : 0.36 }} />

      <div className="planet-canvas-shell">
        <Canvas
          camera={{ position: [0, 0.08, 3.7], fov: 38 }}
          dpr={[1, 2]}
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

  .hero-star {
    position: absolute;
    border-radius: 999px;
    opacity: var(--star-min, 0.2);
    animation: starTwinkle 5s ease-in-out infinite;
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
  }

  @media (max-width: 640px) {
    .hero-nebula {
      right: -38%;
      width: 720px;
      height: 620px;
      filter: blur(115px);
    }

    .planet-canvas-shell {
      width: min(100%, 360px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-nebula,
    .hero-star,
    .planet-spark {
      animation: none !important;
    }
  }
`;