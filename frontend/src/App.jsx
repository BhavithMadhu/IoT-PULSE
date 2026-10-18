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
  overview: 'Executive Cybersecurity Overview',
  attacks: 'Attack Intelligence & Spatial Threat Taxonomy',
  eda: 'Exploratory Data Analysis & Empirical Distributions',
  statistics: 'Empirical Statistical Investigation (15 Questions)',
  hypotheses: 'Inferential Hypothesis Testing & FDR Control',
  model: 'Machine Learning: Random Forest Classifier (Q15)',
  explorer: 'DuckDB In-Memory OLAP Data Explorer',
  methodology: 'Academic Methodology, Rigour & Evidence'
};

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="main-content">
        <Topbar 
          activeTitle={PAGE_TITLES[activePage] || 'IoT PULSE Analytics'} 
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
