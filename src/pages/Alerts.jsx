import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function Alerts() {
  const { alerts, acknowledgeAlert, resolveAlert, deviationEngine, isRealMode } = useAppContext();
  const [activeTab, setActiveTab] = useState('active-alerts'); // 'active-alerts' | 'config'
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');

  // Configurable thresholds
  const [coreThresh, setCoreThresh] = useState(deviationEngine.coreThresholdKm || 15);
  const [bufferThresh, setBufferThresh] = useState(deviationEngine.bufferThresholdKm || 5);

  const filtered = alerts.filter(a => {
    const sevMatch = filterSeverity === 'all' || (a.severity || '').toLowerCase() === filterSeverity.toLowerCase();
    const statMatch = filterStatus === 'all' || (a.status || 'active').toLowerCase() === filterStatus.toLowerCase();
    return sevMatch && statMatch;
  });

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
          <h2 className="page-title">Movement Deviation & Spatial Alerts</h2>
          <p className="page-subtitle">
            {isRealMode ? 'Real Deviation Engine Notifications (SQLite)' : 'Demo Movement Alerts'} ({alerts.length} Total)
          </p>
        </div>
        <div className="tab-buttons">
          <button className={`tab-btn ${activeTab === 'active-alerts' ? 'active' : ''}`} onClick={() => setActiveTab('active-alerts')}>
            🚨 Alert Feed ({alerts.filter(a => a.status === 'active').length} Active)
          </button>
          <button className={`tab-btn ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>
            ⚙ Deviation Engine Thresholds
          </button>
        </div>
      </div>

      {activeTab === 'active-alerts' && (
        <div className="alerts-layout">
          <div className="alert-feed">
            {/* Filter Bars */}
            <div className="filter-bar" style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span className="f-title" style={{ fontSize: 11, color: '#94a3b8' }}>Status:</span>
                {['active', 'acknowledged', 'resolved', 'all'].map(st => (
                  <button
                    key={st}
                    className={`sev-pill ${filterStatus === st ? 'active' : ''}`}
                    onClick={() => setFilterStatus(st)}
                  >
                    {st.toUpperCase()}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span className="f-title" style={{ fontSize: 11, color: '#94a3b8' }}>Severity:</span>
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

            {filtered.map(alert => {
              const aId = alert.id;
              const aType = alert.alert_type || alert.type;
              const aSev = (alert.severity || 'MEDIUM').toUpperCase();
              const aTime = alert.created_at || alert.timestamp;
              const aStatus = alert.status || 'active';
              const aWhat = alert.what_changed || alert.whatChanged || alert.description;
              const aEv = Array.isArray(alert.supporting_evidence || alert.supportingEvidence)
                ? (alert.supporting_evidence || alert.supportingEvidence)
                : typeof (alert.supporting_evidence || alert.supportingEvidence) === 'string'
                ? [alert.supporting_evidence || alert.supportingEvidence]
                : [];

              return (
                <div key={aId} className={`alert-card severity-${aSev.toLowerCase()}`}>
                  <div className="card-top">
                    <span className={`sev-badge ${aSev.toLowerCase()}`}>{aSev} PRIORITY</span>
                    <span className="alert-time font-mono">{aTime}</span>
                    <span className={`status-tag ${aStatus}`}>{aStatus.toUpperCase()}</span>
                  </div>

                  <h4 className="alert-title">{aType} — Tiger: {alert.tiger_id || alert.tigerId || 'UNIDENTIFIED'}</h4>
                  <p className="alert-desc">{aWhat}</p>

                  {/* Explainable Deviation Evidence */}
                  {aEv && aEv.length > 0 && (
                    <div className="explainable-box">
                      <span className="exp-label">📊 SUPPORTING SPATIAL EVIDENCE:</span>
                      <ul className="evidence-list font-mono" style={{ margin: '6px 0 0 16px', padding: 0, fontSize: 11 }}>
                        {aEv.map((ev, i) => (
                          <li key={i} style={{ color: '#94a3b8', marginBottom: 4 }}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="alert-actions-row" style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    {aStatus === 'active' && (
                      <button
                        className="act-btn ack"
                        style={{ padding: '6px 14px', background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 6, color: '#fbbf24', fontSize: 11, fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => acknowledgeAlert(aId)}
                      >
                        👁 Acknowledge Alert
                      </button>
                    )}
                    {aStatus !== 'resolved' && (
                      <button
                        className="act-btn res"
                        style={{ padding: '6px 14px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 6, color: '#34d399', fontSize: 11, fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => resolveAlert(aId)}
                      >
                        ✓ Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="empty-state" style={{ padding: 40, textAlign: 'center', color: '#64748b', background: 'var(--bg-card)', borderRadius: 10 }}>
                No movement alerts found matching criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIG TAB */}
      {activeTab === 'config' && (
        <div className="config-container" style={{ maxWidth: 600 }}>
          <form className="config-card" onSubmit={handleSaveConfig} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 24 }}>
            <h3>⚙ Deviation Engine Parameters</h3>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 20 }}>
              Adjust sensitivity thresholds for automatic spatial centroid shifts and boundary risk detection in Pench Tiger Reserve.
            </p>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}>Core Zone Threshold (km)</label>
              <input
                type="number"
                value={coreThresh}
                onChange={(e) => setCoreThresh(e.target.value)}
                style={{ width: '100%', padding: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-main)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}>Buffer Zone Threshold (km)</label>
              <input
                type="number"
                value={bufferThresh}
                onChange={(e) => setBufferThresh(e.target.value)}
                style={{ width: '100%', padding: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-main)' }}
              />
            </div>

            <button type="submit" style={{ width: '100%', padding: 12, background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
              ✓ Save Thresholds
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
        .tab-btn { padding: 6px 14px; border-radius: 6px; border: 1px solid var(--border-subtle); background: rgba(255,255,255,0.03); color: var(--text-muted); font-size: 12px; cursor: pointer; font-weight: 600; }
        .tab-btn.active { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.4); color: #34d399; }

        .sev-pill { padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: var(--text-dim); font-size: 10px; font-weight: 700; cursor: pointer; }
        .sev-pill.active { background: rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.5); color: #34d399; }

        .alert-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 18px; margin-bottom: 14px; }
        .alert-card.severity-high { border-left: 4px solid #ef4444; }
        .alert-card.severity-medium { border-left: 4px solid #f97316; }
        .alert-card.severity-low { border-left: 4px solid #3b82f6; }

        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .sev-badge { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
        .sev-badge.high { background: rgba(239,68,68,0.2); color: #f87171; }
        .sev-badge.medium { background: rgba(249,115,22,0.2); color: #fb923c; }
        .sev-badge.low { background: rgba(59,130,246,0.2); color: #60a5fa; }

        .alert-time { font-size: 10px; color: var(--text-dim); }
        .status-tag { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
        .status-tag.active { background: rgba(239,68,68,0.15); color: #f87171; }
        .status-tag.acknowledged { background: rgba(251,191,36,0.15); color: #fbbf24; }
        .status-tag.resolved { background: rgba(16,185,129,0.15); color: #34d399; }

        .alert-title { font-size: 14px; font-weight: 700; color: var(--text-bright); margin: 0 0 4px 0; }
        .alert-desc { font-size: 12px; color: var(--text-main); margin: 0 0 10px 0; }

        .explainable-box { background: rgba(0,0,0,0.3); border-radius: 8px; padding: 12px; margin: 10px 0; }
        .exp-label { font-size: 10px; font-weight: 700; color: #34d399; font-family: var(--font-mono); }
      `}</style>
    </div>
  );
}
