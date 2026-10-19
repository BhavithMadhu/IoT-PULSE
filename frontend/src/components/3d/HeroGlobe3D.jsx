import React, { useRef, useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { 
  RotateCcw, Play, Pause, ShieldCheck, Activity, 
  Zap, Radio, Filter, Eye, Sparkles, AlertTriangle 
} from 'lucide-react';
import { createCyberEarthTexture, geoToVector3 } from './globeTexture';
import WebGLFallback from './WebGLFallback';
import ErrorBoundary from '../ErrorBoundary';

// Real RT-IOT2022 landmark nodes mapped to realistic global coordinates
const CYBER_LANDMARKS = [
  {
    id: 'dos',
    label: 'DOS SYN Flood (Hping)',
    category: 'Volumetric Flooding',
    flows: '94,089 flows',
    share: '76.4%',
    color: '#f43f5e',
    glowColor: '#fb7185',
    lon: 35.0,
    lat: 48.0, // Eastern Europe Botnet cluster
    beaconHeight: 0.85,
    severity: 'CRITICAL',
    vector: 'Single-packet SYN blast (0.000000s duration)'
  },
  {
    id: 'thingspeak',
    label: 'ThingSpeak IoT Cloud',
    category: 'Legitimate Telemetry',
    flows: '12,509 flows',
    share: '10.2%',
    color: '#34d399',
    glowColor: '#6ee7b7',
    lon: -77.5,
    lat: 39.0, // US East IoT Cloud Gateway
    beaconHeight: 0.55,
    severity: 'NORMAL',
    vector: 'Bidirectional HTTP sensor streaming'
  },
  {
    id: 'arp',
    label: 'ARP Gateway Poisoning',
    category: 'L2 Spoofing',
    flows: '7,750 flows',
    share: '6.3%',
    color: '#f59e0b',
    glowColor: '#fbbf24',
    lon: 8.5,
    lat: 50.1, // Central European IoT Gateway
    beaconHeight: 0.45,
    severity: 'ELEVATED',
    vector: 'Gratuitous ARP MITM broadcast'
  },
  {
    id: 'mqtt',
    label: 'MQTT Sensor Telemetry',
    category: 'Legitimate IoT Broker',
    flows: '4,146 flows',
    share: '3.4%',
    color: '#10b981',
    glowColor: '#34d399',
    lon: 77.2,
    lat: 28.6, // Smart City Sensor Hub (Delhi)
    beaconHeight: 0.40,
    severity: 'NORMAL',
    vector: 'Persistent TCP broker sessions (44.52s avg)'
  },
  {
    id: 'nmap_udp',
    label: 'NMAP UDP Sweep',
    category: 'Reconnaissance',
    flows: '2,584 flows',
    share: '2.1%',
    color: '#06b6d4',
    glowColor: '#22d3ee',
    lon: 121.5,
    lat: 31.2, // East Asia Recon Hub
    beaconHeight: 0.35,
    severity: 'WARNING',
    vector: 'Stateless multi-port probing'
  },
  {
    id: 'nmap_syn',
    label: 'NMAP SYN Recon',
    category: 'Port Probing',
    flows: '1,990 flows',
    share: '1.6%',
    color: '#38bdf8',
    glowColor: '#7dd3fc',
    lon: -122.4,
    lat: 37.8, // West Coast Recon Probe
    beaconHeight: 0.32,
    severity: 'WARNING',
    vector: 'Half-open TCP port reconnaissance'
  },
  {
    id: 'brute',
    label: 'SSH Brute Force',
    category: 'Credential Attack',
    flows: '121 flows',
    share: '0.1%',
    color: '#c084fc',
    glowColor: '#d8b4fe',
    lon: -46.6,
    lat: -23.5, // South America Gateway Probe
    beaconHeight: 0.25,
    severity: 'ELEVATED',
    vector: 'Dictionary login automation on port 22'
  }
];

// Arcs connecting threat sources to target IoT cloud and sensors
const TRANSMISSION_PAIRS = [
  { from: 'dos', to: 'thingspeak', color: '#f43f5e', speed: 1.6, density: 4 },
  { from: 'arp', to: 'thingspeak', color: '#f59e0b', speed: 1.2, density: 2 },
  { from: 'nmap_udp', to: 'thingspeak', color: '#06b6d4', speed: 1.0, density: 2 },
  { from: 'nmap_syn', to: 'mqtt', color: '#38bdf8', speed: 1.1, density: 2 },
  { from: 'brute', to: 'thingspeak', color: '#c084fc', speed: 0.9, density: 1 },
  { from: 'mqtt', to: 'thingspeak', color: '#10b981', speed: 0.8, density: 2 }
];

// Pre-calculate positions on the sphere of radius 2.05
const PRECOMPUTED_NODES = CYBER_LANDMARKS.map(node => {
  const pos = geoToVector3(node.lon, node.lat, 2.05);
  return { ...node, posVector: pos, pos: [pos.x, pos.y, pos.z] };
});

const NODE_MAP = new Map(PRECOMPUTED_NODES.map(n => [n.id, n]));

// ==============================================================================
// 1. PROCEDURAL CYBER EARTH SPHERE WITH ATMOSPHERIC GLOW
// ==============================================================================
function CyberEarthGlobe({ theme = 'dark' }) {
  const globeRef = useRef();
  const earthTexture = useMemo(() => createCyberEarthTexture(theme), [theme]);

  // Slow authentic axial rotation
  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Primary Cyber Globe with Continental Texture */}
      <mesh>
        <sphereGeometry args={[2.05, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.4}
          metalness={0.65}
          emissive={theme === 'light' ? '#0369a1' : '#0e2439'}
          emissiveIntensity={theme === 'light' ? 0.15 : 0.45}
        />
      </mesh>

      {/* Atmospheric Luminous Outer Rim (Rayleigh Haze) */}
      <mesh>
        <sphereGeometry args={[2.14, 48, 48]} />
        <meshBasicMaterial
          color={theme === 'light' ? '#38bdf8' : '#22d3ee'}
          transparent
          opacity={theme === 'light' ? 0.12 : 0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Secondary Inner Geodetic Wireframe Lattice for depth */}
      <mesh>
        <sphereGeometry args={[2.07, 36, 36]} />
        <meshBasicMaterial
          color={theme === 'light' ? '#0284c7' : '#00f5ff'}
          wireframe
          transparent
          opacity={theme === 'light' ? 0.08 : 0.06}
        />
      </mesh>
    </group>
  );
}

