import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ExportService } from '../services/ExportService';

export default function Dashboard() {
  const {
    appMode,
    toggleAppMode,
    isRealMode,
    backendStatus,
    kpi,
    alerts,
    observations,
    cameras,
    tigerProfiles,
    runFullDemoWorkflow
  } = useAppContext();

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const recentObs = observations.slice(0, 5);
  const onlineCameras = cameras.filter(c => c.status === 'online');

  return (
    <div className="pg-page">
      {/* Mode Status Banner */}
      <div className={`full-demo-banner ${isRealMode ? 'real' : 'demo'}`}>
        <div className="banner-info">
          <span className={`proto-badge ${isRealMode ? 'real' : 'demo'}`}>
            {isRealMode ? '🟢 REAL DATA MODE (PRIMARY)' : '🟡 DEMO MODE ACTIVE'}
          </span>
          <span className="banner-title">
            {isRealMode
              ? 'PenchGuard AI — Operational Real Data Processing Mode'
              : 'PenchGuard AI — Presentation Demo Mode'}
          </span>
        </div>
        <div className="banner-actions">
          {isRealMode ? (
            <button className="run-full-demo-btn alt" onClick={toggleAppMode}>
              🔄 Switch to Presentation Demo Mode
            </button>
          ) : (
            <button className="run-full-demo-btn" onClick={runFullDemoWorkflow}>
              🚀 Run Full 12-Step Demo Pipeline
            </button>
          )}
        </div>
      </div>

      {/* Backend YOLO Connection Notice */}
      <div className={`backend-notice-bar ${backendStatus.connected ? 'online' : 'offline'}`}>
        <span className="icon">{backendStatus.connected ? '✅' : '⚠️'}</span>
        <span>
          {backendStatus.connected
            ? `Real YOLO Model Connected: ${backendStatus.model_path}`
            : `${backendStatus.message} — Real inference requires backend server running.`}
        </span>
      </div>

      {/* Real vs Demo Empty State Check */}
      {isRealMode && kpi.imagesProcessed === 0 && (
        <div className="real-empty-banner">
          <span className="empty-icon">📊</span>
          <div className="empty-text font-mono">
            <strong>NO REAL DATA LOADED YET</strong>
            <p>Upload real camera-trap images or folders in <strong>Batch Processing</strong> to populate real observations, tiger detections, and movement maps.</p>
          </div>
        </div>
      )}

      {/* KPI Row */}
      <div className="kpi-row">
        <KPICard icon="📷" label="Cameras Online" value={`${cameras.length > 0 ? onlineCameras.length : 0} / ${cameras.length}`} accent="#10b981" />
        <KPICard icon="🖼" label="Images Processed" value={kpi.imagesProcessed.toLocaleString()} accent="#3b82f6" />
        <KPICard icon="🍃" label="Blank Quarantined" value={kpi.blankImages} accent="#9ca3af" />
        <KPICard icon="✅" label="Useful Wildlife Images" value={kpi.usefulImages} accent="#10b981" />
        <KPICard icon="🐅" label="Tiger Detections (YOLO)" value={kpi.tigerDetections} accent="#f97316" />
        <KPICard icon="🔍" label="Individual Tigers Enrolled" value={kpi.individualTigers} accent="#8b5cf6" />
        <KPICard icon="👁" label="Pending Human Review" value={kpi.pendingHumanReviews} accent="#fbbf24" />
        <KPICard icon="🚨" label="Active Alerts" value={kpi.activeAlerts} accent={kpi.activeAlerts > 0 ? '#ef4444' : '#10b981'} />
      </div>

      {/* Export Toolbar */}
      <div className="export-toolbar">
        <span className="exp-label">📥 Forest Department Export Tools:</span>
        <button className="exp-btn" onClick={() => ExportService.exportObservationsCSV(observations)} disabled={observations.length === 0}>
          📄 Export Observations (CSV)
        </button>
        <button className="exp-btn" onClick={() => ExportService.exportTigerDatabaseJSON(tigerProfiles)} disabled={tigerProfiles.length === 0}>
          📄 Export Tiger Catalogue (JSON)
        </button>
        <button className="exp-btn" onClick={() => ExportService.exportAlertsCSV(alerts)} disabled={alerts.length === 0}>
          📄 Export Alerts Log (CSV)
        </button>
      </div>

      <div className="dash-grid">
        {/* Live Camera Activity */}
        <div className="dash-card span-2">
          <div className="card-title-row">
            <h3>📷 Camera Station Network</h3>
            <span className="card-badge">{cameras.length} Active Stations</span>
          </div>
          {cameras.length > 0 ? (
            <div className="camera-mini-grid">
              {cameras.slice(0, 8).map(cam => (
                <div key={cam.id} className={`cam-mini-card ${cam.status}`}>
                  <div className="cam-mini-header">
                    <span className={`status-dot ${cam.status}`}></span>
                    <span className="cam-mini-id">{cam.id}</span>
                    <span className={`cam-status-tag ${cam.status}`}>{cam.status.toUpperCase()}</span>
                  </div>
                  <div className="cam-mini-loc">{cam.location}</div>
                  <div className="cam-mini-meta">
                    <span>🕐 {cam.lastCapture}</span>
                    <span>🔋 {cam.battery}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-section-text font-mono">No real camera stations parsed yet. Process a batch of images to auto-detect stations.</div>
          )}
        </div>

        {/* Recent Detections */}
        <div className="dash-card">
          <div className="card-title-row">
            <h3>🐅 Recent Detections</h3>
          </div>
          <div className="detection-list">
            {recentObs.map(obs => {
              const tiger = tigerProfiles.find(t => t.id === obs.tigerId);
              return (
                <div key={obs.id} className="detection-item">
                  <div className="det-header">
                    <span className="det-emoji">🐅</span>
                    <div>
                      <div className="det-tiger">{tiger?.name || obs.tigerId || 'Unidentified'}</div>
                      <div className="det-cam">{obs.cameraId} · {obs.zone}</div>
                    </div>
                    <div className="det-conf">
                      <div className="conf-value">{obs.confidence}%</div>
                      <div className="conf-label">Confidence</div>
                    </div>
                  </div>
                  <div className="det-time">{obs.timestamp}</div>
                </div>
              );
            })}
            {recentObs.length === 0 && (
              <div className="empty-section-text font-mono">No real detections logged yet.</div>
            )}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="dash-card">
          <div className="card-title-row">
            <h3>🚨 Active Explainable Alerts</h3>
            <span className="card-badge alert-badge">{activeAlerts.length} Active</span>
          </div>
          <div className="alert-list">
            {activeAlerts.length === 0 && <div className="empty-section-text font-mono">No active alerts logged.</div>}
            {activeAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className={`alert-item severity-${alert.severity.toLowerCase()}`}>
                <div className="alert-sev-badge">{alert.severity}</div>
                <div className="alert-body">
                  <div className="alert-type">{alert.type}</div>
                  <div className="alert-desc">{alert.description.slice(0, 70)}...</div>
                  <div className="alert-meta">
                    {alert.tigerId && <span>Tiger: {alert.tigerId}</span>}
                    <span>Camera: {alert.cameraId}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Individual Tigers */}
        <div className="dash-card span-2">
          <div className="card-title-row">
            <h3>🔍 Enrolled Individual Tigers</h3>
            <span className="card-badge">{tigerProfiles.length} Tigers</span>
          </div>
          {tigerProfiles.length > 0 ? (
            <div className="tiger-overview-list">
              {tigerProfiles.map(t => (
                <div key={t.id} className="tiger-overview-item" style={{ borderLeftColor: t.color }}>
                  <div className="tov-header">
                    <span className="tov-emoji">🐅</span>
                    <div>
                      <div className="tov-name">{t.name}</div>
                      <div className="tov-id">{t.id} · {t.gender}</div>
                    </div>
                    <div className="tov-zone">{t.zone} · <strong className="green font-mono">{t.estimatedAreaKm2} km²</strong></div>
                  </div>
                  <div className="tov-meta">
                    <span>📷 Station: {t.lastCamera}</span>
                    <span>📊 {t.observationCount} obs</span>
                    <span className={t.movementStatus.includes('boundary') ? 'tov-warn' : ''}>{t.movementStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-section-text font-mono">No real individual tigers enrolled yet. Use AI Triage or Human Review to enroll real tiger sightings.</div>
          )}
        </div>
      </div>

      <style>{`
        .pg-page { padding: 20px 24px; overflow-y: auto; height: 100%; }

        .full-demo-banner { display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; border-radius: 10px; margin-bottom: 12px; }
        .full-demo-banner.real { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); }
        .full-demo-banner.demo { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); }

        .banner-info { display: flex; align-items: center; gap: 12px; }
        .proto-badge { padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 10px; }
        .proto-badge.real { background: rgba(16,185,129,0.2); color: #34d399; }
        .proto-badge.demo { background: rgba(245,158,11,0.2); color: #fbbf24; }
        .banner-title { font-size: 13px; font-weight: 700; color: var(--text-bright); }

        .run-full-demo-btn { padding: 8px 16px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 6px; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; }
        .run-full-demo-btn.alt { background: rgba(245,158,11,0.2); border: 1px solid rgba(245,158,11,0.4); color: #fbbf24; }

        .backend-notice-bar { display: flex; align-items: center; gap: 10px; padding: 8px 14px; border-radius: 8px; font-size: 11px; margin-bottom: 16px; font-family: var(--font-mono); }
        .backend-notice-bar.online { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25); color: #34d399; }
        .backend-notice-bar.offline { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: #f87171; }

        .real-empty-banner { background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 10px; padding: 16px; display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
        .real-empty-banner .empty-icon { font-size: 28px; }
        .real-empty-banner p { margin: 4px 0 0 0; font-size: 11px; color: var(--text-dim); }

        .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
        .kpi-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 6px; }
        .kpi-icon { font-size: 20px; }
        .kpi-value { font-size: 22px; font-weight: 800; font-family: var(--font-mono); }
        .kpi-label { font-size: 10px; color: var(--text-dim); font-weight: 500; }

        .export-toolbar { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 8px; margin-bottom: 20px; }
        .exp-label { font-size: 11px; color: var(--text-dim); font-weight: 600; }
        .exp-btn { padding: 4px 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: var(--text-main); font-size: 11px; border-radius: 4px; cursor: pointer; }
        .exp-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .dash-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .dash-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 18px; }
        .dash-card.span-2 { grid-column: span 2; }

        .card-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .card-title-row h3 { font-size: 14px; font-weight: 600; color: var(--text-bright); margin: 0; }
        .card-badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; background: rgba(16,185,129,0.12); color: #34d399; font-weight: 600; }

        .camera-mini-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .cam-mini-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 10px; }
        .cam-mini-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
        .status-dot { width: 7px; height: 7px; border-radius: 50%; }
        .status-dot.online { background: #10b981; } .status-dot.offline { background: #ef4444; }
        .cam-mini-id { font-size: 12px; font-weight: 700; color: var(--text-bright); font-family: var(--font-mono); }
        .cam-status-tag { font-size: 9px; font-weight: 600; padding: 1px 5px; border-radius: 3px; margin-left: auto; }
        .cam-mini-loc { font-size: 10px; color: var(--text-dim); margin-bottom: 6px; }
        .cam-mini-meta { font-size: 10px; color: var(--text-muted); display: flex; gap: 8px; }

        .detection-list { display: flex; flex-direction: column; gap: 8px; }
        .detection-item { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 10px; }
        .det-header { display: flex; align-items: center; gap: 10px; }
        .det-emoji { font-size: 22px; }
        .det-tiger { font-size: 13px; font-weight: 600; color: var(--text-bright); }
        .det-cam { font-size: 10px; color: var(--text-dim); }
        .det-conf { margin-left: auto; text-align: right; }
        .conf-value { font-size: 16px; font-weight: 800; color: #10b981; font-family: var(--font-mono); }
        .conf-label { font-size: 9px; color: var(--text-dim); }
        .det-time { font-size: 10px; color: var(--text-dim); margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.05); }

        .alert-list { display: flex; flex-direction: column; gap: 8px; }
        .alert-item { display: flex; gap: 10px; padding: 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; }
        .alert-sev-badge { font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; height: fit-content; }
        .severity-high .alert-sev-badge { background: rgba(239,68,68,0.15); color: #f87171; }

        .tiger-overview-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .tiger-overview-item { padding: 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-left: 3px solid; border-radius: 8px; }
        .tov-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .tov-emoji { font-size: 20px; }
        .tov-name { font-size: 13px; font-weight: 600; color: var(--text-bright); }
        .tov-id { font-size: 10px; color: var(--text-dim); }
        .tov-zone { margin-left: auto; font-size: 11px; color: var(--text-muted); }
        .tov-meta { font-size: 10px; color: var(--text-dim); display: flex; gap: 10px; flex-wrap: wrap; }
        .tov-warn { color: #f87171; font-weight: 600; }
        .green { color: #10b981; }

        .empty-section-text { padding: 24px; text-align: center; color: var(--text-dim); font-size: 11px; background: rgba(255,255,255,0.01); border-radius: 6px; }

        @media (max-width: 1200px) {
          .kpi-row { grid-template-columns: repeat(2, 1fr); }
          .dash-grid { grid-template-columns: 1fr; }
          .dash-card.span-2 { grid-column: span 1; }
          .tiger-overview-list { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function KPICard({ icon, label, value, accent }) {
  return (
    <div className="kpi-card">
      <span className="kpi-icon">{icon}</span>
      <span className="kpi-value" style={{ color: accent }}>{value}</span>
      <span className="kpi-label">{label}</span>
    </div>
  );
}
