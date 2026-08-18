/**
 * PenchGuard AI — Centralized REST API Client
 * Connects React frontend with the local Python SQLite & YOLO Backend
 */

export const BASE_URL = 'http://localhost:8000/api';

export class ApiClient {
  static async get(endpoint) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[ApiClient] GET ${endpoint} failed:`, err.message);
      return null;
    }
  }

  static async post(endpoint, body, isFormData = false) {
    try {
      const headers = {};
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: isFormData ? body : JSON.stringify(body),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || errJson.error || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[ApiClient] POST ${endpoint} failed:`, err.message);
      return { success: false, error: err.message };
    }
  }
}
