import React, { createContext, useContext, useState, useCallback } from 'react';
import { INITIAL_OBSERVATIONS, INITIAL_ALERTS, CAMERAS, TIGER_PROFILES, KPI_DATA } from '../data/demoData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [observations, setObservations] = useState(INITIAL_OBSERVATIONS);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [cameras] = useState(CAMERAS);
  const [tigerProfiles] = useState(TIGER_PROFILES);
  const [kpi, setKpi] = useState(KPI_DATA);

  const addObservation = useCallback((obs) => {
    const newObs = {
      id: `OBS-${String(observations.length + 1).padStart(3, '0')}`,
      ...obs,
      status: 'Confirmed',
      detectionType: 'Demo Detection',
    };
    setObservations(prev => [newObs, ...prev]);
    setKpi(prev => ({
      ...prev,
      imagesProcessed: prev.imagesProcessed + 1,
      tigersDetected: prev.tigersDetected + 1,
    }));
    return newObs;
  }, [observations.length]);

  const addAlert = useCallback((alert) => {
    const newAlert = {
      id: `ALT-${String(alerts.length + 1).padStart(3, '0')}`,
      ...alert,
      status: 'active',
    };
    setAlerts(prev => [newAlert, ...prev]);
    setKpi(prev => ({
      ...prev,
      activeAlerts: prev.activeAlerts + 1,
    }));
    return newAlert;
  }, [alerts.length]);

  const acknowledgeAlert = useCallback((alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
  }, []);

  const resolveAlert = useCallback((alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a));
    setKpi(prev => ({ ...prev, activeAlerts: Math.max(0, prev.activeAlerts - 1) }));
  }, []);

  const value = {
    observations, addObservation,
    alerts, addAlert, acknowledgeAlert, resolveAlert,
    cameras,
    tigerProfiles,
    kpi,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
