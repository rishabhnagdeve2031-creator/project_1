import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { YoloDetectionService } from '../services/YoloDetectionService';
import { BackendService } from '../services/api/Services';

export default function AITriage() {
  const { addObservation, enrollNewTiger, isRealMode, backendStatus } = useAppContext();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState('CT-014');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [rejected, setRejected] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectionResult(null);
      setRejected(false);

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
    setRejected(false);

    const meta = YoloDetectionService.parseImageMetadata(selectedFile);

    const res = await YoloDetectionService.detectImage(selectedFile);

    setIsProcessing(false);

    if (res.connected && res.success) {
      // ── Real backend response ──
      const detections = res.detections || [];
      const hasTiger = detections.some(d => (d.class || d.label || '').toLowerCase().includes('tiger'));
      const mainDetection = detections[0] || null;

      setDetectionResult({
        connected: true,
        source: 'REAL_YOLO',
        detected: hasTiger,
        totalDetectionsCount: detections.length,
        species: mainDetection ? (mainDetection.class || mainDetection.label) : 'None',
        confidencePct: mainDetection ? (mainDetection.confidence_pct || Math.round((mainDetection.confidence || 0) * 100)) : 0,
        bbox: mainDetection ? mainDetection.bbox : null,
        allDetections: detections,
        crops: res.crops || [],
        model: res.model || 'best.pt',
        modelPath: res.modelPath,
        device: res.device || 'CPU',
        inferenceTimeMs: res.inferenceTimeMs || res.processingTimeMs || 0,
        width: res.width || 640,
        height: res.height || 480,
        tigerId: 'UNIDENTIFIED',
        tigerName: 'Unidentified Individual (Pending Stripe Re-ID)',
        cameraId: selectedCamera || meta.cameraId,
        timestamp: meta.timestamp,
        fileName: meta.fileName,
        fileSizeMb: meta.fileSizeMb,
        lat: 21.7380,
        lng: 79.3150,
        zone: 'Core Zone'
      });
    } else {
      // ── Offline Error (Honest reporting in Real Mode) ──
      if (isRealMode) {
        setDetectionResult({
          connected: false,
          source: 'REAL_YOLO',
          message: res.message || 'AI BACKEND OFFLINE — Cannot run real YOLO inference. Start server.py.'
        });
      } else {
        // Demo Mode Simulation
        setDetectionResult({
          connected: true,
          demoMode: true,
          source: 'DEMO_SIMULATION',
          detected: true,
          totalDetectionsCount: 1,
          species: 'tiger',
          confidencePct: 92,
          bbox: { x1: 170, y1: 145, x2: 470, y2: 335 },
          allDetections: [{ class: 'tiger', confidence: 0.92, confidence_pct: 92, bbox: { x1: 170, y1: 145, x2: 470, y2: 335 } }],
          model: 'best.pt (Simulated Demo)',
          device: 'CPU',
          inferenceTimeMs: 42,
          width: 640,
          height: 480,
          tigerId: 'TGR-001',
          cameraId: selectedCamera || 'CT-014',
          timestamp: new Date().toLocaleString(),
          fileName: meta.fileName
        });
      }
    }
  };

  const handleCommitRealObservation = async (enrolledTigerId = null) => {
    if (!detectionResult || !detectionResult.detected) return;

    const assignedId = enrolledTigerId || 'UNIDENTIFIED';

    await addObservation({
      tiger_id: assignedId,
      camera_id: detectionResult.cameraId,
      timestamp: detectionResult.timestamp,
      zone: detectionResult.zone,
      confidence: detectionResult.confidencePct,
      lat: detectionResult.lat,
      lng: detectionResult.lng,
      fileName: detectionResult.fileName,
      crop_path: detectionResult.crops?.[0] || null
    });

    alert(`✅ Real Observation saved! Tiger Status: ${assignedId}`);
  };

  const handleEnrollAndCommit = async () => {
    const newTiger = await enrollNewTiger({
      name: `Real Individual (${detectionResult.fileName})`,
      cameraId: detectionResult.cameraId,
      zone: detectionResult.zone,
      lat: detectionResult.lat,
      lng: detectionResult.lng
    });
    const tId = newTiger?.tiger_id || newTiger?.id || 'TGR-001';
    await handleCommitRealObservation(tId);
  };

  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">AI Camera Trap Triage</h2>
          <p className="page-subtitle">
            Upload raw camera trap footage for real-time YOLOv8 tiger detection and evidence cropping.
          </p>
        </div>
      </div>

      <div className="triage-layout">
        {/* Input Panel */}
        <div className="triage-panel">
          <h3>1. Image Input & Station</h3>

          <div className="form-group">
            <label>Camera Trap Station ID</label>
            <input
              type="text"
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              placeholder="e.g. CT-014"
              className="select-input"
            />
          </div>

          <div className="upload-dropzone">
            <input type="file" accept="image/*" id="file-upload" onChange={handleImageChange} hidden />
            <label htmlFor="file-upload" className="dropzone-label">
              <span className="upload-icon">📷</span>
              <span className="upload-text">
                {selectedFile ? selectedFile.name : 'Select camera-trap image file'}
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
            {isProcessing ? '⏳ Running YOLOv8 Detection...' : 'Run Species Detection'}
          </button>

          <div className="api-note-box">
            <span className="api-title">Local AI Model Status</span>
            {backendStatus.connected ? (
              <div className="model-info-summary font-mono">
                <div style={{ color: '#34d399', fontWeight: 'bold' }}>AI MODEL ONLINE</div>
                <div>Model: <span style={{ color: '#60a5fa' }}>{backendStatus.model_name || 'best.pt'}</span></div>
                <div>Class: <span style={{ color: '#a78bfa' }}>Tiger (Panthera tigris)</span></div>
                <div>Device: <span style={{ color: '#fbbf24' }}>{backendStatus.device || 'CPU'}</span></div>
                <div>DB: <span style={{ color: '#34d399' }}>SQLite Online</span></div>
              </div>
            ) : (
              <div className="model-info-summary font-mono" style={{ color: '#f87171' }}>
                <div style={{ fontWeight: 'bold' }}>⚠️ AI BACKEND OFFLINE</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                  Start <code>py -3.12 server.py</code> on port 8000 for local YOLO inference.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Inference Output Panel */}
        <div className="triage-panel main-preview">
          <h3>2. Detection Output & Bounding Boxes</h3>

          {!detectionResult && !isProcessing && (
            <div className="empty-preview">
              <span className="empty-icon">🔍</span>
              <p>Select a camera trap image and click "Run Species Detection".</p>
            </div>
          )}

          {isProcessing && (
            <div className="processing-state">
              <div className="spinner"></div>
              <p>Analyzing camera trap image with YOLO best.pt model...</p>
            </div>
          )}

          {detectionResult && !detectionResult.connected && (
            <div className="model-missing-box">
              <div className="missing-icon">⚠️</div>
              <h4>AI INFERENCE OFFLINE</h4>
              <p>{detectionResult.message}</p>
              <div className="instruction-card font-mono" style={{ color: '#f87171' }}>
                Run command: <strong>py -3.12 server.py</strong>
              </div>
            </div>
          )}

          {detectionResult && detectionResult.connected && (
            <div className="result-container">
              {/* Image Preview Stage with Bounding Box Overlay */}
              <div className="image-stage">
                {previewUrl ? (
                  <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', maxHeight: '100%' }}>
                    <img src={previewUrl} alt="Camera Trap Preview" className="real-preview-img" />

                    {/* Bounding Box Overlay — renders ALL detections */}
                    {!rejected && (() => {
                      const allDets = detectionResult.allDetections || [];
                      const imgW = detectionResult.width || 640;
                      const imgH = detectionResult.height || 480;
                      const colors = ['#10b981', '#60a5fa', '#fbbf24', '#f472b6', '#a78bfa', '#fb923c'];

                      return allDets.map((det, idx) => {
                        const bw = det.bbox;
                        if (!bw) return null;
                        const b = Array.isArray(bw) ? { x1: bw[0], y1: bw[1], x2: bw[2], y2: bw[3] } : bw;
                        const color = colors[idx % colors.length];
                        const conf = det.confidence_pct || Math.round((det.confidence || 0) * 100);
                        const label = det.class || det.label || 'Tiger';

                        const leftPct = ((b.x1 / imgW) * 100).toFixed(2);
                        const topPct = ((b.y1 / imgH) * 100).toFixed(2);
                        const widthPct = (((b.x2 - b.x1) / imgW) * 100).toFixed(2);
                        const heightPct = (((b.y2 - b.y1) / imgH) * 100).toFixed(2);

                        return (
                          <div
                            key={idx}
                            className="bbox-overlay"
                            style={{
                              position: 'absolute',
                              left: `${leftPct}%`,
                              top: `${topPct}%`,
                              width: `${widthPct}%`,
                              height: `${heightPct}%`,
                              border: `2px solid ${color}`,
                              background: `${color}22`,
                              boxShadow: `0 0 12px ${color}66`,
                              borderRadius: '3px',
                              pointerEvents: 'none'
                            }}
                          >
                            <div className="bbox-label" style={{
                              position: 'absolute',
                              top: '-22px',
                              left: '-2px',
                              background: color,
                              color: '#000',
                              fontWeight: '700',
                              fontSize: '11px',
                              padding: '2px 6px',
                              borderRadius: '3px 3px 0 0',
                              whiteSpace: 'nowrap'
                            }}>
                              🐅 {label} {idx + 1}: {conf}%
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="sample-tiger-canvas">
                    <span className="tiger-visual-emoji">🐅</span>
                  </div>
                )}
              </div>

              {/* Triage Output Data Cards */}
              <div className="result-details-grid">
                <div className={`res-card ${detectionResult.detected && !rejected ? 'success' : 'warning'}`}>
                  <span className="res-label">Species Detection (AI)</span>
                  <span className={`res-val ${detectionResult.detected && !rejected ? 'green' : 'red'}`}>
                    {rejected ? 'REJECTED BY OPERATOR' : detectionResult.detected ? 'TIGER DETECTED' : 'NO TIGER DETECTED'}
                  </span>
                  <span className="res-sub">
                    {detectionResult.detected 
                      ? `Confidence: ${detectionResult.confidencePct}% | Latency: ${detectionResult.inferenceTimeMs}ms`
                      : 'Blank image / no animal detected'}
                  </span>
                </div>

                <div className="res-card highlight">
                  <span className="res-label">Individual Identification</span>
                  <span className="res-val orange">
                    {detectionResult.tigerId}
                  </span>
                  <span className="res-sub">
                    ⚠️ Stripe Re-ID required (YOLO does not identify individuals)
                  </span>
                </div>

                <div className="res-card">
                  <span className="res-label">Model & Device</span>
                  <span className="res-val" style={{ fontSize: 12 }}>{detectionResult.model}</span>
                  <span className="res-sub">Device: {detectionResult.device} | {detectionResult.width}x{detectionResult.height}px</span>
                </div>

                <div className="res-card">
                  <span className="res-label">Station & Time</span>
                  <span className="res-val" style={{ fontSize: 12 }}>{detectionResult.cameraId}</span>
                  <span className="res-sub" style={{ fontSize: 10 }}>{detectionResult.timestamp}</span>
                </div>
              </div>

              {/* Evidence Crop Card */}
              {detectionResult.detected && !rejected && (
                <div className="crop-snippet-card" style={{ padding: 12, background: 'rgba(15, 23, 42, 0.6)', borderRadius: 8, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div className="crop-snippet-header font-mono" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 11 }}>
                    <span style={{ color: '#34d399', fontWeight: 'bold' }}>✂️ AUTO-EXTRACTED TIGER CROP EVIDENCE</span>
                    <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 6px', borderRadius: 4, fontSize: 10 }}>Ready for Stripe Matcher</span>
                  </div>
                  <div className="crop-snippet-body" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div className="crop-box" style={{ width: 140, height: 90, borderRadius: 6, overflow: 'hidden', border: '1px solid #10b981', background: '#090d12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {detectionResult.crops?.[0] ? (
                        <img src={BackendService.getMediaUrl(detectionResult.crops[0])} alt="Tiger Crop" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : previewUrl ? (
                        <img src={previewUrl} alt="Tiger Crop" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: 24 }}>🐅</span>
                      )}
                    </div>
                    <div className="crop-details font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      <div>Species: <strong style={{ color: '#34d399' }}>Tiger (Panthera tigris)</strong></div>
                      <div>YOLO Confidence: <strong style={{ color: '#60a5fa' }}>{detectionResult.confidencePct}%</strong></div>
                      <div>Individual Status: <strong style={{ color: '#fbbf24' }}>Unidentified (Human Review Queue)</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {detectionResult.detected && !rejected ? (
                <div className="action-row">
                  <button className="save-obs-btn" onClick={handleEnrollAndCommit}>
                    ➕ Enroll as New Individual (TGR-XXX)
                  </button>
                  <button className="save-obs-btn secondary" onClick={() => handleCommitRealObservation(null)}>
                    💾 Save as Unidentified Observation
                  </button>
                  <button className="save-obs-btn danger" onClick={() => setRejected(true)}>
                    ❌ Reject False Positive
                  </button>
                </div>
              ) : rejected ? (
                <div className="no-detection-banner font-mono" style={{ color: '#f87171' }}>
                  Detection rejected by human operator. Observation will not be saved.
                </div>
              ) : (
                <div className="no-detection-banner font-mono">
                  Processed by <strong>{detectionResult.model}</strong> ({detectionResult.device}) in {detectionResult.inferenceTimeMs}ms. No tiger detected.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .pg-page { padding: 20px 24px; overflow-y: auto; height: 100%; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .page-title { font-size: 20px; font-weight: 700; color: var(--text-bright); margin: 0 0 4px 0; }
        .page-subtitle { font-size: 12px; color: var(--text-dim); margin: 0; }

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
        .instruction-card { text-align: left; background: #000; padding: 12px; border-radius: 6px; font-size: 11px; color: #cbd5e1; margin-top: 14px; }

        .result-container { display: flex; flex-direction: column; gap: 16px; }
        .image-stage { background: #000; border-radius: 8px; height: 280px; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; border: 1px solid var(--border-subtle); }
        .real-preview-img { max-width: 100%; max-height: 100%; object-fit: contain; }

        .result-details-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .res-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 4px; }
        .res-label { font-size: 10px; color: var(--text-dim); }
        .res-val { font-size: 13px; font-weight: 700; color: var(--text-bright); }
        .res-val.green { color: #10b981; } .res-val.orange { color: #f97316; } .res-val.red { color: #ef4444; }
        .res-sub { font-size: 10px; color: var(--text-muted); }

        .model-info-summary { display: flex; flex-direction: column; gap: 3px; font-size: 11px; margin-top: 4px; }
        .no-detection-banner { background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 12px; font-size: 11px; color: #fca5a5; }

        .action-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .save-obs-btn { flex: 1; min-width: 160px; padding: 12px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-weight: 600; font-size: 12px; border-radius: 8px; cursor: pointer; }
        .save-obs-btn.secondary { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); color: var(--text-main); }
        .save-obs-btn.danger { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); color: #f87171; }

        @media (max-width: 900px) {
          .triage-layout { grid-template-columns: 1fr; }
          .result-details-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
