"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from "react";
import { shouldReduceMotion } from "@/lib/gsap-plugins";

export type CabinDoorHudPct = {
  top: number;
  left: number;
  visible: boolean;
};

/**
 * Door knob in portal group's local space: leaf origin [-0.17, 0, 0.055] + knob [0.29, -0.02, 0.03].
 * (Previously y≈−0.35 sat on the slab bottom and read as ground — align with modeled handle.)
 */
const DOOR_HANDLE_PORTAL_LOCAL = new THREE.Vector3(0.32, -0.02, 0.088);

type AboutVillageThreeSceneProps = {
  className?: string;
  enterCabin?: boolean;
  /** Mirrors `Scene` blackout (full dark cabin) — use to overlay HTML UI. */
  onInteriorBlackout?: (active: boolean) => void;
  /**
   * Fired ~every frame while the hut is visible. Drive an HTML hotspot with `%` positions
   * so it stays glued to the 3D door (CSS transforms on the canvas stack no longer mismatch).
   */
  onDoorHud?: (pct: CabinDoorHudPct) => void;
};

export function AboutVillageThreeScene({
  className,
  enterCabin = false,
  onInteriorBlackout,
  onDoorHud,
}: AboutVillageThreeSceneProps) {
  const reduce = shouldReduceMotion();
  const isDark = useIsDarkMode();

  return (
    <div className={className} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 2.15, 10.5], fov: 38, near: 0.1, far: 120 }}
        frameloop="always"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        onCreated={({ gl }) => {
          // Lift the scene without making it "flat".
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <Scene
          reduceMotion={reduce}
          isDark={isDark}
          enterCabin={enterCabin}
          onInteriorBlackout={onInteriorBlackout}
          onDoorHud={onDoorHud}
        />
      </Canvas>
    </div>
  );
}

function makeCabinSmokeVignetteTexture() {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  const cx = size * 0.5;
  const cy = size * 0.52;
  const g = ctx.createRadialGradient(cx, cy, size * 0.07, cx, cy, size * 0.64);
  g.addColorStop(0, "rgba(22,17,14,0)");
  g.addColorStop(0.32, "rgba(14,11,9,0.1)");
  g.addColorStop(0.58, "rgba(9,7,6,0.38)");
  g.addColorStop(0.82, "rgba(5,4,3,0.62)");
  g.addColorStop(1, "rgba(3,2,2,0.78)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

function CabinApproachSmoke({ active, durationMs }: { active: boolean; durationMs: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (active) startedAt.current = performance.now();
    else startedAt.current = null;
  }, [active]);

  const map = useMemo(() => makeCabinSmokeVignetteTexture(), []);
  useEffect(() => () => map?.dispose(), [map]);

  const { camera } = useThree();

  useFrame(() => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat || !map) return;

    if (!active || startedAt.current === null) {
      mesh.visible = false;
      mat.opacity = 0;
      return;
    }

    const persp = camera as THREE.PerspectiveCamera;
    if (!persp.isPerspectiveCamera) return;

    const elapsed = performance.now() - startedAt.current;
    const t = THREE.MathUtils.clamp(elapsed / durationMs, 0, 1);
    const ramp = THREE.MathUtils.smoothstep(t, 0.04, 0.93);
    const hazePulse = Math.sin(t * Math.PI) * 0.07;
    mat.opacity = THREE.MathUtils.clamp(ramp * 0.64 + hazePulse, 0, 0.92);

    mesh.visible = true;
    const dist = persp.near + 0.34;
    mesh.position.copy(camera.position);
    mesh.quaternion.copy(camera.quaternion);
    mesh.translateZ(-dist);

    const vFov = THREE.MathUtils.degToRad(persp.fov);
    const hh = Math.tan(vFov / 2) * dist * 2.06;
    const ww = hh * persp.aspect;
    mesh.scale.set(Math.max(ww, 1e-4), Math.max(hh, 1e-4), 1);
  });

  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={998}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={matRef}
        map={map}
        transparent
        opacity={0}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}

