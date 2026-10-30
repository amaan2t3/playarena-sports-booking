import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Shield, User, Lock, Mail, Phone, MapPin, AlertTriangle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, quickLoginAs } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Rawalpindi');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register({ name, email, password, phone, city });
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await quickLoginAs(role);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Quick demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">
              <Shield size={14} /> Member Access
            </div>
            <h2 className="text-xl font-black text-white">
              {isLoginMode ? 'Welcome to PlayArena' : 'Create Player Account'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Demo Login Presets */}
        <div className="bg-emerald-950/20 p-4 border-b border-emerald-900/20">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-2">
            ⚡ Quick 1-Click Demo Login:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Shield size={13} />
              <span>Login as Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <User size={13} />
              <span>Login as Player</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="m-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
            <AlertTriangle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLoginMode && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Asad Qureshi"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@playarena.pk"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {!isLoginMode && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 0000000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Primary City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Skardu">Skardu</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Processing...' : isLoginMode ? 'Sign In' : 'Create Free Account'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setErrorMsg('');
              }}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              {isLoginMode ? "Don't have an account? Sign up here" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
