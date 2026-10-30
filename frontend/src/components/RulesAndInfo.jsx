import React from 'react';
import { ShieldCheck, Banknote, Clock, MapPin, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function RulesAndInfo({ onStartBooking }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} className="text-emerald-600" /> Platform Guidelines
        </div>
        <h2 className="text-3xl font-black text-slate-900">How PlayArena Booking Works</h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Built for sportsmen and sports clubs in Rawalpindi and Skardu with fair play rules, flexible scheduling, and on-site payments.
        </p>
      </div>

      {/* The 3 Core Rules In-Depth */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl">
            1
          </div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            Admin Approval
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every booking request remains in <strong>PENDING</strong> status upon submission. Ground administrators review facility schedule, weather readiness, and lighting allocations before approving. No double-bookings can occur.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl">
            2
          </div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Banknote size={18} className="text-emerald-600" />
            Pay at the Ground
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            No credit card or online payment gateway required in version 1.0! Once your slot is confirmed by the admin, simply bring cash or pay on-site at the arena reception counter before stepping onto the pitch.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl">
            3
          </div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock size={18} className="text-emerald-600" />
            Flexible Duration
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Whether you want a quick 1-hour workout, a standard 2-hour futsal match, or a 4-hour weekend cricket tournament, customers select their exact start time and slot duration with real-time conflict checking.
          </p>
        </div>
      </div>

      {/* City Specific Ground Advice */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <h3 className="text-lg font-extrabold text-slate-900">City Specific Ground Etiquette</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
              <MapPin size={16} className="text-emerald-600" />
              <span>Rawalpindi Arenas</span>
            </div>
            <ul className="text-xs text-emerald-950/80 space-y-1.5 list-disc list-inside">
              <li>High-demand peak slots are between 19:00 and 23:00. Request early.</li>
              <li>Futsal arenas require specialized turf shoes or rubber molded studs. Flat metal cleats are forbidden.</li>
              <li>Badminton courts strictly require non-marking gum sole shoes.</li>
              <li>Ample vehicle parking available at Commercial Market & Bahria venues.</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-sky-900">
              <MapPin size={16} className="text-sky-600" />
              <span>Skardu Venues</span>
            </div>
            <ul className="text-xs text-sky-950/80 space-y-1.5 list-disc list-inside">
              <li>High altitude (2,200m+) play: Allow 10-15 minutes warmup and stay hydrated.</li>
              <li>Evening temperatures drop rapidly: Wear breathable thermal layers.</li>
              <li>Outdoor venues have spectacular 360° Karakoram snow peaks backdrop.</li>
              <li>Hot Balti green tea and kahwa stalls are situated right beside the clubhouse.</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-center">
          <button
            onClick={onStartBooking}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/30 transition"
          >
            Ready to Play? Explore Grounds Now
          </button>
        </div>
      </div>
    </div>
  );
}
