import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { initialGrounds } from '../data/seedGrounds.js';
import { Booking } from '../models/Booking.js';
import { Ground } from '../models/Ground.js';
import { User } from '../models/User.js';
import { areSlotsOverlapping, calculateEndTime } from '../utils/time.js';

let isMongooseConnected = false;

// Fallback in-memory / state collections
let memoryGrounds = [...initialGrounds];
let memoryUsers = [];
let memoryBookings = [];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSafeErrorDetails(error) {
  const message = String(error.message || 'Unknown error')
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi, 'mongodb+srv://[REDACTED]');
  return {
    name: error.name,
    ...(error.code ? { code: error.code } : {}),
    message
  };
}

export async function initDatabase() {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required in production.');
  }
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (mongoUri) {
    try {
      if (mongoose.connection.readyState !== 1) {
        const parsedUri = new URL(mongoUri);
        const dbName = parsedUri.pathname.replace(/^\/+/, '');
        await mongoose.connect(mongoUri, {
          ...(!dbName ? { dbName: process.env.MONGODB_DB_NAME || 'playarena' } : {}),
          serverSelectionTimeoutMS: 10000
        });
      }
      isMongooseConnected = true;
      console.log('✅ Connected to MongoDB Atlas successfully.');
      await seedMongoDefaults();
    } catch (err) {
      isMongooseConnected = false;
      console.error('MongoDB initialization failed:', getSafeErrorDetails(err));
      throw new Error('MongoDB initialization failed. Check the connection, database name, and Atlas database-user permissions.');
    }
  } else {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is required in production so user, booking, and ground data can persist.');
    }
    console.log('ℹ️ Running in local development mode with in-memory data.');
    await seedDefaults();
  }
}

function serializeGround(ground) {
  const value = typeof ground.toObject === 'function' ? ground.toObject() : ground;
  const { _id, __v, ...fields } = value;
  return { ...fields, id: String(_id ?? value.id) };
}

function serializeBooking(booking) {
  const value = typeof booking.toObject === 'function' ? booking.toObject() : booking;
  const { _id, __v, ground, user, ...fields } = value;
  return {
    ...fields,
    id: String(_id ?? value.id),
    groundId: String(ground?._id ?? ground ?? value.groundId),
    userId: user ? String(user._id ?? user) : value.userId || null
  };
}

function serializeUser(user, { includePassword = false } = {}) {
  const value = typeof user.toObject === 'function' ? user.toObject() : user;
  const { _id, __v, password, ...fields } = value;
  return {
    ...fields,
    id: String(_id ?? value.id),
    ...(includePassword && password ? { password } : {})
  };
}

async function seedMongoDefaults() {
  for (const { id, ...ground } of initialGrounds) {
    await Ground.updateOne(
      { name: ground.name, city: ground.city },
      { $setOnInsert: ground },
      { upsert: true }
    );
  }

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const adminEmail = process.env.ADMIN_EMAIL.toLowerCase().trim();
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: process.env.ADMIN_NAME || 'PlayArena Admin',
        email: adminEmail,
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
        phone: process.env.ADMIN_PHONE || '',
        city: 'Rawalpindi',
        role: 'admin'
      });
    }
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD to create the first administrator account.');
  } else {
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await User.updateOne(
      { email: 'admin@playarena.pk' },
      { $setOnInsert: { name: 'System Admin', email: 'admin@playarena.pk', password: adminPasswordHash, role: 'admin', city: 'Rawalpindi' } },
      { upsert: true }
    );
  }
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
  if (isMongooseConnected) {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    return user ? serializeUser(user, { includePassword: true }) : null;
  }
  return memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserById(id) {
  if (isMongooseConnected) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const user = await User.findById(id);
    return user ? serializeUser(user) : null;
  }
  const user = memoryUsers.find(u => u.id === id);
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function createUser({ name, email, password, phone = '', city = 'Rawalpindi', role = 'customer' }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  if (isMongooseConnected) {
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone,
      city,
      role
    });
    return serializeUser(user);
  }
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
  if (isMongooseConnected) {
    const filters = {};
    if (city && city !== 'All') filters.city = new RegExp(`^${escapeRegex(city)}$`, 'i');
    if (sport && sport !== 'All') filters.sport = new RegExp(`^${escapeRegex(sport)}$`, 'i');
    if (featured === 'true' || featured === true) filters.isFeatured = true;
    if (search) {
      const query = new RegExp(escapeRegex(search), 'i');
      filters.$or = [{ name: query }, { address: query }, { sport: query }, { amenities: query }];
    }
    const grounds = await Ground.find(filters).sort({ createdAt: -1 }).lean();
    return grounds.map(serializeGround);
  }
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
  if (isMongooseConnected) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const ground = await Ground.findById(id).lean();
    return ground ? serializeGround(ground) : null;
  }
  return memoryGrounds.find(g => g.id === id || g._id?.toString() === id) || null;
}

