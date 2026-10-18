import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Github, ExternalLink, Database, Cpu, BookOpen, ArrowUpRight } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer-inner">
        {/* Brand Column */}
        <div className="footer-brand-col">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div className="brand-badge" style={{ width: 32, height: 32, borderRadius: 8 }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                IoT PULSE
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Network Traffic Intelligence
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 320, margin: '0 0 16px 0' }}>
            Empirical statistical analysis and machine learning classification of 123,117 real IoT network flows from the RT-IOT2022 benchmark dataset.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a
              href="https://github.com/BhavithMadhu/IoT-PULSE"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              <Github size={14} />
              <span>GitHub Repository</span>
              <ExternalLink size={12} style={{ opacity: 0.6 }} />
            </a>
          </div>
        </div>

        {/* Column 1: Platform Capabilities */}
        <div className="footer-col">
          <div className="footer-col-title">Platform</div>
          <ul className="footer-links">
            <li><Link to="/dashboard">Executive Dashboard</Link></li>
            <li><Link to="/dashboard/attacks">Attack Intelligence (12 Classes)</Link></li>
            <li><Link to="/dashboard/eda">Exploratory Distributions (EDA)</Link></li>
            <li><Link to="/dashboard/explorer">DuckDB In-Memory OLAP</Link></li>
            <li><Link to="/platform">Full Architecture Tour</Link></li>
          </ul>
        </div>

        {/* Column 2: Statistical Research */}
        <div className="footer-col">
          <div className="footer-col-title">Statistical Science</div>
          <ul className="footer-links">
            <li><Link to="/research">15 Research Questions</Link></li>
            <li><Link to="/dashboard/hypotheses">Hypothesis Testing & FDR</Link></li>
            <li><Link to="/dashboard/model">Random Forest Classifier (93.1%)</Link></li>
            <li><Link to="/dashboard/statistics">Spearman Correlations</Link></li>
            <li><Link to="/methodology">Methodology & Assumptions</Link></li>
          </ul>
        </div>

        {/* Column 3: Academic Foundations */}
        <div className="footer-col">
          <div className="footer-col-title">Research & Data</div>
          <ul className="footer-links">
            <li>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Dataset: RT-IOT2022
              </span>
            </li>
            <li>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Total Records: 123,117 Flows
              </span>
            </li>
            <li>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Engine: DuckDB + FastAPI
              </span>
            </li>
            <li>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Significance: α = 0.05 (FDR)
              </span>
            </li>
            <li>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                BI Integration: Power BI
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="public-footer-bottom">
        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          © 2026 IoT PULSE · Foundations of Data Science Case Study · Academic Research Platform
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: '0.74rem' }}>
          <span style={{ color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }} />
            Offline Dataset Integrity · Zero Live Spoofing
          </span>
          <a
            href="https://github.com/BhavithMadhu/IoT-PULSE"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
          >
            Open Source GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
