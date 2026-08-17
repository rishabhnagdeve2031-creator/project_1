import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Plus, X, CheckCircle, Clock, UserCheck, FileText, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

export default function ForestAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [tigers, setTigers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Create form state
  const [createForm, setCreateForm] = useState({
    alert_type: 'Tiger entered buffer zone',
    severity: 'HIGH',
    tiger_id: '',
    latitude: '21.730',
    longitude: '79.310',
    zone: 'Buffer Zone',
    description: '',
  });

  // Resolution notes
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    loadData();

    // Setup realtime subscription
    const channel = supabase
      .channel('forest-alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
        loadData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: alertData } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
      const { data: tigerData } = await supabase.from('tigers').select('id, name');
      setAlerts(alertData || []);
      setTigers(tigerData || []);
    } catch (err) {
      console.error('Error loading alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Alert CRUD
  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      const newAlert = {
        ...createForm,
        latitude: parseFloat(createForm.latitude),
        longitude: parseFloat(createForm.longitude),
        tiger_id: createForm.tiger_id || null,
        status: 'NEW',
        created_by: user?.id || null,
      };
      const { error } = await supabase.from('alerts').insert(newAlert);
      if (error) throw error;

      // Create audit entry
      await supabase.from('alert_activity').insert({
        alert_id: null, // Will need trigger or post-insert
        user_id: user?.id,
        action: 'ALERT_CREATED',
        new_status: 'NEW',
        notes: createForm.description,
      });

      setShowCreateForm(false);
      setCreateForm({ alert_type: 'Tiger entered buffer zone', severity: 'HIGH', tiger_id: '', latitude: '21.730', longitude: '79.310', zone: 'Buffer Zone', description: '' });
      loadData();
    } catch (err) {
      console.error('Error creating alert:', err);
      alert('Failed to create alert: ' + err.message);
    }
  };

  const updateAlertStatus = async (alertId, newStatus, prevStatus) => {
    try {
      const updateFields = { status: newStatus, updated_at: new Date().toISOString() };

      if (newStatus === 'ACKNOWLEDGED') {
        updateFields.acknowledged_by = user?.id;
        updateFields.acknowledged_at = new Date().toISOString();
      }
      if (newStatus === 'RESOLVED') {
        updateFields.resolved_by = user?.id;
        updateFields.resolved_at = new Date().toISOString();
        updateFields.resolution_notes = resolutionNotes;
      }

      const { error } = await supabase.from('alerts').update(updateFields).eq('id', alertId);
      if (error) throw error;

      // Audit log
      await supabase.from('alert_activity').insert({
        alert_id: alertId,
        user_id: user?.id,
        action: newStatus === 'ACKNOWLEDGED' ? 'ALERT_ACKNOWLEDGED' :
                newStatus === 'IN_PROGRESS' ? 'ALERT_STATUS_CHANGED' :
                newStatus === 'RESOLVED' ? 'ALERT_RESOLVED' : 'ALERT_STATUS_CHANGED',
        previous_status: prevStatus,
        new_status: newStatus,
        notes: resolutionNotes || null,
      });

      setResolutionNotes('');
      loadData();
    } catch (err) {
      console.error('Error updating alert:', err);
    }
  };

  // Filtering
  let filteredAlerts = alerts;
  if (filterSeverity !== 'all') filteredAlerts = filteredAlerts.filter(a => a.severity === filterSeverity);
  if (filterStatus !== 'all') filteredAlerts = filteredAlerts.filter(a => a.status === filterStatus);

  const severityStyle = {
    CRITICAL: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)', text: '#f87171', glow: '0 0 8px rgba(239,68,68,0.2)' },
    HIGH: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)', text: '#fbbf24', glow: 'none' },
    MEDIUM: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.4)', text: '#60a5fa', glow: 'none' },
    LOW: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.4)', text: '#34d399', glow: 'none' }
  };

  const statusIcons = {
    NEW: <AlertTriangle className="w-3.5 h-3.5" />,
    ACKNOWLEDGED: <UserCheck className="w-3.5 h-3.5" />,
    IN_PROGRESS: <Clock className="w-3.5 h-3.5" />,
    RESOLVED: <CheckCircle className="w-3.5 h-3.5" />
  };

  return (
    <div className="fa-page">
      <div className="fa-header">
        <div>
          <h1 className="fa-title">Alert Center</h1>
          <p className="fa-subtitle font-mono">WILDLIFE THREAT MONITORING — REAL-TIME</p>
        </div>
        <button className="create-alert-btn font-mono" onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4" /> CREATE ALERT
        </button>
      </div>

      {/* Filters */}
      <div className="fa-filters">
        <select className="fa-select font-mono" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
          <option value="all">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select className="fa-select font-mono" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="NEW">New</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <span className="fa-count font-mono">{filteredAlerts.length} alerts</span>
      </div>

      {/* Alert List */}
      {loading ? (
        <div className="fa-loading font-mono">Loading alert telemetry...</div>
      ) : filteredAlerts.length === 0 ? (
        <div className="fa-loading font-mono">No alerts match current filters. System nominal.</div>
      ) : (
        <div className="fa-list">
          {filteredAlerts.map(alert => {
            const style = severityStyle[alert.severity] || severityStyle.LOW;
            const isExpanded = expandedAlert === alert.id;
            const tigerName = tigers.find(t => t.id === alert.tiger_id)?.name;

            return (
              <div key={alert.id} className="fa-card" style={{ borderLeftColor: style.text, boxShadow: style.glow }}>
                <div className="fa-card-header" onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}>
                  <div className="fa-sev-badge font-mono" style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}>
                    {alert.severity}
                  </div>
                  <div className="fa-card-info">
                    <h4 className="fa-alert-type">{alert.alert_type}</h4>
                    <p className="fa-alert-desc">{alert.description?.slice(0, 80)}</p>
                    <div className="fa-card-meta font-mono">
                      {alert.tiger_id && <span>🐅 {tigerName || alert.tiger_id}</span>}
                      <span><MapPin className="w-3 h-3 inline" /> {alert.zone}</span>
                      <span>{new Date(alert.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="fa-card-status">
                    <span className="status-chip font-mono" style={{ color: style.text }}>
                      {statusIcons[alert.status]} {alert.status.replace('_', ' ')}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div className="fa-detail-panel">
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="d-label font-mono">ALERT ID</span>
                        <span className="d-value font-mono">{alert.id?.slice(0, 8)}...</span>
                      </div>
                      <div className="detail-item">
                        <span className="d-label font-mono">COORDINATES</span>
                        <span className="d-value font-mono">{alert.latitude}°N, {alert.longitude}°E</span>
                      </div>
                      <div className="detail-item">
                        <span className="d-label font-mono">ZONE</span>
                        <span className="d-value">{alert.zone}</span>
                      </div>
                      <div className="detail-item">
                        <span className="d-label font-mono">CREATED</span>
                        <span className="d-value">{new Date(alert.created_at).toLocaleString()}</span>
                      </div>
                      {alert.acknowledged_at && (
                        <div className="detail-item">
                          <span className="d-label font-mono">ACKNOWLEDGED</span>
                          <span className="d-value">{new Date(alert.acknowledged_at).toLocaleString()}</span>
                        </div>
                      )}
                      {alert.resolved_at && (
                        <div className="detail-item">
                          <span className="d-label font-mono">RESOLVED</span>
                          <span className="d-value">{new Date(alert.resolved_at).toLocaleString()}</span>
                        </div>
                      )}
                      {alert.resolution_notes && (
                        <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                          <span className="d-label font-mono">RESOLUTION NOTES</span>
                          <span className="d-value">{alert.resolution_notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="fa-actions">
                      {alert.status === 'NEW' && (
                        <button className="action-btn ack font-mono" onClick={() => updateAlertStatus(alert.id, 'ACKNOWLEDGED', alert.status)}>
                          <UserCheck className="w-3.5 h-3.5" /> ACKNOWLEDGE
                        </button>
                      )}
                      {(alert.status === 'ACKNOWLEDGED') && (
                        <button className="action-btn progress font-mono" onClick={() => updateAlertStatus(alert.id, 'IN_PROGRESS', alert.status)}>
                          <Clock className="w-3.5 h-3.5" /> MARK IN PROGRESS
                        </button>
                      )}
                      {(alert.status === 'IN_PROGRESS' || alert.status === 'ACKNOWLEDGED') && (
                        <div className="resolve-section">
                          <textarea
                            className="resolve-textarea font-mono"
                            placeholder="Resolution notes..."
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                          />
                          <button className="action-btn resolve font-mono" onClick={() => updateAlertStatus(alert.id, 'RESOLVED', alert.status)}>
                            <CheckCircle className="w-3.5 h-3.5" /> RESOLVE
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-mono">CREATE ALERT</h3>
              <button onClick={() => setShowCreateForm(false)}><X className="w-5 h-5 text-stone-400" /></button>
            </div>
            <form onSubmit={handleCreateAlert} className="modal-form">
              <div className="form-row">
                <label className="form-label font-mono">Alert Type</label>
                <input className="form-input" value={createForm.alert_type} onChange={(e) => setCreateForm(p => ({...p, alert_type: e.target.value}))} required />
              </div>
              <div className="form-row">
                <label className="form-label font-mono">Severity</label>
                <select className="form-input font-mono" value={createForm.severity} onChange={(e) => setCreateForm(p => ({...p, severity: e.target.value}))}>
                  <option>CRITICAL</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option>
                </select>
              </div>
              <div className="form-row">
                <label className="form-label font-mono">Tiger (Optional)</label>
                <select className="form-input font-mono" value={createForm.tiger_id} onChange={(e) => setCreateForm(p => ({...p, tiger_id: e.target.value}))}>
                  <option value="">None</option>
                  {tigers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.id})</option>)}
                </select>
              </div>
              <div className="form-row-double">
                <div className="form-row">
                  <label className="form-label font-mono">Latitude</label>
                  <input className="form-input font-mono" type="number" step="0.001" value={createForm.latitude} onChange={(e) => setCreateForm(p => ({...p, latitude: e.target.value}))} required />
                </div>
                <div className="form-row">
                  <label className="form-label font-mono">Longitude</label>
                  <input className="form-input font-mono" type="number" step="0.001" value={createForm.longitude} onChange={(e) => setCreateForm(p => ({...p, longitude: e.target.value}))} required />
                </div>
              </div>
              <div className="form-row">
                <label className="form-label font-mono">Zone</label>
                <select className="form-input font-mono" value={createForm.zone} onChange={(e) => setCreateForm(p => ({...p, zone: e.target.value}))}>
                  <option>Core Zone</option><option>Buffer Zone</option><option>Boundary Zone</option>
                </select>
              </div>
              <div className="form-row">
                <label className="form-label font-mono">Description</label>
                <textarea className="form-input form-textarea" value={createForm.description} onChange={(e) => setCreateForm(p => ({...p, description: e.target.value}))} required />
              </div>
              <button type="submit" className="submit-btn font-mono">CREATE ALERT</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .fa-page { padding: 0; }
        .fa-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
        .fa-title { font-size: 20px; font-weight: 800; color: var(--text-bright); margin: 0; }
        .fa-subtitle { font-size: 10px; color: var(--forest-green-light); letter-spacing: 2px; margin-top: 4px; }

        .create-alert-btn {
          display: flex; align-items: center; gap: 6px; padding: 8px 16px;
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.4);
          color: #f87171; font-size: 11px; font-weight: 700; border-radius: 6px;
          cursor: pointer; transition: all 0.2s; letter-spacing: 0.5px;
        }
        .create-alert-btn:hover { background: rgba(239,68,68,0.2); box-shadow: 0 0 10px rgba(239,68,68,0.15); }

        .fa-filters { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
        .fa-select { font-size: 11px; padding: 6px 10px; background: rgba(14,22,17,0.8); border: 1px solid rgba(45,92,66,0.3); color: var(--text-bright); border-radius: 5px; outline: none; cursor: pointer; }
        .fa-count { font-size: 10px; color: var(--text-dim); margin-left: auto; }
        .fa-loading { text-align: center; color: var(--text-dim); font-size: 12px; padding: 40px; }

        .fa-list { display: flex; flex-direction: column; gap: 10px; }
        .fa-card {
          background: rgba(14,22,17,0.6); border: 1px solid rgba(45,92,66,0.2);
          border-left: 4px solid; border-radius: 10px; overflow: hidden;
          transition: all 0.2s ease;
        }
        .fa-card:hover { border-color: rgba(45,92,66,0.4); }

        .fa-card-header { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; cursor: pointer; }
        .fa-sev-badge { font-size: 9px; font-weight: 700; padding: 4px 10px; border-radius: 4px; border: 1px solid; white-space: nowrap; letter-spacing: 0.5px; }
        .fa-card-info { flex: 1; }
        .fa-alert-type { font-size: 14px; font-weight: 600; color: var(--text-bright); margin: 0; }
        .fa-alert-desc { font-size: 11px; color: var(--text-muted); margin-top: 3px; }
        .fa-card-meta { display: flex; gap: 14px; font-size: 10px; color: var(--text-dim); margin-top: 6px; flex-wrap: wrap; }
        .fa-card-status { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
        .status-chip { display: flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; }

        .fa-detail-panel { padding: 0 16px 16px; border-top: 1px solid rgba(255,255,255,0.04); }
        .detail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin: 12px 0; }
        .detail-item { display: flex; flex-direction: column; gap: 2px; }
        .d-label { font-size: 8px; color: var(--text-dim); letter-spacing: 1px; font-weight: 600; }
        .d-value { font-size: 12px; color: var(--text-main); }

        .fa-actions { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; align-items: flex-start; }
        .action-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer; border: 1px solid; transition: all 0.2s; letter-spacing: 0.5px; }
        .action-btn.ack { background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.4); color: #60a5fa; }
        .action-btn.ack:hover { background: rgba(59,130,246,0.2); }
        .action-btn.progress { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.4); color: #fbbf24; }
        .action-btn.progress:hover { background: rgba(245,158,11,0.2); }
        .action-btn.resolve { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.4); color: #34d399; }
        .action-btn.resolve:hover { background: rgba(16,185,129,0.2); }

        .resolve-section { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .resolve-textarea { width: 100%; min-height: 60px; padding: 8px; background: rgba(14,22,17,0.8); border: 1px solid rgba(45,92,66,0.3); color: var(--text-bright); border-radius: 6px; font-size: 11px; resize: vertical; outline: none; }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 150; display: flex; align-items: center; justify-content: center; }
        .modal-content { background: #0e1a14; border: 1px solid rgba(45,92,66,0.4); border-radius: 12px; padding: 24px; width: 90%; max-width: 500px; max-height: 80vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-header h3 { font-size: 14px; font-weight: 700; color: var(--text-bright); letter-spacing: 1px; margin: 0; }
        .modal-header button { background: none; border: none; cursor: pointer; }
        .modal-form { display: flex; flex-direction: column; gap: 14px; }
        .form-row { display: flex; flex-direction: column; gap: 4px; }
        .form-row-double { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-label { font-size: 9px; color: var(--text-dim); letter-spacing: 1px; font-weight: 600; }
        .form-input { padding: 8px 12px; background: rgba(14,22,17,0.8); border: 1px solid rgba(45,92,66,0.3); color: var(--text-bright); border-radius: 6px; font-size: 12px; outline: none; }
        .form-input:focus { border-color: var(--forest-green); box-shadow: 0 0 8px var(--forest-green-glow); }
        .form-textarea { min-height: 80px; resize: vertical; }
        .submit-btn { padding: 10px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); color: #34d399; font-size: 11px; font-weight: 700; border-radius: 6px; cursor: pointer; letter-spacing: 1px; transition: all 0.2s; }
        .submit-btn:hover { background: rgba(16,185,129,0.25); }
      `}</style>
    </div>
  );
}
