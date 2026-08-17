import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import ForestSidebar from './ForestSidebar';
import NotificationCenter from './NotificationCenter';
import { Menu, X, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

export default function ForestLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newAlertsCount, setNewAlertsCount] = useState(0);
  const [toastNotification, setToastNotification] = useState(null);
  const { addAlert } = useAppContext();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // ── Setup Supabase Realtime Alert Listener ───────────────────
  useEffect(() => {
    // Read current notifications or setup subscription
    const alertsChannel = supabase
      .channel('public:alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          console.log('Realtime alert received:', payload.new);
          
          // Trigger local context update if applicable
          if (addAlert) {
            addAlert(payload.new);
          }

          // Trigger toast notification
          setToastNotification(payload.new);
          setNewAlertsCount(prev => prev + 1);

          // Play warning tone if critical
          if (payload.new.severity === 'CRITICAL') {
            try {
              const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(660, audioCtx.currentTime); // A5
              gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
              oscillator.start();
              oscillator.stop(audioCtx.currentTime + 0.35);
            } catch (err) {
              console.warn('Could not play audio alert:', err);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(alertsChannel);
    };
  }, [addAlert]);

  const handleViewAlert = (alertId) => {
    setToastNotification(null);
    navigate(`/forest-alerts?id=${alertId}`);
  };

  return (
    <div className="forest-layout-shell">
      {/* Top Header Navbar */}
      <header className="forest-navbar">
        <div className="navbar-left">
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="brand-group">
            <h1 className="brand-title">TIGER MARG</h1>
            <span className="brand-portal-label font-mono">FOREST DEPARTMENT PORTAL</span>
            <span className="brand-reserve font-serif">PENCH TIGER RESERVE</span>
          </div>
        </div>

        <div className="navbar-right">
          <div className="notifications-indicator" onClick={() => navigate('/forest-alerts')}>
            <Bell className="w-5 h-5 text-stone-300 hover:text-emerald-400 cursor-pointer transition-colors" />
            {newAlertsCount > 0 && (
              <span className="count-badge animate-pulse">{newAlertsCount}</span>
            )}
          </div>
        </div>
      </header>

      <div className="forest-layout-body">
        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div className="sidebar-backdrop" onClick={closeSidebar} />
        )}

        <ForestSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        <main className="forest-viewport" onClick={closeSidebar}>
          <Outlet />
        </main>
      </div>

      {/* Global Toast Notification System */}
      {toastNotification && (
        <NotificationCenter 
          alert={toastNotification} 
          onClose={() => setToastNotification(null)}
          onView={() => handleViewAlert(toastNotification.id)}
        />
      )}

      <style>{`
        .forest-layout-shell {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background-color: #040806;
          color: var(--text-main);
          font-family: var(--font-sans);
        }

        .forest-navbar {
          height: 64px;
          background: rgba(14, 22, 17, 0.95);
          border-bottom: 1px solid rgba(45, 92, 66, 0.4);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          z-index: 90;
          backdrop-filter: blur(10px);
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .sidebar-toggle-btn {
          display: none;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-bright);
          width: 38px;
          height: 38px;
          border-radius: 6px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        @media (max-width: 768px) {
          .sidebar-toggle-btn {
            display: flex;
          }
        }

        .brand-group {
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }

        .brand-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-bright);
          letter-spacing: 0.5px;
          margin: 0;
          line-height: 1;
        }

        .brand-portal-label {
          font-size: 9px;
          color: var(--forest-green-light);
          border: 1px solid rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.08);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .brand-reserve {
          font-size: 11px;
          color: var(--text-dim);
          letter-spacing: 1px;
        }

        .notifications-indicator {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          cursor: pointer;
        }

        .notifications-indicator:hover {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.2);
        }

        .count-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ef4444;
          color: white;
          font-size: 9px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
        }

        .forest-layout-body {
          display: flex;
          flex: 1;
          height: calc(100vh - 64px);
          overflow: hidden;
          position: relative;
        }

        .sidebar-backdrop {
          position: absolute;
          z-index: 95;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(2px);
          animation: fadeIn 0.25s ease;
        }

        .forest-viewport {
          flex: 1;
          height: 100%;
          overflow-y: auto;
          background-color: #0b0f14;
          padding: 24px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
