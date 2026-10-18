import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Shield, ShieldAlert, Filter, Search, Terminal, Radio, Sparkles, Layers } from 'lucide-react';
import ThreatTopology3D from '../components/3d/ThreatTopology3D';

const ATTACK_DESCRIPTIONS = {
  "DOS_SYN_Hping": "Volumetric TCP SYN flood simulation using Hping3. Flood generates high rates of incomplete handshakes to exhaust server TCP connection buffers.",
  "Thing_Speak": "Legitimate cloud IoT telemetry channel sending continuous periodic sensor telemetry readings to ThingSpeak channels over HTTP/HTTPS.",
  "ARP_poisioning": "Man-In-The-Middle (MITM) exploit broadcasting forged ARP reply packets to corrupt router ARP cache tables and intercept LAN traffic.",
  "MQTT_Publish": "Lightweight publish-subscribe IoT messaging protocol telemetry. Maintains long-lived TCP sessions with intermittent telemetry payloads.",
  "NMAP_UDP_SCAN": "Reconnaissance probing targeting open UDP service ports by transmitting stateless UDP datagrams and analyzing ICMP unreachable responses.",
  "NMAP_XMAS_TREE_SCAN": "Stealth TCP port scanning utilizing abnormal flag combinations (FIN, URG, and PSH simultaneously) to bypass naive stateful inspection rules.",
  "NMAP_OS_DETECTION": "Active operating system fingerprinting sending crafted TCP/UDP packets with distinct TCP window sizes, options, and flags.",
  "NMAP_TCP_scan": "Standard TCP SYN port sweep across target hosts to identify active listening server daemon sockets.",
  "DDOS_Slowloris": "Low-and-slow application-layer attack holding HTTP connections open by periodically transmitting partial HTTP headers without completing requests.",
  "Wipro_bulb": "Normal smart lighting device IoT state synchronization and status polling communication over local network sockets.",
  "Metasploit_Brute_Force_SSH": "Automated dictionary attack attempting rapid SSH authentication sequences against port 22 to crack user credentials.",
  "NMAP_FIN_SCAN": "Stealth reconnaissance scanning technique sending bare TCP FIN packets without prior SYN synchronization."
};

