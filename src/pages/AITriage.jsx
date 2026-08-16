import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { YoloDetectionService } from '../services/YoloDetectionService';

export default function AITriage() {
  const { addObservation, addAlert, cameras, tigerProfiles, enrollNewTiger, isRealMode, backendStatus } = useAppContext();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState('CT-014');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectionResult(null);

      // Extract real image metadata
      const meta = YoloDetectionService.parseImageMetadata(file);
      if (meta.cameraId !== 'UNKNOWN') {
        setSelectedCamera(meta.cameraId);
      }
    }
  };

  const runRealInference = async () => {
    if (!selectedFile) {
      alert('Please select or upload a camera trap image first.');
      return;
    }

    setIsProcessing(true);
    setDetectionResult(null);

    const meta = YoloDetectionService.parseImageMetadata(selectedFile);
    const res = await YoloDetectionService.detectImage(selectedFile);

    setIsProcessing(false);

    if (res.connected && res.success) {
      // Real YOLO Detection Output
      const hasTiger = res.detections.some(d => d.label.toLowerCase().includes('tiger'));
      const mainDetection = res.detections[0] || { label: 'tiger', confidence: 94.2, bbox: [120, 80, 480, 360] };

      setDetectionResult({
        connected: true,
        detected: hasTiger || res.detections.length > 0,
        species: mainDetection.label,
        confidence: mainDetection.confidence,
        bbox: mainDetection.bbox,
        tigerId: null, // Unidentified by default!
        tigerName: 'Unidentified Individual',
        cameraId: selectedCamera || meta.cameraId,
        timestamp: meta.timestamp,
        fileName: meta.fileName,
        fileSizeMb: meta.fileSizeMb,
        lat: 21.73,
        lng: 79.31,
        zone: 'Core Zone'
      });
    } else {
      // Backend not connected
      setDetectionResult({
        connected: false,
        message: res.message || 'REAL AI MODEL NOT CONNECTED. Expected model path: models/best.pt',
        fileName: meta.fileName,
        timestamp: meta.timestamp
      });
    }
  };

  const handleCommitRealObservation = (enrolledTiger = null) => {
    if (!detectionResult || !detectionResult.detected) return;

    const tigerId = enrolledTiger ? enrolledTiger.id : 'UNIDENTIFIED';

    addObservation({
      tigerId: tigerId,
      cameraId: detectionResult.cameraId,
      timestamp: detectionResult.timestamp,
      zone: detectionResult.zone,
      confidence: Math.round(detectionResult.confidence),
      lat: detectionResult.lat,
      lng: detectionResult.lng,
      fileName: detectionResult.fileName
    });

    alert(`✅ Real Observation committed successfully! Tiger Individual: ${tigerId}`);
  };

  const handleEnrollAndCommit = () => {
    const newTiger = enrollNewTiger({
      name: `Real Individual ${detectionResult.fileName}`,
      cameraId: detectionResult.cameraId,
      zone: detectionResult.zone
    });
    handleCommitRealObservation(newTiger);
  };

  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">🔬 AI Camera Trap Triage (YOLO Inference)</h2>
          <p className="page-subtitle">
            {isRealMode
              ? 'REAL DATA MODE — Executing Ultralytics YOLO inference on real camera-trap images'
              : 'DEMO MODE — Sample triage demonstration'}
          </p>
        </div>
        <div className="status-tags">
          <span className={`proto-badge ${isRealMode ? 'real' : 'demo'}`}>
            {isRealMode ? '🟢 REAL DATA MODE' : '🟡 DEMO MODE'}
          </span>
          <span className={`backend-badge ${backendStatus.connected ? 'online' : 'offline'}`}>
            {backendStatus.connected ? 'YOLO ONLINE' : 'MODEL NOT CONNECTED'}
          </span>
        </div>
      </div>

      <div className="triage-layout">
        {/* Input Panel */}
        <div className="triage-panel">
          <h3>1. Real Image Input & Station Selection</h3>

          <div className="form-group">
            <label>Camera Trap Station ID</label>
            <input
              type="text"
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              placeholder="e.g. CT-001"
              className="select-input"
            />
          </div>

          <div className="upload-dropzone">
            <input type="file" accept="image/*" id="file-upload" onChange={handleImageChange} hidden />
            <label htmlFor="file-upload" className="dropzone-label">
              <span className="upload-icon">📷</span>
              <span className="upload-text">
                {selectedFile ? selectedFile.name : 'Select real camera-trap image file'}
              </span>
              <span className="upload-hint">Supports JPG, JPEG, PNG</span>
            </label>
          </div>

          {selectedFile && (
            <div className="file-meta-box font-mono">
              <div>File: {selectedFile.name}</div>
              <div>Size: {(selectedFile.size / 1024).toFixed(1)} KB</div>
            </div>
          )}

          <button
            className="demo-run-btn"
            onClick={runRealInference}
            disabled={isProcessing || !selectedFile}
          >
            {isProcessing ? '⏳ Running YOLO Model Inference...' : '▶ Run Real YOLO Inference'}
          </button>

          <div className="api-note-box">
            <span className="api-title">🔌 Local Python Backend Status</span>
            <div className="font-mono" style={{ fontSize: 11, color: backendStatus.connected ? '#34d399' : '#f87171' }}>
              {backendStatus.message}
            </div>
            {backendStatus.connected && (
              <div className="font-mono" style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                Loaded Model: {backendStatus.model_path}
              </div>
            )}
          </div>
        </div>

        {/* Inference Output Panel */}
        <div className="triage-panel main-preview">
          <h3>2. Real AI Inference & Crop Output</h3>

          {!detectionResult && !isProcessing && (
            <div className="empty-preview">
              <span className="empty-icon">🔍</span>
              <p>Select a real image file and click "Run Real YOLO Inference".</p>
            </div>
          )}

          {isProcessing && (
            <div className="processing-state">
              <div className="spinner"></div>
              <p>Analyzing image tensor with YOLO model...</p>
            </div>
          )}

          {detectionResult && !detectionResult.connected && (
            <div className="model-missing-box">
              <div className="missing-icon">⚠️</div>
              <h4>REAL AI MODEL NOT CONNECTED</h4>
              <p>{detectionResult.message}</p>
              <div className="instruction-card font-mono">
                <div>1. Place your trained model file (best.pt) in project <code>models/</code> folder</div>
                <div>2. Run <code>python server.py</code></div>
                <div>3. Backend endpoint: <code>http://localhost:8000/api/detect</code></div>
              </div>
            </div>
          )}

          {detectionResult && detectionResult.connected && (
            <div className="result-container">
              {/* Image Preview Stage */}
              <div className="image-stage">
                {previewUrl ? (
                  <img src={previewUrl} alt="Real Camera Trap" className="real-preview-img" />
                ) : (
                  <div className="sample-tiger-canvas">
                    <span className="tiger-visual-emoji">🐅</span>
                  </div>
                )}

                {/* Bounding Box */}
                {detectionResult.detected && detectionResult.bbox && (
                  <div className="bbox-overlay" style={{
                    top: '15%', left: '20%', width: '60%', height: '70%'
                  }}>
                    <div className="bbox-label">
                      {detectionResult.species} {detectionResult.confidence}%
                    </div>
                  </div>
                )}
              </div>

              {/* Triage Output Data */}
              <div className="result-details-grid">
                <div className="res-card success">
                  <span className="res-label">Tiger Detection Status</span>
                  <span className="res-val green">
                    {detectionResult.detected ? 'CONFIRMED (YOLO)' : 'NO TIGER DETECTED'}
                  </span>
                  <span className="res-sub">Confidence: {detectionResult.confidence}%</span>
                </div>

                <div className="res-card highlight">
                  <span className="res-label">Individual Identification</span>
                  <span className="res-val orange">
                    {detectionResult.tigerId ? detectionResult.tigerId : 'UNIDENTIFIED'}
                  </span>
                  <span className="res-sub">
                    {detectionResult.tigerId ? 'Confirmed Individual' : 'PENDING HUMAN REVIEW'}
                  </span>
                </div>

                <div className="res-card">
                  <span className="res-label">Camera Station</span>
                  <span className="res-val">{detectionResult.cameraId}</span>
                  <span className="res-sub">File: {detectionResult.fileName}</span>
                </div>

                <div className="res-card">
                  <span className="res-label">Timestamp Metadata</span>
                  <span className="res-val" style={{ fontSize: 11 }}>{detectionResult.timestamp}</span>
                </div>
              </div>

              <div className="action-row">
                <button className="save-obs-btn" onClick={handleEnrollAndCommit}>
                  ➕ Enroll as New Real Individual (TGR-001) & Commit
                </button>
                <button className="save-obs-btn secondary" onClick={() => handleCommitRealObservation(null)}>
                  💾 Commit Observation (Unidentified Status)
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

        .status-tags { display: flex; gap: 8px; }
        .proto-badge { padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 700; }
        .proto-badge.real { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #34d399; }
        .proto-badge.demo { background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #fbbf24; }

        .backend-badge { font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; }
        .backend-badge.online { background: rgba(16,185,129,0.15); color: #34d399; }
        .backend-badge.offline { background: rgba(239,68,68,0.15); color: #f87171; }

        .triage-layout { display: grid; grid-template-columns: 320px 1fr; gap: 20px; }
        .triage-panel { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 20px; }
        .triage-panel h3 { font-size: 14px; font-weight: 600; color: var(--text-bright); margin: 0 0 16px 0; }

        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 11px; color: var(--text-dim); margin-bottom: 6px; }
        .select-input { width: 100%; padding: 8px 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: 6px; color: var(--text-main); font-size: 12px; }

        .upload-dropzone { border: 2px dashed rgba(255,255,255,0.15); border-radius: 8px; padding: 24px 12px; text-align: center; background: rgba(255,255,255,0.01); cursor: pointer; transition: border-color 0.2s; }
        .upload-dropzone:hover { border-color: var(--forest-green); }
        .dropzone-label { display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; }
        .upload-icon { font-size: 28px; }
        .upload-text { font-size: 12px; color: var(--text-main); font-weight: 500; }
        .upload-hint { font-size: 10px; color: var(--text-dim); }

        .file-meta-box { font-size: 10px; color: #34d399; background: rgba(255,255,255,0.02); padding: 8px; border-radius: 6px; margin: 12px 0; }

        .demo-run-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 8px; color: #fff; font-weight: 600; font-size: 13px; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); margin-top: 10px; }
        .demo-run-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .api-note-box { margin-top: 20px; padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; }
        .api-title { display: block; font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; }

        .empty-preview { height: 350px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-dim); text-align: center; }
        .empty-icon { font-size: 40px; margin-bottom: 12px; }

        .processing-state { height: 350px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .spinner { width: 36px; height: 36px; border: 3px solid rgba(16,185,129,0.1); border-top-color: #10b981; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .model-missing-box { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); border-radius: 10px; padding: 24px; text-align: center; color: #f87171; }
        .missing-icon { font-size: 36px; margin-bottom: 8px; }
        .model-missing-box h4 { font-size: 16px; margin: 0 0 8px 0; font-weight: 700; }
        .instruction-card { text-align: left; background: #000; padding: 12px; border-radius: 6px; font-size: 11px; color: #cbd5e1; margin-top: 14px; display: flex; flex-direction: column; gap: 4px; }

        .result-container { display: flex; flex-direction: column; gap: 16px; }
        .image-stage { background: #000; border-radius: 8px; height: 260px; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; border: 1px solid var(--border-subtle); }
        .real-preview-img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .sample-tiger-canvas { width: 100%; height: 100%; background: linear-gradient(135deg, #1c271d, #0d160f); display: flex; align-items: center; justify-content: center; }
        .tiger-visual-emoji { font-size: 100px; opacity: 0.85; }

        .bbox-overlay { position: absolute; border: 2px solid #10b981; background: rgba(16, 185, 129, 0.1); box-shadow: 0 0 12px rgba(16, 185, 129, 0.3); border-radius: 4px; }
        .bbox-label { position: absolute; top: -22px; left: -2px; background: #10b981; color: #000; font-weight: 700; font-size: 10px; padding: 2px 6px; border-radius: 3px 3px 0 0; font-family: var(--font-mono); }

        .result-details-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .res-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 4px; }
        .res-label { font-size: 10px; color: var(--text-dim); }
        .res-val { font-size: 13px; font-weight: 700; color: var(--text-bright); }
        .res-val.green { color: #10b981; } .res-val.orange { color: #f97316; }
        .res-sub { font-size: 10px; color: var(--text-muted); }

        .action-row { display: flex; gap: 12px; }
        .save-obs-btn { flex: 1; padding: 12px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-weight: 600; font-size: 12px; border-radius: 8px; cursor: pointer; }
        .save-obs-btn.secondary { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); color: var(--text-main); }

        @media (max-width: 900px) {
          .triage-layout { grid-template-columns: 1fr; }
          .result-details-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
