import express from 'express';
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus
} from '../services/store.js';
import { authenticateToken, optionalAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get bookings (Admins see all; regular authenticated customers see their own; or query by customerEmail)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status, groundId, city, customerEmail } = req.query;

    const filterEmail = req.user?.role === 'admin'
      ? customerEmail
      : req.user?.email || customerEmail;

    const bookings = await getAllBookings({
      status,
      groundId,
      city,
      customerEmail: filterEmail
    });

    res.json({ count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single booking by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking request not found' });
    }
    if (!req.user || (req.user.role !== 'admin' && booking.customerEmail !== req.user.email)) {
      return res.status(404).json({ message: 'Booking request not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create booking request (Customers or Guests)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      groundId,
      customerName,
      customerEmail,
      customerPhone,
      date,
      startTime,
      durationHours
    } = req.body;

    const bookingName = req.user?.name || customerName;
    const bookingEmail = req.user?.email || customerEmail;

    // Validation
    if (!groundId || !bookingName || !bookingEmail || !customerPhone || !date || !startTime || !durationHours) {
      return res.status(400).json({
        message: 'Missing required booking fields. Please provide ground, your contact information, date, start time, and duration.'
      });
    }

    const parsedDuration = Number(durationHours);
    if (isNaN(parsedDuration) || parsedDuration < 0.5 || parsedDuration > 10) {
      return res.status(400).json({
        message: 'Duration must be a flexible slot between 0.5 and 10 hours.'
      });
    }

    // Check date validity (cannot book in the past)
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return res.status(400).json({
        message: 'Cannot book slots on a past date.'
      });
    }

    const newBooking = await createBooking({
      groundId,
      userId: req.user ? req.user.id : null,
      customerName: bookingName,
      customerEmail: bookingEmail,
      customerPhone,
      date,
      startTime,
      durationHours: parsedDuration
    });

    res.status(201).json({
      message: 'Booking request placed successfully! Status is PENDING admin approval. Payment is due at the ground.',
      data: newBooking
    });
  } catch (error) {
    // Overlap conflict returns 409
    if (error.message.includes('unavailable') || error.message.includes('conflict')) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update booking status (Approve or Reject)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, adminNotes, rejectionReason } = req.body;

    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved, rejected, or cancelled.' });
    }

    const updated = await updateBookingStatus(req.params.id, {
      status,
      adminNotes,
      rejectionReason
    });

    res.json({
      message: `Booking has been marked as ${status.toUpperCase()}.`,
      data: updated
    });
  } catch (error) {
    if (error.message.includes('conflicts with another confirmed booking')) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// Admin / Ground Reception: Update payment status ('unpaid' -> 'paid_at_ground')
router.patch('/:id/payment', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!['unpaid', 'paid_at_ground'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status.' });
    }

    const updated = await updateBookingStatus(req.params.id, {
      paymentStatus
    });

    res.json({
      message: `Payment status updated to ${paymentStatus}.`,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
