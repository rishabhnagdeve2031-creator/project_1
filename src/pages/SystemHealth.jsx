import React from 'react';
import { useAppContext } from '../context/AppContext';

export default function SystemHealth() {
  const {
    isRealMode,
    backendStatus,
    cameras,
    observations,
    alerts,
    auditLog,
    kpi
  } = useAppContext();

  const activeCameras = cameras.filter(c => c.status === 'online').length;
  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
  const recentLogs = auditLog.slice(0, 8);

  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">System Health</h2>
          <p className="page-subtitle">
            {isRealMode
              ? 'Real Data Mode — Live local backend and telemetry status'
              : 'Demo Mode — Infrastructure and pipeline status'}
          </p>
        </div>
      </div>

      <div className="system-grid">
        <HealthCard
          title="AI Inference Engine"
          status={backendStatus.connected ? `Online (${backendStatus.model_name || 'best.pt'})` : 'Offline (Server Disconnected)'}
          isOnline={backendStatus.connected}
          latency={backendStatus.connected ? '42 ms' : 'N/A'}
          subtitle={backendStatus.connected ? `Device: ${backendStatus.device || 'CPU'} | Ultralytics PyTorch` : 'Start server.py to connect local model'}
          icon="🧠"
        />

        <HealthCard
          title="Camera Trap Network"
          status={`${activeCameras} / ${cameras.length} Active`}
          isOnline={activeCameras > 0 || cameras.length === 0}
          latency={isRealMode ? 'Live Sync' : '120 ms'}
          subtitle={isRealMode ? 'Parsed Camera Trap Stations' : 'Simulated Network Grid'}
          icon="📡"
        />

        <HealthCard
          title="System Pipeline Mode"
          status={isRealMode ? 'Real Data Mode' : 'Demo Mode'}
          isOnline={true}
          latency={isRealMode ? 'Active' : 'Presentation'}
          subtitle={isRealMode ? 'Real Camera Trap Upload & Detection Engine' : 'Sample Demonstration Preset Data'}
          icon="⚙"
        />

        <HealthCard
          title="Telemetry & Audit Log Bus"
          status={`${auditLog.length} Events Logged`}
          isOnline={true}
          latency="2 ms"
          subtitle="Audit Trail & Action Log Datastore"
          icon="⚡"
        />

        <HealthCard
          title="Alert & Geofence Processor"
          status={`${activeAlertsCount} Active Alerts`}
          isOnline={true}
          latency="5 ms"
          subtitle="Spatial Deviation & Boundary Breach Monitor"
          icon="🚨"
        />

        <HealthCard
          title="Observations Datastore"
          status={`${observations.length} Sightings Logged`}
          isOnline={true}
          latency="8 ms"
          subtitle={`${kpi.imagesProcessed || 0} Total Images Processed`}
          icon="💾"
        />
      </div>

      <div className="system-detail-box">
        <h4>Subsystem Event & Audit Log Stream</h4>
        <div className="log-window font-mono">
          {recentLogs.length > 0 ? (
            recentLogs.map((log, idx) => (
              <div key={log.id || idx}>
                [{log.timestamp}] [{log.actor || 'System'}] {log.title}: {log.details}
              </div>
            ))
          ) : (
            <div>[INFO] Real Data Mode initialized. Awaiting camera trap uploads.</div>
          )}
        </div>
      </div>

      <style>{`
        .pg-page { padding: 20px 24px; overflow-y: auto; height: 100%; }
        .page-header { margin-bottom: 20px; }
        .page-title { font-size: 20px; font-weight: 700; color: var(--text-bright); margin: 0 0 4px 0; }
        .page-subtitle { font-size: 12px; color: var(--text-dim); margin: 0; }

        .system-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }

        .health-card {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: 12px; padding: 18px; display: flex; gap: 14px; align-items: flex-start;
        }

        .h-icon { font-size: 28px; }
        .h-body { flex: 1; }
        .h-title { font-size: 14px; font-weight: 700; color: var(--text-bright); margin: 0 0 2px 0; }
        .h-sub { font-size: 10px; color: var(--text-dim); margin-bottom: 10px; }

        .h-status-row { display: flex; justify-content: space-between; align-items: center; }
        .status-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
        .status-badge.online { background: rgba(16,185,129,0.15); color: #34d399; }
        .status-badge.offline { background: rgba(239,68,68,0.15); color: #f87171; }
        .latency { font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); }

        .system-detail-box {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: 12px; padding: 18px;
        }
        .system-detail-box h4 { font-size: 13px; font-weight: 700; color: var(--text-bright); margin: 0 0 12px 0; }

        .log-window {
          background: #000; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px; padding: 12px; font-size: 11px; color: #34d399; display: flex; flex-direction: column; gap: 6px;
        }

        @media (max-width: 900px) {
          .system-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function HealthCard({ title, status, isOnline = true, latency, subtitle, icon }) {
  return (
    <div className="health-card">
      <span className="h-icon">{icon}</span>
      <div className="h-body">
        <h4 className="h-title">{title}</h4>
        <div className="h-sub">{subtitle}</div>
        <div className="h-status-row">
          <span className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
            ● {status}
          </span>
          <span className="latency">{latency}</span>
        </div>
      </div>
    </div>
  );
}
