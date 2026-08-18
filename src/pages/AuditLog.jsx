import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function AuditLog() {
  const { auditLog, isRealMode } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [actorFilter, setActorFilter] = useState('all');

  const filtered = auditLog.filter(item => {
    const act = item.actor || '';
    const action = item.action || item.title || '';
    const details = item.details || '';
    const id = item.id || '';

    const matchesSearch = action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActor = actorFilter === 'all' || act === actorFilter;
    return matchesSearch && matchesActor;
  });

  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Persistent Audit Trail</h2>
          <p className="page-subtitle">
            {isRealMode ? 'Real SQLite Audit Log Records' : 'Demo Action History'} ({auditLog.length} events logged)
          </p>
        </div>
      </div>

      <div className="audit-controls">
        <input
          type="text"
          placeholder="🔍 Search action, details, entity, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select value={actorFilter} onChange={(e) => setActorFilter(e.target.value)} className="actor-select">
          <option value="all">Filter by Actor (All)</option>
          <option value="System">System</option>
          <option value="Human Operator">Human Operator</option>
          <option value="Batch Processor">Batch Processor</option>
          <option value="YOLO Inference">YOLO Inference</option>
          <option value="Forest Officer">Forest Officer</option>
        </select>
      </div>

      <div className="audit-timeline-card">
        <div className="timeline-list">
          {filtered.map(item => {
            const aId = item.id;
            const aTime = item.timestamp;
            const aActor = item.actor || 'System';
            const aAction = item.action || item.title || 'ACTION_LOGGED';
            const aDetails = item.details || '';
            const aEntity = item.entity_type || 'Event';

            return (
              <div key={aId} className="audit-item">
                <div className="audit-time font-mono">{aTime}</div>
                <div className={`audit-dot ${aActor.includes('Human') ? 'human' : 'ai'}`}></div>

                <div className="audit-body">
                  <div className="audit-title-row">
                    <span className="audit-title">{aAction}</span>
                    <span className={`actor-badge ${aActor.includes('Human') ? 'human' : 'ai'}`}>
                      {aActor}
                    </span>
                    <span className="audit-type-tag font-mono">{aEntity}</span>
                    <span className="audit-id font-mono">{aId}</span>
                  </div>
                  <div className="audit-details">{aDetails}</div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="empty-audit">No audit entries match current filter parameters.</div>
          )}
        </div>
      </div>

      <style>{`
        .pg-page { padding: 20px 24px; overflow-y: auto; height: 100%; }
        .page-header { margin-bottom: 20px; }
        .page-title { font-size: 20px; font-weight: 700; color: var(--text-bright); margin: 0 0 4px 0; }
        .page-subtitle { font-size: 12px; color: var(--text-dim); margin: 0; }

        .audit-controls { display: flex; gap: 14px; margin-bottom: 16px; }
        .search-input {
          flex: 1; padding: 8px 14px; background: var(--bg-card);
          border: 1px solid var(--border-subtle); border-radius: 8px; color: var(--text-main); font-size: 12px;
        }
        .actor-select {
          padding: 8px 14px; background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: 8px; color: var(--text-main); font-size: 12px;
        }

        .audit-timeline-card {
          background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 20px;
        }

        .timeline-list { display: flex; flex-direction: column; gap: 16px; position: relative; }

        .audit-item { display: flex; gap: 16px; align-items: flex-start; position: relative; }
        .audit-time { font-size: 11px; color: var(--text-dim); width: 140px; flex-shrink: 0; text-align: right; pt: 2px; }

        .audit-dot {
          width: 10px; height: 10px; border-radius: 50%; background: #10b981;
          margin-top: 4px; flex-shrink: 0; box-shadow: 0 0 8px #10b98188;
        }
        .audit-dot.human { background: #f59e0b; box-shadow: 0 0 8px #f59e0b88; }

        .audit-body {
          flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 4px;
        }

        .audit-title-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .audit-title { font-size: 13px; font-weight: 700; color: var(--text-bright); font-family: var(--font-mono); }
        .actor-badge { font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
        .actor-badge.ai { background: rgba(16,185,129,0.15); color: #34d399; }
        .actor-badge.human { background: rgba(245,158,11,0.15); color: #fbbf24; }
        .audit-type-tag { font-size: 9px; color: var(--text-muted); background: rgba(255,255,255,0.04); padding: 2px 6px; border-radius: 3px; }
        .audit-id { margin-left: auto; font-size: 10px; color: var(--text-dim); }

        .audit-details { font-size: 12px; color: var(--text-muted); line-height: 1.4; }
        .empty-audit { padding: 40px; text-align: center; color: var(--text-dim); font-size: 13px; }
      `}</style>
    </div>
  );
}
