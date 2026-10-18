import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Activity, Download, Server, RefreshCw } from 'lucide-react';

export default function Topbar({ activeTitle }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
          {activeTitle}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Backend status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: health?.status === 'healthy' ? '#10b981' : '#f43f5e',
            boxShadow: health?.status === 'healthy' ? '0 0 8px #10b981' : '0 0 8px #f43f5e'
          }} />
          <span style={{ color: '#94a3b8' }}>
            {health?.status === 'healthy' 
              ? `FastAPI + DuckDB Active (${health.total_records?.toLocaleString()} flows)` 
              : 'Backend Offline'}
          </span>
        </div>

        {/* Quick CSV Export Download button */}
        <a 
          href={api.getExportUrl('iot_pulse_clean_flows')}
          download="iot_pulse_clean_flows.csv"
          className="btn btn-outline"
          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          title="Download Curated Flows CSV"
        >
          <Download size={14} />
          <span>Export Clean CSV</span>
        </a>
      </div>
    </header>
  );
}
