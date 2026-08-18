import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  INITIAL_OBSERVATIONS,
  INITIAL_ALERTS,
  CAMERAS,
  TIGER_PROFILES,
  KPI_DATA,
  INITIAL_QUARANTINE,
  INITIAL_HUMAN_REVIEW,
  INITIAL_AUDIT_LOG,
  HISTORICAL_RUNS
} from '../data/demoData';
import { DeviationEngine } from '../services/DeviationEngine';
import { BackendService } from '../services/api/Services';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Mode: 'real' (Default) or 'demo'
  const [appMode, setAppMode] = useState('real');
  const [backendStatus, setBackendStatus] = useState({
    connected: false,
    status: 'checking',
    model_name: 'best.pt',
    device: 'UNKNOWN',
    message: 'Connecting to local YOLO backend...'
  });

  // ── REAL DATA STORE (Loaded from SQLite backend) ─────────────
  const [realObservations, setRealObservations] = useState([]);
  const [realTigers, setRealTigers] = useState([]);
  const [realCameras, setRealCameras] = useState([]);
  const [realQuarantine, setRealQuarantine] = useState([]);
  const [realAlerts, setRealAlerts] = useState([]);
  const [realAuditLog, setRealAuditLog] = useState([]);
  const [realAnalytics, setRealAnalytics] = useState(null);

  // ── DEMO DATA STORE (Fallback for offline presentation) ───────
  const [demoObservations, setDemoObservations] = useState(INITIAL_OBSERVATIONS);
  const [demoTigers, setDemoTigers] = useState(TIGER_PROFILES);
  const [demoCameras] = useState(CAMERAS);
  const [demoQuarantine, setDemoQuarantine] = useState(INITIAL_QUARANTINE);
  const [demoHumanReview, setDemoHumanReview] = useState(INITIAL_HUMAN_REVIEW);
  const [demoAlerts, setDemoAlerts] = useState(INITIAL_ALERTS);
  const [demoAuditLog, setDemoAuditLog] = useState(INITIAL_AUDIT_LOG);
  const [demoKpi] = useState(KPI_DATA);

  const [deviationEngine] = useState(new DeviationEngine({ coreThresholdKm: 15, bufferThresholdKm: 5 }));

  // Refresh Real Database Data from SQLite
  const refreshRealData = useCallback(async () => {
    try {
      const [status, obs, tgrs, cams, quar, alts, logs, ana] = await Promise.all([
        BackendService.getStatus(),
        BackendService.getObservations(),
        BackendService.getTigers(),
        BackendService.getCameras(),
        BackendService.getQuarantine(),
        BackendService.getAlerts(),
        BackendService.getAuditLogs(),
        BackendService.getAnalytics()
      ]);

      setBackendStatus(status);
      setRealObservations(obs || []);
      setRealTigers(tgrs || []);
      setRealCameras(cams || []);
      setRealQuarantine(quar || []);
      setRealAlerts(alts || []);
      setRealAuditLog(logs || []);
      setRealAnalytics(ana || null);
    } catch (e) {
      console.warn('[AppContext] Failed to refresh real data:', e);
    }
  }, []);

  // Initial & periodic sync
  useEffect(() => {
    refreshRealData();
    const interval = setInterval(refreshRealData, 8000);
    return () => clearInterval(interval);
  }, [refreshRealData]);

  // Mode Switcher
  const toggleAppMode = useCallback(() => {
    setAppMode(prev => (prev === 'real' ? 'demo' : 'real'));
  }, []);

  // Active Store Selectors
  const isRealMode = appMode === 'real';
  const observations = isRealMode ? realObservations : demoObservations;
  const tigerProfiles = isRealMode ? realTigers : demoTigers;
  const cameras = isRealMode ? realCameras : demoCameras;
  const quarantine = isRealMode ? realQuarantine : demoQuarantine;
  const alerts = isRealMode ? realAlerts : demoAlerts;
  const auditLog = isRealMode ? realAuditLog : demoAuditLog;

  // Real KPI calculation dynamically from SQLite state
  const kpi = isRealMode
    ? {
        camerasOnline: realCameras.filter(c => c.status === 'online').length,
        camerasTotal: realCameras.length,
        imagesProcessed: realAnalytics?.total_images || realObservations.length + realQuarantine.length,
        blankImages: realAnalytics?.blank_images || realQuarantine.length,
        usefulImages: realAnalytics?.useful_images || realObservations.length,
        tigerDetections: realAnalytics?.tiger_detections || realObservations.length,
        otherAnimalDetections: 0,
        individualTigers: realTigers.length,
        pendingHumanReviews: realObservations.filter(o => o.tiger_id === 'UNIDENTIFIED' || o.tigerId === 'UNIDENTIFIED').length,
        activeAlerts: realAlerts.filter(a => a.status === 'active').length,
        storageSavedGb: realAnalytics?.storage_saved_gb || 0.0,
        storageSavedMb: realAnalytics?.storage_saved_mb || 0.0,
        processingTimeMin: '0s'
      }
    : demoKpi;

  // Audit Logger helper
  const addAuditEntry = useCallback(async (actor, type, title, details) => {
    if (isRealMode) {
      await BackendService.logAuditEvent(actor, type, 'UserAction', title, details);
      refreshRealData();
    } else {
      const entry = {
        id: `AUD-${String(demoAuditLog.length + 1).padStart(3, '0')}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        actor,
        type,
        title,
        details,
      };
      setDemoAuditLog(prev => [entry, ...prev]);
    }
  }, [isRealMode, demoAuditLog.length, refreshRealData]);

  // Observations CRUD
  const addObservation = useCallback(async (obs) => {
    if (isRealMode) {
      const res = await BackendService.createObservation(obs);
      await refreshRealData();
      return res;
    } else {
      const newObs = {
        id: `OBS-${String(demoObservations.length + 1).padStart(3, '0')}`,
        ...obs,
        status: 'Confirmed',
        detectionType: 'Demo Simulation',
      };
      setDemoObservations(prev => [newObs, ...prev]);
      return newObs;
    }
  }, [isRealMode, demoObservations.length, refreshRealData]);

  // Quarantine Safe Actions
  const confirmBlankQuarantine = useCallback(async (id) => {
    if (isRealMode) {
      await BackendService.confirmBlank(id);
      await refreshRealData();
    } else {
      setDemoQuarantine(prev => prev.map(q => q.id === id ? { ...q, status: 'confirmed_blank' } : q));
    }
  }, [isRealMode, refreshRealData]);

  const restoreFromQuarantine = useCallback(async (id) => {
    if (isRealMode) {
      await BackendService.restoreQuarantine(id);
      await refreshRealData();
    } else {
      setDemoQuarantine(prev => prev.map(q => q.id === id ? { ...q, status: 'restored' } : q));
    }
  }, [isRealMode, refreshRealData]);

  // Human Review / Stripe Match
  const confirmHumanReviewMatch = useCallback(async (observationId, confirmedTigerId) => {
    if (isRealMode) {
      await BackendService.matchTiger(confirmedTigerId, observationId);
      await refreshRealData();
    } else {
      setDemoHumanReview(prev => prev.map(r => r.id === observationId ? { ...r, status: 'confirmed' } : r));
    }
  }, [isRealMode, refreshRealData]);

  // Real Tiger Enrollment (Sequential TGR-001, TGR-002...)
  const enrollNewTiger = useCallback(async (newTigerData) => {
    if (isRealMode) {
      const res = await BackendService.createTiger(newTigerData);
      await refreshRealData();
      return res;
    } else {
      const list = demoTigers;
      const tigerId = `TGR-${String(list.length + 1).padStart(3, '0')}`;
      const newTiger = {
        id: tigerId,
        name: newTigerData.name || `Individual ${tigerId}`,
        display_name: newTigerData.name || `Individual ${tigerId}`,
        status: 'active',
        gender: newTigerData.gender || 'Unknown',
        age: newTigerData.age || '~3 years',
        firstSeen: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        lastSeen: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        lastCamera: newTigerData.cameraId || 'CT-001',
        zone: newTigerData.zone || 'Core Zone',
        observationCount: 1,
        movementStatus: 'Newly Enrolled Individual',
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        typicalIntervalDays: 7,
        centroid: { lat: newTigerData.lat || 21.73, lng: newTigerData.lng || 79.31 },
        previousCentroid: null,
        estimatedAreaKm2: 5.0,
        identificationStatus: 'Confirmed Match',
        timeline: [{ time: 'Just now', camera: newTigerData.cameraId || 'CT-001', zone: newTigerData.zone || 'Core Zone' }]
      };
      setDemoTigers(prev => [...prev, newTiger]);
      return newTiger;
    }
  }, [isRealMode, demoTigers, refreshRealData]);

  // Alerts
  const acknowledgeAlert = useCallback(async (alertId) => {
    if (isRealMode) {
      await BackendService.acknowledgeAlert(alertId);
      await refreshRealData();
    } else {
      setDemoAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
    }
  }, [isRealMode, refreshRealData]);

  const resolveAlert = useCallback(async (alertId) => {
    if (isRealMode) {
      await BackendService.resolveAlert(alertId);
      await refreshRealData();
    } else {
      setDemoAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a));
    }
  }, [isRealMode, refreshRealData]);

  const value = {
    appMode,
    toggleAppMode,
    isRealMode,
    backendStatus,
    observations,
    addObservation,
    alerts,
    acknowledgeAlert,
    resolveAlert,
    cameras,
    tigerProfiles,
    enrollNewTiger,
    quarantine,
    confirmBlankQuarantine,
    restoreFromQuarantine,
    humanReview: isRealMode ? realObservations.filter(o => o.tiger_id === 'UNIDENTIFIED' || o.tigerId === 'UNIDENTIFIED') : demoHumanReview,
    confirmHumanReviewMatch,
    auditLog,
    addAuditEntry,
    runs: HISTORICAL_RUNS,
    kpi,
    analytics: realAnalytics,
    deviationEngine,
    refreshRealData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
