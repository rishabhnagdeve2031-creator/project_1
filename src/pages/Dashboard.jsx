import React from 'react';
import { useAppContext } from '../context/AppContext';

export default function Dashboard() {
  const { kpi, alerts, observations, cameras, tigerProfiles } = useAppContext();

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const recentObs = observations.slice(0, 5);
  const onlineCameras = cameras.filter(c => c.status === 'online');

  return (
    <div className="pg-page">
      {/* Prototype Banner */}
      <div className="proto-banner">
        <span className="proto-badge">PROTOTYPE DATA</span>
        <span>PenchGuard AI — Pench Tiger Reserve Demo Dashboard</span>
      </div>

      {/* KPI Row */}
      <div className="kpi-row">
        <KPICard icon="📷" label="Cameras Online" value={`${kpi.camerasOnline} / ${kpi.camerasTotal}`} accent="#10b981" />
        <KPICard icon="🖼" label="Images Processed" value={kpi.imagesProcessed.toLocaleString()} accent="#3b82f6" />
        <KPICard icon="🐅" label="Tigers Detected" value={kpi.tigersDetected} accent="#f97316" />
        <KPICard icon="🔍" label="Individual Tigers" value={kpi.individualTigers} accent="#8b5cf6" />
        <KPICard icon="🚨" label="Active Alerts" value={kpi.activeAlerts} accent={kpi.activeAlerts > 0 ? '#ef4444' : '#10b981'} />
        <KPICard icon="⚠" label="High-Risk Zones" value={kpi.highRiskZones} accent="#f59e0b" />
      </div>

      <div className="dash-grid">
        {/* Live Camera Activity */}
        <div className="dash-card span-2">
          <div className="card-title-row">
            <h3>📷 Live Camera Activity</h3>
            <span className="card-badge">{onlineCameras.length} Online</span>
          </div>
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
                      <div className="det-tiger">{tiger?.name || obs.tigerId}</div>
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
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="dash-card">
          <div className="card-title-row">
            <h3>🚨 Active Alerts</h3>
            <span className="card-badge alert-badge">{activeAlerts.length} Active</span>
          </div>
          <div className="alert-list">
            {activeAlerts.length === 0 && <div className="empty-state">No active alerts</div>}
            {activeAlerts.slice(0, 4).map(alert => (
              <div key={alert.id} className={`alert-item severity-${alert.severity.toLowerCase()}`}>
                <div className="alert-sev-badge">{alert.severity}</div>
                <div className="alert-body">
                  <div className="alert-type">{alert.type}</div>
                  <div className="alert-desc">{alert.description.slice(0, 80)}...</div>
                  <div className="alert-meta">
                    {alert.tigerId && <span>Tiger: {alert.tigerId}</span>}
                    <span>Camera: {alert.cameraId}</span>
                    <span>{alert.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tiger Overview */}
        <div className="dash-card">
          <div className="card-title-row">
            <h3>🔍 Individual Tigers Identified</h3>
            <span className="card-badge">{tigerProfiles.length} Tigers</span>
          </div>
          <div className="tiger-overview-list">
            {tigerProfiles.map(t => (
              <div key={t.id} className="tiger-overview-item" style={{ borderLeftColor: t.color }}>
                <div className="tov-header">
                  <span className="tov-emoji">🐅</span>
                  <div>
                    <div className="tov-name">{t.name}</div>
                    <div className="tov-id">{t.id} · {t.gender}</div>
                  </div>
                  <div className="tov-zone">{t.zone}</div>
                </div>
                <div className="tov-meta">
                  <span>📷 {t.lastCamera}</span>
                  <span>📊 {t.observationCount} obs</span>
                  <span className={t.movementStatus.includes('boundary') ? 'tov-warn' : ''}>{t.movementStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .pg-page {
          padding: 20px 24px;
          overflow-y: auto;
          height: 100%;
        }

        .proto-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: 8px;
          font-size: 12px;
          color: #fbbf24;
          margin-bottom: 20px;
        }
        .proto-badge {
          background: rgba(245, 158, 11, 0.2);
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.5px;
        }

        .kpi-row {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .kpi-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all 0.2s;
        }
        .kpi-card:hover {
          border-color: rgba(255,255,255,0.12);
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }
        .kpi-icon { font-size: 22px; }
        .kpi-value {
          font-size: 26px;
          font-weight: 800;
          font-family: var(--font-mono);
          letter-spacing: -0.5px;
        }
        .kpi-label {
          font-size: 11px;
          color: var(--text-dim);
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        .dash-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .dash-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          padding: 18px;
        }
        .dash-card.span-2 { grid-column: span 2; }

        .card-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .card-title-row h3 {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-bright);
          margin: 0;
        }
        .card-badge {
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 20px;
          background: rgba(16, 185, 129, 0.12);
          color: #34d399;
          font-weight: 600;
        }
        .alert-badge {
          background: rgba(239, 68, 68, 0.12);
          color: #f87171;
        }

        /* Camera mini grid */
        .camera-mini-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .cam-mini-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          padding: 10px;
          transition: all 0.2s;
        }
        .cam-mini-card:hover { border-color: rgba(255,255,255,0.12); }
        .cam-mini-card.offline { opacity: 0.5; }
        .cam-mini-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
        .status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .status-dot.online { background: #10b981; box-shadow: 0 0 6px #10b98188; }
        .status-dot.offline { background: #ef4444; }
        .cam-mini-id { font-size: 12px; font-weight: 700; color: var(--text-bright); font-family: var(--font-mono); }
        .cam-status-tag { font-size: 9px; font-weight: 600; padding: 1px 5px; border-radius: 3px; margin-left: auto; }
        .cam-status-tag.online { background: rgba(16,185,129,0.15); color: #34d399; }
        .cam-status-tag.offline { background: rgba(239,68,68,0.15); color: #f87171; }
        .cam-mini-loc { font-size: 10px; color: var(--text-dim); margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .cam-mini-meta { font-size: 10px; color: var(--text-muted); display: flex; gap: 8px; }

        /* Detection list */
        .detection-list { display: flex; flex-direction: column; gap: 8px; }
        .detection-item {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          padding: 10px;
        }
        .det-header { display: flex; align-items: center; gap: 10px; }
        .det-emoji { font-size: 22px; }
        .det-tiger { font-size: 13px; font-weight: 600; color: var(--text-bright); }
        .det-cam { font-size: 10px; color: var(--text-dim); }
        .det-conf { margin-left: auto; text-align: right; }
        .conf-value { font-size: 16px; font-weight: 800; color: #10b981; font-family: var(--font-mono); }
        .conf-label { font-size: 9px; color: var(--text-dim); }
        .det-time { font-size: 10px; color: var(--text-dim); margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.05); }

        /* Alert list */
        .alert-list { display: flex; flex-direction: column; gap: 8px; }
        .empty-state { font-size: 13px; color: var(--text-dim); text-align: center; padding: 20px; }
        .alert-item {
          display: flex;
          gap: 10px;
          padding: 10px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
        }
        .alert-sev-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
          letter-spacing: 0.5px;
          white-space: nowrap;
          height: fit-content;
        }
        .severity-high .alert-sev-badge { background: rgba(239,68,68,0.15); color: #f87171; }
        .severity-medium .alert-sev-badge { background: rgba(245,158,11,0.15); color: #fbbf24; }
        .severity-low .alert-sev-badge { background: rgba(59,130,246,0.15); color: #60a5fa; }
        .alert-body { flex: 1; min-width: 0; }
        .alert-type { font-size: 12px; font-weight: 600; color: var(--text-bright); margin-bottom: 2px; }
        .alert-desc { font-size: 11px; color: var(--text-muted); margin-bottom: 6px; }
        .alert-meta { font-size: 10px; color: var(--text-dim); display: flex; gap: 10px; flex-wrap: wrap; }

        /* Tiger overview */
        .tiger-overview-list { display: flex; flex-direction: column; gap: 8px; }
        .tiger-overview-item {
          padding: 10px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-left: 3px solid;
          border-radius: 8px;
        }
        .tov-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .tov-emoji { font-size: 20px; }
        .tov-name { font-size: 13px; font-weight: 600; color: var(--text-bright); }
        .tov-id { font-size: 10px; color: var(--text-dim); }
        .tov-zone { margin-left: auto; font-size: 11px; color: var(--text-muted); }
        .tov-meta { font-size: 10px; color: var(--text-dim); display: flex; gap: 10px; flex-wrap: wrap; }
        .tov-warn { color: #f87171; font-weight: 600; }

        @media (max-width: 1200px) {
          .kpi-row { grid-template-columns: repeat(3, 1fr); }
          .dash-grid { grid-template-columns: 1fr 1fr; }
          .dash-card.span-2 { grid-column: span 2; }
          .camera-mini-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .kpi-row { grid-template-columns: repeat(2, 1fr); }
          .dash-grid { grid-template-columns: 1fr; }
          .dash-card.span-2 { grid-column: span 1; }
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
