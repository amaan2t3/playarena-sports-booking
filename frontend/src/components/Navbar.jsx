import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, MapPin, Calendar, LogOut, Shield, Compass, Sparkles, Star, UserRound } from 'lucide-react';
import logoImg from '../assets/PlayArena Sports Booking Logo.png';

export default function Navbar({ activeTab, setActiveTab, selectedCity, setSelectedCity, onOpenAuth }) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Admin Quick-Access Bar (only for admin switching) */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-emerald-300">PlayArena Live:</span>
            <span className="hidden sm:inline">Premier verified sports arenas in Rawalpindi & Skardu — No login required to book</span>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden max-w-36 truncate font-semibold text-emerald-200 sm:inline">
                  {isAdmin ? <Shield size={12} className="mr-1 inline" /> : <UserRound size={12} className="mr-1 inline" />}
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 rounded bg-red-900/60 px-2 py-0.5 text-xs font-semibold text-red-200 transition hover:bg-red-800"
                >
                  <LogOut size={11} /> Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('customer')}
                  className="flex items-center gap-1 rounded bg-emerald-900/80 px-2 py-0.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-800"
                >
                  <UserRound size={12} /> User Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('admin')}
                  className="flex items-center gap-1 rounded bg-emerald-900/80 px-2 py-0.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-800"
                >
                  <Shield size={12} /> Admin Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 py-2 xl:flex-row xl:items-center xl:justify-between xl:py-0">
          {/* Logo & City Selector */}
          <div className="flex min-w-0 items-center justify-between gap-3 sm:gap-6">
            <button
              aria-label="Explore grounds"
              onClick={() => setActiveTab('explore')}
              className="flex min-w-0 items-center gap-2 sm:gap-3 text-left group focus:outline-hidden"
              title="PlayArena - Return to Explore"
            >
              <img
                src={logoImg}
                alt="PlayArena Sports Booking"
                className="h-9 w-auto shrink-0 object-contain transition-transform duration-200 group-hover:scale-105 sm:h-11"
              />
              <div className="min-w-0">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 flex items-center leading-none">
                  Play<span className="text-emerald-600">Arena</span>
                </span>
                <span className="block text-[9px] uppercase tracking-wider font-bold text-emerald-700 mt-0.5 sm:text-[10px]">
                  Rawalpindi • Skardu
                </span>
              </div>
            </button>

            {/* City Dropdown Switcher */}
            <div className="hidden 2xl:flex items-center bg-slate-100/90 rounded-full p-1 border border-slate-200/60">
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
          <nav aria-label="Main navigation" className="flex w-full min-w-0 items-center gap-1 overflow-x-auto pb-0.5 sm:gap-2 xl:w-auto">
            <button
              onClick={() => setActiveTab('explore')}
              className={`shrink-0 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'explore'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass size={16} />
              <span className="hidden sm:inline">Explore Grounds</span>
            </button>

            <button
              aria-label="Booking rules"
              onClick={() => setActiveTab('rules')}
              className={`shrink-0 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'rules'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles size={16} />
              <span className="hidden sm:inline">Booking Rules</span>
            </button>

            <button
              aria-label="Reviews"
              onClick={() => setActiveTab('reviews')}
              className={`shrink-0 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Star size={16} className={activeTab === 'reviews' ? 'fill-emerald-600' : ''} />
              <span className="hidden sm:inline">Reviews</span>
            </button>

            <button
              aria-label="My bookings"
              onClick={() => setActiveTab('my-bookings')}
              className={`shrink-0 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'my-bookings'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar size={16} />
              <span className="hidden sm:inline">My Bookings</span>
            </button>

            {/* Admin Panel button — always shown, login gated inside */}
            <button
              aria-label="Admin panel"
              onClick={() => isAdmin ? setActiveTab('admin') : onOpenAuth('admin')}
              className={`shrink-0 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : isAdmin
                  ? 'bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200/70'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck size={16} />
              <span className="hidden sm:inline">{isAdmin ? 'Admin Panel' : 'Admin Sign In'}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
