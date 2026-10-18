import React from 'react';
import { 
  ShieldAlert, LayoutDashboard, Target, BarChart2, 
  HelpCircle, CheckCircle2, Cpu, Database, BookOpen 
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
  { id: 'attacks', label: 'Attack Intelligence', icon: Target },
  { id: 'eda', label: 'Exploratory Analysis', icon: BarChart2 },
  { id: 'statistics', label: '15 Research Questions', icon: HelpCircle },
  { id: 'hypotheses', label: 'Hypothesis Testing & FDR', icon: CheckCircle2 },
  { id: 'model', label: 'Machine Learning (RF)', icon: Cpu },
  { id: 'explorer', label: 'Data Explorer', icon: Database },
  { id: 'methodology', label: 'Methodology & Rigor', icon: BookOpen }
];

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-badge">
          <ShieldAlert size={22} />
        </div>
        <div>
          <div className="brand-title">IoT PULSE</div>
          <div className="brand-sub">SOC Analytics</div>
        </div>
      </div>

      <ul className="nav-list">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <li key={item.id}>
              <div 
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActivePage(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <div><strong>Dataset:</strong> RT-IOT2022</div>
        <div>123,117 Flows · 84 Features</div>
        <div style={{ marginTop: '4px', color: '#06b6d4' }}>FODS Case Study</div>
      </div>
    </aside>
  );
}
