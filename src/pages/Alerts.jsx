import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function Alerts() {
  const { alerts, acknowledgeAlert, resolveAlert } = useAppContext();
  const [filterSeverity, setFilterSeverity] = useState('all');

  const filtered = filterSeverity === 'all'
    ? alerts
    : alerts.filter(a => a.severity.toLowerCase() === filterSeverity.toLowerCase());

  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">🚨 Real-Time Risk & Movement Alerts</h2>
          <p className="page-subtitle">Automated Boundary Breach & Spatial Proximity Alerts</p>
        </div>
        <div className="severity-filter-pills">
          {['all', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
            <button
              key={sev}
              className={`sev-pill ${filterSeverity === sev ? 'active' : ''}`}
              onClick={() => setFilterSeverity(sev)}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div className="alerts-layout">
        {/* Main Alert Feed */}
        <div className="alert-feed">
          {filtered.map(alert => (
            <div key={alert.id} className={`alert-card severity-${alert.severity.toLowerCase()}`}>
              <div className="card-top">
                <span className={`sev-badge ${alert.severity.toLowerCase()}`}>{alert.severity} PRIORITY</span>
                <span className="alert-time">{alert.timestamp}</span>
                <span className={`status-tag ${alert.status}`}>{alert.status.toUpperCase()}</span>
              </div>

              <h4 className="alert-title">{alert.type} — {alert.location}</h4>
              <p className="alert-desc">{alert.description}</p>

              <div className="alert-meta-bar">
                {alert.tigerId && <span className="meta-chip">🐅 Tiger: <strong>{alert.tigerId}</strong></span>}
                <span className="meta-chip">📷 Station: <strong>{alert.cameraId}</strong></span>
                <span className="meta-chip">📍 Coords: <strong>{alert.lat?.toFixed(4)}°N, {alert.lng?.toFixed(4)}°E</strong></span>
              </div>

              <div className="card-actions">
                {alert.status === 'active' && (
                  <button className="act-btn ack" onClick={() => acknowledgeAlert(alert.id)}>
                    ✓ Acknowledge Alert
                  </button>
                )}
                {alert.status !== 'resolved' && (
                  <button className="act-btn res" onClick={() => resolveAlert(alert.id)}>
                    ✓ Mark Resolved
                  </button>
                )}
                <span className="alert-id-tag font-mono">{alert.id}</span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="empty-alerts">No alerts matching filter criteria.</div>
          )}
        </div>

        {/* Demo Automated Notification Dispatcher */}
        <div className="notification-panel">
          <h3>📡 Automated Notification Workflow</h3>
          <p className="panel-sub">Simulated SMS & Push Alert Transmission</p>

          <div className="notif-card forest-officer">
            <div className="notif-header">
              <span className="icon">🛡️</span>
              <div>
                <h5>Forest Officer Notification</h5>
                <span className="target">Pench Reserve Command Control</span>
              </div>
            </div>
            <div className="notif-body font-mono">
              [ALERT] TGR-07 Kali detected @ CT-014 Boundary Zone B. High risk of human-wildlife conflict. Response team dispatched.
            </div>
            <div className="notif-footer">
              <span className="status-sent">✓ Dispatched via Satellite Mesh</span>
            </div>
          </div>

          <div className="notif-card village-safety">
            <div className="notif-header">
              <span className="icon">📢</span>
              <div>
                <h5>Village Safety Advisory</h5>
                <span className="target">Pench Border Community Broadcast</span>
              </div>
            </div>
            <div className="notif-body font-mono">
              [ADVISORY] Tiger movement detected within 500m of Zone B border. Livestock owners please keep herds secured.
            </div>
            <div className="notif-footer">
              <span className="status-sent">✓ Broadcast via Local SMS Gate</span>
            </div>
          </div>

          <div className="proto-notice">
            ℹ️ <strong>Prototype Notification System:</strong> Demonstrating automated escalation logic. No real emergency messages are dispatched.
          </div>
        </div>
      </div>

      <style>{`
        .pg-page { padding: 20px 24px; overflow-y: auto; height: 100%; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .page-title { font-size: 20px; font-weight: 700; color: var(--text-bright); margin: 0 0 4px 0; }
        .page-subtitle { font-size: 12px; color: var(--text-dim); margin: 0; }

        .severity-filter-pills { display: flex; gap: 6px; }
        .sev-pill {
          padding: 5px 12px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03); color: var(--text-muted); font-size: 11px; cursor: pointer;
          transition: all 0.2s; font-weight: 600;
        }
        .sev-pill.active { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #f87171; }

        .alerts-layout { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }

        .alert-feed { display: flex; flex-direction: column; gap: 14px; }

        .alert-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-left: 4px solid;
          border-radius: 10px;
          padding: 16px;
        }
        .severity-high { border-left-color: #ef4444; }
        .severity-medium { border-left-color: #f59e0b; }
        .severity-low { border-left-color: #3b82f6; }

        .card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .sev-badge { font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px; }
        .sev-badge.high { background: rgba(239,68,68,0.2); color: #f87171; }
        .sev-badge.medium { background: rgba(245,158,11,0.2); color: #fbbf24; }
        .sev-badge.low { background: rgba(59,130,246,0.2); color: #60a5fa; }

        .alert-time { font-size: 11px; color: var(--text-dim); margin-left: auto; }
        .status-tag { font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 3px; }
        .status-tag.active { background: rgba(239,68,68,0.15); color: #f87171; }
        .status-tag.acknowledged { background: rgba(245,158,11,0.15); color: #fbbf24; }
        .status-tag.resolved { background: rgba(16,185,129,0.15); color: #34d399; }

        .alert-title { font-size: 14px; font-weight: 700; color: var(--text-bright); margin: 0 0 6px 0; }
        .alert-desc { font-size: 12px; color: var(--text-muted); margin: 0 0 12px 0; line-height: 1.4; }

        .alert-meta-bar { display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
        .meta-chip { font-size: 11px; color: var(--text-dim); background: rgba(255,255,255,0.03); padding: 3px 8px; border-radius: 4px; }
        .meta-chip strong { color: var(--text-main); }

        .card-actions { display: flex; align-items: center; gap: 8px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; }
        .act-btn {
          padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; border: none; transition: background 0.2s;
        }
        .act-btn.ack { background: rgba(245,158,11,0.2); color: #fbbf24; }
        .act-btn.ack:hover { background: rgba(245,158,11,0.3); }
        .act-btn.res { background: rgba(16,185,129,0.2); color: #34d399; }
        .act-btn.res:hover { background: rgba(16,185,129,0.3); }
        .alert-id-tag { margin-left: auto; font-size: 10px; color: var(--text-dim); }

        .empty-alerts { text-align: center; padding: 40px; color: var(--text-dim); font-size: 13px; }

        /* Notification Panel */
        .notification-panel {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .notification-panel h3 { font-size: 14px; font-weight: 700; color: var(--text-bright); margin: 0; }
        .panel-sub { font-size: 11px; color: var(--text-dim); margin: -8px 0 0 0; }

        .notif-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px;
          padding: 12px;
        }
        .notif-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .notif-header .icon { font-size: 18px; }
        .notif-header h5 { font-size: 12px; font-weight: 700; color: var(--text-bright); margin: 0; }
        .notif-header .target { font-size: 10px; color: var(--text-dim); }

        .notif-body { font-size: 11px; color: #cbd5e1; background: #000; padding: 8px; border-radius: 6px; margin-bottom: 8px; line-height: 1.3; }
        .notif-footer { font-size: 10px; color: #34d399; font-weight: 600; }

        .proto-notice { font-size: 10px; color: var(--text-dim); background: rgba(255,255,255,0.02); padding: 8px; border-radius: 6px; }

        @media (max-width: 900px) {
          .alerts-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
