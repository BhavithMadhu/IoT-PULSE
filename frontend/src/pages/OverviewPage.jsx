import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Shield, ShieldAlert, Activity, Cpu, Layers, AlertCircle, Database, CheckCircle2 } from 'lucide-react';

export default function OverviewPage() {
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
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ color: '#06b6d4', fontSize: '1.2rem', marginBottom: '8px' }}>
          Querying In-Memory DuckDB Engine...
        </div>
        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading dataset metadata and model benchmarks</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="alert-box alert-warning">
          <AlertCircle size={20} />
          <div>
            <strong>Backend Connection Error:</strong> {error}
            <div style={{ marginTop: '4px', fontSize: '0.8rem' }}>
              Ensure the FastAPI backend is running via <code>uvicorn backend.app.main:app --port 8000</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Executive Cybersecurity Overview</h1>
        <p className="page-subtitle">
          Foundations of Data Science Case Study: Empirical analysis of normal and malicious IoT network flows (RT-IOT2022).
        </p>
      </div>

      {/* Academic context banner */}
      <div className="alert-box alert-info" style={{ marginBottom: '24px' }}>
        <Shield size={20} style={{ color: '#06b6d4', flexShrink: 0 }} />
        <div>
          <strong>Faculty Case Study Context:</strong> This analytics system inspects <strong>123,117 bidirectional network flows</strong> across 12 distinct attack and IoT telemetry profiles. All metrics and statistical distributions are derived directly from the source of truth, establishing empirical patterns rather than theoretical assumptions.
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>Total Flow Records</span>
            <Database size={16} color="#06b6d4" />
          </div>
          <div className="stat-value">{overview?.total_records?.toLocaleString()}</div>
          <div className="stat-footer">84 Preprocessed Analytical Features</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Attack Labels</span>
            <ShieldAlert size={16} color="#f43f5e" />
          </div>
          <div className="stat-value">{overview?.attack_labels_count}</div>
          <div className="stat-footer">9 Malicious · 3 Normal Classes</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Normal IoT Traffic</span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            {overview?.normal_traffic_percentage}%
          </div>
          <div className="stat-footer">{overview?.normal_traffic_count?.toLocaleString()} Telemetry Flows</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Dominant Attack Class</span>
            <Activity size={16} color="#f59e0b" />
          </div>
          <div className="stat-value" style={{ fontSize: '1.25rem', color: '#f59e0b' }}>
            {overview?.majority_attack_label}
          </div>
          <div className="stat-footer">{overview?.majority_attack_percentage}% of All Flows</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Model Macro-F1</span>
            <Cpu size={16} color="#8b5cf6" />
          </div>
          <div className="stat-value" style={{ color: '#a78bfa' }}>
            {overview?.rf_macro_f1?.toFixed(4)}
          </div>
          <div className="stat-footer">Baseline: {overview?.baseline_macro_f1?.toFixed(4)} (+{((overview?.rf_macro_f1 - overview?.baseline_macro_f1) || 0).toFixed(4)})</div>
        </div>
      </div>

      {/* Grid: Traffic Composition & Attack Distribution */}
      <div className="grid-2">
        {/* Normal vs Attack Distribution */}
        <div className="card">
          <div className="card-title">
            <span>Traffic Composition: Normal vs Attack</span>
            <span className="badge badge-cyan">Macro Breakdown</span>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
              <span style={{ color: '#f43f5e', fontWeight: 600 }}>
                Malicious Flows ({overview?.malicious_traffic_percentage}%)
              </span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>
                Normal Telemetry ({overview?.normal_traffic_percentage}%)
              </span>
            </div>
            <div style={{ display: 'flex', height: '14px', borderRadius: '7px', overflow: 'hidden' }}>
              <div style={{ width: `${overview?.malicious_traffic_percentage}%`, backgroundColor: '#f43f5e' }} />
              <div style={{ width: `${overview?.normal_traffic_percentage}%`, backgroundColor: '#10b981' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(244, 63, 94, 0.08)', borderRadius: '6px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
              <div>
                <strong style={{ color: '#f43f5e' }}>Malicious Attack Traffic</strong>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>DoS SYN Floods, Slowloris, Port Scans, ARP Poisoning, SSH Brute Force</div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                <strong>{overview?.malicious_traffic_count?.toLocaleString()}</strong>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{overview?.malicious_traffic_percentage}%</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div>
                <strong style={{ color: '#10b981' }}>Normal IoT Telemetry</strong>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>ThingSpeak Sensor Feeds, MQTT Publish Brokers, Wipro Smart Bulb State</div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                <strong>{overview?.normal_traffic_count?.toLocaleString()}</strong>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{overview?.normal_traffic_percentage}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Transport Protocol Share */}
        <div className="card">
          <div className="card-title">
            <span>Transport Protocol Distribution</span>
            <span className="badge badge-amber">Layer 4 Composition</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            {protocols?.distribution?.map((p) => (
              <div key={p.proto}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600, textTransform: 'uppercase', color: p.proto === 'tcp' ? '#06b6d4' : p.proto === 'udp' ? '#f59e0b' : '#94a3b8' }}>
                    {p.proto}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    {p.record_count.toLocaleString()} ({p.percentage}%)
                  </span>
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      width: `${p.percentage}%`, 
                      backgroundColor: p.proto === 'tcp' ? '#06b6d4' : p.proto === 'udp' ? '#f59e0b' : '#64748b' 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-input)', borderRadius: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
            <strong>Protocol Association Note (Q2):</strong> TCP dominance (89.69%) is primarily attributable to the high-volume DOS_SYN_Hping attack. In contrast, UDP traffic is isolated to NMAP UDP scans and DNS queries.
          </div>
        </div>
      </div>

      {/* Attack Distribution Table */}
      <div className="card">
        <div className="card-title">
          <span>Complete Empirical Label Distribution (All 12 Classes)</span>
          <span className="badge badge-normal">Sorted by Volume</span>
        </div>

        <div className="table-container">
          <table className="cyber-table">
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
                      <span className="badge badge-normal">Normal IoT</span>
                    ) : (
                      <span className="badge badge-attack">Malicious</span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {item.record_count.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {item.percentage}%
                  </td>
                  <td style={{ width: '30%' }}>
                    <div className="bar-track">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${Math.max(item.percentage, 1)}%`,
                          backgroundColor: item.is_normal ? '#10b981' : item.percentage > 50 ? '#f43f5e' : '#f59e0b'
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
