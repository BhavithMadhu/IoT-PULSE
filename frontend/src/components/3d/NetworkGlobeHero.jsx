import React, { useRef, useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  RotateCcw, Play, Pause, Layers, ShieldAlert, CheckCircle2, 
  X, Zap, Radio, Activity, Sparkles, Filter 
} from 'lucide-react';
import { createCyberEarthTexture, geoToVector3 } from './globeTexture';
import WebGLFallback from './WebGLFallback';
import ErrorBoundary from '../ErrorBoundary';

// Real verified dataset node profiles with global coordinates
const SPATIAL_DATASET_NODES = [
  {
    id: 'DOS_SYN_Hping',
    label: 'DOS_SYN_Hping',
    category: 'Volumetric Flooding',
    flows: 94089,
    percentage: 76.42,
    color: '#f43f5e',
    glowColor: '#fb7185',
    isNormal: false,
    proto: 'TCP',
    service: 'Unassigned',
    durationMedian: '0.000000s',
    lon: 35.0,
    lat: 48.0, // Eastern Europe
    beaconHeight: 0.85,
    insight: 'Single-packet SYN flood omitting 3-way handshake completion. High-SYN ratio is 0.00%.'
  },
  {
    id: 'Thing_Speak',
    label: 'Thing_Speak Telemetry',
    category: 'Normal IoT Telemetry',
    flows: 12509,
    percentage: 10.16,
    color: '#34d399',
    glowColor: '#6ee7b7',
    isNormal: true,
    proto: 'TCP',
    service: 'HTTP / Cloud',
    durationMedian: '0.000021s',
    lon: -77.5,
    lat: 39.0, // US East Cloud Hub
    beaconHeight: 0.55,
    insight: 'Standard IoT cloud sensor telemetry. Demonstrates balanced bidirectional packet exchange.'
  },
  {
    id: 'ARP_poisioning',
    label: 'ARP Poisoning',
    category: 'Layer 2 Spoofing',
    flows: 7750,
    percentage: 6.29,
    color: '#f59e0b',
    glowColor: '#fbbf24',
    isNormal: false,
    proto: 'ARP / Ether',
    service: 'Internal L2',
    durationMedian: '0.000000s',
    lon: 8.5,
    lat: 50.1, // Central Europe Gateway
    beaconHeight: 0.45,
    insight: 'Internal network reconnaissance & man-in-the-middle gateway address falsification.'
  },
  {
    id: 'MQTT_Publish',
    label: 'MQTT Sensor Telemetry',
    category: 'Normal IoT Protocol',
    flows: 4146,
    percentage: 3.37,
    color: '#10b981',
    glowColor: '#34d399',
    isNormal: true,
    proto: 'TCP',
    service: 'MQTT (1883)',
    durationMedian: '44.524108s',
    lon: 77.2,
    lat: 28.6, // Smart City Broker (Delhi)
    beaconHeight: 0.40,
    insight: 'Longest persistent connections in the dataset. Normal broker keep-alive dialogue.'
  },
  {
    id: 'NMAP_UDP_SCAN',
    label: 'NMAP UDP Scan',
    category: 'Reconnaissance',
    flows: 2584,
    percentage: 2.10,
    color: '#06b6d4',
    glowColor: '#22d3ee',
    isNormal: false,
    proto: 'UDP',
    service: 'Various Probes',
    durationMedian: '0.000000s',
    lon: 121.5,
    lat: 31.2, // East Asia
    beaconHeight: 0.35,
    insight: 'Stateless probe scan generating instant ICMP Port Unreachable responses.'
  },
  {
    id: 'NMAP_SYN_SCAN',
    label: 'NMAP SYN Scan',
    category: 'Port Scan',
    flows: 1990,
    percentage: 1.62,
    color: '#38bdf8',
    glowColor: '#7dd3fc',
    isNormal: false,
    proto: 'TCP',
    service: 'Multi-port Probing',
    durationMedian: '0.000000s',
    lon: -122.4,
    lat: 37.8, // West Coast
    beaconHeight: 0.32,
    insight: 'Half-open port reconnaissance targeting standard and uncommon daemon ports.'
  },
  {
    id: 'Metasploit_Brute_Force',
    label: 'Metasploit Brute Force',
    category: 'Credential Attack',
    flows: 121,
    percentage: 0.10,
    color: '#c084fc',
    glowColor: '#d8b4fe',
    isNormal: false,
    proto: 'TCP',
    service: 'SSH / Telnet',
    durationMedian: '0.004210s',
    lon: -46.6,
    lat: -23.5, // South America
    beaconHeight: 0.25,
    insight: 'Targeted dictionary attacks against IoT gateway administrative services.'
  }
];

