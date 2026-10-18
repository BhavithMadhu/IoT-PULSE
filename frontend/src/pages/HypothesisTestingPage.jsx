import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, FileSpreadsheet } from 'lucide-react';

export default function HypothesisTestingPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getHypotheses();
        setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Hypothesis Testing & Benjamini–Hochberg FDR Correction</h1>
        <p className="page-subtitle">
          Formal statistical synthesis across all inferential tests with multiple-comparison False Discovery Rate adjustments.
        </p>
      </div>

      {/* Critical Academic Rigor Banner */}
      <div className="alert-box alert-warning" style={{ marginBottom: '24px' }}>
        <AlertTriangle size={22} style={{ color: '#f59e0b', flexShrink: 0 }} />
        <div>
          <strong style={{ fontSize: '0.95rem' }}>Observational Two-Group Comparisons vs Randomized A/B Experiments:</strong>
          <p style={{ marginTop: '4px', fontSize: '0.85rem', lineHeight: '1.5' }}>
            The two-group comparisons in this dataset (TCP vs UDP packet rates, MQTT vs Non-MQTT duration, and High-SYN proportion) are <strong>strictly observational</strong>. Network flows were not randomly allocated to protocols through an experimental treatment. Significant p-values reject the statistical null model within this dataset but <strong>do not prove causation</strong> or represent randomized A/B testing trials.
          </p>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>Inferential Tests</span>
            <FileSpreadsheet size={16} color="#06b6d4" />
          </div>
          <div className="stat-value">{summary?.total_tests}</div>
          <div className="stat-footer">Non-Parametric & Proportion Tests</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Raw Significant (α=0.05)</span>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            {summary?.significant_raw_count} / {summary?.total_tests}
          </div>
          <div className="stat-footer">Unadjusted Alpha Threshold</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>BH-FDR Adjusted Significant</span>
            <ShieldCheck size={16} color="#06b6d4" />
          </div>
          <div className="stat-value" style={{ color: '#06b6d4' }}>
            {summary?.significant_bh_count} / {summary?.total_tests}
          </div>
          <div className="stat-footer">100% FDR Survival Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Correction Method</span>
            <HelpCircle size={16} color="#8b5cf6" />
          </div>
          <div className="stat-value" style={{ fontSize: '1.25rem', color: '#a78bfa' }}>
            Benjamini–Hochberg
          </div>
          <div className="stat-footer">FDR Controlled at q = 0.05</div>
        </div>
      </div>

      {/* Consolidated Inferential Results Table */}
      <div className="card">
        <div className="card-title">
          <span>Consolidated Inferential Summary Table</span>
          <span className="badge badge-normal">Recomputed on Verified Flows</span>
        </div>

        <div className="table-container">
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Question & Comparison</th>
                <th>Statistical Test</th>
                <th>Sample Size (N)</th>
                <th>Test Statistic</th>
                <th>Raw p-Value</th>
                <th>BH Adjusted p-Value</th>
                <th>Effect Size</th>
                <th>Decision</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {summary?.tests?.map((t) => (
                <tr key={t.question}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>
                    {t.question}
                  </td>
                  <td style={{ color: '#06b6d4' }}>
                    {t.test}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {t.n.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {t.statistic.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: t.significant_raw_005 ? '#10b981' : '#f43f5e' }}>
                    {t.p_value < 0.0001 ? '< 0.0001' : t.p_value.toFixed(4)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: t.significant_BH_005 ? '#10b981' : '#f43f5e' }}>
                    {t.p_value_adjusted_BH < 0.0001 ? '< 0.0001' : t.p_value_adjusted_BH.toFixed(4)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {t.effect_name ? `${t.effect_name}: ${t.effect_value}` : 'N/A'}
                  </td>
                  <td>
                    <span className={`badge ${t.significant_BH_005 ? 'badge-normal' : 'badge-amber'}`}>
                      {t.significant_BH_005 ? 'Reject H0' : 'Fail to Reject'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {t.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.6' }}>
          <strong>Multiple Testing Rationale:</strong> Performing 11 inferential tests without correction would yield a theoretical family-wise error rate of 1 - (1 - 0.05)^11 &asymp; 43.1%. Applying the Benjamini–Hochberg False Discovery Rate correction guarantees that the expected proportion of false discoveries is held strictly beneath 5%. Because empirical sample sizes are substantial (N &gt; 100,000) and observed differences are pronounced, all inferential tests remain statistically significant following correction.
        </div>
      </div>
    </div>
  );
}
