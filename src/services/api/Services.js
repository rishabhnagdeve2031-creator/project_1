/**
 * PenchGuard AI — Frontend API Services
 * Provides typed operations for Batches, Tigers, Observations, Alerts, Cameras, Quarantine, and Audit
 */

import { ApiClient, BASE_URL } from './ApiClient';

export const BackendService = {
  async getStatus() {
    const data = await ApiClient.get('/status');
    if (!data) {
      return {
        connected: false,
        status: 'offline',
        model_name: 'best.pt',
        model_type: 'Trained Tiger Detector',
        class_names: ['tiger'],
        device: 'UNKNOWN',
        database: { status: 'offline' },
        message: 'AI BACKEND OFFLINE — Start server.py to enable local YOLO & SQLite inference'
      };
    }
    return data;
  },

  async detectImage(file, conf = 0.25) {
    const formData = new FormData();
    formData.append('file', file);
    const data = await ApiClient.post(`/detect?conf=${conf}`, formData, true);
    if (!data || data.error) {
      return {
        success: false,
        connected: false,
        source: 'REAL_YOLO',
        message: data?.error || 'AI Backend connection failed. Ensure server.py is running.'
      };
    }
    return data;
  },

  async processBatch(files, sourceName = 'Camera Trap Upload', force = false) {
    const formData = new FormData();
    formData.append('source_name', sourceName);
    if (force) {
      formData.append('force', 'true');
    }
    for (let i = 0; i < files.length; i++) {
      formData.append(`file_${i}`, files[i]);
    }
    return await ApiClient.post('/batch', formData, true);
  },

  async getBatches() {
    const res = await ApiClient.get('/batches');
    return res?.batches || [];
  },

  async getObservations() {
    const res = await ApiClient.get('/observations');
    return res?.observations || [];
  },

  async createObservation(obsData) {
    return await ApiClient.post('/observations', obsData);
  },

  async getTigers() {
    const res = await ApiClient.get('/tigers');
    return res?.tigers || [];
  },

  async createTiger(tigerData) {
    return await ApiClient.post('/tigers', tigerData);
  },

  async matchTiger(tigerId, observationId) {
    return await ApiClient.post(`/tigers/${tigerId}/matches`, { observation_id: observationId });
  },

  async getCameras() {
    const res = await ApiClient.get('/cameras');
    return res?.cameras || [];
  },

  async getQuarantine() {
    const res = await ApiClient.get('/quarantine');
    return res?.quarantine || [];
  },

  async confirmBlank(quarantineId) {
    return await ApiClient.post(`/quarantine/${quarantineId}/confirm`, {});
  },

  async restoreQuarantine(quarantineId) {
    return await ApiClient.post(`/quarantine/${quarantineId}/restore`, {});
  },

  async getAlerts() {
    const res = await ApiClient.get('/alerts');
    return res?.alerts || [];
  },

  async acknowledgeAlert(alertId) {
    return await ApiClient.post(`/alerts/${alertId}/acknowledge`, {});
  },

  async resolveAlert(alertId) {
    return await ApiClient.post(`/alerts/${alertId}/resolve`, {});
  },

  async getAuditLogs() {
    const res = await ApiClient.get('/audit');
    return res?.audit_logs || [];
  },

  async logAuditEvent(actor, action, entityType, entityId, details) {
    return await ApiClient.post('/audit', { actor, action, entity_type: entityType, entity_id: entityId, details });
  },

  async getAnalytics() {
    return await ApiClient.get('/analytics');
  },

  getExportUrl(type) {
    return `${BASE_URL}/export/${type}`;
  },

  getMediaUrl(cropPath) {
    if (!cropPath) return null;
    if (cropPath.startsWith('http') || cropPath.startsWith('/api/media')) return cropPath;
    return `${BASE_URL}/media/${cropPath}`;
  }
};
