import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { 
  Database, Filter, Download, ChevronLeft, ChevronRight, 
  ArrowUpDown, RefreshCw, BarChart2, Sparkles, Layers 
} from 'lucide-react';

export default function DataExplorerPage() {
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [columns, setColumns] = useState([]);
  const [summaryStats, setSummaryStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [attackFilter, setAttackFilter] = useState('');
  const [protoFilter, setProtoFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [sortBy, setSortBy] = useState('flow_duration');
  const [sortOrder, setSortOrder] = useState('asc');

  // Metadata dropdown options
  const [attackOptions, setAttackOptions] = useState([]);
  const [protoOptions, setProtoOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [attRes, proRes, srvRes] = await Promise.all([
          api.getAttackDistribution(),
          api.getProtocolDistribution(),
          api.getServiceDistribution(40)
        ]);
        setAttackOptions(attRes.distribution.map((d) => d.attack_type));
        setProtoOptions(proRes.distribution.map((d) => d.proto));
        setServiceOptions(srvRes.distribution.map((d) => d.service));
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    }
    loadOptions();
  }, []);

  const fetchFlows = async () => {
    try {
      setLoading(true);
      const res = await api.getFlows({
        attack_type: attackFilter || undefined,
        proto: protoFilter || undefined,
        service: serviceFilter || undefined,
        page,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setRecords(res.records);
      setTotalRecords(res.total_records);
      setFilteredCount(res.filtered_records);
      setTotalPages(res.total_pages);
      setColumns(res.columns);
      setSummaryStats(res.summary_stats || {});
    } catch (err) {
      console.error('Fetch flows error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlows();
  }, [page, pageSize, attackFilter, protoFilter, serviceFilter, sortBy, sortOrder]);

  const handleResetFilters = () => {
    setAttackFilter('');
    setProtoFilter('');
    setServiceFilter('');
    setSortBy('flow_duration');
    setSortOrder('asc');
    setPage(1);
  };

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
    setPage(1);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Database size={26} style={{ color: 'var(--accent-cyan)' }} />
            DuckDB In-Memory OLAP Data Explorer
          </h1>
          <p className="page-subtitle">
            Query, filter, sort, and paginate through all 123,117 network flow tuples powered by high-speed in-memory DuckDB zero-copy analytics.
          </p>
        </div>
        <div className="chip chip-emerald">
          <Sparkles size={14} />
          <span>Sub-15ms Virtual Table Queries</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '18px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            <Filter size={16} color="var(--accent-cyan)" />
            <span>Server-Side Analytical Filters</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleResetFilters} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '5px 12px' }}>
              Reset Filters
            </button>
            <a 
              href={api.getExportUrl('iot_pulse_clean_flows')}
              download="iot_pulse_clean_flows.csv"
              className="btn btn-primary" 
              style={{ fontSize: '0.78rem', padding: '5px 14px' }}
            >
              <Download size={14} />
              <span>Download CSV Extract</span>
            </a>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {/* Attack Filter */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attack Type</label>
            <select 
              value={attackFilter} 
              onChange={(e) => { setAttackFilter(e.target.value); setPage(1); }}
              className="input-control"
              style={{ width: '100%' }}
            >
              <option value="">All Attack Labels (12)</option>
              {attackOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Protocol Filter */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Protocol</label>
            <select 
              value={protoFilter} 
              onChange={(e) => { setProtoFilter(e.target.value); setPage(1); }}
              className="input-control"
              style={{ width: '100%' }}
            >
              <option value="">All Protocols</option>
              {protoOptions.map((opt) => (
                <option key={opt} value={opt}>{opt.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Service Filter */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Service</label>
            <select 
              value={serviceFilter} 
              onChange={(e) => { setServiceFilter(e.target.value); setPage(1); }}
              className="input-control"
              style={{ width: '100%' }}
            >
              <option value="">All Services</option>
              {serviceOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Page Size */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Records Per Page</label>
            <select 
              value={pageSize} 
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="input-control"
              style={{ width: '100%' }}
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
          </div>
        </div>
      </div>

      {/* Real-time Summary Cards for Filtered Set */}
      {Object.keys(summaryStats).length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <div style={{ padding: '14px 16px', background: 'rgba(17, 25, 35, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filtered Volume</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginTop: '2px' }}>
              {filteredCount.toLocaleString()} / {totalRecords.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {((filteredCount / totalRecords) * 100).toFixed(2)}% of entire dataset
            </div>
          </div>

          {Object.entries(summaryStats).map(([key, stat]) => (
            <div key={key} style={{ padding: '14px 16px', background: 'rgba(17, 25, 35, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{key} (Avg)</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px' }}>
                {stat.avg?.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Min: {stat.min} · Max: {stat.max}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Table Grid */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Showing page <strong style={{ color: 'var(--text-primary)' }}>{page}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{totalPages.toLocaleString()}</strong> ({filteredCount.toLocaleString()} records matched)
          </span>
          {loading && <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>Executing DuckDB Query...</span>}
        </div>

        <div className="table-container" style={{ minHeight: '320px' }}>
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th 
                    key={col}
                    onClick={() => handleSort(col)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{col}</span>
                      <ArrowUpDown size={12} color={sortBy === col ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map((col) => {
                      const val = row[col];
                      const isLabel = col === 'Attack_type';
                      return (
                        <td key={col} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                          {isLabel ? (
                            <span className={`chip ${val === 'Thing_Speak' || val === 'MQTT_Publish' || val === 'Wipro_bulb' ? 'chip-emerald' : ''}`} style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                              {val}
                            </span>
                          ) : typeof val === 'number' ? (
                            Number.isInteger(val) ? val.toLocaleString() : val.toFixed(4)
                          ) : (
                            String(val ?? '—')
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                    No network flow tuples match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Page {page} of {totalPages}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="btn btn-secondary"
              style={{ padding: '5px 12px', fontSize: '0.75rem' }}
            >
              First
            </button>
            <button
              onClick={() => setPage(Math.max(page - 1, 1))}
              disabled={page <= 1}
              className="btn btn-secondary"
              style={{ padding: '5px 12px', fontSize: '0.75rem' }}
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>
            <button
              onClick={() => setPage(Math.min(page + 1, totalPages))}
              disabled={page >= totalPages}
              className="btn btn-secondary"
              style={{ padding: '5px 12px', fontSize: '0.75rem' }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="btn btn-secondary"
              style={{ padding: '5px 12px', fontSize: '0.75rem' }}
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
