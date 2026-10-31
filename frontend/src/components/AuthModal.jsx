import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Shield, Lock, Mail, AlertTriangle, UserRound, Phone } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'customer' }) {
  const { login, register, logout } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isRegistering = mode === 'register';
  const isAdminLogin = mode === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const loggedInUser = isRegistering
        ? await register({ name, email, password, phone })
        : await login(email, password);
      const hasCorrectRole = isAdminLogin
        ? loggedInUser.role === 'admin'
        : loggedInUser.role === 'customer';
      if (!hasCorrectRole) {
        logout();
        setErrorMsg(isAdminLogin
          ? 'This account does not have administrator access.'
          : 'Please use an administrator account in the Admin Sign In tab.');
        return;
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-2 backdrop-blur-sm sm:p-4">
      <div className="relative max-h-[calc(100dvh-1rem)] w-full max-w-sm overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in duration-200 sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 bg-slate-900 p-5 text-white sm:p-6">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              {isAdminLogin ? <Shield size={14} /> : <UserRound size={14} />}
              {isAdminLogin ? 'Administrator Access' : 'PlayArena Account'}
            </div>
            <h2 className="text-xl font-black text-white">
              {isAdminLogin ? 'Admin Sign In' : isRegistering ? 'Create Account' : 'User Sign In'}
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              {isAdminLogin ? 'Manage grounds and booking requests.' : 'Save your details and track booking decisions.'}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close sign in" className="rounded-full p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5 border-b border-slate-200 bg-slate-50 p-3">
          {[
            ['customer', 'User Sign In'],
            ['register', 'Create Account'],
            ['admin', 'Admin Sign In']
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode(value);
                setErrorMsg('');
              }}
              className={`rounded-lg px-2 py-2 text-[10px] font-bold transition sm:text-xs ${
                mode === value ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 p-5 sm:p-6">
          {isRegistering && (
            <>
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                  <UserRound size={12} /> Full Name
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                  <Phone size={12} /> Phone (optional)
                </label>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-slate-600">
              <Mail size={12} /> Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-slate-600">
              <Lock size={12} /> Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {isRegistering && <p className="mt-1 text-[10px] text-slate-500">Use at least 8 characters.</p>}
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? 'Please wait…' : isAdminLogin ? 'Sign In as Admin' : isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
