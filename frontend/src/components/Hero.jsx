import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, ChevronDown, ShieldCheck, Banknote, Clock, Trophy } from 'lucide-react';
import logoImg from '../assets/PlayArena Sports Booking Logo.png';

const HERO_BACKGROUNDS = [
  {
    url: 'https://i.pinimg.com/736x/e9/7a/c9/e97ac96fb8f174a604c6c3d0993576f0.jpg',
    title: '5G FIFA Futsal Pitch',
    sport: 'Football'
  },

  {
    url: 'https://i.pinimg.com/736x/b2/d7/51/b2d751501bc7e5f25a5f7d99516df84c.jpg',
    title: 'Rawalpindi Cricket Stadium',
    sport: 'Rawalpindi'
  },
  {
    url: 'https://i.pinimg.com/736x/4a/d1/93/4ad193e18f59aa889d9fcbb4640ae64d.jpg',
    title: 'Alpine Mountain Stadium',
    sport: 'Skardu'
  },
  {
    url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=2000&q=80',
    title: 'Championship Tennis Court',
    sport: 'Tennis'
  },
  {
    url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=2000&q=80',
    title: 'Floodlit Box Cricket Turf',
    sport: 'Cricket'
  },
  {
    url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=2000&q=80',
    title: 'Indoor Tournament Badminton',
    sport: 'Badminton'
  }
];

const SPORTS_LIST = [
  'All Sports',
  'Football',
  'Tennis',
  'Cricket',
  'Badminton',
  'Other sports'
];

const CITIES_LIST = [
  'All Cities',
  'Rawalpindi',
  'Skardu'
];