export async function createGround(groundData) {
  if (isMongooseConnected) {
    const ground = await Ground.create(groundData);
    return serializeGround(ground);
  }
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
  if (isMongooseConnected) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const ground = await Ground.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
    return ground ? serializeGround(ground) : null;
  }
  const index = memoryGrounds.findIndex(g => g.id === id || g._id?.toString() === id);
  if (index === -1) return null;
  memoryGrounds[index] = { ...memoryGrounds[index], ...updateData };
  return memoryGrounds[index];
}

export async function deleteGround(id) {
  if (isMongooseConnected) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await Ground.findByIdAndDelete(id);
    return Boolean(result);
  }
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
  if (isMongooseConnected) {
    const filter = {
      ground: groundId,
      date,
      status: { $in: ['approved', 'pending'] }
    };
    if (excludeBookingId && mongoose.Types.ObjectId.isValid(excludeBookingId)) {
      filter._id = { $ne: excludeBookingId };
    }
    const bookings = (await Booking.find(filter).lean()).map(serializeBooking);
    const overlappingApproved = bookings.filter(b =>
      b.status === 'approved' && areSlotsOverlapping(startTime, endTime, b.startTime, b.endTime)
    );
    const overlappingPending = bookings.filter(b =>
      b.status === 'pending' && areSlotsOverlapping(startTime, endTime, b.startTime, b.endTime)
    );
    return {
      isAvailable: overlappingApproved.length === 0 && overlappingPending.length === 0,
      endTime,
      conflicts: overlappingApproved,
      pendingOverlaps: overlappingPending,
      isBlockedByPending: overlappingApproved.length === 0 && overlappingPending.length > 0
    };
  }

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
  if (isMongooseConnected) {
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (groundId) {
      if (!mongoose.Types.ObjectId.isValid(groundId)) return [];
      filter.ground = groundId;
    }
    if (customerEmail) filter.customerEmail = new RegExp(`^${escapeRegex(customerEmail.trim())}$`, 'i');
    if (city) filter.groundCity = new RegExp(`^${escapeRegex(city)}$`, 'i');
    const bookings = await Booking.find(filter).sort({ createdAt: -1 }).lean();
    return bookings.map(serializeBooking);
  }
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
  if (isMongooseConnected) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const booking = await Booking.findById(id).lean();
    return booking ? serializeBooking(booking) : null;
  }
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
    const conflict = availability.conflicts[0] || availability.pendingOverlaps[0];
    throw new Error(`This slot (${data.startTime} - ${endTime}) is unavailable. An approved booking exists (${conflict.startTime} - ${conflict.endTime}).`);
  }

  if (isMongooseConnected) {
    const booking = await Booking.create({
      ground: ground.id,
      groundName: ground.name,
      groundCity: ground.city,
      sport: ground.sport,
      user: data.userId || undefined,
      customerName: data.customerName,
      customerEmail: data.customerEmail.toLowerCase().trim(),
      customerPhone: data.customerPhone,
      date: data.date,
      startTime: data.startTime,
      durationHours: duration,
      endTime,
      totalAmount,
      paymentMethod: 'Pay at the Ground (Cash/On-site)',
      paymentStatus: 'unpaid',
      status: 'pending'
    });
    return serializeBooking(booking);
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
  if (isMongooseConnected) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Booking not found.');
    const booking = await getBookingById(id);
    if (!booking) throw new Error('Booking not found.');

    if (status === 'approved') {
      const availability = await checkSlotAvailability(
        booking.groundId,
        booking.date,
        booking.startTime,
        booking.durationHours,
        booking.id
      );
      if (!availability.isAvailable) {
        const conflict = availability.conflicts[0] || availability.pendingOverlaps[0];
        throw new Error(`Cannot approve booking. Slot conflicts with another booking (${conflict.startTime} - ${conflict.endTime}).`);
      }
    }

    const update = {};
    if (status) update.status = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    if (rejectionReason !== undefined) update.rejectionReason = rejectionReason;
    if (paymentStatus !== undefined) update.paymentStatus = paymentStatus;
    const updated = await Booking.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
    if (!updated) throw new Error('Booking not found.');
    return serializeBooking(updated);
  }

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
      const conflict = availability.conflicts[0] || availability.pendingOverlaps[0];
      throw new Error(`Cannot approve booking. Slot conflicts with another confirmed booking (${conflict.startTime} - ${conflict.endTime}).`);
    }
  }

  if (status) booking.status = status;
  if (adminNotes !== undefined) booking.adminNotes = adminNotes;
  if (rejectionReason !== undefined) booking.rejectionReason = rejectionReason;
  if (paymentStatus !== undefined) booking.paymentStatus = paymentStatus;

  return booking;
}
