import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { BackendService } from '../services/api/Services';

export default function BatchProcessing() {
  const { quarantine, confirmBlankQuarantine, restoreFromQuarantine, refreshRealData, isRealMode, backendStatus } = useAppContext();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'quarantine' | 'results' | 'history'
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [batchSummary, setBatchSummary] = useState(null);
  const [batchHistory, setBatchHistory] = useState([]);
  const [forceReprocess, setForceReprocess] = useState(false);

  useEffect(() => {
    async function loadBatches() {
      if (isRealMode) {
        const batches = await BackendService.getBatches();
        setBatchHistory(batches);
      }
    }
    loadBatches();
  }, [isRealMode, isProcessing]);

  const handleFolderSelect = (e) => {
    const rawFiles = Array.from(e.target.files || []);
    // Filter for valid image file extensions
    const imageFiles = rawFiles.filter(f => 
      f.type?.startsWith('image/') || /\.(jpe?g|png|webp|bmp|tiff?)$/i.test(f.name)
    );
    if (imageFiles.length > 0) {
      setSelectedFiles(imageFiles);
      setBatchSummary(null);
    } else if (rawFiles.length > 0) {
      alert('No valid image files (.jpg, .png, .webp) found in selected directory.');
    }
  };

  const startBatchProcessing = async () => {
    if (selectedFiles.length === 0 && isRealMode) {
      alert('Please select camera-trap images or a folder to process.');
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setProcessedCount(0);

    if (isRealMode) {
      // ── Real Backend Processing via /api/batch ──
      setProgress(30);
      const res = await BackendService.processBatch(selectedFiles, 'Camera Trap Ingest', forceReprocess);
      setProgress(100);
      setIsProcessing(false);

      if (res && res.success) {
        const stats = {
          batchId: res.batch_id,
          total: res.total || selectedFiles.length,
          processed: res.processed,
          duplicatesSkipped: res.duplicates_skipped || 0,
          blank: res.blank_images,
          useful: res.subject_images,
          tiger: res.tiger_images,
          failed: res.failed_images,
          storageSavedGb: parseFloat(((res.blank_images * 2.5) / 1024).toFixed(2)),
          processingTimeS: res.processing_time_s,
          results: res.results || []
        };
        setBatchSummary(stats);
        await refreshRealData();
        setActiveTab('results');
      } else {
        alert(`❌ Batch processing error: ${res?.error || 'Unknown backend error'}`);
      }
    } else {
      // ── Isolated Demo Simulation Mode ──
      const total = selectedFiles.length || 24;
      let p = 0;
      const interval = setInterval(() => {
        p += 4;
        setProcessedCount(Math.min(total, p));
        setProgress(Math.round((Math.min(total, p) / total) * 100));
        if (p >= total) {
          clearInterval(interval);
          setIsProcessing(false);
          setBatchSummary({
            batchId: 'DEMO-BATCH-001',
            processed: total,
            blank: Math.round(total * 0.7),
            useful: Math.round(total * 0.3),
            tiger: Math.round(total * 0.2),
            failed: 0,
            storageSavedGb: 0.05,
            processingTimeS: 2.4,
            results: []
          });
          setActiveTab('results');
        }
      }, 150);
    }
  };

  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Batch Processing & Ingestion</h2>
          <p className="page-subtitle">
            Scan raw camera trap folders, triage blank frames, run YOLO tiger detection, and safely quarantine blanks.
          </p>
        </div>
        <div className="tab-buttons">
          <button className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
            📥 Upload & Ingest
          </button>
          <button className={`tab-btn ${activeTab === 'quarantine' ? 'active' : ''}`} onClick={() => setActiveTab('quarantine')}>
            🛡 Safe Quarantine ({quarantine.filter(q => q.status === 'quarantined').length})
          </button>
          <button className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>
            📊 Batch Statistics
          </button>
          <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            📜 Batch History ({batchHistory.length})
          </button>
        </div>
      </div>

      {activeTab === 'upload' && (
        <div className="batch-container">
          <div className="upload-section-card">
            <h3>1. Select Camera Trap Directory or Files</h3>
            <p className="sub-text">Scans raw folder hierarchy (e.g. <code>CameraTrap/CT001/IMG001.jpg</code>). Automatically parses Station IDs and timestamps.</p>

            <div className="file-pickers-row">
              <div className="picker-box">
                <label className="picker-label">
                  <span className="icon">📁</span>
                  <span>Select Folder (webkitdirectory)</span>
                  <input type="file" webkitdirectory="" directory="" multiple onChange={handleFolderSelect} hidden />
                </label>
              </div>

              <div className="picker-box">
                <label className="picker-label">
                  <span className="icon">🖼</span>
                  <span>Select Multiple Images</span>
                  <input type="file" multiple accept="image/*" onChange={handleFolderSelect} hidden />
                </label>
              </div>
            </div>

            {/* Folder Pre-Scan Summary */}
            <div className="prescan-card">
              <div className="prescan-stat">
                <span className="p-label">Real Files Selected</span>
                <span className="p-val font-mono">{selectedFiles.length > 0 ? `${selectedFiles.length} file(s)` : '0 (No files chosen)'}</span>
              </div>
              <div className="prescan-stat">
                <span className="p-label">YOLO Inference Engine</span>
                <span className={`p-val ${backendStatus.connected ? 'green' : 'orange'}`}>
                  {backendStatus.connected ? 'Online (best.pt)' : 'Model Offline'}
                </span>
              </div>
              <div className="prescan-stat">
                <span className="p-label">Database Status</span>
                <span className={`p-val ${backendStatus.connected ? 'green' : 'orange'}`}>
                  {backendStatus.connected ? 'SQLite Online' : 'Disconnected'}
                </span>
              </div>
              <div className="prescan-stat">
                <span className="p-label">Pipeline Status</span>
                <span className="p-val orange">{isProcessing ? 'Processing Batch...' : 'Ready to Ingest'}</span>
              </div>
            </div>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="progress-card">
                <div className="progress-header">
                  <span>Processing: {processedCount} / {selectedFiles.length || 100}</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="pipeline-steps-status font-mono">
                  RAW INGESTION → EXIF & HASHING → YOLOv8 DETECTION → EVIDENCE CROPPING → SQLITE PERSISTENCE
                </div>
              </div>
            )}

            {!isProcessing && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary, #94a3b8)' }}>
                  <input
                    type="checkbox"
                    checked={forceReprocess}
                    onChange={(e) => setForceReprocess(e.target.checked)}
                    style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                  />
                  <span>🔁 Force Re-process (Re-run YOLO AI Detection even if files were uploaded previously)</span>
                </label>

                <button
                  className="start-batch-btn"
                  onClick={startBatchProcessing}
                  disabled={selectedFiles.length === 0 && isRealMode}
                >
                  {selectedFiles.length > 0
                    ? `▶ Start Ingestion & YOLOv8 Processing (${selectedFiles.length} Images)`
                    : isRealMode
                    ? '⚠️ Select files or folder to start real batch processing'
                    : '▶ Run Demo Batch Simulation'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Safe Quarantine */}
      {activeTab === 'quarantine' && (
        <div className="quarantine-container">
          <div className="quarantine-header-card">
            <div>
              <h3>🛡 Safe Quarantine Area (Reversible Blank Storage)</h3>
              <p>Images without wildlife detections are stored in quarantine rather than permanently deleted to prevent accidental loss of subtle tiger sightings.</p>
            </div>
          </div>

          <div className="quarantine-grid">
            {quarantine.map(item => {
              const qId = item.id;
              const fname = item.filename || item.fileName;
              const camId = item.camera_id || item.cameraId;
              const ts = item.timestamp;
              const conf = item.blank_confidence || item.blankConfidence || 95.0;
              const reason = item.reason || 'No animal pixels detected by YOLO model';
              const st = item.status;

              return (
                <div key={qId} className={`quarantine-card ${st}`}>
                  <div className="q-image-placeholder">
                    <span className="q-icon">🍃</span>
                    <span className="q-filename">{fname}</span>
                  </div>
                  <div className="q-details">
                    <div className="q-row">
                      <span className="q-cam font-mono">{camId}</span>
                      <span className="q-time">{ts}</span>
                    </div>
                    <div className="q-conf">
                      Blank Confidence: <strong className="green">{conf}%</strong>
                    </div>
                    <div className="q-reason">{reason}</div>

                    <div className="q-actions">
                      {st === 'quarantined' && (
                        <>
                          <button className="q-btn confirm" onClick={() => confirmBlankQuarantine(qId)}>
                            ✓ Confirm Blank
                          </button>
                          <button className="q-btn restore" onClick={() => restoreFromQuarantine(qId)}>
                            ↺ Restore to Stream
                          </button>
                        </>
                      )}
                      {st === 'confirmed_blank' && (
                        <span className="q-status-tag confirmed">Confirmed Blank (Safe Delete Ready)</span>
                      )}
                      {st === 'restored' && (
                        <span className="q-status-tag restored">Restored to Active Stream</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {quarantine.length === 0 && (
              <div className="empty-state">No quarantined images in queue. All images currently classified as active subjects.</div>
            )}
          </div>
        </div>
      )}

      {/* Processing Statistics */}
      {activeTab === 'results' && (
        <div className="stats-container">
          <div className="stats-summary-card">
            <h3>📊 Batch Processing Statistics</h3>
            <span className={`proto-badge ${isRealMode ? 'real' : 'demo'}`}>
              {isRealMode ? 'REAL BATCH RESULTS' : 'DEMO SIMULATION RESULTS'}
            </span>

            {batchSummary ? (
              <div className="stats-main-grid">
                <div className="s-card highlight">
                  <span className="s-icon">🖼</span>
                  <span className="s-val font-mono">{batchSummary.processed}</span>
                  <span className="s-label">New Images Ingested</span>
                </div>

                {batchSummary.duplicatesSkipped > 0 && (
                  <div className="s-card other">
                    <span className="s-icon">🔁</span>
                    <span className="s-val font-mono">{batchSummary.duplicatesSkipped}</span>
                    <span className="s-label">Duplicates Skipped (Hash Match)</span>
                  </div>
                )}

                <div className="s-card blank">
                  <span className="s-icon">🍃</span>
                  <span className="s-val font-mono">{batchSummary.blank}</span>
                  <span className="s-label">Blank Frames Quarantined</span>
                </div>

                <div className="s-card useful">
                  <span className="s-icon">✅</span>
                  <span className="s-val font-mono">{batchSummary.useful}</span>
                  <span className="s-label">Useful Wildlife Sightings</span>
                </div>

                <div className="s-card tiger">
                  <span className="s-icon">🐅</span>
                  <span className="s-val font-mono">{batchSummary.tiger}</span>
                  <span className="s-label">Tiger Detections (best.pt)</span>
                </div>

                <div className="s-card other">
                  <span className="s-icon">⚡</span>
                  <span className="s-val font-mono">{batchSummary.processingTimeS}s</span>
                  <span className="s-label">Total Processing Time</span>
                </div>

                <div className="s-card storage">
                  <span className="s-icon">💾</span>
                  <span className="s-val font-mono">{batchSummary.storageSavedGb} GB</span>
                  <span className="s-label">Estimated Storage Saved</span>
                </div>
              </div>
            ) : (
              <div className="empty-state">No batch results available. Run a batch process to view statistics.</div>
            )}
          </div>
        </div>
      )}

      {/* Batch History */}
      {activeTab === 'history' && (
        <div className="history-container">
          <div className="upload-section-card">
            <h3>📜 Ingestion Batch History</h3>
            <table className="history-table font-mono" style={{ width: '100%', marginTop: 14, fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px 12px' }}>Batch ID</th>
                  <th style={{ padding: '8px 12px' }}>Date</th>
                  <th style={{ padding: '8px 12px' }}>Source</th>
                  <th style={{ padding: '8px 12px' }}>Total</th>
                  <th style={{ padding: '8px 12px' }}>Tigers</th>
                  <th style={{ padding: '8px 12px' }}>Blanks</th>
                  <th style={{ padding: '8px 12px' }}>Time</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {batchHistory.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px 12px', color: '#60a5fa' }}>{b.id}</td>
                    <td style={{ padding: '8px 12px' }}>{b.created_at}</td>
                    <td style={{ padding: '8px 12px' }}>{b.source_name}</td>
                    <td style={{ padding: '8px 12px' }}>{b.total_images}</td>
                    <td style={{ padding: '8px 12px', color: '#10b981' }}>{b.tiger_images}</td>
                    <td style={{ padding: '8px 12px', color: '#9ca3af' }}>{b.blank_images}</td>
                    <td style={{ padding: '8px 12px' }}>{b.processing_time_s}s</td>
                    <td style={{ padding: '8px 12px' }}><span className="status-tag">{b.status}</span></td>
                  </tr>
                ))}
                {batchHistory.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                      No batches logged yet. Upload files to run an ingestion batch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        .pg-page { padding: 20px 24px; overflow-y: auto; height: 100%; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .page-title { font-size: 20px; font-weight: 700; color: var(--text-bright); margin: 0 0 4px 0; }
        .page-subtitle { font-size: 12px; color: var(--text-dim); margin: 0; }

        .tab-buttons { display: flex; gap: 8px; }
        .tab-btn { padding: 6px 14px; border-radius: 6px; border: 1px solid var(--border-subtle); background: rgba(255,255,255,0.03); color: var(--text-muted); font-size: 12px; cursor: pointer; transition: all 0.2s; font-weight: 600; }
        .tab-btn.active { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.4); color: #34d399; }

        .batch-container, .quarantine-container, .stats-container, .history-container { display: flex; flex-direction: column; gap: 20px; }
        .upload-section-card, .quarantine-header-card, .stats-summary-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 20px; }

        .file-pickers-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .picker-box { border: 2px dashed rgba(255,255,255,0.15); border-radius: 10px; padding: 24px; text-align: center; background: rgba(255,255,255,0.01); transition: border-color 0.2s; }
        .picker-box:hover { border-color: var(--forest-green); }
        .picker-label { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; color: var(--text-main); font-size: 13px; font-weight: 600; }
        .picker-label .icon { font-size: 32px; }

        .prescan-card { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 14px; margin-bottom: 20px; }
        .prescan-stat { display: flex; flex-direction: column; gap: 4px; }
        .p-label { font-size: 11px; color: var(--text-dim); }
        .p-val { font-size: 14px; font-weight: 700; color: var(--text-bright); }
        .p-val.green { color: #10b981; } .p-val.orange { color: #f97316; }

        .progress-card { background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2); border-radius: 8px; padding: 16px; margin-bottom: 20px; }
        .progress-header { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: var(--text-bright); margin-bottom: 8px; }
        .progress-bar-bg { width: 100%; height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden; margin-bottom: 10px; }
        .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 5px; transition: width 0.2s; }
        .pipeline-steps-status { font-size: 10px; color: #34d399; text-align: center; }

        .start-batch-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 8px; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 16px rgba(16,185,129,0.3); }
        .start-batch-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .quarantine-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .quarantine-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 10px; overflow: hidden; }
        .quarantine-card.confirmed_blank { opacity: 0.5; }
        .quarantine-card.restored { border-color: #10b981; }

        .q-image-placeholder { height: 120px; background: #0b0f14; display: flex; flex-direction: column; align-items: center; justify-content: center; border-bottom: 1px solid var(--border-subtle); }
        .q-icon { font-size: 32px; margin-bottom: 4px; }
        .q-filename { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); }

        .q-details { padding: 12px; display: flex; flex-direction: column; gap: 6px; }
        .q-row { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-dim); }
        .q-cam { font-weight: 700; color: var(--text-bright); }
        .q-conf { font-size: 11px; color: var(--text-muted); }
        .q-conf .green { color: #10b981; }
        .q-reason { font-size: 10px; color: #f87171; background: rgba(239,68,68,0.1); padding: 4px; border-radius: 4px; }

        .q-actions { display: flex; gap: 6px; margin-top: 6px; }
        .q-btn { flex: 1; padding: 6px; border: none; border-radius: 4px; font-size: 10px; font-weight: 700; cursor: pointer; }
        .q-btn.confirm { background: rgba(239,68,68,0.2); color: #f87171; }
        .q-btn.restore { background: rgba(16,185,129,0.2); color: #34d399; }
        .q-status-tag { font-size: 10px; font-weight: 700; width: 100%; text-align: center; padding: 4px; border-radius: 4px; }
        .q-status-tag.confirmed { background: rgba(239,68,68,0.15); color: #f87171; }
        .q-status-tag.restored { background: rgba(16,185,129,0.15); color: #34d399; }

        .stats-main-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0; }
        .s-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 18px; display: flex; flex-direction: column; gap: 4px; }
        .s-icon { font-size: 24px; }
        .s-val { font-size: 24px; font-weight: 800; color: var(--text-bright); }
        .s-label { font-size: 11px; color: var(--text-dim); }

        .s-card.blank .s-val { color: #9ca3af; }
        .s-card.useful .s-val { color: #10b981; }
        .s-card.tiger .s-val { color: #f97316; }
        .s-card.other .s-val { color: #eab308; }
        .s-card.storage .s-val { color: #8b5cf6; }

        .proto-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
        .proto-badge.real { background: rgba(16,185,129,0.15); color: #34d399; }
        .proto-badge.demo { background: rgba(245,158,11,0.15); color: #fbbf24; }

        .empty-state { padding: 40px; text-align: center; color: var(--text-dim); font-size: 13px; }
      `}</style>
    </div>
  );
}
