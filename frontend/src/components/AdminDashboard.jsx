import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getBookingStatusMessage, getWhatsAppUrl } from '../services/whatsapp';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Banknote,
  AlertTriangle,
  RefreshCw,
  Search,
  Pencil
} from 'lucide-react';

const EMPTY_GROUND = {
  name: '',
  city: 'Rawalpindi',
  sport: 'Football',
  address: '',
  hourlyRate: 4000,
  openingTime: '06:00',
  closingTime: '23:00',
  description: '',
  amenities: '5G Turf, Floodlights, Parking, Changing Rooms',
  images: 'https://images.unsplash.com/photo-1529900241451-b69c45f47055?auto=format&fit=crop&w=1200&q=80',
  isFeatured: false
};

export default function AdminDashboard({ onRefreshGrounds }) {
  const [bookings, setBookings] = useState([]);
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [whatsAppNotification, setWhatsAppNotification] = useState(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Active tab inside Admin Dashboard
  const [adminTab, setAdminTab] = useState('requests'); // 'requests' | 'grounds' | 'add-ground'

  // New Ground Form state
  const [newGround, setNewGround] = useState(EMPTY_GROUND);
  const [editingGroundId, setEditingGroundId] = useState(null);
  const [creatingGround, setCreatingGround] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setErrorMsg('');
    try {
      const [bookingsData, groundsData] = await Promise.all([
        api.getBookings({}),
        api.getGrounds({})
      ]);
      setBookings(bookingsData);
      setGrounds(groundsData);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  }

  // Handle Approve or Reject
  const handleUpdateStatus = async (booking, status, reason = '') => {
    setErrorMsg('');
    setSuccessMsg('');
    setWhatsAppNotification(null);
    const message = getBookingStatusMessage(booking, status, reason);
    const whatsAppUrl = getWhatsAppUrl(booking.customerPhone, message);
    const whatsAppWindow = whatsAppUrl ? window.open('', '_blank') : null;

    try {
      const res = await api.updateBookingStatus(booking.id, {
        status,
        rejectionReason: reason,
        adminNotes: status === 'approved' ? 'Approved by Admin. Ready for match.' : 'Declined by Administrator.'
      });
      setSuccessMsg(res.message);
      let popupOpened = false;
      if (whatsAppWindow && !whatsAppWindow.closed && whatsAppUrl) {
        try {
          whatsAppWindow.opener = null;
          whatsAppWindow.location.href = whatsAppUrl;
          popupOpened = true;
        } catch {
          whatsAppWindow.close();
        }
      }
      setWhatsAppNotification({
        url: whatsAppUrl,
        popupOpened
      });
      await loadData();
      if (onRefreshGrounds) onRefreshGrounds();
    } catch (err) {
      whatsAppWindow?.close();
      setErrorMsg(err.message || `Failed to update booking to ${status}`);
    }
  };

  // Toggle Payment Status
  const handleTogglePayment = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'paid_at_ground' ? 'unpaid' : 'paid_at_ground';
    try {
      await api.updatePaymentStatus(id, nextStatus);
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update payment status');
    }
  };

  // Delete Ground
  const handleDeleteGround = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}"?`)) return;
    try {
      await api.deleteGround(id);
      setSuccessMsg(`Facility "${name}" removed successfully.`);
      await loadData();
      if (onRefreshGrounds) onRefreshGrounds();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete ground');
    }
  };

  // Create Ground
  const handleCreateGround = async (e) => {
    e.preventDefault();
    setCreatingGround(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        name: newGround.name,
        city: newGround.city,
        sport: newGround.sport,
        address: newGround.address,
        hourlyRate: Number(newGround.hourlyRate),
        openingTime: newGround.openingTime,
        closingTime: newGround.closingTime,
        description: newGround.description,
        amenities: newGround.amenities.split(',').map(s => s.trim()).filter(Boolean),
        images: newGround.images.split(/\n/).map(s => s.trim()).filter(Boolean),
        isFeatured: newGround.isFeatured,
        rules: [
          'Pay at reception desk upon arrival',
          'Arrive 10 minutes prior to match kickoff',
          'Proper athletic gear required'
        ]
      };

      if (editingGroundId) {
        await api.updateGround(editingGroundId, payload);
        setSuccessMsg(`Arena "${newGround.name}" updated successfully.`);
      } else {
        await api.createGround(payload);
        setSuccessMsg(`New arena "${newGround.name}" registered successfully!`);
      }
      setAdminTab('grounds');
      setEditingGroundId(null);
      await loadData();
      if (onRefreshGrounds) onRefreshGrounds();
      setNewGround(EMPTY_GROUND);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create ground facility');
    } finally {
      setCreatingGround(false);
    }
  };

  const handleEditGround = (ground) => {
    setEditingGroundId(ground.id);
    setNewGround({
      name: ground.name || '',
      city: ground.city || 'Rawalpindi',
      sport: ground.sport || 'Football',
      address: ground.address || '',
      hourlyRate: ground.hourlyRate || 0,
      openingTime: ground.openingTime || '06:00',
      closingTime: ground.closingTime || '23:00',
      description: ground.description || '',
      amenities: (ground.amenities || []).join(', '),
      images: (ground.images || []).join('\n'),
      isFeatured: Boolean(ground.isFeatured)
    });
    setAdminTab('add-ground');
  };

  const cancelGroundEdit = () => {
    setEditingGroundId(null);
    setNewGround(EMPTY_GROUND);
    setAdminTab('grounds');
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'All' && b.status !== statusFilter) return false;
    if (cityFilter !== 'All' && b.groundCity !== cityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCustomer = b.customerName?.toLowerCase().includes(q) || b.customerEmail?.toLowerCase().includes(q) || b.customerPhone?.includes(q);
      const matchGround = b.groundName?.toLowerCase().includes(q);
      const matchId = b.id?.toLowerCase().includes(q);
      if (!matchCustomer && !matchGround && !matchId) return false;
    }
    return true;
  });

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const approvedCount = bookings.filter(b => b.status === 'approved').length;
  const totalRevenue = bookings.filter(b => b.status === 'approved').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-500/30">
              <ShieldCheck size={14} /> Administrator Control Center
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Facility & Booking Oversight</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Review and approve pending slot requests, resolve overlaps, track "pay at ground" collections, and manage sports arenas in Rawalpindi and Skardu.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3 sm:gap-3">
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 text-center">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Pending Review</span>
              <span className="text-2xl font-black text-amber-300">{pendingCount}</span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 text-center">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Approved Matches</span>
              <span className="text-2xl font-black text-emerald-300">{approvedCount}</span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 text-center">
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">Total Booked</span>
              <span className="text-sm font-black text-white mt-1 block">PKR {totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs sm:text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-500 hover:text-red-800">×</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-900">×</button>
        </div>
      )}

      {whatsAppNotification && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-xs font-semibold text-green-900 sm:text-sm">
          {whatsAppNotification.url ? (
            <>
              <p>
                WhatsApp has the customer&apos;s status update ready. Review it and tap <strong>Send</strong> in WhatsApp.
              </p>
              {!whatsAppNotification.popupOpened && (
                <a
                  href={whatsAppNotification.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block font-bold text-green-800 underline"
                >
                  Open WhatsApp message
                </a>
              )}
            </>
          ) : (
            <p>Booking status updated, but the customer&apos;s phone number is not a valid WhatsApp number.</p>
          )}
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <button
            onClick={() => setAdminTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              adminTab === 'requests'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Booking Requests</span>
            {pendingCount > 0 && (
              <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-xs font-black">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('grounds')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              adminTab === 'grounds'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Manage Arenas</span>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              {grounds.length}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('add-ground')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
              adminTab === 'add-ground'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <Plus size={15} />
            <span>Add Facility</span>
          </button>
        </div>

        <button
          onClick={loadData}
          title="Refresh Data"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* TAB 1: Booking Requests Management */}
      {adminTab === 'requests' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex w-full min-w-0 flex-1 items-center gap-2 sm:min-w-[200px]">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name, email, phone or ground..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs py-1.5 bg-transparent border-0 focus:outline-hidden text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="flex max-w-full flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Status:</span>
              {['All', 'pending', 'approved', 'rejected'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}

              <span className="text-slate-300 mx-1">|</span>

              <span className="text-slate-500 font-semibold">City:</span>
              {['All', 'Rawalpindi', 'Skardu'].map(c => (
                <button
                  key={c}
                  onClick={() => setCityFilter(c)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    cityFilter === c
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">Loading bookings...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <Clock className="mx-auto text-slate-300 mb-2" size={32} />
              <h3 className="font-bold text-slate-700">No booking requests found</h3>
              <p className="text-xs text-slate-500 mt-1">Try switching filters or placing a new test booking request.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-emerald-500/40 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: Customer & Slot Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        #{b.id}
                      </span>

                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        b.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {b.status}
                      </span>

                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        {b.groundCity}
                      </span>

                      <span className="text-xs font-semibold text-emerald-700">
                        {b.sport}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900">{b.groundName}</h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">
                        👤 {b.customerName}
                      </span>
                      <span>📞 {b.customerPhone}</span>
                      <span>✉️ {b.customerEmail}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700 pt-1">
                      <span className="font-bold text-slate-900">
                        🗓️ {b.date}
                      </span>
                      <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        ⏰ {b.startTime} - {b.endTime} ({b.durationHours} hrs)
                      </span>
                      <span className="font-black text-slate-900">
                        Fee: PKR {b.totalAmount?.toLocaleString()}
                      </span>
                    </div>

                    {b.rejectionReason && (
                      <p className="text-xs text-red-600 italic">Rejection note: {b.rejectionReason}</p>
                    )}
                  </div>

                  {/* Right: Payment Status & Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                    {/* Pay at Ground Toggle */}
                    <button
                      onClick={() => handleTogglePayment(b.id, b.paymentStatus)}
                      title="Click to toggle payment received at ground"
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                        b.paymentStatus === 'paid_at_ground'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <Banknote size={14} />
                      <span>{b.paymentStatus === 'paid_at_ground' ? 'Paid at Ground ✅' : 'Unpaid (Collect at Ground)'}</span>
                    </button>

                    {/* Status Approval Actions */}
                    <div className="flex items-center gap-2">
                      {b.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(b, 'approved')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs shadow-emerald-600/30"
                        >
                          <CheckCircle size={14} />
                          <span>Approve</span>
                        </button>
                      )}

                      {b.status !== 'rejected' && (
                        <button
                          onClick={() => {
                            const reason = window.prompt('Reason for rejecting booking request (optional):', 'Slot unavailable');
                            if (reason !== null) handleUpdateStatus(b, 'rejected', reason);
                          }}
                          className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-red-200"
                        >
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Manage Grounds List */}
      {adminTab === 'grounds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grounds.map((g) => (
            <div key={g.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                {g.images?.[0] && (
                  <img src={g.images[0]} alt={g.name} className="mb-3 h-36 w-full rounded-xl object-cover" />
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {g.city} • {g.sport}
                  </span>
                  <span className="text-xs font-black text-slate-800">
                    PKR {g.hourlyRate.toLocaleString()} / hr
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base mt-2">{g.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{g.address}</p>

                <div className="mt-2 text-[11px] text-slate-600">
                  <span className="font-semibold">Hours:</span> {g.openingTime} - {g.closingTime}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                <span className="min-w-0 truncate font-mono text-[11px] text-slate-400">ID: {g.id}</span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => handleEditGround(g)}
                    className="rounded-lg p-1.5 text-emerald-700 transition hover:bg-emerald-50"
                    title="Edit facility and images"
                    aria-label={`Edit ${g.name}`}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteGround(g.id, g.name)}
                    className="rounded-lg p-1.5 text-red-600 transition hover:bg-red-50"
                    title="Delete facility"
                    aria-label={`Delete ${g.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Add New Ground Facility Form */}
      {adminTab === 'add-ground' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm max-w-2xl mx-auto">
          <div className="mb-5">
            <h3 className="text-xl font-black text-slate-900">{editingGroundId ? 'Edit Sports Facility' : 'Register New Sports Facility'}</h3>
            <p className="text-xs text-slate-500 mt-1">{editingGroundId ? 'Update the facility details and its photo URLs.' : 'Add a new ground in Rawalpindi or Skardu for customers to discover and book.'}</p>
          </div>

          <form onSubmit={handleCreateGround} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Facility Name</label>
              <input
                type="text"
                required
                value={newGround.name}
                onChange={(e) => setNewGround({ ...newGround, name: e.target.value })}
                placeholder="e.g. Islamabad Club Squash Courts / Pindi Futsal Park"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">City Location</label>
                <select
                  value={newGround.city}
                  onChange={(e) => setNewGround({ ...newGround, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                >
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Skardu">Skardu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Sport Supported</label>
                <select
                  value={newGround.sport}
                  onChange={(e) => setNewGround({ ...newGround, sport: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                >
                  <option value="Football">Football</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Other sports">Other sports</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Complete Address / Landmark</label>
              <input
                type="text"
                required
                value={newGround.address}
                onChange={(e) => setNewGround({ ...newGround, address: e.target.value })}
                placeholder="e.g. Phase 7, Bahria Town, Rawalpindi"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Hourly Rate (PKR)</label>
                <input
                  type="number"
                  required
                  min="500"
                  value={newGround.hourlyRate}
                  onChange={(e) => setNewGround({ ...newGround, hourlyRate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Opening Time</label>
                <input
                  type="text"
                  value={newGround.openingTime}
                  onChange={(e) => setNewGround({ ...newGround, openingTime: e.target.value })}
                  placeholder="06:00"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Closing Time</label>
                <input
                  type="text"
                  value={newGround.closingTime}
                  onChange={(e) => setNewGround({ ...newGround, closingTime: e.target.value })}
                  placeholder="23:00"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
              <textarea
                rows={3}
                value={newGround.description}
                onChange={(e) => setNewGround({ ...newGround, description: e.target.value })}
                placeholder="Describe pitch dimensions, surface type, quality..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Amenities (comma-separated)</label>
              <input
                type="text"
                value={newGround.amenities}
                onChange={(e) => setNewGround({ ...newGround, amenities: e.target.value })}
                placeholder="5G Turf, Floodlights, Changing Rooms, Locker, Parking"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Ground Image URLs</label>
              <textarea
                rows={3}
                value={newGround.images}
                onChange={(e) => setNewGround({ ...newGround, images: e.target.value })}
                placeholder={'https://example.com/ground-front.jpg\nhttps://example.com/ground-side.jpg'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-600"
              />
              <p className="mt-1 text-[11px] text-slate-500">Enter one publicly accessible image URL per line. The first image is the card cover.</p>
              {newGround.images.split('\n').filter(Boolean).length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {newGround.images.split('\n').map((url, index) => url.trim() && (
                    <img
                      key={`${index}-${url}`}
                      src={url.trim()}
                      alt={`Ground photo preview ${index + 1}`}
                      className="h-24 w-full rounded-lg border border-slate-200 object-cover"
                    />
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={newGround.isFeatured}
                onChange={(e) => setNewGround({ ...newGround, isFeatured: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Feature this facility
            </label>

            <div className="pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelGroundEdit}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingGround}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30"
              >
                {creatingGround ? 'Saving Facility...' : editingGroundId ? 'Save Facility Changes' : 'Publish Ground Facility'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
