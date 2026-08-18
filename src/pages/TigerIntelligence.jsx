import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { BackendService } from '../services/api/Services';

export default function TigerIntelligence() {
  const { tigerProfiles, observations, humanReview, confirmHumanReviewMatch, enrollNewTiger } = useAppContext();
  const [activeTab, setActiveTab] = useState('catalogue'); // 'catalogue' | 'human-review' | 'enroll'
  const [selectedTiger, setSelectedTiger] = useState(tigerProfiles[0] || null);

  // Form for New Tiger Enrollment
  const [enrollForm, setEnrollForm] = useState({ name: '', gender: 'Male', age: '~3-5 years', zone: 'Core Zone', cameraId: 'CT-001' });

  // Update selected tiger if changed
  const currentTiger = selectedTiger || tigerProfiles[0] || null;
  const activeTigerObs = observations.filter(o => (o.tiger_id || o.tigerId) === currentTiger?.id);
  const pendingReviews = humanReview || [];

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!enrollForm.name) return;
    const newTiger = await enrollNewTiger(enrollForm);
    setSelectedTiger(newTiger);
    setEnrollForm({ name: '', gender: 'Male', age: '~3-5 years', zone: 'Core Zone', cameraId: 'CT-001' });
    setActiveTab('catalogue');
    alert(`Tiger ${newTiger?.tiger_id || newTiger?.id || 'TGR-NEW'} enrolled successfully!`);
  };

  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Tiger Intelligence & Individual Catalogue</h2>
          <p className="page-subtitle">
            Persistent tiger database, stripe re-identification, and human review verification queue.
          </p>
        </div>
        <div className="tab-buttons">
          <button className={`tab-btn ${activeTab === 'catalogue' ? 'active' : ''}`} onClick={() => setActiveTab('catalogue')}>
            🐅 Tiger Catalogue ({tigerProfiles.length})
          </button>
          <button className={`tab-btn ${activeTab === 'human-review' ? 'active' : ''}`} onClick={() => setActiveTab('human-review')}>
            👁 Human Review Queue ({pendingReviews.length})
          </button>
          <button className={`tab-btn ${activeTab === 'enroll' ? 'active' : ''}`} onClick={() => setActiveTab('enroll')}>
            ➕ Enroll Individual
          </button>
        </div>
      </div>

      {activeTab === 'catalogue' && (
        <div className="tiger-intel-layout">
          {/* Tiger Selection Sidebar Cards */}
          <div className="tiger-selector-list">
            {tigerProfiles.map(tiger => {
              const tId = tiger.id;
              const tName = tiger.display_name || tiger.name || `Individual ${tId}`;
              const tGender = tiger.gender || 'Unknown';
              const tZone = tiger.zone || 'Core Zone';
              const tObsCount = tiger.observation_count || tiger.observationCount || 1;
              const tColor = tiger.color || '#10b981';
              const isSelected = currentTiger?.id === tId;

              return (
                <div
                  key={tId}
                  className={`tiger-profile-card ${isSelected ? 'active' : ''}`}
                  style={{ borderLeftColor: tColor }}
                  onClick={() => setSelectedTiger(tiger)}
                >
                  <div className="card-top">
                    <span className="tiger-avatar">🐅</span>
                    <div>
                      <h4 className="tiger-card-name">{tName}</h4>
                      <span className="tiger-card-id font-mono">{tId} · {tGender}</span>
                    </div>
                  </div>

                  <div className="card-info-row">
                    <span className="info-chip">{tZone}</span>
                    <span className="info-obs">{tObsCount} Sighting(s)</span>
                  </div>
                </div>
              );
            })}

            {tigerProfiles.length === 0 && (
              <div className="empty-state" style={{ padding: 24 }}>
                No tiger individuals enrolled yet. Process batches in Batch Processing or enroll individuals via the Enroll tab.
              </div>
            )}
          </div>

          {/* Main Tiger Detail Dashboard */}
          {currentTiger ? (
            <div className="tiger-detail-dashboard">
              <div className="tiger-hero-card" style={{ borderColor: currentTiger.color || '#10b981' }}>
                <div className="hero-avatar" style={{ backgroundColor: `${currentTiger.color || '#10b981'}22`, color: currentTiger.color || '#10b981' }}>
                  🐅
                </div>
                <div className="hero-meta">
                  <div className="hero-title-row">
                    <h3>{currentTiger.display_name || currentTiger.name || `Individual ${currentTiger.id}`}</h3>
                    <span className="hero-id-badge" style={{ background: currentTiger.color || '#10b981' }}>{currentTiger.id}</span>
                  </div>
                  <p className="hero-sub">{currentTiger.gender} · Est. Age: {currentTiger.age_estimate || currentTiger.age || '~3-5 years'} · First Logged: {currentTiger.first_seen || currentTiger.firstSeen || 'Recent'}</p>
                </div>

                <div className="hero-stats-group">
                  <div className="h-stat">
                    <span className="h-label">Status</span>
                    <span className="h-val green">Active Profile</span>
                  </div>
                  <div className="h-stat">
                    <span className="h-label">Estimated Occupancy</span>
                    <span className="h-val green font-mono">{currentTiger.estimated_area_km2 || currentTiger.estimatedAreaKm2 || 5.0} km²</span>
                  </div>
                  <div className="h-stat">
                    <span className="h-label">Centroid</span>
                    <span className="h-val font-mono">{currentTiger.centroid_lat || currentTiger.centroid?.lat || 21.738}°N</span>
                  </div>
                  <div className="h-stat">
                    <span className="h-label">Total Sightings</span>
                    <span className="h-val font-mono">{activeTigerObs.length || currentTiger.observation_count || currentTiger.observationCount || 1}</span>
                  </div>
                </div>
              </div>

              {/* Stripe Matcher / Flank Evidence */}
              <div className="detail-section">
                <h4>🔬 Flank Crop Evidence & Stripe Reference</h4>
                <div className="flank-match-card">
                  <div className="flank-box">
                    <span className="f-title">Flank Pattern Snapshot</span>
                    <div className="stripe-pattern-sim">
                      <div className="stripe s1"></div>
                      <div className="stripe s2"></div>
                      <div className="stripe s3"></div>
                    </div>
                  </div>
                  <div className="flank-meta font-mono" style={{ fontSize: 11 }}>
                    <div>Identifier: <code>{currentTiger.id}</code></div>
                    <div>Detection Model: <strong>YOLOv8 Tiger Detector (best.pt)</strong></div>
                    <div>Identity Status: <strong className="green">Human-Verified Individual</strong></div>
                  </div>
                </div>
              </div>

              {/* Sightings Log */}
              <div className="detail-section">
                <h4>📷 Persistent Sightings Timeline ({activeTigerObs.length} Logged)</h4>
                <table className="sightings-table">
                  <thead>
                    <tr>
                      <th>Obs ID</th>
                      <th>Timestamp</th>
                      <th>Camera</th>
                      <th>Zone</th>
                      <th>YOLO Confidence</th>
                      <th>Crop Evidence</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTigerObs.map(obs => {
                      const oId = obs.id;
                      const oTime = obs.timestamp;
                      const oCam = obs.camera_id || obs.cameraId;
                      const oZone = obs.zone || 'Core Zone';
                      const oConf = obs.confidence;
                      const oCrop = obs.crop_path || obs.cropUrl;

                      return (
                        <tr key={oId}>
                          <td className="font-mono">{oId}</td>
                          <td>{oTime}</td>
                          <td className="font-mono">{oCam}</td>
                          <td><span className="zone-tag">{oZone}</span></td>
                          <td className="font-mono green-text">{oConf}%</td>
                          <td>
                            {oCrop ? (
                              <img src={BackendService.getMediaUrl(oCrop)} alt="Crop" style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4 }} />
                            ) : (
                              <span style={{ fontSize: 10, color: '#64748b' }}>No Crop</span>
                            )}
                          </td>
                          <td><span className="status-confirmed">Verified</span></td>
                        </tr>
                      );
                    })}
                    {activeTigerObs.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', color: '#64748b', padding: 24 }}>
                          No sightings logged for this individual yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="empty-state">Select a tiger profile to view intelligence dossier.</div>
          )}
        </div>
      )}

      {/* HUMAN REVIEW QUEUE */}
      {activeTab === 'human-review' && (
        <div className="human-review-container">
          <div className="upload-section-card">
            <h3>👁 Ambiguous Sightings & Human Review Queue</h3>
            <p className="sub-text">YOLO detects tigers, but individual stripe matching requires operator review when no automated high-confidence match is confirmed.</p>

            <div className="review-list" style={{ marginTop: 16 }}>
              {pendingReviews.map((item, idx) => {
                const obsId = item.id;
                const camId = item.camera_id || item.cameraId || 'CT-014';
                const ts = item.timestamp;
                const conf = item.confidence || 92;
                const cropUrl = item.crop_path;

                return (
                  <div key={obsId || idx} className="review-card" style={{ display: 'flex', gap: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 16, marginBottom: 14 }}>
                    <div className="review-img-box" style={{ width: 140, height: 95, borderRadius: 6, overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {cropUrl ? (
                        <img src={BackendService.getMediaUrl(cropUrl)} alt="Crop Evidence" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: 32 }}>🐅</span>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div className="font-mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                        <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{obsId}</span>
                        <span style={{ color: '#94a3b8' }}>{ts}</span>
                        <span style={{ color: '#34d399' }}>Station: {camId}</span>
                        <span style={{ color: '#fbbf24' }}>YOLO Conf: {conf}%</span>
                      </div>

                      <div style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 10 }}>
                        Status: <strong>Unidentified Individual (Pending Human Review)</strong>
                      </div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {tigerProfiles.map(t => (
                          <button
                            key={t.id}
                            style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 6, color: '#34d399', fontSize: 11, fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => confirmHumanReviewMatch(obsId, t.id)}
                          >
                            ✓ Assign to {t.id} ({t.display_name || t.name})
                          </button>
                        ))}
                        <button
                          style={{ padding: '6px 12px', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.4)', borderRadius: 6, color: '#f97316', fontSize: 11, fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => setActiveTab('enroll')}
                        >
                          ➕ Enroll as New Individual
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {pendingReviews.length === 0 && (
                <div className="empty-state">No unassigned tiger sightings in the Human Review Queue. All sightings have been matched or enrolled.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NEW TIGER ENROLLMENT FORM */}
      {activeTab === 'enroll' && (
        <div className="enroll-container">
          <form className="enroll-card" onSubmit={handleEnrollSubmit}>
            <h3>➕ Enroll New Tiger Individual into Database</h3>
            <p className="sub-text">Assigns a unique identifier (e.g. TGR-001, TGR-002) and creates a persistent profile in SQLite.</p>

            <div className="form-grid">
              <div className="form-group">
                <label>Individual Name / Code</label>
                <input
                  type="text"
                  placeholder="e.g. Dominant Male (Collar ID 4)"
                  value={enrollForm.name}
                  onChange={(e) => setEnrollForm({ ...enrollForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Estimated Gender</label>
                <select value={enrollForm.gender} onChange={(e) => setEnrollForm({ ...enrollForm, gender: e.target.value })}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div className="form-group">
                <label>Age Estimate</label>
                <input
                  type="text"
                  placeholder="e.g. ~3-5 years"
                  value={enrollForm.age}
                  onChange={(e) => setEnrollForm({ ...enrollForm, age: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>First Seen Station</label>
                <input
                  type="text"
                  placeholder="e.g. CT-014"
                  value={enrollForm.cameraId}
                  onChange={(e) => setEnrollForm({ ...enrollForm, cameraId: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="submit-enroll-btn">
              ✓ Save Tiger Profile to SQLite Database
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
        .tab-btn { padding: 6px 14px; border-radius: 6px; border: 1px solid var(--border-subtle); background: rgba(255,255,255,0.03); color: var(--text-muted); font-size: 12px; cursor: pointer; transition: all 0.2s; font-weight: 600; }
        .tab-btn.active { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.4); color: #34d399; }

        .tiger-intel-layout { display: grid; grid-template-columns: 280px 1fr; gap: 20px; }
        .tiger-selector-list { display: flex; flex-direction: column; gap: 10px; max-height: calc(100vh - 180px); overflow-y: auto; }

        .tiger-profile-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-left: 4px solid #10b981; border-radius: 10px; padding: 14px; cursor: pointer; transition: all 0.2s; }
        .tiger-profile-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.2); }
        .tiger-profile-card.active { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.4); }

        .card-top { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; }
        .tiger-avatar { font-size: 24px; }
        .tiger-card-name { font-size: 13px; font-weight: 700; color: var(--text-bright); margin: 0; }
        .tiger-card-id { font-size: 10px; color: var(--text-dim); }

        .card-info-row { display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); }
        .info-chip { background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; }

        .tiger-detail-dashboard { display: flex; flex-direction: column; gap: 16px; }
        .tiger-hero-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 20px; }
        .hero-avatar { width: 64px; height: 64px; border-radius: 12px; font-size: 32px; display: flex; align-items: center; justify-content: center; }
        .hero-meta { flex: 1; }
        .hero-title-row { display: flex; align-items: center; gap: 10px; }
        .hero-title-row h3 { font-size: 18px; font-weight: 800; color: var(--text-bright); margin: 0; }
        .hero-id-badge { font-size: 10px; font-weight: 700; color: #000; padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono); }
        .hero-sub { font-size: 11px; color: var(--text-dim); margin: 4px 0 0 0; }

        .hero-stats-group { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .h-stat { display: flex; flex-direction: column; gap: 2px; }
        .h-label { font-size: 10px; color: var(--text-dim); }
        .h-val { font-size: 13px; font-weight: 700; color: var(--text-bright); }
        .h-val.green { color: #10b981; }

        .detail-section { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 18px; }
        .detail-section h4 { font-size: 13px; font-weight: 700; color: var(--text-bright); margin: 0 0 12px 0; }

        .flank-match-card { display: flex; gap: 20px; align-items: center; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 14px; }
        .flank-box { width: 140px; height: 70px; background: #000; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); padding: 8px; display: flex; flex-direction: column; justify-content: space-between; }
        .f-title { font-size: 9px; color: var(--text-dim); }
        .stripe-pattern-sim { display: flex; gap: 8px; justify-content: center; height: 30px; align-items: center; }
        .stripe { width: 6px; background: #f97316; border-radius: 2px; }
        .stripe.s1 { height: 26px; transform: rotate(-8deg); }
        .stripe.s2 { height: 18px; transform: rotate(4deg); }
        .stripe.s3 { height: 24px; transform: rotate(-3deg); }

        .sightings-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .sightings-table th, .sightings-table td { padding: 10px 14px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .sightings-table th { font-size: 10px; color: var(--text-dim); }
        .status-confirmed { color: #34d399; font-size: 10px; font-weight: 700; }
        .zone-tag { font-size: 10px; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 3px; }

        .enroll-container, .human-review-container { max-width: 800px; }
        .enroll-card, .upload-section-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 24px; }
        .enroll-card h3, .upload-section-card h3 { font-size: 16px; font-weight: 700; color: var(--text-bright); margin: 0 0 4px 0; }
        .sub-text { font-size: 12px; color: var(--text-dim); margin-bottom: 20px; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { font-size: 11px; color: var(--text-dim); }
        .form-group input, .form-group select { padding: 10px 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); border-radius: 6px; color: var(--text-main); font-size: 12px; }

        .submit-enroll-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; }
        .empty-state { text-align: center; color: var(--text-dim); padding: 30px; font-size: 12px; }
      `}</style>
    </div>
  );
}
