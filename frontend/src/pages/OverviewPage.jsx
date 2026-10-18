import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { 
  Shield, ShieldAlert, Activity, Cpu, Layers, 
  AlertCircle, Database, CheckCircle2, Globe, Sparkles 
} from 'lucide-react';
import NetworkGlobeHero from '../components/3d/NetworkGlobeHero';

export default function OverviewPage({ theme }) {
  const [overview, setOverview] = useState(null);
  const [attacks, setAttacks] = useState(null);
  const [protocols, setProtocols] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [ovData, attData, proData] = await Promise.all([
          api.getOverview(),
          api.getAttackDistribution(),
          api.getProtocolDistribution()
        ]);
        setOverview(ovData);
        setAttacks(attData);
        setProtocols(proData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ color: 'var(--accent-cyan)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
          Querying In-Memory DuckDB Engine...
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Initializing 3D spatial network and caching benchmarks (RT-IOT2022)
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="alert-box alert-warning">
          <AlertCircle size={22} style={{ flexShrink: 0 }} />
          <div>
            <strong>Backend Connection Offline:</strong> {error}
            <div style={{ marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Start the FastAPI analytical service via: <code>python3 -m uvicorn backend.app.main:app --port 8000</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Page Title & Context Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Globe size={26} style={{ color: 'var(--accent-emerald)' }} />
            Executive Cybersecurity Overview
          </h1>
          <p className="page-subtitle">
            Foundations of Data Science Case Study: Empirical analysis of normal and malicious IoT network flows (RT-IOT2022).
          </p>
        </div>
        <div className="chip chip-cyan">
          <Sparkles size={14} />
          <span>Offline Dataset Analytics · 0 Live Spoofing</span>
        </div>
      </div>

      {/* Signature 3D Network Globe Hero */}
      <NetworkGlobeHero overviewData={overview} theme={theme} />

      {/* KPI Cards Ribbon */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>Total Flow Records</span>
            <Database size={16} color="var(--accent-cyan)" />
          </div>
          <div className="stat-value">{overview?.total_records?.toLocaleString()}</div>
          <div className="stat-footer">84 Preprocessed Analytical Features</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Attack Labels</span>
            <ShieldAlert size={16} color="var(--accent-rose)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-rose)' }}>
            {overview?.attack_labels_count}
          </div>
          <div className="stat-footer">9 Malicious · 3 Normal Classes</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Normal IoT Traffic</span>
            <CheckCircle2 size={16} color="var(--accent-emerald)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
            {overview?.normal_traffic_percentage}%
          </div>
          <div className="stat-footer">{overview?.normal_traffic_count?.toLocaleString()} Telemetry Flows</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Dominant Attack Class</span>
            <Activity size={16} color="var(--accent-amber)" />
          </div>
          <div className="stat-value" style={{ fontSize: '1.35rem', color: 'var(--accent-amber)' }}>
            {overview?.majority_attack_label}
          </div>
          <div className="stat-footer">{overview?.majority_attack_percentage}% of Total Volume</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Random Forest Macro-F1</span>
            <Cpu size={16} color="var(--accent-purple)" />
          </div>
          <div className="stat-value" style={{ color: '#c084fc' }}>
            {overview?.rf_macro_f1?.toFixed(4)}
          </div>
          <div className="stat-footer">
            Baseline: {overview?.baseline_macro_f1?.toFixed(4)} (+{((overview?.rf_macro_f1 - overview?.baseline_macro_f1) || 0).toFixed(4)} lift)
          </div>
        </div>
      </div>

      {/* Grid: Traffic Composition & Protocol Mix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Normal vs Attack Distribution */}
        <div className="glass-panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <Shield size={18} style={{ color: 'var(--accent-cyan)' }} />
                Traffic Composition: Normal vs Malicious
              </div>
              <div className="panel-desc">Macro binary split across all recorded flows</div>
            </div>
            <span className="chip chip-cyan">Binary Proportion</span>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>
                Malicious Flows ({overview?.malicious_traffic_percentage}%)
              </span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                Normal Telemetry ({overview?.normal_traffic_percentage}%)
              </span>
            </div>
            <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', background: '#0e1622', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: `${overview?.malicious_traffic_percentage}%`, backgroundColor: 'var(--accent-rose)', boxShadow: '0 0 10px rgba(244,63,94,0.4)' }} />
              <div style={{ width: `${overview?.normal_traffic_percentage}%`, backgroundColor: 'var(--accent-emerald)', boxShadow: '0 0 10px rgba(52,211,153,0.4)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--accent-rose-subtle)', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
              <div>
                <strong style={{ color: 'var(--accent-rose)' }}>Malicious Ingress Telemetry</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>DoS SYN Floods, Slowloris, Port Scans, ARP Poisoning, SSH Brute Force</div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{overview?.malicious_traffic_count?.toLocaleString()}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-rose)' }}>{overview?.malicious_traffic_percentage}%</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--accent-emerald-subtle)', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
              <div>
                <strong style={{ color: 'var(--accent-emerald)' }}>Normal IoT Telemetry</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>ThingSpeak Cloud Feeds, MQTT Publish Brokers, Wipro Smart Bulb State</div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{overview?.normal_traffic_count?.toLocaleString()}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>{overview?.normal_traffic_percentage}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Transport Protocol Share */}
        <div className="glass-panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <Layers size={18} style={{ color: 'var(--accent-amber)' }} />
                Transport Protocol Distribution
              </div>
              <div className="panel-desc">Layer 4 transport composition and transmission volume</div>
            </div>
            <span className="chip">Layer 4 Split</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
            {protocols?.distribution?.map((p) => {
              const color = p.proto === 'tcp' ? 'var(--accent-cyan)' : p.proto === 'udp' ? 'var(--accent-amber)' : 'var(--text-muted)';
              return (
                <div key={p.proto}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, textTransform: 'uppercase', color }}>
                      {p.proto}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {p.record_count.toLocaleString()} ({p.percentage}%)
                    </span>
                  </div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${p.percentage}%`, 
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}30`
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '20px', padding: '12px 14px', background: 'var(--bg-input)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Protocol Association Note (Q2):</strong> TCP dominance (89.69%) is primarily attributable to the high-volume DOS_SYN_Hping attack. In contrast, UDP traffic is isolated to NMAP UDP scans and DNS queries.
          </div>
        </div>
      </div>

      {/* Attack Distribution Table */}
      <div className="glass-panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">
              <ShieldAlert size={18} style={{ color: 'var(--accent-rose)' }} />
              Complete Empirical Label Distribution (All 12 Classes)
            </div>
            <div className="panel-desc">Exact class distribution from DuckDB analytical virtual table</div>
          </div>
          <span className="chip chip-emerald">12 Classes · 100.0% Verified</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Attack / Telemetry Label</th>
                <th>Type</th>
                <th>Flow Records</th>
                <th>Class Share (%)</th>
                <th>Volume Visualization</th>
              </tr>
            </thead>
            <tbody>
              {attacks?.distribution?.map((item) => (
                <tr key={item.attack_type}>
                  <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {item.attack_type}
                  </td>
                  <td>
                    {item.is_normal ? (
                      <span className="chip chip-emerald" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                        Normal IoT
                      </span>
                    ) : (
                      <span className="chip" style={{ padding: '2px 8px', fontSize: '0.72rem', borderColor: 'rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)' }}>
                        Malicious
                      </span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {item.record_count.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: item.is_normal ? 'var(--accent-emerald)' : 'var(--text-primary)' }}>
                    {item.percentage}%
                  </td>
                  <td style={{ width: '32%' }}>
                    <div className="bar-track">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${Math.max(item.percentage, 1.2)}%`,
                          backgroundColor: item.is_normal 
                            ? 'var(--accent-emerald)' 
                            : item.percentage > 50 
                              ? 'var(--accent-rose)' 
                              : 'var(--accent-amber)'
                        }} 
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
