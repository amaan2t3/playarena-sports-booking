import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { initialGrounds } from '../data/seedGrounds.js';
import { Ground } from '../models/Ground.js';
import { User } from '../models/User.js';

dotenv.config();

async function runSeed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('No MONGODB_URI found in .env. Skipping Atlas seeding.');
    process.exit(0);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas. Seeding data...');

    // Seed Grounds
    await Ground.deleteMany({});
    const groundsWithoutId = initialGrounds.map(({ id, ...rest }) => rest);
    await Ground.insertMany(groundsWithoutId);
    console.log(`✅ Seeded ${groundsWithoutId.length} sports facilities across Rawalpindi & Skardu.`);

    // Seed Default Admin and User
    await User.deleteMany({});
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    await User.create([
      {
        name: 'System Admin',
        email: 'admin@playarena.pk',
        password: adminPassword,
        phone: '+92 300 1234567',
        city: 'Rawalpindi',
        role: 'admin'
      },
      {
        name: 'Hamza Khan',
        email: 'user@playarena.pk',
        password: userPassword,
        phone: '+92 321 9876543',
        city: 'Rawalpindi',
        role: 'customer'
      }
    ]);
    console.log('✅ Seeded default admin and player accounts.');

    console.log('Seeding finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

runSeed();
