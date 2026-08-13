import React, { useState } from 'react';
import Layout from './components/Layout';
import LiveMap from './pages/LiveMap';
import AdminPanel from './pages/AdminPanel';
import VillagerPanel from './pages/VillagerPanel';

export default function App() {
  const [activePage, setActivePage] = useState('live-map');

  const renderActivePage = () => {
    switch (activePage) {
      case 'live-map':
        return <LiveMap />;
      case 'admin-panel':
        return <AdminPanel />;
      case 'villager-panel':
        return <VillagerPanel />;
      default:
        return <LiveMap />;
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {renderActivePage()}
    </Layout>
  );
}
