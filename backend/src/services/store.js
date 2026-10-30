import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { initialGrounds } from '../data/seedGrounds.js';
import { areSlotsOverlapping, calculateEndTime } from '../utils/time.js';

let isMongooseConnected = false;

// Fallback in-memory / state collections
let memoryGrounds = [...initialGrounds];
let memoryUsers = [];
let memoryBookings = [];

export async function initDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri && !mongoUri.includes('cluster0.mongodb.net/playarena?retryWrites=true&w=majority')) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      isMongooseConnected = true;
      console.log('✅ Connected to MongoDB Atlas successfully.');
    } catch (err) {
      console.warn('⚠️ MongoDB Atlas connection skipped or timed out. Falling back to local high-performance store.');
      isMongooseConnected = false;
    }
  } else {
    console.log('ℹ️ Running in fast zero-dependency local mode with persistent seeded data.');
  }

  // Seed default admin and user
  await seedDefaults();
}

async function seedDefaults() {
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);

  memoryUsers = [
    {
      id: 'usr-admin-1',
      name: 'System Admin',
      email: 'admin@playarena.pk',
      password: adminPasswordHash,
      phone: '+92 300 1234567',
      city: 'Rawalpindi',
      role: 'admin',
      createdAt: new Date()
    },
    {
      id: 'usr-cust-1',
      name: 'Hamza Khan',
      email: 'user@playarena.pk',
      password: userPasswordHash,
      phone: '+92 321 9876543',
      city: 'Rawalpindi',
      role: 'customer',
      createdAt: new Date()
    }
  ];

  // Pre-seed a couple of realistic booking requests to demonstrate the approval workflow and conflict checking
  const today = new Date().toISOString().split('T')[0];
  memoryBookings = [
    {
      id: 'bk-sample-1',
      groundId: 'g-rwp-1',
      groundName: 'Rawal Kings Futsal & Turf Arena',
      groundCity: 'Rawalpindi',
      sport: 'Football',
      customerName: 'Ali Raza',
      customerEmail: 'ali.raza@example.com',
      customerPhone: '+92 333 5551234',
      date: today,
      startTime: '19:00',
      durationHours: 2,
      endTime: '21:00',
      totalAmount: 9000,
      paymentMethod: 'Pay at the Ground (Cash/On-site)',
      paymentStatus: 'paid_at_ground',
      status: 'approved',
      adminNotes: 'Confirmed by ground manager Tariq. Floodlights assigned.',
      rejectionReason: '',
      createdAt: new Date(Date.now() - 3600000 * 4)
    },
    {
      id: 'bk-sample-2',
      groundId: 'g-skd-1',
      groundName: 'K2 Peak Vista Football Stadium & Turf',
      groundCity: 'Skardu',
      sport: 'Football',
      customerName: 'Shabbir Hussain',
      customerEmail: 'shabbir@skardu.pk',
      customerPhone: '+92 345 7778899',
      date: today,
      startTime: '16:00',
      durationHours: 1.5,
      endTime: '17:30',
      totalAmount: 5700,
      paymentMethod: 'Pay at the Ground (Cash/On-site)',
      paymentStatus: 'unpaid',
      status: 'pending',
      adminNotes: '',
      rejectionReason: '',
      createdAt: new Date(Date.now() - 3600000 * 2)
    }
  ];
}

// ---------------- USER OPERATIONS ----------------
export async function findUserByEmail(email) {
  return memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserById(id) {
  const user = memoryUsers.find(u => u.id === id);
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function createUser({ name, email, password, phone = '', city = 'Rawalpindi', role = 'customer' }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    name,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    phone,
    city,
    role,
    createdAt: new Date()
  };
  memoryUsers.push(newUser);
  const { password: _, ...safeUser } = newUser;
  return safeUser;
}

// ---------------- GROUNDS OPERATIONS ----------------
export async function getAllGrounds({ city, sport, search, featured }) {
  let list = [...memoryGrounds];

  if (city && city !== 'All') {
    list = list.filter(g => g.city.toLowerCase() === city.toLowerCase());
  }

  if (sport && sport !== 'All') {
    list = list.filter(g => g.sport.toLowerCase() === sport.toLowerCase());
  }

  if (featured === 'true' || featured === true) {
    list = list.filter(g => g.isFeatured);
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.address.toLowerCase().includes(q) ||
      g.sport.toLowerCase().includes(q) ||
      (g.amenities && g.amenities.some(a => a.toLowerCase().includes(q)))
    );
  }

  return list;
}

export async function getGroundById(id) {
  return memoryGrounds.find(g => g.id === id || g._id?.toString() === id) || null;
}

export async function createGround(groundData) {
  const newGround = {
    id: 'g-' + Date.now(),
    ...groundData,
    rating: groundData.rating || 4.8,
    reviewsCount: groundData.reviewsCount || 0,
    rules: groundData.rules || ['Pay at ground before playing', 'Arrive on time'],
    amenities: groundData.amenities || ['Floodlights', 'Parking']
  };
  memoryGrounds.unshift(newGround);
  return newGround;
}

