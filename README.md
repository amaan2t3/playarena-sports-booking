 # 🏟️ PlayArena — Sports Ground Booking System

<p align="center">
  <strong>Your Game. Our Grounds.</strong>
</p>

<p align="center">
  A modern sports ground booking platform built with the MERN Stack.
  Discover sports facilities, request bookings, and get ready to play.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Project-Under%20Development-orange?style=for-the-badge" alt="Project Status" />
  <img src="https://img.shields.io/badge/Stack-MERN-16A34A?style=for-the-badge" alt="MERN Stack" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

---

## 📖 About the Project

**PlayArena** is a full-stack sports ground booking web application designed to simplify the process of finding and reserving sports facilities.

The platform aims to connect players and sports enthusiasts with available sports grounds in **Rawalpindi and Skardu, Pakistan**.

Users will be able to explore facilities, filter by location and sport, choose their preferred booking date and duration, and submit booking requests for administrator approval.

PlayArena is being developed as a practical real-world MERN Stack project with a focus on usability, responsive design, and efficient booking management.

## 🎯 Project Objectives

- Make sports facility discovery easier.
- Simplify the ground booking process.
- Support multiple sports and locations.
- Provide flexible booking durations.
- Allow administrators to manage booking requests.
- Build a scalable and responsive booking platform.

## 📍 Supported Locations

| City | Country |
|---|---|
| Rawalpindi | Pakistan 🇵🇰 |
| Skardu | Pakistan 🇵🇰 |

## ⚽ Supported Sports

| Sport | Facility Type |
|---|---|
| Football | Football grounds and futsal arenas |
| Cricket | Cricket grounds and practice facilities |
| Tennis | Tennis courts |
| Badminton | Indoor badminton courts |
| Other Sports | Multi-purpose sports facilities |

## ✨ Key Features

### 👤 Customer Features
- Browse available sports facilities.
- Search grounds by name.
- Filter facilities by city and sport.
- View ground details and pricing.
- Select preferred booking dates.
- Choose flexible booking durations.
- Submit booking requests.
- Track booking status (planned).
- Pay at the ground.

### 🔐 Administrator Features
- Secure administrator authentication (planned).
- Add, update and delete sports facilities.
- Manage ground information and pricing.
- View customer booking requests.
- Approve or reject booking requests.
- Manage booking statuses.
- Monitor reservations through an admin dashboard.

### 📅 Booking System
- Flexible booking durations.
- Date and time selection.
- Automatic estimated price calculation.
- Admin approval workflow.
- Booking conflict prevention.
- Pay-at-ground payment method.

## 🛠️ Technology Stack

### Frontend
<p>
  <img src="https://skillicons.dev/icons?i=react,vite,tailwind,js,html,css" alt="Frontend technologies" />
</p>

- React.js
- Vite
- Tailwind CSS
- JavaScript
- Lucide React Icons

### Backend
<p>
  <img src="https://skillicons.dev/icons?i=nodejs,express" alt="Backend technologies" />
</p>

- Node.js
- Express.js
- RESTful APIs

### Database & Authentication
<p>
  <img src="https://skillicons.dev/icons?i=mongodb" alt="MongoDB" />
</p>

Customers can create accounts to track their bookings. Administrator credentials are configured through the deployment environment and are not displayed in the application.

- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt password hashing

### Development Tools
<p>
  <img src="https://skillicons.dev/icons?i=git,github,vscode,postman" alt="Development tools" />
</p>

- Git and GitHub
- Visual Studio Code
- Postman
- MongoDB Atlas

## 🎨 Brand Identity

| Element | Value |
|---|---|
| Brand Name | PlayArena |
| Tagline | Your Game. Our Grounds. |
| Primary Green | `#14532D` |
| Sports Green | `#16A34A` |
| Fresh Mint | `#86EFAC` |
| Light Green | `#DCFCE7` |
| Background | `#F8FAF8` |
| Main Text | `#172B22` |

