import React from 'react';
import { BookOpen, ShieldCheck, AlertTriangle, FileCode, CheckCircle2, Bookmark, Terminal } from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Methodology, Scientific Rigor & Conclusions</h1>
        <p className="page-subtitle">
          Foundations of Data Science (23CSE351) Academic Case Study Documentation: Statistical integrity, boundary conditions, and evidence-based synthesis.
        </p>
      </div>

      {/* Core Principles Grid */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="card-title">
            <span>Methodological Principles</span>
            <ShieldCheck size={18} color="#10b981" />
          </div>
          <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.7' }}>
            <li><strong>Data Provenance:</strong> Derived strictly from the RT-IOT2022 testbed containing 123,117 flows across smart bulbs, IoT brokers, and adversary scripts.</li>
            <li><strong>Sanitization Without Fabrication:</strong> 0 rows imputed or fabricated. 0 full duplicates removed; index-like columns (<code>Unnamed: 0</code>) and raw ports (<code>id.orig_p</code>, <code>id.resp_p</code>) systematically excluded.</li>
            <li><strong>Non-Parametric Primacy:</strong> Due to heavy right-skewness and zero-inflation, Kruskal–Wallis H and Mann–Whitney U tests were selected over parametric ANOVA/t-tests.</li>
            <li><strong>Class Imbalance Accounting:</strong> Accuracy alone is rejected as a performance metric due to 76.89% dominance by <code>DOS_SYN_Hping</code>. Evaluation prioritizes Macro-F1 and balanced accuracy.</li>
          </ul>
        </div>

        <div className="card">
          <div className="card-title">
            <span>Multiple-Testing & FDR Control</span>
            <FileCode size={18} color="#06b6d4" />
          </div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '10px' }}>
            Conducting 11 simultaneous inferential tests would inflate the unadjusted family-wise false discovery risk to ~43%.
          </p>
          <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
            <code>P_adj = min(1, min_k&gt;=i (m/k * P_k))</code> (Benjamini–Hochberg algorithm).
            <div style={{ marginTop: '6px' }}>
              All 11 tests maintained adjusted p-values &lt; 0.0001, demonstrating that the observed differences are robust to multiple-comparison corrections.
            </div>
          </div>
        </div>
      </div>

      {/* A/B Testing Academic Boundary Callout */}
      <div className="alert-box alert-warning" style={{ marginBottom: '24px' }}>
        <AlertTriangle size={24} style={{ color: '#f59e0b', flexShrink: 0 }} />
        <div>
          <strong style={{ fontSize: '1rem', color: '#fef08a' }}>
            Academic Note on A/B Testing Requirements
          </strong>
          <p style={{ marginTop: '6px', fontSize: '0.85rem', lineHeight: '1.6' }}>
            The available RT-IOT2022 records are <strong>observational labelled network flows</strong>; they do not show randomized assignment to a treatment and control condition. Therefore, two-group protocol comparisons (TCP vs UDP) and high-SYN group comparisons are <strong>observational two-group statistical comparisons</strong>, not randomized A/B experiments.
          </p>
          <p style={{ marginTop: '6px', fontSize: '0.82rem', color: '#fde047' }}>
            Statistical significance indicates evidence against the null distribution within this dataset; it does not demonstrate that protocol selection causes higher packet rates or that results generalize to unmonitored production networks.
          </p>
        </div>
      </div>

      {/* Evidence-Based Conclusions Draft */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-title">
          <span>Evidence-Based Conclusions Generated from Empirical Run</span>
          <span className="badge badge-normal">Verified Findings</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
          <div style={{ padding: '12px 16px', background: 'var(--bg-input)', borderRadius: '6px', borderLeft: '3px solid #06b6d4' }}>
            <strong style={{ color: '#fff' }}>1. Flow Duration Separates Benign IoT from Attack Probes (Q4, Q14)</strong>
            <p style={{ marginTop: '4px' }}>
              Normal MQTT telemetry flows maintain sustained bidirectional sessions (median = 44.07 s) to service persistent sensor state updates. Conversely, scanning sweeps and DoS bursts terminate within sub-millisecond durations (median = 0.0000 s), providing a powerful temporal signature for intrusion detection.
            </p>
          </div>

          <div style={{ padding: '12px 16px', background: 'var(--bg-input)', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
            <strong style={{ color: '#fff' }}>2. The High-SYN Counter-Intuition in Volumetric Floods (Q10)</strong>
            <p style={{ marginTop: '4px' }}>
              Analysis revealed that <code>DOS_SYN_Hping</code> has a 0.0% high-SYN proportion (&gt;75th percentile), while normal multi-packet protocols have 37.15% (z = -196.12, 95% CI [-0.3771, -0.3658]). Attack tools emit single-packet flows without completing handshakes, whereas legitimate dialogues generate 2 SYN/SYN-ACK flags in completed exchanges. Naive thresholding on total SYN count per flow fails to detect SYN floods.
            </p>
          </div>

          <div style={{ padding: '12px 16px', background: 'var(--bg-input)', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
            <strong style={{ color: '#fff' }}>3. Multiclass Separability with Class-Aware Modeling (Q15)</strong>
            <p style={{ marginTop: '4px' }}>
              With raw ports removed, the Random Forest model achieved a Macro-F1 of 0.9338 and Balanced Accuracy of 0.9380 on held-out test data (compared to 0.0724 and 0.0833 for the majority baseline). Top predictive features—such as minimum forward header size, TCP window dimensions, and PSH/URG flags—confirm that engineered packet dynamics provide strong multidimensional separability.
            </p>
          </div>
        </div>
      </div>

      {/* Limitations and Future Research */}
      <div className="card">
        <div className="card-title">
          <span>Limitations & Directions for Future Research</span>
          <span className="badge badge-amber">Threats to Validity</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.85rem', color: '#cbd5e1' }}>
          <div>
            <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '4px' }}>1. Single-Testbed Environmental Bias</strong>
            Traffic was captured within a controlled laboratory testbed using specific device firmware versions and attack tools. Base rates and timing features may shift in production enterprise IoT topologies.
          </div>

          <div>
            <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '4px' }}>2. Independence Assumption Violations</strong>
            1,180 records share repeated feature signatures, and automated attack loops generate temporally correlated bursts. Ordinary p-values may be somewhat optimistic due to latent autocorrelation.
          </div>

          <div>
            <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '4px' }}>3. Unseen Attack Generalization</strong>
            Offline validation proves within-dataset separability on held-out folds. Detection of polymorphic zero-day variants and encrypted payload evasion requires continuous active learning and streaming drift detection.
          </div>
        </div>
      </div>
    </div>
  );
}
