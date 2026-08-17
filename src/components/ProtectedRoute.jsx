import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isOfficial, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0f14] text-stone-100 font-sans">
        <div className="relative w-16 h-16 border-t-2 border-b-2 border-emerald-500 rounded-full animate-spin">
          <div className="absolute inset-2 border-r-2 border-l-2 border-cyan-400 rounded-full animate-ping"></div>
        </div>
        <p className="mt-6 font-mono text-xs tracking-widest uppercase text-emerald-400">
          Verifying Telemetry Credentials...
        </p>
      </div>
    );
  }

  // If not logged in, or not a forest official/admin, redirect to login
  if (!user || !isOfficial) {
    return <Navigate to="/forest-login" state={{ from: location }} replace />;
  }

  // If admin is required but user is not admin, redirect to dashboard
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/forest-dashboard" replace />;
  }

  return children;
}