The interface follows a clean, modern sports-inspired design with green accents, light backgrounds, and responsive layouts.

## 📸 Screenshots

> Screenshots will be added as the project development progresses.

| Homepage | Sports Facilities |
|---|---|
| Coming soon | Coming soon |

| Booking Form | Admin Dashboard |
|---|---|
| Coming soon | Coming soon |

## 🚀 Getting Started

Follow these instructions to run the frontend locally.

### Prerequisites

Make sure you have installed:

- Node.js (LTS)
- npm
- Git
- Visual Studio Code (recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/amaan2t3/playarena-sports-booking.git
```

### 2. Navigate to the Project

```bash
cd playarena-sports-booking
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Open in Browser

```text
http://localhost:5173
```

> Backend and MongoDB setup instructions will be added when the backend is implemented.

## 📁 Planned Project Structure

```text
playarena-sports-booking/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── context/
│   ├── utils/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env.example
│   └── server.js
│
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🔄 Booking Workflow

```text
Customer
   |
   v
Browse Sports Facilities
   |
   v
Select Location and Sport
   |
   v
Choose Ground, Date and Duration
   |
   v
Submit Booking Request
   |
   v
Pending Admin Approval
   |
   +-------------------+
   |                   |
   v                   v
  Approved           Rejected
   |
   v
Pay at the Ground
   |
   v
Enjoy Your Game!
```

## 🗺️ Development Roadmap

- [x] Project name and brand identity
- [x] Initial React + Vite setup
- [x] Tailwind CSS configuration
- [x] Initial homepage and facility listings
- [x] Search and filter interface
- [x] Frontend booking form demonstration
- [ ] Express.js backend setup
- [ ] MongoDB database integration
- [ ] Ground management APIs
- [ ] Booking management APIs
- [ ] Customer authentication
- [ ] Admin authentication and dashboard
- [ ] Booking approval and rejection
- [ ] Booking availability validation
- [ ] Customer booking history
- [ ] Testing and bug fixing
- [ ] Deployment

## 🔒 Environment Variables

The backend will use environment variables to protect sensitive configuration.

Example `.env.example`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
CLIENT_URL=http://localhost:5173
```

Never commit your actual `.env` file or database credentials to GitHub.

## 🚀 Vercel Deployment

The repository root contains the Vercel configuration for both the frontend and API. In the Vercel project settings, set **Root Directory** to the repository root (`.`), then redeploy. Set `MONGODB_URI`, a strong `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the Vercel environment variables. Set `VITE_ADMIN_WHATSAPP` to the arena manager's WhatsApp number in international format (for a Pakistani `03...` number, use `92` followed by the number without its leading `0`) so booking notifications open the correct recipient; this value is included in the frontend build, so redeploy after changing it. After approving or rejecting a request, the admin dashboard opens a prefilled WhatsApp update to the customer; the admin must review and tap **Send** because WhatsApp does not permit automatic sending from a web link. If the MongoDB URI has no database path, the backend uses `MONGODB_DB_NAME` (default: `playarena`). The first deployment seeds the facility list and creates the administrator account from those values. The frontend calls same-origin `/api` endpoints, which Vercel rewrites to the serverless Express API.

The frontend supports customer registration and sign-in, and admins can review bookings, approve or reject requests, update ground information, and manage ground photo URLs. Local development without `MONGODB_URI` uses in-memory demo data; production requires MongoDB so changes persist across serverless invocations.

## 🤝 Contributing

Contributions, suggestions and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Commit your changes.
5. Open a Pull Request.

## 👨‍💻 Developer

**Amaan Ullah**

BS Information Technology Student | MERN Stack Developer

- GitHub: [@amaan2t3](https://github.com/amaan2t3)
- Portfolio: [Visit Portfolio](https://portfolio-aman-beryl.vercel.app/)

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

<p align="center">
  <strong>🏟️ PlayArena — Your Game. Our Grounds.</strong>
  <br />
  <sub>Built with ❤️ in Pakistan 🇵🇰</sub>
</p>