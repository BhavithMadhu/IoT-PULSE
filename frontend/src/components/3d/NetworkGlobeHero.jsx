import React, { useRef, useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCcw, Play, Pause, Layers, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import WebGLFallback from './WebGLFallback';
import ErrorBoundary from '../ErrorBoundary';

// Verified real dataset node profiles
const DATASET_NODES = [
  {
    id: 'DOS_SYN_Hping',
    label: 'DOS_SYN_Hping',
    category: 'Volumetric Flooding',
    flows: 94089,
    percentage: 76.42,
    color: '#f43f5e',
    isNormal: false,
    proto: 'TCP',
    service: 'Unassigned',
    durationMedian: '0.000000s',
    pos: [1.6, 0.4, 0.9],
    radius: 0.16,
    insight: 'Single-packet SYN flood omitting 3-way handshake completion. High-SYN ratio is 0.00%.'
  },
  {
    id: 'Thing_Speak',
    label: 'Thing_Speak Telemetry',
    category: 'Normal IoT Telemetry',
    flows: 12509,
    percentage: 10.16,
    color: '#34d399',
    isNormal: true,
    proto: 'TCP',
    service: 'HTTP / Cloud',
    durationMedian: '0.000021s',
    pos: [-1.4, -0.6, 1.2],
    radius: 0.12,
    insight: 'Standard IoT cloud sensor telemetry. Demonstrates balanced bidirectional packet exchange.'
  },
  {
    id: 'ARP_poisioning',
    label: 'ARP Poisoning',
    category: 'Layer 2 Spoofing',
    flows: 7750,
    percentage: 6.29,
    color: '#f59e0b',
    isNormal: false,
    proto: 'ARP / Ether',
    service: 'Internal L2',
    durationMedian: '0.000000s',
    pos: [0.3, 1.7, -0.8],
    radius: 0.11,
    insight: 'Internal network reconnaissance & man-in-the-middle gateway address falsification.'
  },
  {
    id: 'MQTT_Publish',
    label: 'MQTT Sensor Telemetry',
    category: 'Normal IoT Protocol',
    flows: 4146,
    percentage: 3.37,
    color: '#10b981',
    isNormal: true,
    proto: 'TCP',
    service: 'MQTT (1883)',
    durationMedian: '44.524108s',
    pos: [-1.1, 1.2, 0.6],
    radius: 0.09,
    insight: 'Longest persistent connections in the dataset. Normal broker keep-alive dialogue.'
  },
  {
    id: 'NMAP_UDP_SCAN',
    label: 'NMAP UDP Scan',
    category: 'Reconnaissance',
    flows: 2584,
    percentage: 2.10,
    color: '#22d3ee',
    isNormal: false,
    proto: 'UDP',
    service: 'Various Probes',
    durationMedian: '0.000000s',
    pos: [0.9, -1.3, -1.1],
    radius: 0.08,
    insight: 'Stateless probe scan generating instant ICMP Port Unreachable responses.'
  },
  {
    id: 'NMAP_SYN_SCAN',
    label: 'NMAP SYN Scan',
    category: 'Port Scan',
    flows: 1990,
    percentage: 1.62,
    color: '#38bdf8',
    isNormal: false,
    proto: 'TCP',
    service: 'Multi-port Probing',
    durationMedian: '0.000000s',
    pos: [-0.6, -1.5, 0.8],
    radius: 0.08,
    insight: 'Half-open port reconnaissance targeting standard and uncommon daemon ports.'
  },
  {
    id: 'Metasploit_Brute_Force',
    label: 'Metasploit Brute Force',
    category: 'Credential Attack',
    flows: 121,
    percentage: 0.10,
    color: '#a855f7',
    isNormal: false,
    proto: 'TCP',
    service: 'SSH / Telnet',
    durationMedian: '0.004210s',
    pos: [1.2, -0.4, 1.5],
    radius: 0.06,
    insight: 'Targeted dictionary attacks against IoT gateway administrative services.'
  }
];

// Inner Spherical Wireframe Lattice
function GlobeLattice({ theme = 'dark' }) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08;
      meshRef.current.rotation.x += delta * 0.02;
    }
  });

  const wireColor = theme === 'light' ? '#0284c7' : '#22d3ee';
  const ring1Color = theme === 'light' ? '#059669' : '#34d399';
  const ring2Color = theme === 'light' ? '#0284c7' : '#22d3ee';

  return (
    <group ref={meshRef}>
      {/* Primary geodetic wireframe */}
      <mesh>
        <sphereGeometry args={[2.0, 24, 24]} />
        <meshBasicMaterial
          color={wireColor}
          wireframe
          transparent
          opacity={theme === 'light' ? 0.22 : 0.12}
        />
      </mesh>
      {/* Secondary inner rings */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <ringGeometry args={[2.05, 2.08, 64]} />
        <meshBasicMaterial color={ring1Color} transparent opacity={theme === 'light' ? 0.3 : 0.18} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 4, 0, 0]}>
        <ringGeometry args={[2.15, 2.18, 64]} />
        <meshBasicMaterial color={ring2Color} transparent opacity={theme === 'light' ? 0.25 : 0.14} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Ambient Floating Telemetry Particles
