const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function getAuthHeaders() {
  const token = localStorage.getItem('playarena_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user');
    return data.user;
  },

  // Grounds
  async getGrounds({ city = '', sport = '', search = '' } = {}) {
    const params = new URLSearchParams();
    if (city && city !== 'All') params.append('city', city);
    if (sport && sport !== 'All') params.append('sport', sport);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/grounds?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load grounds');
    return data.data;
  },

  async getGroundById(id) {
    const res = await fetch(`${API_BASE}/grounds/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch ground');
    return data;
  },

  async checkAvailability(groundId, date, startTime, durationHours) {
    const params = new URLSearchParams({ date, startTime, durationHours });
    const res = await fetch(`${API_BASE}/grounds/${groundId}/availability?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Availability check failed');
    return data;
  },

  async createGround(groundData) {
    const res = await fetch(`${API_BASE}/grounds`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(groundData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create facility');
    return data.data;
  },

  async deleteGround(id) {
    const res = await fetch(`${API_BASE}/grounds/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete facility');
    return data;
  },

  // Bookings
  async getBookings({ status = '', city = '', customerEmail = '' } = {}) {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (city && city !== 'All') params.append('city', city);
    if (customerEmail) params.append('customerEmail', customerEmail);

    const res = await fetch(`${API_BASE}/bookings?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load bookings');
    return data.data;
  },

  async createBooking(bookingData) {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create booking request');
    return data;
  },

  async updateBookingStatus(id, { status, adminNotes = '', rejectionReason = '' }) {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, adminNotes, rejectionReason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update booking status');
    return data;
  },

  async updatePaymentStatus(id, paymentStatus) {
    const res = await fetch(`${API_BASE}/bookings/${id}/payment`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ paymentStatus })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update payment status');
    return data;
  }
};
