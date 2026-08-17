import React, { useEffect } from 'react';
import { AlertCircle, X, ShieldAlert, Activity } from 'lucide-react';

export default function NotificationCenter({ alert, onClose, onView }) {
  // Auto close toast after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000);
    return () => clearTimeout(timer);
  }, [alert.id, onClose]);

  const severityColors = {
    CRITICAL: {
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.5)',
      text: '#f87171',
      glow: 'rgba(239, 68, 68, 0.25)'
    },
    HIGH: {
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.5)',
      text: '#fbbf24',
      glow: 'rgba(245, 158, 11, 0.2)'
    },
    MEDIUM: {
      bg: 'rgba(59, 130, 246, 0.15)',
      border: 'rgba(59, 130, 246, 0.5)',
      text: '#60a5fa',
      glow: 'rgba(59, 130, 246, 0.15)'
    },
    LOW: {
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.5)',
      text: '#34d399',
      glow: 'rgba(16, 185, 129, 0.15)'
    }
  };

  const styleConfig = severityColors[alert.severity] || severityColors.LOW;

  return (
    <div 
      className="realtime-toast"
      style={{
        backgroundColor: styleConfig.bg,
        borderColor: styleConfig.border,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.6), 0 0 15px ${styleConfig.glow}`
      }}
    >
      <div className="toast-header">
        <div className="title-row" style={{ color: styleConfig.text }}>
          {alert.severity === 'CRITICAL' ? (
            <ShieldAlert className="w-4 h-4 animate-bounce" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="severity-tag font-mono font-bold text-xs">
            {alert.severity} ALERT
          </span>
        </div>
        <button className="close-btn" onClick={onClose}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="toast-body">
        <h4 className="alert-type-title text-stone-100 font-medium text-sm">
          {alert.alert_type}
        </h4>
        <p className="alert-desc-text text-stone-300 text-xs mt-1 leading-relaxed">
          {alert.description}
        </p>

        {alert.tiger_id && (
          <div className="alert-meta-tag font-mono text-[9px] mt-2">
            <span>TARGET: {alert.tiger_id}</span>
            <span className="dot">·</span>
            <span>ZONE: {alert.zone}</span>
          </div>
        )}
      </div>

      <div className="toast-footer mt-3">
        <button className="view-action-btn font-mono" onClick={onView}>
          <Activity className="w-3.5 h-3.5" />
          <span>VIEW ALERT</span>
        </button>
      </div>

      <style>{`
        .realtime-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 320px;
          border: 1px solid;
          border-radius: 8px;
          padding: 14px;
          z-index: 200;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideIn {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .toast-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .severity-tag {
          letter-spacing: 0.5px;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: var(--text-bright);
        }

        .alert-meta-tag {
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          width: fit-content;
          padding: 2px 6px;
          border-radius: 4px;
          display: flex;
          gap: 6px;
        }

        .view-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-bright);
          width: 100%;
          padding: 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-action-btn:hover {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.4);
          color: var(--forest-green-light);
        }
      `}</style>
    </div>
  );
}
