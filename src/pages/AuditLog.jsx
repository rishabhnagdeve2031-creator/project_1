import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export default function AuditLog() {
  const { auditLog } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [actorFilter, setActorFilter] = useState('all');

  const filtered = auditLog.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActor = actorFilter === 'all' || item.actor === actorFilter;
    return matchesSearch && matchesActor;
  });

  return (
    <div className="pg-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">📜 Audit Log & System Trace</h2>
          <p className="page-subtitle">Pench Tiger Reserve — Complete Event History of AI Decisions & Human Operator Corrections</p>
        </div>
      </div>

      <div className="audit-controls">
        <input
          type="text"
          placeholder="🔍 Search action title, details, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select value={actorFilter} onChange={(e) => setActorFilter(e.target.value)} className="actor-select">
          <option value="all">Filter by Actor (All)</option>
          <option value="AI System">AI System / Pipeline</option>
          <option value="Human Operator">Human Operator</option>
          <option value="DeviationEngine">DeviationEngine</option>
          <option value="Demo Runner">Demo Runner</option>
        </select>
      </div>

      <div className="audit-timeline-card">
        <div className="timeline-list">
          {filtered.map(item => (
            <div key={item.id} className={`audit-item actor-${item.actor.toLowerCase().replace(' ', '-')}`}>
              <div className="audit-time font-mono">{item.timestamp}</div>

              <div className="audit-dot"></div>

              <div className="audit-body">
                <div className="audit-title-row">
                  <span className="audit-title">{item.title}</span>
                  <span className={`actor-badge ${item.actor.includes('Human') ? 'human' : 'ai'}`}>
                    {item.actor}
                  </span>
                  <span className="audit-type-tag">{item.type}</span>
                  <span className="audit-id font-mono">{item.id}</span>
                </div>
                <div className="audit-details">{item.details}</div>
              </div>
            </div>
          ))}

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
        .audit-time { font-size: 11px; color: var(--text-dim); width: 110px; flex-shrink: 0; text-align: right; pt: 2px; }

        .audit-dot {
          width: 10px; height: 10px; border-radius: 50%; background: #10b981;
          margin-top: 4px; flex-shrink: 0; box-shadow: 0 0 8px #10b98188;
        }
        .actor-human-operator .audit-dot { background: #f59e0b; box-shadow: 0 0 8px #f59e0b88; }
        .actor-demo-runner .audit-dot { background: #8b5cf6; box-shadow: 0 0 8px #8b5cf688; }

        .audit-body {
          flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 4px;
        }

        .audit-title-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .audit-title { font-size: 13px; font-weight: 700; color: var(--text-bright); }
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
