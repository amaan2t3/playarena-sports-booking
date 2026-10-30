import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, MapPin, Calendar, LogOut, Shield, Compass, Sparkles, Star } from 'lucide-react';
import logoImg from '../assets/PlayArena Sports Booking Logo.png';

export default function Navbar({ activeTab, setActiveTab, selectedCity, setSelectedCity, onOpenAuth }) {
  const { user, isAdmin, logout, quickLoginAs } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Admin Quick-Access Bar (only for admin switching) */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-emerald-300">PlayArena Live:</span>
            <span>Premier verified sports arenas in Rawalpindi & Skardu — No login required to book</span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="text-emerald-300 font-semibold flex items-center gap-1">
                  <Shield size={12} /> Admin Mode
                </span>
                <button
                  onClick={logout}
                  className="px-2 py-0.5 rounded text-xs bg-red-900/60 hover:bg-red-800 text-red-300 transition font-semibold flex items-center gap-1"
                >
                  <LogOut size={11} /> Exit Admin
                </button>
              </div>
            ) : (
              <button
                onClick={() => quickLoginAs('admin')}
                className="px-2 py-0.5 rounded text-xs bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 transition font-semibold flex items-center gap-1"
              >
                <Shield size={12} /> Admin Login
              </button>
            )}
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

            {/* Admin Panel button — always shown, login gated inside */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : isAdmin
                  ? 'bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200/70'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck size={16} />
              <span>Admin Panel</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
