"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { shouldReduceMotion } from "@/lib/gsap-plugins";

const inkWashVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const inkWashFragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform float uTime;
  uniform vec3 uAccent;
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform float uDark;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = m * p;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;

    vec2 p = uv * vec2(1.15, 1.0) + vec2(uTime * 0.012, uTime * 0.009);
    float n = fbm(p * 2.2 + fbm(p * 6.0 + uTime * 0.05) * 0.35);

    float wash = smoothstep(0.15, 0.95, sin((uv.x * 1.15 + uv.y) * 6.28318 + uTime * 0.12) * 0.5 + 0.5);
    wash = mix(wash, n, 0.55);

    vec3 base = mix(uPaper, uInk, mix(0.06, 0.22, uDark));
    vec3 mist = mix(base, uAccent, mix(0.10, 0.18, uDark) * wash);
    mist = mix(mist, uInk, (n - 0.45) * mix(0.10, 0.16, uDark));

    vec2 q = uv - 0.5;
    float vign = smoothstep(0.95, 0.20, dot(q, q));
    mist *= mix(0.86, 0.72, uDark) + vign * mix(0.14, 0.28, uDark);

    float g = hash(uv * 1200.0 + uTime);
    mist += (g - 0.5) * mix(0.012, 0.020, uDark);

    gl_FragColor = vec4(mist, mix(0.22, 0.30, uDark));
  }
`;

function FullscreenInkWash({
  ink,
  accent,
  paper,
  isDark,
  paused,
}: {
  ink: string;
  accent: string;
  paper: string;
  isDark: boolean;
  paused: boolean;
}) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color(accent) },
      uInk: { value: new THREE.Color(ink) },
      uPaper: { value: new THREE.Color(paper) },
      uDark: { value: isDark ? 1.0 : 0.0 },
    }),
    [accent, ink, paper],
  );

  useEffect(() => {
    uniforms.uAccent.value.set(accent);
    uniforms.uInk.value.set(ink);
    uniforms.uPaper.value.set(paper);
    uniforms.uDark.value = isDark ? 1.0 : 0.0;
  }, [accent, ink, isDark, paper, uniforms]);

  useFrame((state) => {
    if (paused) return;
    uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1000}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={inkWashVertexShader}
        fragmentShader={inkWashFragmentShader}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function SoftOrbs({ ink, accent }: { ink: string; accent: string }) {
  const colors = useMemo(() => {
    const c0 = new THREE.Color(accent);
    const c1 = new THREE.Color(ink).offsetHSL(0.08, -0.18, 0.22);
    const c2 = new THREE.Color(accent).offsetHSL(-0.12, -0.1, 0.15);
    return [c0, c1, c2] as const;
  }, [accent, ink]);

  return (
    <group position={[0, 0, 0]} renderOrder={-900}>
      <Float speed={0.55} rotationIntensity={0.35} floatIntensity={0.45}>
        <mesh position={[-1.2, 0.55, -1.8]}>
          <sphereGeometry args={[0.9, 40, 40]} />
          <meshStandardMaterial
            color={colors[0]}
            roughness={0.55}
            metalness={0.05}
            transparent
            opacity={0.55}
            depthWrite={false}
          />
        </mesh>
      </Float>
      <Float speed={0.4} rotationIntensity={0.25} floatIntensity={0.55}>
        <mesh position={[1.35, -0.1, -2.1]}>
          <sphereGeometry args={[1.05, 40, 40]} />
          <meshStandardMaterial
            color={colors[1]}
            roughness={0.62}
            metalness={0.04}
            transparent
            opacity={0.45}
            depthWrite={false}
          />
        </mesh>
      </Float>
      <Float speed={0.6} rotationIntensity={0.28} floatIntensity={0.4}>
        <mesh position={[0.2, -0.95, -1.4]}>
          <sphereGeometry args={[0.72, 40, 40]} />
          <meshStandardMaterial
            color={colors[2]}
            roughness={0.58}
            metalness={0.06}
            transparent
            opacity={0.42}
            depthWrite={false}
          />
        </mesh>
      </Float>
    </group>
  );
}

function useHtmlDarkMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const read = () => {
      if (typeof document === "undefined") return;
      setDark(document.documentElement.classList.contains("dark"));
    };

    read();

    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onMq = () => read();
    mq?.addEventListener?.("change", onMq);

    return () => {
      obs.disconnect();
      mq?.removeEventListener?.("change", onMq);
    };
  }, []);

  return dark;
}

export function BlogSceneBackdrop({
  ink,
  accent,
  paper,
}: {
  ink: string;
  accent: string;
  paper: string;
}) {
  const reduce = shouldReduceMotion();
  const isDark = useHtmlDarkMode();

  const cssPaperWash = useMemo(() => {
    // Extra “print shop” atmosphere on top of the shader (cheap + crisp).
    const washA = `radial-gradient(1200px 720px at 18% 10%, color-mix(in oklab, ${accent} ${isDark ? "18%" : "22%"}, transparent) 0%, transparent 62%)`;
    const washB = `radial-gradient(980px 640px at 92% 86%, color-mix(in oklab, var(--glow-2) ${isDark ? "16%" : "18%"}, transparent) 0%, transparent 64%)`;
    const washC = `radial-gradient(900px 520px at 52% 42%, color-mix(in oklab, ${paper} ${isDark ? "10%" : "14%"}, transparent) 0%, transparent 68%)`;
    const grid = `repeating-linear-gradient(90deg, color-mix(in oklab, var(--foreground) ${isDark ? "7%" : "6%"}, transparent) 0px, transparent 1px, transparent 56px)`;
    const grid2 = `repeating-linear-gradient(0deg, color-mix(in oklab, var(--foreground) ${isDark ? "6%" : "5%"}, transparent) 0px, transparent 1px, transparent 56px)`;
    const vignette = `radial-gradient(closest-side, transparent 0%, color-mix(in oklab, var(--foreground) ${isDark ? "22%" : "10%"}, transparent) 120%)`;
    return `${washA}, ${washB}, ${washC}, ${grid}, ${grid2}, ${vignette}`;
  }, [accent, isDark, paper]);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* base wash */}
      <div
        className="absolute inset-0"
        style={{
          background: cssPaperWash,
          opacity: isDark ? 0.92 : 0.96,
        }}
      />

      {/* paper fiber + speckle (pure CSS) */}
      <div
        className="absolute inset-0 opacity-[0.14] mix-blend-multiply dark:opacity-[0.18] dark:mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />

      {/* subtle horizon band */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.55]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, color-mix(in oklab, var(--foreground) 6%, transparent) 52%, transparent 100%)",
        }}
      />

      {reduce ? null : (
        <div className="absolute inset-0 opacity-[0.62] [mask-image:radial-gradient(closest-side,black,transparent)]">
          <Canvas
            dpr={[1, 1.5]}
            orthographic
            camera={{ position: [0, 0, 1], zoom: 1, near: 0.1, far: 10 }}
            gl={{
              antialias: false,
              alpha: true,
              powerPreference: "high-performance",
              stencil: false,
              depth: false,
            }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
            }}
          >
            <FullscreenInkWash ink={ink} accent={accent} paper={paper} isDark={isDark} paused={reduce} />
            <ambientLight intensity={0.75} color={new THREE.Color(ink).offsetHSL(0, 0, 0.55)} />
            <directionalLight position={[3, 4, 2]} intensity={1.05} color={new THREE.Color(accent)} />
            <SoftOrbs ink={ink} accent={accent} />
          </Canvas>
        </div>
      )}
    </div>
  );
}
