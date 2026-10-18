import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, LayoutDashboard, Target, BarChart2, 
  HelpCircle, CheckCircle2, Cpu, Database, BookOpen,
  Sparkles, X, ArrowLeft
} from 'lucide-react';

const PAGE_ROUTES = {
  overview: '/dashboard',
  attacks: '/dashboard/attacks',
  eda: '/dashboard/eda',
  statistics: '/dashboard/statistics',
  hypotheses: '/dashboard/hypotheses',
  model: '/dashboard/model',
  explorer: '/dashboard/explorer',
  methodology: '/dashboard/methodology'
};

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

export default function Sidebar({ activePage, setActivePage, mobileOpen, onCloseMobile, theme = 'dark', toggleTheme }) {
  const navigate = useNavigate();

  const handleNavClick = (id) => {
    setActivePage(id);
    if (PAGE_ROUTES[id]) {
      navigate(PAGE_ROUTES[id]);
    }
    if (mobileOpen && onCloseMobile) onCloseMobile();
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
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
        </Link>
        {mobileOpen && (
          <button 
            onClick={onCloseMobile}
            style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Return to Public Website Link */}
      <div style={{ padding: '0 14px 12px 14px' }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '7px 11px',
            background: theme === 'light' ? 'rgba(241, 245, 249, 0.95)' : 'rgba(23, 33, 44, 0.55)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-cyan)',
            fontSize: '0.74rem',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.18s ease'
          }}
          className="sidebar-return-link"
        >
          <ArrowLeft size={13} />
          <span>← Back to Public Website</span>
        </Link>
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
                  onClick={() => handleNavClick(item.id)}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="status-pill">
            <span className="status-dot" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>DuckDB Active</span>
          </div>
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
              padding: '3px 8px',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          RT-IOT2022 · 123,117 Flows
        </div>
      </div>
    </aside>
  );
}