const PRECOMPUTED_SPATIAL_NODES = SPATIAL_DATASET_NODES.map(node => {
  const pos = geoToVector3(node.lon, node.lat, 2.05);
  return { ...node, posVector: pos, pos: [pos.x, pos.y, pos.z] };
});

const SPATIAL_NODE_MAP = new Map(PRECOMPUTED_SPATIAL_NODES.map(n => [n.id, n]));

const SPATIAL_ARCS = [
  { from: 'DOS_SYN_Hping', to: 'Thing_Speak', color: '#f43f5e', speed: 1.5, count: 4 },
  { from: 'ARP_poisioning', to: 'Thing_Speak', color: '#f59e0b', speed: 1.2, count: 2 },
  { from: 'MQTT_Publish', to: 'Thing_Speak', color: '#10b981', speed: 0.8, count: 2 },
  { from: 'NMAP_UDP_SCAN', to: 'Thing_Speak', color: '#06b6d4', speed: 1.0, count: 2 },
  { from: 'NMAP_SYN_SCAN', to: 'MQTT_Publish', color: '#38bdf8', speed: 1.1, count: 2 },
  { from: 'Metasploit_Brute_Force', to: 'Thing_Speak', color: '#c084fc', speed: 0.9, count: 1 }
];

// Cyber Earth Globe Mesh
function CyberGlobeMesh({ theme = 'dark' }) {
  const globeRef = useRef();
  const earthTexture = useMemo(() => createCyberEarthTexture(theme), [theme]);

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.045;
    }
  });

  return (
    <group ref={globeRef}>
      <mesh>
        <sphereGeometry args={[2.05, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.4}
          metalness={0.65}
          emissive={theme === 'light' ? '#0369a1' : '#0e2439'}
          emissiveIntensity={theme === 'light' ? 0.15 : 0.42}
        />
      </mesh>

      {/* Atmospheric Rayleigh Halo */}
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

      {/* Fine Coordinate Wireframe */}
      <mesh>
        <sphereGeometry args={[2.07, 32, 32]} />
        <meshBasicMaterial
          color={theme === 'light' ? '#0284c7' : '#00f5ff'}
          wireframe
          transparent
          opacity={0.06}
        />
      </mesh>
    </group>
  );
}

// Tactical Orbit Rings & Sentinel Drone
function OrbitGimbal({ theme = 'dark' }) {
  const ringRef = useRef();
  const droneRef = useRef();

  useFrame(({ clock }, delta) => {
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.07;
    if (droneRef.current) {
      const t = clock.getElapsedTime() * 0.4;
      droneRef.current.position.set(
        Math.cos(t) * 2.45,
        Math.sin(t * 1.4) * 0.55,
        Math.sin(t) * 2.45
      );
    }
  });

  const c1 = theme === 'light' ? '#0284c7' : '#00f5ff';
  const c2 = theme === 'light' ? '#059669' : '#34d399';

  return (
    <group>
      <group ref={ringRef} rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <ringGeometry args={[2.34, 2.36, 64]} />
          <meshBasicMaterial color={c1} transparent opacity={0.22} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <ringGeometry args={[2.44, 2.45, 48]} />
          <meshBasicMaterial color={c2} transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <group ref={droneRef}>
        <mesh>
          <boxGeometry args={[0.06, 0.06, 0.1]} />
          <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={1.2} />
        </mesh>
        <pointLight color="#00f5ff" intensity={0.4} distance={1.2} />
      </group>
    </group>
  );
}

