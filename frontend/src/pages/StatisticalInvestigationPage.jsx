import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { 
  HelpCircle, ChevronDown, ChevronUp, CheckCircle, 
  AlertTriangle, BarChart2, Layers, Binary, Shield 
} from 'lucide-react';

export default function StatisticalInvestigationPage() {
  const [questions, setQuestions] = useState([]);
  const [selectedQ, setSelectedQ] = useState('Q1');
  const [filterTopic, setFilterTopic] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.getQuestions();
        setQuestions(res.questions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentQ = questions.find((q) => q.question_id === selectedQ) || questions[0];

  const getTopic = (id) => {
    if (['Q1', 'Q2', 'Q3'].includes(id)) return 'Taxonomy & Composition';
    if (['Q4', 'Q5', 'Q13'].includes(id)) return 'Volumetrics & Persistence';
    if (['Q6', 'Q11', 'Q12'].includes(id)) return 'Correlations & Dynamics';
    if (['Q7', 'Q8', 'Q14'].includes(id)) return 'Two-Group Protocol Tests';
    if (['Q9', 'Q10'].includes(id)) return 'TCP Flag Signatures';
    return 'Machine Learning';
  };

  const filteredList = questions.filter((q) => {
    if (filterTopic === 'ALL') return true;
    return getTopic(q.question_id) === filterTopic;
  });

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Empirical Statistical Investigation (15 Questions)</h1>
        <p className="page-subtitle">
          Examine the exact research questions, null/alternative hypotheses, non-parametric test statistics, effect sizes, and evidence-based conclusions from the case study.
        </p>
      </div>

      {/* Filter topic toolbar */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {['ALL', 'Taxonomy & Composition', 'Volumetrics & Persistence', 'Correlations & Dynamics', 'Two-Group Protocol Tests', 'TCP Flag Signatures', 'Machine Learning'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterTopic(t)}
            className={`btn ${filterTopic === t ? 'btn-cyan' : 'btn-outline'}`}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Split layout: Question Navigation List & Detail Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'flex-start' }}>
        {/* Left Side: Question List Selector */}
        <div className="card" style={{ padding: '12px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '8px' }}>
            Questions ({filteredList.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filteredList.map((q) => {
              const isSelected = q.question_id === selectedQ;
              return (
                <div
                  key={q.question_id}
                  onClick={() => setSelectedQ(q.question_id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                    borderLeft: `3px solid ${isSelected ? 'var(--cyan)' : 'transparent'}`,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: isSelected ? '#06b6d4' : '#f8fafc', fontSize: '0.85rem' }}>
                      {q.question_id}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {getTopic(q.question_id).split(' ')[0]}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: isSelected ? '#e2e8f0' : '#94a3b8', marginTop: '2px', lineHeight: '1.3' }}>
                    {q.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Comprehensive 12-Section Question Card */}
        {currentQ ? (
          <div className="card" style={{ borderTop: '3px solid var(--cyan)' }}>
            {/* Header: ID, Title, Decision Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#06b6d4' }}>
                    {currentQ.question_id}
                  </span>
                  <span className="badge badge-cyan">{getTopic(currentQ.question_id)}</span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                  {currentQ.title}
                </h2>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${currentQ.decision.includes('Reject') ? 'badge-normal' : 'badge-amber'}`} style={{ fontSize: '0.8rem', padding: '6px 10px' }}>
                  {currentQ.decision}
                </span>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Significance: α = {currentQ.alpha}</div>
              </div>
            </div>

            {/* 1. Purpose & Analytical Method */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
              <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                <strong style={{ color: '#06b6d4', fontSize: '0.82rem', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  1. Purpose & Relevance
                </strong>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {currentQ.purpose_and_relevance}
                </p>
              </div>

              <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                <strong style={{ color: '#06b6d4', fontSize: '0.82rem', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  2. Analytical Method & Variables
                </strong>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  <strong>Method:</strong> {currentQ.analytical_method}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
                  <strong>Variables:</strong> {currentQ.relevant_variables.join(', ')}
                </div>
              </div>
            </div>

            {/* 2. Formal Hypotheses */}
            {currentQ.null_hypothesis && (
              <div style={{ padding: '14px', background: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: '6px', marginBottom: '18px' }}>
                <strong style={{ color: '#f8fafc', fontSize: '0.82rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  3. Formal Statistical Hypotheses
                </strong>
                <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                  <code style={{ color: '#f43f5e', fontWeight: 600 }}>H₀ (Null):</code> {currentQ.null_hypothesis}
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <code style={{ color: '#10b981', fontWeight: 600 }}>H₁ (Alt):</code> {currentQ.alternative_hypothesis}
                </div>
              </div>
            )}

            {/* 3. Statistical Test Results & Effect Sizes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '18px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Sample Size (N)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fff', marginTop: '2px' }}>
                  {currentQ.sample_size.toLocaleString()}
                </div>
              </div>

              {currentQ.test_statistic_name && (
                <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>{currentQ.test_statistic_name}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#06b6d4', marginTop: '2px' }}>
                    {currentQ.test_statistic_value?.toLocaleString()}
                  </div>
                </div>
              )}

              {currentQ.p_value_formatted && (
                <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>p-Value</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#10b981', marginTop: '2px' }}>
                    {currentQ.p_value_formatted}
                  </div>
                </div>
              )}

              {currentQ.effect_size_name && (
                <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>{currentQ.effect_size_name}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#f59e0b', marginTop: '2px' }}>
                    {currentQ.effect_size_value}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Question-Specific Visualization */}
            <div style={{ padding: '16px', background: 'var(--bg-sidebar)', borderRadius: '6px', border: '1px solid var(--border)', marginBottom: '18px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', marginBottom: '12px', textTransform: 'uppercase' }}>
                4. Empirical Visualization ({currentQ.chart_type})
              </div>

              {/* Render dynamic visual based on chart_type */}
              {Array.isArray(currentQ.chart_data) && currentQ.chart_data.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentQ.chart_data.slice(0, 8).map((d, idx) => {
                    const label = d.label || d.attack_type || d.proto || d.service || d.group || d.service_group || `Item ${idx+1}`;
                    const val = d.percentage || d.median || d.high_syn_percentage || d.median_duration || d.count || 0;
                    return (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', color: '#e2e8f0' }}>{label}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: '#06b6d4' }}>{val}</span>
                        </div>
                        <div className="bar-track" style={{ height: '6px' }}>
                          <div className="bar-fill" style={{ width: `${Math.min(Math.max(val, 2), 100)}%`, backgroundColor: '#06b6d4' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentQ.chart_type === 'scatter' && (
                <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '4px', fontSize: '0.82rem', color: '#94a3b8' }}>
                  Scatter sample plotted for {currentQ.chart_data.length} flow pairs. Monotonic association \(\rho = {currentQ.test_statistic_value}\).
                </div>
              )}

              {currentQ.chart_type === 'box_summary' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>TCP Median</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#06b6d4', fontFamily: 'var(--font-mono)' }}>
                      {currentQ.chart_data.tcp_median?.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>UDP Median</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                      {currentQ.chart_data.udp_median?.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Practical Interpretation & Limitations */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <strong style={{ color: '#10b981', fontSize: '0.82rem', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  5. Practical Interpretation
                </strong>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {currentQ.practical_interpretation}
                </p>
              </div>

              <div style={{ padding: '14px', background: 'rgba(244, 63, 94, 0.08)', borderRadius: '6px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                <strong style={{ color: '#f43f5e', fontSize: '0.82rem', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  6. Limitations & Evidence-Based Conclusion
                </strong>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {currentQ.limitations} {currentQ.evidence_based_conclusion}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>Select a question to inspect details.</div>
        )}
      </div>
    </div>
  );
}
