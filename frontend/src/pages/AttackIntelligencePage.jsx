import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Shield, ShieldAlert, Filter, Search, Terminal, Radio } from 'lucide-react';

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

export default function AttackIntelligencePage() {
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
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Attack Intelligence & Threat Profiles</h1>
        <p className="page-subtitle">
          Comprehensive forensic taxonomy and distribution breakdown across all 12 recorded IoT traffic behaviors.
        </p>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Category buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['ALL', 'ATTACK', 'NORMAL', 'SCAN', 'DOS'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterType(cat)}
                className={`btn ${filterType === cat ? 'btn-cyan' : 'btn-outline'}`}
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                {cat === 'ALL' ? 'All Classes (12)' : cat === 'ATTACK' ? 'Attacks Only (9)' : cat === 'NORMAL' ? 'Normal IoT (3)' : cat === 'SCAN' ? 'Port Scans (5)' : 'DoS/DDoS (2)'}
              </button>
            ))}
          </div>

          {/* Scale toggle & Search */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
              <span>Scale:</span>
              <button
                onClick={() => setScale(scale === 'log' ? 'linear' : 'log')}
                className="btn btn-outline"
                style={{ padding: '4px 8px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
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
                style={{ paddingLeft: '32px', width: '220px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: '#64748b' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Visual Bars & Deep Profile */}
      <div className="grid-2">
        {/* Left Column: Interactive Attack List & Volume Bars */}
        <div className="card">
          <div className="card-title">
            <span>Attack Volume Comparison ({scale.toUpperCase()} Scale)</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Click row to view profile</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map((item) => {
              const isSelected = selectedAttack?.attack_type === item.attack_type;
              // Log scaling helper: log10(count) / log10(max)
              const maxCount = attacks[0]?.record_count || 94659;
              const barWidth = scale === 'log' 
                ? (Math.log10(Math.max(item.record_count, 1)) / Math.log10(maxCount)) * 100
                : (item.record_count / maxCount) * 100;

              return (
                <div 
                  key={item.attack_type}
                  onClick={() => setSelectedAttack(item)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-input)',
                    border: `1px solid ${isSelected ? 'var(--cyan)' : 'var(--border)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        {item.attack_type}
                      </span>
                      {item.is_normal ? (
                        <span className="badge badge-normal" style={{ fontSize: '0.65rem' }}>Normal</span>
                      ) : (
                        <span className="badge badge-attack" style={{ fontSize: '0.65rem' }}>Attack</span>
                      )}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      {item.record_count.toLocaleString()} ({item.percentage}%)
                    </span>
                  </div>

                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${Math.max(barWidth, 1)}%`,
                        backgroundColor: item.is_normal ? '#10b981' : isSelected ? '#06b6d4' : '#f43f5e'
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
            <div className="card" style={{ borderTop: `3px solid ${selectedAttack.is_normal ? '#10b981' : '#f43f5e'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                    {selectedAttack.attack_type}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: selectedAttack.is_normal ? '#10b981' : '#f43f5e', marginTop: '2px' }}>
                    {selectedAttack.is_normal ? 'Benign IoT Telemetry Stream' : 'Simulated Malicious Vector'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                    {selectedAttack.record_count.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {selectedAttack.percentage}% of Total Flows
                  </div>
                </div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '6px', marginBottom: '18px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                {ATTACK_DESCRIPTIONS[selectedAttack.attack_type] || "Network traffic profile documented in the RT-IOT2022 cybersecurity dataset."}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div style={{ padding: '10px', background: 'var(--bg-sidebar)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Classification Role</div>
                  <div style={{ fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
                    {selectedAttack.percentage > 10 ? 'Majority Class' : selectedAttack.percentage > 1 ? 'Core Class' : 'Rare Minority Class'}
                  </div>
                </div>

                <div style={{ padding: '10px', background: 'var(--bg-sidebar)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Sample Status</div>
                  <div style={{ fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
                    {selectedAttack.record_count >= 30 ? 'Included in Hypothesis Tests (n >= 30)' : 'Excluded from KW Tests (n < 30)'}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#94a3b8', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                <strong>SOC Forensics Context:</strong> This label exhibits specific feature fingerprints (e.g. TCP flags, duration, and forward/backward symmetry). To explore matching flow tuples and download raw CSV extracts, navigate to the <strong>Data Explorer</strong>.
              </div>
            </div>
          )}

          {/* Imbalance warning callout */}
          <div className="alert-box alert-warning">
            <ShieldAlert size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div>
              <strong>Academic Methodology Alert (Q1):</strong> The ratio between the largest class (<code>DOS_SYN_Hping</code>: 94,659) and smallest class (<code>NMAP_FIN_SCAN</code>: 28) exceeds <strong>3,380:1</strong>. Standard accuracy is practically meaningless; machine learning models must be assessed using Macro-F1 and per-class recall.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
