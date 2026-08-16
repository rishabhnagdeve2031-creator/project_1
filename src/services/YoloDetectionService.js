/**
 * PenchGuard AI — YOLO Detection Service
 * Communicates with local Python YOLO inference server or performs client-side image processing.
 * Strictly reports "REAL AI MODEL NOT CONNECTED" if no model is loaded.
 */

export class YoloDetectionService {
  static BACKEND_URL = 'http://localhost:8000/api';

  /**
   * Checks status of local Python AI Inference Backend Server
   */
  static async checkBackendStatus() {
    try {
      const response = await fetch(`${this.BACKEND_URL}/status`, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        return data; // { connected: bool, model_path: string, status: string, message: string }
      }
    } catch (e) {
      // Backend server not running
    }
    return {
      connected: false,
      status: 'offline',
      model_path: null,
      expected_paths: ['models/best.pt', 'models/last.pt', 'models/yolo26n.pt'],
      message: 'REAL AI MODEL NOT CONNECTED. Expected model path: models/best.pt'
    };
  }

  /**
   * Sends image file to Python backend for real YOLO model inference
   */
  static async detectImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.BACKEND_URL}/detect`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          connected: true,
          modelPath: data.model_path,
          detections: data.detections,
          processingTimeMs: data.processing_time_ms,
          width: data.width,
          height: data.height
        };
      }
    } catch (e) {
      // Backend call failed
    }

    return {
      success: false,
      connected: false,
      message: 'REAL AI MODEL NOT CONNECTED. Place best.pt in project models/ folder and run python server.py.'
    };
  }

  /**
   * Helper to parse Camera ID and timestamp from image file/path metadata
   */
  static parseImageMetadata(file, relativePath = '') {
    const fullPath = relativePath || file.name || '';
    const parts = fullPath.split('/');

    // 1. Extract Camera ID from folder path (e.g., CameraTrap/CT001/IMG001.jpg -> CT-001)
    let cameraId = 'UNKNOWN';
    if (parts.length > 1) {
      const folderName = parts[parts.length - 2].toUpperCase();
      if (folderName.startsWith('CT') || folderName.includes('CAM')) {
        cameraId = folderName.replace(/([A-Z]+)(\d+)/, '$1-$2');
      } else {
        cameraId = folderName;
      }
    } else {
      // Try from filename (e.g., CT014_IMG_001.jpg)
      const match = file.name.match(/(CT[-_]?\d+)/i);
      if (match) {
        cameraId = match[1].toUpperCase().replace('_', '-');
      }
    }

    // 2. Extract timestamp (Last modified or EXIF)
    let timestamp = 'TIMESTAMP WARNING (Missing EXIF)';
    if (file.lastModified) {
      timestamp = new Date(file.lastModified).toLocaleString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    }

    return {
      cameraId,
      timestamp,
      fileName: file.name,
      fileSizeMb: (file.size / (1024 * 1024)).toFixed(2)
    };
  }
}
