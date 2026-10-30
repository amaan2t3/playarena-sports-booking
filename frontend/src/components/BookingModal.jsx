import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  ShieldCheck,
  Hourglass,
  ArrowRight,
  Info
} from 'lucide-react';

const DURATION_OPTIONS = [
  { value: 1, label: '1 hour' },
  { value: 1.5, label: '1.5 hours' },
  { value: 2, label: '2 hours (Popular)' },
  { value: 2.5, label: '2.5 hours' },
  { value: 3, label: '3 hours' },
  { value: 4, label: '4 hours' }
];

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

export default function BookingModal({ ground, groundsList, initialDate, onClose, onBookingSuccess }) {
  const { user } = useAuth();

  const [selectedGround, setSelectedGround] = useState(ground || (groundsList && groundsList[0]));
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(initialDate || todayStr);
  const [startTime, setStartTime] = useState('18:00');
  const [durationHours, setDurationHours] = useState(2);

  // Customer Contact Fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+92 300 ');

  // Availability state
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [availabilityError, setAvailabilityError] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState('');

  // Update customer fields if user changes
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name || '');
      if (!customerEmail) setCustomerEmail(user.email || '');
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  // Real-time check availability whenever ground, date, startTime, or duration changes
  useEffect(() => {
    if (!selectedGround || !date || !startTime || !durationHours) return;

    let isMounted = true;
    setCheckingAvailability(true);
    setAvailabilityError('');

    api.checkAvailability(selectedGround.id, date, startTime, durationHours)
      .then((res) => {
        if (isMounted) {
          setAvailabilityResult(res);
          setCheckingAvailability(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setAvailabilityError(err.message || 'Could not verify slot availability');
          setCheckingAvailability(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedGround, date, startTime, durationHours]);

  const totalCost = selectedGround ? Math.round(selectedGround.hourlyRate * Number(durationHours)) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setSubmitError('Please fill in your name, email, and phone number.');
      return;
    }

    if (availabilityResult && !availabilityResult.isAvailable) {
      setSubmitError('This slot is already reserved. Please pick another time or duration.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.createBooking({
        groundId: selectedGround.id,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        date,
        startTime,
        durationHours: Number(durationHours)
      });

      setSubmitSuccess(response.data);
      if (onBookingSuccess) onBookingSuccess(response.data);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={14} /> Slot Reservation
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                Pay at Ground
              </span>
            </div>
            <h2 className="text-xl font-black text-white">
              {submitSuccess ? 'Booking Request Submitted!' : 'Select Time & Duration'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        {submitSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Request Received!</h3>
              <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                Your slot request for <span className="font-semibold text-slate-800">{submitSuccess.groundName}</span> is now recorded.
              </p>
            </div>

            {/* Booking Details Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500">Booking Ref:</span>
                <span className="font-mono font-bold text-slate-900">{submitSuccess.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-semibold text-slate-900">{submitSuccess.date} • {submitSuccess.startTime} to {submitSuccess.endTime} ({submitSuccess.durationHours} hrs)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Fee:</span>
                <span className="font-bold text-emerald-700 text-sm">PKR {submitSuccess.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/80">
                <span className="text-slate-500">Status:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase tracking-wider text-[10px]">
                  <Hourglass size={11} /> Pending Admin Approval
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment:</span>
                <span className="text-slate-900 font-medium">Pay at the ground reception</span>
              </div>
            </div>

            {/* Admin Approval & Ground Rule Callout */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-left flex items-start gap-3">
              <ShieldCheck className="text-emerald-700 shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-emerald-950">
                <p className="font-bold">Next Steps:</p>
                <p className="mt-0.5">
                  1. An arena administrator will review and confirm your slot.<br />
                  2. Arrive 10 minutes prior to {submitSuccess.startTime} and settle PKR {submitSuccess.totalAmount.toLocaleString()} at the counter.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/30 transition"
            >
              Done / Return to Facilities
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Ground Selector (if multiple grounds available) */}
            {groundsList && groundsList.length > 1 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sports Facility
                </label>
                <select
                  value={selectedGround?.id}
                  onChange={(e) => {
                    const found = groundsList.find(g => g.id === e.target.value);
                    if (found) setSelectedGround(found);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {groundsList.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.city} • {g.sport} • PKR {g.hourlyRate}/hr)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Selected Ground Info Summary Card */}
            {selectedGround && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">{selectedGround.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-emerald-600" />
                    <span>{selectedGround.city} • {selectedGround.sport}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Hourly Rate</span>
                  <span className="text-sm font-extrabold text-emerald-700">
                    PKR {selectedGround.hourlyRate.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Date and Start Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Booking Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Start Time
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot} (24h)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Flexible Duration Options */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Flexible Duration</span>
                <span className="text-[11px] text-emerald-600 font-semibold lowercase">customizable hours</span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDurationHours(opt.value)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition border ${
                      durationHours === opt.value
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt.value} hr
                  </button>
                ))}
              </div>
            </div>

            {/* Real-time Availability & Conflict Status Banner */}
            <div className="p-3.5 rounded-xl border transition-all text-xs">
              {checkingAvailability ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span>Checking slot availability and preventing overlapping bookings...</span>
                </div>
              ) : availabilityResult?.isAvailable ? (
                <div className="flex items-start gap-2.5 text-emerald-800">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950">Slot Available: </span>
                    <span>{startTime} to {availabilityResult.endTime} ({durationHours} hours) is open.</span>
                    {availabilityResult.pendingOverlaps?.length > 0 && (
                      <span className="block text-[11px] text-amber-700 mt-0.5 font-medium">
                        Note: 1 pending request is in review by admin for this slot. Approvals are prioritized by timestamp.
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 text-red-700 bg-red-50 -m-3.5 p-3.5 rounded-xl border border-red-200">
                  <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Slot Conflict Detected!</span>
                    <p className="mt-0.5 text-xs text-red-800">
                      Another confirmed booking overlaps with this interval ({startTime} - {availabilityResult?.endTime}).
                      Please pick another start time or adjust duration.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Contact Details */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Customer Information
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. name@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Phone (for match alerts)</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Total Calculation & Pay-at-the-ground Notice */}
            <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-300 block font-medium">Estimated Match Fee</span>
                  <span className="text-xs text-slate-400">
                    {durationHours} hr × PKR {selectedGround?.hourlyRate.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400">
                    PKR {totalCost.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-900 flex items-start gap-2.5 text-xs text-emerald-200">
                <Banknote size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Pay at the ground:</strong> Zero upfront online charges. Pay on arrival at {selectedGround?.city}.
                </span>
              </div>
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
                <AlertTriangle size={15} />
                <span>{submitError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (availabilityResult && !availabilityResult.isAvailable)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition flex items-center gap-2 ${
                  availabilityResult && !availabilityResult.isAvailable
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Booking Request</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