export async function updateGround(id, updateData) {
  const index = memoryGrounds.findIndex(g => g.id === id || g._id?.toString() === id);
  if (index === -1) return null;
  memoryGrounds[index] = { ...memoryGrounds[index], ...updateData };
  return memoryGrounds[index];
}

export async function deleteGround(id) {
  const index = memoryGrounds.findIndex(g => g.id === id || g._id?.toString() === id);
  if (index === -1) return false;
  memoryGrounds.splice(index, 1);
  return true;
}

// ---------------- BOOKINGS OPERATIONS & AVAILABILITY ----------------

/**
 * Checks for conflict against CONFIRMED (approved) AND PENDING bookings on the same ground and date.
 * A slot is considered unavailable if any approved OR pending booking overlaps it.
 * This prevents players from selecting already-taken time ranges.
 */
export async function checkSlotAvailability(groundId, date, startTime, durationHours, excludeBookingId = null) {
  const endTime = calculateEndTime(startTime, durationHours);

  const bookingsForGroundAndDate = memoryBookings.filter(b =>
    (b.groundId === groundId || b.ground?.toString() === groundId) &&
    b.date === date &&
    b.id !== excludeBookingId &&
    b.status !== 'rejected' &&
    b.status !== 'cancelled'
  );

  const overlappingApproved = bookingsForGroundAndDate.filter(b =>
    b.status === 'approved' &&
    areSlotsOverlapping(startTime, endTime, b.startTime, b.endTime)
  );

  const overlappingPending = bookingsForGroundAndDate.filter(b =>
    b.status === 'pending' &&
    areSlotsOverlapping(startTime, endTime, b.startTime, b.endTime)
  );

  // Slot is unavailable if there's any approved OR pending overlap
  return {
    isAvailable: overlappingApproved.length === 0 && overlappingPending.length === 0,
    endTime,
    conflicts: overlappingApproved,
    pendingOverlaps: overlappingPending,
    isBlockedByPending: overlappingApproved.length === 0 && overlappingPending.length > 0
  };
}

export async function getAllBookings({ status, groundId, customerEmail, city }) {
  let list = [...memoryBookings];

  if (status && status !== 'All') {
    list = list.filter(b => b.status === status);
  }

  if (groundId) {
    list = list.filter(b => b.groundId === groundId);
  }

  if (customerEmail) {
    list = list.filter(b => b.customerEmail.toLowerCase() === customerEmail.toLowerCase());
  }

  if (city) {
    list = list.filter(b => b.groundCity.toLowerCase() === city.toLowerCase());
  }

  // Sort newest first
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getBookingById(id) {
  return memoryBookings.find(b => b.id === id || b._id?.toString() === id) || null;
}

export async function createBooking(data) {
  const ground = await getGroundById(data.groundId);
  if (!ground) {
    throw new Error('Selected ground does not exist.');
  }

  const duration = Number(data.durationHours);
  const endTime = calculateEndTime(data.startTime, duration);
  const totalAmount = Math.round(ground.hourlyRate * duration);

  // Enforce availability: prevent overlapping confirmed/approved bookings
  const availability = await checkSlotAvailability(data.groundId, data.date, data.startTime, duration);
  if (!availability.isAvailable) {
    const conflict = availability.conflicts[0];
    throw new Error(`This slot (${data.startTime} - ${endTime}) is unavailable. An approved booking exists (${conflict.startTime} - ${conflict.endTime}).`);
  }

  const newBooking = {
    id: 'bk-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    groundId: data.groundId,
    groundName: ground.name,
    groundCity: ground.city,
    sport: ground.sport,
    userId: data.userId || null,
    customerName: data.customerName,
    customerEmail: data.customerEmail.toLowerCase().trim(),
    customerPhone: data.customerPhone,
    date: data.date,
    startTime: data.startTime,
    durationHours: duration,
    endTime: endTime,
    totalAmount: totalAmount,
    paymentMethod: 'Pay at the Ground (Cash/On-site)',
    paymentStatus: 'unpaid',
    status: 'pending', // Bookings remain pending until admin approves
    adminNotes: '',
    rejectionReason: '',
    createdAt: new Date()
  };

  memoryBookings.unshift(newBooking);
  return newBooking;
}

export async function updateBookingStatus(id, { status, adminNotes = '', rejectionReason = '', paymentStatus }) {
  const booking = memoryBookings.find(b => b.id === id || b._id?.toString() === id);
  if (!booking) {
    throw new Error('Booking not found.');
  }

  // If approving, check for overlapping confirmed bookings again to ensure no double-booking
  if (status === 'approved') {
    const availability = await checkSlotAvailability(
      booking.groundId,
      booking.date,
      booking.startTime,
      booking.durationHours,
      booking.id
    );

    if (!availability.isAvailable) {
      const conflict = availability.conflicts[0];
      throw new Error(`Cannot approve booking. Slot conflicts with another confirmed booking (${conflict.startTime} - ${conflict.endTime}).`);
    }
  }

  if (status) booking.status = status;
  if (adminNotes !== undefined) booking.adminNotes = adminNotes;
  if (rejectionReason !== undefined) booking.rejectionReason = rejectionReason;
  if (paymentStatus !== undefined) booking.paymentStatus = paymentStatus;

  return booking;
}
