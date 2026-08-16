import React from 'react';

export default function SystemHealth() {
  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">⚙ System Health & Pipeline Monitor</h2>
          <p className="page-subtitle">Pench Tiger Reserve Infrastructure & Telemetry Subsystems</p>
        </div>
      </div>

      <div className="system-grid">
        <HealthCard title="AI Inference Engine" status="Online" latency="42 ms" subtitle="YOLOv8 / Feature Matching Service" icon="🧠" />
        <HealthCard title="Camera Mesh Network" status="18 / 20 Active" latency="120 ms" subtitle="LoRaWAN / Cellular Gateway" icon="📡" />
        <HealthCard title="Telemetry Event Bus" status="Online" latency="2 ms" subtitle="TelemetryService Singleton Bus" icon="⚡" />
        <HealthCard title="Alert Escalation Engine" status="Online" latency="5 ms" subtitle="Rule-Based Geofence Processor" icon="🚨" />
        <HealthCard title="Geospatial Map Service" status="Online" latency="18 ms" subtitle="Leaflet OpenStreetMap Tiles" icon="🗺" />
        <HealthCard title="Database & Storage" status="Connected" latency="8 ms" subtitle="Observation & Telemetry Datastore" icon="💾" />
      </div>

      <div className="system-detail-box">
        <h4>🔍 Subsystem Log Stream</h4>
        <div className="log-window font-mono">
          <div>[10:42:01] [INFO] TelemetryService: Ticket processed for TGR-07 Kali.</div>
          <div>[10:42:02] [ALERT] GeofenceEngine: Boundary breach detected at CT-014 (Boundary Zone B).</div>
          <div>[10:42:02] [NOTIF] NotificationDispatcher: Alert ALT-001 queued for broadcast.</div>
          <div>[10:42:05] [SYS] SimulationEngine: Step tick executed successfully. 4 animals tracked.</div>
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
        .status-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: rgba(16,185,129,0.15); color: #34d399; }
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

function HealthCard({ title, status, latency, subtitle, icon }) {
  return (
    <div className="health-card">
      <span className="h-icon">{icon}</span>
      <div className="h-body">
        <h4 className="h-title">{title}</h4>
        <div className="h-sub">{subtitle}</div>
        <div className="h-status-row">
          <span className="status-badge">● {status}</span>
          <span className="latency">{latency}</span>
        </div>
      </div>
    </div>
  );
}