// Transmission Arc with traveling photons
function TrafficTransmissionArc({ startNode, endNode, color, speed = 1.0, count = 2, isSurge = false }) {
  const { curve, lineMesh } = useMemo(() => {
    const v1 = startNode.posVector;
    const v2 = endNode.posVector;
    const dist = v1.distanceTo(v2);

    const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
    const midElevation = 2.05 + Math.min(dist * 0.45, 0.95);
    mid.normalize().multiplyScalar(midElevation);

    const c = new THREE.QuadraticBezierCurve3(v1, mid, v2);
    const points = c.getPoints(32);
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    return { curve: c, lineMesh: new THREE.Line(geom, mat) };
  }, [startNode, endNode, color]);

  const photonRefs = useRef([]);
  const effectiveSpeed = isSurge ? speed * 2.2 : speed;

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime() * effectiveSpeed;
    photonRefs.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const offset = idx / count;
      const t = (elapsed * 0.35 + offset) % 1.0;
      mesh.position.copy(curve.getPoint(t));
      const s = 1.0 + 0.25 * Math.sin(t * Math.PI);
      mesh.scale.set(s, s, s);
    });
  });

  return (
    <group>
      <primitive object={lineMesh} />
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} ref={(el) => (photonRefs.current[i] = el)}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshBasicMaterial color={color} blending={THREE.AdditiveBlending} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Tactical Interactive Node Beacon with Light Pillar & Shockwaves
function SpatialNodeBeacon({ node, isSelected, onSelect, theme = 'dark' }) {
  const [hovered, setHovered] = useState(false);
  const shockwaveRef = useRef();
  const pillarRef = useRef();

  const { normal, orientation } = useMemo(() => {
    const norm = node.posVector.clone().normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, norm);
    return { normal: norm, orientation: quat };
  }, [node]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (shockwaveRef.current) {
      const cycle = (t * 1.8 + node.lat) % 1.0;
      const s = 1.0 + cycle * 2.2;
      shockwaveRef.current.scale.set(s, s, s);
      shockwaveRef.current.material.opacity = (1.0 - cycle) * (isSelected ? 0.9 : 0.5);
    }
    if (pillarRef.current) {
      const pulse = 0.85 + 0.25 * Math.sin(t * 3 + node.lon);
      pillarRef.current.scale.set(pulse, 1.0, pulse);
    }
  });

  const active = isSelected || hovered;

  return (
    <group position={node.pos}>
      {/* Ground Node Core */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <sphereGeometry args={[active ? 0.08 : 0.06, 16, 16]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.glowColor}
          emissiveIntensity={active ? 1.4 : 0.75}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Surface Expanding Shockwave Ring */}
      <mesh ref={shockwaveRef} quaternion={orientation} rotation={[Math.PI / 2, 0, 0]}>
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
            opacity={active ? 0.8 : 0.4}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh position={[0, node.beaconHeight / 2, 0]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial color="#ffffff" blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* 3D Label */}
      <Html distanceFactor={5.4} position={[0, node.beaconHeight + 0.16, 0]} center>
        <div 
          onClick={(e) => { e.stopPropagation(); onSelect(node); }}
          className="spatial-node-tag"
          style={{
            borderColor: active ? node.color : 'rgba(148, 163, 184, 0.25)',
            boxShadow: active ? `0 0 12px ${node.color}60` : 'none',
            cursor: 'pointer'
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: node.color }} />
          <span>{node.label}</span>
          <span style={{ color: node.color, fontWeight: 700 }}>{node.percentage}%</span>
        </div>
      </Html>
    </group>
  );
}

