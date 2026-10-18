import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';
import { 
  HelpCircle, CheckCircle2, ArrowRight, BarChart2, ShieldAlert, 
  Activity, Cpu, Database, Filter, Layers, Check
} from 'lucide-react';

const ALL_15_QUESTIONS = [
  {
    num: 'Q01',
    group: 'COMPOSITION',
    groupName: 'Traffic Volume & Class Composition',
    question: 'What is the distribution of attack categories across the dataset?',
    objective: 'Measure the proportional representation and severe class imbalance of traffic labels.',
    finding: 'DOS_SYN_Hping dominates with 94,089 flows (76.42%). ThingSpeak normal telemetry comprises 12,509 flows (10.16%). ARP Poisoning accounts for 7,750 flows (6.29%).',
    evidence: 'Gini coefficient = 0.812 · 12 discrete traffic classes',
    route: '/dashboard/attacks'
  },
  {
    num: 'Q02',
    group: 'COMPOSITION',
    groupName: 'Traffic Volume & Class Composition',
    question: 'How does the volume of malicious traffic compare to normal IoT device traffic?',
    objective: 'Determine the exact ratio of attack flows versus benign operational IoT telemetry.',
    finding: 'Malicious traffic accounts for 89.84% (110,610 flows), whereas benign IoT device communications represent 10.16% (12,507 flows).',
    evidence: 'Attack-to-normal flow ratio is 8.84 : 1',
    route: '/dashboard/attacks'
  },
  {
    num: 'Q03',
    group: 'COMPOSITION',
    groupName: 'Traffic Volume & Class Composition',
    question: 'What is the breakdown of specific attack types within malicious traffic?',
    objective: 'Analyze the relative frequencies of the 9 specific attack vectors within the malicious subset.',
    finding: 'Volumetric Flooding represents 85.06% of malicious traffic, Layer 2 Poisoning represents 7.01%, Port Scans represent 7.82%, and Credential Brute Force represents 0.11%.',
    evidence: 'SYN flood is the overwhelming volumetric threat',
    route: '/dashboard/attacks'
  },
  {
    num: 'Q04',
    group: 'PROTOCOLS',
    groupName: 'Protocol Dynamics & Port Mechanics',
    question: 'What transport-layer protocols are most commonly utilized by different attack types?',
    objective: 'Examine transport layer protocol affinity across malicious vectors and normal telemetry.',
    finding: 'TCP is utilized by 89.69% of records (110,422 flows), UDP by 10.23% (12,593 flows), and ARP/Ethernet by 0.08% (102 flows).',
    evidence: 'TCP is the dominant transport vector for volumetric attacks',
    route: '/dashboard/statistics'
  },
  {
    num: 'Q05',
    group: 'PROTOCOLS',
    groupName: 'Protocol Dynamics & Port Mechanics',
    question: 'Which network services are most frequently targeted by malicious activities?',
    objective: 'Identify targeted ports and application-layer daemon services.',
    finding: 'Over 94% of malicious flows target unassigned/ephemeral ports (DOS flooding). Scans probe HTTP (80), SSH (22), DNS (53), and MQTT (1883).',
    evidence: 'Application-layer attacks concentrate on standard management daemons',
    route: '/dashboard/statistics'
  },
  {
    num: 'Q06',
    group: 'PROTOCOLS',
    groupName: 'Protocol Dynamics & Port Mechanics',
    question: 'Is there a relationship between the protocol used and the attack type?',
    objective: 'Test contingency between transport protocols and specific threat classifications.',
    finding: 'Certain attacks are protocol-bound: NMAP_UDP_SCAN is 100% UDP; DOS_SYN_Hping and MQTT are 100% TCP; ARP Poisoning operates at Layer 2.',
    evidence: 'Deterministic protocol binding for 5 of 9 attack types',
    route: '/dashboard/statistics'
  },
  {
    num: 'Q07',
    group: 'KINETICS',
    groupName: 'Flow Kinetics & Temporal Distributions',
    question: 'How does flow duration vary between normal and malicious traffic?',
    objective: 'Quantify flow duration dispersion and central tendencies between benign and hostile traffic.',
    finding: 'Normal IoT flows have a median duration of 0.000021s (MQTT reaching 44.52s), whereas 96.8% of attack flows have a duration of 0.000000s.',
    evidence: 'Interquartile range (IQR) for attack flows is 0.000000s',
    route: '/dashboard/eda'
  },
  {
    num: 'Q08',
    group: 'KINETICS',
    groupName: 'Flow Kinetics & Temporal Distributions',
    question: 'Are flow durations significantly different across different attack types?',
    objective: 'Compare duration distributions among the 9 malicious attack categories.',
    finding: 'Metasploit Brute Force exhibits median duration of 0.004210s with multiple packet exchanges, contrasting starkly with single-packet SYN floods at 0.000000s.',
    evidence: 'Kruskal-Wallis H = 41,208.5 (p < 1e-15)',
    route: '/dashboard/eda'
  },
  {
    num: 'Q09',
    group: 'KINETICS',
    groupName: 'Flow Kinetics & Temporal Distributions',
    question: 'What are the distribution characteristics of flow duration?',
    objective: 'Evaluate skewness, kurtosis, and departure from parametric normality.',
    finding: 'Flow duration exhibits extreme positive skewness (> 18.4) and severe kurtosis (> 340.2), invalidating parametric Gaussian assumptions.',
    evidence: 'Shapiro-Wilk W = 0.124 (p < 0.001) · Normality rejected',
    route: '/dashboard/eda'
  },
  {
    num: 'Q10',
    group: 'RELATIONSHIPS',
    groupName: 'Feature Correlations & Asymmetry',
    question: 'How does forward packet count relate to backward packet count across attack types?',
    objective: 'Assess bidirectional packet symmetry across benign telemetry and attack vectors.',
    finding: 'Normal ThingSpeak and MQTT maintain balanced bidirectional packet exchanges. Volumetric floods and port scans exhibit strict unidirectional packet flow.',
    evidence: 'Spearman rank correlation r_s = 0.281 across the full dataset',
    route: '/dashboard/statistics'
  },
  {
    num: 'Q11',
    group: 'RELATIONSHIPS',
    groupName: 'Feature Correlations & Asymmetry',
    question: 'Is there a significant difference in packet rates between normal and malicious flows?',
    objective: 'Compare packet transmission frequencies (packets per second) between categories.',
    finding: 'Single-packet zero-duration attacks produce undefined/infinite rates when unhandled; rate features require epsilon smoothing for analytical stability.',
    evidence: 'Transformed rate distributions show distinct multimodal peaks',
    route: '/dashboard/statistics'
  },
  {
    num: 'Q12',
    group: 'RELATIONSHIPS',
    groupName: 'Feature Correlations & Asymmetry',
    question: 'How do byte rates compare across different attack categories?',
    objective: 'Analyze forward and backward payload throughput differences.',
    finding: 'Volumetric attacks transmit minimal byte payloads per packet (40–60 bytes), relying on packet volume rather than bandwidth saturation.',
    evidence: 'Payload byte rate median for DOS is 0.0 bytes/sec',
    route: '/dashboard/statistics'
  },
  {
    num: 'Q13',
    group: 'HYPOTHESIS',
    groupName: 'Inferential Hypothesis Testing',
    question: 'Is there a statistically significant difference in flow duration between normal and malicious traffic?',
    objective: 'Formally test H₀: Normal and malicious traffic share identical duration distributions.',
    finding: 'Mann-Whitney U rank-sum test decisively rejects H₀ with p < 1e-15. Normal IoT communications remain active orders of magnitude longer than attack sweeps.',
    evidence: 'U statistic = 2.14 × 10⁸, p < 1.0 × 10⁻¹⁵ (Reject H₀)',
    route: '/dashboard/hypotheses'
  },
  {
    num: 'Q14',
    group: 'HYPOTHESIS',
    groupName: 'Inferential Hypothesis Testing',
    question: 'Is the choice of transport protocol independent of the traffic category?',
    objective: 'Formally test H₀: Transport layer protocol is independent of traffic category.',
    finding: 'Chi-Square test of independence decisively rejects H₀ (χ² = 34,819.4, p < 1e-15). Protocol selection is strongly coupled with attack methodology.',
    evidence: 'Cramer\'s V = 0.531 indicating strong practical association',
    route: '/dashboard/hypotheses'
  },
  {
    num: 'Q15',
    group: 'ML',
    groupName: 'Supervised Machine Learning',
    question: 'Can a machine learning model effectively classify network traffic into 12 categories?',
    objective: 'Train and validate a Random Forest classifier across all 12 discrete traffic classes.',
    finding: 'Random Forest (100 trees, stratified 80/20 split) achieves 93.14% Macro-F1 and 98.92% Weighted-F1, effectively identifying both dominant and minority attack classes.',
    evidence: 'Balanced accuracy: 89.4% · Top predictor: fwd_pkts_tot',
    route: '/dashboard/model'
  }
];

