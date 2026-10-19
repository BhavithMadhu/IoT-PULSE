import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Palette matched directly to IoT-PULSE landing page variables
const PALETTE = {
  bgDeep: '#080b10',
  cyanGlow: '#00f3ff',
  cyanBright: '#22d3ee',
  blueDeep: '#0284c7',
  blueSky: '#38bdf8',
  emeraldSubtle: '#34d399',
  rosePulse: '#f43f5e'
};

// Generate 16 organic 3D spline curves branching from a distant vanishing point
function generateNetworkPathways() {
  const vanishingPoint = new THREE.Vector3(0, 0, -210);
  const pathways = [];

  // Configuration for 16 distributed spatial pathways
  const configs = [
    // Center-left main trunk
    { end: new THREE.Vector3(-8, 3, 20), mid1: new THREE.Vector3(-14, 6, -60), mid2: new THREE.Vector3(-18, -4, -130), color: PALETTE.cyanGlow, width: 2.2 },
    // Center-right main trunk
    { end: new THREE.Vector3(8, -2, 20), mid1: new THREE.Vector3(14, -5, -60), mid2: new THREE.Vector3(16, 5, -130), color: PALETTE.blueSky, width: 2.2 },
    // High arched left conduit
    { end: new THREE.Vector3(-18, 14, 15), mid1: new THREE.Vector3(-22, 16, -70), mid2: new THREE.Vector3(-14, 12, -140), color: PALETTE.cyanBright, width: 1.8 },
    // High arched right conduit
    { end: new THREE.Vector3(18, 12, 15), mid1: new THREE.Vector3(24, 15, -70), mid2: new THREE.Vector3(16, 10, -140), color: PALETTE.blueDeep, width: 1.8 },
    // Lower left conduit
    { end: new THREE.Vector3(-14, -12, 15), mid1: new THREE.Vector3(-18, -14, -65), mid2: new THREE.Vector3(-12, -10, -135), color: PALETTE.blueSky, width: 1.8 },
    // Lower right conduit
    { end: new THREE.Vector3(14, -14, 15), mid1: new THREE.Vector3(20, -15, -65), mid2: new THREE.Vector3(15, -8, -135), color: PALETTE.cyanGlow, width: 1.8 },
    // Central high-speed axial channel
    { end: new THREE.Vector3(-2, 0.5, 25), mid1: new THREE.Vector3(-3, 2, -50), mid2: new THREE.Vector3(2, -2, -120), color: PALETTE.cyanGlow, width: 2.5 },
    // Central twin axial channel
    { end: new THREE.Vector3(2, -0.5, 25), mid1: new THREE.Vector3(3, -2, -50), mid2: new THREE.Vector3(-2, 2, -120), color: PALETTE.emeraldSubtle, width: 2.2 },
    // Wide left peripheral sweep
    { end: new THREE.Vector3(-26, 6, 10), mid1: new THREE.Vector3(-32, 2, -80), mid2: new THREE.Vector3(-22, 1, -150), color: PALETTE.blueSky, width: 1.4 },
    // Wide right peripheral sweep
    { end: new THREE.Vector3(26, -5, 10), mid1: new THREE.Vector3(32, -3, -80), mid2: new THREE.Vector3(22, 2, -150), color: PALETTE.cyanBright, width: 1.4 },
    // Deep ceiling conduit
    { end: new THREE.Vector3(0, 19, 10), mid1: new THREE.Vector3(6, 22, -75), mid2: new THREE.Vector3(-5, 16, -145), color: PALETTE.blueDeep, width: 1.5 },
    // Deep floor conduit
    { end: new THREE.Vector3(0, -18, 10), mid1: new THREE.Vector3(-5, -20, -75), mid2: new THREE.Vector3(4, -15, -145), color: PALETTE.cyanGlow, width: 1.5 },
    // Crossing diagonal vector A
    { end: new THREE.Vector3(-10, -8, 18), mid1: new THREE.Vector3(8, 6, -70), mid2: new THREE.Vector3(-6, 4, -135), color: PALETTE.cyanGlow, width: 1.6 },
    // Crossing diagonal vector B
    { end: new THREE.Vector3(10, 8, 18), mid1: new THREE.Vector3(-8, -6, -70), mid2: new THREE.Vector3(6, -4, -135), color: PALETTE.rosePulse, width: 1.6 },
    // Far left horizon feeder
    { end: new THREE.Vector3(-22, -6, 12), mid1: new THREE.Vector3(-26, -10, -90), mid2: new THREE.Vector3(-15, -5, -160), color: PALETTE.blueSky, width: 1.4 },
    // Far right horizon feeder
    { end: new THREE.Vector3(22, 7, 12), mid1: new THREE.Vector3(26, 9, -90), mid2: new THREE.Vector3(15, 6, -160), color: PALETTE.cyanGlow, width: 1.4 }
  ];

  configs.forEach((cfg) => {
    // Generate smooth cubic spline
    const curve = new THREE.CubicBezierCurve3(
      vanishingPoint,
      cfg.mid2,
      cfg.mid1,
      cfg.end
    );
    pathways.push({ curve, color: cfg.color, width: cfg.width });
  });

  return pathways;
}

