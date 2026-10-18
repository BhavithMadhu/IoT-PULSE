import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';
import { 
  BookOpen, ShieldCheck, Database, CheckCircle2, 
  AlertTriangle, ArrowRight, FileText, Cpu, Scale, Lock
} from 'lucide-react';

export default function MethodologyPublicPage({ theme = 'dark', toggleTheme }) {
  return (
    <div className="public-page-wrapper">
      <PublicNavbar theme={theme} toggleTheme={toggleTheme} />

      {/* Header */}
      <section className="public-page-header">
        <div className="landing-container">
          <span className="section-eyebrow">ACADEMIC RIGOUR & REPRODUCIBILITY</span>
          <h1 className="public-header-title">
            Scientific Methodology & Statistical Rigor
          </h1>
          <p className="public-header-desc">
            A comprehensive, transparent documentation of dataset acquisition, preprocessing pipelines, statistical assumptions, inferential corrections, and scientific limitations.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="landing-section" style={{ paddingTop: 0 }}>
        <div className="landing-container" style={{ maxWidth: 940 }}>
          
          {/* Section 1: Dataset Provenance */}
          <div className="method-doc-block">
            <div className="method-doc-header">
              <span className="method-step-badge">STAGE 01</span>
              <h2 className="method-doc-title">RT-IOT2022 Dataset Provenance & Capture</h2>
            </div>
            <p className="method-doc-text">
              The empirical foundation of this study is the <strong>RT-IOT2022</strong> benchmark dataset, collected in a realistic IoT testbed incorporating commercial smart home sensors, gateways, and cloud broker services. Network traffic was captured via network taps running Zeek (formerly Bro) network monitoring software to extract bidirectional network flow records.
            </p>
            <div className="method-bullet-box">
              <ul>
                <li><strong>Dataset Volume:</strong> 123,117 curated network flow records.</li>
                <li><strong>Feature Dimensionality:</strong> 84 extracted flow features capturing timing, packet sizes, flag distributions, and kinetic throughput.</li>
                <li><strong>Normal Devices Represented:</strong> ThingSpeak sensor telemetry, MQTT publish-subscribe dialogue, and standard network keep-alives.</li>
                <li><strong>Attack Vectors Injected:</strong> SYN flood (hping3), NMAP UDP scan, NMAP SYN scan, NMAP FIN scan, NMAP ACK scan, NMAP XMAS scan, Metasploit dictionary brute force, and Layer 2 ARP poisoning.</li>
              </ul>
            </div>
          </div>

          {/* Section 2: Preprocessing & Data Cleaning */}
          <div className="method-doc-block">
            <div className="method-doc-header">
              <span className="method-step-badge">STAGE 02</span>
              <h2 className="method-doc-title">Preprocessing & Feature Transformation</h2>
            </div>
            <p className="method-doc-text">
              Raw network captures require meticulous curation to prevent data leakage and numerical instability in statistical modeling:
            </p>
            <div className="method-bullet-box">
              <ul>
                <li><strong>Missing Value Audit:</strong> Numerical attributes were inspected for nulls and NaNs; infinite rate artifacts caused by zero-duration flows were smoothed with an infinitesimal epsilon (&epsilon; = 10⁻⁶).</li>
                <li><strong>Categorical Encoding:</strong> Transport layer protocols (TCP, UDP, ARP) and target services were encoded into nominal categories for contingency analysis.</li>
                <li><strong>Deduplication:</strong> Exact duplicate flow records with identical timestamps and 5-tuples were reconciled to avoid artificial frequency inflation.</li>
                <li><strong>Feature Pruning:</strong> Zero-variance columns and non-generalizable hardware identifiers (e.g., static MAC addresses) were excluded from classification features.</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Non-Parametric Justification */}
          <div className="method-doc-block">
            <div className="method-doc-header">
              <span className="method-step-badge">STAGE 03</span>
              <h2 className="method-doc-title">Statistical Assumptions & Test Selection</h2>
            </div>
            <p className="method-doc-text">
              Parametric hypothesis tests (such as Student's t-test or ANOVA) assume that underlying data follows a Gaussian distribution. In IoT cybersecurity telemetry, flow duration and packet rates exhibit extreme positive skewness and zero-inflation.
            </p>
            <div className="alert-box alert-warning" style={{ margin: '14px 0' }}>
              <Scale size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>Normality Rejection:</strong> The Shapiro-Wilk test for normality on flow duration produced W = 0.124 (p &lt; 0.001), decisively rejecting Gaussian assumptions. Consequently, non-parametric rank tests (<strong>Mann-Whitney U</strong> and <strong>Kruskal-Wallis H</strong>) were adopted throughout this study.
              </div>
            </div>
            <p className="method-doc-text">
              For categorical dependencies between protocols and attack classes, the <strong>Pearson Chi-Square test of independence</strong> (&chi;²) was employed alongside Cramer's V to measure practical effect size.
            </p>
          </div>

          {/* Section 4: Multiple Testing FDR Correction */}
          <div className="method-doc-block">
            <div className="method-doc-header">
              <span className="method-step-badge">STAGE 04</span>
              <h2 className="method-doc-title">False Discovery Rate (FDR) Control</h2>
            </div>
            <p className="method-doc-text">
              When conducting multiple simultaneous statistical comparisons across 15 research questions, the probability of false positives (Type I error inflation) increases substantially.
            </p>
            <div className="method-bullet-box">
              <ul>
                <li><strong>Procedure:</strong> Applied the Benjamini-Hochberg False Discovery Rate (FDR) procedure with a significance threshold of &alpha; = 0.05.</li>
                <li><strong>Ranking Formula:</strong> Raw p-values were sorted in ascending order and adjusted using the critical value <code style={{ color: 'var(--accent-cyan)' }}>(i / m) &times; Q</code>, where <em>i</em> is rank and <em>m</em> is the number of hypotheses.</li>
                <li><strong>Outcome:</strong> All formal hypothesis tests maintained statistical significance under adjusted FDR thresholds, confirming the robustness of behavioral divergence.</li>
              </ul>
            </div>
          </div>

          {/* Section 5: Machine Learning Validation */}
          <div className="method-doc-block">
            <div className="method-doc-header">
              <span className="method-step-badge">STAGE 05</span>
              <h2 className="method-doc-title">Machine Learning Classification Rigor</h2>
            </div>
            <p className="method-doc-text">
              The multiclass classification task poses severe challenges due to class imbalance: DOS_SYN_Hping accounts for 76.42% of records, whereas WepAttack accounts for only 0.03% (35 records).
            </p>
            <div className="method-bullet-box">
              <ul>
                <li><strong>Validation Strategy:</strong> Stratified 80/20 train/test split preserving exact class proportions in both sets.</li>
                <li><strong>Model Architecture:</strong> Random Forest ensemble of 100 trees with Gini impurity criterion and square-root feature subsampling.</li>
                <li><strong>Primary Evaluation Metric:</strong> Macro-averaged F1 (0.9314) and Balanced Accuracy (89.4%) rather than raw accuracy, ensuring minority attack vectors are not overshadowed by the dominant SYN flood.</li>
              </ul>
            </div>
          </div>

          {/* Section 6: Limitations & Academic Transparency */}
          <div className="method-doc-block" style={{ borderBottom: 'none' }}>
            <div className="method-doc-header">
              <span className="method-step-badge" style={{ color: '#f59e0b', borderColor: '#f59e0b50' }}>STAGE 06</span>
              <h2 className="method-doc-title">Scientific Limitations & Scope</h2>
            </div>
            <p className="method-doc-text">
              Honest acknowledgment of dataset limitations is a cornerstone of rigorous data science research:
            </p>
            <div className="alert-box alert-info" style={{ margin: '14px 0' }}>
              <Lock size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>Offline Benchmark Scope:</strong> RT-IOT2022 represents a captured offline benchmark collected in a controlled laboratory setting. Attack scripts were executed in structured sessions rather than continuous operational enterprise deployments. High performance on this dataset demonstrates statistical separability of known features, but does not equate to zero-day live intrusion detection capabilities.
              </div>
            </div>
          </div>

          {/* Bottom Action */}
          <div style={{ textAlign: 'center', marginTop: 40, padding: 28, background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Inspect the Methodology in the Interactive Application
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 16px auto' }}>
              Review the detailed tables, statistical matrices, and evidence summaries in the dashboard methodology module.
            </p>
            <Link to="/dashboard/methodology" className="btn btn-primary">
              <span>Open Dashboard Methodology</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
