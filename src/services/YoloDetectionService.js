/**
 * PenchGuard AI — YOLO Detection Service
 * Connects frontend directly with the local Python YOLO & SQLite backend.
 */

import { BackendService } from './api/Services';

export class YoloDetectionService {
  static async checkBackendStatus() {
    return await BackendService.getStatus();
  }

  static async detectImage(file, conf = 0.25) {
    return await BackendService.detectImage(file, conf);
  }

  static async processBatch(files, sourceName) {
    return await BackendService.processBatch(files, sourceName);
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
      const match = file.name.match(/(CT[-_]?\d+|CAM[-_]?\d+)/i);
      if (match) {
        cameraId = match[1].toUpperCase().replace('_', '-');
      }
    }

    // 2. Extract timestamp
    let timestamp = 'Missing EXIF';
    if (file.lastModified) {
      timestamp = new Date(file.lastModified).toISOString().replace('T', ' ').substring(0, 19);
    }

    return {
      cameraId: cameraId === 'UNKNOWN' ? 'CT-001' : cameraId,
      timestamp,
      fileName: file.name,
      fileSizeMb: (file.size / (1024 * 1024)).toFixed(2),
      fileSizeBytes: file.size
    };
  }
}
