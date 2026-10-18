import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import OverviewPage from './pages/OverviewPage';
import AttackIntelligencePage from './pages/AttackIntelligencePage';
import EdaPage from './pages/EdaPage';
import StatisticalInvestigationPage from './pages/StatisticalInvestigationPage';
import HypothesisTestingPage from './pages/HypothesisTestingPage';
import MachineLearningPage from './pages/MachineLearningPage';
import DataExplorerPage from './pages/DataExplorerPage';
import MethodologyPage from './pages/MethodologyPage';

const PAGE_TITLES = {
  overview: 'Overview Dashboard',
  attacks: 'Attack Intelligence & Taxonomy',
  eda: 'Exploratory Data Analysis & Correlations',
  statistics: 'Empirical Statistical Investigation (15 Questions)',
  hypotheses: 'Hypothesis Testing & FDR Correction',
  model: 'Machine Learning: Random Forest (Q15)',
  explorer: 'DuckDB In-Memory Data Explorer',
  methodology: 'Methodology, Academic Rigor & Conclusions'
};

export default function App() {
  const [activePage, setActivePage] = useState('overview');

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage />;
      case 'attacks':
        return <AttackIntelligencePage />;
      case 'eda':
        return <EdaPage />;
      case 'statistics':
        return <StatisticalInvestigationPage />;
      case 'hypotheses':
        return <HypothesisTestingPage />;
      case 'model':
        return <MachineLearningPage />;
      case 'explorer':
        return <DataExplorerPage />;
      case 'methodology':
        return <MethodologyPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="main-content">
        <Topbar activeTitle={PAGE_TITLES[activePage] || 'IoT PULSE Analytics'} />
        <main>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
