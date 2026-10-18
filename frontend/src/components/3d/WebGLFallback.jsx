import React, { useState } from 'react';
import { Shield, Activity, Info, RefreshCw } from 'lucide-react';

export default function WebGLFallback({ onSelectNode, selectedNode, attackSummary = [] }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  // Core conceptual IoT network topology nodes
  const nodes = [
    { id: 'DOS_SYN_Hping', label: 'DOS SYN Hping', x: 260, y: 110, r: 24, color: '#f43f5e', count: 94089, pct: '76.42%', type: 'Malicious Flood' },
    { id: 'Thing_Speak', label: 'ThingSpeak Telemetry', x: 140, y: 190, r: 12, color: '#34d399', count: 12509, pct: '10.16%', type: 'Normal IoT' },
    { id: 'ARP_poisioning', label: 'ARP Poisoning', x: 380, y: 170, r: 16, color: '#f59e0b', count: 7750, pct: '6.29%', type: 'L2 Spoofing' },
    { id: 'NMAP_UDP_SCAN', label: 'NMAP UDP Scan', x: 200, y: 280, r: 14, color: '#22d3ee', count: 2584, pct: '2.10%', type: 'Reconnaissance' },
    { id: 'NMAP_SYN_SCAN', label: 'NMAP SYN Scan', x: 330, y: 290, r: 14, color: '#38bdf8', count: 1990, pct: '1.62%', type: 'Port Scan' },
    { id: 'MQTT_Publish', label: 'MQTT Telemetry', x: 260, y: 200, r: 18, color: '#10b981', count: 4146, pct: '3.37%', type: 'Normal MQTT' },
  ];

  const links = [
    { from: nodes[0], to: nodes[5] },
    { from: nodes[1], to: nodes[5] },
    { from: nodes[2], to: nodes[0] },
    { from: nodes[3], to: nodes[0] },
    { from: nodes[4], to: nodes[0] },
    { from: nodes[1], to: nodes[3] },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 520 380" style={{ width: '100%', height: '100%', maxHeight: '380px' }}>
        <defs>
          <radialGradient id="fallbackGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#080b10" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Ambient background circle */}
        <circle cx="260" cy="200" r="160" fill="url(#fallbackGlow)" />
        <circle cx="260" cy="200" r="130" fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeDasharray="4 6" />
        <circle cx="260" cy="200" r="80" fill="none" stroke="rgba(52, 211, 153, 0.12)" />

        {/* Topological Link Lines */}
        {links.map((link, idx) => (
          <line
            key={`link-${idx}`}
            x1={link.from.x}
            y1={link.from.y}
            x2={link.to.x}
            y2={link.to.y}
            stroke="url(#linkGrad)"
            strokeWidth="1.5"
            strokeDasharray="2 3"
          />
        ))}

        {/* Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const isHovered = hoveredNode?.id === node.id;

          return (
            <g
              key={node.id}
              onClick={() => onSelectNode && onSelectNode(node)}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Outer halo if selected or hovered */}
              {(isSelected || isHovered) && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r + 7}
                  fill="none"
                  stroke={node.color}
                  strokeWidth="1.5"
                  opacity="0.8"
                  style={{ transition: 'all 0.2s' }}
                />
              )}
              {/* Node core */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill={node.color}
                opacity={isSelected || isHovered ? 1 : 0.85}
                filter="drop-shadow(0 0 8px rgba(0,0,0,0.6))"
              />
              {/* Label */}
              <text
                x={node.x}
                y={node.y + node.r + 15}
                textAnchor="middle"
                fill="#f1f5f9"
                fontSize="11"
                fontWeight="500"
                fontFamily="sans-serif"
              >
                {node.label}
              </text>
              <text
                x={node.x}
                y={node.y + node.r + 27}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="9"
                fontFamily="monospace"
              >
                {node.pct}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{
        position: 'absolute',
        top: 12,
        left: 16,
        fontSize: '0.75rem',
        color: '#94a3b8',
        background: 'rgba(12, 17, 24, 0.8)',
        padding: '4px 10px',
        borderRadius: 6,
        border: '1px solid rgba(148, 163, 184, 0.12)'
      }}>
        2D Precision Topology View (WebGL Hardware Acceleration Fallback Active)
      </div>
    </div>
  );
}
