import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { YoloDetectionService } from '../services/YoloDetectionService';

export default function AITriage() {
  const { addObservation, enrollNewTiger, isRealMode, backendStatus } = useAppContext();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState('CT-014');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);

  const loadPresetSample = async (presetType) => {
    setIsProcessing(true);
    setDetectionResult(null);

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    if (presetType === 'tiger') {
      setSelectedCamera('CT-014');
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, '#1c2d1c');
      grad.addColorStop(1, '#0b160b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      ctx.fillStyle = '#ea580c';
      ctx.beginPath(); ctx.ellipse(320, 240, 150, 95, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      for (let x = 210; x <= 420; x += 22) {
        ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x + 6, 230); ctx.lineTo(x - 6, 325); ctx.fill();
      }
    } else if (presetType === 'zebra') {
      setSelectedCamera('CT-008');
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 640, 480);

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath(); ctx.ellipse(320, 240, 140, 90, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#020617';
      for (let x = 200; x <= 430; x += 18) {
        ctx.fillRect(x, 150, 9, 180);
      }
    } else {
      setSelectedCamera('CT-022');
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 640, 480);

      ctx.fillStyle = '#334155';
      ctx.beginPath(); ctx.ellipse(310, 240, 140, 85, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      for (let x = 200; x <= 400; x += 25) {
        ctx.fillRect(x, 160, 10, 150);
      }
    }

    canvas.toBlob(async (blob) => {
      const fileName = `sample_${presetType}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      if (backendStatus.connected) {
        const res = await YoloDetectionService.detectImage(file);
        setIsProcessing(false);
        if (res.connected && res.success) {
          const detections = res.detections || [];
          const hasTiger = detections.length > 0;
          const mainDetection = detections[0] || null;
          setDetectionResult({
            connected: true,
            detected: hasTiger,
            totalDetectionsCount: detections.length,
            species: mainDetection ? (mainDetection.class || mainDetection.label) : 'None',
            confidencePct: mainDetection ? (mainDetection.confidence_pct || Math.round((mainDetection.confidence || 0) * 100)) : 0,
            bbox: mainDetection ? mainDetection.bbox : null,
            allDetections: detections,
            model: res.model || 'best.pt',
            device: res.device || 'CPU',
            inferenceTimeMs: res.inferenceTimeMs || 45,
            width: 640,
            height: 480,
            tigerId: hasTiger ? 'TGR-001' : null,
            cameraId: presetType === 'tiger' ? 'CT-014' : presetType === 'zebra' ? 'CT-008' : 'CT-022',
            timestamp: new Date().toLocaleString(),
            fileName: fileName
          });
        }
      } else {
        setIsProcessing(false);
        const isTiger = presetType !== 'zebra';
        setDetectionResult({
          connected: true,
          detected: isTiger,
          totalDetectionsCount: isTiger ? 1 : 0,
          species: isTiger ? 'tiger' : 'zebra',
          confidencePct: isTiger ? 94 : 0,
          bbox: isTiger ? [170, 145, 470, 335] : null,
          model: 'best.pt (Sample Preset)',
          device: 'CPU',
          inferenceTimeMs: 38,
          width: 640,
          height: 480,
          tigerId: isTiger ? 'TGR-001' : null,
          cameraId: presetType === 'tiger' ? 'CT-014' : presetType === 'zebra' ? 'CT-008' : 'CT-022',
          timestamp: new Date().toLocaleString(),
          fileName: fileName
        });
      }
    }, 'image/jpeg', 0.9);
  };

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
      const detections = res.detections || [];
      // Dedicated best.pt tiger model: any detection returned by best.pt is a tiger
      const hasTiger = detections.length > 0;
      const mainDetection = detections[0] || null;

      setDetectionResult({
        connected: true,
        detected: hasTiger,
        totalDetectionsCount: detections.length,
        species: mainDetection ? (mainDetection.class || mainDetection.label) : 'None',
        confidencePct: mainDetection ? (mainDetection.confidence_pct || Math.round((mainDetection.confidence || 0) * 100)) : 0,
        confidenceRaw: mainDetection ? (mainDetection.confidence || 0) : 0,
        bbox: mainDetection ? mainDetection.bbox : null,
        allDetections: detections,
        model: res.model || 'best.pt',
        modelPath: res.modelPath,
        device: res.device || 'CPU',
        inferenceTimeMs: res.inferenceTimeMs || res.processingTimeMs || 0,
        width: res.width,
        height: res.height,
        tigerId: null, // Strictly PENDING until enrolled
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
      // Backend not connected or error
      setDetectionResult({
        connected: false,
        message: res.message || 'YOLO OFFLINE — Model Load Error',
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
      confidence: detectionResult.confidencePct,
      lat: detectionResult.lat,
      lng: detectionResult.lng,
      fileName: detectionResult.fileName,
      model: detectionResult.model,
      modelPath: detectionResult.modelPath,
      inferenceTimeMs: detectionResult.inferenceTimeMs
    });

    alert(`✅ Real Observation committed successfully! Tiger Individual Status: ${tigerId}`);
  };

  const handleEnrollAndCommit = () => {
    const newTiger = enrollNewTiger({
      name: `Real Individual (${detectionResult.fileName})`,
      cameraId: detectionResult.cameraId,
      zone: detectionResult.zone
    });
    handleCommitRealObservation(newTiger);
  };

  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Camera Trap Image Triage</h2>
          <p className="page-subtitle">
            Upload camera trap footage to identify wildlife species using local AI inference.
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
            {isProcessing ? '⏳ Running Detection Model...' : 'Run Species Detection'}
          </button>

          <div className="api-note-box">
            <span className="api-title">Local AI Model Status</span>
            {backendStatus.connected ? (
              <div className="model-info-summary font-mono">
                <div style={{ color: '#34d399', fontWeight: 'bold' }}>MODEL ONLINE</div>
                <div>Model: <span style={{ color: '#60a5fa' }}>{backendStatus.model_name || 'best.pt'}</span></div>
                <div>Model Type: <span style={{ color: '#cbd5e1' }}>{backendStatus.model_type || 'Trained Tiger Detector'}</span></div>
                <div>Mode: <span style={{ color: '#34d399' }}>Active</span></div>
                <div>Device: <span style={{ color: '#fbbf24' }}>{backendStatus.device || 'CPU'}</span></div>
                <div>Target Class: <span style={{ color: '#a78bfa' }}>{JSON.stringify(backendStatus.class_names || ['tiger'])}</span></div>
              </div>
            ) : (
              <div className="model-info-summary font-mono" style={{ color: '#f87171' }}>
                <div style={{ fontWeight: 'bold' }}>MODEL OFFLINE</div>
                <div>Model Load Error</div>
                <div style={{ fontSize: 10, color: '#fca5a5', marginTop: 4 }}>
                  {backendStatus.error || backendStatus.message || 'Model missing or failed to initialize'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Inference Output Panel */}
        <div className="triage-panel main-preview">
          <h3>2. Detection Output</h3>

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
              <h4>MODEL OFFLINE</h4>
              <p>Model Load Error</p>
              <div className="instruction-card font-mono" style={{ color: '#f87171' }}>
                {detectionResult.message}
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
                    
                    {/* Bounding Box Overlay rendered dynamically */}
                    {(() => {
                      const bw = detectionResult.bbox;
                      if (!bw) return null;
                      const b = Array.isArray(bw) ? { x1: bw[0], y1: bw[1], x2: bw[2], y2: bw[3] } : bw;
                      const imgW = detectionResult.width || 640;
                      const imgH = detectionResult.height || 640;

                      const leftPct = ((b.x1 / imgW) * 100).toFixed(2);
                      const topPct = ((b.y1 / imgH) * 100).toFixed(2);
                      const widthPct = (((b.x2 - b.x1) / imgW) * 100).toFixed(2);
                      const heightPct = (((b.y2 - b.y1) / imgH) * 100).toFixed(2);

                      return (
                        <div
                          className="bbox-overlay"
                          style={{
                            position: 'absolute',
                            left: `${leftPct}%`,
                            top: `${topPct}%`,
                            width: `${widthPct}%`,
                            height: `${heightPct}%`,
                            border: '2px solid #10b981',
                            background: 'rgba(16, 185, 129, 0.15)',
                            boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)',
                            borderRadius: '3px',
                            pointerEvents: 'none'
                          }}
                        >
                          <div className="bbox-label" style={{
                            position: 'absolute',
                            top: '-22px',
                            left: '-2px',
                            background: '#10b981',
                            color: '#000',
                            fontWeight: '700',
                            fontSize: '11px',
                            padding: '2px 6px',
                            borderRadius: '3px 3px 0 0',
                            whiteSpace: 'nowrap'
                          }}>
                            🐅 Tiger: {detectionResult.confidencePct}%
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="sample-tiger-canvas">
                    <span className="tiger-visual-emoji">🐅</span>
                  </div>
                )}
              </div>

              {/* Triage Output Data */}
              <div className="result-details-grid">
                <div className={`res-card ${detectionResult.detected ? 'success' : 'warning'}`}>
                  <span className="res-label">Tiger Detection Status</span>
                  <span className={`res-val ${detectionResult.detected ? 'green' : 'red'}`}>
                    {detectionResult.detected ? 'TIGER DETECTED' : 'NO TIGER DETECTED'}
                  </span>
                  <span className="res-sub">
                    {detectionResult.detected 
                      ? `Confidence: ${detectionResult.confidencePct}% | Latency: ${detectionResult.inferenceTimeMs}ms`
                      : 'Zero tigers found in image'}
                  </span>
                </div>

                <div className="res-card highlight">
                  <span className="res-label">Individual Identification</span>
                  <span className="res-val orange">
                    {detectionResult.tigerId ? detectionResult.tigerId : 'UNIDENTIFIED'}
                  </span>
                  <span className="res-sub">
                    {detectionResult.tigerId ? 'Confirmed Profile' : 'Pending Stripe Match'}
                  </span>
                </div>

                <div className="res-card">
                  <span className="res-label">Model Metadata</span>
                  <span className="res-val" style={{ fontSize: 12 }}>{detectionResult.model}</span>
                  <span className="res-sub">Device: {detectionResult.device} | {detectionResult.width}x{detectionResult.height}px</span>
                </div>

                <div className="res-card">
                  <span className="res-label">Camera & Timestamp</span>
                  <span className="res-val" style={{ fontSize: 12 }}>{detectionResult.cameraId}</span>
                  <span className="res-sub" style={{ fontSize: 10 }}>{detectionResult.timestamp}</span>
                </div>
              {/* Feature 2: Auto-Extracted Tiger Bounding Box Crop Snippet */}
              {detectionResult.detected && (
                <div className="crop-snippet-card glow-border" style={{ marginTop: 14, padding: 12, background: 'rgba(15, 23, 42, 0.6)', borderRadius: 8, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div className="crop-snippet-header font-mono" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 11 }}>
                    <span style={{ color: '#34d399', fontWeight: 'bold' }}>✂️ AUTO-EXTRACTED TIGER CROP SNIPPET</span>
                    <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 6px', borderRadius: 4, fontSize: 10 }}>Ready for Stripe Matcher</span>
                  </div>
                  <div className="crop-snippet-body" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div className="crop-box" style={{ width: 140, height: 90, borderRadius: 6, overflow: 'hidden', border: '1px solid #10b981', background: '#090d12', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {previewUrl ? (
                        <img src={previewUrl} alt="Tiger Crop" style={{ width: '160%', height: '160%', objectFit: 'cover', objectPosition: 'center' }} />
                      ) : (
                        <span style={{ fontSize: 24 }}>🐅</span>
                      )}
                    </div>
                    <div className="crop-details font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      <div>Species: <strong style={{ color: '#34d399' }}>Tiger (Panthera tigris)</strong></div>
                      <div>Confidence: <strong style={{ color: '#60a5fa' }}>{detectionResult.confidencePct}%</strong></div>
                      <div>Individual Status: <strong style={{ color: '#fbbf24' }}>{detectionResult.tigerId || 'Pending Re-ID'}</strong></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

              {/* Real Detection Action Row */}
              {detectionResult.detected ? (
                <div className="action-row">
                  <button className="save-obs-btn" onClick={handleEnrollAndCommit}>
                    Enroll New Tiger Profile (TGR-001)
                  </button>
                  <button className="save-obs-btn secondary" onClick={() => handleCommitRealObservation(null)}>
                    Save Observation Record
                  </button>
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
        .res-val.green { color: #10b981; } .res-val.orange { color: #f97316; } .res-val.red { color: #ef4444; }
        .res-sub { font-size: 10px; color: var(--text-muted); }

        .model-info-summary { display: flex; flex-direction: column; gap: 3px; font-size: 11px; margin-top: 4px; }
        .no-detection-banner { background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 12px; font-size: 11px; color: #fca5a5; }

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
