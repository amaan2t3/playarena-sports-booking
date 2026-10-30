import React from 'react';
import { Search, MapPin, Activity, X } from 'lucide-react';

const SPORTS = [
  { id: 'All', name: 'All Sports', icon: '🏆' },
  { id: 'Football', name: 'Football', icon: '⚽' },
  { id: 'Tennis', name: 'Tennis', icon: '🎾' },
  { id: 'Cricket', name: 'Cricket', icon: '🏏' },
  { id: 'Badminton', name: 'Badminton', icon: '🏸' },
  { id: 'Other sports', name: 'Other sports', icon: '🏓' }
];

export default function Filters({
  selectedCity,
  setSelectedCity,
  selectedSport,
  setSelectedSport,
  searchQuery,
  setSearchQuery,
  totalResults
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 mb-8 space-y-5">
      {/* Search and City Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search grounds, localities, or amenities (e.g. 5G turf, floodlights, Commercial Market)..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* City Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60 self-start md:self-auto">
          <span className="text-xs font-semibold text-slate-500 px-2 flex items-center gap-1">
            <MapPin size={13} className="text-emerald-600" /> City:
          </span>
          {['All', 'Rawalpindi', 'Skardu'].map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedCity === city
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Sport Category Pills */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Activity size={14} className="text-emerald-600" /> Filter by Sport:
          </span>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
            {totalResults} {totalResults === 1 ? 'ground available' : 'grounds available'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SPORTS.map((sport) => (
            <button
              key={sport.id}
              onClick={() => setSelectedSport(sport.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                selectedSport === sport.id
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <span className="text-base">{sport.icon}</span>
              <span>{sport.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
