import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Cpu, CheckCircle2, AlertTriangle, Layers, BarChart2, ShieldCheck, Info } from 'lucide-react';

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
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ color: '#06b6d4', fontSize: '1.2rem', marginBottom: '8px' }}>
          Loading Machine Learning Benchmarks...
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
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Machine Learning: Multiclass Classification (Q15)</h1>
        <p className="page-subtitle">
          Random Forest classification pipeline evaluated against a majority-class baseline with stratified out-of-sample partitioning.
        </p>
      </div>

      {/* Model Benchmark Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderTop: '3px solid #06b6d4' }}>
          <div className="stat-header">
            <span>Macro-F1 Score</span>
            <span className="badge badge-cyan">Class-Balanced</span>
          </div>
          <div className="stat-value" style={{ color: '#06b6d4' }}>
            {rfMetrics?.macro_F1?.toFixed(4)}
          </div>
          <div className="stat-footer">
            Baseline: {baseMetrics?.macro_F1?.toFixed(4)} (+{((rfMetrics?.macro_F1 - baseMetrics?.macro_F1) || 0).toFixed(4)})
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #10b981' }}>
          <div className="stat-header">
            <span>Balanced Accuracy</span>
            <span className="badge badge-normal">Recall Mean</span>
          </div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            {rfMetrics?.balanced_accuracy?.toFixed(4)}
          </div>
          <div className="stat-footer">
            Baseline: {baseMetrics?.balanced_accuracy?.toFixed(4)} (+{((rfMetrics?.balanced_accuracy - baseMetrics?.balanced_accuracy) || 0).toFixed(4)})
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #8b5cf6' }}>
          <div className="stat-header">
            <span>Raw Accuracy</span>
            <span className="badge badge-amber">Overall</span>
          </div>
          <div className="stat-value" style={{ color: '#a78bfa' }}>
            {rfMetrics?.accuracy?.toFixed(4)}
          </div>
          <div className="stat-footer">
            Baseline: {baseMetrics?.accuracy?.toFixed(4)}
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #f59e0b' }}>
          <div className="stat-header">
            <span>Weighted-F1</span>
            <span className="badge badge-amber">Size-Weighted</span>
          </div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {rfMetrics?.weighted_F1?.toFixed(4)}
          </div>
          <div className="stat-footer">
            Baseline: {baseMetrics?.weighted_F1?.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Confusion Matrix Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-title">
          <span>Row-Normalized Confusion Matrix (Held-Out 20% Test Split)</span>
          <span className="badge badge-cyan">12 Classes · 10,000 Flows</span>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '14px' }}>
          Rows indicate actual ground-truth labels; columns indicate Random Forest predictions. Values along the diagonal represent recall rates (true positive fraction).
        </p>

        {cm && (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="cyber-table" style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr>
                  <th style={{ position: 'sticky', left: 0, zIndex: 10 }}>Actual \ Predicted</th>
                  {cm.labels.map((l) => (
                    <th key={l} title={l} style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {l.replace('NMAP_', 'NM_').replace('DOS_', '').replace('Metasploit_', 'MS_')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cm.labels.map((actualLabel, rIdx) => (
                  <tr key={actualLabel}>
                    <td style={{ position: 'sticky', left: 0, background: '#0d1525', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap' }}>
                      {actualLabel}
                    </td>
                    {cm.labels.map((predLabel, cIdx) => {
                      const rate = cm.matrix_normalized[rIdx][cIdx];
                      const count = cm.matrix_counts[rIdx][cIdx];
                      const isDiag = rIdx === cIdx;
                      
                      let bg = 'rgba(255,255,255,0.02)';
                      let textCol = '#64748b';
                      if (rate > 0) {
                        if (isDiag) {
                          const alpha = Math.max(rate * 0.85, 0.2);
                          bg = `rgba(6, 182, 212, ${alpha})`;
                          textCol = rate > 0.5 ? '#fff' : '#06b6d4';
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
                            padding: '6px 4px'
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
          <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Selected Cell:</strong> Actual <code>{selectedCell.actual}</code> → Predicted <code>{selectedCell.pred}</code>
            </div>
            <div>
              <strong>Rate:</strong> {(selectedCell.rate * 100).toFixed(2)}% ({selectedCell.count} flows)
            </div>
          </div>
        )}
      </div>

      {/* Grid: Feature Importance & Per-Class Metrics */}
      <div className="grid-2">
        {/* Top 20 Feature Importance */}
        <div className="card">
          <div className="card-title">
            <span>Top 20 Predictive Feature Importances</span>
            <span className="badge badge-normal">MDI Gini Importance</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '14px' }}>
            Features providing highest discriminatory power. Port numbers and index fields were excluded prior to training to eliminate shortcuts.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {importances.slice(0, 16).map((item) => (
              <div key={item.feature}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>{item.feature}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#06b6d4', fontWeight: 600 }}>{(item.importance * 100).toFixed(2)}%</span>
                </div>
                <div className="bar-track" style={{ height: '5px' }}>
                  <div className="bar-fill" style={{ width: `${(item.importance / importances[0].importance) * 100}%`, backgroundColor: '#06b6d4' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-Class Classification Report */}
        <div className="card">
          <div className="card-title">
            <span>Per-Class Classification Report</span>
            <span className="badge badge-cyan">Precision · Recall · F1</span>
          </div>

          <div className="table-container" style={{ maxHeight: '420px' }}>
            <table className="cyber-table" style={{ fontSize: '0.78rem' }}>
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
                      <td style={{ fontFamily: 'var(--font-mono)', color: metrics.recall > 0.8 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
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
      <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
          Academic Model Interpretability Checklist
        </h3>
        <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.7' }}>
          <li><strong>Baseline Comparison:</strong> Random Forest achieved a Macro-F1 of {rfMetrics?.macro_F1?.toFixed(4)} vs Majority-class baseline of {baseMetrics?.macro_F1?.toFixed(4)}, verifying strong predictive signal across all classes.</li>
          <li><strong>Target & Feature Leakage Prevention:</strong> Raw port columns (<code>id.orig_p</code>, <code>id.resp_p</code>) and index row IDs were eliminated from the feature set to ensure the model learns packet dynamics rather than hardcoded port conventions.</li>
          <li><strong>Class Imbalance Strategy:</strong> Balanced subsampling class weighting (<code>class_weight='balanced_subsample'</code>) was applied, providing minority classes like SSH Brute Force and NMAP Scans proportional gradient penalties during tree splitting.</li>
          <li><strong>Generalization Caveat:</strong> Model performance measures within-dataset separability on the held-out RT-IOT2022 test partition. Independent validation on unseen hardware networks and live zero-day attacks is required prior to real-world deployment.</li>
        </ul>
      </div>
    </div>
  );
}
