import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { BarChart2, Search, AlertTriangle, Layers, Info } from 'lucide-react';

export default function EdaPage() {
  const [features, setFeatures] = useState([]);
  const [correlations, setCorrelations] = useState(null);
  const [search, setSearch] = useState('');
  const [outlierFilter, setOutlierFilter] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [featRes, corrRes] = await Promise.all([
          api.getFeatureSummary(),
          api.getCorrelations()
        ]);
        setFeatures(featRes.features);
        setCorrelations(corrRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredFeatures = features.filter((f) => {
    const matchesSearch = f.feature.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (outlierFilter) return (f.outlier_percentage || 0) > 10;
    return true;
  });

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Exploratory Data Analysis & Feature Distributions</h1>
        <p className="page-subtitle">
          Examine parametric and non-parametric properties, outlier prevalence, and monotonic collinearity across 81 engineered flow dimensions.
        </p>
      </div>

      {/* Correlation Heatmap Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-title">
          <span>Q12: Spearman Rank Correlation Matrix (12 Core Flow Features)</span>
          <span className="badge badge-cyan">Exploratory Collinearity</span>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '16px' }}>
          Monotonic association across key timing, packet volume, payload, and activity metrics. Values range from -1.0 (strong inverse rank) to +1.0 (strong positive rank).
        </p>

        {correlations ? (
          <div className="table-container" style={{ maxHeight: '460px' }}>
            <table className="cyber-table" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr>
                  <th style={{ position: 'sticky', left: 0, zIndex: 10 }}>Feature</th>
                  {correlations.features.map((f) => (
                    <th key={f} title={f} style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.replace('.avg', '').replace('flow_', '').replace('payload_', 'pld_')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlations.features.map((rowName, rIdx) => (
                  <tr key={rowName}>
                    <td style={{ position: 'sticky', left: 0, background: '#0d1525', fontWeight: 600, color: '#f8fafc' }}>
                      {rowName}
                    </td>
                    {correlations.matrix[rIdx].map((val, cIdx) => {
                      // Color mapping: Blue for positive, Red for negative
                      const isDiag = rIdx === cIdx;
                      let bg = 'rgba(255,255,255,0.02)';
                      let textColor = '#cbd5e1';
                      if (!isDiag) {
                        if (val > 0) {
                          const alpha = Math.min(val * 0.8, 0.8);
                          bg = `rgba(6, 182, 212, ${alpha})`;
                          if (val > 0.5) textColor = '#fff';
                        } else if (val < 0) {
                          const alpha = Math.min(Math.abs(val) * 0.8, 0.8);
                          bg = `rgba(244, 63, 94, ${alpha})`;
                          if (val < -0.4) textColor = '#fff';
                        }
                      } else {
                        bg = 'rgba(255,255,255,0.08)';
                        textColor = '#94a3b8';
                      }

                      return (
                        <td 
                          key={cIdx} 
                          style={{ 
                            backgroundColor: bg, 
                            color: textColor, 
                            textAlign: 'center',
                            padding: '6px 4px'
                          }}
                          title={`${rowName} vs ${correlations.features[cIdx]}: ${val}`}
                        >
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>Loading correlation matrix...</div>
        )}

        <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '0.78rem', color: '#94a3b8' }}>
          <div><strong style={{ color: '#06b6d4' }}>Highest Positive:</strong> <code>fwd_pkts_tot</code> & <code>bwd_pkts_tot</code> (\(\rho = 0.7463\))</div>
          <div><strong style={{ color: '#f43f5e' }}>Highest Inverse:</strong> <code>flow_duration</code> & <code>flow_pkts_per_sec</code> (\(\rho = -0.2959\))</div>
        </div>
      </div>

      {/* Feature Distributions & Summary Statistics Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div>
            <div className="card-title" style={{ marginBottom: '2px' }}>
              <span>Numeric Feature Summary Statistics & Outliers</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Showing {filteredFeatures.length} of {features.length} numerical fields (Tukey 1.5×IQR fence outlier flags)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setOutlierFilter(!outlierFilter)}
              className={`btn ${outlierFilter ? 'btn-cyan' : 'btn-outline'}`}
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <AlertTriangle size={14} />
              <span>{outlierFilter ? 'Showing >10% Outliers' : 'Filter High Outliers'}</span>
            </button>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search feature name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '32px', width: '220px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: '#64748b' }} />
            </div>
          </div>
        </div>

        <div className="table-container" style={{ maxHeight: '520px' }}>
          <table className="cyber-table">
            <thead>
              <tr>
                <th style={{ position: 'sticky', left: 0, zIndex: 5 }}>Feature</th>
                <th>Count</th>
                <th>Mean</th>
                <th>Std Dev</th>
                <th>Median</th>
                <th>IQR</th>
                <th>Min</th>
                <th>Max</th>
                <th>Outliers (%)</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeatures.map((f) => (
                <tr key={f.feature}>
                  <td style={{ position: 'sticky', left: 0, background: '#0d1525', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {f.feature}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{f.count.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{f.mean?.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{f.std?.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#06b6d4', fontWeight: 600 }}>{f.median?.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{f.iqr?.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{f.min?.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{f.max?.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    <span style={{ 
                      color: (f.outlier_percentage || 0) > 15 ? '#f43f5e' : (f.outlier_percentage || 0) > 5 ? '#f59e0b' : '#10b981',
                      fontWeight: 600
                    }}>
                      {f.outlier_percentage}%
                    </span>
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
