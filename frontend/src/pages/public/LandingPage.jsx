import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';
import HeroGlobe3D from '../../components/3d/HeroGlobe3D';
import CinematicNetworkFlow from '../../components/entrance/CinematicNetworkFlow';
import { 
  ShieldAlert, ShieldCheck, ArrowRight, Activity, Database, 
  BarChart2, Cpu, CheckCircle2, ChevronRight, Layers, 
  Sparkles, Globe2, HelpCircle, FileText, ExternalLink,
  Terminal, Server, PieChart, TrendingUp, Lock, RefreshCw, BookOpen
} from 'lucide-react';

export default function LandingPage({ theme = 'dark', toggleTheme }) {
  const [showWarp, setShowWarp] = useState(true);
  const [selectedResearchCat, setSelectedResearchCat] = useState('ALL');

  // Real verified research questions from the notebook
  const RESEARCH_SHOWCASE = [
    {
      id: 'Q1',
      category: 'VOLUME',
      num: 'Question 01',
      title: 'Traffic Class Imbalance & Attack Dominance',
      finding: 'DOS_SYN_Hping constitutes 76.42% (94,089 flows) of all traffic. Normal telemetry represents 10.16% (12,509 flows).',
      evidence: 'Gini coefficient = 0.812 · Extreme class skewness',
      route: '/dashboard/attacks',
      color: '#f43f5e'
    },
    {
      id: 'Q4',
      category: 'PROTOCOLS',
      num: 'Question 04',
      title: 'Transport Layer Protocol Distribution',
      finding: 'TCP accounts for 89.69% of records, UDP for 10.23%, and ARP/Ether for 0.08%. Volumetric attacks exclusively exploit TCP SYN.',
      evidence: 'TCP: 110,422 flows · UDP: 12,593 flows',
      route: '/dashboard/statistics',
      color: '#22d3ee'
    },
    {
      id: 'Q7',
      category: 'KINETICS',
      num: 'Question 07',
      title: 'Flow Duration Dynamics across Attack Classes',
      finding: 'DOS SYN floods exhibit median duration of 0.000000s (single SYN packet), whereas MQTT telemetry averages 44.52s persistent dialogues.',
      evidence: 'Mann-Whitney U p < 1e-15 · Extreme duration polarity',
      route: '/dashboard/statistics',
      color: '#34d399'
    },
    {
      id: 'Q10',
      category: 'KINETICS',
      num: 'Question 10',
      title: 'Packet Asymmetry: Forward vs Backward Rates',
      finding: 'Normal IoT cloud traffic demonstrates balanced bidirectional packet exchange. DOS and NMAP scans exhibit near-zero backward packets.',
      evidence: 'ThingSpeak: 1:1 ratio · DOS SYN: 1:0 ratio',
      route: '/dashboard/eda',
      color: '#f59e0b'
    },
    {
      id: 'Q13',
      category: 'HYPOTHESIS',
      num: 'Question 13',
      title: 'Inferential Hypothesis Testing with FDR Control',
      finding: 'Statistical tests confirm significant behavioral divergence between normal IoT telemetry and attack vectors with Benjamini-Hochberg FDR control.',
      evidence: 'α = 0.05 · False Discovery Rate adjusted',
      route: '/dashboard/hypotheses',
      color: '#a855f7'
    },
    {
      id: 'Q15',
      category: 'ML',
      num: 'Question 15',
      title: 'Multiclass Traffic Classification with Random Forest',
      finding: 'Trained on 80/20 stratified split, Random Forest achieves 93.14% Macro-F1 across 12 discrete classes using 84 network kinetic features.',
      evidence: 'Macro-F1: 0.9314 · Weighted-F1: 0.9892',
      route: '/dashboard/model',
      color: '#38bdf8'
    }
  ];

  const filteredResearch = selectedResearchCat === 'ALL'
    ? RESEARCH_SHOWCASE
    : RESEARCH_SHOWCASE.filter(q => q.category === selectedResearchCat);

  return (
    <div className="public-page-wrapper">
      {/* Cinematic 3D Network Packet Flow Intro Animation */}
      {showWarp && (
        <CinematicNetworkFlow onComplete={() => setShowWarp(false)} duration={7.0} />
      )}

      <PublicNavbar theme={theme} toggleTheme={toggleTheme} />

      {/* =========================================================================
          SECTION 1: HERO SECTION
          ========================================================================= */}
      <section className="landing-hero-section">
        <div className="landing-hero-container">
          {/* Left Column: Copy & CTAs */}
          <div className="landing-hero-copy">
            <div className="hero-eyebrow-pill">
              <span className="hero-pulse-dot" />
              <span>DATA-DRIVEN IoT SECURITY INTELLIGENCE</span>
            </div>

            <h1 className="landing-hero-title">
              See the patterns.<br />
              <span className="gradient-text">Understand the threats.</span>
            </h1>

            <div className="landing-hero-tagline">
              "From Traffic to Threats. From Data to Decisions."
            </div>

            <p className="landing-hero-desc">
              Explore IoT network behaviour through statistical evidence, interactive 3D visualizations, and machine learning-based traffic classification across 123,117 network records.
            </p>

            {/* CTAs */}
            <div className="landing-hero-ctas">
              <Link to="/dashboard" className="btn btn-primary hero-main-cta">
                <span>Explore Analytics</span>
                <ArrowRight size={17} />
              </Link>

              <Link to="/research" className="btn btn-secondary hero-sub-cta">
                <HelpCircle size={16} />
                <span>Discover the Research</span>
              </Link>
            </div>

            {/* Truthful Dataset Badge */}
            <div className="hero-integrity-badge">
              <ShieldCheck size={16} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
              <span>
                <strong>RT-IOT2022 Benchmark</strong> · Offline Network Traffic Analysis · Real Data Verification
              </span>
            </div>
          </div>

          {/* Right Column: Signature 3D Globe */}
          <div className="landing-hero-visual">
            <div className="hero-3d-frame">
              <HeroGlobe3D theme={theme} />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: RESEARCH METRICS (VERIFIED DATA)
          ========================================================================= */}
      <section className="landing-metrics-section">
        <div className="landing-container">
          <div className="metrics-grid">
            <div className="metric-box">
              <div className="metric-icon-wrap" style={{ color: '#22d3ee' }}>
                <Database size={20} />
              </div>
              <div className="metric-value">123,117</div>
              <div className="metric-label">Flow Records Analyzed</div>
              <div className="metric-sub">Complete RT-IOT2022 benchmark</div>
            </div>

            <div className="metric-box">
              <div className="metric-icon-wrap" style={{ color: '#f43f5e' }}>
                <ShieldAlert size={20} />
              </div>
              <div className="metric-value">12</div>
              <div className="metric-label">Traffic & Attack Classes</div>
              <div className="metric-sub">9 attack vectors · 3 normal classes</div>
            </div>

            <div className="metric-box">
              <div className="metric-icon-wrap" style={{ color: '#34d399' }}>
                <BarChart2 size={20} />
              </div>
              <div className="metric-value">84</div>
              <div className="metric-label">Analytical Features</div>
              <div className="metric-sub">Duration, packet rates, kinetic flags</div>
            </div>

            <div className="metric-box">
              <div className="metric-icon-wrap" style={{ color: '#a855f7' }}>
                <HelpCircle size={20} />
              </div>
              <div className="metric-value">15</div>
              <div className="metric-label">Research Questions</div>
              <div className="metric-sub">Empirically tested & documented</div>
            </div>

            <div className="metric-box">
              <div className="metric-icon-wrap" style={{ color: '#38bdf8' }}>
                <Cpu size={20} />
              </div>
              <div className="metric-value">93.14%</div>
              <div className="metric-label">Random Forest Macro-F1</div>
              <div className="metric-sub">89.4% balanced accuracy across classes</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: THE ANALYTICAL WORKFLOW
          ========================================================================= */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-eyebrow">RIGOROUS METHODOLOGY</span>
            <h2 className="section-title">The Analytical Workflow</h2>
            <p className="section-subtitle">
              From raw packet captures to inferential statistical validation and machine learning classification.
            </p>
          </div>

          <div className="workflow-grid">
            <div className="workflow-step-card">
              <div className="workflow-number">01</div>
              <h3 className="workflow-step-title">Ingest & Curate</h3>
              <p className="workflow-step-desc">
                Import 123,117 RT-IOT2022 flows, clean categorical encoding, handle protocol flags, and structure 84 numerical features.
              </p>
              <div className="workflow-tag">DuckDB In-Memory OLAP</div>
            </div>

            <div className="workflow-step-card">
              <div className="workflow-number">02</div>
              <h3 className="workflow-step-title">Investigate Patterns</h3>
              <p className="workflow-step-desc">
                Evaluate non-normal distributions, extreme duration skewness, class imbalance, and transport protocol dependencies.
              </p>
              <div className="workflow-tag">IQR & Non-Parametric EDA</div>
            </div>

            <div className="workflow-step-card">
              <div className="workflow-number">03</div>
              <h3 className="workflow-step-title">Test the Evidence</h3>
              <p className="workflow-step-desc">
                Apply Mann-Whitney U, Chi-Square independence, and Spearman correlation with Benjamini-Hochberg FDR control (α = 0.05).
              </p>
              <div className="workflow-tag">Hypothesis Testing</div>
            </div>

            <div className="workflow-step-card">
              <div className="workflow-number">04</div>
              <h3 className="workflow-step-title">Train & Classify</h3>
              <p className="workflow-step-desc">
                Train a 100-tree Random Forest on stratified 80/20 split, evaluating Macro-F1, per-class sensitivity, and feature importance.
              </p>
              <div className="workflow-tag">Scikit-Learn Classifier</div>
            </div>

            <div className="workflow-step-card">
              <div className="workflow-number">05</div>
              <h3 className="workflow-step-title">Explore Interactively</h3>
              <p className="workflow-step-desc">
                Inspect 3D spatial network clusters, query raw data with DuckDB SQL, and export curated datasets directly into Power BI.
              </p>
              <div className="workflow-tag">3D SOC + Power BI</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: INTERACTIVE RESEARCH SHOWCASE (15 QUESTIONS)
          ========================================================================= */}
      <section className="landing-section" style={{ background: 'var(--bg-surface)' }}>
        <div className="landing-container">
          <div className="section-header">
            <span className="section-eyebrow">RESEARCH SHOWCASE</span>
            <h2 className="section-title">15 Core Analytical Questions</h2>
            <p className="section-subtitle">
              Every finding is anchored in empirical data from the RT-IOT2022 benchmark, verified through statistical testing and machine learning.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="filter-pill-bar">
            {['ALL', 'VOLUME', 'PROTOCOLS', 'KINETICS', 'HYPOTHESIS', 'ML'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedResearchCat(cat)}
                className={`filter-pill ${selectedResearchCat === cat ? 'active' : ''}`}
              >
                {cat === 'ALL' ? 'All Investigations' : cat}
              </button>
            ))}
          </div>

          {/* Showcase Cards Grid */}
          <div className="research-grid">
            {filteredResearch.map((item) => (
              <div key={item.id} className="research-card">
                <div className="research-card-header">
                  <span className="research-tag" style={{ color: item.color, borderColor: `${item.color}40`, background: `${item.color}10` }}>
                    {item.num}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {item.category}
                  </span>
                </div>

                <h3 className="research-card-title">{item.title}</h3>
                <p className="research-card-finding">{item.finding}</p>

                <div className="research-evidence-box">
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Evidence:</span> {item.evidence}
                </div>

                <div className="research-card-footer">
                  <Link to={item.route} className="research-link">
                    <span>Inspect in Dashboard</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/research" className="btn btn-secondary">
              <span>View All 15 Research Questions & Full Analysis</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: THE 3D EXPERIENCE SHOWCASE
          ========================================================================= */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="showcase-split-grid">
            {/* Visual Preview */}
            <div className="showcase-preview-col">
              <div className="glass-panel" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span className="hero-3d-badge">Spatial Telemetry Model</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Hardware WebGL</span>
                </div>
                <div style={{ background: 'var(--bg-input)', borderRadius: 10, padding: 20, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <Activity size={18} style={{ color: 'var(--accent-cyan)' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Kinetic Flow Spatial Coordinates
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 14px 0' }}>
                    Nodes are positioned according to behavioral flow characteristics: volumetric flood clusters, periodic sensor dialogues, stateless UDP scans, and L2 ARP poisoning.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>DOMINANT VECTOR</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f43f5e' }}>DOS SYN Flood</div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>NORMAL IOT RATIO</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#34d399' }}>10.159% Share</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Col */}
            <div className="showcase-text-col">
              <span className="section-eyebrow">IMMERSIVE DATA EXPLORATION</span>
              <h2 className="section-title">Spatial Threat Topology & Interaction</h2>
              <p className="section-subtitle" style={{ textAlign: 'left', marginBottom: 20 }}>
                A custom 3D web graphics engine transforming raw telemetry tables into an intuitive spatial environment.
              </p>

              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-bullet" />
                  <div>
                    <h4 className="feature-item-title">Dual 3D / 2D Rendering Modes</h4>
                    <p className="feature-item-desc">
                      Seamlessly toggle between the interactive 3D geodetic sphere and the high-contrast 2D SVG topological network map at any moment.
                    </p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-bullet" />
                  <div>
                    <h4 className="feature-item-title">Direct Node Telemetry Inspection</h4>
                    <p className="feature-item-desc">
                      Click any cluster node in 3D to open an empirical inspection drawer revealing flow counts, traffic shares, protocols, and median durations.
                    </p>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-bullet" />
                  <div>
                    <h4 className="feature-item-title">Hardware-Accelerated & Accessible</h4>
                    <p className="feature-item-desc">
                      Built with Three.js and React Three Fiber with zero layout shifts, graceful WebGL fallback, and support for reduced-motion preferences.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <Link to="/dashboard" className="btn btn-primary">
                  <span>Open 3D Dashboard</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: STATISTICAL EVIDENCE & INFERENTIAL RIGOR
          ========================================================================= */}
      <section className="landing-section" style={{ background: 'var(--bg-surface)' }}>
        <div className="landing-container">
          <div className="section-header">
            <span className="section-eyebrow">STATISTICAL RIGOR</span>
            <h2 className="section-title">Hypothesis Testing & Evidence</h2>
            <p className="section-subtitle">
              We distinguish between observed descriptive differences and statistically significant evidence through non-parametric inferential testing.
            </p>
          </div>

          <div className="evidence-grid">
            <div className="evidence-card">
              <div className="evidence-card-badge">Mann-Whitney U Test</div>
              <h3 className="evidence-title">Flow Duration & Packet Rate Divergence</h3>
              <p className="evidence-desc">
                Testing whether normal telemetry and attack vectors originate from identical duration distributions. Normality was decisively rejected via Shapiro-Wilk (p &lt; 0.001), mandating non-parametric rank tests.
              </p>
              <div className="evidence-stat-row">
                <span className="evidence-stat-label">p-value:</span>
                <span className="evidence-stat-val">&lt; 1.0 × 10⁻¹⁵ (Significant)</span>
              </div>
              <div className="evidence-stat-row">
                <span className="evidence-stat-label">Decision:</span>
                <span className="evidence-stat-val" style={{ color: 'var(--accent-emerald)' }}>Reject Null Hypothesis H₀</span>
              </div>
            </div>

            <div className="evidence-card">
              <div className="evidence-card-badge">Chi-Square Independence</div>
              <h3 className="evidence-title">Protocol & Attack Class Contingency</h3>
              <p className="evidence-desc">
                Evaluating independence between transport layer protocols (TCP, UDP, ARP) and traffic classifications across all 123,117 observed records in a 12 × 3 contingency matrix.
              </p>
              <div className="evidence-stat-row">
                <span className="evidence-stat-label">Chi-Square Statistic:</span>
                <span className="evidence-stat-val">χ² = 34,819.4 (p &lt; 1e-15)</span>
              </div>
              <div className="evidence-stat-row">
                <span className="evidence-stat-label">Decision:</span>
                <span className="evidence-stat-val" style={{ color: 'var(--accent-emerald)' }}>Decisive Protocol Dependence</span>
              </div>
            </div>

            <div className="evidence-card">
              <div className="evidence-card-badge">Benjamini-Hochberg FDR</div>
              <h3 className="evidence-title">Multiple Testing Correction (α = 0.05)</h3>
              <p className="evidence-desc">
                To prevent family-wise error inflation across multiple pairwise hypothesis tests, all raw p-values were adjusted using the Benjamini-Hochberg False Discovery Rate procedure.
              </p>
              <div className="evidence-stat-row">
                <span className="evidence-stat-label">FDR Threshold:</span>
                <span className="evidence-stat-val">q &lt; 0.05 Controlled</span>
              </div>
              <div className="evidence-stat-row">
                <span className="evidence-stat-label">Status:</span>
                <span className="evidence-stat-val" style={{ color: 'var(--accent-cyan)' }}>100% Tests Retain Significance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: MACHINE LEARNING (RANDOM FOREST)
          ========================================================================= */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-eyebrow">SUPERVISED CLASSIFICATION</span>
            <h2 className="section-title">Random Forest Multiclass Benchmark</h2>
            <p className="section-subtitle">
              Evaluating feature-based classification across 12 discrete classes on an 80/20 stratified train/test split.
            </p>
          </div>

          <div className="ml-showcase-box">
            <div className="ml-metrics-row">
              <div className="ml-stat-cell">
                <div className="ml-stat-number">0.9314</div>
                <div className="ml-stat-title">Macro-Averaged F1</div>
                <div className="ml-stat-detail">Treats minority attack classes with equal weight</div>
              </div>
              <div className="ml-stat-cell">
                <div className="ml-stat-number" style={{ color: 'var(--accent-emerald)' }}>0.9892</div>
                <div className="ml-stat-title">Weighted-Averaged F1</div>
                <div className="ml-stat-detail">Reflects true volumetric flow distribution</div>
              </div>
              <div className="ml-stat-cell">
                <div className="ml-stat-number" style={{ color: 'var(--accent-cyan)' }}>89.4%</div>
                <div className="ml-stat-title">Balanced Accuracy</div>
                <div className="ml-stat-detail">Robust against severe 76.4% class dominance</div>
              </div>
              <div className="ml-stat-cell">
                <div className="ml-stat-number" style={{ color: '#f59e0b' }}>100</div>
                <div className="ml-stat-title">Decision Trees</div>
                <div className="ml-stat-detail">Gini impurity criterion, sqrt feature subsampling</div>
              </div>
            </div>

            <div className="ml-insights-content">
              <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Top Discriminating Features Identified:
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                Gini feature importance analysis reveals that forward packet counts (<code>fwd_pkts_tot</code>), flow duration (<code>flow_duration</code>), backward data packet volume (<code>bwd_data_pkts_tot</code>), and inter-arrival time standard deviation are the primary predictors distinguishing volumetric floods from normal IoT device activity.
              </p>

              <div className="alert-box alert-info" style={{ margin: 0 }}>
                <Lock size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Scientific Transparency Disclaimer:</strong> This machine learning model represents an evaluation on a labelled offline benchmark dataset (RT-IOT2022). It serves as an academic case study for feature separability and should not be construed as operational proof of real-time zero-day intrusion detection.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: TECHNOLOGY STACK & ARCHITECTURE
          ========================================================================= */}
      <section className="landing-section" style={{ background: 'var(--bg-surface)' }}>
        <div className="landing-container">
          <div className="section-header">
            <span className="section-eyebrow">MODERN FULL-STACK</span>
            <h2 className="section-title">Engineered for Analytical Performance</h2>
            <p className="section-subtitle">
              Every layer of IoT PULSE is designed for reproducible analytical execution, sub-second query latency, and high-contrast visual clarity.
            </p>
          </div>

          <div className="tech-stack-grid">
            <div className="tech-card">
              <div className="tech-card-icon" style={{ color: '#22d3ee' }}>
                <Server size={22} />
              </div>
              <h3 className="tech-card-title">FastAPI REST Backend</h3>
              <p className="tech-card-desc">
                High-performance Python 3 async API serving verified statistical calculations, hypothesis test results, and ML metrics via Pydantic schemas.
              </p>
              <div className="tech-card-badge">REST API · Port 8000</div>
            </div>

            <div className="tech-card">
              <div className="tech-card-icon" style={{ color: '#f59e0b' }}>
                <Database size={22} />
              </div>
              <h3 className="tech-card-title">DuckDB In-Memory OLAP</h3>
              <p className="tech-card-desc">
                Embedded analytical SQL query engine executing fast aggregate queries over 123,117 network records without expensive database overhead.
              </p>
              <div className="tech-card-badge">Zero-Copy OLAP</div>
            </div>

            <div className="tech-card">
              <div className="tech-card-icon" style={{ color: '#38bdf8' }}>
                <Terminal size={22} />
              </div>
              <h3 className="tech-card-title">React 18 + Vite</h3>
              <p className="tech-card-desc">
                Modern responsive SPA built with optimized bundle splitting, custom dark/light theme tokens, accessible ARIA patterns, and error boundaries.
              </p>
              <div className="tech-card-badge">Production SPA</div>
            </div>

            <div className="tech-card">
              <div className="tech-card-icon" style={{ color: '#34d399' }}>
                <Globe2 size={22} />
              </div>
              <h3 className="tech-card-title">Three.js & R3F</h3>
              <p className="tech-card-desc">
                Hardware-accelerated 3D WebGL spatial visualization with orbital rings, kinetic telemetry particles, spline transmission arcs, and fallbacks.
              </p>
              <div className="tech-card-badge">3D Cyber Atmosphere</div>
            </div>

            <div className="tech-card">
              <div className="tech-card-icon" style={{ color: '#a855f7' }}>
                <Cpu size={22} />
              </div>
              <h3 className="tech-card-title">SciPy & Scikit-Learn</h3>
              <p className="tech-card-desc">
                Rigorous statistical science pipeline executing Mann-Whitney U, Chi-Square, Benjamini-Hochberg FDR, and Random Forest classification.
              </p>
              <div className="tech-card-badge">Data Science Core</div>
            </div>

            <div className="tech-card">
              <div className="tech-card-icon" style={{ color: '#f43f5e' }}>
                <PieChart size={22} />
              </div>
              <h3 className="tech-card-title">Power BI Integration</h3>
              <p className="tech-card-desc">
                Curated CSV pipeline and DAX measures connecting enterprise business intelligence directly to the cleaned analytical dataset.
              </p>
              <div className="tech-card-badge">Enterprise BI Export</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: FINAL CALL TO ACTION
          ========================================================================= */}
      <section className="landing-cta-section">
        <div className="landing-container">
          <div className="cta-banner-card">
            <div className="cta-banner-content">
              <div className="hero-eyebrow-pill" style={{ marginBottom: 16 }}>
                <span>READY TO EXPLORE</span>
              </div>
              <h2 className="cta-title">Turn network data into evidence.</h2>
              <p className="cta-desc">
                Explore the traffic patterns, statistical findings, and machine learning results behind IoT PULSE on the live interactive dashboard.
              </p>
              <div className="cta-actions">
                <Link to="/dashboard" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.94rem' }}>
                  <span>Launch the Dashboard</span>
                  <ArrowRight size={17} />
                </Link>
                <Link to="/methodology" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '0.94rem' }}>
                  <BookOpen size={17} />
                  <span>Explore the Methodology</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10: FOOTER
          ========================================================================= */}
      <PublicFooter />
    </div>
  );
}
