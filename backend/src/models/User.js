import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    city: { type: String, enum: ['Rawalpindi', 'Skardu'], default: 'Rawalpindi' },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