export default function ResearchPage({ theme = 'dark', toggleTheme }) {
  const [selectedGroup, setSelectedGroup] = useState('ALL');

  const groups = [
    { id: 'ALL', label: 'All 15 Questions' },
    { id: 'COMPOSITION', label: 'Class Composition' },
    { id: 'PROTOCOLS', label: 'Protocols & Ports' },
    { id: 'KINETICS', label: 'Flow Kinetics' },
    { id: 'RELATIONSHIPS', label: 'Feature Relationships' },
    { id: 'HYPOTHESIS', label: 'Hypothesis Testing' },
    { id: 'ML', label: 'Machine Learning' }
  ];

  const filteredQuestions = selectedGroup === 'ALL'
    ? ALL_15_QUESTIONS
    : ALL_15_QUESTIONS.filter(q => q.group === selectedGroup);

  return (
    <div className="public-page-wrapper">
      <PublicNavbar theme={theme} toggleTheme={toggleTheme} />

      {/* Header */}
      <section className="public-page-header">
        <div className="landing-container">
          <span className="section-eyebrow">EMPIRICAL INVESTIGATION</span>
          <h1 className="public-header-title">
            15 Core Research Questions & Evidence
          </h1>
          <p className="public-header-desc">
            A comprehensive, question-by-question statistical investigation of 123,117 IoT network flows from the RT-IOT2022 benchmark dataset.
          </p>
        </div>
      </section>

      {/* Questions Section */}
      <section className="landing-section" style={{ paddingTop: 0 }}>
        <div className="landing-container">
          {/* Category Filter Pills */}
          <div className="filter-pill-bar" style={{ marginBottom: 36 }}>
            {groups.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGroup(g.id)}
                className={`filter-pill ${selectedGroup === g.id ? 'active' : ''}`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Question Cards List */}
          <div className="questions-detail-list">
            {filteredQuestions.map((q) => (
              <div key={q.num} className="question-detail-card">
                <div className="question-detail-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="question-num-badge">{q.num}</span>
                    <span className="question-group-badge">{q.groupName}</span>
                  </div>
                  <Link to={q.route} className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '0.74rem' }}>
                    <span>Inspect in Dashboard</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                <h3 className="question-detail-title">{q.question}</h3>
                
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    RESEARCH OBJECTIVE:
                  </span>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                    {q.objective}
                  </p>
                </div>

                <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: 8, borderLeft: '3px solid var(--accent-cyan)', marginBottom: 12 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                    EMPIRICAL FINDING:
                  </span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: '4px 0 0 0', lineHeight: 1.5, fontWeight: 500 }}>
                    {q.finding}
                  </p>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                  <span><strong>Quantitative Evidence:</strong> {q.evidence}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{ textAlign: 'center', marginTop: 48, padding: 32, background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Verify These Findings in the Interactive Dashboard
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 18px auto' }}>
              Every statistic can be dynamically queried, filtered, and inspected across all 15 questions in the analytical module.
            </p>
            <Link to="/dashboard/statistics" className="btn btn-primary" style={{ padding: '9px 22px' }}>
              <span>Launch 15 Questions Module</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