// ==============================================================================
// 2. GYROSCOPIC TACTICAL ORBIT RINGS & SENTINEL DRONE
// ==============================================================================
function TacticalGimbal({ theme = 'dark' }) {
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const droneRef = useRef();

  useFrame(({ clock }, delta) => {
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.08;
    if (ring2Ref.current) ring2Ref.current.rotation.y -= delta * 0.06;

    // Sentinel satellite orbit
    if (droneRef.current) {
      const t = clock.getElapsedTime() * 0.45;
      const r = 2.45;
      droneRef.current.position.set(
        Math.cos(t) * r,
        Math.sin(t * 1.5) * 0.6,
        Math.sin(t) * r
      );
    }
  });

  const ringColor = theme === 'light' ? '#0284c7' : '#00f5ff';
  const ringColorAlt = theme === 'light' ? '#059669' : '#34d399';

  return (
    <group>
      {/* Equatorial Gyro Ring with Tick Marks */}
      <group ref={ring1Ref} rotation={[Math.PI / 5, 0, 0]}>
        <mesh>
          <ringGeometry args={[2.32, 2.34, 64]} />
          <meshBasicMaterial color={ringColor} transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <ringGeometry args={[2.42, 2.43, 48]} />
          <meshBasicMaterial color={ringColorAlt} transparent opacity={0.16} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Polar Inclined Ring */}
      <group ref={ring2Ref} rotation={[-Math.PI / 3.8, Math.PI / 6, 0]}>
        <mesh>
          <ringGeometry args={[2.48, 2.50, 64]} />
          <meshBasicMaterial color={ringColor} transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Orbiting Sentinel Recon Satellite */}
      <group ref={droneRef}>
        <mesh>
          <boxGeometry args={[0.07, 0.07, 0.12]} />
          <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={1.2} />
        </mesh>
        {/* Solar Arrays */}
        <mesh position={[0.1, 0, 0]}>
          <planeGeometry args={[0.14, 0.05]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.1, 0, 0]}>
          <planeGeometry args={[0.14, 0.05]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>
        {/* Trailing Beacon Light */}
        <pointLight color="#00f5ff" intensity={0.5} distance={1.2} />
      </group>
    </group>
  );
}

