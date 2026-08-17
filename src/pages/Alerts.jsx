import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function Alerts() {
  const { alerts, acknowledgeAlert, resolveAlert, deviationEngine } = useAppContext();
  const [activeTab, setActiveTab] = useState('active-alerts'); // 'active-alerts' | 'config'
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Configurable thresholds
  const [coreThresh, setCoreThresh] = useState(deviationEngine.coreThresholdKm);
  const [bufferThresh, setBufferThresh] = useState(deviationEngine.bufferThresholdKm);

  const filtered = filterSeverity === 'all'
    ? alerts
    : alerts.filter(a => a.severity.toLowerCase() === filterSeverity.toLowerCase());

  const handleSaveConfig = (e) => {
    e.preventDefault();
    deviationEngine.coreThresholdKm = parseFloat(coreThresh);
    deviationEngine.bufferThresholdKm = parseFloat(bufferThresh);
    alert('✅ Deviation Engine thresholds updated successfully!');
  };

  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Alerts</h2>
          <p className="page-subtitle">Movement deviation alerts and risk notifications</p>
        </div>
        <div className="tab-buttons">
          <button className={`tab-btn ${activeTab === 'active-alerts' ? 'active' : ''}`} onClick={() => setActiveTab('active-alerts')}>
            🚨 Active Alerts ({alerts.length})
          </button>
          <button className={`tab-btn ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>
            ⚙ Deviation Engine Thresholds
          </button>
        </div>
      </div>

      {activeTab === 'active-alerts' && (
        <div className="alerts-layout">
          {/* Main Alert Feed */}
          <div className="alert-feed">
            <div className="filter-bar">
              <span className="f-title">Filter Severity:</span>
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

            {filtered.map(alert => (
              <div key={alert.id} className={`alert-card severity-${alert.severity.toLowerCase()}`}>
                <div className="card-top">
                  <span className={`sev-badge ${alert.severity.toLowerCase()}`}>{alert.severity} PRIORITY</span>
                  <span className="alert-time">{alert.timestamp}</span>
                  <span className={`status-tag ${alert.status}`}>{alert.status.toUpperCase()}</span>
                </div>

                <h4 className="alert-title">{alert.type} — {alert.location}</h4>
                <p className="alert-desc">{alert.description}</p>

                {/* Addition 15: EXPLAINABLE ALERTS */}
                <div className="explainable-box">
                  <div className="exp-section">
                    <span className="exp-label">⚡ WHAT CHANGED:</span>
                    <span className="exp-text">{alert.whatChanged || alert.description}</span>
                  </div>

                  {alert.supportingEvidence && (
                    <div className="exp-section">
                      <span className="exp-label">📊 SUPPORTING EVIDENCE:</span>
                      <ul className="evidence-list font-mono">
                        {alert.supportingEvidence.map((ev, i) => (
                          <li key={i}>• {ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="exp-meta-row">
                    <span>Confidence Score: <strong className="green font-mono">{alert.confidence || 90}%</strong></span>
                    <span>Survey Effort: <strong className="orange">{alert.surveyEffort || 'Sufficient'}</strong></span>
                  </div>
                </div>

                <div className="card-actions">
                  {alert.status === 'active' && (
                    <button className="act-btn ack" onClick={() => acknowledgeAlert(alert.id)}>
                      ✓ Acknowledge
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

          {/* Automated Notification Dispatcher */}
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
          </div>
        </div>
      )}

      {/* Addition 12: CONFIGURABLE THRESHOLDS */}
      {activeTab === 'config' && (
        <div className="config-container">
          <form className="config-card" onSubmit={handleSaveConfig}>
            <h3>⚙ Deviation Engine Threshold Configuration</h3>
            <p className="sub-text">Configure geographic shift thresholds for explainable deviation detection.</p>

            <div className="form-group">
              <label>Core Zone Centroid Shift Threshold (km)</label>
              <input
                type="number"
                value={coreThresh}
                onChange={(e) => setCoreThresh(e.target.value)}
                className="form-input"
                step="0.5"
              />
              <span className="hint">Default: 15 km (Triggers HIGH severity alert)</span>
            </div>

            <div className="form-group">
              <label>Buffer Zone Centroid Shift Threshold (km)</label>
              <input
                type="number"
                value={bufferThresh}
                onChange={(e) => setBufferThresh(e.target.value)}
                className="form-input"
                step="0.5"
              />
              <span className="hint">Default: 5 km (Triggers MEDIUM severity alert)</span>
            </div>

            <button type="submit" className="save-config-btn">
              💾 Save Threshold Configuration
            </button>
          </form>
        </div>
      )}

      <style>{`
        .pg-page { padding: 20px 24px; overflow-y: auto; height: 100%; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .page-title { font-size: 20px; font-weight: 700; color: var(--text-bright); margin: 0 0 4px 0; }
        .page-subtitle { font-size: 12px; color: var(--text-dim); margin: 0; }

        .tab-buttons { display: flex; gap: 8px; }
        .tab-btn {
          padding: 6px 14px; border-radius: 6px; border: 1px solid var(--border-subtle);
          background: rgba(255,255,255,0.03); color: var(--text-muted); font-size: 12px;
          cursor: pointer; transition: all 0.2s; font-weight: 600;
        }
        .tab-btn.active { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.4); color: #34d399; }

        .alerts-layout { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }

        .alert-feed { display: flex; flex-direction: column; gap: 14px; }
        .filter-bar { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-dim); }
        .f-title { font-weight: 600; }
        .sev-pill { padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: var(--text-muted); font-size: 10px; font-weight: 600; cursor: pointer; }
        .sev-pill.active { background: rgba(239,68,68,0.2); border-color: #ef4444; color: #f87171; }

        .alert-card {
          background: var(--bg-card); border: 1px solid var(--border-subtle); border-left: 4px solid;
          border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 8px;
        }
        .severity-high { border-left-color: #ef4444; }
        .severity-medium { border-left-color: #f59e0b; }
        .severity-low { border-left-color: #3b82f6; }

        .card-top { display: flex; align-items: center; gap: 10px; }
        .sev-badge { font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; }
        .sev-badge.high { background: rgba(239,68,68,0.2); color: #f87171; }
        .sev-badge.medium { background: rgba(245,158,11,0.2); color: #fbbf24; }
        .sev-badge.low { background: rgba(59,130,246,0.2); color: #60a5fa; }
        .alert-time { font-size: 11px; color: var(--text-dim); margin-left: auto; }
        .status-tag { font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 3px; }
        .status-tag.active { background: rgba(239,68,68,0.15); color: #f87171; }

        .alert-title { font-size: 14px; font-weight: 700; color: var(--text-bright); margin: 0; }
        .alert-desc { font-size: 12px; color: var(--text-muted); margin: 0; }

        /* Explainable Box */
        .explainable-box { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
        .exp-section { font-size: 11px; }
        .exp-label { color: #fbbf24; font-weight: 700; display: block; margin-bottom: 2px; }
        .exp-text { color: var(--text-main); }
        .evidence-list { list-style: none; padding: 0; margin: 4px 0 0 0; color: #34d399; font-size: 11px; display: flex; flex-direction: column; gap: 2px; }
        .exp-meta-row { display: flex; justify-content: space-between; font-size: 10px; color: var(--text-dim); border-top: 1px solid rgba(255,255,255,0.05); padding-top: 6px; }
        .green { color: #10b981; } .orange { color: #f97316; }

        .card-actions { display: flex; align-items: center; gap: 8px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; }
        .act-btn { padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; border: none; }
        .act-btn.ack { background: rgba(245,158,11,0.2); color: #fbbf24; }
        .act-btn.res { background: rgba(16,185,129,0.2); color: #34d399; }
        .alert-id-tag { margin-left: auto; font-size: 10px; color: var(--text-dim); }

        .notification-panel { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 18px; display: flex; flex-direction: column; gap: 14px; }
        .notification-panel h3 { font-size: 14px; font-weight: 700; color: var(--text-bright); margin: 0; }
        .panel-sub { font-size: 11px; color: var(--text-dim); margin: -8px 0 0 0; }

        .notif-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 12px; }
        .notif-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .notif-header h5 { font-size: 12px; font-weight: 700; color: var(--text-bright); margin: 0; }
        .notif-header .target { font-size: 10px; color: var(--text-dim); }
        .notif-body { font-size: 11px; color: #cbd5e1; background: #000; padding: 8px; border-radius: 6px; margin-bottom: 8px; }
        .notif-footer { font-size: 10px; color: #34d399; font-weight: 600; }

        /* Config Form */
        .config-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 24px; max-width: 500px; display: flex; flex-direction: column; gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { font-size: 12px; color: var(--text-main); font-weight: 600; }
        .form-input { padding: 8px 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: 6px; color: var(--text-main); font-size: 13px; }
        .hint { font-size: 10px; color: var(--text-dim); }
        .save-config-btn { padding: 12px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 8px; color: #fff; font-weight: 700; cursor: pointer; }

        .empty-alerts { padding: 40px; text-align: center; color: var(--text-dim); font-size: 13px; }
      `}</style>
    </div>
  );
}
