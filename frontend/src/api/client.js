const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {})
      }
    });

    if (!res.ok) {
      let errorDetail = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) {
          errorDetail = typeof errorJson.detail === 'string' 
            ? errorJson.detail 
            : JSON.stringify(errorJson.detail);
        }
      } catch (e) {
        // ignore parse error
      }
      throw new Error(errorDetail);
    }

    return await res.json();
  } catch (err) {
    console.error(`API Error on ${url}:`, err);
    throw err;
  }
}

export const api = {
  getHealth: () => fetchJson('/health'),
  getOverview: () => fetchJson('/overview'),
  getAttackDistribution: () => fetchJson('/attacks/distribution'),
  getProtocolDistribution: () => fetchJson('/protocols'),
  getServiceDistribution: (topN = 25) => fetchJson(`/services?top_n=${topN}`),
  getFeatureSummary: () => fetchJson('/features/summary'),
  getQuestions: () => fetchJson('/statistics/questions'),
  getQuestionById: (qid) => fetchJson(`/statistics/questions/${qid}`),
  getCorrelations: () => fetchJson('/correlations'),
  getHypotheses: () => fetchJson('/hypotheses'),
  getModelMetrics: () => fetchJson('/model/metrics'),
  getConfusionMatrix: () => fetchJson('/model/confusion-matrix'),
  getFeatureImportance: () => fetchJson('/model/feature-importance'),
  getExportTables: () => fetchJson('/export/tables'),
  getExportUrl: (tableName) => `${API_BASE}/export/${tableName}`,
  getFlows: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    return fetchJson(`/flows?${searchParams.toString()}`);
  }
};
