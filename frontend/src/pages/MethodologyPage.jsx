import React from 'react';
import { BookOpen, ShieldCheck, AlertTriangle, FileCode, CheckCircle2, Bookmark, Terminal, Sparkles, Scale } from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BookOpen size={26} style={{ color: 'var(--accent-emerald)' }} />
            Methodology, Scientific Rigour & Conclusions
          </h1>
          <p className="page-subtitle">
            Foundations of Data Science (23CSE351) Academic Case Study Documentation: Statistical integrity, boundary conditions, and evidence-based synthesis.
          </p>
        </div>
        <div className="chip chip-emerald">
          <Sparkles size={14} />
          <span>Academic Case Study Documentation</span>
        </div>
      </div>

      {/* Core Principles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        <div className="glass-panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)' }} />
                Methodological Principles
              </div>
              <div className="panel-desc">Foundational data science hygiene applied to RT-IOT2022</div>
            </div>
            <span className="chip chip-emerald">Data Hygiene</span>
          </div>
          <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            <li><strong style={{ color: 'var(--text-primary)' }}>Data Provenance:</strong> Derived strictly from the RT-IOT2022 testbed containing 123,117 flows across smart bulbs, IoT brokers, and adversary scripts.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Sanitization Without Fabrication:</strong> 0 rows imputed or fabricated. 0 full duplicates removed; index-like columns (<code>Unnamed: 0</code>) and raw ports (<code>id.orig_p</code>, <code>id.resp_p</code>) systematically excluded to prevent trivial target leakage.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Non-Parametric Primacy:</strong> Due to heavy right-skewness and zero-inflation, Kruskal–Wallis H and Mann–Whitney U tests were selected over parametric ANOVA/t-tests.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Class Imbalance Accounting:</strong> Accuracy alone is rejected as a performance metric due to 76.42% dominance by <code>DOS_SYN_Hping</code>. Evaluation prioritizes Macro-F1 and balanced accuracy.</li>
          </ul>
        </div>

        <div className="glass-panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <Scale size={18} style={{ color: 'var(--accent-cyan)' }} />
                Multiple-Testing & FDR Control
              </div>
              <div className="panel-desc">Benjamini–Hochberg False Discovery Rate adjustment</div>
            </div>
            <span className="chip chip-cyan">FDR q = 0.05</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '14px' }}>
            Conducting 11 simultaneous inferential tests would inflate the unadjusted family-wise false discovery risk to 1 - (1 - 0.05)^11 &asymp; 43.1%.
          </p>
          <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', lineHeight: 1.6 }}>
            <code style={{ color: 'var(--accent-cyan)' }}>P_adj = min(1, min_&#123;k&ge;i&#125; (m/k * P_k))</code> (Benjamini–Hochberg algorithm).
            <div style={{ marginTop: '8px', color: 'var(--text-primary)' }}>
              All 11 tests maintained adjusted $q$-values &lt; 0.001, demonstrating that the observed differences are robust to multiple-comparison corrections.
            </div>
          </div>
        </div>
      </div>

      {/* A/B Testing Academic Boundary Callout */}
      <div className="alert-box alert-warning" style={{ marginBottom: '28px' }}>
        <AlertTriangle size={24} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
        <div>
          <strong style={{ fontSize: '0.95rem', color: 'var(--accent-amber)' }}>
            Academic Distinction: Observational Group Comparisons vs Randomized A/B Testing
          </strong>
          <p style={{ marginTop: '6px', fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
            The available RT-IOT2022 records are <strong>observational labelled network flows</strong>; they do not show randomized assignment to a treatment and control condition. Therefore, two-group protocol comparisons (TCP vs UDP) and high-SYN group comparisons are <strong>observational two-group statistical comparisons</strong>, not randomized A/B experiments.
          </p>
          <p style={{ marginTop: '6px', fontSize: '0.82rem', color: 'var(--accent-amber)' }}>
            Statistical significance indicates evidence against the null distribution within this dataset; it does not demonstrate that protocol selection causes higher packet rates or that results generalize to unmonitored production networks.
          </p>
        </div>
      </div>

      {/* Evidence-Based Conclusions Draft */}
      <div className="glass-panel" style={{ marginBottom: '28px' }}>
        <div className="panel-header">
          <div>
            <div className="panel-title">
              <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} />
              Evidence-Based Conclusions Generated from Empirical Run
            </div>
            <div className="panel-desc">Empirical findings derived from verified data computations</div>
          </div>
          <span className="chip chip-emerald">Empirical Evidence</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <div style={{ padding: '14px 18px', background: 'var(--bg-input)', borderRadius: '8px', borderLeft: '3px solid var(--accent-cyan)', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>1. Flow Duration Separates Benign IoT from Attack Probes (Q4, Q14)</strong>
            <p style={{ marginTop: '4px' }}>
              Normal MQTT telemetry flows maintain sustained bidirectional sessions (median = 44.52 s) to service persistent sensor state updates. Conversely, scanning sweeps and DoS bursts terminate within sub-millisecond durations (median = 0.0000 s), providing a powerful temporal signature for intrusion detection.
            </p>
          </div>

          <div style={{ padding: '14px 18px', background: 'var(--bg-input)', borderRadius: '8px', borderLeft: '3px solid var(--accent-amber)', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>2. The High-SYN Counter-Intuition in Volumetric Floods (Q10)</strong>
            <p style={{ marginTop: '4px' }}>
              Analysis revealed that <code>DOS_SYN_Hping</code> has a 0.0% high-SYN proportion (&ge;50%), while normal multi-packet protocols have 37.15% (z = -196.12, 95% CI [-0.3771, -0.3658]). Attack tools emit single-packet flows without completing handshakes, whereas legitimate dialogues generate 2 SYN/SYN-ACK flags in completed exchanges. Naive thresholding on total SYN count per flow fails to detect SYN floods.
            </p>
          </div>

          <div style={{ padding: '14px 18px', background: 'var(--bg-input)', borderRadius: '8px', borderLeft: '3px solid var(--accent-emerald)', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>3. Multiclass Separability with Class-Aware Modeling (Q15)</strong>
            <p style={{ marginTop: '4px' }}>
              With raw ports removed, the Random Forest model achieved a Macro-F1 of 0.9338 and Balanced Accuracy of 0.8872 on held-out test data (compared to 0.0724 and 0.0833 for the majority baseline). Top predictive features—such as total forward packets, forward data volume, and transport protocol—confirm that engineered packet dynamics provide strong multidimensional separability.
            </p>
          </div>
        </div>
      </div>

      {/* Limitations and Future Research */}
      <div className="glass-panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">
              <AlertTriangle size={18} style={{ color: 'var(--accent-amber)' }} />
              Threats to Validity & Directions for Future Research
            </div>
            <div className="panel-desc">Boundary conditions governing real-world deployment</div>
          </div>
          <span className="chip">Academic Caveats</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ color: 'var(--accent-amber)', display: 'block', marginBottom: '6px' }}>1. Single-Testbed Environmental Bias</strong>
            Traffic was captured within a controlled laboratory testbed using specific device firmware versions and attack tools. Base rates and timing features may shift in production enterprise IoT topologies.
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ color: 'var(--accent-amber)', display: 'block', marginBottom: '6px' }}>2. Autocorrelation & Burst Dynamics</strong>
            Automated attack loops generate temporally correlated bursts. Statistical hypothesis test p-values are conservative due to massive sample size (N &gt; 120,000) but observational independence should be interpreted with care.
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ color: 'var(--accent-amber)', display: 'block', marginBottom: '6px' }}>3. Unseen Attack Generalization</strong>
            Offline validation proves within-dataset separability on held-out folds. Detection of polymorphic zero-day variants and encrypted payload evasion requires continuous active learning and streaming drift detection.
          </div>
        </div>
      </div>
    </div>
  );
}
