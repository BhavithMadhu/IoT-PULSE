import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Cpu, CheckCircle2, AlertTriangle, Layers, BarChart2, ShieldCheck, Info, Sparkles } from 'lucide-react';

export default function MachineLearningPage() {
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getModelMetrics();
        setModelData(data);
      } catch (err) {
        console.error(err);
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
          Loading Machine Learning Benchmarks...
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Querying Random Forest pipeline metrics and confusion matrix
        </div>
      </div>
    );
  }

  const rfMetrics = modelData?.model_metrics?.find((m) => m.model === 'Random Forest');
  const baseMetrics = modelData?.model_metrics?.find((m) => m.model === 'Majority-class baseline');
  const cm = modelData?.confusion_matrix;
  const clf = modelData?.classification_report;
  const importances = modelData?.top_feature_importance || [];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Cpu size={26} style={{ color: 'var(--accent-purple)' }} />
            Machine Learning: Multiclass Classification (Q15)
          </h1>
          <p className="page-subtitle">
            Random Forest classification pipeline evaluated against a majority-class baseline with stratified out-of-sample partitioning.
          </p>
        </div>
        <div className="chip chip-emerald">
          <Sparkles size={14} />
          <span>Macro-F1 Lift: +86.14%</span>
        </div>
      </div>

      {/* Model Benchmark Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderTop: '3px solid var(--accent-cyan)' }}>
          <div className="stat-header">
            <span>Macro-F1 Score</span>
            <span className="chip chip-cyan" style={{ padding: '1px 6px', fontSize: '0.65rem' }}>Primary</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>
            {rfMetrics?.macro_F1?.toFixed(4)}
          </div>
          <div className="stat-footer">
            Baseline: {baseMetrics?.macro_F1?.toFixed(4)} (+{((rfMetrics?.macro_F1 - baseMetrics?.macro_F1) || 0).toFixed(4)} lift)
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid var(--accent-emerald)' }}>
          <div className="stat-header">
            <span>Balanced Accuracy</span>
            <span className="chip chip-emerald" style={{ padding: '1px 6px', fontSize: '0.65rem' }}>Mean Recall</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
            {rfMetrics?.balanced_accuracy?.toFixed(4)}
          </div>
          <div className="stat-footer">
            Baseline: {baseMetrics?.balanced_accuracy?.toFixed(4)} (+{((rfMetrics?.balanced_accuracy - baseMetrics?.balanced_accuracy) || 0).toFixed(4)})
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid var(--accent-purple)' }}>
          <div className="stat-header">
            <span>Overall Accuracy</span>
            <span className="chip" style={{ padding: '1px 6px', fontSize: '0.65rem' }}>Raw</span>
          </div>
          <div className="stat-value" style={{ color: '#c084fc' }}>
            {rfMetrics?.accuracy?.toFixed(4)}
          </div>
          <div className="stat-footer">
            Baseline: {baseMetrics?.accuracy?.toFixed(4)} (Biased by Majority)
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid var(--accent-amber)' }}>
          <div className="stat-header">
            <span>Weighted-F1</span>
            <span className="chip" style={{ padding: '1px 6px', fontSize: '0.65rem' }}>Support-Weighted</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>
            {rfMetrics?.weighted_F1?.toFixed(4)}
          </div>
          <div className="stat-footer">
            Baseline: {baseMetrics?.weighted_F1?.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Confusion Matrix Section */}
      <div className="glass-panel" style={{ marginBottom: '28px' }}>
        <div className="panel-header">
          <div>
            <div className="panel-title">
              <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
              Row-Normalized Confusion Matrix (Held-Out 20% Test Split)
            </div>
            <div className="panel-desc">
              Rows represent true ground-truth labels; columns represent predictions. Diagonal values indicate recall rates (true positive fraction).
            </div>
          </div>
          <span className="chip chip-cyan">12 Classes · 10,000 Flows</span>
        </div>

        {cm && (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr>
                  <th style={{ position: 'sticky', left: 0, zIndex: 10, background: 'rgba(17, 25, 35, 0.95)' }}>Actual \ Predicted</th>
                  {cm.labels.map((l) => (
                    <th key={l} title={l} style={{ maxWidth: '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {l.replace('NMAP_', 'NM_').replace('DOS_', '').replace('Metasploit_', 'MS_')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cm.labels.map((actualLabel, rIdx) => (
                  <tr key={actualLabel}>
                    <td style={{ position: 'sticky', left: 0, background: 'rgba(12, 17, 24, 0.95)', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      {actualLabel}
                    </td>
                    {cm.labels.map((predLabel, cIdx) => {
                      const rate = cm.matrix_normalized[rIdx][cIdx];
                      const count = cm.matrix_counts[rIdx][cIdx];
                      const isDiag = rIdx === cIdx;
                      
                      let bg = 'rgba(255,255,255,0.02)';
                      let textCol = 'var(--text-muted)';
                      if (rate > 0) {
                        if (isDiag) {
                          const alpha = Math.max(rate * 0.85, 0.25);
                          bg = `rgba(34, 211, 238, ${alpha})`;
                          textCol = rate > 0.4 ? '#fff' : 'var(--accent-cyan)';
                        } else {
                          bg = `rgba(244, 63, 94, ${Math.min(rate * 1.5, 0.8)})`;
                          textCol = '#fca5a5';
                        }
                      }

                      return (
                        <td
                          key={predLabel}
                          onClick={() => setSelectedCell({ actual: actualLabel, pred: predLabel, rate, count })}
                          style={{
                            backgroundColor: bg,
                            color: textCol,
                            textAlign: 'center',
                            cursor: 'pointer',
                            fontWeight: isDiag ? 700 : 400,
                            padding: '7px 4px'
                          }}
                          title={`Actual: ${actualLabel} -> Predicted: ${predLabel} | Rate: ${(rate * 100).toFixed(1)}% (${count} flows)`}
                        >
                          {(rate * 100).toFixed(0)}%
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedCell && (
          <div style={{ marginTop: '14px', padding: '12px 16px', background: 'var(--bg-input)', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-subtle)' }}>
            <div>
              <strong>Selected Confusion Cell:</strong> Actual <code>{selectedCell.actual}</code> → Predicted <code>{selectedCell.pred}</code>
            </div>
            <div>
              <strong>Proportion:</strong> {(selectedCell.rate * 100).toFixed(2)}% ({selectedCell.count} flows)
            </div>
          </div>
        )}
      </div>

      {/* Grid: Feature Importance & Per-Class Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Top 20 Feature Importance */}
        <div className="glass-panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <BarChart2 size={18} style={{ color: 'var(--accent-emerald)' }} />
                Top Predictive Feature Importances
              </div>
              <div className="panel-desc">Mean Decrease in Impurity (Gini). Port numbers removed to eliminate leakage.</div>
            </div>
            <span className="chip chip-emerald">Top Discriminators</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {importances.slice(0, 16).map((item) => (
              <div key={item.feature}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{item.feature}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 600 }}>{(item.importance * 100).toFixed(2)}%</span>
                </div>
                <div className="bar-track" style={{ height: '6px' }}>
                  <div className="bar-fill" style={{ width: `${(item.importance / importances[0].importance) * 100}%`, backgroundColor: 'var(--accent-cyan)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-Class Classification Report */}
        <div className="glass-panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <ShieldCheck size={18} style={{ color: 'var(--accent-cyan)' }} />
                Per-Class Classification Report
              </div>
              <div className="panel-desc">Precision, Recall, and F1-Score across all 12 classes</div>
            </div>
            <span className="chip">Test Partition</span>
          </div>

          <div className="table-container" style={{ maxHeight: '420px' }}>
            <table className="data-table" style={{ fontSize: '0.78rem' }}>
              <thead>
                <tr>
                  <th>Class Label</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>F1-Score</th>
                  <th>Support</th>
                </tr>
              </thead>
              <tbody>
                {clf && Object.entries(clf)
                  .filter(([k]) => !['accuracy', 'macro avg', 'weighted avg'].includes(k))
                  .map(([label, metrics]) => (
                    <tr key={label}>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{label}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{(metrics.precision * 100).toFixed(1)}%</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: metrics.recall > 0.8 ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontWeight: 600 }}>
                        {(metrics.recall * 100).toFixed(1)}%
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{(metrics.f1_score * 100).toFixed(1)}%</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{metrics.support?.toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Academic Rigor & Interpretability Checklist */}
      <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: '10px' }}>
          Academic Model Interpretability & Pipeline Checklist
        </h3>
        <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          <li><strong style={{ color: 'var(--text-primary)' }}>Baseline Comparison:</strong> Random Forest achieved a Macro-F1 of {rfMetrics?.macro_F1?.toFixed(4)} vs Majority-class baseline of {baseMetrics?.macro_F1?.toFixed(4)}, verifying strong predictive signal across all classes.</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>Target & Feature Leakage Prevention:</strong> Raw port columns (<code>id.orig_p</code>, <code>id.resp_p</code>) and index row IDs were eliminated from the feature set to ensure the model learns packet dynamics rather than hardcoded port conventions.</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>Class Imbalance Strategy:</strong> Balanced subsampling class weighting (<code>class_weight='balanced_subsample'</code>) was applied, providing minority classes like SSH Brute Force and NMAP Scans proportional gradient penalties during tree splitting.</li>
          <li><strong style={{ color: 'var(--text-primary)' }}>Generalization Caveat:</strong> Model performance measures within-dataset separability on the held-out RT-IOT2022 test partition. Independent validation on unseen hardware networks and live zero-day attacks is required prior to real-world deployment.</li>
        </ul>
      </div>
    </div>
  );
}
