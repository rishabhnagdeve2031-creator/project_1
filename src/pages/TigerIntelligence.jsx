import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function TigerIntelligence() {
  const { tigerProfiles, observations } = useAppContext();
  const [selectedTiger, setSelectedTiger] = useState(tigerProfiles[0]);

  const activeTigerObs = observations.filter(o => o.tigerId === selectedTiger?.id);

  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">🐅 Individual Tiger Intelligence</h2>
          <p className="page-subtitle">Pench Tiger Reserve — Striping Pattern Identification Profiles</p>
        </div>
        <div className="proto-badge">PROTOTYPE IDENTIFICATION MODE</div>
      </div>

      <div className="tiger-intel-layout">
        {/* Tiger Selection Sidebar Cards */}
        <div className="tiger-selector-list">
          {tigerProfiles.map(tiger => {
            const isSelected = selectedTiger?.id === tiger.id;
            return (
              <div
                key={tiger.id}
                className={`tiger-profile-card ${isSelected ? 'active' : ''}`}
                style={{ borderLeftColor: tiger.color }}
                onClick={() => setSelectedTiger(tiger)}
              >
                <div className="card-top">
                  <span className="tiger-avatar">🐅</span>
                  <div>
                    <h4 className="tiger-card-name">{tiger.name}</h4>
                    <span className="tiger-card-id">{tiger.id} · {tiger.gender}</span>
                  </div>
                </div>

                <div className="card-info-row">
                  <span className="info-chip">{tiger.zone}</span>
                  <span className="info-obs">{tiger.observationCount} Sightings</span>
                </div>

                <div className={`status-pill ${tiger.movementStatus.includes('boundary') ? 'warn' : 'normal'}`}>
                  {tiger.movementStatus}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Tiger Detail Dashboard */}
        {selectedTiger && (
          <div className="tiger-detail-dashboard">
            {/* Header Identity Card */}
            <div className="tiger-hero-card" style={{ borderColor: selectedTiger.color }}>
              <div className="hero-avatar" style={{ backgroundColor: `${selectedTiger.color}22`, color: selectedTiger.color }}>
                🐅
              </div>
              <div className="hero-meta">
                <div className="hero-title-row">
                  <h3>{selectedTiger.name}</h3>
                  <span className="hero-id-badge" style={{ background: selectedTiger.color }}>{selectedTiger.id}</span>
                </div>
                <p className="hero-sub">{selectedTiger.gender} · Est. Age: {selectedTiger.age} · First Logged: {selectedTiger.firstSeen}</p>
              </div>

              <div className="hero-stats-group">
                <div className="h-stat">
                  <span className="h-label">Current Zone</span>
                  <span className="h-val">{selectedTiger.zone}</span>
                </div>
                <div className="h-stat">
                  <span className="h-label">Last Station</span>
                  <span className="h-val">{selectedTiger.lastCamera}</span>
                </div>
                <div className="h-stat">
                  <span className="h-label">Total Sightings</span>
                  <span className="h-val">{selectedTiger.observationCount}</span>
                </div>
              </div>
            </div>

            {/* Movement Timeline */}
            <div className="detail-section">
              <h4>📍 Recent Movement Timeline</h4>
              <div className="timeline-track">
                {selectedTiger.timeline.map((step, idx) => (
                  <div key={idx} className="timeline-node">
                    <div className="node-dot" style={{ backgroundColor: selectedTiger.color }}></div>
                    <div className="node-content">
                      <span className="node-time">{step.time}</span>
                      <span className="node-cam">{step.camera}</span>
                      <span className="node-zone">{step.zone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Camera Trap Sightings Table */}
            <div className="detail-section">
              <h4>📷 Sightings Log ({activeTigerObs.length} Recent)</h4>
              <table className="sightings-table">
                <thead>
                  <tr>
                    <th>Obs ID</th>
                    <th>Timestamp</th>
                    <th>Camera Station</th>
                    <th>Zone</th>
                    <th>AI Confidence</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTigerObs.map(obs => (
                    <tr key={obs.id}>
                      <td className="font-mono">{obs.id}</td>
                      <td>{obs.timestamp}</td>
                      <td className="font-mono">{obs.cameraId}</td>
                      <td>
                        <span className={`zone-tag ${obs.zone.toLowerCase().replace(' ', '-')}`}>
                          {obs.zone}
                        </span>
                      </td>
                      <td className="font-mono green-text">{obs.confidence}%</td>
                      <td><span className="status-confirmed">Confirmed</span></td>
                    </tr>
                  ))}
                  {activeTigerObs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center">No recent sightings logged in stream.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="disclaimer-note">
              ℹ️ Individual identification is performed using simulated stripe-pattern matching algorithms for prototype validation.
            </div>
          </div>
        )}
      </div>

      <style>{`
        .pg-page { padding: 20px 24px; overflow-y: auto; height: 100%; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .page-title { font-size: 20px; font-weight: 700; color: var(--text-bright); margin: 0 0 4px 0; }
        .page-subtitle { font-size: 12px; color: var(--text-dim); margin: 0; }

        .proto-badge {
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #fbbf24;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
        }

        .tiger-intel-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 20px;
        }

        .tiger-selector-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tiger-profile-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-left: 4px solid;
          border-radius: 10px;
          padding: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tiger-profile-card:hover {
          border-color: rgba(255,255,255,0.2);
          transform: translateX(2px);
        }
        .tiger-profile-card.active {
          background: rgba(255,255,255,0.04);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .tiger-avatar { font-size: 26px; }
        .tiger-card-name { font-size: 14px; font-weight: 700; color: var(--text-bright); margin: 0; }
        .tiger-card-id { font-size: 11px; color: var(--text-dim); }

        .card-info-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 8px; }
        .info-chip { color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; }
        .info-obs { color: var(--text-dim); }

        .status-pill {
          font-size: 10px; font-weight: 600; padding: 4px 8px; border-radius: 4px; text-align: center;
          background: rgba(16, 185, 129, 0.1); color: #34d399;
        }
        .status-pill.warn {
          background: rgba(239, 68, 68, 0.15); color: #f87171;
        }

        /* Detail Dashboard */
        .tiger-detail-dashboard { display: flex; flex-direction: column; gap: 20px; }

        .tiger-hero-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .hero-avatar {
          width: 60px; height: 60px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 32px; flex-shrink: 0;
        }

        .hero-meta { flex: 1; }
        .hero-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
        .hero-title-row h3 { font-size: 20px; font-weight: 700; color: var(--text-bright); margin: 0; }
        .hero-id-badge { font-size: 11px; font-weight: 700; color: #000; padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono); }
        .hero-sub { font-size: 12px; color: var(--text-dim); margin: 0; }

        .hero-stats-group { display: flex; gap: 24px; border-left: 1px solid var(--border-subtle); padding-left: 20px; }
        .h-stat { display: flex; flex-direction: column; }
        .h-label { font-size: 10px; color: var(--text-dim); margin-bottom: 2px; }
        .h-val { font-size: 13px; font-weight: 700; color: var(--text-bright); }

        .detail-section {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 18px;
        }
        .detail-section h4 { font-size: 13px; font-weight: 600; color: var(--text-bright); margin: 0 0 14px 0; }

        .timeline-track { display: flex; gap: 16px; position: relative; overflow-x: auto; padding-bottom: 8px; }
        .timeline-node { display: flex; flex-direction: column; align-items: flex-start; min-width: 140px; }
        .node-dot { width: 10px; height: 10px; border-radius: 50%; margin-bottom: 8px; box-shadow: 0 0 8px currentColor; }
        .node-content { display: flex; flex-direction: column; gap: 2px; font-size: 11px; }
        .node-time { font-size: 10px; color: var(--text-dim); }
        .node-cam { font-weight: 700; color: var(--text-bright); font-family: var(--font-mono); }
        .node-zone { color: var(--text-muted); }

        .sightings-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .sightings-table th, .sightings-table td { padding: 10px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .sightings-table th { font-size: 11px; color: var(--text-dim); font-weight: 600; }
        .green-text { color: #10b981; font-weight: 600; }
        .status-confirmed { color: #34d399; background: rgba(16,185,129,0.1); padding: 2px 6px; border-radius: 4px; font-size: 10px; }
        .text-center { text-align: center; color: var(--text-dim); }

        .disclaimer-note {
          font-size: 11px; color: var(--text-dim); background: rgba(255,255,255,0.02);
          padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);
        }

        @media (max-width: 900px) {
          .tiger-intel-layout { grid-template-columns: 1fr; }
          .hero-stats-group { border-left: none; padding-left: 0; margin-top: 10px; }
          .tiger-hero-card { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
