# PlayArena — Sports Facility Discovery & Booking Platform

**PlayArena** is a sports discovery and reservation platform tailored for grounds, turfs, and sports arenas across **Rawalpindi** and **Skardu**.

---

## 🌟 Core Highlights & Booking Rules

1. **Admin Approval Workflow**
   - All booking requests initially sit in `PENDING` status upon submission.
   - An administrator verifies ground availability, lighting, and readiness before clicking **Approve** or **Reject**.
   - **Double-booking prevention:** The system mathematically checks slot intervals (`[startTime, endTime]`) and prevents overlapping confirmed bookings for the same facility.

2. **Pay at the Ground (No Online Gateway in v1)**
   - No payment gateway friction or upfront credit card charges.
   - Players select their slot and pay in cash or on-site at the ground counter upon arrival.
   - Ground staff and admins can mark bookings as `Paid at Ground` directly from the dashboard.

3. **Flexible Duration & Slot Availability**
   - Players choose their desired match date, start time, and flexible duration (`1 hr`, `1.5 hrs`, `2 hrs`, `2.5 hrs`, `3 hrs`, `4 hrs`).
   - The system calculates the exact end time and match fee based on the facility's hourly rate.

4. **Multi-Sport Support**
   - ⚽ **Football / Futsal**: 5G FIFA-grade turf arenas
   - 🎾 **Tennis**: Clay courts & synthetic hard courts
   - 🏏 **Cricket**: AstroTurf pitches & box cricket with bowling machines
   - 🏸 **Badminton**: BWF-approved synthetic mats & indoor halls
   - 🏓 **Other Sports**: Multi-sport gyms, table tennis, volleyball

5. **Supported Hubs**
   - **Rawalpindi**: Commercial Market, Satellite Town, Chaklala, Bahria Town, Ayub Park.
   - **Skardu**: Airport Road, Lower Kachura (Shangrila), Yadgar Chowk, Aliabad.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + Vite + Tailwind CSS + Lucide Icons
- **Backend**: Node.js + Express.js (REST API, JWT Authentication, bcryptjs)
- **Database**: MongoDB Atlas via Mongoose with automatic zero-configuration in-memory/JSON store fallback
- **Deployment**: Vercel ready (Frontend) & Render ready (Backend)

---

## 🔑 Demo & Test Accounts

You can test without signing up using the **1-Click Demo Accounts** in the top navigation banner, or with the following credentials:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@playarena.pk` | `admin123` | Approve/Reject bookings, slot conflict check, toggle payment status, add/remove arenas |
| **Player / Customer** | `user@playarena.pk` | `user123` | Browse grounds, filter by city & sport, submit booking requests, track booking status |

---

## 🚀 Getting Started Locally

### 1. Backend Server
```bash
cd backend
npm install
npm run dev
```
Backend will start on `http://localhost:5000` with pre-seeded arenas in Rawalpindi and Skardu.

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:5173`.

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new player account
- `POST /api/auth/login` - Sign in and receive JWT token
- `GET /api/auth/me` - Get profile of authenticated user

### Grounds & Arenas
- `GET /api/grounds?city=Rawalpindi&sport=Football&search=turf` - List and filter facilities
- `GET /api/grounds/:id` - Get ground details
- `GET /api/grounds/:id/availability?date=YYYY-MM-DD&startTime=18:00&durationHours=2` - Check slot conflict
- `POST /api/grounds` - (Admin only) Register new arena
- `DELETE /api/grounds/:id` - (Admin only) Remove arena

### Bookings
- `GET /api/bookings` - Retrieve booking requests (filtered by customer or status)
- `POST /api/bookings` - Submit slot booking request (status defaults to `pending`)
- `PATCH /api/bookings/:id/status` - (Admin only) Approve or reject booking
- `PATCH /api/bookings/:id/payment` - (Admin only) Mark payment as `paid_at_ground`

---

## 🚢 Production Deployment

### Frontend on Vercel
1. Set the root directory to `frontend`.
2. Framework Preset: `Vite`.
3. Set environment variable: `VITE_API_BASE_URL=https://your-backend-service.onrender.com/api`.

### Backend on Render
1. Set the root directory to `backend`.
2. Build command: `npm install`.
3. Start command: `node src/server.js`.
4. Environment variables:
   - `PORT=5000`
   - `MONGODB_URI=your_mongodb_atlas_connection_string`
   - `JWT_SECRET=your_secret_key`
