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
import { YoloDetectionService } from '../services/YoloDetectionService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Mode: 'real' (Default) or 'demo'
  const [appMode, setAppMode] = useState('real');
  const [backendStatus, setBackendStatus] = useState({ connected: false, message: 'Checking backend...' });

  // ── REAL DATA STORE (Starts clean, no fake names) ─────────────
  const [realObservations, setRealObservations] = useState([]);
  const [realTigers, setRealTigers] = useState([]);
  const [realCameras, setRealCameras] = useState([]);
  const [realQuarantine, setRealQuarantine] = useState([]);
  const [realHumanReview, setRealHumanReview] = useState([]);
  const [realAlerts, setRealAlerts] = useState([]);
  const [realAuditLog, setRealAuditLog] = useState([
    {
      id: 'AUD-R001',
      timestamp: new Date().toLocaleTimeString(),
      actor: 'System Initialization',
      type: 'Mode Status',
      title: 'REAL DATA MODE Active',
      details: 'System initialized in REAL DATA MODE. No fake/demo tiger records active.'
    }
  ]);
  const [realKpi, setRealKpi] = useState({
    camerasOnline: 0,
    camerasTotal: 0,
    imagesProcessed: 0,
    blankImages: 0,
    usefulImages: 0,
    tigerDetections: 0,
    otherAnimalDetections: 0,
    individualTigers: 0,
    pendingHumanReviews: 0,
    activeDeviations: 0,
    activeAlerts: 0,
    storageSavedGb: 0.0,
    processingTimeMin: '0s'
  });

  // ── DEMO DATA STORE (Fallback for presentations) ────────────
  const [demoObservations, setDemoObservations] = useState(INITIAL_OBSERVATIONS);
  const [demoTigers, setDemoTigers] = useState(TIGER_PROFILES);
  const [demoCameras] = useState(CAMERAS);
  const [demoQuarantine, setDemoQuarantine] = useState(INITIAL_QUARANTINE);
  const [demoHumanReview, setDemoHumanReview] = useState(INITIAL_HUMAN_REVIEW);
  const [demoAlerts, setDemoAlerts] = useState(INITIAL_ALERTS);
  const [demoAuditLog, setDemoAuditLog] = useState(INITIAL_AUDIT_LOG);
  const [demoKpi] = useState(KPI_DATA);

  const [deviationEngine] = useState(new DeviationEngine({ coreThresholdKm: 15, bufferThresholdKm: 5 }));

  // Check Python YOLO Backend Status on load & periodically
  useEffect(() => {
    async function fetchStatus() {
      const status = await YoloDetectionService.checkBackendStatus();
      setBackendStatus(status);
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

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
  const humanReview = isRealMode ? realHumanReview : demoHumanReview;
  const alerts = isRealMode ? realAlerts : demoAlerts;
  const auditLog = isRealMode ? realAuditLog : demoAuditLog;
  const kpi = isRealMode ? realKpi : demoKpi;

  // Audit Logger helper
  const addAuditEntry = useCallback((actor, type, title, details) => {
    const entry = {
      id: `AUD-${String((isRealMode ? realAuditLog.length : demoAuditLog.length) + 1).padStart(3, '0')}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actor,
      type,
      title,
      details,
    };
    if (isRealMode) {
      setRealAuditLog(prev => [entry, ...prev]);
    } else {
      setDemoAuditLog(prev => [entry, ...prev]);
    }
  }, [isRealMode, realAuditLog.length, demoAuditLog.length]);

  // Observations
  const addObservation = useCallback((obs) => {
    const newObs = {
      id: `OBS-${String(observations.length + 1).padStart(3, '0')}`,
      ...obs,
      status: 'Confirmed',
      detectionType: 'Real YOLO Inference',
    };

    if (isRealMode) {
      setRealObservations(prev => [newObs, ...prev]);
      setRealKpi(prev => ({
        ...prev,
        imagesProcessed: prev.imagesProcessed + 1,
        tigerDetections: prev.tigerDetections + 1,
        usefulImages: prev.usefulImages + 1
      }));
    } else {
      setDemoObservations(prev => [newObs, ...prev]);
    }

    addAuditEntry('YOLO Inference', 'Real Observation Logged', `Observation ${newObs.id} created`, `File: ${newObs.fileName || 'Image'} at ${newObs.cameraId}`);
    return newObs;
  }, [isRealMode, observations.length, addAuditEntry]);

  // Quarantine Safe Actions
  const confirmBlankQuarantine = useCallback((id) => {
    if (isRealMode) {
      setRealQuarantine(prev => prev.map(q => q.id === id ? { ...q, status: 'confirmed_blank' } : q));
    } else {
      setDemoQuarantine(prev => prev.map(q => q.id === id ? { ...q, status: 'confirmed_blank' } : q));
    }
    addAuditEntry('Human Operator', 'Quarantine Confirmed', `Blank image ${id} confirmed`, 'Safe deletion approved');
  }, [isRealMode, addAuditEntry]);

  const restoreFromQuarantine = useCallback((id) => {
    if (isRealMode) {
      setRealQuarantine(prev => prev.map(q => q.id === id ? { ...q, status: 'restored' } : q));
    } else {
      setDemoQuarantine(prev => prev.map(q => q.id === id ? { ...q, status: 'restored' } : q));
    }
    addAuditEntry('Human Operator', 'Quarantine Restored', `Image ${id} restored`, 'Image restored to active stream');
  }, [isRealMode, addAuditEntry]);

  // Human Review Actions
  const confirmHumanReviewMatch = useCallback((reviewId, confirmedTigerId) => {
    if (isRealMode) {
      setRealHumanReview(prev => prev.map(r => r.id === reviewId ? { ...r, status: 'confirmed' } : r));
      setRealKpi(prev => ({ ...prev, pendingHumanReviews: Math.max(0, prev.pendingHumanReviews - 1) }));
    } else {
      setDemoHumanReview(prev => prev.map(r => r.id === reviewId ? { ...r, status: 'confirmed' } : r));
    }
    addAuditEntry('Human Operator', 'Identification Confirmed', `Review ${reviewId} resolved`, `Matched to individual ${confirmedTigerId}`);
  }, [isRealMode, addAuditEntry]);

  // Real Tiger Enrollment (Addition 10: Sequential TGR-001, TGR-002, TGR-003)
  const enrollNewTiger = useCallback((newTigerData) => {
    const list = isRealMode ? realTigers : demoTigers;
    const tigerId = `TGR-${String(list.length + 1).padStart(3, '0')}`;

    const newTiger = {
      id: tigerId,
      name: newTigerData.name || `Individual ${tigerId}`,
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

    if (isRealMode) {
      setRealTigers(prev => [...prev, newTiger]);
      setRealKpi(prev => ({ ...prev, individualTigers: prev.individualTigers + 1 }));
    } else {
      setDemoTigers(prev => [...prev, newTiger]);
    }

    addAuditEntry('Human Operator', 'Real Tiger Enrollment', `New Tiger Enrolled: ${tigerId}`, `Sequential Individual: ${newTiger.name}`);
    return newTiger;
  }, [isRealMode, realTigers, demoTigers, addAuditEntry]);

  // Alerts
  const addAlert = useCallback((alertData) => {
    const newAlert = {
      id: `ALT-${String(alerts.length + 1).padStart(3, '0')}`,
      ...alertData,
      status: 'active',
    };
    if (isRealMode) {
      setRealAlerts(prev => [newAlert, ...prev]);
      setRealKpi(prev => ({ ...prev, activeAlerts: prev.activeAlerts + 1 }));
    } else {
      setDemoAlerts(prev => [newAlert, ...prev]);
    }
    addAuditEntry('DeviationEngine', 'Alert Generated', `Alert ${newAlert.id}: ${newAlert.type}`, newAlert.description);
    return newAlert;
  }, [isRealMode, alerts.length, addAuditEntry]);

  const acknowledgeAlert = useCallback((alertId) => {
    if (isRealMode) {
      setRealAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
    } else {
      setDemoAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
    }
    addAuditEntry('Human Operator', 'Alert Acknowledged', `Alert ${alertId} acknowledged`, 'Operator inspecting evidence');
  }, [isRealMode, addAuditEntry]);

  const resolveAlert = useCallback((alertId) => {
    if (isRealMode) {
      setRealAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a));
      setRealKpi(prev => ({ ...prev, activeAlerts: Math.max(0, prev.activeAlerts - 1) }));
    } else {
      setDemoAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a));
    }
    addAuditEntry('Human Operator', 'Alert Resolved', `Alert ${alertId} resolved`, 'Mitigation action logged');
  }, [isRealMode, addAuditEntry]);

  // Batch Processing State Update helper
  const recordRealBatchStats = useCallback((batchStats) => {
    setRealKpi(prev => ({
      ...prev,
      imagesProcessed: prev.imagesProcessed + batchStats.processed,
      blankImages: prev.blankImages + batchStats.blank,
      usefulImages: prev.usefulImages + batchStats.useful,
      tigerDetections: prev.tigerDetections + batchStats.tiger,
      otherAnimalDetections: prev.otherAnimalDetections + batchStats.other,
      storageSavedGb: parseFloat((prev.storageSavedGb + batchStats.storageSavedGb).toFixed(2)),
      processingTimeMin: batchStats.timeStr
    }));

    if (batchStats.quarantinedItems && batchStats.quarantinedItems.length > 0) {
      setRealQuarantine(prev => [...batchStats.quarantinedItems, ...prev]);
    }
    if (batchStats.camerasFound && batchStats.camerasFound.length > 0) {
      setRealCameras(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const newCams = batchStats.camerasFound.filter(c => !existingIds.has(c.id));
        return [...prev, ...newCams];
      });
    }
  }, []);

  const value = {
    appMode, toggleAppMode, isRealMode,
    backendStatus,
    observations, addObservation,
    alerts, addAlert, acknowledgeAlert, resolveAlert,
    cameras,
    tigerProfiles, enrollNewTiger,
    quarantine, confirmBlankQuarantine, restoreFromQuarantine,
    humanReview, confirmHumanReviewMatch,
    auditLog, addAuditEntry,
    runs: HISTORICAL_RUNS,
    kpi, setRealKpi,
    deviationEngine,
    recordRealBatchStats
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
