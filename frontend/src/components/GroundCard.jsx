import React from 'react';
import { MapPin, Star, Clock, Eye, ChevronRight } from 'lucide-react';

const SPORT_ICONS = {
  Football: '⚽',
  Tennis: '🎾',
  Cricket: '🏏',
  Badminton: '🏸',
  'Other sports': '🏓'
};

export default function GroundCard({ ground, onSelectGround }) {
  const sportIcon = SPORT_ICONS[ground.sport] || '🏆';

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Top Image & Badges */}
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
          <img
            src={ground.images?.[0] || 'https://images.unsplash.com/photo-1529900241451-b69c45f47055?auto=format&fit=crop&w=800&q=80'}
            alt={ground.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1.5">
              <span>{sportIcon}</span>
              <span>{ground.sport}</span>
            </span>

            <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-xs backdrop-blur-md ${
              ground.city === 'Skardu'
                ? 'bg-sky-600/90 text-white'
                : 'bg-emerald-700/90 text-white'
            }`}>
              {ground.city}
            </span>
          </div>

          {/* Price Tag Overlay */}
          <div className="absolute bottom-3 right-3 bg-slate-950/90 text-white px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Flexible Rate</div>
            <div className="text-base font-black text-emerald-400">
              PKR {ground.hourlyRate.toLocaleString()} <span className="text-xs font-normal text-slate-300">/ hr</span>
            </div>
          </div>

          {/* Rating */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-white text-xs font-bold">
            <Star size={13} className="text-amber-400 fill-amber-400" />
            <span>{ground.rating || 4.8}</span>
            <span className="text-slate-400 text-[10px]">({ground.reviewsCount || 40})</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-3">
          <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition line-clamp-1">
            {ground.name}
          </h2>

          <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
            <MapPin size={13} className="text-emerald-600 shrink-0" />
            <span>{ground.address}</span>
          </p>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {ground.description}
          </p>

          {/* Key Amenities */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {ground.amenities?.slice(0, 3).map((amenity, i) => (
              <span
                key={i}
                className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
              >
                {amenity}
              </span>
            ))}
            {ground.amenities?.length > 3 && (
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                +{ground.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Operating Hours & View Ground & Facility Action Button */}
      <div className="p-5 pt-0">
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mb-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Clock size={13} className="text-slate-400" />
            <span>{ground.openingTime} - {ground.closingTime}</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            Pay at ground
          </span>
        </div>

        {/* Primary Action Button Requested: View Ground and Facility */}
        <button
          onClick={() => onSelectGround(ground)}
          className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl transition shadow-sm shadow-emerald-600/30 flex items-center justify-center gap-2 group/btn active:scale-[0.98]"
        >
          <Eye size={15} />
          <span>View Ground & Facility</span>
          <ChevronRight size={15} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