function Scene({
  reduceMotion,
  isDark,
  enterCabin,
  onInteriorBlackout,
  onDoorHud,
}: {
  reduceMotion: boolean;
  isDark: boolean;
  enterCabin: boolean;
  onInteriorBlackout?: (active: boolean) => void;
  onDoorHud?: (pct: CabinDoorHudPct) => void;
}) {
  const { viewport, gl, invalidate } = useThree();
  const doorPortalRef = useRef<THREE.Group>(null);
  const doorLeafRef = useRef<THREE.Group>(null);
  const doorHudCbRef = useRef<((pct: CabinDoorHudPct) => void) | undefined>(undefined);
  doorHudCbRef.current = onDoorHud;
  const [interiorBlackout, setInteriorBlackoutInner] = useState(false);

  const setInteriorBlackout = useCallback(
    (next: boolean) => {
      setInteriorBlackoutInner(next);
      onInteriorBlackout?.(next);
    },
    [onInteriorBlackout],
  );

  useEffect(() => {
    invalidate();
  }, [enterCabin, interiorBlackout, invalidate]);

  useEffect(() => {
    const base = isDark ? 1.05 : 1.55;
    if (interiorBlackout) {
      gl.toneMappingExposure = isDark ? 0.17 : 0.22;
      return;
    }
    if (enterCabin) {
      gl.toneMappingExposure = base * (isDark ? 0.52 : 0.6);
      return;
    }
    gl.toneMappingExposure = base;
  }, [gl, isDark, enterCabin, interiorBlackout]);

  const palette = useMemo(() => {
    if (isDark) {
      return {
        bg: new THREE.Color("#0b1016"),
        fog: new THREE.Color("#0b1016"),
        skyTop: "#151e28",
        skyBottom: "#070b10",
        horizonGlow: "#ffb36b",
        hemiSky: "#cbb58e",
        hemiGround: "#070a0c",
        sun: "#ffd8a8",
        moon: "#7aa2ff",
        walker: "#cfc4b2",
        ground: "#0a0f14",
        soil: "#1a1f25",
        rock: "#4a4f57",
        leaf: "#6ea542",
        leaf2: "#86c051",
        wood: "#7a5633",
        hut: "#6b4a2a",
        roof: "#8b6238",
      };
    }
    return {
      // Light mode: creamy sky, ink silhouettes.
      bg: new THREE.Color("#e9decd"),
      fog: new THREE.Color("#e9decd"),
      skyTop: "#f6efe4",
      skyBottom: "#e7d6c0",
      horizonGlow: "#e9a35a",
      hemiSky: "#fff3e4",
      hemiGround: "#d4c0a7",
      sun: "#ffd3a3",
      moon: "#9db8ff",
      walker: "#2a2620",
      ground: "#d6c4b0",
      soil: "#c9b29b",
      rock: "#a9a29a",
      leaf: "#88c94e",
      leaf2: "#a4df63",
      wood: "#8a5c33",
      hut: "#7a4e2c",
      roof: "#9a6a3a",
    };
  }, [isDark]);

  const approachAtmosphere = enterCabin && !interiorBlackout;

  const sceneBackground = useMemo(() => {
    if (interiorBlackout) return new THREE.Color("#030201");
    if (approachAtmosphere) {
      const c = palette.bg.clone();
      c.lerp(new THREE.Color(isDark ? "#060403" : "#100d0a"), 0.62);
      return c;
    }
    return palette.bg;
  }, [interiorBlackout, approachAtmosphere, palette.bg, isDark]);

  const fogParams = useMemo(() => {
    if (interiorBlackout) return null;
    if (approachAtmosphere) {
      const c = palette.fog.clone();
      c.lerp(new THREE.Color(isDark ? "#0a0806" : "#16120f"), 0.78);
      return { color: c, density: isDark ? 0.125 : 0.092 } as const;
    }
    return { color: palette.fog, density: isDark ? 0.06 : 0.03 } as const;
  }, [interiorBlackout, approachAtmosphere, palette.fog, isDark]);

  const lightScale = approachAtmosphere ? 0.38 : 1;

  return (
    <>
      <color attach="background" args={[sceneBackground]} />
      {!interiorBlackout && fogParams ? (
        <fogExp2 attach="fog" args={[fogParams.color, fogParams.density]} />
      ) : null}

      {!interiorBlackout && (
        <SkyGradient
          top={palette.skyTop}
          bottom={palette.skyBottom}
          glow={palette.horizonGlow}
          isDark={isDark}
        />
      )}

      {!interiorBlackout && (
        <>
          {/* Lights: dusk horizon */}
          <hemisphereLight
            args={[palette.hemiSky, palette.hemiGround, (isDark ? 0.95 : 1.1) * lightScale]}
          />
          <directionalLight
            position={[7, 9, 6]}
            intensity={(isDark ? 1.05 : 1.25) * lightScale}
            color={palette.sun}
          />
          <directionalLight
            position={[-10, 6, -8]}
            intensity={(isDark ? 0.55 : 0.6) * lightScale}
            color={palette.moon}
          />
          <directionalLight
            position={[0, 3, -18]}
            intensity={(isDark ? 0.75 : 0.55) * lightScale}
            color={palette.horizonGlow}
          />
        </>
      )}

      <group visible={!interiorBlackout}>
        <LowPolyVillage
          palette={palette}
          reduceMotion={reduceMotion}
          isDark={isDark}
          enterCabin={enterCabin}
          doorPortalRef={doorPortalRef}
          doorLeafRef={doorLeafRef}
        />

        <Birds
          enabled={!reduceMotion && !enterCabin}
          color={isDark ? "rgba(255,255,255,0.55)" : "rgba(20,17,13,0.55)"}
        />

        {!enterCabin ? (
        <Sparkles
          count={48}
          speed={0}
          size={1.8}
          opacity={isDark ? 0.18 : 0.12}
          color={palette.sun}
          scale={[Math.max(18, viewport.width * 1.8), 6, 14]}
          position={[0, 1.0, -4]}
          noise={0.8}
        />
        ) : null}
      </group>

      {interiorBlackout && <InteriorBlackSphere />}
      {!interiorBlackout && approachAtmosphere ? (
        <CabinApproachSmoke active={!reduceMotion} durationMs={520} />
      ) : null}

      <CabinCameraRig
        reduceMotion={reduceMotion}
        enterCabin={enterCabin}
        doorPortal={doorPortalRef}
        doorLeaf={doorLeafRef}
        setInteriorBlackout={setInteriorBlackout}
      />

      <DoorHudProjector
        portalRef={doorPortalRef}
        doorHudCbRef={doorHudCbRef}
        active={Boolean(onDoorHud) && !enterCabin && !interiorBlackout}
      />
    </>
  );
}

