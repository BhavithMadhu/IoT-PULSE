import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage';
import PlatformPage from './pages/public/PlatformPage';
import ResearchPage from './pages/public/ResearchPage';
import MethodologyPublicPage from './pages/public/MethodologyPublicPage';
import DashboardShell from './components/dashboard/DashboardShell';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('iot_pulse_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('iot_pulse_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <Routes>
      {/* Public Marketing & Research Website */}
      <Route path="/" element={<LandingPage theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/platform" element={<PlatformPage theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/research" element={<ResearchPage theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/methodology" element={<MethodologyPublicPage theme={theme} toggleTheme={toggleTheme} />} />

      {/* Analytics Application (Preserved Dashboard Shell) */}
      <Route path="/dashboard" element={<DashboardShell initialPage="overview" theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/dashboard/attacks" element={<DashboardShell initialPage="attacks" theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/dashboard/eda" element={<DashboardShell initialPage="eda" theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/dashboard/statistics" element={<DashboardShell initialPage="statistics" theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/dashboard/hypotheses" element={<DashboardShell initialPage="hypotheses" theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/dashboard/model" element={<DashboardShell initialPage="model" theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/dashboard/explorer" element={<DashboardShell initialPage="explorer" theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/dashboard/methodology" element={<DashboardShell initialPage="methodology" theme={theme} toggleTheme={toggleTheme} />} />

      {/* Catch-all route -> Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
