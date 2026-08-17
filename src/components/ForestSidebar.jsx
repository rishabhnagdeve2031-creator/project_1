import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Map, 
  AlertTriangle, 
  Camera, 
  Eye, 
  BarChart2, 
  Users, 
  History, 
  Settings, 
  LogOut,
  ShieldAlert
} from 'lucide-react';

export default function ForestSidebar({ isOpen, onClose }) {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/forest-login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navItems = [
    { to: '/forest-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/forest-tigers', label: 'Tigers', icon: () => <span className="mr-2">🐅</span> },
    { to: '/forest-map', label: 'Live Map', icon: Map },
    { to: '/forest-alerts', label: 'Alert Center', icon: AlertTriangle },
    { to: '/forest-cameras', label: 'Camera Traps', icon: Camera },
    { to: '/forest-sightings', label: 'Sightings', icon: Eye },
  ];

  const adminItems = [
    { to: '/legacy/dashboard', label: 'System Home', icon: Settings },
    { to: '/legacy/audit-log', label: 'Activity Log', icon: History }
  ];

  return (
    <aside className={`forest-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-brand-section">
        <h2 className="brand-logo-text font-serif">TIGER MARG</h2>
        <span className="brand-subtitle-text font-mono">FOREST DEPARTMENT</span>
      </div>

      <div className="divider" />

      <nav className="sidebar-nav-section">
        <div className="section-header">MONITORING</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
            >
              {typeof Icon === 'function' && item.to.includes('tiger') ? <Icon /> : <Icon className="nav-icon" />}
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className="divider" />

        <div className="section-header">ADMINISTRATION</div>
        {adminItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="divider" />

      {/* Logged in Official details */}
      <div className="sidebar-footer">
        <div className="official-info">
          <div className="official-avatar">
            {user?.email?.charAt(0).toUpperCase() || 'O'}
          </div>
          <div className="official-meta">
            <div className="official-email">{user?.email || 'official@pench.gov'}</div>
            <div className="official-role font-mono">{role?.replace('_', ' ').toUpperCase() || 'OFFICIAL'}</div>
          </div>
        </div>
        <button className="logout-button font-mono" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          <span>LOGOUT</span>
        </button>
      </div>

      <style>{`
        .forest-sidebar {
          width: 260px;
          height: 100%;
          background: rgba(12, 19, 15, 0.95);
          border-right: 1px solid rgba(45, 92, 66, 0.3);
          display: flex;
          flex-direction: column;
          padding: 20px 14px;
          user-select: none;
          flex-shrink: 0;
          overflow-y: auto;
          transition: transform 0.3s ease, width 0.3s ease;
          backdrop-filter: blur(10px);
        }

        @media (max-width: 768px) {
          .forest-sidebar {
            position: absolute;
            z-index: 100;
            left: 0;
            top: 0;
            transform: translateX(-100%);
          }
          .forest-sidebar.open {
            transform: translateX(0);
          }
        }

        .sidebar-brand-section {
          padding: 6px 10px;
        }

        .brand-logo-text {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-bright);
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .brand-subtitle-text {
          font-size: 10px;
          color: var(--forest-green-light);
          letter-spacing: 2px;
          display: block;
        }

        .divider {
          height: 1px;
          background: rgba(45, 92, 66, 0.2);
          margin: 16px 0;
        }

        .sidebar-nav-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .section-header {
          font-size: 9px;
          font-family: var(--font-mono);
          color: var(--text-dim);
          letter-spacing: 1.5px;
          padding: 6px 12px;
          font-weight: 600;
        }

        .nav-link-item {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          border-radius: 6px;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .nav-link-item:hover {
          color: var(--text-bright);
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.05);
        }

        .nav-link-item.active {
          color: var(--forest-green-light);
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.05);
          font-weight: 600;
        }

        .nav-icon {
          width: 16px;
          height: 16px;
          margin-right: 10px;
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .official-info {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 8px;
          border-radius: 6px;
          overflow: hidden;
        }

        .official-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--forest-green-dark), var(--forest-green));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 14px;
          flex-shrink: 0;
        }

        .official-meta {
          overflow: hidden;
        }

        .official-email {
          font-size: 11px;
          color: var(--text-main);
          font-weight: 500;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .official-role {
          font-size: 8px;
          color: var(--forest-green-light);
          letter-spacing: 1px;
          margin-top: 1px;
        }

        .logout-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 8px;
          border-radius: 6px;
          border: 1px solid rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
          color: #f87171;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-button:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.5);
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.15);
        }
      `}</style>
    </aside>
  );
}
