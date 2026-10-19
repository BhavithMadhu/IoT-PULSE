import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Zap, Radio, Activity, ShieldCheck, ChevronRight, 
  Terminal, Cpu, Eye, Volume2, VolumeX, FastForward, Play 
} from 'lucide-react';

// Real RT-IOT2022 packet types to fly through
const PACKET_TEMPLATES = [
  { proto: 'TCP SYN', label: 'DOS_SYN_Hping', color: '#f43f5e', glow: '#fb7185', size: [0.18, 0.18, 0.6] },
  { proto: 'HTTP/TLS', label: 'ThingSpeak IoT', color: '#34d399', glow: '#6ee7b7', size: [0.15, 0.15, 0.45] },
  { proto: 'MQTT 1883', label: 'Telemetry Stream', color: '#10b981', glow: '#34d399', size: [0.14, 0.14, 0.4] },
  { proto: 'ARP L2', label: 'ARP Poisoning', color: '#f59e0b', glow: '#fbbf24', size: [0.16, 0.16, 0.5] },
  { proto: 'UDP SCAN', label: 'NMAP Recon', color: '#00f5ff', glow: '#38bdf8', size: [0.12, 0.12, 0.35] },
  { proto: 'SSH 22', label: 'Brute Force', color: '#c084fc', glow: '#d8b4fe', size: [0.13, 0.13, 0.38] }
];

// ==============================================================================
// 1. 3D FIBER OPTIC WARP TUNNEL & PACKET STREAMS
// ==============================================================================
function FiberTunnelRings({ warpSpeed = 1.0 }) {
  const ringsCount = 45;
  const ringsRef = useRef([]);

  useFrame((_, delta) => {
    ringsRef.current.forEach((ring) => {
      if (!ring) return;
      ring.position.z += delta * 18 * warpSpeed;
      if (ring.position.z > 6) {
        ring.position.z -= 90;
      }
      ring.rotation.z += delta * 0.12;
    });
  });

  const ringsData = useMemo(() => {
    return Array.from({ length: ringsCount }).map((_, i) => ({
      z: -i * 2.0,
      scale: 1.0 + Math.sin(i * 0.3) * 0.08
    }));
  }, [ringsCount]);

  return (
    <group>
      {ringsData.map((d, i) => (
        <mesh
          key={i}
          ref={(el) => (ringsRef.current[i] = el)}
          position={[0, 0, d.z]}
          scale={[d.scale, d.scale, 1]}
        >
          <ringGeometry args={[3.2, 3.23, 32]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? '#00f5ff' : i % 3 === 1 ? '#34d399' : '#0369a1'}
            transparent
            opacity={0.28}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// Flying Network Data Packets
function StreamingPackets({ count = 160, warpSpeed = 1.0 }) {
  const packets = useMemo(() => {
    return Array.from({ length: count }).map(() => {
      const type = PACKET_TEMPLATES[Math.floor(Math.random() * PACKET_TEMPLATES.length)];
      const radius = 0.8 + Math.random() * 2.1;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: -(Math.random() * 110),
        baseSpeed: 16 + Math.random() * 20,
        type,
        rotationZ: Math.random() * Math.PI
      };
    });
  }, [count]);

  const packetRefs = useRef([]);

  useFrame((_, delta) => {
    packetRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const p = packets[i];
      mesh.position.z += delta * p.baseSpeed * warpSpeed;

      // Stretch geometry along Z during hyperspace jump
      const zStretch = Math.min(1.0 + (warpSpeed - 1.0) * 1.8, 6.0);
      mesh.scale.set(1.0, 1.0, zStretch);

      // Loop back into deep space
      if (mesh.position.z > 6) {
        mesh.position.z = -105 - Math.random() * 10;
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.8 + Math.random() * 2.1;
        mesh.position.x = Math.cos(angle) * radius;
        mesh.position.y = Math.sin(angle) * radius;
      }
    });
  });

  return (
    <group>
      {packets.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => (packetRefs.current[i] = el)}
          position={[p.x, p.y, p.z]}
          rotation={[0, 0, p.rotationZ]}
        >
          <boxGeometry args={p.type.size} />
          <meshBasicMaterial
            color={p.type.color}
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// Hyperspace Streaking Particle Stars
function HyperSpeedStars({ count = 500, warpSpeed = 1.0 }) {
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.4 + Math.random() * 3.2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = -Math.random() * 120;
      spd[i] = 20 + Math.random() * 35;
    }
    return [pos, spd];
  }, [count]);

  const pointsRef = useRef();

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3 + 2;
      array[idx] += delta * speeds[i] * warpSpeed;
      if (array[idx] > 6) {
        array[idx] = -120;
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
        size={0.045}
        color="#00f5ff"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Parallax Camera Rig
function WarpCameraRig({ warpSpeed = 1.0 }) {
  useFrame((state) => {
    const mouseX = state.mouse.x * 0.4;
    const mouseY = state.mouse.y * 0.3;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, mouseX, 0.08);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, mouseY, 0.08);
    state.camera.rotation.z = THREE.MathUtils.lerp(state.camera.rotation.z, -mouseX * 0.25, 0.06);

    // Dynamic FOV distortion during hyperdrive
    const targetFov = warpSpeed >= 4 ? 75 : warpSpeed >= 2.5 ? 60 : 50;
    state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, targetFov, 0.1);
    state.camera.updateProjectionMatrix();
  });
  return null;
}

