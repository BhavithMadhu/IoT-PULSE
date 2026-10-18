import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Shield, ShieldAlert, CheckCircle2, RotateCcw, Filter } from 'lucide-react';
import ErrorBoundary from '../ErrorBoundary';

const THREAT_NODES = [
  { id: 'DOS_SYN_Hping', label: 'DOS_SYN_Hping', x: 2.2, y: 0.5, z: 0.2, r: 0.25, color: '#f43f5e', proto: 'TCP', count: 94089, isNormal: false },
  { id: 'Thing_Speak', label: 'Thing_Speak (Normal)', x: -1.8, y: -0.4, z: 0.8, r: 0.18, color: '#34d399', proto: 'TCP', count: 12509, isNormal: true },
  { id: 'ARP_poisioning', label: 'ARP Poisoning', x: 0.5, y: 1.8, z: -0.6, r: 0.16, color: '#f59e0b', proto: 'ARP', count: 7750, isNormal: false },
  { id: 'MQTT_Publish', label: 'MQTT (Normal)', x: -1.2, y: 1.4, z: 0.4, r: 0.15, color: '#10b981', proto: 'TCP', count: 4146, isNormal: true },
  { id: 'NMAP_UDP_SCAN', label: 'NMAP UDP Scan', x: 1.2, y: -1.6, z: -1.2, r: 0.14, color: '#22d3ee', proto: 'UDP', count: 2584, isNormal: false },
  { id: 'NMAP_SYN_SCAN', label: 'NMAP SYN Scan', x: -0.8, y: -1.8, z: 0.6, r: 0.13, color: '#38bdf8', proto: 'TCP', count: 1990, isNormal: false },
  { id: 'NMAP_FIN_SCAN', label: 'NMAP FIN Scan', x: 0.2, y: -1.5, z: 1.4, r: 0.11, color: '#60a5fa', proto: 'TCP', count: 421, isNormal: false },
  { id: 'NMAP_OS_DETECTION', label: 'NMAP OS Detection', x: -1.5, y: -1.1, z: -1.0, r: 0.10, color: '#818cf8', proto: 'TCP', count: 327, isNormal: false },
  { id: 'NMAP_ACK_SCAN', label: 'NMAP ACK Scan', x: 1.6, y: -0.8, z: 1.1, r: 0.10, color: '#a78bfa', proto: 'TCP', count: 254, isNormal: false },
  { id: 'NMAP_XMAS_SCAN', label: 'NMAP XMAS Scan', x: 0.8, y: 1.2, z: 1.5, r: 0.09, color: '#c084fc', proto: 'TCP', count: 201, isNormal: false },
  { id: 'Metasploit_Brute_Force', label: 'Metasploit Brute', x: 1.4, y: 0.9, z: -1.5, r: 0.08, color: '#e879f9', proto: 'TCP', count: 121, isNormal: false },
  { id: 'WepAttack', label: 'WepAttack', x: -0.4, y: 1.9, z: -1.2, r: 0.07, color: '#fb7185', proto: 'Wireless', count: 35, isNormal: false },
];

// Protocol Hubs
const HUBS = [
  { id: 'TCP_HUB', label: 'TCP Core (89.69%)', pos: [0, 0, 0], color: '#22d3ee', radius: 0.28 },
  { id: 'UDP_HUB', label: 'UDP Core (10.23%)', pos: [1.5, -1.2, -0.8], color: '#34d399', radius: 0.18 }
];

function HubNode({ hub, theme = 'dark' }) {
  return (
    <group position={hub.pos}>
      <mesh>
        <sphereGeometry args={[hub.radius, 24, 24]} />
        <meshStandardMaterial
          color={hub.color}
          emissive={hub.color}
          emissiveIntensity={theme === 'light' ? 0.35 : 0.5}
          wireframe
        />
      </mesh>
      <Html distanceFactor={12} position={[0, hub.radius + 0.15, 0]} center>
        <div style={{
          background: theme === 'light' ? 'rgba(255, 255, 255, 0.94)' : 'rgba(8, 11, 16, 0.88)',
          border: `1px solid ${hub.color}`,
          color: theme === 'light' ? '#0f172a' : hub.color,
          padding: '2px 6px',
          borderRadius: 4,
          fontSize: '9.5px',
          fontWeight: 700,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          boxShadow: theme === 'light' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none'
        }}>
          {hub.label}
        </div>
      </Html>
    </group>
  );
}