// Deep Space Dust Particles
function DeepSpaceDust({ count = 180, theme = 'dark' }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2.8 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      p[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = radius * Math.cos(phi);
    }
    return p;
  }, [count]);

  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y -= delta * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={points} itemSize={3} />
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
// MAIN NETWORK GLOBE HERO COMPONENT (Dashboard Centerpiece)
// ==============================================================================
export default function NetworkGlobeHero({ overviewData, theme = 'dark' }) {
  const [selectedNode, setSelectedNode] = useState(PRECOMPUTED_SPATIAL_NODES[0]); // Default to DOS_SYN
  const [isRotating, setIsRotating] = useState(true);
  const [isSurgeActive, setIsSurgeActive] = useState(false);
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'ATTACKS' | 'NORMAL'
  const [viewMode, setViewMode] = useState('3D'); // '3D' | '2D'
  const [hasWebGL, setHasWebGL] = useState(true);
  const controlsRef = useRef();

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        setViewMode('2D');
      }
    } catch (e) {
      setHasWebGL(false);
      setViewMode('2D');
    }
  }, []);

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const filteredNodes = useMemo(() => {
    if (filterMode === 'ATTACKS') {
      return PRECOMPUTED_SPATIAL_NODES.filter(n => !n.isNormal);
    }
    if (filterMode === 'NORMAL') {
      return PRECOMPUTED_SPATIAL_NODES.filter(n => n.isNormal);
    }
    return PRECOMPUTED_SPATIAL_NODES;
  }, [filterMode]);

  return (
    <div className="hero-3d-card extraordinary-dashboard-card">
      {/* Header Bar */}
      <div className="hero-3d-header">
        <div className="hero-3d-title-group">
          <span className="hero-3d-badge">{viewMode === '3D' ? 'Cyber Defense Globe' : '2D Topology View'}</span>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Global Attack Matrix & Spatial Traffic Clustered (123,117 RT-IOT Flows)
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Filter Pills */}
          <div className="globe-dash-filter-pills">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`filter-btn ${filterMode === 'ALL' ? 'active' : ''}`}
            >
              All Vectors
            </button>
            <button
              onClick={() => setFilterMode('ATTACKS')}
              className={`filter-btn ${filterMode === 'ATTACKS' ? 'active' : ''}`}
            >
              Attacks Only
            </button>
            <button
              onClick={() => setFilterMode('NORMAL')}
              className={`filter-btn ${filterMode === 'NORMAL' ? 'active' : ''}`}
            >
              Normal Telemetry
            </button>
          </div>

          {/* 3D / 2D Mode Switcher */}
          <div style={{ 
            display: 'inline-flex', 
            background: theme === 'light' ? 'rgba(226, 232, 240, 0.6)' : 'rgba(15, 23, 42, 0.6)', 
            padding: 2, 
            borderRadius: 6, 
            border: '1px solid var(--border-subtle)' 
          }}>
            <button
              onClick={() => setViewMode('3D')}
              style={{
                padding: '3px 9px',
                fontSize: '0.72rem',
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === '3D' ? 'var(--accent-cyan-subtle)' : 'transparent',
                color: viewMode === '3D' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontWeight: viewMode === '3D' ? 700 : 500,
                transition: 'all 0.15s ease'
              }}
            >
              3D Cyber Globe
            </button>
            <button
              onClick={() => setViewMode('2D')}
              style={{
                padding: '3px 9px',
                fontSize: '0.72rem',
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === '2D' ? 'var(--accent-cyan-subtle)' : 'transparent',
                color: viewMode === '2D' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontWeight: viewMode === '2D' ? 700 : 500,
                transition: 'all 0.15s ease'
              }}
            >
              2D Topology
            </button>
          </div>
        </div>
      </div>

      {/* Canvas / Vector Viewport */}
      <div className="hero-3d-canvas-wrap extraordinary-viewport">
        {viewMode === '2D' || !hasWebGL ? (
          <WebGLFallback onSelectNode={setSelectedNode} selectedNode={selectedNode} />
        ) : (
          <ErrorBoundary fallback={<WebGLFallback onSelectNode={setSelectedNode} selectedNode={selectedNode} />}>
            <Canvas
              camera={{ position: [0, 0.7, 5.0], fov: 46 }}
              dpr={[1, Math.min(window.devicePixelRatio, 2)]}
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            >
              <ambientLight intensity={theme === 'light' ? 0.8 : 0.45} />
              <directionalLight position={[6, 8, 5]} intensity={theme === 'light' ? 1.2 : 0.9} color="#ffffff" />
              <pointLight position={[-10, -5, -8]} intensity={0.6} color="#00f5ff" />
              <pointLight position={[8, -8, 6]} intensity={0.4} color="#f43f5e" />

              <Suspense fallback={null}>
                <CyberGlobeMesh theme={theme} />
                <OrbitGimbal theme={theme} />
                <DeepSpaceDust count={180} theme={theme} />

                {/* Spline Transmission Arcs */}
                {SPATIAL_ARCS.map((arc, i) => {
                  const start = SPATIAL_NODE_MAP.get(arc.from);
                  const end = SPATIAL_NODE_MAP.get(arc.to);
                  if (!start || !end) return null;

                  const startVisible = filteredNodes.some(n => n.id === start.id);
                  const endVisible = filteredNodes.some(n => n.id === end.id);
                  if (!startVisible && !endVisible) return null;

                  return (
                    <TrafficTransmissionArc
                      key={i}
                      startNode={start}
                      endNode={end}
                      color={arc.color}
                      speed={arc.speed}
                      count={arc.count}
                      isSurge={isSurgeActive}
                    />
                  );
                })}

                {/* Spatial Node Beacons */}
                {filteredNodes.map((node) => (
                  <SpatialNodeBeacon
                    key={node.id}
                    node={node}
                    isSelected={selectedNode?.id === node.id}
                    onSelect={setSelectedNode}
                    theme={theme}
                  />
                ))}
              </Suspense>

              <OrbitControls
                ref={controlsRef}
                enablePan={false}
                minDistance={3.5}
                maxDistance={8}
                dampingFactor={0.06}
                autoRotate={isRotating}
                autoRotateSpeed={isSurgeActive ? 1.8 : 0.7}
              />
            </Canvas>
          </ErrorBoundary>
        )}

        {/* Floating Scene Controls (3D Mode) */}
        {viewMode === '3D' && hasWebGL && (
          <div className="hero-3d-controls">
            <button
              className={`hero-btn ${isSurgeActive ? 'surge-active' : ''}`}
              onClick={() => setIsSurgeActive(!isSurgeActive)}
              title="Toggle simulated volumetric attack surge"
            >
              <Zap size={14} />
              <span>{isSurgeActive ? 'Surge Active' : 'Simulate Surge'}</span>
            </button>
            <button
              className="hero-btn"
              onClick={() => setIsRotating(!isRotating)}
              title={isRotating ? 'Pause Rotation' : 'Resume Rotation'}
            >
              {isRotating ? <Pause size={14} /> : <Play size={14} />}
              <span>{isRotating ? 'Pause' : 'Rotate'}</span>
            </button>
            <button className="hero-btn" onClick={handleResetView} title="Reset Camera">
              <RotateCcw size={14} />
              <span>Reset View</span>
            </button>
          </div>
        )}

        {/* Selected Node Real Data Inspection Drawer */}
        {selectedNode && (
          <div className="hero-detail-drawer extraordinary-drawer">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: selectedNode.color, fontWeight: 700 }}>
                  {selectedNode.category}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedNode.label}
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: 12 }}>
              <div style={{ background: 'var(--bg-input)', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>FLOW COUNT</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {selectedNode.flows.toLocaleString()}
                </div>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>SHARE OF TRAFFIC</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: selectedNode.color, fontFamily: 'monospace' }}>
                  {selectedNode.percentage}%
                </div>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>TRANSPORT PROTO</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedNode.proto}
                </div>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>MEDIAN DURATION</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {selectedNode.durationMedian}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'var(--bg-input)', padding: '8px 10px', borderRadius: 6, borderLeft: `3px solid ${selectedNode.color}` }}>
              <strong>Empirical Insight:</strong> {selectedNode.insight}
            </div>
          </div>
        )}

        {/* Ambient HUD Bar */}
        <div className="hero-3d-overlay">
          <div className="hero-3d-hud-pill">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-emerald)' }} />
            <span>Global 3D Attack Matrix — Drag to rotate, scroll to zoom, click beacon pillars to inspect telemetry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