// 1. Static Luminous Fiber Pathway Strands
function PathwayLines({ pathways }) {
  const lineObjects = useMemo(() => {
    return pathways.map((path) => {
      const points = path.curve.getPoints(80);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(path.color),
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending
      });
      return new THREE.Line(geom, mat);
    });
  }, [pathways]);

  return (
    <group>
      {lineObjects.map((line, idx) => (
        <primitive key={idx} object={line} />
      ))}
    </group>
  );
}

// 2. Continuous Glowing Packet Blocks & Motion Blur Light Trails
function FlowingPacketStreams({ pathways, transitionProgress }) {
  // Spawn 3 to 4 packets per pathway at staggered phase offsets and speeds
  const packetsData = useMemo(() => {
    const list = [];
    pathways.forEach((path, pathIdx) => {
      const count = (pathIdx % 3 === 0) ? 4 : 3;
      for (let i = 0; i < count; i++) {
        const speed = 0.08 + (Math.random() * 0.08); // Loops per second
        const offset = (i / count) + (Math.random() * 0.12);
        const trailLength = 0.045 + Math.random() * 0.035; // Curve fraction
        const blockLength = 1.2 + Math.random() * 1.4;
        const blockThickness = 0.22 + Math.random() * 0.12;

        list.push({
          pathIndex: pathIdx,
          curve: path.curve,
          color: path.color,
          speed,
          offset,
          trailLength,
          blockLength,
          blockThickness
        });
      }
    });
    return list;
  }, [pathways]);

  const packetMeshesRef = useRef([]);
  const trailMeshesRef = useRef([]);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    // Gentle acceleration into convergence as transition approaches
    const speedMultiplier = 1.0 + Math.pow(transitionProgress, 2) * 1.8;

    packetsData.forEach((pkt, i) => {
      const mesh = packetMeshesRef.current[i];
      const trail = trailMeshesRef.current[i];
      if (!mesh) return;

      // Current curve parameter t [0..1]
      const t = (elapsedTime * pkt.speed * speedMultiplier + pkt.offset) % 1.0;
      const point = pkt.curve.getPoint(t);
      const tangent = pkt.curve.getTangent(t).normalize();

      mesh.position.copy(point);

      // Align packet block along trajectory tangent
      const up = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, tangent);
      mesh.quaternion.copy(quat);

      // Scale up length slightly with speed
      const stretch = 1.0 + (speedMultiplier - 1.0) * 0.8;
      mesh.scale.set(1.0, stretch, 1.0);

      // Update light trail points behind the packet
      if (trail) {
        const trailPoints = [];
        const steps = 8;
        for (let s = 0; s <= steps; s++) {
          const trailT = Math.max(0, t - (s / steps) * pkt.trailLength);
          trailPoints.push(pkt.curve.getPoint(trailT));
        }
        trail.geometry.setFromPoints(trailPoints);
      }
    });
  });

  return (
    <group>
      {packetsData.map((pkt, i) => {
        const points = [new THREE.Vector3(), new THREE.Vector3()];
        const trailGeom = new THREE.BufferGeometry().setFromPoints(points);
        const trailMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(pkt.color),
          transparent: true,
          opacity: 0.55,
          blending: THREE.AdditiveBlending
        });

        return (
          <group key={i}>
            {/* Motion Blur Trail Streak */}
            <primitive
              ref={(el) => (trailMeshesRef.current[i] = el)}
              object={new THREE.Line(trailGeom, trailMat)}
            />

            {/* Glowing Packet Block */}
            <mesh
              ref={(el) => (packetMeshesRef.current[i] = el)}
            >
              <capsuleGeometry args={[pkt.blockThickness, pkt.blockLength, 8, 12]} />
              <meshStandardMaterial
                color={pkt.color}
                emissive={pkt.color}
                emissiveIntensity={2.2}
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// 3. Ambient Drifting Network Particles
function AmbientNetworkDust({ count = 750 }) {
  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 65;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 45;
      pos[i * 3 + 2] = -Math.random() * 220 + 20;
    }
    return [pos];
  }, [count]);

  const pointsRef = useRef();

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const zIdx = i * 3 + 2;
      array[zIdx] += delta * 6.0;
      if (array[zIdx] > 25) {
        array[zIdx] = -220;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        color={PALETTE.cyanBright}
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 4. Distant Optical Focal Vanishing Point Emitter
function VanishingPointEmitter() {
  const glowRef = useRef();

  useFrame(({ clock }) => {
    if (glowRef.current) {
      const t = clock.getElapsedTime();
      const s = 1.0 + Math.sin(t * 2.5) * 0.15;
      glowRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={[0, 0, -210]}>
      {/* Intense Core Bloom at the Horizon */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[3.2, 24, 24]} />
        <meshBasicMaterial
          color={PALETTE.cyanGlow}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Outer Halo */}
      <mesh>
        <sphereGeometry args={[7.5, 24, 24]} />
        <meshBasicMaterial
          color={PALETTE.blueSky}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight color={PALETTE.cyanGlow} intensity={3.0} distance={90} />
    </group>
  );
}

// 5. Cinematic Dolly Camera Motion with Organic Banking
function CinematicCameraDolly({ transitionProgress }) {
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    // Natural subtle cursor parallax
    const mouseX = state.mouse.x * 2.5;
    const mouseY = state.mouse.y * 1.5;

    // Cinematic forward tracking along the data stream
    const baseZ = 12 - (elapsed * 2.8) - Math.pow(transitionProgress, 2) * 16;
    const baseY = Math.sin(elapsed * 0.6) * 1.5 + mouseY * 0.5;
    const baseX = Math.cos(elapsed * 0.5) * 2.0 + mouseX * 0.5;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, baseX, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, baseY, 0.05);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, baseZ, 0.08);

    // Subtle organic banking rotation
    state.camera.rotation.z = THREE.MathUtils.lerp(state.camera.rotation.z, -baseX * 0.015, 0.04);

    // Look towards the distant vanishing point
    state.camera.lookAt(0, 0, -200);
  });

  return null;
}