function ThreatSphere({ node, isSelected, onSelect, theme = 'dark' }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      const s = isSelected ? 1.35 : hovered ? 1.2 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
    }
  });

  return (
    <group position={[node.x, node.y, node.z]}>
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
        <sphereGeometry args={[node.r, 16, 16]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isSelected || hovered ? (theme === 'light' ? 0.5 : 0.7) : 0.25}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      <Html distanceFactor={12} position={[0, node.r + 0.14, 0]} center>
        <div style={{
          background: isSelected 
            ? (theme === 'light' ? '#ffffff' : 'rgba(8, 11, 16, 0.95)') 
            : (theme === 'light' ? 'rgba(255, 255, 255, 0.92)' : 'rgba(12, 17, 24, 0.85)'),
          border: `1px solid ${isSelected ? node.color : (theme === 'light' ? 'rgba(15, 23, 42, 0.2)' : 'rgba(148, 163, 184, 0.2)')}`,
          color: theme === 'light' ? '#0f172a' : '#f1f5f9',
          padding: '2px 6px',
          borderRadius: 4,
          fontSize: '9.5px',
          fontWeight: 600,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          userSelect: 'none',
          boxShadow: isSelected 
            ? `0 2px 10px ${node.color}50` 
            : (theme === 'light' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none')
        }}>
          {node.label}
        </div>
      </Html>
    </group>
  );
}

function ConnectionLine({ start, end, color, theme = 'dark' }) {
  const line = useMemo(() => {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: theme === 'light' ? 0.35 : 0.2
    });
    return new THREE.Line(geometry, material);
  }, [start, end, color, theme]);

  return <primitive object={line} />;
}

export default function ThreatTopology3D({ selectedThreat, onSelectThreat, theme = 'dark' }) {
  const [filterProto, setFilterProto] = useState('ALL');
  const controlsRef = useRef();

  const filteredNodes = useMemo(() => {
    if (filterProto === 'ALL') return THREAT_NODES;
    return THREAT_NODES.filter((n) => n.proto === filterProto);
  }, [filterProto]);

  return (
    <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', marginBottom: 28 }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: theme === 'light' ? 'rgba(241, 245, 249, 0.6)' : 'rgba(8, 11, 16, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="hero-3d-badge">3D Threat Space</span>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Behavioral Constellation & Protocol Clustering
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Filter Transport:</span>
          {['ALL', 'TCP', 'UDP'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterProto(p)}
              style={{
                background: filterProto === p ? 'var(--accent-cyan-subtle)' : 'var(--bg-input)',
                border: `1px solid ${filterProto === p ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                color: filterProto === p ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => controlsRef.current?.reset()}
            className="hero-btn"
            style={{ padding: '3px 8px', fontSize: '0.72rem' }}
          >
            <RotateCcw size={12} />
            Reset View
          </button>
        </div>
      </div>

      <div style={{ 
        height: '360px', 
        position: 'relative', 
        background: theme === 'light' 
          ? 'radial-gradient(circle at 50% 50%, #edf2f7 0%, #f1f5f9 80%)' 
          : 'radial-gradient(circle at 50% 50%, #0d1521 0%, #080b10 80%)' 
      }}>
        <ErrorBoundary fallback={<div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>3D Constellation Viewport (Hardware WebGL Fallback Active)</div>}>
          <Canvas camera={{ position: [0, 1.0, 5.2], fov: 45 }}>
            <ambientLight intensity={theme === 'light' ? 0.75 : 0.4} />
            <pointLight position={[8, 8, 8]} intensity={theme === 'light' ? 0.9 : 0.7} color="#22d3ee" />
            <pointLight position={[-8, -8, -8]} intensity={theme === 'light' ? 0.6 : 0.4} color="#f43f5e" />

            <Suspense fallback={null}>
              {/* Core Hubs */}
              {HUBS.map((hub) => (
                <HubNode key={hub.id} hub={hub} theme={theme} />
              ))}

              {/* Connecting lines between hubs and nodes */}
              {filteredNodes.map((node) => {
                const targetHub = node.proto === 'UDP' ? HUBS[1] : HUBS[0];
                return (
                  <ConnectionLine
                    key={`line-${node.id}`}
                    start={[node.x, node.y, node.z]}
                    end={targetHub.pos}
                    color={node.color}
                    theme={theme}
                  />
                );
              })}

              {/* Threat Nodes */}
              {filteredNodes.map((node) => (
                <ThreatSphere
                  key={node.id}
                  node={node}
                  isSelected={selectedThreat?.id === node.id}
                  onSelect={(n) => onSelectThreat && onSelectThreat(n)}
                  theme={theme}
                />
              ))}
            </Suspense>

            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              minDistance={3.2}
              maxDistance={7.5}
              dampingFactor={0.06}
              autoRotate
              autoRotateSpeed={0.5}
            />
          </Canvas>
        </ErrorBoundary>

        <div style={{
          position: 'absolute',
          bottom: 12,
          left: 16,
          background: theme === 'light' ? 'rgba(255, 255, 255, 0.92)' : 'rgba(12, 17, 24, 0.85)',
          padding: '6px 12px',
          borderRadius: 6,
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)',
          pointerEvents: 'none'
        }}>
          Node radius correlates with class volume · Colors delineate attack families vs normal telemetry
        </div>
      </div>
    </div>
  );
}