// ==============================================================================
// 3. CURVED TRANSMISSION ARCS WITH FLYING PHOTON PULSES
// ==============================================================================
function AnimatedTrafficArc({ startNode, endNode, color, speed = 1.0, count = 2, isBoosted = false }) {
  const { curve, lineMesh } = useMemo(() => {
    const v1 = startNode.posVector;
    const v2 = endNode.posVector;
    const distance = v1.distanceTo(v2);

    // Height of the arc depends on distance between nodes
    const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
    const midElevation = 2.05 + Math.min(distance * 0.45, 0.95);
    mid.normalize().multiplyScalar(midElevation);

    const c = new THREE.QuadraticBezierCurve3(v1, mid, v2);
    const points = c.getPoints(36);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });

    return { curve: c, lineMesh: new THREE.Line(geometry, material) };
  }, [startNode, endNode, color]);

  // Photon packet meshes traveling along the curve
  const photonRefs = useRef([]);
  const effectiveSpeed = isBoosted ? speed * 2.2 : speed;

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime() * effectiveSpeed;
    photonRefs.current.forEach((mesh, index) => {
      if (!mesh) return;
      const offset = index / count;
      const t = (elapsedTime * 0.35 + offset) % 1.0;
      const point = curve.getPoint(t);
      mesh.position.copy(point);

      // Pulse size as it travels
      const pulse = 1.0 + 0.3 * Math.sin(t * Math.PI);
      mesh.scale.set(pulse, pulse, pulse);
    });
  });

  return (
    <group>
      <primitive object={lineMesh} />
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (photonRefs.current[i] = el)}
        >
          <sphereGeometry args={[0.032, 10, 10]} />
          <meshBasicMaterial
            color={color}
            blending={THREE.AdditiveBlending}
            transparent
            opacity={0.95}
          />
        </mesh>
      ))}
    </group>
  );
}