function DoorHudProjector({
  portalRef,
  doorHudCbRef,
  active,
}: {
  portalRef: RefObject<THREE.Group | null>;
  doorHudCbRef: MutableRefObject<((pct: CabinDoorHudPct) => void) | undefined>;
  active: boolean;
}) {
  const cam = useThree((s) => s.camera);
  const vScratch = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const cb = doorHudCbRef.current;
    if (!active || !cb) return;

    const portal = portalRef.current;
    if (!portal) return;

    vScratch.copy(DOOR_HANDLE_PORTAL_LOCAL);
    portal.localToWorld(vScratch);

    const persp = cam instanceof THREE.PerspectiveCamera ? cam : null;
    if (!persp) return;

    vScratch.project(persp);
    const inFrustum =
      Number.isFinite(vScratch.z) &&
      Math.abs(vScratch.z) <= 1.015 &&
      Math.abs(vScratch.x) <= 1.015 &&
      Math.abs(vScratch.y) <= 1.015;

    const leftPct = THREE.MathUtils.clamp(((vScratch.x + 1) / 2) * 100, -6, 106);
    const topPct = THREE.MathUtils.clamp(((1 - vScratch.y) / 2) * 100, -6, 106);
    cb({ top: topPct, left: leftPct, visible: inFrustum });
  });

  return null;
}

function InteriorBlackSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    meshRef.current?.position.copy(camera.position);
  });
  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={1000}>
      <sphereGeometry args={[240, 32, 24]} />
      <meshBasicMaterial
        color="#050403"
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function CabinCameraRig({
  reduceMotion,
  enterCabin,
  doorPortal,
  doorLeaf,
  setInteriorBlackout,
}: {
  reduceMotion: boolean;
  enterCabin: boolean;
  doorPortal: RefObject<THREE.Group | null>;
  doorLeaf: RefObject<THREE.Group | null>;
  setInteriorBlackout: (next: boolean) => void;
}) {
  const { camera } = useThree();
  const perspectiveCamera =
    (camera as THREE.PerspectiveCamera | undefined)?.isPerspectiveCamera ? (camera as THREE.PerspectiveCamera) : null;
  const camLook = useRef(new THREE.Vector3(0, 0.9, 0));
  const enteredAtMs = useRef<number | null>(null);
  const blackoutLatched = useRef(false);
  const enterFromPos = useRef(new THREE.Vector3());
  const enterFromLook = useRef(new THREE.Vector3(0, 0.9, 0));
  const enterFromFov = useRef<number>(perspectiveCamera?.fov ?? 38);

  const vDoor = useMemo(() => new THREE.Vector3(), []);
  const qDoor = useMemo(() => new THREE.Quaternion(), []);
  const vDir = useMemo(() => new THREE.Vector3(), []);
  const vUp = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const vTargetPos = useMemo(() => new THREE.Vector3(), []);
  const vTargetLook = useMemo(() => new THREE.Vector3(), []);
  const vBasePos = useMemo(() => new THREE.Vector3(0, 2.15, 10.5), []);
  const vBaseLook = useMemo(() => new THREE.Vector3(0, 0.9, 0), []);

  useEffect(() => {
    if (enterCabin) {
      enteredAtMs.current = performance.now();
      blackoutLatched.current = false;
      enterFromPos.current.copy(camera.position);
      enterFromLook.current.copy(camLook.current);
      enterFromFov.current = perspectiveCamera?.fov ?? 38;
      setInteriorBlackout(false);
      return;
    }
  }, [enterCabin, setInteriorBlackout]);

  useFrame((_, delta) => {
    const leaf = doorLeaf.current;
    if (leaf) {
      const target = enterCabin ? -1.08 : 0;
      if (reduceMotion) leaf.rotation.y = target;
      else {
        const doorK = enterCabin ? Math.min(1, delta * 20) : 1 - Math.pow(0.001, delta);
        leaf.rotation.y = THREE.MathUtils.lerp(leaf.rotation.y, target, doorK);
      }
    }

    const portal = doorPortal.current;
    if (!portal) return;

    portal.getWorldPosition(vDoor);
    portal.getWorldQuaternion(qDoor);
    vDir.set(0, 0, -1).applyQuaternion(qDoor).normalize();

    if (enterCabin) {
      // Push *through* the doorway so it reads like entering the room.
      vTargetPos.copy(vDoor).addScaledVector(vDir, 2.85).addScaledVector(vUp, -0.06);
      vTargetLook.copy(vDoor).addScaledVector(vDir, 3.45).addScaledVector(vUp, -0.02);
    } else {
      vTargetPos.copy(vBasePos);
      vTargetLook.copy(vBaseLook);
    }

    if (reduceMotion) {
      camera.position.copy(vTargetPos);
      camLook.current.copy(vTargetLook);
      camera.lookAt(camLook.current);
      if (perspectiveCamera) {
        perspectiveCamera.fov = enterCabin ? 28 : 38;
        perspectiveCamera.updateProjectionMatrix();
      }

      if (enterCabin) {
        if (!blackoutLatched.current) {
          blackoutLatched.current = true;
          setInteriorBlackout(true);
        }
      } else if (blackoutLatched.current && camera.position.distanceTo(vBasePos) < 0.36) {
        blackoutLatched.current = false;
        setInteriorBlackout(false);
      }
      return;
    }

    if (enterCabin) {
      const t0 = enteredAtMs.current ?? performance.now();
      const elapsed = performance.now() - t0;
      const t = THREE.MathUtils.clamp(elapsed / 520, 0, 1);
      const ease = t * t * (3 - 2 * t); // smoothstep

      camera.position.lerpVectors(enterFromPos.current, vTargetPos, ease);
      camLook.current.lerpVectors(enterFromLook.current, vTargetLook, ease);
      camera.lookAt(camLook.current);
      if (perspectiveCamera) {
        perspectiveCamera.fov = THREE.MathUtils.lerp(enterFromFov.current, 28, ease);
        perspectiveCamera.updateProjectionMatrix();
      }

      const dSeat = camera.position.distanceTo(vTargetPos);
      const nearSeat = dSeat < 0.12;
      // Let the user perceive the "enter" motion, then black out at the end.
      const blackoutSoon = t > 0.72 || nearSeat;
      if (!blackoutLatched.current && blackoutSoon) {
        blackoutLatched.current = true;
        setInteriorBlackout(true);
      }
      return;
    }

    /** Smooth return outward. */
    const kOutside = 1 - Math.pow(0.0008, delta);
    camera.position.lerp(vTargetPos, kOutside);
    camLook.current.lerp(vTargetLook, kOutside);
    camera.lookAt(camLook.current);
    if (perspectiveCamera) {
      perspectiveCamera.fov = THREE.MathUtils.lerp(perspectiveCamera.fov, 38, kOutside);
      perspectiveCamera.updateProjectionMatrix();
    }

    if (blackoutLatched.current && camera.position.distanceTo(vBasePos) < 0.36) {
      blackoutLatched.current = false;
      setInteriorBlackout(false);
    }
  });

  return null;
}

