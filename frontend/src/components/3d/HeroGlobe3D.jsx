import React, { useRef, useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCcw, Play, Pause, ShieldCheck, Activity } from 'lucide-react';
import WebGLFallback from './WebGLFallback';
import ErrorBoundary from '../ErrorBoundary';

// Real dataset landmark nodes for visual centerpiece
const HERO_LANDMARKS = [
  { id: 'dos', label: 'DOS SYN Flood', flows: '94,089 flows (76.4%)', color: '#f43f5e', pos: [1.7, 0.5, 0.9], radius: 0.15 },
  { id: 'thingspeak', label: 'ThingSpeak IoT', flows: '12,509 flows (10.2%)', color: '#34d399', pos: [-1.5, -0.7, 1.2], radius: 0.12 },
  { id: 'arp', label: 'ARP Spoofing', flows: '7,750 flows (6.3%)', color: '#f59e0b', pos: [0.4, 1.8, -0.8], radius: 0.11 },
  { id: 'mqtt', label: 'MQTT Telemetry', flows: '4,146 flows (3.4%)', color: '#10b981', pos: [-1.2, 1.3, 0.6], radius: 0.09 },
  { id: 'nmap_udp', label: 'NMAP UDP Scan', flows: '2,584 flows (2.1%)', color: '#22d3ee', pos: [1.0, -1.4, -1.1], radius: 0.08 },
  { id: 'nmap_syn', label: 'NMAP SYN Scan', flows: '1,990 flows (1.6%)', color: '#38bdf8', pos: [-0.7, -1.6, 0.9], radius: 0.08 },
  { id: 'brute', label: 'Brute Force SSH', flows: '121 flows (0.1%)', color: '#c084fc', pos: [1.3, -0.4, 1.6], radius: 0.06 }
];

// Inner Geodetic Lattice with Atmospheric Rings
function GlobeLattice({ theme = 'dark' }) {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
      groupRef.current.rotation.x += delta * 0.03;
    }
  });

  const wireColor = theme === 'light' ? '#0284c7' : '#22d3ee';
  const ring1Color = theme === 'light' ? '#059669' : '#34d399';
  const ring2Color = theme === 'light' ? '#0284c7' : '#22d3ee';

  return (
    <group ref={groupRef}>
      {/* Geodetic Wireframe Sphere */}
      <mesh>
        <sphereGeometry args={[2.1, 28, 28]} />
        <meshBasicMaterial
          color={wireColor}
          wireframe
          transparent
          opacity={theme === 'light' ? 0.22 : 0.14}
        />
      </mesh>
      {/* Inner Core Shimmer */}
      <mesh>
        <sphereGeometry args={[1.9, 18, 18]} />
        <meshBasicMaterial
          color={theme === 'light' ? '#38bdf8' : '#0e1622'}
          transparent
          opacity={theme === 'light' ? 0.1 : 0.4}
        />
      </mesh>
      {/* Outer Equatorial Orbit Ring 1 */}
      <mesh rotation={[Math.PI / 3.5, 0, 0]}>
        <ringGeometry args={[2.22, 2.25, 64]} />
        <meshBasicMaterial color={ring1Color} transparent opacity={theme === 'light' ? 0.35 : 0.22} side={THREE.DoubleSide} />
      </mesh>
      {/* Outer Equatorial Orbit Ring 2 */}
      <mesh rotation={[-Math.PI / 4, 0, 0]}>
        <ringGeometry args={[2.35, 2.38, 64]} />
        <meshBasicMaterial color={ring2Color} transparent opacity={theme === 'light' ? 0.3 : 0.18} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Telemetry Floating Constellation Particles
function TelemetryParticles({ count = 160, theme = 'dark' }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2.4 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      p[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = radius * Math.cos(phi);
    }
    return p;
  }, [count]);

  const pointsRef = useRef();
  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y -= delta * 0.04;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.038}
        color={theme === 'light' ? '#0284c7' : '#22d3ee'}
        transparent
        opacity={theme === 'light' ? 0.55 : 0.4}
        sizeAttenuation
      />
    </points>
  );
}

// Curved Transmission Spline between Nodes
function TransmissionArc({ start, end, color = '#22d3ee', theme = 'dark' }) {
  const line = useMemo(() => {
    const v1 = new THREE.Vector3(...start);
    const v2 = new THREE.Vector3(...end);
    const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(2.4); // Arc outward for curvature
    const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
    const points = curve.getPoints(28);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: theme === 'light' ? 0.4 : 0.28
    });
    return new THREE.Line(geometry, material);
  }, [start, end, color, theme]);

  return <primitive object={line} />;
}