function FloatingParticles({ count = 120, theme = 'dark' }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2.4 + Math.random() * 1.5;
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
      pointsRef.current.rotation.y -= delta * 0.03;
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
        size={0.035}
        color={theme === 'light' ? '#0284c7' : '#22d3ee'}
        transparent
        opacity={theme === 'light' ? 0.6 : 0.4}
        sizeAttenuation
      />
    </points>
  );
}

// Interactive Network Cluster Node
function InteractiveNode({ node, isSelected, onSelect, theme = 'dark' }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const scale = isSelected ? 1.3 : hovered ? 1.2 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <group position={node.pos}>
      {/* Node Sphere */}
      <mesh
        ref={meshRef}
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
        <sphereGeometry args={[node.radius, 16, 16]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isSelected || hovered ? (theme === 'light' ? 0.5 : 0.8) : 0.25}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Orbiting Halo for selected or hovered state */}
      {(isSelected || hovered) && (
        <mesh>
          <ringGeometry args={[node.radius * 1.4, node.radius * 1.6, 32]} />
          <meshBasicMaterial color={node.color} side={THREE.DoubleSide} transparent opacity={0.7} />
        </mesh>
      )}

      {/* HTML Label on 3D Node */}
      <Html distanceFactor={5.2} position={[0, node.radius + 0.12, 0]} center>
        <div style={{
          background: isSelected 
            ? (theme === 'light' ? '#ffffff' : 'rgba(8, 11, 16, 0.95)') 
            : (theme === 'light' ? 'rgba(255, 255, 255, 0.92)' : 'rgba(12, 17, 24, 0.85)'),
          border: `1px solid ${isSelected ? node.color : (theme === 'light' ? 'rgba(15, 23, 42, 0.18)' : 'rgba(148, 163, 184, 0.18)')}`,
          padding: '1px 5px',
          borderRadius: '3px',
          fontSize: '7.5px',
          letterSpacing: '0.02em',
          fontWeight: 600,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          color: theme === 'light' ? '#0f172a' : '#f1f5f9',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          userSelect: 'none',
          boxShadow: isSelected 
            ? `0 2px 8px ${node.color}50` 
            : (theme === 'light' ? '0 1px 4px rgba(15, 23, 42, 0.06)' : 'none'),
          transition: 'all 0.15s ease'
        }}>
          {node.label} <span style={{ color: node.color, fontWeight: 700 }}>{node.percentage}%</span>
        </div>
      </Html>
    </group>
  );
}

