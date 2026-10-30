import React, { useState, useEffect, useMemo } from 'react';
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
  MessageCircle
} from 'lucide-react';

const DURATION_OPTIONS = [
  { value: 1, label: '1 hr' },
  { value: 1.5, label: '1.5 hrs' },
  { value: 2, label: '2 hrs ★' },
  { value: 2.5, label: '2.5 hrs' },
  { value: 3, label: '3 hrs' },
  { value: 4, label: '4 hrs' }
];

const ALL_TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function slotsOverlap(startA, endA, startB, endB) {
  let sA = timeToMinutes(startA), eA = timeToMinutes(endA);
  let sB = timeToMinutes(startB), eB = timeToMinutes(endB);
  if (eA <= sA) eA += 24 * 60;
  if (eB <= sB) eB += 24 * 60;
  return sA < eB && eA > sB;
}

function addHours(time, hours) {
  const mins = timeToMinutes(time) + Math.round(hours * 60);
  const norm = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Sends a WhatsApp message to admin */
function sendWhatsAppToAdmin(adminPhone, booking) {
  const clean = adminPhone.replace(/\D/g, '');
  const msg = encodeURIComponent(
    `🏟️ *New Booking Request - PlayArena*\n\n` +
    `📋 Ref: ${booking.id}\n` +
    `🏟️ Ground: ${booking.groundName} (${booking.groundCity})\n` +
    `⚽ Sport: ${booking.sport}\n` +
    `👤 Player: ${booking.customerName}\n` +
    `📞 Phone: ${booking.customerPhone}\n` +
    `✉️ Email: ${booking.customerEmail}\n` +
    `📅 Date: ${booking.date}\n` +
    `⏰ Time: ${booking.startTime} – ${booking.endTime} (${booking.durationHours} hrs)\n` +
    `💰 Fee: PKR ${booking.totalAmount?.toLocaleString()}\n` +
    `🕐 Status: PENDING APPROVAL\n\n` +
    `Please approve or reject via the Admin Panel.`
  );
  window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
}

/** Sends a WhatsApp booking confirmation to the player's own phone */
function sendWhatsAppToPlayer(playerPhone, booking) {
  const clean = playerPhone.replace(/\D/g, '');
  if (!clean || clean.length < 7) return; // skip if no valid number
  const msg = encodeURIComponent(
    `✅ *PlayArena – Booking Confirmation*\n\n` +
    `Hi ${booking.customerName}! 👋\n` +
    `Your slot request has been received.\n\n` +
    `📋 *Booking Ref:* ${booking.id}\n` +
    `🏟️ *Ground:* ${booking.groundName}\n` +
    `📍 *City:* ${booking.groundCity}\n` +
    `⚽ *Sport:* ${booking.sport}\n` +
    `📅 *Date:* ${booking.date}\n` +
    `⏰ *Time:* ${booking.startTime} – ${booking.endTime} (${booking.durationHours} hrs)\n` +
    `💰 *Fee:* PKR ${booking.totalAmount?.toLocaleString()} (Pay at Ground)\n` +
    `🔔 *Status:* PENDING – Admin will confirm shortly\n\n` +
    `Please arrive 10 minutes early. Pay at the ground reception on arrival.\n` +
    `Thank you for booking with PlayArena! 🏆`
  );
  window.open(`https://wa.me/${clean}?text=${msg}`, '_blank');
}

const ADMIN_WHATSAPP = import.meta.env.VITE_ADMIN_WHATSAPP || '+923001234567';

export default function BookingModal({ ground, groundsList, initialDate, onClose, onBookingSuccess }) {
  const [selectedGround, setSelectedGround] = useState(ground || (groundsList && groundsList[0]));
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(initialDate || todayStr);
  const [startTime, setStartTime] = useState('18:00');
  const [durationHours, setDurationHours] = useState(2);

  // Booked slots for the selected ground + date
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Customer contact
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+92 3');
  const [customerEmail, setCustomerEmail] = useState('');

  // Availability check
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [availabilityError, setAvailabilityError] = useState('');

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState('');

  // Fetch booked slots whenever ground or date changes
  useEffect(() => {
    if (!selectedGround || !date) return;
    setLoadingSlots(true);
    api.getBookedSlots(selectedGround.id, date)
      .then(res => {
        setBookedSlots(res.slots || []);
        setLoadingSlots(false);
      })
      .catch(() => {
        setBookedSlots([]);
        setLoadingSlots(false);
      });
  }, [selectedGround, date]);

  // Determine which start-time slots are blocked given chosen duration
  const blockedStartTimes = useMemo(() => {
    return ALL_TIME_SLOTS.filter(slot => {
      const endSlot = addHours(slot, durationHours);
      return bookedSlots.some(b => slotsOverlap(slot, endSlot, b.startTime, b.endTime));
    });
  }, [bookedSlots, durationHours]);

  // If selected startTime becomes blocked, auto-pick first available
  useEffect(() => {
    if (blockedStartTimes.includes(startTime)) {
      const firstFree = ALL_TIME_SLOTS.find(s => !blockedStartTimes.includes(s));
      if (firstFree) setStartTime(firstFree);
    }
  }, [blockedStartTimes]);

  // Real-time availability check
  useEffect(() => {
    if (!selectedGround || !date || !startTime || !durationHours) return;
    let isMounted = true;
    setCheckingAvailability(true);
    setAvailabilityError('');

    api.checkAvailability(selectedGround.id, date, startTime, durationHours)
      .then(res => { if (isMounted) { setAvailabilityResult(res); setCheckingAvailability(false); } })
      .catch(err => { if (isMounted) { setAvailabilityError(err.message); setCheckingAvailability(false); } });

    return () => { isMounted = false; };
  }, [selectedGround, date, startTime, durationHours]);

  const totalCost = selectedGround ? Math.round(selectedGround.hourlyRate * Number(durationHours)) : 0;
  const endTimeDisplay = addHours(startTime, durationHours);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!customerName.trim() || !customerPhone.trim()) {
      setSubmitError('Please fill in your name and phone number.');
      return;
    }

    if (availabilityResult && !availabilityResult.isAvailable) {
      setSubmitError('This slot is already taken. Please pick another time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.createBooking({
        groundId: selectedGround.id,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || `player_${Date.now()}@playarena.pk`,
        customerPhone: customerPhone.trim(),
        date,
        startTime,
        durationHours: Number(durationHours)
      });

      setSubmitSuccess(response.data);

      // 🔔 Send WhatsApp to admin
      sendWhatsAppToAdmin(ADMIN_WHATSAPP, response.data);

      // 🔔 Send WhatsApp confirmation to player (small delay so admin tab opens first)
      setTimeout(() => sendWhatsAppToPlayer(customerPhone.trim(), response.data), 1000);

      if (onBookingSuccess) onBookingSuccess(response.data);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
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
              {submitSuccess ? 'Booking Request Sent! ✅' : 'Book Your Slot'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X size={18} />
          </button>
        </div>

        {/* ============ SUCCESS SCREEN ============ */}
        {submitSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Request Received!</h3>
              <p className="text-sm text-slate-600 mt-1">
                Your slot at <span className="font-semibold text-slate-800">{submitSuccess.groundName}</span> is now pending approval.
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
                <span className="font-semibold text-slate-900">{submitSuccess.date} • {submitSuccess.startTime} – {submitSuccess.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Fee:</span>
                <span className="font-bold text-emerald-700 text-sm">PKR {submitSuccess.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/80">
                <span className="text-slate-500">Status:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase tracking-wider text-[10px]">
                  <Hourglass size={11} /> Pending Admin Approval
                </span>
              </div>
            </div>

            {/* WhatsApp notifications status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Admin notified */}
              <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-left flex items-start gap-2.5">
                <MessageCircle className="text-green-600 shrink-0 mt-0.5" size={16} />
                <div className="text-xs text-green-900">
                  <p className="font-bold">Admin Notified ✅</p>
                  <p className="mt-0.5 text-green-700">Arena manager has received your booking via WhatsApp.</p>
                </div>
              </div>

              {/* Player confirmation */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-left flex items-start gap-2.5">
                <MessageCircle className="text-blue-600 shrink-0 mt-0.5" size={16} />
                <div className="text-xs text-blue-900">
                  <p className="font-bold">Your Confirmation ✅</p>
                  <p className="mt-0.5 text-blue-700">Booking details sent to your WhatsApp ({submitSuccess.customerPhone}).</p>
                </div>
              </div>
            </div>

            {/* Re-send player confirmation button */}
            <button
              type="button"
              onClick={() => sendWhatsAppToPlayer(submitSuccess.customerPhone, submitSuccess)}
              className="w-full py-2.5 border-2 border-green-500 text-green-700 hover:bg-green-50 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <MessageCircle size={15} />
              Re-send Confirmation to My WhatsApp
            </button>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-left flex items-start gap-3">
              <ShieldCheck className="text-emerald-700 shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-emerald-950">
                <p className="font-bold">Next Steps:</p>
                <p className="mt-0.5">
                  1. Admin will review and confirm your slot.<br />
                  2. Arrive 10 minutes early and pay PKR {submitSuccess.totalAmount?.toLocaleString()} at the counter.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/30 transition"
            >
              View Admin Panel →
            </button>
          </div>
        ) : (
          /* ============ BOOKING FORM ============ */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Ground Selector */}
            {groundsList && groundsList.length > 1 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Sports Facility</label>
                <select
                  value={selectedGround?.id}
                  onChange={e => {
                    const found = groundsList.find(g => g.id === e.target.value);
                    if (found) setSelectedGround(found);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {groundsList.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.city} • {g.sport})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Ground Info */}
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
                  <span className="text-sm font-extrabold text-emerald-700">PKR {selectedGround.hourlyRate?.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Date + Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Booking Date</label>
                <input
                  type="date"
                  min={todayStr}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Duration</label>
                <div className="flex flex-wrap gap-1.5">
                  {DURATION_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDurationHours(opt.value)}
                      className={`py-1.5 px-2 text-center rounded-lg text-xs font-bold transition border ${
                        durationHours === opt.value
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Time Picker — greyed-out booked slots */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Start Time
                </label>
                {loadingSlots && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    Loading schedule...
                  </span>
                )}
                {!loadingSlots && bookedSlots.length > 0 && (
                  <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                    <Clock size={11} /> {blockedStartTimes.length} slots taken
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {ALL_TIME_SLOTS.map(slot => {
                  const isBlocked = blockedStartTimes.includes(slot);
                  const isSelected = startTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBlocked}
                      onClick={() => !isBlocked && setStartTime(slot)}
                      title={isBlocked ? 'This time is already booked' : `Book from ${slot}`}
                      className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition border relative ${
                        isBlocked
                          ? 'bg-red-50 text-red-300 border-red-200 cursor-not-allowed line-through opacity-60'
                          : isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-800'
                      }`}
                    >
                      {slot}
                      {isBlocked && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-[7px] text-white font-black">✕</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {startTime && !blockedStartTimes.includes(startTime) && (
                <p className="mt-2 text-xs text-slate-500">
                  Selected: <span className="font-bold text-slate-800">{startTime}</span> → <span className="font-bold text-slate-800">{endTimeDisplay}</span>
                  <span className="ml-1 text-slate-400">({durationHours} hrs)</span>
                </p>
              )}
            </div>

            {/* Availability Banner */}
            <div className={`p-3.5 rounded-xl border text-xs transition-all ${
              availabilityResult?.isAvailable === false
                ? 'bg-red-50 border-red-200'
                : availabilityResult?.isAvailable === true
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-slate-50 border-slate-200'
            }`}>
              {checkingAvailability ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span>Checking slot availability...</span>
                </div>
              ) : availabilityResult?.isAvailable ? (
                <div className="flex items-start gap-2.5 text-emerald-800">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><span className="font-bold">Slot Available:</span> {startTime} – {endTimeDisplay} is open for booking!</span>
                </div>
              ) : availabilityResult ? (
                <div className="flex items-start gap-2.5 text-red-700">
                  <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  <span><span className="font-bold">Slot Taken!</span> This time is already reserved. Please pick another.</span>
                </div>
              ) : (
                <span className="text-slate-400">Select a date and time to check availability.</span>
              )}
            </div>

            {/* Customer Info */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Your Details</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Tariq Mehmood"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Phone (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Email (optional)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-300 block font-medium">Estimated Match Fee</span>
                  <span className="text-xs text-slate-400">{durationHours} hr × PKR {selectedGround?.hourlyRate?.toLocaleString()}</span>
                </div>
                <span className="text-2xl font-black text-emerald-400">PKR {totalCost.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-emerald-900 flex items-start gap-2.5 text-xs text-emerald-200">
                <Banknote size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Pay at the ground:</strong> Zero upfront payment. Settle at {selectedGround?.city} on arrival.</span>
              </div>
            </div>

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
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Booking</span>
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
