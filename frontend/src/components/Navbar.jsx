import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, MapPin, Calendar, User, LogOut, Shield, Compass, Sparkles, Star } from 'lucide-react';
import logoImg from '../assets/PlayArena Sports Booking Logo.png';

export default function Navbar({ activeTab, setActiveTab, selectedCity, setSelectedCity, onOpenAuth }) {
  const { user, isAdmin, logout, quickLoginAs } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Announcement & Quick Demo Switcher Bar */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-emerald-300">PlayArena Live:</span>
            <span>Discovering premier verified sports arenas in Rawalpindi & Skardu</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-emerald-400/80 hidden sm:inline">1-Click Demo Accounts:</span>
            <button
              onClick={() => quickLoginAs('admin')}
              className={`px-2 py-0.5 rounded text-xs transition font-semibold flex items-center gap-1 ${
                isAdmin ? 'bg-emerald-500 text-white' : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200'
              }`}
            >
              <Shield size={12} /> Admin (Approvals)
            </button>
            <button
              onClick={() => quickLoginAs('customer')}
              className={`px-2 py-0.5 rounded text-xs transition font-semibold flex items-center gap-1 ${
                user && !isAdmin ? 'bg-emerald-500 text-white' : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200'
              }`}
            >
              <User size={12} /> Customer
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-hidden"
              title="PlayArena - Return to Explore"
            >
              <img
                src={logoImg}
                alt="PlayArena Sports Booking"
                className="h-10 sm:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <div>
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 flex items-center leading-none">
                  Play<span className="text-emerald-600">Arena</span>
                </span>
                <span className="block text-[10px] uppercase tracking-wider font-bold text-emerald-700 mt-0.5">
                  Rawalpindi • Skardu
                </span>
              </div>
            </button>

            {/* City Dropdown Switcher */}
            <div className="hidden md:flex items-center bg-slate-100/90 rounded-full p-1 border border-slate-200/60">
              <span className="px-2 text-xs font-medium text-slate-500 flex items-center gap-1">
                <MapPin size={13} className="text-emerald-600" /> City:
              </span>
              {['All', 'Rawalpindi', 'Skardu'].map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    selectedCity === city
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'explore'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass size={16} />
              <span>Explore Grounds</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'rules'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles size={16} />
              <span className="hidden sm:inline">Booking Rules</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Star size={16} className={activeTab === 'reviews' ? 'fill-emerald-600' : ''} />
              <span>Reviews</span>
            </button>

            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'my-bookings'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar size={16} />
              <span>My Bookings</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200/70'
                }`}
              >
                <ShieldCheck size={16} />
                <span>Admin Panel</span>
              </button>
            )}

            {/* User Profile / Auth Button */}
            <div className="ml-2 pl-2 border-l border-slate-200 flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block text-right">
                    <span className="block text-xs font-bold text-slate-800">{user.name}</span>
                    <span className="block text-[10px] text-emerald-600 uppercase font-semibold">
                      {user.role === 'admin' ? 'Administrator' : 'Player'}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    title="Log out"
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <User size={15} />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
