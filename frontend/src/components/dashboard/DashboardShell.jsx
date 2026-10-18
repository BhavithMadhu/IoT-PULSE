import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import OverviewPage from '../../pages/OverviewPage';
import AttackIntelligencePage from '../../pages/AttackIntelligencePage';
import EdaPage from '../../pages/EdaPage';
import StatisticalInvestigationPage from '../../pages/StatisticalInvestigationPage';
import HypothesisTestingPage from '../../pages/HypothesisTestingPage';
import MachineLearningPage from '../../pages/MachineLearningPage';
import DataExplorerPage from '../../pages/DataExplorerPage';
import MethodologyPage from '../../pages/MethodologyPage';
import ErrorBoundary from '../ErrorBoundary';

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

export default function DashboardShell({ initialPage = 'overview', theme = 'dark', toggleTheme }) {
  const [activePage, setActivePage] = useState(initialPage);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setActivePage(initialPage);
  }, [initialPage]);

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage theme={theme} />;
      case 'attacks':
        return <AttackIntelligencePage theme={theme} />;
      case 'eda':
        return <EdaPage theme={theme} />;
      case 'statistics':
        return <StatisticalInvestigationPage theme={theme} />;
      case 'hypotheses':
        return <HypothesisTestingPage theme={theme} />;
      case 'model':
        return <MachineLearningPage theme={theme} />;
      case 'explorer':
        return <DataExplorerPage theme={theme} />;
      case 'methodology':
        return <MethodologyPage theme={theme} />;
      default:
        return <OverviewPage theme={theme} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <div className="main-content">
        <Topbar 
          activeTitle={PAGE_TITLES[activePage] || 'IoT PULSE Analytics'} 
          onOpenMobile={() => setMobileOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main>
          <ErrorBoundary title="IoT PULSE Analytics Module">
            {renderPage()}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