type BirdSeed = {
  y: number;
  z: number;
  r: number;
  speed: number;
  phase: number;
  amp: number;
  scale: number;
};

function Birds({ enabled, color }: { enabled: boolean; color: string }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);

  const birds = useMemo<BirdSeed[]>(
    () =>
      [
        // nearer flock
        ...new Array(14).fill(0).map((_, i) => ({
          y: 2.75 + (i % 4) * 0.22 + Math.random() * 0.18,
          z: -8.5 - Math.random() * 6.0,
          r: 11.5 + Math.random() * 9.5,
          speed: 0.12 + Math.random() * 0.16,
          phase: Math.random() * Math.PI * 2,
          amp: 0.12 + Math.random() * 0.18,
          scale: 1.0,
        })),
        // distant flock (smaller + slower)
        ...new Array(10).fill(0).map(() => ({
          y: 3.45 + Math.random() * 0.55,
          z: -14.0 - Math.random() * 9.0,
          r: 16 + Math.random() * 14,
          speed: 0.07 + Math.random() * 0.1,
          phase: Math.random() * Math.PI * 2,
          amp: 0.06 + Math.random() * 0.1,
          scale: 0.72,
        })),
      ] satisfies BirdSeed[],
    [],
  );

  useFrame(({ clock }) => {
    if (!enabled) return;
    const m = mesh.current;
    if (!m) return;
    const t = clock.getElapsedTime();

    for (let i = 0; i < birds.length; i++) {
      const b = birds[i];
      const a = t * b.speed + b.phase;
      const x = Math.cos(a) * b.r;
      const z = b.z + Math.sin(a) * b.r;
      const y = b.y + Math.sin(a * 2.0) * b.amp;

      tmp.position.set(x, y, z);
      tmp.rotation.set(0, -a + Math.PI / 2, Math.sin(a * 6.0) * 0.22);
      const s = (0.22 + Math.sin(a * 3.0) * 0.02) * b.scale;
      tmp.scale.set(s, s, s);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  // A tiny “V” bird: very low-poly tetra looks good at this scale.
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, birds.length]} position={[0, 0, 0]}>
      <tetrahedronGeometry args={[0.22, 0]} />
      <meshStandardMaterial color={color} roughness={1} metalness={0} />
    </instancedMesh>
  );
}

