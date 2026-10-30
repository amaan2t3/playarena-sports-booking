import mongoose from 'mongoose';

const groundSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: String, enum: ['Rawalpindi', 'Skardu'], required: true },
    sport: { type: String, enum: ['Football', 'Tennis', 'Cricket', 'Badminton', 'Other sports'], required: true },
    address: { type: String, required: true },
    hourlyRate: { type: Number, required: true },
    images: [{ type: String }],
    amenities: [{ type: String }],
    openingTime: { type: String, default: '06:00' },
    closingTime: { type: String, default: '23:00' },
    rules: [{ type: String }],
    description: { type: String },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Ground = mongoose.model('Ground', groundSchema);
