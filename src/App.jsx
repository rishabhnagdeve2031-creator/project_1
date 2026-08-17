import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Existing Public/Legacy Pages
import Home from './pages/Home';
import Layout from './components/Layout';
import TigerIntelligence from './pages/TigerIntelligence';
import LiveMap from './pages/LiveMap';
import Dashboard from './pages/Dashboard';
import BatchProcessing from './pages/BatchProcessing';
import CameraTraps from './pages/CameraTraps';
import AITriage from './pages/AITriage';
import Observations from './pages/Observations';
import Alerts from './pages/Alerts';
import AuditLog from './pages/AuditLog';
import Analytics from './pages/Analytics';
import SystemHealth from './pages/SystemHealth';

// New Forest Portal Components & Pages
import ForestLogin from './pages/ForestLogin';
import ForestLayout from './components/ForestLayout';
import ForestDashboard from './pages/ForestDashboard';
import ForestTigers from './pages/ForestTigers';
import ForestTigerDetail from './pages/ForestTigerDetail';
import ForestMap from './pages/ForestMap';
import ForestAlerts from './pages/ForestAlerts';
import ForestCameras from './pages/ForestCameras';
import ForestSightings from './pages/ForestSightings';

// Public layout wrapper to handle the state-based navigation from the old Sidebar/Navbar
function LegacyLayoutWrapper({ pageId, Component }) {
  const navigate = useNavigate();

  const handleNavigate = (targetPageId) => {
    if (targetPageId === 'home') {
      navigate('/');
    } else if (targetPageId === 'tiger-intelligence') {
      navigate('/tigers');
    } else if (targetPageId === 'movement-map') {
      navigate('/map');
    } else if (targetPageId === 'dashboard') {
      navigate('/forest-dashboard'); // Redirect to official portal dashboard
    } else {
      navigate(`/legacy/${targetPageId}`);
    }
  };

  return (
    <Layout activePage={pageId} setActivePage={handleNavigate}>
      <Component />
    </Layout>
  );
}

// Wrapper for Home to pass navigation routing
function HomeWrapper() {
  const navigate = useNavigate();
  const handleNavigate = (pageId) => {
    if (pageId === 'dashboard') {
      navigate('/forest-dashboard');
    } else if (pageId === 'movement-map') {
      navigate('/map');
    } else if (pageId === 'tiger-intelligence') {
      navigate('/tigers');
    }
  };

  return <Home onNavigate={handleNavigate} />;
}

export function AppContent() {
  return (
    <Routes>
      {/* ── Public Frontend Routes ── */}
      <Route path="/" element={<HomeWrapper />} />
      <Route path="/tigers" element={<LegacyLayoutWrapper pageId="tiger-intelligence" Component={TigerIntelligence} />} />
      <Route path="/map" element={<LegacyLayoutWrapper pageId="movement-map" Component={LiveMap} />} />

      {/* ── Legacy State-switching routes (to preserve full compatibility) ── */}
      <Route path="/legacy/dashboard" element={<LegacyLayoutWrapper pageId="dashboard" Component={Dashboard} />} />
      <Route path="/legacy/batch-processing" element={<LegacyLayoutWrapper pageId="batch-processing" Component={BatchProcessing} />} />
      <Route path="/legacy/camera-traps" element={<LegacyLayoutWrapper pageId="camera-traps" Component={CameraTraps} />} />
      <Route path="/legacy/ai-triage" element={<LegacyLayoutWrapper pageId="ai-triage" Component={AITriage} />} />
      <Route path="/legacy/observations" element={<LegacyLayoutWrapper pageId="observations" Component={Observations} />} />
      <Route path="/legacy/alerts" element={<LegacyLayoutWrapper pageId="alerts" Component={Alerts} />} />
      <Route path="/legacy/audit-log" element={<LegacyLayoutWrapper pageId="audit-log" Component={AuditLog} />} />
      <Route path="/legacy/analytics" element={<LegacyLayoutWrapper pageId="analytics" Component={Analytics} />} />
      <Route path="/legacy/system-health" element={<LegacyLayoutWrapper pageId="system-health" Component={SystemHealth} />} />

      {/* ── Forest Department Authentication ── */}
      <Route path="/forest-login" element={<ForestLogin />} />

      {/* ── Protected Forest Department Portal ── */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ForestLayout />
          </ProtectedRoute>
        }
      >
        <Route path="forest-dashboard" element={<ForestDashboard />} />
        <Route path="forest-tigers" element={<ForestTigers />} />
        <Route path="forest-tigers/:id" element={<ForestTigerDetail />} />
        <Route path="forest-map" element={<ForestMap />} />
        <Route path="forest-alerts" element={<ForestAlerts />} />
        <Route path="forest-cameras" element={<ForestCameras />} />
        <Route path="forest-sightings" element={<ForestSightings />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </AppProvider>
  );
}