// ==============================================================================
// 4. THREAT BEACON WITH VERTICAL LIGHT PILLAR & SHOCKWAVE RINGS
// ==============================================================================
function ThreatBeacon({ node, isSelected, isHovered, onClick, onHover, theme = 'dark' }) {
  const shockwaveRef = useRef();
  const pillarRef = useRef();

  // Orient light pillar outwards normal to the globe surface
  const { normal, orientation, pillarPosition } = useMemo(() => {
    const norm = node.posVector.clone().normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, norm);

    // Center of the vertical pillar is halfway up its height
    const centerPos = node.posVector.clone().add(norm.clone().multiplyScalar(node.beaconHeight / 2));
    return { normal: norm, orientation: quat, pillarPosition: centerPos };
  }, [node]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    // Expanding ground ripple shockwave
    if (shockwaveRef.current) {
      const cycle = (time * 1.8 + node.lat) % 1.0; // 0..1
      const scale = 1.0 + cycle * 2.2;
      shockwaveRef.current.scale.set(scale, scale, scale);
      shockwaveRef.current.material.opacity = (1.0 - cycle) * (isSelected ? 0.9 : 0.5);
    }
    // Pulsing light pillar
    if (pillarRef.current) {
      const pulse = 0.85 + 0.25 * Math.sin(time * 3 + node.lon);
      pillarRef.current.scale.set(pulse, 1.0, pulse);
    }
  });

  const active = isSelected || isHovered;

  return (
    <group position={node.pos}>
      {/* Ground Center Core Dot */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick(node);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(node);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(null);
        }}
      >
        <sphereGeometry args={[active ? 0.08 : 0.06, 16, 16]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.glowColor}
          emissiveIntensity={active ? 1.4 : 0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Surface Expanding Shockwave Ring */}
      <mesh
        ref={shockwaveRef}
        quaternion={orientation}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.07, 0.09, 32]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Vertical Holographic Light Pillar */}
      <group position={normal.clone().multiplyScalar(node.beaconHeight / 2)} quaternion={orientation}>
        <mesh ref={pillarRef}>
          <cylinderGeometry args={[0.014, 0.024, node.beaconHeight, 16, 1, true]} />
          <meshBasicMaterial
            color={node.color}
            transparent
            opacity={active ? 0.75 : 0.42}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        {/* Beacon Apex Spark */}
        <mesh position={[0, node.beaconHeight / 2, 0]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial
            color="#ffffff"
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Tactical 3D Tag On Hover / Select */}
      {active && (
        <Html distanceFactor={5.4} position={[0, node.beaconHeight + 0.18, 0]} center>
          <div className="globe-cyber-tag" style={{ borderColor: node.color }}>
            <div className="tag-header">
              <span className="tag-pulse-dot" style={{ backgroundColor: node.color }} />
              <span className="tag-title">{node.label}</span>
              <span className="tag-badge" style={{ backgroundColor: `${node.color}25`, color: node.color }}>
                {node.share}
              </span>
            </div>
            <div className="tag-meta">
              <span>{node.flows}</span>
              <span className="tag-divider">·</span>
              <span className="tag-vector">{node.category}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// ==============================================================================
// 5. DEEP SPACE TELEMETRY CONSTELLATION PARTICLES
// ==============================================================================
function DeepSpaceConstellation({ count = 220, theme = 'dark' }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 3.0 + Math.random() * 2.8;
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
      pointsRef.current.rotation.y -= delta * 0.025;
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
        size={0.034}
        color={theme === 'light' ? '#0284c7' : '#00f5ff'}
        transparent
        opacity={theme === 'light' ? 0.45 : 0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ==============================================================================
// 6. MAIN EXTRAORDINARY HERO GLOBE COMPONENT
// ==============================================================================
export default function HeroGlobe3D({ theme = 'dark' }) {
  const [selectedNode, setSelectedNode] = useState(PRECOMPUTED_NODES[0]); // DOS_SYN
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isRotating, setIsRotating] = useState(true);
  const [attackBoost, setAttackBoost] = useState(false);
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'ATTACK' | 'NORMAL'
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

  // Filter visible nodes based on active filter
  const visibleNodes = useMemo(() => {
    if (filterMode === 'ATTACK') {
      return PRECOMPUTED_NODES.filter(n => n.severity !== 'NORMAL');
    }
    if (filterMode === 'NORMAL') {
      return PRECOMPUTED_NODES.filter(n => n.severity === 'NORMAL');
    }
    return PRECOMPUTED_NODES;
  }, [filterMode]);

  const activeNode = hoveredNode || selectedNode;

  if (!hasWebGL) {
    return (
      <div className="hero-globe-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <WebGLFallback onSelectNode={setSelectedNode} selectedNode={selectedNode} />
      </div>
    );
  }

  return (
    <div className="hero-globe-wrap extraordinary-globe">
      <ErrorBoundary fallback={<WebGLFallback onSelectNode={setSelectedNode} selectedNode={selectedNode} />}>
        <Canvas
          camera={{ position: [0, 0.7, 5.0], fov: 45 }}
          dpr={[1, Math.min(window.devicePixelRatio, 2)]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          {/* Cyber Lighting Array */}
          <ambientLight intensity={theme === 'light' ? 0.8 : 0.45} />
          <directionalLight position={[6, 8, 5]} intensity={theme === 'light' ? 1.2 : 0.9} color="#ffffff" />
          <pointLight position={[-10, -5, -8]} intensity={0.6} color="#00f5ff" />
          <pointLight position={[8, -8, 6]} intensity={0.4} color="#f43f5e" />

          <Suspense fallback={null}>
            <CyberEarthGlobe theme={theme} />
            <TacticalGimbal theme={theme} />
            <DeepSpaceConstellation count={220} theme={theme} />

            {/* Transmission Arcs */}
            {TRANSMISSION_PAIRS.map((pair, idx) => {
              const start = NODE_MAP.get(pair.from);
              const end = NODE_MAP.get(pair.to);
              if (!start || !end) return null;

              // Hide arc if filtered out
              const startVisible = visibleNodes.some(n => n.id === start.id);
              const endVisible = visibleNodes.some(n => n.id === end.id);
              if (!startVisible && !endVisible) return null;

              return (
                <AnimatedTrafficArc
                  key={idx}
                  startNode={start}
                  endNode={end}
                  color={pair.color}
                  speed={pair.speed}
                  count={pair.density}
                  isBoosted={attackBoost}
                />
              );
            })}

            {/* Threat Epicenters */}
            {visibleNodes.map((node) => (
              <ThreatBeacon
                key={node.id}
                node={node}
                isSelected={selectedNode?.id === node.id}
                isHovered={hoveredNode?.id === node.id}
                onClick={setSelectedNode}
                onHover={setHoveredNode}
                theme={theme}
              />
            ))}
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={true}
            minDistance={3.6}
            maxDistance={7.5}
            dampingFactor={0.06}
            autoRotate={isRotating}
            autoRotateSpeed={attackBoost ? 1.8 : 0.75}
          />
        </Canvas>
      </ErrorBoundary>

      {/* =========================================================================
          HIGH-TECH CYBER HUD & INTERACTIVE CONTROLS
          ========================================================================= */}
      
      {/* Top Unified Header Bar */}
      <div className="hero-globe-top-bar">
        <div className="status-live-chip">
          <span className="live-radar-ping" />
          <span className="live-text">GLOBAL THREATS</span>
        </div>

        <div className="hero-globe-quick-actions">
          <div className="filter-pill-group">
            <button
              className={`filter-btn ${filterMode === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterMode('ALL')}
              title="Show all traffic flows"
            >
              All
            </button>
            <button
              className={`filter-btn ${filterMode === 'ATTACK' ? 'active' : ''}`}
              onClick={() => setFilterMode('ATTACK')}
              title="Filter threat vectors only"
            >
              Threats
            </button>
            <button
              className={`filter-btn ${filterMode === 'NORMAL' ? 'active' : ''}`}
              onClick={() => setFilterMode('NORMAL')}
              title="Filter legitimate IoT telemetry"
            >
              Normal
            </button>
          </div>

          <button
            className={`attack-pulse-btn ${attackBoost ? 'pulsing' : ''}`}
            onClick={() => setAttackBoost(!attackBoost)}
            title="Toggle simulated volumetric attack surge"
          >
            <Zap size={12} />
            <span>{attackBoost ? 'Surge' : 'Simulate'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Floating Telemetry Panel */}
      <div className="hero-globe-hud">
        {activeNode && (
          <div className="hero-hud-card">
            <div className="hud-card-header">
              <span
                className="hud-node-indicator"
                style={{
                  backgroundColor: activeNode.color,
                  boxShadow: `0 0 10px ${activeNode.color}`
                }}
              />
              <div className="hud-node-title-wrap">
                <span className="hud-node-title">{activeNode.label}</span>
                <span className="hud-node-category">{activeNode.category}</span>
              </div>
              <span
                className="hud-severity-tag"
                style={{
                  color: activeNode.color,
                  borderColor: `${activeNode.color}40`,
                  backgroundColor: `${activeNode.color}15`
                }}
              >
                {activeNode.severity}
              </span>
            </div>

            <div className="hud-stats-row">
              <div className="hud-stat-item">
                <span className="stat-label">VOLUME</span>
                <span className="stat-value">{activeNode.flows}</span>
              </div>
              <div className="hud-stat-item">
                <span className="stat-label">DATASET RATIO</span>
                <span className="stat-value" style={{ color: activeNode.color }}>{activeNode.share}</span>
              </div>
              <div className="hud-stat-item">
                <span className="stat-label">SIGNATURE</span>
                <span className="stat-value-sub">{activeNode.vector}</span>
              </div>
            </div>
          </div>
        )}

        {/* Minimal Bottom Viewport Controls */}
        <div className="hero-controls-dock">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="hero-btn"
            title={isRotating ? 'Pause Orbit' : 'Resume Orbit'}
          >
            {isRotating ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button
            onClick={handleReset}
            className="hero-btn"
            title="Reset Perspective"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
