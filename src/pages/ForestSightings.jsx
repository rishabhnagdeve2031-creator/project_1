import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Eye, Plus, X, MapPin, Camera, Search } from 'lucide-react';

export default function ForestSightings() {
  const { user } = useAuth();
  const [sightings, setSightings] = useState([]);
  const [tigers, setTigers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState('all');

  const [newSighting, setNewSighting] = useState({
    tiger_id: '',
    lat: '21.730',
    lng: '79.310',
    timestamp: new Date().toLocaleString(),
    camera_id: '',
    zone: 'Core Zone',
    confidence: '90',
    detection_type: 'Field Observation',
    notes: ''
  });

  useEffect(() => {
    loadData();

    // Realtime updates
    const channel = supabase
      .channel('forest-sightings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sightings_secure' }, () => {
        loadData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: sightingData } = await supabase.from('sightings').select('*').order('created_at', { ascending: false });
      const { data: tigerData } = await supabase.from('tigers').select('id, name, color');
      setSightings(sightingData || []);
      setTigers(tigerData || []);
    } catch (err) {
      console.error('Error loading sightings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSighting = async (e) => {
    e.preventDefault();
    try {
      const sightingRecord = {
        tiger_id: newSighting.tiger_id || null,
        lat: parseFloat(newSighting.lat),
        lng: parseFloat(newSighting.lng),
        timestamp: newSighting.timestamp,
        camera_id: newSighting.camera_id || 'MANUAL',
        zone: newSighting.zone,
        confidence: parseInt(newSighting.confidence),
        detection_type: newSighting.detection_type,
        status: 'Confirmed'
      };

      // Insert into sightings_secure (the actual table)
      const { error } = await supabase.from('sightings_secure').insert(sightingRecord);
      if (error) throw error;

      setShowAddForm(false);
      setNewSighting({
        tiger_id: '', lat: '21.730', lng: '79.310',
        timestamp: new Date().toLocaleString(), camera_id: '',
        zone: 'Core Zone', confidence: '90',
        detection_type: 'Field Observation', notes: ''
      });
      loadData();
    } catch (err) {
      console.error('Error adding sighting:', err);
      alert('Failed to add sighting: ' + err.message);
    }
  };

  // Filter/search
  let filtered = sightings;
  if (searchQuery) {
    filtered = filtered.filter(s =>
      s.tiger_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.camera_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.zone?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  if (filterSource !== 'all') {
    filtered = filtered.filter(s => s.detection_type === filterSource);
  }

  const sources = [...new Set(sightings.map(s => s.detection_type).filter(Boolean))];

  return (
    <div className="fs-page">
      <div className="fs-header">
        <div>
          <h1 className="fs-title">Sighting Management</h1>
          <p className="fs-subtitle font-mono">OBSERVATION LOG — ALL CONFIRMED SIGHTINGS</p>
        </div>
        <button className="add-sighting-btn font-mono" onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4" /> ADD SIGHTING
        </button>
      </div>

      {/* Filters */}
      <div className="fs-filters">
        <div className="search-box">
          <Search className="w-4 h-4 text-stone-500" />
          <input
            type="text"
            placeholder="Search tiger, camera, zone..."
            className="search-input font-mono"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="fs-select font-mono" value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
          <option value="all">All Sources</option>
          {sources.map(s => <option key={s} value={s}>{s}</option>)}
          <option value="Camera Trap">Camera Trap</option>
          <option value="Field Observation">Field Observation</option>
          <option value="GPS Collar">GPS Collar</option>
          <option value="AI Detection">AI Detection</option>
          <option value="Manual Entry">Manual Entry</option>
        </select>
        <span className="fs-count font-mono">{filtered.length} sightings</span>
      </div>

      {/* Sightings Table */}
      {loading ? (
        <div className="fs-loading font-mono">Loading observation data...</div>
      ) : (
        <div className="fs-table-wrapper">
          <table className="fs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiger</th>
                <th>Camera</th>
                <th>Zone</th>
                <th>Date / Time</th>
                <th>Source</th>
                <th>Confidence</th>
                <th>Coordinates</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const tiger = tigers.find(t => t.id === s.tiger_id);
                return (
                  <tr key={s.id}>
                    <td className="font-mono td-id">{s.id}</td>
                    <td>
                      <div className="td-tiger">
                        {tiger && <span className="tiger-dot" style={{ backgroundColor: tiger.color }} />}
                        <span className="font-mono">{tiger?.name || s.tiger_id || '—'}</span>
                      </div>
                    </td>
                    <td className="font-mono">{s.camera_id}</td>
                    <td><span className="zone-tag">{s.zone}</span></td>
                    <td>{s.timestamp}</td>
                    <td><span className="source-tag font-mono">{s.detection_type}</span></td>
                    <td className="font-mono conf-cell">{s.confidence}%</td>
                    <td className="font-mono coord-cell">{s.lat?.toFixed(4)}, {s.lng?.toFixed(4)}</td>
                    <td><span className="status-tag">{s.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="fs-loading font-mono">No sightings match current filters.</div>
          )}
        </div>
      )}

      {/* Add Sighting Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-mono">ADD NEW SIGHTING</h3>
              <button onClick={() => setShowAddForm(false)}><X className="w-5 h-5 text-stone-400" /></button>
            </div>
            <form onSubmit={handleAddSighting} className="modal-form">
              <div className="form-row">
                <label className="form-label font-mono">Tiger</label>
                <select className="form-input font-mono" value={newSighting.tiger_id} onChange={(e) => setNewSighting(p => ({...p, tiger_id: e.target.value}))}>
                  <option value="">Select Tiger...</option>
                  {tigers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.id})</option>)}
                </select>
              </div>
              <div className="form-row-double">
                <div className="form-row">
                  <label className="form-label font-mono">Latitude</label>
                  <input className="form-input font-mono" type="number" step="0.0001" value={newSighting.lat} onChange={(e) => setNewSighting(p => ({...p, lat: e.target.value}))} required />
                </div>
                <div className="form-row">
                  <label className="form-label font-mono">Longitude</label>
                  <input className="form-input font-mono" type="number" step="0.0001" value={newSighting.lng} onChange={(e) => setNewSighting(p => ({...p, lng: e.target.value}))} required />
                </div>
              </div>
              <div className="form-row-double">
                <div className="form-row">
                  <label className="form-label font-mono">Date & Time</label>
                  <input className="form-input" type="text" value={newSighting.timestamp} onChange={(e) => setNewSighting(p => ({...p, timestamp: e.target.value}))} />
                </div>
                <div className="form-row">
                  <label className="form-label font-mono">Camera ID</label>
                  <input className="form-input font-mono" type="text" placeholder="e.g. CT-005" value={newSighting.camera_id} onChange={(e) => setNewSighting(p => ({...p, camera_id: e.target.value}))} />
                </div>
              </div>
              <div className="form-row-double">
                <div className="form-row">
                  <label className="form-label font-mono">Source</label>
                  <select className="form-input font-mono" value={newSighting.detection_type} onChange={(e) => setNewSighting(p => ({...p, detection_type: e.target.value}))}>
                    <option>Camera Trap</option>
                    <option>Field Observation</option>
                    <option>GPS Collar</option>
                    <option>AI Detection</option>
                    <option>Manual Entry</option>
                  </select>
                </div>
                <div className="form-row">
                  <label className="form-label font-mono">Confidence %</label>
                  <input className="form-input font-mono" type="number" min="1" max="100" value={newSighting.confidence} onChange={(e) => setNewSighting(p => ({...p, confidence: e.target.value}))} />
                </div>
              </div>
              <div className="form-row">
                <label className="form-label font-mono">Zone</label>
                <select className="form-input font-mono" value={newSighting.zone} onChange={(e) => setNewSighting(p => ({...p, zone: e.target.value}))}>
                  <option>Core Zone</option>
                  <option>Buffer Zone</option>
                  <option>Boundary Zone</option>
                </select>
              </div>
              <div className="form-row">
                <label className="form-label font-mono">Notes (Optional)</label>
                <textarea className="form-input form-textarea" value={newSighting.notes} onChange={(e) => setNewSighting(p => ({...p, notes: e.target.value}))} placeholder="Additional observation notes..." />
              </div>
              <button type="submit" className="submit-btn font-mono">SUBMIT SIGHTING</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .fs-page { padding: 0; }
        .fs-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
        .fs-title { font-size: 20px; font-weight: 800; color: var(--text-bright); margin: 0; }
        .fs-subtitle { font-size: 10px; color: var(--forest-green-light); letter-spacing: 2px; margin-top: 4px; }

        .add-sighting-btn {
          display: flex; align-items: center; gap: 6px; padding: 8px 16px;
          background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.4);
          color: #34d399; font-size: 11px; font-weight: 700; border-radius: 6px;
          cursor: pointer; transition: all 0.2s; letter-spacing: 0.5px;
        }
        .add-sighting-btn:hover { background: rgba(16,185,129,0.2); box-shadow: 0 0 10px rgba(16,185,129,0.15); }

        .fs-filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
        .search-box { display: flex; align-items: center; gap: 8px; background: rgba(14,22,17,0.8); border: 1px solid rgba(45,92,66,0.3); border-radius: 6px; padding: 0 12px; flex: 1; min-width: 200px; }
        .search-input { background: transparent; border: none; color: var(--text-bright); font-size: 12px; padding: 8px 0; outline: none; width: 100%; }
        .search-input::placeholder { color: var(--text-dim); }
        .fs-select { font-size: 11px; padding: 7px 10px; background: rgba(14,22,17,0.8); border: 1px solid rgba(45,92,66,0.3); color: var(--text-bright); border-radius: 6px; cursor: pointer; outline: none; }
        .fs-count { font-size: 10px; color: var(--text-dim); margin-left: auto; }
        .fs-loading { text-align: center; color: var(--text-dim); font-size: 12px; padding: 40px; }

        .fs-table-wrapper { overflow-x: auto; background: rgba(14,22,17,0.4); border: 1px solid rgba(45,92,66,0.2); border-radius: 10px; }
        .fs-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .fs-table th { text-align: left; padding: 10px 14px; font-size: 9px; color: var(--text-dim); letter-spacing: 1px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); text-transform: uppercase; white-space: nowrap; }
        .fs-table td { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.03); color: var(--text-main); }
        .fs-table tr:hover td { background: rgba(255,255,255,0.02); }

        .td-id { color: var(--text-dim); font-size: 10px; }
        .td-tiger { display: flex; align-items: center; gap: 6px; }
        .tiger-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .zone-tag { font-size: 10px; padding: 2px 6px; border-radius: 3px; background: rgba(16,185,129,0.1); color: #34d399; border: 1px solid rgba(16,185,129,0.2); white-space: nowrap; }
        .source-tag { font-size: 10px; padding: 2px 6px; border-radius: 3px; background: rgba(6,182,212,0.1); color: #22d3ee; border: 1px solid rgba(6,182,212,0.2); white-space: nowrap; }
        .conf-cell { color: #10b981; font-weight: 700; }
        .coord-cell { font-size: 10px; color: var(--text-dim); }
        .status-tag { font-size: 10px; padding: 2px 6px; border-radius: 3px; background: rgba(16,185,129,0.1); color: #34d399; }

        /* Modal styles (same as ForestAlerts) */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 150; display: flex; align-items: center; justify-content: center; }
        .modal-content { background: #0e1a14; border: 1px solid rgba(45,92,66,0.4); border-radius: 12px; padding: 24px; width: 90%; max-width: 520px; max-height: 85vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-header h3 { font-size: 14px; font-weight: 700; color: var(--text-bright); letter-spacing: 1px; margin: 0; }
        .modal-header button { background: none; border: none; cursor: pointer; }
        .modal-form { display: flex; flex-direction: column; gap: 14px; }
        .form-row { display: flex; flex-direction: column; gap: 4px; }
        .form-row-double { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-label { font-size: 9px; color: var(--text-dim); letter-spacing: 1px; font-weight: 600; }
        .form-input { padding: 8px 12px; background: rgba(14,22,17,0.8); border: 1px solid rgba(45,92,66,0.3); color: var(--text-bright); border-radius: 6px; font-size: 12px; outline: none; }
        .form-input:focus { border-color: var(--forest-green); box-shadow: 0 0 8px var(--forest-green-glow); }
        .form-textarea { min-height: 60px; resize: vertical; }
        .submit-btn { padding: 10px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); color: #34d399; font-size: 11px; font-weight: 700; border-radius: 6px; cursor: pointer; letter-spacing: 1px; transition: all 0.2s; }
        .submit-btn:hover { background: rgba(16,185,129,0.25); }
      `}</style>
    </div>
  );
}
