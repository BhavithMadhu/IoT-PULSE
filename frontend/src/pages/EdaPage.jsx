import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { BarChart2, Search, AlertTriangle, Layers, Info, Sparkles, Filter } from 'lucide-react';

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
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BarChart2 size={26} style={{ color: 'var(--accent-cyan)' }} />
            Exploratory Data Analysis & Feature Distributions
          </h1>
          <p className="page-subtitle">
            Examine parametric and non-parametric properties, outlier prevalence, and monotonic collinearity across 81 engineered flow dimensions.
          </p>
        </div>
        <div className="chip chip-cyan">
          <Sparkles size={14} />
          <span>Non-Parametric Distributions (Heavy Skew & Zero-Inflation)</span>
        </div>
      </div>

      {/* Correlation Heatmap Section */}
      <div className="glass-panel" style={{ marginBottom: '28px' }}>
        <div className="panel-header">
          <div>
            <div className="panel-title">
              <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
              Q12: Spearman Rank Correlation Matrix (Core Flow Features)
            </div>
            <div className="panel-desc">
              Monotonic rank association ($\rho$). Values span from -1.0 (inverse rank) to +1.0 (positive rank). Robust to extreme right skew.
            </div>
          </div>
          <span className="chip chip-emerald">Non-Parametric Spearman</span>
        </div>

        {correlations ? (
          <div className="table-container" style={{ maxHeight: '460px' }}>
            <table className="data-table" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr>
                  <th style={{ position: 'sticky', left: 0, zIndex: 10, background: 'rgba(17, 25, 35, 0.95)' }}>Feature</th>
                  {correlations.features.map((f) => (
                    <th key={f} title={f} style={{ maxWidth: '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.replace('.avg', '').replace('flow_', '').replace('payload_', 'pld_')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlations.features.map((rowName, rIdx) => (
                  <tr key={rowName}>
                    <td style={{ position: 'sticky', left: 0, background: 'rgba(12, 17, 24, 0.95)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {rowName}
                    </td>
                    {correlations.matrix[rIdx].map((val, cIdx) => {
                      const isDiag = rIdx === cIdx;
                      let bg = 'rgba(255,255,255,0.02)';
                      let textColor = 'var(--text-secondary)';
                      if (!isDiag) {
                        if (val > 0) {
                          const alpha = Math.min(val * 0.75, 0.85);
                          bg = `rgba(34, 211, 238, ${alpha})`;
                          if (val > 0.4) textColor = '#fff';
                        } else if (val < 0) {
                          const alpha = Math.min(Math.abs(val) * 0.75, 0.85);
                          bg = `rgba(244, 63, 94, ${alpha})`;
                          if (val < -0.3) textColor = '#fff';
                        }
                      } else {
                        bg = 'rgba(255,255,255,0.06)';
                        textColor = 'var(--text-muted)';
                      }

                      return (
                        <td 
                          key={cIdx} 
                          style={{ 
                            backgroundColor: bg, 
                            color: textColor, 
                            textAlign: 'center',
                            padding: '7px 4px',
                            fontWeight: isDiag ? 400 : Math.abs(val) > 0.5 ? 700 : 500
                          }}
                          title={`${rowName} vs ${correlations.features[cIdx]}: ${val.toFixed(4)}`}
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
          <div style={{ color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>Loading correlation matrix...</div>
        )}

        <div style={{ display: 'flex', gap: '24px', marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div><strong style={{ color: 'var(--accent-cyan)' }}>Highest Positive Rank:</strong> <code>fwd_pkts_tot</code> & <code>bwd_pkts_tot</code> ($\rho = 0.7463$)</div>
          <div><strong style={{ color: 'var(--accent-rose)' }}>Highest Inverse Rank:</strong> <code>flow_duration</code> & <code>flow_pkts_per_sec</code> ($\rho = -0.2959$)</div>
        </div>
      </div>

      {/* Feature Distributions & Summary Statistics Table */}
      <div className="glass-panel">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div className="panel-title">
              <Layers size={18} style={{ color: 'var(--accent-emerald)' }} />
              Numeric Feature Summary Statistics & Outliers
            </div>
            <div className="panel-desc">
              Showing {filteredFeatures.length} of {features.length} numerical fields (Tukey 1.5×IQR fence outlier flags)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setOutlierFilter(!outlierFilter)}
              className={`btn ${outlierFilter ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <AlertTriangle size={14} />
              <span>{outlierFilter ? 'Showing >10% Outliers' : 'Filter High Outliers (>10%)'}</span>
            </button>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search feature name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-control"
                style={{ paddingLeft: '32px', width: '220px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        <div className="table-container" style={{ maxHeight: '520px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ position: 'sticky', left: 0, zIndex: 5, background: 'rgba(17, 25, 35, 0.95)' }}>Feature</th>
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
                  <td style={{ position: 'sticky', left: 0, background: 'rgba(12, 17, 24, 0.95)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {f.feature}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{f.count.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{f.mean?.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{f.std?.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 600 }}>{f.median?.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{f.iqr?.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{f.min?.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{f.max?.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    <span style={{ 
                      color: (f.outlier_percentage || 0) > 15 ? 'var(--accent-rose)' : (f.outlier_percentage || 0) > 5 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
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
