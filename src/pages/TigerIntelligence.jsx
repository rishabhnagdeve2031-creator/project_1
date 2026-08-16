import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function TigerIntelligence() {
  const { tigerProfiles, observations, humanReview, confirmHumanReviewMatch, enrollNewTiger } = useAppContext();
  const [activeTab, setActiveTab] = useState('catalogue'); // 'catalogue' | 'human-review' | 'enroll'
  const [selectedTiger, setSelectedTiger] = useState(tigerProfiles[0]);

  // Form for New Tiger Enrollment
  const [enrollForm, setEnrollForm] = useState({ name: '', gender: 'Male', age: '~3 years', zone: 'Core Zone', cameraId: 'CT-001' });

  const activeTigerObs = observations.filter(o => o.tigerId === selectedTiger?.id);
  const pendingReviews = humanReview.filter(r => r.status === 'pending');

  const handleEnrollSubmit = (e) => {
    e.preventDefault();
    if (!enrollForm.name) return;
    const newTiger = enrollNewTiger(enrollForm);
    setSelectedTiger(newTiger);
    setEnrollForm({ name: '', gender: 'Male', age: '~3 years', zone: 'Core Zone', cameraId: 'CT-001' });
    setActiveTab('catalogue');
    alert(`Tiger ${newTiger.id} (${newTiger.name}) enrolled successfully!`);
  };

  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">🐅 Individual Tiger Catalogue & Stripe Matching</h2>
          <p className="page-subtitle">Pench Tiger Reserve — Striping Pattern Identification & Human Review Workflow</p>
        </div>
        <div className="tab-buttons">
          <button className={`tab-btn ${activeTab === 'catalogue' ? 'active' : ''}`} onClick={() => setActiveTab('catalogue')}>
            🐅 Tiger Catalogue ({tigerProfiles.length})
          </button>
          <button className={`tab-btn ${activeTab === 'human-review' ? 'active' : ''}`} onClick={() => setActiveTab('human-review')}>
            👁 Human Review Queue ({pendingReviews.length})
          </button>
          <button className={`tab-btn ${activeTab === 'enroll' ? 'active' : ''}`} onClick={() => setActiveTab('enroll')}>
            ➕ Enroll New Tiger
          </button>
        </div>
      </div>

      {activeTab === 'catalogue' && (
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
              {/* Addition 9: Persistent Tiger Profile */}
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
                    <span className="h-label">Occupancy Area</span>
                    <span className="h-val green font-mono">{selectedTiger.estimatedAreaKm2} km²</span>
                  </div>
                  <div className="h-stat">
                    <span className="h-label">Centroid</span>
                    <span className="h-val font-mono">{selectedTiger.centroid?.lat.toFixed(3)}°N</span>
                  </div>
                  <div className="h-stat">
                    <span className="h-label">Sightings Logged</span>
                    <span className="h-val">{selectedTiger.observationCount}</span>
                  </div>
                </div>
              </div>

              {/* Addition 6: Flank Extraction & Stripe Pattern Matching Visualizer */}
              <div className="detail-section">
                <h4>🧬 Stripe Pattern Catalogue Reference</h4>
                <div className="flank-match-card">
                  <div className="flank-box">
                    <span className="f-title">Flank Extraction Reference</span>
                    <div className="stripe-pattern-sim">
                      <div className="stripe s1"></div>
                      <div className="stripe s2"></div>
                      <div className="stripe s3"></div>
                    </div>
                  </div>
                  <div className="flank-meta font-mono">
                    <div>Stripe Hash ID: <code>SP-{selectedTiger.id}-FLANK99</code></div>
                    <div>Matching Confidence: <strong className="green">Confirmed Match (Dem-Stripe-Engine)</strong></div>
                    <div>Reference Camera: {selectedTiger.lastCamera}</div>
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

              {/* Sightings Log */}
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
                        <td><span className="zone-tag">{obs.zone}</span></td>
                        <td className="font-mono green-text">{obs.confidence}%</td>
                        <td><span className="status-confirmed">Confirmed Match</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Addition 8: HUMAN REVIEW QUEUE */}
      {activeTab === 'human-review' && (
        <div className="human-review-container">
          <h3>👁 Ambiguous Stripe Matching Review Queue</h3>
          <p className="sub-text">When AI stripe pattern confidence falls between 60% - 80%, cases are queued for human verification before updating the tiger database.</p>

          <div className="review-list">
            {pendingReviews.map(item => (
              <div key={item.id} className="review-card">
                <div className="review-img-box">
                  <span className="img-icon">🐅</span>
                  <span className="file-name font-mono">{item.fileName}</span>
                  <span className="cam-tag font-mono">{item.cameraId}</span>
                </div>

                <div className="review-candidates-box">
                  <div className="review-header font-mono">
                    <span>{item.id}</span> · <span>{item.timestamp}</span> · <span>Notes: {item.notes}</span>
                  </div>

                  <div className="candidates-grid">
                    <div className="cand-card c1">
                      <span className="cand-rank">Candidate 1 (High Probability)</span>
                      <span className="cand-name">{item.candidate1.name} ({item.candidate1.id})</span>
                      <span className="cand-conf">{item.candidate1.confidence}% Match Confidence</span>
                      <button className="confirm-cand-btn" onClick={() => confirmHumanReviewMatch(item.id, item.candidate1.id)}>
                        ✓ Confirm {item.candidate1.id}
                      </button>
                    </div>

                    <div className="cand-card c2">
                      <span className="cand-rank">Candidate 2 (Secondary Match)</span>
                      <span className="cand-name">{item.candidate2.name} ({item.candidate2.id})</span>
                      <span className="cand-conf">{item.candidate2.confidence}% Match Confidence</span>
                      <button className="confirm-cand-btn" onClick={() => confirmHumanReviewMatch(item.id, item.candidate2.id)}>
                        ✓ Confirm {item.candidate2.id}
                      </button>
                    </div>
                  </div>

                  <div className="review-alt-actions">
                    <button className="alt-act-btn enroll" onClick={() => setActiveTab('enroll')}>
                      ➕ Unmatched — Enroll as New Tiger
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {pendingReviews.length === 0 && (
              <div className="empty-state">No pending ambiguous cases in Human Review Queue.</div>
            )}
          </div>
        </div>
      )}

      {/* Addition 7: NEW TIGER ENROLLMENT FORM */}
      {activeTab === 'enroll' && (
        <div className="enroll-container">
          <form className="enroll-card" onSubmit={handleEnrollSubmit}>
            <h3>➕ Enroll New Tiger Individual into Catalogue</h3>
            <p className="sub-text">Assigns new unique identifier (e.g. TGR-05) and stores flank reference crop in persistent database.</p>

            <div className="form-grid">
              <div className="form-group">
                <label>Tiger Name / Alias</label>
                <input
                  type="text"
                  placeholder="e.g. Rudra / Collarwali II"
                  value={enrollForm.name}
                  onChange={(e) => setEnrollForm({ ...enrollForm, name: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select value={enrollForm.gender} onChange={(e) => setEnrollForm({ ...enrollForm, gender: e.target.value })} className="form-input">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div className="form-group">
                <label>Estimated Age</label>
                <input
                  type="text"
                  placeholder="e.g. ~3 years"
                  value={enrollForm.age}
                  onChange={(e) => setEnrollForm({ ...enrollForm, age: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>First Station Encountered</label>
                <select value={enrollForm.cameraId} onChange={(e) => setEnrollForm({ ...enrollForm, cameraId: e.target.value })} className="form-input">
                  <option value="CT-001">CT-001 - Core Zone A</option>
                  <option value="CT-003">CT-003 - Core Zone B</option>
                  <option value="CT-009">CT-009 - Buffer Zone South</option>
                  <option value="CT-014">CT-014 - Boundary Zone B</option>
                </select>
              </div>
            </div>

            <button type="submit" className="submit-enroll-btn">
              💾 Enroll New Tiger Profile
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

        .tiger-intel-layout { display: grid; grid-template-columns: 280px 1fr; gap: 20px; }

        .tiger-selector-list { display: flex; flex-direction: column; gap: 12px; }

        .tiger-profile-card {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-left: 4px solid; border-radius: 10px; padding: 14px; cursor: pointer; transition: all 0.2s;
        }
        .tiger-profile-card.active { background: rgba(255,255,255,0.04); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }

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
        .status-pill.warn { background: rgba(239, 68, 68, 0.15); color: #f87171; }

        .tiger-detail-dashboard { display: flex; flex-direction: column; gap: 20px; }

        .tiger-hero-card {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 20px;
        }
        .hero-avatar { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; flex-shrink: 0; }
        .hero-meta { flex: 1; }
        .hero-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
        .hero-title-row h3 { font-size: 20px; font-weight: 700; color: var(--text-bright); margin: 0; }
        .hero-id-badge { font-size: 11px; font-weight: 700; color: #000; padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono); }
        .hero-sub { font-size: 12px; color: var(--text-dim); margin: 0; }

        .hero-stats-group { display: flex; gap: 20px; border-left: 1px solid var(--border-subtle); padding-left: 20px; }
        .h-stat { display: flex; flex-direction: column; }
        .h-label { font-size: 10px; color: var(--text-dim); margin-bottom: 2px; }
        .h-val { font-size: 13px; font-weight: 700; color: var(--text-bright); }
        .h-val.green { color: #10b981; }

        .detail-section { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 18px; }
        .detail-section h4 { font-size: 13px; font-weight: 600; color: var(--text-bright); margin: 0 0 14px 0; }

        /* Flank matching card */
        .flank-match-card { display: flex; gap: 16px; background: rgba(255,255,255,0.02); padding: 14px; border-radius: 8px; align-items: center; }
        .flank-box { background: #000; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); width: 180px; text-align: center; }
        .f-title { font-size: 10px; color: var(--text-dim); display: block; margin-bottom: 8px; }
        .stripe-pattern-sim { height: 40px; display: flex; justify-content: space-around; align-items: center; }
        .stripe { background: #f97316; width: 6px; height: 100%; border-radius: 3px; }
        .stripe.s1 { transform: rotate(15deg); }
        .stripe.s2 { transform: rotate(-10deg); height: 80%; }
        .stripe.s3 { transform: rotate(5deg); }
        .flank-meta { font-size: 11px; color: var(--text-muted); display: flex; flex-direction: column; gap: 4px; }
        .flank-meta code { color: #34d399; }
        .green-text { color: #10b981; font-weight: 600; }

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
        .status-confirmed { color: #34d399; background: rgba(16,185,129,0.1); padding: 2px 6px; border-radius: 4px; font-size: 10px; }

        /* Human Review Queue */
        .human-review-container, .enroll-container { display: flex; flex-direction: column; gap: 16px; }
        .sub-text { font-size: 12px; color: var(--text-dim); margin-top: -12px; margin-bottom: 16px; }

        .review-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 18px; display: flex; gap: 18px; }
        .review-img-box { width: 160px; height: 140px; background: #000; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid var(--border-subtle); }
        .img-icon { font-size: 40px; margin-bottom: 6px; }
        .file-name { font-size: 10px; color: var(--text-muted); }
        .cam-tag { font-size: 9px; color: #34d399; background: rgba(16,185,129,0.1); padding: 2px 6px; border-radius: 3px; margin-top: 4px; }

        .review-candidates-box { flex: 1; display: flex; flex-direction: column; gap: 12px; }
        .review-header { font-size: 11px; color: var(--text-dim); }
        .candidates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .cand-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 4px; }
        .cand-rank { font-size: 10px; color: var(--text-dim); }
        .cand-name { font-size: 14px; font-weight: 700; color: var(--text-bright); }
        .cand-conf { font-size: 11px; color: #10b981; font-weight: 600; margin-bottom: 6px; }
        .confirm-cand-btn { padding: 6px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #34d399; border-radius: 4px; font-weight: 600; cursor: pointer; }

        .review-alt-actions { display: flex; justify-content: flex-end; }
        .alt-act-btn { padding: 6px 14px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #fbbf24; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; }

        /* Enrollment Form */
        .enroll-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 24px; max-width: 600px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { font-size: 11px; color: var(--text-dim); }
        .form-input { padding: 8px 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: 6px; color: var(--text-main); font-size: 12px; }
        .submit-enroll-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; }

        .empty-state { padding: 40px; text-align: center; color: var(--text-dim); font-size: 13px; background: var(--bg-card); border-radius: 12px; }
      `}</style>
    </div>
  );
}
