import express from 'express';
import {
  getAllGrounds,
  getGroundById,
  createGround,
  updateGround,
  deleteGround,
  checkSlotAvailability,
  getAllBookings
} from '../services/store.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// List grounds with filters for City and Sport
router.get('/', async (req, res) => {
  try {
    const { city, sport, search, featured } = req.query;
    const grounds = await getAllGrounds({ city, sport, search, featured });
    res.json({ count: grounds.length, data: grounds });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check availability for a specific ground slot
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, durationHours } = req.query;

    if (!date || !startTime || !durationHours) {
      return res.status(400).json({ message: 'Date, startTime, and durationHours query parameters are required.' });
    }

    const ground = await getGroundById(id);
    if (!ground) {
      return res.status(404).json({ message: 'Ground not found' });
    }

    const availability = await checkSlotAvailability(id, date, startTime, Number(durationHours));
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all booked time ranges for a ground on a specific date (for time-slot UI blocking)
router.get('/:id/booked-slots', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date query parameter is required.' });
    }

    const bookings = await getAllBookings({ groundId: id });
    const bookedOnDate = bookings.filter(b =>
      b.date === date &&
      (b.status === 'approved' || b.status === 'pending')
    );

    const slots = bookedOnDate.map(b => ({
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status
    }));

    res.json({ date, slots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Single ground details
router.get('/:id', async (req, res) => {
  try {
    const ground = await getGroundById(req.params.id);
    if (!ground) {
      return res.status(404).json({ message: 'Ground facility not found' });
    }
    res.json(ground);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Create new ground facility
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, city, sport, address, hourlyRate, description } = req.body;
    if (!name || !city || !sport || !address || !hourlyRate) {
      return res.status(400).json({ message: 'Missing required ground facility details.' });
    }

    const created = await createGround(req.body);
    res.status(201).json({ message: 'Ground facility added successfully', data: created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update ground facility
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updated = await updateGround(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Ground facility not found' });
    }
    res.json({ message: 'Ground updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Delete ground facility
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const success = await deleteGround(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Ground facility not found' });
    }
    res.json({ message: 'Ground facility removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