// ==============================================================================
// MAIN CINEMATIC NETWORK FLOW INTRO COMPONENT
// ==============================================================================
export default function CinematicNetworkFlow({ onComplete, duration = 7.0 }) {
  const [opacity, setOpacity] = useState(1);
  const [transitionProgress, setTransitionProgress] = useState(0); // 0 to 1
  const pathways = useMemo(() => generateNetworkPathways(), []);
  const startTimeRef = useRef(Date.now());
  const completedRef = useRef(false);

  useEffect(() => {
    // Respect user's reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      const quickTimer = setTimeout(() => {
        handleFinish();
      }, 800);
      return () => clearTimeout(quickTimer);
    }

    const totalDurationMs = duration * 1000;
    const fadeStartMs = totalDurationMs - 1400; // Start cross-fade 1.4s before completion

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(1.0, elapsed / totalDurationMs);
      setTransitionProgress(progress);

      // Smooth fade-out in final 1.4 seconds
      if (elapsed >= fadeStartMs) {
        const fadeElapsed = elapsed - fadeStartMs;
        const fadeRatio = Math.max(0, 1.0 - (fadeElapsed / 1400));
        setOpacity(fadeRatio);
      }

      // Complete transition
      if (elapsed >= totalDurationMs && !completedRef.current) {
        clearInterval(interval);
        handleFinish();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [duration]);

  const handleFinish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setOpacity(0);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 200);
  };

  return (
    <div 
      className="cinematic-network-flow-container"
      style={{
        opacity,
        pointerEvents: opacity < 0.05 ? 'none' : 'auto'
      }}
    >
      {/* Fullscreen Three.js WebGL Visualization */}
      <Canvas
        camera={{ position: [0, 0, 12], fov: 48, near: 0.1, far: 350 }}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
        onCreated={({ scene }) => {
          // Exact match with landing page background & exponential atmospheric fog
          scene.background = new THREE.Color(PALETTE.bgDeep);
          scene.fog = new THREE.FogExp2(PALETTE.bgDeep, 0.009);
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 15]} intensity={0.8} color="#ffffff" />

        <PathwayLines pathways={pathways} />
        <FlowingPacketStreams pathways={pathways} transitionProgress={transitionProgress} />
        <AmbientNetworkDust count={750} />
        <VanishingPointEmitter />
        <CinematicCameraDolly transitionProgress={transitionProgress} />
      </Canvas>

      {/* Discreet, elegant skip button in top-right corner */}
      <button
        onClick={handleFinish}
        className="cinematic-flow-skip-btn"
        aria-label="Skip network flow intro"
      >
        Skip
      </button>
    </div>
  );
}
