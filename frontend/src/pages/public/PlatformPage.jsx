import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import PublicFooter from '../../components/public/PublicFooter';
import { 
  Server, Database, Globe2, Cpu, BarChart2, ShieldAlert, 
  ArrowRight, CheckCircle2, Lock, Terminal, Activity, FileSpreadsheet
} from 'lucide-react';

export default function PlatformPage({ theme = 'dark', toggleTheme }) {
  const CAPABILITIES = [
    {
      icon: Globe2,
      color: '#22d3ee',
      title: 'Interactive 3D Spatial Network Topology',
      desc: 'Transforms tabular network flow captures into an intuitive three-dimensional cyber topology. Users can inspect spatial clusters, orbit around protocol hubs, and examine individual node kinetic telemetry.',
      route: '/dashboard',
      actionText: 'Launch 3D Hero'
    },
    {
      icon: ShieldAlert,
      color: '#f43f5e',
      title: 'Attack Intelligence & Taxonomy (12 Classes)',
      desc: 'Analyzes 9 distinct attack vectors alongside 3 normal device profiles. Understand volumetric SYN flooding, stateless NMAP port sweeps, and Layer 2 ARP poisoning behaviors with detailed metrics.',
      route: '/dashboard/attacks',
      actionText: 'Open Attack Taxonomy'
    },
    {
      icon: BarChart2,
      color: '#34d399',
      title: 'Exploratory Data Analysis & Empirical Kinetics',
      desc: 'Visualizes heavy-tailed and zero-inflated distributions across packet counts, flow durations, and byte volumes using log-scales, violin representations, and interquartile ranges.',
      route: '/dashboard/eda',
      actionText: 'Explore Distributions'
    },
    {
      icon: Database,
      color: '#f59e0b',
      title: 'DuckDB In-Memory OLAP Query Engine',
      desc: 'Embedded columnar SQL execution directly in Python. Run sub-second analytical queries over all 123,117 flow records with zero database configuration or external server dependencies.',
      route: '/dashboard/explorer',
      actionText: 'Open DuckDB Explorer'
    },
    {
      icon: Cpu,
      color: '#a855f7',
      title: 'Machine Learning: Random Forest Classifier',
      desc: 'A 100-estimator ensemble trained on 84 preprocessed kinetic features with 80/20 stratified validation. Delivers 93.14% Macro-F1 across all 12 classes with detailed confusion matrix evaluation.',
      route: '/dashboard/model',
      actionText: 'Inspect ML Model'
    },
    {
      icon: FileSpreadsheet,
      color: '#fb7185',
      title: 'Power BI Enterprise Model & CSV Integration',
      desc: 'Direct data pipeline exposing curated CSV tables and DAX analytical measures, enabling seamless integration with Microsoft Power BI Desktop for faculty demonstrations.',
      route: '/dashboard',
      actionText: 'Export Curated Data'
    }
  ];

  return (
    <div className="public-page-wrapper">
      <PublicNavbar theme={theme} toggleTheme={toggleTheme} />

      {/* Header */}
      <section className="public-page-header">
        <div className="landing-container">
          <span className="section-eyebrow">PLATFORM & ARCHITECTURE</span>
          <h1 className="public-header-title">
            Enterprise-Grade Analytics Architecture
          </h1>
          <p className="public-header-desc">
            A cohesive full-stack platform bridging raw packet records, in-memory OLAP SQL, inferential statistics, 3D WebGL visualizations, and Power BI dashboards.
          </p>
        </div>
      </section>

      {/* Architecture Overview Diagram */}
      <section className="landing-section" style={{ paddingTop: 0 }}>
        <div className="landing-container">
          <div className="glass-panel" style={{ padding: 32, marginBottom: 48 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              Full-Stack System Architecture
            </h3>
            
            <div className="arch-flow-grid">
              <div className="arch-node">
                <div className="arch-node-badge">DATA SOURCE</div>
                <h4 className="arch-node-title">RT-IOT2022 Dataset</h4>
                <p className="arch-node-desc">
                  123,117 labelled network flows from IoT sensors, smart home gateways, and network probes.
                </p>
                <div className="arch-pill">CSV · 84 Columns</div>
              </div>

              <div className="arch-arrow">→</div>

              <div className="arch-node">
                <div className="arch-node-badge" style={{ color: '#f59e0b', borderColor: '#f59e0b50' }}>QUERY LAYER</div>
                <h4 className="arch-node-title">DuckDB In-Memory</h4>
                <p className="arch-node-desc">
                  Zero-copy columnar analytics performing vectorized aggregate SQL queries with sub-second latency.
                </p>
                <div className="arch-pill">Embedded OLAP</div>
              </div>

              <div className="arch-arrow">→</div>

              <div className="arch-node">
                <div className="arch-node-badge" style={{ color: '#22d3ee', borderColor: '#22d3ee50' }}>REST API</div>
                <h4 className="arch-node-title">FastAPI Backend</h4>
                <p className="arch-node-desc">
                  Python 3 async services delivering validated statistics, hypothesis test results, and ML metrics.
                </p>
                <div className="arch-pill">Uvicorn · Port 8000</div>
              </div>

              <div className="arch-arrow">→</div>

              <div className="arch-node">
                <div className="arch-node-badge" style={{ color: '#34d399', borderColor: '#34d39950' }}>PRESENTATION</div>
                <h4 className="arch-node-title">React 18 + Three.js</h4>
                <p className="arch-node-desc">
                  Cyber SOC dashboard with dual 3D/2D views, interactive charts, and DuckDB SQL console.
                </p>
                <div className="arch-pill">Vite SPA · Port 5173</div>
              </div>
            </div>
          </div>

          {/* Capabilities Grid */}
          <div className="section-header" style={{ textAlign: 'left', marginBottom: 32 }}>
            <span className="section-eyebrow">CORE CAPABILITIES</span>
            <h2 className="section-title">Integrated Analytics Modules</h2>
          </div>

          <div className="capabilities-grid">
            {CAPABILITIES.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div key={idx} className="capability-card">
                  <div className="capability-icon" style={{ color: cap.color, background: `${cap.color}15`, borderColor: `${cap.color}35` }}>
                    <Icon size={24} />
                  </div>
                  <h3 className="capability-title">{cap.title}</h3>
                  <p className="capability-desc">{cap.desc}</p>
                  <Link to={cap.route} className="capability-link">
                    <span>{cap.actionText}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* CTA Banner */}
          <div style={{ textAlign: 'center', marginTop: 56, padding: '36px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
              Experience the Platform in Action
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto 20px auto' }}>
              Jump straight into the active cybersecurity operations centre to explore live analytical queries and 3D network models.
            </p>
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              <span>Open Executive Dashboard</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
