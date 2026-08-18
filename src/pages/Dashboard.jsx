import React from 'react';
import { useAppContext } from '../context/AppContext';

export default function Dashboard() {
  const {
    isRealMode,
    kpi,
    alerts,
    observations,
  } = useAppContext();

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const recentObs = observations.slice(0, 5);

  return (
    <div className="pg-page">

      {/* Real vs Demo Empty State Check */}
      {isRealMode && kpi.imagesProcessed === 0 && (
        <div className="real-empty-banner" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20, margin: '16px 0', display: 'flex', gap: 16, alignItems: 'center' }}>
          <span className="empty-icon" style={{ fontSize: 32 }}>📊</span>
          <div className="empty-text font-mono" style={{ fontSize: 12 }}>
            <strong style={{ color: '#34d399' }}>Database initialized — awaiting camera trap uploads</strong>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8' }}>
              Upload folders or images in <strong>Batch Processing</strong> or <strong>AI Triage</strong> to populate detections, tiger observations, and spatial movement telemetry.
            </p>
          </div>
        </div>
      )}

      {/* KPI Row */}
      <div className="kpi-grid">
        <div className="kpi-card highlight">
          <div className="kpi-icon">🐅</div>
          <div className="kpi-body">
            <span className="kpi-val font-mono">{kpi.tigerDetections}</span>
            <span className="kpi-label">Tiger Detections</span>
            <span className="kpi-sub">
              {kpi.individualTigers} Identified Individuals ({kpi.pendingHumanReviews} Pending Review)
            </span>
          </div>
        </div>


        <div className="kpi-card">
          <div className="kpi-icon">📷</div>
          <div className="kpi-body">
            <span className="kpi-val font-mono">{kpi.imagesProcessed}</span>
            <span className="kpi-label">Total Images Scanned</span>
            <span className="kpi-sub">
              {kpi.usefulImages} Useful ({kpi.blankImages} Blanks Quarantined)
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">💾</div>
          <div className="kpi-body">
            <span className="kpi-val font-mono">{kpi.storageSavedGb} GB</span>
            <span className="kpi-label">Storage Saved (Blanks)</span>
            <span className="kpi-sub">
              Reversible Safe Quarantine
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">🚨</div>
          <div className="kpi-body">
            <span className="kpi-val font-mono red">{activeAlerts.length}</span>
            <span className="kpi-label">Active Movement Alerts</span>
            <span className="kpi-sub">
              Explainable Deviation Engine
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Sightings & Active Alerts */}
      <div className="dashboard-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginTop: 20 }}>
        {/* Recent Sightings */}
        <div className="dash-panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-bright)' }}>
              📷 Recent Tiger Sightings
            </h3>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{observations.length} Total</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentObs.map(obs => (
              <div key={obs.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>🐅</span>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#f97316' }}>{obs.tiger_id || obs.tigerId || 'UNIDENTIFIED'}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{obs.camera_id || obs.cameraId} · {obs.timestamp}</div>
                  </div>
                </div>
                <div className="font-mono" style={{ color: '#10b981', fontWeight: 'bold' }}>
                  {obs.confidence}% YOLO
                </div>
              </div>
            ))}

            {recentObs.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 12 }}>
                No sightings recorded in SQLite database yet.
              </div>
            )}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="dash-panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-bright)' }}>
              🚨 Active Spatial Deviation Alerts
            </h3>
            <span style={{ fontSize: 11, color: '#f87171' }}>{activeAlerts.length} Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeAlerts.slice(0, 4).map(alert => (
              <div key={alert.id} style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ color: '#f87171' }}>{alert.alert_type || alert.type}</strong>
                  <span style={{ color: '#94a3b8' }}>{alert.created_at || alert.timestamp}</span>
                </div>
                <div style={{ color: '#cbd5e1' }}>{alert.what_changed || alert.description}</div>
              </div>
            ))}

            {activeAlerts.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 12 }}>
                No active movement deviations detected. All tigers within historical baseline.
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .pg-page { padding: 20px 24px; overflow-y: auto; height: 100%; }
        .full-demo-banner { display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; border-radius: 10px; margin-bottom: 14px; }
        .full-demo-banner.real { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.3); }
        .full-demo-banner.demo { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.3); }
        .banner-info { display: flex; align-items: center; gap: 12px; }
        .banner-title { font-size: 12px; color: var(--text-bright); font-weight: 500; }
        .proto-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; }
        .proto-badge.real { background: rgba(16,185,129,0.2); color: #34d399; }
        .proto-badge.demo { background: rgba(245,158,11,0.2); color: #fbbf24; }
        .run-full-demo-btn { padding: 6px 14px; border-radius: 6px; border: none; font-size: 11px; font-weight: 700; cursor: pointer; }
        .run-full-demo-btn.alt { background: rgba(255,255,255,0.06); color: var(--text-main); border: 1px solid rgba(255,255,255,0.1); }

        .backend-notice-bar { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 6px; font-size: 11px; margin-bottom: 18px; }
        .backend-notice-bar.online { background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.2); color: #34d399; }
        .backend-notice-bar.offline { background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2); color: #f87171; }

        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .kpi-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 18px; display: flex; gap: 14px; align-items: center; }
        .kpi-card.highlight { border-color: rgba(16,185,129,0.3); background: linear-gradient(135deg, rgba(16,185,129,0.05), rgba(4,120,87,0.05)); }
        .kpi-icon { font-size: 32px; }
        .kpi-body { display: flex; flex-direction: column; gap: 2px; }
        .kpi-val { font-size: 24px; font-weight: 800; color: var(--text-bright); }
        .kpi-val.red { color: #f87171; }
        .kpi-label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
        .kpi-sub { font-size: 10px; color: var(--text-dim); }

        @media (max-width: 900px) {
          .kpi-grid { grid-template-columns: 1fr 1fr; }
          .dashboard-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

