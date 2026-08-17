import React, { useState } from 'react';
import Layout from './components/Layout';
import { AppProvider } from './context/AppContext';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import BatchProcessing from './pages/BatchProcessing';
import CameraTraps from './pages/CameraTraps';
import AITriage from './pages/AITriage';
import TigerIntelligence from './pages/TigerIntelligence';
import LiveMap from './pages/LiveMap';
import Alerts from './pages/Alerts';
import Observations from './pages/Observations';
import AuditLog from './pages/AuditLog';
import Analytics from './pages/Analytics';
import SystemHealth from './pages/SystemHealth';

export default function App() {
  const [activePage, setActivePage] = useState('home');

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'batch-processing':
        return <BatchProcessing />;
      case 'camera-traps':
        return <CameraTraps />;
      case 'ai-triage':
        return <AITriage />;
      case 'tiger-intelligence':
        return <TigerIntelligence />;
      case 'movement-map':
        return <LiveMap />;
      case 'alerts':
        return <Alerts />;
      case 'observations':
        return <Observations />;
      case 'audit-log':
        return <AuditLog />;
      case 'analytics':
        return <Analytics />;
      case 'system-health':
        return <SystemHealth />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      {activePage === 'home' ? (
        <Home onNavigate={setActivePage} />
      ) : (
        <Layout activePage={activePage} setActivePage={setActivePage}>
          {renderActivePage()}
        </Layout>
      )}
    </AppProvider>
  );
}
