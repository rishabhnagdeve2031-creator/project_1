import React, { createContext, useContext, useState, useCallback } from 'react';
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

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [observations, setObservations] = useState(INITIAL_OBSERVATIONS);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [cameras, setCameras] = useState(CAMERAS);
  const [tigerProfiles, setTigerProfiles] = useState(TIGER_PROFILES);
  const [quarantine, setQuarantine] = useState(INITIAL_QUARANTINE);
  const [humanReview, setHumanReview] = useState(INITIAL_HUMAN_REVIEW);
  const [auditLog, setAuditLog] = useState(INITIAL_AUDIT_LOG);
  const [runs] = useState(HISTORICAL_RUNS);
  const [kpi, setKpi] = useState(KPI_DATA);

  const [deviationEngine] = useState(new DeviationEngine({ coreThresholdKm: 15, bufferThresholdKm: 5 }));

  // Audit Logger helper
  const addAuditEntry = useCallback((actor, type, title, details) => {
    const entry = {
      id: `AUD-${String(auditLog.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actor,
      type,
      title,
      details,
    };
    setAuditLog(prev => [entry, ...prev]);
  }, [auditLog.length]);

  // Observations
  const addObservation = useCallback((obs) => {
    const newObs = {
      id: `OBS-${String(observations.length + 1).padStart(3, '0')}`,
      ...obs,
      status: 'Confirmed',
      detectionType: 'Automated AI Detection',
    };
    setObservations(prev => [newObs, ...prev]);
    setKpi(prev => ({
      ...prev,
      imagesProcessed: prev.imagesProcessed + 1,
      tigerDetections: prev.tigerDetections + 1,
      usefulImages: prev.usefulImages + 1
    }));
    addAuditEntry('AI System', 'Observation Logged', `Observation ${newObs.id} created`, `Tiger ${newObs.tigerId} at ${newObs.cameraId}`);
    return newObs;
  }, [observations.length, addAuditEntry]);

  // Quarantine Safe Actions
  const confirmBlankQuarantine = useCallback((id) => {
    setQuarantine(prev => prev.map(q => q.id === id ? { ...q, status: 'confirmed_blank' } : q));
    addAuditEntry('Human Operator', 'Quarantine Confirmed', `Blank image ${id} confirmed`, 'Safe deletion approved for storage optimization');
  }, [addAuditEntry]);

  const restoreFromQuarantine = useCallback((id) => {
    setQuarantine(prev => prev.map(q => q.id === id ? { ...q, status: 'restored' } : q));
    addAuditEntry('Human Operator', 'Quarantine Restored', `Image ${id} restored`, 'Image restored to active triage pipeline');
  }, [addAuditEntry]);

  // Human Review Actions
  const confirmHumanReviewMatch = useCallback((reviewId, confirmedTigerId) => {
    setHumanReview(prev => prev.map(r => r.id === reviewId ? { ...r, status: 'confirmed' } : r));
    setKpi(prev => ({ ...prev, pendingHumanReviews: Math.max(0, prev.pendingHumanReviews - 1) }));
    addAuditEntry('Human Operator', 'Identification Confirmed', `Review ${reviewId} resolved`, `Matched to individual ${confirmedTigerId}`);
  }, [addAuditEntry]);

  const enrollNewTiger = useCallback((newTigerData) => {
    const tigerId = `TGR-${String(tigerProfiles.length + 1).padStart(2, '0')}`;
    const newTiger = {
      id: tigerId,
      name: newTigerData.name || `Tiger ${tigerId}`,
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
      identificationStatus: 'Enrolled Individual',
      timeline: [{ time: 'Just now', camera: newTigerData.cameraId || 'CT-001', zone: newTigerData.zone || 'Core Zone' }]
    };

    setTigerProfiles(prev => [...prev, newTiger]);
    setKpi(prev => ({ ...prev, individualTigers: prev.individualTigers + 1 }));
    addAuditEntry('Human Operator', 'New Tiger Enrollment', `New Tiger Enrolled: ${tigerId}`, `Name: ${newTiger.name}`);
    return newTiger;
  }, [tigerProfiles.length, addAuditEntry]);

  // Alerts
  const addAlert = useCallback((alertData) => {
    const newAlert = {
      id: `ALT-${String(alerts.length + 1).padStart(3, '0')}`,
      ...alertData,
      status: 'active',
    };
    setAlerts(prev => [newAlert, ...prev]);
    setKpi(prev => ({ ...prev, activeAlerts: prev.activeAlerts + 1 }));
    addAuditEntry('DeviationEngine', 'Alert Generated', `Alert ${newAlert.id}: ${newAlert.type}`, newAlert.description);
    return newAlert;
  }, [alerts.length, addAuditEntry]);

  const acknowledgeAlert = useCallback((alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
    addAuditEntry('Human Operator', 'Alert Acknowledged', `Alert ${alertId} acknowledged`, 'Operator inspecting evidence');
  }, [addAuditEntry]);

  const resolveAlert = useCallback((alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a));
    setKpi(prev => ({ ...prev, activeAlerts: Math.max(0, prev.activeAlerts - 1) }));
    addAuditEntry('Human Operator', 'Alert Resolved', `Alert ${alertId} resolved`, 'Mitigation action logged');
  }, [addAuditEntry]);

  // 12-Step Full Demo Workflow Trigger
  const runFullDemoWorkflow = useCallback(() => {
    // 1. Log demo trigger
    addAuditEntry('Demo Runner', 'Full Demo Executed', 'Complete Pipeline Demonstration Triggered', 'Executing 12-stage camera trap triage pipeline');

    // 2. Add an observation
    const demoObs = addObservation({
      tigerId: 'TGR-07',
      cameraId: 'CT-014',
      timestamp: new Date().toLocaleString(),
      zone: 'Boundary Zone',
      confidence: 95,
      lat: 21.6920,
      lng: 79.2600
    });

    // 3. Run DeviationEngine
    const kali = tigerProfiles.find(t => t.id === 'TGR-07') || tigerProfiles[0];
    const deviations = deviationEngine.analyzeTigerMovement(kali, demoObs, runs, cameras);

    // 4. Generate Alert if deviations found
    deviations.forEach(dev => {
      addAlert({
        type: dev.type,
        severity: dev.severity,
        tigerId: 'TGR-07',
        cameraId: 'CT-014',
        timestamp: new Date().toLocaleString(),
        location: 'Boundary Zone B - Sensitive Corridor',
        description: dev.whatChanged,
        whatChanged: dev.whatChanged,
        supportingEvidence: dev.evidence,
        confidence: dev.confidence,
        surveyEffort: dev.surveyEffort,
        lat: 21.6920,
        lng: 79.2600
      });
    });

    alert('✅ Full Demo Pipeline Completed Successfully!\n- Processed sample images\n- Filtered blanks\n- Detected Tiger TGR-07\n- Executed DeviationEngine (Survey Effort Aware)\n- Generated Explainable Alert\n- Appended trace to Audit Log');
  }, [addAuditEntry, addObservation, addAlert, tigerProfiles, deviationEngine, runs, cameras]);

  const value = {
    observations, addObservation,
    alerts, addAlert, acknowledgeAlert, resolveAlert,
    cameras,
    tigerProfiles, enrollNewTiger,
    quarantine, confirmBlankQuarantine, restoreFromQuarantine,
    humanReview, confirmHumanReviewMatch,
    auditLog, addAuditEntry,
    runs,
    kpi, setKpi,
    deviationEngine,
    runFullDemoWorkflow
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
