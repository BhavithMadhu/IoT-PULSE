import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { 
  HelpCircle, ChevronDown, ChevronUp, CheckCircle, 
  AlertTriangle, BarChart2, Layers, Binary, Shield, Sparkles 
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
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <HelpCircle size={26} style={{ color: 'var(--accent-emerald)' }} />
            Empirical Statistical Investigation (15 Questions)
          </h1>
          <p className="page-subtitle">
            Formal research questions, null and alternative hypotheses, non-parametric test statistics, effect sizes, and evidence-based conclusions from the case study.
          </p>
        </div>
        <div className="chip chip-emerald">
          <Sparkles size={14} />
          <span>15/15 Case Study Parity · α = 0.05</span>
        </div>
      </div>

      {/* Filter topic toolbar */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {['ALL', 'Taxonomy & Composition', 'Volumetrics & Persistence', 'Correlations & Dynamics', 'Two-Group Protocol Tests', 'TCP Flag Signatures', 'Machine Learning'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterTopic(t)}
            className={`btn ${filterTopic === t ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Split layout: Question Navigation List & Detail Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '24px', alignItems: 'flex-start' }}>
        {/* Left Side: Question List Selector */}
        <div className="glass-panel" style={{ padding: '14px', marginBottom: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', paddingLeft: '8px' }}>
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
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: isSelected ? 'linear-gradient(90deg, rgba(52, 211, 153, 0.15) 0%, rgba(34, 211, 238, 0.08) 100%)' : 'transparent',
                    border: `1px solid ${isSelected ? 'rgba(52, 211, 153, 0.3)' : 'transparent'}`,
                    borderLeft: `3px solid ${isSelected ? 'var(--accent-emerald)' : 'transparent'}`,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: isSelected ? 'var(--accent-emerald)' : 'var(--text-primary)', fontSize: '0.85rem' }}>
                      {q.question_id}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {getTopic(q.question_id).split(' ')[0]}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: isSelected ? '#f1f5f9' : 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.3' }}>
                    {q.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Comprehensive 12-Section Question Card */}
        {currentQ ? (
          <div className="glass-panel" style={{ borderTop: '3px solid var(--accent-emerald)', marginBottom: 0 }}>
            {/* Header: ID, Title, Decision Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
                    {currentQ.question_id}
                  </span>
                  <span className="chip chip-cyan">{getTopic(currentQ.question_id)}</span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>
                  {currentQ.title}
                </h2>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={`chip ${currentQ.decision.includes('Reject') ? 'chip-emerald' : ''}`} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                  {currentQ.decision}
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                  Significance: α = {currentQ.alpha}
                </div>
              </div>
            </div>

            {/* 1. Purpose & Analytical Method */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.78rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>
                  1. Purpose & Relevance
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {currentQ.purpose_and_relevance}
                </p>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.78rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>
                  2. Analytical Method & Variables
                </strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  <strong>Method:</strong> {currentQ.analytical_method}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  <strong>Variables:</strong> {currentQ.relevant_variables.join(', ')}
                </div>
              </div>
            </div>

            {/* 2. Formal Hypotheses */}
            {currentQ.null_hypothesis && (
              <div style={{ padding: '16px', background: 'rgba(12, 17, 24, 0.7)', border: '1px solid var(--border-subtle)', borderRadius: '8px', marginBottom: '20px' }}>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.78rem', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>
                  3. Formal Statistical Hypotheses
                </strong>
                <div style={{ fontSize: '0.85rem', marginBottom: '6px', lineHeight: '1.5' }}>
                  <code style={{ color: 'var(--accent-rose)', fontWeight: 600, marginRight: '6px' }}>H₀ (Null):</code> 
                  <span style={{ color: 'var(--text-secondary)' }}>{currentQ.null_hypothesis}</span>
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                  <code style={{ color: 'var(--accent-emerald)', fontWeight: 600, marginRight: '6px' }}>H₁ (Alt):</code> 
                  <span style={{ color: 'var(--text-primary)' }}>{currentQ.alternative_hypothesis}</span>
                </div>
              </div>
            )}

            {/* 3. Statistical Test Results & Effect Sizes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sample Size (N)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {currentQ.sample_size.toLocaleString()}
                </div>
              </div>

              {currentQ.test_statistic_name && (
                <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{currentQ.test_statistic_name}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                    {currentQ.test_statistic_value?.toLocaleString()}
                  </div>
                </div>
              )}

              {currentQ.p_value_formatted && (
                <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>p-Value</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', marginTop: '4px' }}>
                    {currentQ.p_value_formatted}
                  </div>
                </div>
              )}

              {currentQ.effect_size_name && (
                <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{currentQ.effect_size_name}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', marginTop: '4px' }}>
                    {currentQ.effect_size_value}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Question-Specific Visualization */}
            <div style={{ padding: '18px', background: 'rgba(12, 17, 24, 0.7)', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                4. Empirical Visualization ({currentQ.chart_type})
              </div>

              {/* Render dynamic visual based on chart_type */}
              {Array.isArray(currentQ.chart_data) && currentQ.chart_data.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentQ.chart_data.slice(0, 8).map((d, idx) => {
                    const label = d.label || d.attack_type || d.proto || d.service || d.group || d.service_group || `Item ${idx+1}`;
                    const val = d.percentage || d.median || d.high_syn_percentage || d.median_duration || d.count || 0;
                    return (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{label}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{val}</span>
                        </div>
                        <div className="bar-track" style={{ height: '7px' }}>
                          <div className="bar-fill" style={{ width: `${Math.min(Math.max(val, 2), 100)}%`, backgroundColor: 'var(--accent-cyan)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentQ.chart_type === 'scatter' && (
                <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '6px', fontSize: '0.84rem', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                  Scatter sample plotted for {currentQ.chart_data.length} flow pairs. Monotonic rank correlation $\rho = {currentQ.test_statistic_value}$.
                </div>
              )}

              {currentQ.chart_type === 'box_summary' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TCP Median</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                      {currentQ.chart_data.tcp_median?.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UDP Median</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                      {currentQ.chart_data.udp_median?.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Practical Interpretation & Limitations */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'var(--accent-emerald-subtle)', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
                <strong style={{ color: 'var(--accent-emerald)', fontSize: '0.78rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>
                  5. Practical Interpretation
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {currentQ.practical_interpretation}
                </p>
              </div>

              <div style={{ padding: '16px', background: 'var(--accent-rose-subtle)', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
                <strong style={{ color: 'var(--accent-rose)', fontSize: '0.78rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>
                  6. Limitations & Evidence-Based Conclusion
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {currentQ.limitations} {currentQ.evidence_based_conclusion}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', padding: '20px' }}>Select a question to inspect details.</div>
        )}
      </div>
    </div>
  );
}
