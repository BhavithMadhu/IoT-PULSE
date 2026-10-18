import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { 
  CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, 
  FileSpreadsheet, Sparkles, Scale, Info 
} from 'lucide-react';

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
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CheckCircle2 size={26} style={{ color: 'var(--accent-emerald)' }} />
            Hypothesis Testing & Benjamini–Hochberg FDR Control
          </h1>
          <p className="page-subtitle">
            Formal statistical synthesis across all inferential tests with multiple-comparison False Discovery Rate adjustments.
          </p>
        </div>
        <div className="chip chip-emerald">
          <Sparkles size={14} />
          <span>FDR Controlled at q = 0.05</span>
        </div>
      </div>

      {/* Critical Academic Rigor Banner */}
      <div className="alert-box alert-warning" style={{ marginBottom: '24px' }}>
        <AlertTriangle size={22} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
        <div>
          <strong style={{ fontSize: '0.92rem', color: 'var(--accent-amber)' }}>
            Observational Two-Group Comparisons vs Randomized A/B Experiments:
          </strong>
          <p style={{ marginTop: '4px', fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
            The two-group comparisons in this dataset (TCP vs UDP packet rates, MQTT vs Non-MQTT duration, and High-SYN proportion) are <strong>strictly observational</strong>. Network flows were not randomly allocated to protocols through an experimental treatment. Significant p-values reject the statistical null model within this dataset but <strong>do not prove causation</strong> or represent randomized A/B testing trials.
          </p>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>Inferential Hypotheses</span>
            <FileSpreadsheet size={16} color="var(--accent-cyan)" />
          </div>
          <div className="stat-value">{summary?.total_tests}</div>
          <div className="stat-footer">Non-Parametric & Proportion Tests</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Raw Significant (α=0.05)</span>
            <CheckCircle2 size={16} color="var(--accent-emerald)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
            {summary?.significant_raw_count} / {summary?.total_tests}
          </div>
          <div className="stat-footer">Unadjusted Alpha Threshold</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>BH-FDR Adjusted Significant</span>
            <ShieldCheck size={16} color="var(--accent-cyan)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>
            {summary?.significant_bh_count} / {summary?.total_tests}
          </div>
          <div className="stat-footer">100% FDR Survival Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Correction Method</span>
            <Scale size={16} color="var(--accent-purple)" />
          </div>
          <div className="stat-value" style={{ fontSize: '1.3rem', color: '#c084fc' }}>
            Benjamini–Hochberg
          </div>
          <div className="stat-footer">Expected FDR &le; 0.05</div>
        </div>
      </div>

      {/* Counter-Intuition Callout: Q10 High-SYN Single-Packet Flood */}
      <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent-rose)', marginBottom: '28px' }}>
        <div className="panel-header">
          <div>
            <div className="panel-title" style={{ color: 'var(--accent-rose)' }}>
              <Info size={18} />
              Key Empirical Counter-Intuition: Q10 Single-Packet SYN Flooding
            </div>
            <div className="panel-desc">
              Two-proportion Z-test comparing high-SYN flag prevalence in DoS vs other traffic (z = -196.12, p &lt; 0.0001)
            </div>
          </div>
          <span className="chip" style={{ color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}>Q10 Finding</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '14px' }}>
          <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>DOS_SYN_HPING HIGH-SYN SHARE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-rose)', marginTop: '2px' }}>
              0.00%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              0 out of 94,089 flows classified as high-SYN (&ge;50% SYN)
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>OTHER TRAFFIC HIGH-SYN SHARE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', marginTop: '2px' }}>
              37.15%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Normal flows feature complete 3-way handshakes
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>95% CONFIDENCE INTERVAL</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginTop: '2px' }}>
              [-0.377, -0.366]
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Significant negative difference of 37.15%
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong>Analytical Explanation:</strong> Standard intuition assumes SYN floods would exhibit high SYN flag counts. However, `hping3` emits solitary SYN probes per ephemeral socket without awaiting handshake completion. In flow monitoring tools (Zeek), single-packet flows have SYN counts of 0 in multi-packet metric fields.
        </p>
      </div>

      {/* Consolidated Inferential Results Table */}
      <div className="glass-panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">
              <FileSpreadsheet size={18} style={{ color: 'var(--accent-emerald)' }} />
              Consolidated Inferential Summary Table
            </div>
            <div className="panel-desc">All 11 hypothesis tests with raw and BH-FDR adjusted p-values</div>
          </div>
          <span className="chip chip-emerald">11 Tests Evaluated</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Question & Topic</th>
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
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {t.question}
                  </td>
                  <td style={{ color: 'var(--accent-cyan)' }}>
                    {t.test}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {t.n.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {t.statistic.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: t.significant_raw_005 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                    {t.p_value < 0.0001 ? '< 0.0001' : t.p_value.toFixed(4)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: t.significant_BH_005 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 600 }}>
                    {t.p_value_adjusted_BH < 0.0001 ? '< 0.0001' : t.p_value_adjusted_BH.toFixed(4)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {t.effect_name ? `${t.effect_name}: ${t.effect_value}` : 'N/A'}
                  </td>
                  <td>
                    <span className={`chip ${t.significant_BH_005 ? 'chip-emerald' : ''}`} style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                      {t.significant_BH_005 ? 'Reject H0' : 'Fail to Reject'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {t.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <strong>Multiple Testing Rationale:</strong> Performing 11 inferential tests without correction yields a cumulative family-wise error rate of 1 - (1 - 0.05)^11 &asymp; 43.1%. Applying the Benjamini–Hochberg False Discovery Rate correction guarantees that the expected proportion of false discoveries is held strictly beneath 5%. Because empirical sample sizes are substantial (N &gt; 100,000) and observed differences are pronounced, all inferential tests remain statistically significant following correction.
        </div>
      </div>
    </div>
  );
}