function LowPolyVillage({
  palette,
  reduceMotion,
  isDark,
  enterCabin,
  doorPortalRef,
  doorLeafRef,
}: {
  palette: {
    ground: string;
    soil: string;
    rock: string;
    leaf: string;
    leaf2: string;
    wood: string;
    hut: string;
    roof: string;
    walker: string;
    horizonGlow: string;
  };
  reduceMotion: boolean;
  isDark: boolean;
  enterCabin: boolean;
  doorPortalRef: RefObject<THREE.Group | null>;
  doorLeafRef: RefObject<THREE.Group | null>;
}) {
  const group = useRef<THREE.Group>(null);
  const rocks = useRef<THREE.InstancedMesh>(null);
  const grass = useRef<THREE.InstancedMesh>(null);

  const rocksData = useMemo(() => {
    const rng = () => Math.random();
    return new Array(26).fill(0).map(() => ({
      x: -5.2 + rng() * 10.4,
      // Pull rocks forward so they read in the foreground.
      z: -0.2 + rng() * 3.4,
      y: -0.48 + rng() * 0.12,
      s: 0.22 + rng() * 0.72,
      rx: rng() * Math.PI,
      ry: rng() * Math.PI,
      rz: rng() * Math.PI,
    }));
  }, []);

  const grassData = useMemo(() => {
    const rng = () => Math.random();
    return new Array(42).fill(0).map(() => ({
      x: -5.2 + rng() * 10.4,
      z: -0.3 + rng() * 3.8,
      y: -0.53,
      s: 0.08 + rng() * 0.16,
      ry: rng() * Math.PI,
      lean: (rng() - 0.5) * 0.35,
    }));
  }, []);

  useEffect(() => {
    // No moving animation for this section.
    const g = group.current;
    if (g) g.rotation.y = -0.18;
  }, []);

  const terrainMain = {
    w: 16,
    d: 10,
    height: 0.75,
    posY: -0.58,
    posX: 0,
    posZ: 0,
  } as const;

  return (
    <group ref={group} position={[0, -0.75, 0]}>
      {/* Hidden while dipping into cabin — translucent meshes + fog read as crawling “ghost” shapes. */}
      {!enterCabin ? (
        <>
          <mesh position={[0, 1.75, -18]}>
            <planeGeometry args={[60, 20]} />
            <meshBasicMaterial transparent opacity={0.16} color={palette.horizonGlow} />
          </mesh>
          <Mountains color={palette.rock} />
        </>
      ) : null}

      {/* Terrain (filled, organic mound) */}
      <Terrain
        color={palette.ground}
        position={[terrainMain.posX, terrainMain.posY, terrainMain.posZ]}
        size={[terrainMain.w, terrainMain.d]}
        height={terrainMain.height}
      />
      <Terrain
        color={palette.soil}
        position={[0, -0.56, 0.1]}
        size={[13.2, 7.8]}
        height={0.48}
        opacity={0.92}
      />

      {/* Path strip (subtle) */}
      <Terrain
        color={palette.rock}
        position={[0.2, -0.54, 0.8]}
        size={[8.4, 1.9]}
        height={0.16}
        opacity={0.22}
      />

      {/* Deep base fill so bottom never looks empty */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.35, 6]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color={palette.ground} roughness={1} />
      </mesh>

      {/* Rocks (instanced) */}
      <instancedMesh ref={rocks} args={[undefined, undefined, rocksData.length]}>
        <dodecahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color={palette.rock} roughness={1} />
      </instancedMesh>
      <RocksSeed
        rocksRef={rocks}
        data={rocksData}
        terrain={terrainMain}
        excludeNear={ROCKS_EXCLUDE_NEAR_CABIN}
      />

      {/* Grass tufts (instanced) */}
      <instancedMesh ref={grass} args={[undefined, undefined, grassData.length]}>
        <coneGeometry args={[0.12, 0.55, 5]} />
        <meshStandardMaterial color={palette.leaf2} roughness={1} />
      </instancedMesh>
      <GrassSeed
        grassRef={grass}
        data={grassData}
        terrain={terrainMain}
      />

      {/* Cabin (foreground) */}
      <Cabin
        hut={palette.hut}
        roof={palette.roof}
        wood={palette.wood}
        position={[3.4, terrainMain.posY + terrainHeightAt(terrainMain, 3.4, 2.0) + 0.06, 2.0]}
        smokeEnabled={!reduceMotion}
        smokeColor={isDark ? "rgba(255,255,255,0.38)" : "rgba(255,255,255,0.26)"}
        windowGlow={isDark ? 1.15 : 0.35}
        doorPortalRef={doorPortalRef}
        doorLeafRef={doorLeafRef}
        enterCabin={enterCabin}
      />

      {/* Trees (foreground) */}
      <TreeBetter
        leaf={palette.leaf}
        wood={palette.wood}
        position={[-1.6, terrainMain.posY + terrainHeightAt(terrainMain, -1.6, 1.3) + 0.02, 1.3]}
        scale={1.45}
      />
      <TreeBetter
        leaf={palette.leaf2}
        wood={palette.wood}
        position={[-3.2, terrainMain.posY + terrainHeightAt(terrainMain, -3.2, 0.7) + 0.02, 0.7]}
        scale={1.1}
      />
      <TreeBetter
        leaf={palette.leaf}
        wood={palette.wood}
        position={[0.2, terrainMain.posY + terrainHeightAt(terrainMain, 0.2, 0.2) + 0.02, 0.2]}
        scale={1.22}
      />
      <TreeBetter
        leaf={palette.leaf2}
        wood={palette.wood}
        position={[1.6, terrainMain.posY + terrainHeightAt(terrainMain, 1.6, 1.05) + 0.02, 1.05]}
        scale={1.06}
      />
      <TreeBetter
        leaf={palette.leaf}
        wood={palette.wood}
        position={[-0.2, terrainMain.posY + terrainHeightAt(terrainMain, -0.2, 2.1) + 0.02, 2.1]}
        scale={1.1}
      />
      <TreeBetter
        leaf={palette.leaf2}
        wood={palette.wood}
        position={[4.9, terrainMain.posY + terrainHeightAt(terrainMain, 4.9, 0.9) + 0.02, 0.9]}
        scale={1.02}
      />
    </group>
  );
}

function Mountains({ color }: { color: string }) {
  return (
    <group position={[0, -0.2, -16]}>
      <mesh position={[-4.8, 1.25, -5]} rotation={[0.12, -0.5, 0]}>
        <icosahedronGeometry args={[3.6, 0]} />
        <meshStandardMaterial color={color} roughness={1} opacity={0.14} transparent />
      </mesh>
      <mesh position={[1.2, 1.05, -5.8]} rotation={[-0.08, 0.65, 0]}>
        <icosahedronGeometry args={[4.2, 0]} />
        <meshStandardMaterial color={color} roughness={1} opacity={0.12} transparent />
      </mesh>
      <mesh position={[6.2, 1.2, -5.2]} rotation={[0.06, 0.15, 0]}>
        <icosahedronGeometry args={[3.2, 0]} />
        <meshStandardMaterial color={color} roughness={1} opacity={0.1} transparent />
      </mesh>
    </group>
  );
}

function Terrain({
  color,
  position,
  size,
  height,
  opacity,
}: {
  color: string;
  position: [number, number, number];
  size: [number, number];
  height: number;
  opacity?: number;
}) {
  const geom = useMemo(() => {
    const [w, d] = size;
    const segW = 42;
    const segD = 28;
    const g = new THREE.PlaneGeometry(w, d, segW, segD);
    const pos = g.attributes.position as THREE.BufferAttribute;

    // Low-poly-ish displacement: a mound + a few bumps.
    const bumps = [
      { x: -0.22, z: -0.08, r: 0.55, a: 0.85 },
      { x: 0.28, z: -0.16, r: 0.5, a: 0.75 },
      { x: 0.06, z: 0.22, r: 0.62, a: 0.65 },
    ];

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i); // plane's local Y maps to "depth" before rotation
      const nx = x / w;
      const nz = z / d;
      const rr = Math.sqrt(nx * nx + nz * nz);
      let y = Math.max(0, 1 - rr * 1.35);
      // Add bumps in normalized space.
      for (const b of bumps) {
        const dx = nx - b.x;
        const dz = nz - b.z;
        const r2 = (dx * dx + dz * dz) / (b.r * b.r);
        y += Math.exp(-r2 * 3.2) * b.a;
      }
      // Sharpen facets a bit.
      y = Math.pow(y, 1.25);
      pos.setZ(i, y * height);
    }

    g.computeVertexNormals();
    return g;
  }, [size, height]);

  return (
    <mesh geometry={geom} rotation-x={-Math.PI / 2} position={position}>
      <meshStandardMaterial
        color={color}
        roughness={1}
        transparent={opacity != null && opacity < 1}
        opacity={opacity ?? 1}
      />
    </mesh>
  );
}