export default function Hero({
  selectedCity,
  setSelectedCity,
  selectedSport,
  setSelectedSport,
  searchQuery,
  setSearchQuery,
  selectedDate,
  setSelectedDate,
  onSearch
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Rotate background image smoothly every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <div className="relative overflow-hidden text-white pt-8 pb-10 sm:pt-10 sm:pb-12 md:pt-12 md:pb-14 px-4 sm:px-6 lg:px-8 border-b border-white/10 bg-black">
      {/* Dynamic Background Sports Field Images - High Visibility & Vibrant */}
      {HERO_BACKGROUNDS.map((bg, idx) => (
        <div
          key={bg.url}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out pointer-events-none ${idx === currentBgIndex ? 'opacity-80 sm:opacity-85 scale-100' : 'opacity-0 scale-105'
            }`}
          style={{
            backgroundImage: `url('${bg.url}')`
          }}
        />
      ))}
      {/* Clean Neutral Dark Scrim (No Dark Blue Tint) to guarantee crisp text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6 sm:space-y-7">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {/* Logo Badge in Hero */}
          <div className="flex items-center justify-center mb-1">
            <div className="inline-flex items-center gap-2 p-1.5 sm:p-2 pr-3.5 sm:pr-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl shadow-emerald-500/10 border border-emerald-400/30 hover:scale-105 transition-transform duration-200">
              <img
                src={logoImg}
                alt="PlayArena Sports Booking"
                className="h-8 sm:h-10 w-auto object-contain"
              />
              <div className="text-left">
                <span className="block text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-none">
                  Play<span className="text-emerald-600">Arena</span>
                </span>
                <span className="block text-[9px] uppercase tracking-wider font-bold text-emerald-700">
                  Rawalpindi • Skardu
                </span>
              </div>
            </div>
          </div>

          <div className="inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-emerald-300 shadow-xs sm:px-3.5 sm:py-1.5 sm:text-xs">
            <Trophy size={13} className="text-emerald-400" />
            <span>Sports Facility Discovery & Booking Platform</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Book Premier Turf & Arenas in <br className="hidden sm:inline" />
            <span className="text-emerald-400 drop-shadow-md">
              Rawalpindi & Skardu
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-100 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-sm">
            At PlayArena, we bring you the best sports facilities.
            Futsal, clay tennis courts, scenic mountain cricket pavilions, and tournament badminton halls.
            Choose your flexible slot, reserve with ease, and pay directly at the ground.
          </p>

          {/* Dynamic Live Arena Background Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1">
            <span className="text-[11px] text-emerald-300/90 font-semibold hidden sm:inline">Live Views:</span>
            {HERO_BACKGROUNDS.map((bg, idx) => (
              <button
                type="button"
                key={bg.title}
                onClick={() => setCurrentBgIndex(idx)}
                className={`transition-all duration-300 rounded-full flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold py-0.5 sm:py-1 px-2.5 sm:px-3 ${idx === currentBgIndex
                    ? 'bg-emerald-500/35 text-emerald-300 border border-emerald-400/60 shadow-xs scale-105'
                    : 'bg-black/60 text-slate-300 border border-white/20 hover:bg-black/80 hover:text-white'
                  }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${idx === currentBgIndex ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                    }`}
                />
                <span>{bg.sport}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ----------------- SEARCH & BOOKING BAR (MATCHING USER SCREENSHOT) ----------------- */}
        <div className="max-w-5xl mx-auto my-1">
          <div className="bg-black/75 backdrop-blur-md border border-white/20 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl space-y-3 sm:space-y-4">
            <form onSubmit={handleSearchSubmit}>
              {/* Input Fields Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {/* 1. Ground or Keyword */}
                <div className="relative">
                  <div className="flex items-center bg-neutral-900/85 hover:bg-neutral-900 text-white rounded-full border border-neutral-700 focus-within:border-emerald-500 px-3.5 sm:px-4 py-2.5 sm:py-3 transition shadow-xs">
                    <Search size={16} className="text-neutral-400 shrink-0 mr-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ground or keyword..."
                      className="w-full bg-transparent text-sm text-white placeholder-neutral-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* 2. All Sports Dropdown */}
                <div className="relative">
                  <div className="flex items-center justify-between bg-neutral-900/85 hover:bg-neutral-900 text-white rounded-full border border-neutral-700 focus-within:border-emerald-500 px-3.5 sm:px-4 py-2.5 sm:py-3 transition shadow-xs">
                    <select
                      value={selectedSport === 'All' ? 'All Sports' : selectedSport}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedSport(val === 'All Sports' ? 'All' : val);
                      }}
                      className="w-full bg-transparent text-sm text-white focus:outline-hidden appearance-none cursor-pointer pr-6"
                    >
                      {SPORTS_LIST.map((sp) => (
                        <option key={sp} value={sp} className="bg-neutral-900 text-white">
                          {sp}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="text-neutral-400 pointer-events-none absolute right-3.5 sm:right-4" />
                  </div>
                </div>

                {/* 3. All Cities Dropdown */}
                <div className="relative">
                  <div className="flex items-center justify-between bg-neutral-900/85 hover:bg-neutral-900 text-white rounded-full border border-neutral-700 focus-within:border-emerald-500 px-3.5 sm:px-4 py-2.5 sm:py-3 transition shadow-xs">
                    <div className="flex items-center gap-2 w-full">
                      <MapPin size={16} className="text-neutral-400 shrink-0" />
                      <select
                        value={selectedCity === 'All' ? 'All Cities' : selectedCity}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedCity(val === 'All Cities' ? 'All' : val);
                        }}
                        className="w-full bg-transparent text-sm text-white focus:outline-hidden appearance-none cursor-pointer pr-6"
                      >
                        {CITIES_LIST.map((c) => (
                          <option key={c} value={c} className="bg-neutral-900 text-white">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <ChevronDown size={16} className="text-neutral-400 pointer-events-none absolute right-3.5 sm:right-4" />
                  </div>
                </div>

                {/* 4. Select Date Picker */}
                <div className="relative">
                  <div className="flex items-center bg-neutral-900/85 hover:bg-neutral-900 text-white rounded-full border border-neutral-700 focus-within:border-emerald-500 px-3.5 sm:px-4 py-2.5 sm:py-3 transition shadow-xs">
                    <Calendar size={16} className="text-neutral-400 shrink-0 mr-2.5" />
                    <input
                      type="date"
                      min={todayStr}
                      value={selectedDate || ''}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-transparent text-sm text-white focus:outline-hidden cursor-pointer color-scheme-dark"
                      placeholder="Select date"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button Row - Right Aligned Green Pill Button */}
              <div className="flex justify-end pt-2.5 sm:pt-3">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-6 sm:px-7 py-2.5 sm:py-3 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/40 hover:shadow-emerald-600/60 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <Search size={16} />
                  <span>Search Grounds & Events</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 3 Core Rules Highlights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-white/15">
          <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-neutral-950/80 backdrop-blur-md border border-white/15 shadow-xl">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Admin Approval</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold uppercase">
                  Rule 1
                </span>
              </h2>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                Bookings remain pending until an administrator reviews and verifies availability before confirmation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-neutral-950/80 backdrop-blur-md border border-white/15 shadow-xl">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Banknote size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Pay at the Ground</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold uppercase">
                  Rule 2
                </span>
              </h2>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                No online payment gateway needed in v1. Pay with cash or local on-site payment at the ground counter.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-neutral-950/80 backdrop-blur-md border border-white/15 shadow-xl">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Flexible Duration</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold uppercase">
                  Rule 3
                </span>
              </h2>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                Customers choose their preferred start time and customized duration (1h, 1.5h, 2h, 3h) with conflict protection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