// Spline Transmission Arc between Two Nodes
function TransmissionArc({ start, end, color = '#22d3ee', theme = 'dark' }) {
  const line = useMemo(() => {
    const v1 = new THREE.Vector3(...start);
    const v2 = new THREE.Vector3(...end);
    const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(2.3); // Arc outwards
    const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
    const points = curve.getPoints(32);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: theme === 'light' ? 0.45 : 0.28
    });
    return new THREE.Line(geometry, material);
  }, [start, end, color, theme]);

  return <primitive object={line} />;
}

// Main Network Globe 3D Scene
export default function NetworkGlobeHero({ overviewData, theme = 'dark' }) {
  const [selectedNode, setSelectedNode] = useState(DATASET_NODES[0]); // Default to DOS_SYN_Hping
  const [isRotating, setIsRotating] = useState(true);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [viewMode, setViewMode] = useState('3D'); // '3D' | '2D'
  const controlsRef = useRef();

  useEffect(() => {
    // Check WebGL availability
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

  return (
    <div className="hero-3d-card">
      {/* Header Bar */}
      <div className="hero-3d-header">
        <div className="hero-3d-title-group">
          <span className="hero-3d-badge">{viewMode === '3D' ? '3D Network Intelligence' : '2D Topology View'}</span>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Spatial Traffic Topology & Threat Clustering (123,117 Flows)
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
              3D Spatial
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

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }} />
            {viewMode === '3D' ? 'WebGL 3D Active' : 'SVG Vector Map'}
          </div>
        </div>
      </div>

      {/* Canvas / Vector Viewport */}
      <div className="hero-3d-canvas-wrap">
        {viewMode === '2D' || !hasWebGL ? (
          <WebGLFallback onSelectNode={setSelectedNode} selectedNode={selectedNode} />
        ) : (
          <ErrorBoundary fallback={<WebGLFallback onSelectNode={setSelectedNode} selectedNode={selectedNode} />}>
            <Canvas
              camera={{ position: [0, 0.8, 5.0], fov: 46 }}
              dpr={[1, Math.min(window.devicePixelRatio, 2)]}
              gl={{ antialias: true, alpha: true }}
            >
              <ambientLight intensity={theme === 'light' ? 0.75 : 0.4} />
              <pointLight position={[10, 10, 10]} intensity={theme === 'light' ? 1.0 : 0.8} color="#22d3ee" />
              <pointLight position={[-10, -10, -10]} intensity={theme === 'light' ? 0.6 : 0.4} color="#34d399" />

              <Suspense fallback={null}>
                <GlobeLattice theme={theme} />
                <FloatingParticles count={140} theme={theme} />

                {/* Transmission Arcs */}
                <TransmissionArc start={DATASET_NODES[0].pos} end={DATASET_NODES[1].pos} color="#34d399" theme={theme} />
                <TransmissionArc start={DATASET_NODES[0].pos} end={DATASET_NODES[3].pos} color="#10b981" theme={theme} />
                <TransmissionArc start={DATASET_NODES[2].pos} end={DATASET_NODES[0].pos} color="#f59e0b" theme={theme} />
                <TransmissionArc start={DATASET_NODES[4].pos} end={DATASET_NODES[1].pos} color="#22d3ee" theme={theme} />

                {/* Dataset Nodes */}
                {DATASET_NODES.map((node) => (
                  <InteractiveNode
                    key={node.id}
                    node={node}
                    isSelected={selectedNode?.id === node.id}
                    onSelect={(n) => setSelectedNode(n)}
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
                autoRotateSpeed={0.7}
              />
            </Canvas>
          </ErrorBoundary>
        )}

        {/* Floating Scene Controls (3D Mode) */}
        {viewMode === '3D' && hasWebGL && (
          <div className="hero-3d-controls">
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
          <div className="hero-detail-drawer">
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
            <span>Interactive 3D Spatial Topology — Click nodes to inspect behavioral telemetry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