// Glowing Interactive Node with Pulse Ring
function HeroNode({ node, theme = 'dark', onHover }) {
  const meshRef = useRef();
  const ringRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const s = hovered ? 1.3 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
    }
    if (ringRef.current) {
      const time = state.clock.getElapsedTime();
      const pulseScale = 1.0 + 0.15 * Math.sin(time * 3 + node.radius * 10);
      ringRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
  });

  return (
    <group position={node.pos}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          if (onHover) onHover(node);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          if (onHover) onHover(null);
        }}
      >
        <sphereGeometry args={[node.radius, 16, 16]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={hovered ? 0.9 : 0.4}
          roughness={0.25}
          metalness={0.75}
        />
      </mesh>

      {/* Orbiting Halo Ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[node.radius * 1.35, node.radius * 1.55, 32]} />
        <meshBasicMaterial
          color={node.color}
          side={THREE.DoubleSide}
          transparent
          opacity={hovered ? 0.8 : 0.35}
        />
      </mesh>
    </group>
  );
}

// Subtle Pointer Parallax Rig
function Rig() {
  useFrame((state) => {
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.mouse.x * 0.6, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 0.6 + state.mouse.y * 0.4, 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroGlobe3D({ theme = 'dark' }) {
  const [isRotating, setIsRotating] = useState(true);
  const [activeNode, setActiveNode] = useState(HERO_LANDMARKS[0]);
  const [hasWebGL, setHasWebGL] = useState(true);
  const controlsRef = useRef();

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  if (!hasWebGL) {
    return (
      <div className="hero-globe-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <WebGLFallback onSelectNode={setActiveNode} selectedNode={activeNode} />
      </div>
    );
  }

  return (
    <div className="hero-globe-wrap">
      <ErrorBoundary fallback={<WebGLFallback onSelectNode={setActiveNode} selectedNode={activeNode} />}>
        <Canvas
          camera={{ position: [0, 0.6, 5.2], fov: 44 }}
          dpr={[1, Math.min(window.devicePixelRatio, 2)]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={theme === 'light' ? 0.75 : 0.4} />
          <pointLight position={[10, 10, 10]} intensity={theme === 'light' ? 1.0 : 0.85} color="#22d3ee" />
          <pointLight position={[-10, -10, -10]} intensity={theme === 'light' ? 0.6 : 0.45} color="#34d399" />
          <pointLight position={[0, -12, 5]} intensity={0.3} color="#f43f5e" />

          <Suspense fallback={null}>
            <GlobeLattice theme={theme} />
            <TelemetryParticles count={160} theme={theme} />

            {/* Transmission Arcs */}
            <TransmissionArc start={HERO_LANDMARKS[0].pos} end={HERO_LANDMARKS[1].pos} color="#34d399" theme={theme} />
            <TransmissionArc start={HERO_LANDMARKS[0].pos} end={HERO_LANDMARKS[3].pos} color="#10b981" theme={theme} />
            <TransmissionArc start={HERO_LANDMARKS[2].pos} end={HERO_LANDMARKS[0].pos} color="#f59e0b" theme={theme} />
            <TransmissionArc start={HERO_LANDMARKS[4].pos} end={HERO_LANDMARKS[1].pos} color="#22d3ee" theme={theme} />
            <TransmissionArc start={HERO_LANDMARKS[5].pos} end={HERO_LANDMARKS[0].pos} color="#38bdf8" theme={theme} />

            {/* Nodes */}
            {HERO_LANDMARKS.map((node) => (
              <HeroNode
                key={node.id}
                node={node}
                theme={theme}
                onHover={(n) => n && setActiveNode(n)}
              />
            ))}

            <Rig />
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={false}
            minDistance={4.2}
            maxDistance={7.0}
            dampingFactor={0.06}
            autoRotate={isRotating}
            autoRotateSpeed={0.8}
          />
        </Canvas>
      </ErrorBoundary>

      {/* Floating Interactive HUD Callout */}
      <div className="hero-globe-hud">
        <div className="hero-hud-pill">
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: activeNode?.color || '#34d399',
              display: 'inline-block',
              boxShadow: `0 0 8px ${activeNode?.color || '#34d399'}`
            }}
          />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {activeNode?.label || 'DOS SYN Flood'}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>·</span>
          <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
            {activeNode?.flows || '94,089 flows'}
          </span>
        </div>

        {/* Minimal Controls */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="hero-btn"
            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
            title={isRotating ? 'Pause Orbit' : 'Resume Orbit'}
          >
            {isRotating ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <button
            onClick={handleReset}
            className="hero-btn"
            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
            title="Reset Perspective"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