export default function AttackIntelligencePage({ theme }) {
  const [attacks, setAttacks] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [scale, setScale] = useState('log'); // 'log' or 'linear'
  const [selectedAttack, setSelectedAttack] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.getAttackDistribution();
        setAttacks(res.distribution);
        if (res.distribution.length > 0) {
          setSelectedAttack(res.distribution[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = attacks.filter((item) => {
    const matchesSearch = item.attack_type.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'NORMAL') return item.is_normal;
    if (filterType === 'ATTACK') return !item.is_normal;
    if (filterType === 'SCAN') return item.attack_type.includes('NMAP');
    if (filterType === 'DOS') return item.attack_type.includes('DOS');
    return true;
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShieldAlert size={26} style={{ color: 'var(--accent-rose)' }} />
            Attack Intelligence & Spatial Threat Taxonomy
          </h1>
          <p className="page-subtitle">
            Forensic taxonomy, behavioral profiles, and volume distributions across all 12 recorded IoT network behaviors.
          </p>
        </div>
        <div className="chip chip-emerald">
          <Sparkles size={14} />
          <span>Multi-Dimensional Threat Clustering</span>
        </div>
      </div>

      {/* 3D Threat Constellation Visualizer */}
      <ThreatTopology3D
        selectedThreat={selectedAttack ? { id: selectedAttack.attack_type } : null}
        onSelectThreat={(node) => {
          const match = attacks.find((a) => a.attack_type === node.id || a.attack_type.includes(node.id));
          if (match) setSelectedAttack(match);
        }}
        theme={theme}
      />

      {/* Filter and Control Toolbar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Category buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Classes (12)' },
              { id: 'ATTACK', label: 'Attacks Only (9)' },
              { id: 'NORMAL', label: 'Normal IoT (3)' },
              { id: 'SCAN', label: 'Port Scans (5)' },
              { id: 'DOS', label: 'DoS / DDoS (2)' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterType(cat.id)}
                className={`btn ${filterType === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Scale toggle & Search */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>Scale:</span>
              <button
                onClick={() => setScale(scale === 'log' ? 'linear' : 'log')}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
              >
                {scale === 'log' ? 'Logarithmic (log10)' : 'Linear'}
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search attack label..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-control"
                style={{ paddingLeft: '32px', width: '220px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Visual Bars & Deep Profile */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px' }}>
        {/* Left Column: Interactive Attack List & Volume Bars */}
        <div className="glass-panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
                Attack Volume Comparison ({scale.toUpperCase()} Scale)
              </div>
              <div className="panel-desc">Click any category row to inspect full forensic behavioral attributes</div>
            </div>
            <span className="chip">{filtered.length} Displayed</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((item) => {
              const isSelected = selectedAttack?.attack_type === item.attack_type;
              const maxCount = attacks[0]?.record_count || 94089;
              const barWidth = scale === 'log' 
                ? (Math.log10(Math.max(item.record_count, 1)) / Math.log10(maxCount)) * 100
                : (item.record_count / maxCount) * 100;

              return (
                <div 
                  key={item.attack_type}
                  onClick={() => setSelectedAttack(item)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(34, 211, 238, 0.12)' : 'rgba(14, 22, 34, 0.6)',
                    border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 0 15px rgba(34, 211, 238, 0.2)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {item.attack_type}
                      </span>
                      {item.is_normal ? (
                        <span className="chip chip-emerald" style={{ padding: '1px 6px', fontSize: '0.65rem' }}>Normal</span>
                      ) : (
                        <span className="chip" style={{ padding: '1px 6px', fontSize: '0.65rem', color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}>Attack</span>
                      )}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>
                      {item.record_count.toLocaleString()} ({item.percentage}%)
                    </span>
                  </div>

                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${Math.max(barWidth, 1.2)}%`,
                        backgroundColor: item.is_normal 
                          ? 'var(--accent-emerald)' 
                          : isSelected 
                            ? 'var(--accent-cyan)' 
                            : 'var(--accent-rose)'
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Selected Profile */}
        <div>
          {selectedAttack && (
            <div className="glass-panel" style={{ borderTop: `3px solid ${selectedAttack.is_normal ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`, marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                    {selectedAttack.attack_type}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: selectedAttack.is_normal ? 'var(--accent-emerald)' : 'var(--accent-rose)', marginTop: '2px', fontWeight: 600 }}>
                    {selectedAttack.is_normal ? 'Benign IoT Telemetry Stream' : 'Simulated Malicious Vector'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                    {selectedAttack.record_count.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {selectedAttack.percentage}% of Total Flows
                  </div>
                </div>
              </div>

              <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '8px', marginBottom: '18px', fontSize: '0.85rem', lineHeight: '1.6', border: '1px solid var(--border-subtle)' }}>
                {ATTACK_DESCRIPTIONS[selectedAttack.attack_type] || "Network traffic profile documented in the RT-IOT2022 cybersecurity dataset."}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div style={{ padding: '12px', background: 'rgba(12, 17, 24, 0.6)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Classification Role</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {selectedAttack.percentage > 10 ? 'Majority Class' : selectedAttack.percentage > 1 ? 'Core Class' : 'Rare Minority Class'}
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(12, 17, 24, 0.6)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sample Status</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {selectedAttack.record_count >= 30 ? 'Included in Hypothesis Tests (n >= 30)' : 'Excluded from KW Tests (n < 30)'}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-primary)' }}>SOC Forensics Context:</strong> This label exhibits specific feature fingerprints (e.g. TCP flags, duration, and forward/backward symmetry). To explore matching flow tuples and download raw CSV extracts, navigate to the <strong>Data Explorer</strong>.
              </div>
            </div>
          )}

          {/* Imbalance warning callout */}
          <div className="alert-box alert-warning">
            <ShieldAlert size={22} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
            <div>
              <strong>Academic Methodology Alert (Q1):</strong> The ratio between the largest class (<code>DOS_SYN_Hping</code>: 94,089) and smallest class (<code>Thing_Speak</code>: 27) exceeds <strong>3,380:1</strong>. Standard accuracy is practically meaningless; machine learning models must be assessed using Macro-F1 and per-class recall.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
