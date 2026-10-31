import React, { useState } from 'react';
import { X, MapPin, Clock, Star, Check, Banknote, Calendar, ChevronLeft, ChevronRight, Move3D } from 'lucide-react';

export default function GroundDetailModal({ ground, onClose, onBookGround }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [viewTilt, setViewTilt] = useState({ x: 0, y: 0 });

  if (!ground) return null;

  const images = ground.images?.length
    ? ground.images
    : ['https://images.unsplash.com/photo-1529900241451-b69c45f47055?auto=format&fit=crop&w=1400&q=85'];
  const changeImage = (direction) => {
    setActiveImageIndex((index) => (index + direction + images.length) % images.length);
    setViewTilt({ x: 0, y: 0 });
  };
  const handleViewPointerMove = (event) => {
    if (event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    setViewTilt({
      x: (0.5 - y) * 10,
      y: (x - 0.5) * 12
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-slate-900/60 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-md transition"
        >
          <X size={18} />
        </button>

        {/* Interactive perspective preview using the ground photos already provided. */}
        <div
          className="relative h-72 sm:h-[26rem] w-full overflow-hidden bg-slate-950"
          onPointerMove={handleViewPointerMove}
          onPointerLeave={() => setViewTilt({ x: 0, y: 0 })}
        >
          <div
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{
              transform: `perspective(1200px) rotateX(${viewTilt.x}deg) rotateY(${viewTilt.y}deg) scale(1.08)`,
              transformStyle: 'preserve-3d'
            }}
          >
            <img
              src={images[activeImageIndex]}
              alt={`${ground.name} - view ${activeImageIndex + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/35 pointer-events-none" />

          <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/55 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">
            <Move3D size={15} className="text-emerald-300" />
            <span>3D-style photo preview</span>
            <span className="hidden sm:inline text-white/65">Move pointer to tilt</span>
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => changeImage(-1)}
                aria-label="Show previous ground view"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-slate-950/55 p-2.5 text-white backdrop-blur-md transition hover:bg-slate-950/80"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={() => changeImage(1)}
                aria-label="Show next ground view"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-slate-950/55 p-2.5 text-white backdrop-blur-md transition hover:bg-slate-950/80"
              >
                <ChevronRight size={22} />
              </button>
              <span className="absolute top-5 right-16 rounded-full bg-slate-950/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                View {activeImageIndex + 1} of {images.length}
              </span>
            </>
          )}

          {/* Badges on image */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {ground.sport}
                </span>
                <span className="bg-white/90 text-slate-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {ground.city}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{ground.name}</h2>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                <MapPin size={13} className="text-emerald-400" />
                {ground.address}
              </p>
            </div>

            <div className="text-right bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shrink-0">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Rate</span>
              <span className="text-lg font-black text-emerald-400">
                PKR {ground.hourlyRate.toLocaleString()} <span className="text-xs font-normal text-slate-300">/ hr</span>
              </span>
            </div>
          </div>
        </div>

        {/* Image Thumbnail Selector */}
        {images.length > 1 && (
          <div className="flex gap-2 p-3 bg-slate-100 border-b border-slate-200 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveImageIndex(idx);
                  setViewTilt({ x: 0, y: 0 });
                }}
                aria-label={`Show ground view ${idx + 1}`}
                aria-pressed={activeImageIndex === idx}
                className={`relative h-14 w-20 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                  activeImageIndex === idx ? 'border-emerald-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Modal Body Content */}
        <div className="p-6 space-y-6 max-h-[55vh] overflow-y-auto">
          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Facility Overview</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{ground.description}</p>
          </div>

          {/* Operating Hours & Rating */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2.5">
              <Clock className="text-emerald-600" size={18} />
              <div>
                <span className="block text-[11px] text-slate-500 font-medium">Daily Hours</span>
                <span className="text-xs font-bold text-slate-800">{ground.openingTime} to {ground.closingTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Star className="text-amber-500 fill-amber-500" size={18} />
              <div>
                <span className="block text-[11px] text-slate-500 font-medium">Customer Rating</span>
                <span className="text-xs font-bold text-slate-800">{ground.rating || 4.9} / 5.0 ({ground.reviewsCount || 60}+ reviews)</span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Included Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ground.amenities?.map((amenity, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700 bg-emerald-50/70 border border-emerald-100 px-2.5 py-1.5 rounded-lg">
                  <Check size={13} className="text-emerald-600 shrink-0" />
                  <span className="font-medium">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Facility Rules */}
          {ground.rules && ground.rules.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ground Rules</h3>
              <ul className="space-y-1.5">
                {ground.rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pay at Ground Reminder Banner */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
            <Banknote className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-amber-900">
              <span className="font-bold">Pay at the Ground:</span> No payment is charged right now. You will pay cash or on-site directly to the arena reception before your match begins.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Total for 1 hour:</span>
            <span className="text-base font-extrabold text-slate-900">PKR {ground.hourlyRate.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onBookGround(ground);
              }}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
            >
              <Calendar size={15} />
              <span>Book Slot Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
