import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    ground: { type: mongoose.Schema.Types.ObjectId, ref: 'Ground', required: true },
    groundName: { type: String, required: true },
    groundCity: { type: String, enum: ['Rawalpindi', 'Skardu'], required: true },
    sport: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    startTime: { type: String, required: true }, // Format: "18:00"
    durationHours: { type: Number, required: true, min: 0.5, max: 12 }, // e.g. 1, 1.5, 2, 3
    endTime: { type: String, required: true }, // Format: "20:00"
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Pay at the Ground (Cash/On-site)' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid_at_ground'], default: 'unpaid' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending' // Admin approval required
    },
    adminNotes: { type: String, default: '' },
    rejectionReason: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', bookingSchema);