function terrainHeightAt(
  terrain: { w: number; d: number; height: number; posX: number; posZ: number },
  worldX: number,
  worldZ: number,
) {
  const nx = (worldX - terrain.posX) / terrain.w;
  const nz = (worldZ - terrain.posZ) / terrain.d;
  const rr = Math.sqrt(nx * nx + nz * nz);
  let y = Math.max(0, 1 - rr * 1.35);
  const bumps = [
    { x: -0.22, z: -0.08, r: 0.55, a: 0.85 },
    { x: 0.28, z: -0.16, r: 0.5, a: 0.75 },
    { x: 0.06, z: 0.22, r: 0.62, a: 0.65 },
  ];
  for (const b of bumps) {
    const dx = nx - b.x;
    const dz = nz - b.z;
    const r2 = (dx * dx + dz * dz) / (b.r * b.r);
    y += Math.exp(-r2 * 3.2) * b.a;
  }
  y = Math.pow(y, 1.25);
  return y * terrain.height;
}

/** Local `LowPolyVillage` xz space (instances share the group's rotation). */
const ROCKS_EXCLUDE_NEAR_CABIN = { x: 3.4, z: 2.0, rx: 1.55, rz: 1.25, pad: 0.55 } as const;

function RocksSeed({
  rocksRef,
  data,
  terrain,
  excludeNear,
}: {
  rocksRef: React.RefObject<THREE.InstancedMesh | null>;
  data: Array<{ x: number; y: number; z: number; s: number; rx: number; ry: number; rz: number }>;
  terrain: { w: number; d: number; height: number; posX: number; posZ: number; posY: number };
  /**
   * `LowPolyVillage` rotates its whole subtree; instanced placements share that transform.
   * Use this to gently push rocks away from the cabin footprint in *local* village space.
   */
  excludeNear?: { x: number; z: number; rx: number; rz: number; pad: number };
}) {
  const o = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    const inst = rocksRef.current;
    if (!inst) return;
    for (let i = 0; i < data.length; i++) {
      const d = data[i]!;
      let px = d.x;
      let pz = d.z;
      if (excludeNear) {
        const dx = (px - excludeNear.x) / excludeNear.rx;
        const dz = (pz - excludeNear.z) / excludeNear.rz;
        const e2 = dx * dx + dz * dz;
        if (e2 < 1) {
          const len = Math.sqrt(Math.max(e2, 1e-6));
          const push = (1 - len) * excludeNear.pad;
          px += (dx / len) * push;
          pz += (dz / len) * push;
        }
      }

      const y = terrain.posY + terrainHeightAt(terrain, px, pz) + 0.04;
      o.position.set(px, y, pz);
      o.scale.setScalar(d.s * 1.08);
      o.rotation.set(d.rx, d.ry, d.rz);
      o.updateMatrix();
      inst.setMatrixAt(i, o.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rocksRef,
    o,
    data.length,
    terrain.w,
    terrain.d,
    terrain.height,
    terrain.posX,
    terrain.posY,
    terrain.posZ,
    excludeNear?.x,
    excludeNear?.z,
    excludeNear?.rx,
    excludeNear?.rz,
    excludeNear?.pad,
  ]);
  return null;
}

function GrassSeed({
  grassRef,
  data,
  terrain,
}: {
  grassRef: React.RefObject<THREE.InstancedMesh | null>;
  data: Array<{ x: number; y: number; z: number; s: number; ry: number; lean: number }>;
  terrain: { w: number; d: number; height: number; posX: number; posZ: number; posY: number };
}) {
  const o = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    const inst = grassRef.current;
    if (!inst) return;
    for (let i = 0; i < data.length; i++) {
      const d = data[i]!;
      const y = terrain.posY + terrainHeightAt(terrain, d.x, d.z) + 0.02;
      o.position.set(d.x, y, d.z);
      o.scale.set(d.s, d.s * 1.6, d.s);
      o.rotation.set(d.lean, d.ry, 0);
      o.updateMatrix();
      inst.setMatrixAt(i, o.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    grassRef,
    o,
    data.length,
    terrain.w,
    terrain.d,
    terrain.height,
    terrain.posX,
    terrain.posY,
    terrain.posZ,
  ]);
  return null;
}

