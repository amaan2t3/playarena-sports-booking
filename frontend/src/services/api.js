const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

export function getAuthHeaders() {
  const token = localStorage.getItem('playarena_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed (${res.status})`);
    }
    return data;
  } catch (err) {
    if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
      throw new Error('Unable to connect to the backend API. Please make sure the backend server is running on port 5000 (run "npm run start:backend" from root or "npm run dev" inside /backend).');
    }
    throw err;
  }
}

export const api = {
  // Auth
  async login(email, password) {
    return await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  },

  async register(userData) {
    return await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
  },

  async getMe() {
    const data = await request('/auth/me', {
      headers: getAuthHeaders()
    });
    return data.user;
  },

  // Grounds
  async getGrounds({ city = '', sport = '', search = '' } = {}) {
    const params = new URLSearchParams();
    if (city && city !== 'All') params.append('city', city);
    if (sport && sport !== 'All') params.append('sport', sport);
    if (search) params.append('search', search);

    const data = await request(`/grounds?${params.toString()}`);
    return data.data;
  },

  async getGroundById(id) {
    return await request(`/grounds/${id}`);
  },

  async checkAvailability(groundId, date, startTime, durationHours) {
    const params = new URLSearchParams({ date, startTime, durationHours });
    return await request(`/grounds/${groundId}/availability?${params.toString()}`);
  },

  async getBookedSlots(groundId, date) {
    return await request(`/grounds/${groundId}/booked-slots?date=${date}`);
  },

  async createGround(groundData) {
    const data = await request('/grounds', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(groundData)
    });
    return data.data;
  },

  async updateGround(id, groundData) {
    const data = await request(`/grounds/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(groundData)
    });
    return data.data;
  },

  async deleteGround(id) {
    return await request(`/grounds/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  // Bookings
  async getBookings({ status = '', city = '', customerEmail = '' } = {}) {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (city && city !== 'All') params.append('city', city);
    if (customerEmail) params.append('customerEmail', customerEmail);

    const data = await request(`/bookings?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    return data.data;
  },

  async createBooking(bookingData) {
    return await request('/bookings', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData)
    });
  },

  async updateBookingStatus(id, { status, adminNotes = '', rejectionReason = '' }) {
    return await request(`/bookings/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, adminNotes, rejectionReason })
    });
  },

  async updatePaymentStatus(id, paymentStatus) {
    return await request(`/bookings/${id}/payment`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ paymentStatus })
    });
  }
};
