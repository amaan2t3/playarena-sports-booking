import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar,
  Clock,
  MapPin,
  Banknote,
  Hourglass,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Trophy
} from 'lucide-react';

export default function MyBookings({ onBookNew }) {
  const { user } = useAuth();
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchBookings = useCallback(async (email) => {
    setLoading(true);
    setSearched(true);
    setErrorMessage('');
    try {
      const data = await api.getBookings({ customerEmail: user ? '' : email });
      setBookings(data);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to load your bookings right now.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.email) {
      fetchBookings(user.email);
    }
  }, [user?.email, fetchBookings]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      fetchBookings(emailInput.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title & Email Lookup Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <div className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy size={14} /> Match Schedule & Reservations
          </div>
          <h2 className="text-2xl font-black text-slate-900">Track My Booking Requests</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Check the live approval status of your slots at arenas in Rawalpindi and Skardu.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col gap-3 pt-2 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={user?.email || emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              readOnly={Boolean(user)}
              placeholder="Enter your email to find your reservations..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
            <span>{user ? 'Refresh My Bookings' : 'Find Bookings'}</span>
          </button>
        </form>
      </div>

      {/* Bookings Display */}
      {errorMessage ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      ) : loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading your bookings...</div>
      ) : searched && bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
          <Calendar className="mx-auto text-slate-300" size={36} />
          <h3 className="text-base font-bold text-slate-800">No booking requests found for "{emailInput}"</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't requested any slots with this email yet. Explore our premier arenas and book your first match!
          </p>
          <button
            onClick={onBookNew}
            className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            Browse Sports Arenas
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-emerald-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    REF: #{b.id}
                  </span>

                  {/* Status Badge */}
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    b.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : b.status === 'pending'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {b.status === 'approved' && <CheckCircle2 size={12} />}
                    {b.status === 'pending' && <Hourglass size={12} />}
                    {b.status === 'rejected' && <XCircle size={12} />}
                    <span>{b.status === 'pending' ? 'Pending Approval' : b.status}</span>
                  </span>

                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {b.sport}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900">{b.groundName}</h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-emerald-600" />
                    <span>{b.groundCity}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <Calendar size={13} className="text-slate-400" />
                    <span>{b.date}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    <Clock size={13} className="text-slate-500" />
                    <span>{b.startTime} - {b.endTime} ({b.durationHours} hrs)</span>
                  </span>
                </div>

                {b.adminNotes && (
                  <p className="text-xs text-emerald-700 font-medium bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                    Admin note: {b.adminNotes}
                  </p>
                )}

                {b.rejectionReason && (
                  <p className="text-xs text-red-700 font-medium bg-red-50 p-2 rounded-lg border border-red-200">
                    Reason: {b.rejectionReason}
                  </p>
                )}
              </div>

              {/* Price & Payment Column */}
              <div className="text-left sm:text-right pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                <span className="text-[11px] text-slate-400 block font-medium">Match Fee</span>
                <span className="text-xl font-black text-slate-900">
                  PKR {b.totalAmount?.toLocaleString()}
                </span>

                <div className="mt-1 text-[11px] flex items-center sm:justify-end gap-1 text-slate-600">
                  <Banknote size={13} className="text-emerald-600" />
                  <span className={b.paymentStatus === 'paid_at_ground' ? 'font-bold text-emerald-700' : 'text-slate-500'}>
                    {b.paymentStatus === 'paid_at_ground' ? 'Paid at ground ✅' : 'Pay at ground counter'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