function Rock({
  color,
  position,
  scale,
}: {
  color: string;
  position: [number, number, number];
  scale: number;
}) {
  return (
    <mesh position={position} scale={scale} rotation={[0.2, 0.6, -0.1]}>
      <dodecahedronGeometry args={[0.55, 0]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

function TreeBetter({
  leaf,
  wood,
  position,
  scale,
}: {
  leaf: string;
  wood: string;
  position: [number, number, number];
  scale: number;
}) {
  return (
    <group position={position} scale={scale}>
      {/* trunk */}
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.09, 0.14, 0.8, 6]} />
        <meshStandardMaterial color={wood} roughness={1} />
      </mesh>
      {/* branches */}
      <mesh position={[0.16, 0.63, 0.05]} rotation={[0.2, 0, -0.65]}>
        <cylinderGeometry args={[0.04, 0.06, 0.42, 5]} />
        <meshStandardMaterial color={wood} roughness={1} />
      </mesh>
      <mesh position={[-0.18, 0.62, -0.02]} rotation={[-0.15, 0, 0.7]}>
        <cylinderGeometry args={[0.04, 0.06, 0.44, 5]} />
        <meshStandardMaterial color={wood} roughness={1} />
      </mesh>
      {/* canopy clusters */}
      <mesh position={[0, 0.98, 0]}>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color={leaf} roughness={0.98} />
      </mesh>
      <mesh position={[0.48, 0.92, -0.12]} rotation={[0.2, 0.3, 0]}>
        <icosahedronGeometry args={[0.46, 0]} />
        <meshStandardMaterial color={leaf} roughness={0.98} />
      </mesh>
      <mesh position={[-0.46, 0.9, 0.12]} rotation={[-0.15, -0.25, 0]}>
        <icosahedronGeometry args={[0.48, 0]} />
        <meshStandardMaterial color={leaf} roughness={0.98} />
      </mesh>
      <mesh position={[0.1, 1.26, 0.18]} rotation={[0.1, -0.2, 0]}>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color={leaf} roughness={0.98} />
      </mesh>
    </group>
  );
}

function Cabin({
  hut,
  roof,
  wood,
  position,
  smokeEnabled,
  smokeColor,
  windowGlow,
  doorPortalRef,
  doorLeafRef,
  enterCabin,
}: {
  hut: string;
  roof: string;
  wood: string;
  position: [number, number, number];
  smokeEnabled: boolean;
  smokeColor: string;
  windowGlow: number;
  doorPortalRef?: RefObject<THREE.Group | null>;
  doorLeafRef?: RefObject<THREE.Group | null>;
  enterCabin: boolean;
}) {
  return (
    <group position={position} rotation={[0, 0.18, 0]}>
      {/* base deck */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[2.0, 0.12, 1.4]} />
        <meshStandardMaterial color={wood} roughness={1} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.7, 0.9, 1.15]} />
        <meshStandardMaterial color={hut} roughness={1} />
      </mesh>
      {/* log ribs */}
      {new Array(6).fill(0).map((_, i) => (
        <mesh key={i} position={[0, 0.02 + i * 0.12, 0.58]}>
          <boxGeometry args={[1.72, 0.05, 0.06]} />
          <meshStandardMaterial color={wood} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 0.82, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.25, 0.85, 4]} />
        <meshStandardMaterial color={roof} roughness={1} />
      </mesh>
      {/* roof plank lines */}
      {new Array(5).fill(0).map((_, i) => (
        <mesh key={`plank-${i}`} position={[0, 0.92 - i * 0.12, 0]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[1.55, 0.03, 0.03]} />
          <meshStandardMaterial color={wood} roughness={1} />
        </mesh>
      ))}
      {/* Door + window on the camera-facing wall (the one you actually see) */}
      <group position={[0, 0, 0.605]}>
        {/* WINDOW (left): frame + glass + interior glow — not a solid wall patch */}
        <group position={[0.14, 0.32, 0.055]}>
          {/* Warm interior (recessed “room”) */}
          <mesh position={[0, 0, -0.045]}>
            <planeGeometry args={[0.36, 0.22]} />
            <meshStandardMaterial
              color={"#1a140f"}
              roughness={1}
              metalness={0}
              emissive={"#ffd7a6"}
              emissiveIntensity={windowGlow * 0.22}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Wood frame (opening, not a filled rectangle) */}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.52, 0.045, 0.075]} />
            <meshStandardMaterial color={wood} roughness={0.92} metalness={0} />
          </mesh>
          <mesh position={[0, -0.2, 0.012]}>
            <boxGeometry args={[0.54, 0.055, 0.09]} />
            <meshStandardMaterial color={wood} roughness={0.92} metalness={0} />
          </mesh>
          <mesh position={[-0.242, 0, 0]}>
            <boxGeometry args={[0.046, 0.36, 0.075]} />
            <meshStandardMaterial color={wood} roughness={0.92} metalness={0} />
          </mesh>
          <mesh position={[0.242, 0, 0]}>
            <boxGeometry args={[0.046, 0.36, 0.075]} />
            <meshStandardMaterial color={wood} roughness={0.92} metalness={0} />
          </mesh>

          {/* Glass pane */}
          <mesh position={[0, 0, 0.036]}>
            <boxGeometry args={[0.39, 0.25, 0.012]} />
            <meshPhysicalMaterial
              color={"#d6e8ff"}
              roughness={0.12}
              metalness={0}
              transmission={0.88}
              thickness={0.08}
              transparent
              toneMapped={false}
            />
          </mesh>

          {/* Simple cottage muntins */}
          <mesh position={[0, 0, 0.044]}>
            <boxGeometry args={[0.41, 0.016, 0.014]} />
            <meshStandardMaterial color={wood} roughness={0.95} metalness={0} />
          </mesh>
          <mesh position={[0, 0, 0.044]}>
            <boxGeometry args={[0.016, 0.29, 0.014]} />
            <meshStandardMaterial color={wood} roughness={0.95} metalness={0} />
          </mesh>

          {/* Open shutters (hinged outward) */}
          <group position={[-0.28, 0, 0.06]} rotation={[0, 1.35, 0]}>
            <mesh position={[0.1, 0, 0]}>
              <boxGeometry args={[0.16, 0.24, 0.04]} />
              <meshStandardMaterial color={wood} roughness={0.95} metalness={0} />
            </mesh>
          </group>
          <group position={[0.28, 0, 0.06]} rotation={[0, -1.35, 0]}>
            <mesh position={[-0.1, 0, 0]}>
              <boxGeometry args={[0.16, 0.24, 0.04]} />
              <meshStandardMaterial color={wood} roughness={0.95} metalness={0} />
            </mesh>
          </group>
        </group>

        {/* DOOR (right) */}
        <group ref={doorPortalRef as any} position={[0.62, 0.1, 0.03]}>
          <mesh>
            <boxGeometry args={[0.46, 0.86, 0.09]} />
            <meshStandardMaterial color={wood} roughness={0.92} metalness={0} />
          </mesh>
          {/* door leaf (hinged on left) — starts closed; animates in `LowPolyVillage` */}
          <group ref={doorLeafRef as any} position={[-0.17, 0, 0.055]} rotation={[0, 0, 0]}>
            <mesh position={[0.17, 0, 0]}>
              <boxGeometry args={[0.34, 0.74, 0.04]} />
              <meshStandardMaterial color={hut} roughness={0.98} metalness={0} />
            </mesh>
            {new Array(6).fill(0).map((_, i) => (
              <mesh key={`door-rib-front-${i}`} position={[0.17, -0.33 + i * 0.12, 0.02]}>
                <boxGeometry args={[0.345, 0.02, 0.012]} />
                <meshStandardMaterial color={wood} roughness={0.95} />
              </mesh>
            ))}
            <mesh position={[0.29, -0.02, 0.03]}>
              <sphereGeometry args={[0.022, 10, 10]} />
              <meshStandardMaterial color={"#2a2017"} roughness={0.4} metalness={0.05} />
            </mesh>
          </group>
        </group>
      </group>

      {/* dark interior volume + faint light when camera is inside */}
      <group position={[0, 0.22, 0.06]}>
        <mesh position={[0, 0.05, -0.25]}>
          <boxGeometry args={[1.56, 0.78, 1.02]} />
          <meshStandardMaterial color={"#120d09"} roughness={1} metalness={0} />
        </mesh>
        {enterCabin && (
          <pointLight position={[0.25, 0.15, -0.18]} intensity={0.35} distance={3.2} color={"#ffcf9d"} />
        )}
      </group>

      {/* chimney */}
      <mesh position={[-0.35, 1.05, -0.1]}>
        <boxGeometry args={[0.14, 0.35, 0.14]} />
        <meshStandardMaterial color={wood} roughness={1} />
      </mesh>
      <ChimneySmoke enabled={smokeEnabled} color={smokeColor} />
    </group>
  );
}

