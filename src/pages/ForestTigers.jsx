import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Filter, ArrowUpDown, Eye, MapPin } from 'lucide-react';

export default function ForestTigers() {
  const [tigers, setTigers] = useState([]);
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSex, setFilterSex] = useState('all');
  const [filterZone, setFilterZone] = useState('all');
  const [sortBy, setSortBy] = useState('sightings');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: tigerData } = await supabase.from('tigers').select('*');
      const { data: sightingData } = await supabase.from('sightings').select('*');
      setTigers(tigerData || []);
      setSightings(sightingData || []);
    } catch (err) {
      console.error('Error loading tigers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Enrich tiger data with sighting counts
  const enrichedTigers = tigers.map(tiger => {
    const tigerSightings = sightings.filter(s => s.tiger_id === tiger.id);
    const lastSighting = tigerSightings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    return {
      ...tiger,
      sightingCount: tigerSightings.length,
      lastSighting: lastSighting?.timestamp || 'No sightings',
      lastSightingTime: lastSighting?.created_at || null,
      riskLevel: tiger.current_zone === 'Boundary Zone' ? 'HIGH' : tiger.current_zone === 'Buffer Zone' ? 'MEDIUM' : 'LOW'
    };
  });

  // Filter
  let filtered = enrichedTigers.filter(t => {
    if (searchQuery && !t.name?.toLowerCase().includes(searchQuery.toLowerCase()) && !t.id?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterZone !== 'all' && t.current_zone !== filterZone) return false;
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'sightings') return b.sightingCount - a.sightingCount;
    if (sortBy === 'risk') {
      const riskOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (riskOrder[b.riskLevel] || 0) - (riskOrder[a.riskLevel] || 0);
    }
    if (sortBy === 'latest') {
      return new Date(b.lastSightingTime || 0) - new Date(a.lastSightingTime || 0);
    }
    return 0;
  });

  const zones = [...new Set(tigers.map(t => t.current_zone).filter(Boolean))];

  const riskColors = {
    HIGH: { bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.4)' },
    MEDIUM: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.4)' },
    LOW: { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.4)' }
  };

  return (
    <div className="ft-page">
      <div className="ft-header">
        <div>
          <h1 className="ft-title">Tiger Monitoring</h1>
          <p className="ft-subtitle font-mono">REGISTERED INDIVIDUALS — PENCH TIGER RESERVE</p>
        </div>
        <div className="ft-count font-mono">{filtered.length} TIGERS</div>
      </div>

      {/* Filter Bar */}
      <div className="ft-filter-bar">
        <div className="search-box">
          <Search className="w-4 h-4 text-stone-500" />
          <input
            type="text"
            placeholder="Search by ID or name..."
            className="search-input font-mono"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select className="filter-select font-mono" value={filterZone} onChange={(e) => setFilterZone(e.target.value)}>
            <option value="all">All Zones</option>
            {zones.map(z => <option key={z} value={z}>{z}</option>)}
          </select>

          <select className="filter-select font-mono" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="sightings">Sort: Sightings</option>
            <option value="risk">Sort: Risk Level</option>
            <option value="latest">Sort: Latest Sighting</option>
          </select>
        </div>
      </div>

      {/* Tiger Cards Grid */}
      {loading ? (
        <div className="loading-state font-mono">Loading tiger telemetry data...</div>
      ) : filtered.length === 0 ? (
        <div className="loading-state font-mono">No tigers match current filters.</div>
      ) : (
        <div className="ft-grid">
          {filtered.map(tiger => {
            const risk = riskColors[tiger.riskLevel] || riskColors.LOW;
            return (
              <div
                key={tiger.id}
                className="tiger-card"
                style={{ borderLeftColor: tiger.color || '#10b981' }}
                onClick={() => navigate(`/forest-tigers/${tiger.id}`)}
              >
                <div className="tc-header">
                  <div className="tc-avatar" style={{ backgroundColor: (tiger.color || '#10b981') + '20', color: tiger.color || '#10b981' }}>
                    {tiger.emoji || '🐅'}
                  </div>
                  <div className="tc-info">
                    <h3 className="tc-name">{tiger.name}</h3>
                    <span className="tc-id font-mono">{tiger.id}</span>
                  </div>
                  <div className="tc-risk" style={{ backgroundColor: risk.bg, color: risk.text, borderColor: risk.border }}>
                    {tiger.riskLevel}
                  </div>
                </div>

                <div className="tc-stats">
                  <div className="tc-stat">
                    <span className="tc-stat-label font-mono">ZONE</span>
                    <span className="tc-stat-value">{tiger.current_zone}</span>
                  </div>
                  <div className="tc-stat">
                    <span className="tc-stat-label font-mono">SIGHTINGS</span>
                    <span className="tc-stat-value font-mono">{tiger.sightingCount}</span>
                  </div>
                  <div className="tc-stat">
                    <span className="tc-stat-label font-mono">SPEED</span>
                    <span className="tc-stat-value font-mono">{tiger.speed} km/h</span>
                  </div>
                </div>

                <div className="tc-footer font-mono">
                  <span><MapPin className="w-3 h-3 inline" /> {tiger.lat?.toFixed(4)}°N, {tiger.lng?.toFixed(4)}°E</span>
                  <span className="tc-last-seen">Last: {tiger.lastSighting}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .ft-page { padding: 0; }
        .ft-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .ft-title { font-size: 20px; font-weight: 800; color: var(--text-bright); margin: 0; }
        .ft-subtitle { font-size: 10px; color: var(--forest-green-light); letter-spacing: 2px; margin-top: 4px; }
        .ft-count { font-size: 11px; color: var(--forest-green-light); background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.3); padding: 6px 14px; border-radius: 6px; font-weight: 700; letter-spacing: 1px; }

        .ft-filter-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
        .search-box { display: flex; align-items: center; gap: 8px; background: rgba(14,22,17,0.8); border: 1px solid rgba(45,92,66,0.3); border-radius: 6px; padding: 0 12px; flex: 1; min-width: 200px; }
        .search-input { background: transparent; border: none; color: var(--text-bright); font-size: 12px; padding: 8px 0; outline: none; width: 100%; }
        .search-input::placeholder { color: var(--text-dim); }
        .filter-controls { display: flex; gap: 8px; }
        .filter-select { font-size: 11px; padding: 7px 10px; background: rgba(14,22,17,0.8); border: 1px solid rgba(45,92,66,0.3); color: var(--text-bright); border-radius: 6px; cursor: pointer; outline: none; }

        .loading-state { text-align: center; color: var(--text-dim); font-size: 12px; padding: 40px; }

        .ft-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 14px; }

        .tiger-card {
          background: rgba(14,22,17,0.6); border: 1px solid rgba(45,92,66,0.2);
          border-left: 4px solid; border-radius: 10px; padding: 16px;
          cursor: pointer; transition: all 0.25s ease;
        }
        .tiger-card:hover { border-color: rgba(45,92,66,0.5); box-shadow: 0 4px 20px rgba(0,0,0,0.3); transform: translateY(-2px); }

        .tc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .tc-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .tc-info { flex: 1; }
        .tc-name { font-size: 15px; font-weight: 700; color: var(--text-bright); margin: 0; }
        .tc-id { font-size: 10px; color: var(--text-dim); }
        .tc-risk { font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 4px; border: 1px solid; letter-spacing: 0.5px; }

        .tc-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
        .tc-stat { display: flex; flex-direction: column; gap: 2px; }
        .tc-stat-label { font-size: 8px; color: var(--text-dim); letter-spacing: 1px; font-weight: 600; }
        .tc-stat-value { font-size: 12px; color: var(--text-main); font-weight: 600; }

        .tc-footer { display: flex; justify-content: space-between; font-size: 10px; color: var(--text-dim); padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.04); }
        .tc-last-seen { color: var(--text-muted); }
      `}</style>
    </div>
  );
}
