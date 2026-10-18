import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Download, Server, RefreshCw, Menu, Sparkles, Database } from 'lucide-react';

export default function Topbar({ activeTitle, onOpenMobile }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const data = await api.getHealth();
      setHealth(data);
    } catch (err) {
      setHealth({ status: 'offline' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          onClick={onOpenMobile}
          className="hero-btn"
          style={{ display: 'none' }} // Visible on mobile via CSS media query
          id="mobile-menu-trigger"
        >
          <Menu size={18} />
        </button>

        <div className="topbar-title-wrapper">
          <h2 className="topbar-page-title">
            {activeTitle}
          </h2>
          <span className="topbar-breadcrumb">
            IoT PULSE / Analytics / {activeTitle}
          </span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Backend status chip */}
        <div className="chip chip-emerald">
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: health?.status === 'healthy' ? '#34d399' : '#f43f5e',
            display: 'inline-block'
          }} />
          <span>
            {health?.status === 'healthy' 
              ? `FastAPI + DuckDB (${health.total_records?.toLocaleString()} flows)` 
              : 'Backend Offline'}
          </span>
        </div>

        {/* Export Data Button */}
        <a 
          href={api.getExportUrl('iot_pulse_clean_flows')}
          download="iot_pulse_clean_flows.csv"
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          title="Download Curated Flows CSV"
        >
          <Download size={14} />
          <span>Export Curated CSV</span>
        </a>
      </div>
    </header>
  );
}
