import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function Observations() {
  const { observations, tigerProfiles, cameras } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTigerFilter, setSelectedTigerFilter] = useState('all');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('all');

  const filtered = observations.filter(obs => {
    const matchesSearch = obs.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.tigerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.cameraId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTiger = selectedTigerFilter === 'all' || obs.tigerId === selectedTigerFilter;
    const matchesZone = selectedZoneFilter === 'all' || obs.zone === selectedZoneFilter;

    return matchesSearch && matchesTiger && matchesZone;
  });

  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">📋 Camera Trap Observations Log</h2>
          <p className="page-subtitle">Pench Tiger Reserve — Searchable Telemetry & Sightings Records ({observations.length} Total Logs)</p>
        </div>
      </div>

      <div className="obs-controls-bar">
        <input
          type="text"
          placeholder="🔍 Search Observation ID, Tiger ID, or Camera..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="filter-dropdowns">
          <select value={selectedTigerFilter} onChange={(e) => setSelectedTigerFilter(e.target.value)} className="select-filter">
            <option value="all">Filter by Tiger (All)</option>
            {tigerProfiles.map(t => (
              <option key={t.id} value={t.id}>{t.id} - {t.name}</option>
            ))}
          </select>

          <select value={selectedZoneFilter} onChange={(e) => setSelectedZoneFilter(e.target.value)} className="select-filter">
            <option value="all">Filter by Zone (All)</option>
            <option value="Core Zone">Core Zone</option>
            <option value="Buffer Zone">Buffer Zone</option>
            <option value="Boundary Zone">Boundary Zone</option>
          </select>
        </div>
      </div>

      <div className="obs-table-container">
        <table className="obs-table">
          <thead>
            <tr>
              <th>Observation ID</th>
              <th>Tiger ID</th>
              <th>Camera Station</th>
              <th>Timestamp</th>
              <th>Zone</th>
              <th>AI Confidence</th>
              <th>Detection Type</th>
              <th>Coordinates</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(obs => (
              <tr key={obs.id}>
                <td className="font-mono highlight-id">{obs.id}</td>
                <td>
                  <span className="tiger-pill">🐅 {obs.tigerId}</span>
                </td>
                <td className="font-mono">{obs.cameraId}</td>
                <td>{obs.timestamp}</td>
                <td>
                  <span className={`zone-badge ${obs.zone.toLowerCase().replace(' ', '-')}`}>
                    {obs.zone}
                  </span>
                </td>
                <td className="font-mono conf-cell">{obs.confidence}%</td>
                <td><span className="det-type-tag">{obs.detectionType}</span></td>
                <td className="font-mono coords-cell">{obs.lat?.toFixed(4)}°N, {obs.lng?.toFixed(4)}°E</td>
                <td><span className="status-confirmed">Confirmed</span></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="9" className="empty-row">No observations found matching search parameters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .pg-page { padding: 20px 24px; overflow-y: auto; height: 100%; }
        .page-header { margin-bottom: 20px; }
        .page-title { font-size: 20px; font-weight: 700; color: var(--text-bright); margin: 0 0 4px 0; }
        .page-subtitle { font-size: 12px; color: var(--text-dim); margin: 0; }

        .obs-controls-bar { display: flex; gap: 14px; margin-bottom: 16px; flex-wrap: wrap; }
        .search-input {
          flex: 1; min-width: 250px; padding: 8px 14px; background: var(--bg-card);
          border: 1px solid var(--border-subtle); border-radius: 8px; color: var(--text-main); font-size: 12px;
        }

        .filter-dropdowns { display: flex; gap: 10px; }
        .select-filter {
          padding: 8px 12px; background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: 8px; color: var(--text-main); font-size: 12px;
        }

        .obs-table-container {
          background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 10px; overflow: hidden;
        }

        .obs-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .obs-table th, .obs-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .obs-table th { background: rgba(0,0,0,0.2); font-size: 11px; color: var(--text-dim); font-weight: 600; }

        .highlight-id { color: var(--text-bright); font-weight: 700; }
        .tiger-pill { background: rgba(249,115,22,0.15); color: #f97316; font-weight: 600; padding: 2px 8px; border-radius: 4px; font-size: 11px; }

        .zone-badge { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
        .zone-badge.core-zone { background: rgba(16,185,129,0.15); color: #34d399; }
        .zone-badge.buffer-zone { background: rgba(245,158,11,0.15); color: #fbbf24; }
        .zone-badge.boundary-zone { background: rgba(239,68,68,0.15); color: #f87171; }

        .conf-cell { color: #10b981; font-weight: 700; }
        .det-type-tag { font-size: 10px; color: var(--text-muted); background: rgba(255,255,255,0.04); padding: 2px 6px; border-radius: 3px; }
        .coords-cell { color: var(--text-dim); font-size: 11px; }
        .status-confirmed { color: #34d399; background: rgba(16,185,129,0.1); padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }

        .empty-row { text-align: center; color: var(--text-dim); padding: 40px; }
      `}</style>
    </div>
  );
}