function ChimneySmoke({ enabled, color }: { enabled: boolean; color: string }) {
  const group = useRef<THREE.Group>(null);

  const tex = useMemo(() => {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    const g = ctx.createRadialGradient(size * 0.4, size * 0.38, 6, size * 0.5, size * 0.5, size * 0.52);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.35, "rgba(255,255,255,0.55)");
    g.addColorStop(0.7, "rgba(255,255,255,0.18)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    return t;
  }, []);

  const seeds = useMemo(
    () =>
      new Array(6).fill(0).map((_, i) => ({
        phase: i * 0.72,
        speed: 0.18 + i * 0.015,
        drift: 0.05 + i * 0.01,
        scale: 0.22 + i * 0.035,
      })),
    [],
  );

  useFrame(({ clock }) => {
    if (!enabled) return;
    const g = group.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    for (let i = 0; i < g.children.length; i++) {
      const s = seeds[i]!;
      const p = (t * s.speed + s.phase) % 1;
      // Start slightly *inside* the chimney, then rise.
      const y = 1.12 + p * 0.95;
      const x = -0.35 + Math.sin((t + s.phase) * 1.7) * s.drift;
      const z = -0.12 + Math.cos((t + s.phase) * 1.3) * s.drift * 0.8;
      const sc = s.scale * (0.65 + p * 1.35);
      const alpha = Math.sin(Math.PI * p) ** 1.25;
      const child = g.children[i] as THREE.Sprite;
      child.position.set(x, y, z);
      child.scale.setScalar(sc);
      const mat = child.material as THREE.SpriteMaterial;
      mat.opacity = 0.55 * alpha;
    }
  });

  if (!enabled || !tex) return null;

  return (
    <group ref={group}>
      {seeds.map((_, i) => (
        <sprite key={i} position={[-0.35, 1.12, -0.12]}>
          <spriteMaterial
            map={tex}
            color={new THREE.Color(color)}
            transparent
            opacity={0}
            depthTest
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
}

// Motion-only silhouette walkers removed (not used in this section anymore).

function SkyGradient({
  top,
  bottom,
  glow,
  isDark,
}: {
  top: string;
  bottom: string;
  glow: string;
  isDark: boolean;
}) {
  // Simple 2-plane gradient (no heavy postprocessing).
  return (
    <group position={[0, 3.2, -26]}>
      <mesh>
        <planeGeometry args={[80, 40]} />
        <meshBasicMaterial color={top} />
      </mesh>
      <mesh position={[0, -4, 0.1]}>
        <planeGeometry args={[80, 40]} />
        <meshBasicMaterial transparent opacity={0.5} color={bottom} />
      </mesh>
      {/* Warm band near horizon */}
      <mesh position={[0, -6.8, 0.2]}>
        <planeGeometry args={[80, 14]} />
        <meshBasicMaterial transparent opacity={isDark ? 0.22 : 0.16} color={glow} />
      </mesh>
    </group>
  );
}

function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setIsDark(root.classList.contains("dark"));
    read();
    const obs = new MutationObserver(read);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return isDark;
}

