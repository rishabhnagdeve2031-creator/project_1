import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import ForestAtmosphere from '../components/forest/ForestAtmosphere';

export default function ForestLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target after login
  const from = location.state?.from?.pathname || '/forest-dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await login('demo@pench.gov.in', 'demo123');
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Demo authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container relative w-full h-screen flex items-center justify-center bg-forest-950 overflow-hidden text-stone-100 font-sans">
      {/* Dynamic ambient background components */}
      <ForestAtmosphere progress={0.2} />
      <div className="absolute inset-0 bg-black/60 pointer-events-none z-0" />

      {/* Main Login Card Panel */}
      <div className="relative z-10 w-full max-w-md p-8 glass-panel border-emerald-500/20 rounded-2xl shadow-2xl mx-4 select-none">
        
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 mb-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase font-serif">TIGER MARG</h2>
          <div className="text-[10px] font-mono tracking-[0.2em] text-emerald-400 font-bold uppercase mt-1">
            FOREST DEPARTMENT PORTAL
          </div>
          <p className="text-[10px] text-stone-400 uppercase font-mono tracking-wider mt-0.5">
            PENCH TIGER RESERVE
          </p>
        </div>

        {/* Error Notification Alert */}
        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex gap-2 items-start leading-relaxed animate-shake">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-mono block uppercase">Access Rejected</strong>
              {errorMsg}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1.5">
              Official Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@pench.gov.in"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 mb-1.5">
              Security Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-field pr-10"
              />
              <button
                type="button"
                tabIndex="-1"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-500 hover:text-emerald-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 border border-emerald-400/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'AUTHORIZE SIGN IN'
              )}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleDemoSignIn}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 font-mono text-[11px] font-bold uppercase tracking-wider transition-all duration-300 border border-emerald-500/20 shadow-md"
            >
              Sign In with Demo Account
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="text-[10px] text-stone-400 hover:text-emerald-400 font-mono transition-colors"
          >
            ← Return to Public Dashboard
          </button>
        </div>
      </div>

      <style>{`
        .bg-forest-950 {
          background-color: #040806;
        }

        .input-field {
          width: 100%;
          padding: 10px 14px 10px 38px;
          background: rgba(14, 22, 17, 0.8);
          border: 1px solid rgba(45, 92, 66, 0.4);
          border-radius: 8px;
          color: white;
          font-size: 13px;
          transition: all 0.25s ease;
          outline: none;
          font-family: var(--font-sans);
        }

        .input-field::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }

        .input-field:focus {
          border-color: var(--forest-green);
          box-shadow: 0 0 10px var(--forest-green-glow);
          background: rgba(14, 22, 17, 0.95);
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        .animate-shake {
          animation: shake 0.2s ease 2;
        }
      `}</style>
    </div>
  );
}
