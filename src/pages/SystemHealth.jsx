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
    kpi,
    quarantine,
    tigerProfiles
  } = useAppContext();

  const isConnected = backendStatus.connected;
  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
  const recentLogs = auditLog.slice(0, 8);

  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">System Health & Offline Telemetry</h2>
          <p className="page-subtitle">
            {isRealMode
              ? 'Real-time local backend, PyTorch YOLO engine, and SQLite datastore status'
              : 'Demo Mode — Presentation infrastructure status'}
          </p>
        </div>
        <div className={`proto-badge ${isRealMode ? 'real' : 'demo'}`}>
          {isRealMode ? 'LOCAL OFFLINE MVP' : 'DEMO MODE'}
        </div>
      </div>

      <div className="system-grid">
        {/* 1. YOLO AI Model */}
        <HealthCard
          title="YOLOv8 AI Inference Engine"
          status={isConnected ? `Online (${backendStatus.model_name || 'best.pt'})` : 'Offline'}
          isOnline={isConnected}
          latency={isConnected ? '42 ms' : 'N/A'}
          subtitle={isConnected ? `Device: ${backendStatus.device || 'CPU'} | Class: Tiger` : 'Start server.py to connect YOLO'}
          icon="🧠"
        />

        {/* 2. SQLite Database */}
        <HealthCard
          title="Persistent SQLite Datastore"
          status={isConnected ? 'Online (data/penchguard.db)' : 'Disconnected'}
          isOnline={isConnected}
          latency={isConnected ? '1 ms' : 'N/A'}
          subtitle={isConnected ? `${observations.length} Observations · ${tigerProfiles.length} Tigers · ${quarantine.length} Quarantined` : 'SQLite local database'}
          icon="💾"
        />

        {/* 3. Camera Trap Mesh */}
        <HealthCard
          title="Camera Trap Station Mesh"
          status={`${cameras.length} Stations Active`}
          isOnline={cameras.length > 0}
          latency="Live Sync"
          subtitle={isRealMode ? 'Parsed Station Network' : 'Simulated Grid'}
          icon="📡"
        />

        {/* 4. Safe Quarantine Storage */}
        <HealthCard
          title="Safe Quarantine Store"
          status={`${quarantine.length} Images Quarantined`}
          isOnline={true}
          latency="Local File System"
          subtitle={`${kpi.storageSavedGb || 0} GB Storage Saved via Reversible Blank Triage`}
          icon="🛡"
        />

        {/* 5. Deviation Engine */}
        <HealthCard
          title="Spatial Deviation Engine"
          status={`${activeAlertsCount} Active Alerts`}
          isOnline={true}
          latency="5 ms"
          subtitle="Core: 15km / Buffer: 5km Thresholds"
          icon="🚨"
        />

        {/* 6. Audit Trail */}
        <HealthCard
          title="Audit Trail Event Bus"
          status={`${auditLog.length} Events Logged`}
          isOnline={true}
          latency="Local Log"
          subtitle="Full Human & AI Decision Accountability"
          icon="⚡"
        />
      </div>

      <div className="system-detail-box">
        <h4>Recent System Audit Trail Stream</h4>
        <div className="log-window font-mono">
          {recentLogs.length > 0 ? (
            recentLogs.map((log, idx) => (
              <div key={log.id || idx}>
                [{log.timestamp}] [{log.actor || 'System'}] {log.action || log.title}: {log.details}
              </div>
            ))
          ) : (
            <div>[INFO] System initialized. Awaiting camera trap uploads and inference actions.</div>
          )}
        </div>
      </div>

      <style>{`
        .pg-page { padding: 20px 24px; overflow-y: auto; height: 100%; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .page-title { font-size: 20px; font-weight: 700; color: var(--text-bright); margin: 0 0 4px 0; }
        .page-subtitle { font-size: 12px; color: var(--text-dim); margin: 0; }

        .proto-badge { font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 4px; }
        .proto-badge.real { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #34d399; }
        .proto-badge.demo { background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #fbbf24; }

        .system-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }

        .health-card {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: 12px; padding: 18px; display: flex; gap: 14px; align-items: flex-start;
        }

        .h-icon { font-size: 28px; }
        .h-body { flex: 1; }
        .h-title { font-size: 13px; font-weight: 700; color: var(--text-bright); margin: 0 0 2px 0; }
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
          max-height: 200px; overflow-y: auto;
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
