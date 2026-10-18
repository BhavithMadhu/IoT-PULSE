import React from 'react';
import { 
  ShieldAlert, LayoutDashboard, Target, BarChart2, 
  HelpCircle, CheckCircle2, Cpu, Database, BookOpen,
  Sparkles, X
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'Command & Analytics',
    items: [
      { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard, badge: '3D Hero' },
      { id: 'attacks', label: 'Attack Intelligence', icon: Target, badge: '12 Cls' },
      { id: 'eda', label: 'Exploratory Analysis', icon: BarChart2, badge: 'EDA' }
    ]
  },
  {
    title: 'Statistical Science',
    items: [
      { id: 'statistics', label: '15 Research Questions', icon: HelpCircle, badge: '15 Qs' },
      { id: 'hypotheses', label: 'Hypothesis Testing & FDR', icon: CheckCircle2, badge: 'α = 0.05' },
      { id: 'model', label: 'Machine Learning (RF)', icon: Cpu, badge: 'F1 93.4%' }
    ]
  },
  {
    title: 'Data & Methodology',
    items: [
      { id: 'explorer', label: 'DuckDB Explorer', icon: Database, badge: 'OLAP' },
      { id: 'methodology', label: 'Methodology & Rigor', icon: BookOpen, badge: 'Docs' }
    ]
  }
];

export default function Sidebar({ activePage, setActivePage, mobileOpen, onCloseMobile }) {
  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-badge">
          <ShieldAlert size={20} />
        </div>
        <div>
          <div className="brand-title">
            IoT PULSE
            <span className="brand-badge-pill">3D SOC</span>
          </div>
          <div className="brand-sub">Cybersecurity Intelligence</div>
        </div>
        {mobileOpen && (
          <button 
            onClick={onCloseMobile}
            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section, sIdx) => (
          <div key={`section-${sIdx}`} style={{ marginBottom: 10 }}>
            <div className="nav-section-title">{section.title}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage(item.id);
                    if (mobileOpen && onCloseMobile) onCloseMobile();
                  }}
                >
                  <Icon size={17} style={{ color: isActive ? '#34d399' : '#94a3b8' }} />
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Status Footer */}
      <div className="sidebar-footer">
        <div className="status-pill" style={{ marginBottom: 6 }}>
          <span className="status-dot" />
          <span style={{ fontWeight: 600, color: '#f1f5f9' }}>In-Memory DuckDB</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
          RT-IOT2022 · 123,117 Flows
        </div>
      </div>
    </aside>
  );
}
