import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function AITriage() {
  const { addObservation, addAlert, cameras, tigerProfiles } = useAppContext();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState('CT-014');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);

  // Sample tiger demo canvas preview generator
  const runDemoDetection = () => {
    setIsProcessing(true);
    setDetectionResult(null);

    setTimeout(() => {
      setIsProcessing(false);
      const matchedCamera = cameras.find(c => c.id === selectedCamera) || cameras[0];
      const matchedTiger = tigerProfiles.find(t => t.id === 'TGR-07') || tigerProfiles[0];

      const result = {
        detected: true,
        species: 'tiger',
        confidence: 94.2,
        bbox: [120, 80, 480, 360], // x1, y1, x2, y2 relative
        tigerId: matchedTiger.id,
        tigerName: matchedTiger.name,
        cameraId: matchedCamera.id,
        cameraLocation: matchedCamera.location,
        zone: matchedCamera.zone,
        timestamp: new Date().toLocaleString('en-US', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true
        }),
        lat: matchedCamera.lat,
        lng: matchedCamera.lng,
      };

      setDetectionResult(result);
    }, 1200);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectionResult(null);
    }
  };

  const handleSaveObservation = () => {
    if (!detectionResult) return;

    addObservation({
      tigerId: detectionResult.tigerId,
      cameraId: detectionResult.cameraId,
      timestamp: detectionResult.timestamp,
      zone: detectionResult.zone,
      confidence: Math.round(detectionResult.confidence),
      lat: detectionResult.lat,
      lng: detectionResult.lng,
    });

    if (detectionResult.zone === 'Boundary Zone') {
      addAlert({
        type: 'Boundary Risk',
        severity: 'HIGH',
        tigerId: detectionResult.tigerId,
        cameraId: detectionResult.cameraId,
        timestamp: detectionResult.timestamp,
        location: detectionResult.cameraLocation,
        description: `Tiger ${detectionResult.tigerId} (${detectionResult.tigerName}) detected in ${detectionResult.cameraLocation}. High proximity risk to boundary zone.`,
        lat: detectionResult.lat,
        lng: detectionResult.lng,
      });
    }

    alert(`Observation saved successfully! ${detectionResult.zone === 'Boundary Zone' ? '⚠️ Boundary Risk Alert generated.' : ''}`);
  };

  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">🔬 AI Camera Trap Triage</h2>
          <p className="page-subtitle">Automated Image Detection & Individual Tiger Identification Workflow</p>
        </div>
        <div className="demo-tag">
          <span className="proto-badge">DEMO MODE ACTIVE</span>
        </div>
      </div>

      <div className="triage-layout">
        {/* Left Upload & Controls Panel */}
        <div className="triage-panel">
          <h3>1. Camera & Image Input</h3>

          <div className="form-group">
            <label>Select Camera Trap Station</label>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="select-input"
            >
              {cameras.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.location} ({c.zone})
                </option>
              ))}
            </select>
          </div>

          <div className="upload-dropzone">
            <input type="file" accept="image/*" id="file-upload" onChange={handleImageChange} hidden />
            <label htmlFor="file-upload" className="dropzone-label">
              <span className="upload-icon">📷</span>
              <span className="upload-text">
                {selectedFile ? selectedFile.name : 'Click or drop camera trap image here'}
              </span>
              <span className="upload-hint">Supports JPG, PNG (Max 10MB)</span>
            </label>
          </div>

          <div className="divider-or"><span>OR RUN DEMO</span></div>

          <button
            className="demo-run-btn"
            onClick={runDemoDetection}
            disabled={isProcessing}
          >
            {isProcessing ? '⏳ Running AI Model Pipeline...' : '▶ Run Demo Detection (TGR-07 Sample)'}
          </button>

          <div className="api-note-box">
            <span className="api-title">🔌 API Integration Endpoint</span>
            <code>POST /api/detect</code>
            <p>Ready for real YOLOv8/YOLO26 backend model integration.</p>
          </div>
        </div>

        {/* Right Detection Results Panel */}
        <div className="triage-panel main-preview">
          <h3>2. AI Inference & Identification Output</h3>

          {!detectionResult && !isProcessing && (
            <div className="empty-preview">
              <span className="empty-icon">🔍</span>
              <p>Upload an image or click "Run Demo Detection" to execute AI triage workflow.</p>
            </div>
          )}

          {isProcessing && (
            <div className="processing-state">
              <div className="spinner"></div>
              <p>Analyzing pixels with YOLO Object Detector...</p>
              <p className="sub-step">Running Feature Matching for Individual Identification...</p>
            </div>
          )}

          {detectionResult && (
            <div className="result-container">
              {/* Image Preview with Bounding Box Overlay */}
              <div className="image-stage">
                <div className="sample-tiger-canvas">
                  <div className="demo-image-bg">
                    <span className="tiger-visual-emoji">🐅</span>
                  </div>
                  {/* Bounding Box */}
                  <div className="bbox-overlay" style={{
                    top: '15%', left: '20%', width: '60%', height: '70%'
                  }}>
                    <div className="bbox-label">
                      tiger {detectionResult.confidence}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Triage Output Data */}
              <div className="result-details-grid">
                <div className="res-card success">
                  <span className="res-label">Animal Detection</span>
                  <span className="res-val green">Tiger Detected</span>
                  <span className="res-sub">Confidence: {detectionResult.confidence}%</span>
                </div>

                <div className="res-card highlight">
                  <span className="res-label">Individual Identification</span>
                  <span className="res-val orange">{detectionResult.tigerId} ({detectionResult.tigerName})</span>
                  <span className="res-sub">Prototype / Demo Identification</span>
                </div>

                <div className="res-card">
                  <span className="res-label">Camera Trap</span>
                  <span className="res-val">{detectionResult.cameraId}</span>
                  <span className="res-sub">{detectionResult.cameraLocation}</span>
                </div>

                <div className="res-card">
                  <span className="res-label">Zone Status</span>
                  <span className={`res-val ${detectionResult.zone === 'Boundary Zone' ? 'red' : 'normal'}`}>
                    {detectionResult.zone}
                  </span>
                  <span className="res-sub">{detectionResult.timestamp}</span>
                </div>
              </div>

              <div className="action-row">
                <button className="save-obs-btn" onClick={handleSaveObservation}>
                  💾 Commit Observation to Intelligence Stream
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .pg-page { padding: 20px 24px; overflow-y: auto; height: 100%; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .page-title { font-size: 20px; font-weight: 700; color: var(--text-bright); margin: 0 0 4px 0; }
        .page-subtitle { font-size: 12px; color: var(--text-dim); margin: 0; }

        .proto-badge {
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #fbbf24;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
        }

        .triage-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 20px;
        }

        .triage-panel {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 20px;
        }

        .triage-panel h3 {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-bright);
          margin-top: 0;
          margin-bottom: 16px;
        }

        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 11px; color: var(--text-dim); margin-bottom: 6px; }

        .select-input {
          width: 100%;
          padding: 8px 12px;
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          color: var(--text-main);
          font-size: 12px;
        }

        .upload-dropzone {
          border: 2px dashed rgba(255,255,255,0.15);
          border-radius: 8px;
          padding: 24px 12px;
          text-align: center;
          background: rgba(255,255,255,0.01);
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .upload-dropzone:hover { border-color: var(--forest-green); }

        .dropzone-label { display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; }
        .upload-icon { font-size: 28px; }
        .upload-text { font-size: 12px; color: var(--text-main); font-weight: 500; }
        .upload-hint { font-size: 10px; color: var(--text-dim); }

        .divider-or {
          display: flex; align-items: center; text-align: center; margin: 16px 0;
          font-size: 10px; color: var(--text-dim); font-weight: 700;
        }
        .divider-or::before, .divider-or::after {
          content: ''; flex: 1; border-bottom: 1px solid var(--border-subtle);
        }
        .divider-or span { padding: 0 10px; }

        .demo-run-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
          transition: transform 0.1s, opacity 0.2s;
        }
        .demo-run-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .demo-run-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .api-note-box {
          margin-top: 20px;
          padding: 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 6px;
        }
        .api-title { display: block; font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; }
        .api-note-box code { font-size: 11px; color: #34d399; font-family: var(--font-mono); }
        .api-note-box p { font-size: 10px; color: var(--text-dim); margin: 4px 0 0 0; }

        /* Preview Stage */
        .empty-preview {
          height: 350px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-dim);
          text-align: center;
        }
        .empty-icon { font-size: 40px; margin-bottom: 12px; }

        .processing-state {
          height: 350px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .spinner {
          width: 36px; height: 36px;
          border: 3px solid rgba(16,185,129,0.1);
          border-top-color: #10b981;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .sub-step { font-size: 11px; color: var(--text-dim); margin-top: 4px; }

        .result-container { display: flex; flex-direction: column; gap: 16px; }

        .image-stage {
          background: #000;
          border-radius: 8px;
          height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          border: 1px solid var(--border-subtle);
        }

        .sample-tiger-canvas {
          position: relative;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1c271d, #0d160f);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tiger-visual-emoji { font-size: 100px; opacity: 0.85; filter: drop-shadow(0 0 20px rgba(0,0,0,0.8)); }

        .bbox-overlay {
          position: absolute;
          border: 2px solid #10b981;
          background: rgba(16, 185, 129, 0.1);
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
          border-radius: 4px;
        }
        .bbox-label {
          position: absolute;
          top: -22px;
          left: -2px;
          background: #10b981;
          color: #000;
          font-weight: 700;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 3px 3px 0 0;
          font-family: var(--font-mono);
        }

        .result-details-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .res-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .res-label { font-size: 10px; color: var(--text-dim); }
        .res-val { font-size: 13px; font-weight: 700; color: var(--text-bright); }
        .res-val.green { color: #10b981; }
        .res-val.orange { color: #f97316; }
        .res-val.red { color: #ef4444; }
        .res-sub { font-size: 10px; color: var(--text-muted); }

        .save-obs-btn {
          width: 100%;
          padding: 12px;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399;
          font-weight: 600;
          font-size: 13px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .save-obs-btn:hover { background: rgba(16, 185, 129, 0.25); }

        @media (max-width: 900px) {
          .triage-layout { grid-template-columns: 1fr; }
          .result-details-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
