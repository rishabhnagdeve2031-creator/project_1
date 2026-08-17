import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SightingsLineChart, AlertsDonutChart, TigerActivityBarChart, ZoneActivityBarChart } from '../components/analytics/CustomCharts';
import { Activity, Shield, Eye, AlertTriangle, Camera, MapPin, TrendingUp } from 'lucide-react';

export default function ForestDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTigers: 0,
    activeTigers: 0,
    recentSightings: 0,
    activeAlerts: 0,
    cameraTraps: 0,
    highRiskZones: 0
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [sightingsOverTime, setSightingsOverTime] = useState([]);
  const [alertsBySeverity, setAlertsBySeverity] = useState({ CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 });
  const [tigerActivity, setTigerActivity] = useState([]);
  const [zoneActivity, setZoneActivity] = useState([]);
  const [dateFilter, setDateFilter] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [dateFilter]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch tigers
      const { data: tigers } = await supabase.from('tigers').select('*');
      const tigerList = tigers || [];

      // Fetch sightings
      const { data: sightings } = await supabase.from('sightings').select('*');
      const sightingList = sightings || [];

      // Fetch alerts
      const { data: alerts } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
      const alertList = alerts || [];

      // Calculate stats
      const activeAlertCount = alertList.filter(a => a.status !== 'RESOLVED').length;
      const zones = [...new Set(sightingList.map(s => s.zone))];
      const highRisk = alertList.filter(a => (a.severity === 'CRITICAL' || a.severity === 'HIGH') && a.status !== 'RESOLVED');
      const highRiskZones = [...new Set(highRisk.map(a => a.zone))].length;

      setStats({
        totalTigers: tigerList.length,
        activeTigers: tigerList.length,
        recentSightings: sightingList.length,
        activeAlerts: activeAlertCount,
        cameraTraps: [...new Set(sightingList.map(s => s.camera_id))].length,
        highRiskZones
      });

      // Recent alerts (top 5)
      setRecentAlerts(alertList.slice(0, 5));

      // Alerts by severity
      const sevCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
      alertList.forEach(a => { if (sevCounts[a.severity] !== undefined) sevCounts[a.severity]++; });
      setAlertsBySeverity(sevCounts);

      // Tiger activity bar chart data
      const tigerCounts = tigerList.map(t => ({
        name: t.name || t.id,
        count: sightingList.filter(s => s.tiger_id === t.id).length,
        color: t.color || '#10b981'
      }));
      setTigerActivity(tigerCounts);

      // Zone activity
      const zoneMap = {};
      sightingList.forEach(s => {
        zoneMap[s.zone] = (zoneMap[s.zone] || 0) + 1;
      });
      setZoneActivity(Object.entries(zoneMap).map(([zone, count]) => ({ zone, count })));

      // Sightings over time (mock daily distribution from created_at)
      const dayMap = {};
      sightingList.forEach(s => {
        const day = s.created_at ? new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';
        dayMap[day] = (dayMap[day] || 0) + 1;
      });
      setSightingsOverTime(Object.entries(dayMap).map(([date, count]) => ({ date, count })));

    } catch (err) {
      console.error('Dashboard data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'TIGERS', value: stats.totalTigers, icon: () => <span className="text-lg">🐅</span>, color: '#f97316' },
    { label: 'ACTIVE TIGERS', value: stats.activeTigers, icon: Activity, color: '#10b981' },
    { label: 'RECENT SIGHTINGS', value: stats.recentSightings, icon: Eye, color: '#3b82f6' },
    { label: 'ACTIVE ALERTS', value: stats.activeAlerts, icon: AlertTriangle, color: stats.activeAlerts > 0 ? '#ef4444' : '#10b981' },
    { label: 'CAMERA TRAPS', value: stats.cameraTraps, icon: Camera, color: '#8b5cf6' },
    { label: 'HIGH RISK ZONES', value: stats.highRiskZones, icon: Shield, color: stats.highRiskZones > 0 ? '#f59e0b' : '#10b981' }
  ];

  const severityStyle = {
    CRITICAL: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)', text: '#f87171' },
    HIGH: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)', text: '#fbbf24' },
    MEDIUM: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.4)', text: '#60a5fa' },
    LOW: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.4)', text: '#34d399' }
  };

  return (
    <div className="fd-page">
      {/* Header */}
      <div className="fd-header">
        <div>
          <h1 className="fd-title font-serif">FOREST DEPARTMENT PORTAL</h1>
          <p className="fd-subtitle font-mono">PENCH TIGER RESERVE — WILDLIFE INTELLIGENCE SYSTEM</p>
        </div>
        <div className="fd-header-right">
          <span className="fd-user-label font-mono">{user?.email}</span>
          <select
            className="fd-date-filter font-mono"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="1">Today</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="fd-stats-grid">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="fd-stat-card">
              <div className="stat-icon-wrapper" style={{ color: card.color, borderColor: card.color + '40', backgroundColor: card.color + '10' }}>
                {typeof Icon === 'function' && card.label === 'TIGERS' ? <Icon /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="stat-value font-mono" style={{ color: card.color }}>{loading ? '—' : card.value}</div>
              <div className="stat-label font-mono">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="fd-charts-grid">
        <div className="fd-chart-card span-2">
          <h3 className="chart-title">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Tiger Sightings Over Time</span>
          </h3>
          <div className="chart-body" style={{ height: '200px' }}>
            <SightingsLineChart data={sightingsOverTime} />
          </div>
        </div>

        <div className="fd-chart-card">
          <h3 className="chart-title">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Alerts by Severity</span>
          </h3>
          <div className="chart-body" style={{ height: '200px' }}>
            <AlertsDonutChart data={alertsBySeverity} />
          </div>
        </div>

        <div className="fd-chart-card">
          <h3 className="chart-title">
            <span className="text-sm">🐅</span>
            <span>Tiger Activity</span>
          </h3>
          <div className="chart-body" style={{ height: '180px' }}>
            <TigerActivityBarChart data={tigerActivity} />
          </div>
        </div>

        <div className="fd-chart-card span-2">
          <h3 className="chart-title">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Zone Activity</span>
          </h3>
          <div className="chart-body" style={{ height: '180px' }}>
            <ZoneActivityBarChart data={zoneActivity} />
          </div>
        </div>
      </div>

      {/* Recent Alerts Feed */}
      <div className="fd-alert-feed">
        <h3 className="feed-title font-mono">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          ALERT CENTER — LATEST
        </h3>
        {recentAlerts.length === 0 && (
          <div className="empty-feed font-mono">No alerts recorded. System nominal.</div>
        )}
        {recentAlerts.map((alert) => {
          const style = severityStyle[alert.severity] || severityStyle.LOW;
          return (
            <div
              key={alert.id}
              className="alert-feed-item"
              style={{ borderLeftColor: style.text }}
            >
              <div className="afi-severity font-mono" style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
                {alert.severity}
              </div>
              <div className="afi-body">
                <div className="afi-type">{alert.alert_type}</div>
                <div className="afi-desc">{alert.description?.slice(0, 100)}</div>
                <div className="afi-meta font-mono">
                  {alert.tiger_id && <span>🐅 {alert.tiger_id}</span>}
                  <span>📍 {alert.zone}</span>
                  <span className="afi-status" style={{ color: style.text }}>{alert.status}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .fd-page { padding: 0; }

        .fd-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .fd-title { font-size: 22px; font-weight: 800; color: var(--text-bright); letter-spacing: 1px; margin: 0; }
        .fd-subtitle { font-size: 10px; color: var(--forest-green-light); letter-spacing: 2px; margin-top: 4px; }
        .fd-header-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .fd-user-label { font-size: 10px; color: var(--text-dim); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 4px 10px; border-radius: 4px; }
        .fd-date-filter {
          font-size: 11px; padding: 5px 10px; background: rgba(14,22,17,0.8); border: 1px solid rgba(45,92,66,0.4);
          color: var(--text-bright); border-radius: 6px; cursor: pointer; outline: none;
        }

        .fd-stats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }
        .fd-stat-card {
          background: rgba(14, 22, 17, 0.6);
          border: 1px solid rgba(45, 92, 66, 0.25);
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all 0.25s ease;
        }
        .fd-stat-card:hover {
          border-color: rgba(45, 92, 66, 0.5);
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          transform: translateY(-2px);
        }
        .stat-icon-wrapper {
          width: 36px; height: 36px; border-radius: 8px; display: flex;
          align-items: center; justify-content: center; border: 1px solid;
        }
        .stat-value { font-size: 28px; font-weight: 800; line-height: 1; }
        .stat-label { font-size: 9px; color: var(--text-dim); letter-spacing: 1.5px; font-weight: 600; }

        .fd-charts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .fd-chart-card {
          background: rgba(14, 22, 17, 0.5);
          border: 1px solid rgba(45, 92, 66, 0.2);
          border-radius: 10px;
          padding: 16px;
        }
        .fd-chart-card.span-2 { grid-column: span 2; }
        .chart-title {
          display: flex; align-items: center; gap: 8px; font-size: 12px;
          font-weight: 600; color: var(--text-bright); margin: 0 0 12px 0;
        }
        .chart-body { width: 100%; }
        .chart-empty {
          display: flex; align-items: center; justify-content: center;
          height: 100%; color: var(--text-dim); font-size: 11px;
        }

        .fd-alert-feed {
          background: rgba(14, 22, 17, 0.5);
          border: 1px solid rgba(45, 92, 66, 0.2);
          border-radius: 10px;
          padding: 18px;
        }
        .feed-title {
          display: flex; align-items: center; gap: 8px; font-size: 11px;
          font-weight: 700; color: var(--text-bright); letter-spacing: 1px; margin: 0 0 14px 0;
        }
        .empty-feed { text-align: center; color: var(--text-dim); font-size: 11px; padding: 20px; }

        .alert-feed-item {
          display: flex; gap: 12px; padding: 12px;
          background: rgba(255,255,255,0.015);
          border: 1px solid rgba(255,255,255,0.04);
          border-left: 3px solid;
          border-radius: 8px; margin-bottom: 8px;
          transition: background 0.15s ease;
        }
        .alert-feed-item:hover { background: rgba(255,255,255,0.03); }
        .afi-severity {
          font-size: 9px; font-weight: 700; padding: 3px 8px;
          border-radius: 4px; height: fit-content; white-space: nowrap;
        }
        .afi-body { flex: 1; }
        .afi-type { font-size: 13px; font-weight: 600; color: var(--text-bright); }
        .afi-desc { font-size: 11px; color: var(--text-muted); margin-top: 3px; }
        .afi-meta { display: flex; gap: 12px; font-size: 10px; color: var(--text-dim); margin-top: 6px; }
        .afi-status { font-weight: 700; }

        @media (max-width: 1200px) {
          .fd-stats-grid { grid-template-columns: repeat(3, 1fr); }
          .fd-charts-grid { grid-template-columns: 1fr; }
          .fd-chart-card.span-2 { grid-column: span 1; }
        }
        @media (max-width: 768px) {
          .fd-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