// ==============================================================================
// 2. MAIN PACKET WARP ENTRANCE EXPERIENCE
// ==============================================================================
export default function PacketWarpEntrance({ onEnter }) {
  const [warpSpeed, setWarpSpeed] = useState(1.0); // 1.0, 2.5, 5.0
  const [decryptionProgress, setDecryptionProgress] = useState(12);
  const [livePacketsCount, setLivePacketsCount] = useState(4892100);
  const [latency, setLatency] = useState(0.18);
  const [isHyperJumping, setIsHyperJumping] = useState(false);
  const [autoWarpCountdown, setAutoWarpCountdown] = useState(8);
  const [audioMuted, setAudioMuted] = useState(true);

  // Streaming packet logs
  const [packetLogs, setPacketLogs] = useState([
    { id: 1, proto: 'TCP_SYN', ip: '192.168.0.104:59247 -> 192.168.0.1:80', flag: 'CRITICAL_FLOOD', color: '#f43f5e' },
    { id: 2, proto: 'HTTP_TLS', ip: '192.168.0.112:443 -> CLOUD:THINGSPEAK', flag: 'TELEMETRY_OK', color: '#34d399' },
    { id: 3, proto: 'MQTT', ip: '192.168.0.110:1883 -> IOT_BROKER:TOPIC', flag: 'KEEP_ALIVE', color: '#10b981' },
    { id: 4, proto: 'ARP_SPOOF', ip: '00:0B:82:01:FC:44 -> BROADCAST', flag: 'L2_GATEWAY_MITM', color: '#f59e0b' }
  ]);

  // Live real-time updates
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setDecryptionProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.floor(Math.random() * 5) + 2;
      });
      setLivePacketsCount(prev => prev + Math.floor(Math.random() * 850) + 200);
      setLatency(+(0.15 + Math.random() * 0.08).toFixed(2));
    }, 280);

    const logTimer = setInterval(() => {
      const samples = [
        { proto: 'TCP_SYN', ip: `192.168.0.${Math.floor(Math.random()*200)}:${Math.floor(Math.random()*60000)} -> 192.168.0.1:80`, flag: 'SYN_BURST', color: '#f43f5e' },
        { proto: 'UDP_PROBE', ip: `192.168.0.24:${Math.floor(Math.random()*50000)} -> 192.168.0.104:UDP`, flag: 'ICMP_PORT_UNREACH', color: '#00f5ff' },
        { proto: 'MQTT_PUB', ip: '192.168.0.110:1883 -> CLOUD:BROKER', flag: 'QOS_1_SYNC', color: '#10b981' },
        { proto: 'TLS_1.3', ip: '192.168.0.112:443 -> API.THINGSPEAK', flag: 'ENCRYPTED_FLOW', color: '#34d399' }
      ];
      const nextLog = { ...samples[Math.floor(Math.random() * samples.length)], id: Date.now() };
      setPacketLogs(prev => [nextLog, ...prev.slice(0, 5)]);
    }, 450);

    // Auto-warp countdown
    const countTimer = setInterval(() => {
      setAutoWarpCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countTimer);
          handleEnterSystem();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(progressTimer);
      clearInterval(logTimer);
      clearInterval(countTimer);
    };
  }, []);

  const handleEnterSystem = () => {
    setIsHyperJumping(true);
    setWarpSpeed(6.0);
    // After 900ms hyperspace transition, trigger landing page arrival
    setTimeout(() => {
      if (onEnter) onEnter();
    }, 850);
  };

  return (
    <div className={`packet-warp-container ${isHyperJumping ? 'hyper-jumping' : ''}`}>
      {/* 3D WebGL Warp Tunnel Viewport */}
      <div className="warp-canvas-wrap">
        <Canvas
          camera={{ position: [0, 0, 3.2], fov: 50 }}
          dpr={[1, Math.min(window.devicePixelRatio, 2)]}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#030712']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[0, 0, 0]} color="#00f5ff" intensity={1.5} distance={15} />

          <Suspense fallback={null}>
            <FiberTunnelRings warpSpeed={warpSpeed} />
            <StreamingPackets count={160} warpSpeed={warpSpeed} />
            <HyperSpeedStars count={450} warpSpeed={warpSpeed} />
            <WarpCameraRig warpSpeed={warpSpeed} />
          </Suspense>
        </Canvas>
      </div>

      {/* Cybernetic Scanlines & Vignette */}
      <div className="warp-scanlines-overlay" />

      {/* =========================================================================
          STITCH-DESIGNED CYBERNETIC TELEMETRY HUD
          ========================================================================= */}
      
      {/* Top Header Bar */}
      <header className="warp-hud-header">
        <div className="warp-brand-group">
          <div className="warp-radar-ping">
            <span className="radar-dot" />
            <span className="radar-wave" />
          </div>
          <span className="warp-brand-title">IoT-PULSE</span>
          <span className="warp-brand-divider">//</span>
          <span className="warp-brand-sub">OPTICAL PACKET TUNNEL v4.9</span>
          <span className="warp-status-pill">[HYPER-LINK ESTABLISHED]</span>
        </div>

        <div className="warp-telemetry-ticker">
          <div className="ticker-item">
            <span className="ticker-label">INGESTION</span>
            <span className="ticker-val cyan">1.48 TB/s</span>
          </div>
          <div className="ticker-divider">·</div>
          <div className="ticker-item">
            <span className="ticker-label">PACKETS</span>
            <span className="ticker-val emerald">{livePacketsCount.toLocaleString()} pkts/s</span>
          </div>
          <div className="ticker-divider">·</div>
          <div className="ticker-item">
            <span className="ticker-label">LATENCY</span>
            <span className="ticker-val">{latency}ms</span>
          </div>
          <div className="ticker-divider">·</div>
          <div className="ticker-item">
            <span className="ticker-label">DATASET</span>
            <span className="ticker-val amber">RT-IOT2022 (123,117 Flows)</span>
          </div>
        </div>

        <div className="warp-header-actions">
          <button 
            onClick={() => setAudioMuted(!audioMuted)} 
            className="warp-icon-btn"
            title={audioMuted ? 'Telemetry Audio Off' : 'Telemetry Audio On'}
          >
            {audioMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <button onClick={handleEnterSystem} className="warp-skip-btn">
            <span>Skip Warp</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </header>

      {/* Left Tactical Stream Rail */}
      <aside className="warp-left-rail">
        <div className="warp-panel-box">
          <div className="panel-title-bar">
            <span className="panel-dot" />
            <span>LIVE FLOW INSPECTOR</span>
            <span className="panel-sub">AUTO-SNIFF</span>
          </div>
          <div className="packet-log-stream">
            {packetLogs.map((log) => (
              <div key={log.id} className="packet-log-entry" style={{ borderLeftColor: log.color }}>
                <div className="log-top">
                  <span className="log-proto" style={{ color: log.color }}>{log.proto}</span>
                  <span className="log-flag">{log.flag}</span>
                </div>
                <div className="log-ip">{log.ip}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Protocol Distribution Ratio */}
        <div className="warp-panel-box" style={{ marginTop: 12 }}>
          <div className="panel-title-bar">
            <span>TRAFFIC PROTOCOL MIX</span>
            <span className="panel-sub">L4 SHARE</span>
          </div>
          <div className="protocol-meter-bars">
            <div className="meter-row">
              <span className="meter-label">TCP (SYN Floods / HTTP / MQTT)</span>
              <span className="meter-pct cyan">89.69%</span>
            </div>
            <div className="meter-bar-track">
              <div className="meter-bar-fill cyan" style={{ width: '89.69%' }} />
            </div>

            <div className="meter-row" style={{ marginTop: 6 }}>
              <span className="meter-label">UDP (Recon / Scans)</span>
              <span className="meter-pct emerald">10.23%</span>
            </div>
            <div className="meter-bar-track">
              <div className="meter-bar-fill emerald" style={{ width: '10.23%' }} />
            </div>

            <div className="meter-row" style={{ marginTop: 6 }}>
              <span className="meter-label">ARP / Ethernet Spoofing</span>
              <span className="meter-pct amber">0.08%</span>
            </div>
            <div className="meter-bar-track">
              <div className="meter-bar-fill amber" style={{ width: '0.08%' }} />
            </div>
          </div>
        </div>
      </aside>

      {/* Center Tactical Targeting Reticle & Enter Actuator */}
      <main className="warp-center-hub">
        <div className="targeting-reticle">
          <div className="reticle-outer-ring" />
          <div className="reticle-inner-ring" />
          <div className="reticle-bracket top-left" />
          <div className="reticle-bracket top-right" />
          <div className="reticle-bracket bottom-left" />
          <div className="reticle-bracket bottom-right" />

          <div className="reticle-content">
            <div className="tunnel-sector-tag">
              <Radio size={12} className="spin-slow" />
              <span>OPTICAL FIBER DATAWAY // SECTOR 0x7F</span>
            </div>

            <h1 className="warp-hero-title">ENTERING NETWORK STREAM</h1>
            <p className="warp-hero-subtitle">
              Navigating through 123,117 bidirectional packet flows & cybernetic anomaly vectors
            </p>

            {/* Cipher Handshake Progress Bar */}
            <div className="warp-progress-container">
              <div className="progress-labels">
                <span>FLOW HANDSHAKE CIPHER</span>
                <span className="cyan">{Math.min(decryptionProgress, 100)}%</span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ width: `${Math.min(decryptionProgress, 100)}%` }} 
                />
              </div>
              <div className="progress-checksum">
                <span>SHA-512 HASH: 7F4A9C08BD1E...VERIFIED</span>
              </div>
            </div>

            {/* Primary Enter Platform CTA */}
            <button 
              onClick={handleEnterSystem}
              className="warp-primary-cta"
            >
              <Zap size={16} className="cta-icon" />
              <span>INITIALIZE PLATFORM & ENTER</span>
              <ChevronRight size={18} className="cta-arrow" />
            </button>

            {/* Auto-warp countdown notice */}
            <div className="auto-warp-notice">
              <span>Auto-engaging in </span>
              <strong className="cyan">00:0{autoWarpCountdown}s</strong>
              <span> · Press </span>
              <kbd>[ENTER]</kbd>
              <span> to fast-forward</span>
            </div>
          </div>
        </div>
      </main>

      {/* Right Terminal & Hex Dump */}
      <aside className="warp-right-rail">
        <div className="warp-panel-box">
          <div className="panel-title-bar">
            <Terminal size={12} />
            <span>PACKET HEX BUFFER</span>
            <span className="panel-sub">MEMORY: 0x00A4</span>
          </div>
          <div className="hex-dump-stream">
            <code>0x00A0: 49 6F 54 2D 50 75 6C 73 65 20 52 54 2D 49 4F 54</code>
            <code>0x00B0: 32 30 32 32 20 44 4F 53 5F 53 59 4E 5F 48 70 69</code>
            <code>0x00C0: 6E 67 20 37 36 2E 34 32 25 20 39 34 30 38 39 20</code>
            <code>0x00D0: 54 68 69 6E 67 5F 53 70 65 61 6B 20 31 32 35 30</code>
            <code>0x00E0: 41 52 50 5F 50 6F 69 73 69 6F 6E 69 6E 67 20 37</code>
            <code>0x00F0: 4D 51 54 54 5F 50 75 62 6C 69 73 68 20 34 31 34</code>
            <code>0x0100: 4E 4D 41 50 5F 53 59 4E 5F 53 43 41 4E 20 31 39</code>
            <code>0x0110: 4D 65 74 61 73 70 6C 6F 69 74 5F 42 72 75 74 65</code>
          </div>
        </div>

        {/* Threat Alert Radar Chip */}
        <div className="warp-panel-box" style={{ marginTop: 12 }}>
          <div className="panel-title-bar">
            <span className="panel-alert-dot" />
            <span>ANOMALY DETECTION</span>
            <span className="panel-sub">ML PIPELINE</span>
          </div>
          <div className="radar-status-body">
            <div className="radar-badge-item red">
              <span className="radar-tag">CRITICAL</span>
              <span>DOS_SYN_Hping (76.42%)</span>
            </div>
            <div className="radar-badge-item green" style={{ marginTop: 6 }}>
              <span className="radar-tag green">NORMAL</span>
              <span>ThingSpeak Telemetry (10.16%)</span>
            </div>
            <div className="radar-badge-item amber" style={{ marginTop: 6 }}>
              <span className="radar-tag amber">ELEVATED</span>
              <span>ARP Spoofing L2 (6.29%)</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Bottom Command Dock & Speed Regulators */}
      <footer className="warp-bottom-dock">
        <div className="dock-cli">
          <span className="cli-prompt">operator@iot-pulse-gateway:~$</span>
          <span className="cli-cmd">warp --velocity={warpSpeed}x --target=landing-overview</span>
        </div>

        {/* Warp Velocity Selectors */}
        <div className="dock-speed-controls">
          <span className="speed-label">VELOCITY:</span>
          <button
            onClick={() => setWarpSpeed(1.0)}
            className={`speed-btn ${warpSpeed === 1.0 ? 'active' : ''}`}
          >
            1X CRUISE
          </button>
          <button
            onClick={() => setWarpSpeed(2.5)}
            className={`speed-btn ${warpSpeed === 2.5 ? 'active' : ''}`}
          >
            2.5X WARP
          </button>
          <button
            onClick={() => setWarpSpeed(5.0)}
            className={`speed-btn hyper ${warpSpeed === 5.0 ? 'active' : ''}`}
          >
            5X HYPERDRIVE
          </button>
        </div>
      </footer>

      {/* Relativistic Hyperspace Flash Veil */}
      <div className={`hyperspace-flash-veil ${isHyperJumping ? 'flash' : ''}`} />
    </div>
  );
}
