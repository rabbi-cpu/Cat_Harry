# StudioSpace Server 🎬

Backend REST API server for **StudioSpace** — a peer-to-peer creative workspace and studio rental platform. Built with Node.js, Express, and MongoDB Atlas.

---

## 🚀 Live Server URL
- **Live Deployment:** *(Vercel/Render লাইভ লিঙ্ক এখানে বসাবেন)*
- **Client Repository:** *(ফ্রন্টএন্ড গিটহাব লিঙ্ক এখানে বসাবেন)*

---

## 🛠️ Tech Stack & Dependencies
- **Runtime:** Node.js
- **Framework:** Express.js (v5)
- **Database:** MongoDB Atlas (Native Driver v7)
- **Authentication & Security:** JSON Web Token (JWT), Cookie-Parser, CORS, Dotenv
- **Dev Tool:** Nodemon

---

## 📌 Features & API Endpoints

### 🔐 Authentication (`/api`)
- `POST /api/jwt` — Generate JWT access token on user login (HttpOnly Cookie / Bearer token).
- `POST /api/logout` — Clear auth cookie on user logout.

### 🏢 Studios (`/api/studios`)
- `GET /api/seed-studios` — Seed initial demo creative studios into MongoDB.
- `GET /api/studios` — Fetch all studios (supports query params: `category`, `search`, `sort`).
- `GET /api/studios/:id` — Fetch details of a single studio by ID.
- `POST /api/studios` — Add a new studio listing (Protected with `verifyToken`).
- `GET /api/my-studios?email=...` — Fetch listings created by a specific host (Protected).
- `PUT /api/studios/:id` — Update studio details (Protected).
- `DELETE /api/studios/:id` — Delete a studio listing (Protected).

### 📅 Bookings (`/api/bookings`)
- `POST /api/bookings` — Create a new studio booking (Protected).
- `GET /api/my-bookings?email=...` — Fetch bookings for a specific user (Protected).
- `PATCH /api/bookings/:id/cancel` — Cancel an existing booking status (Protected).

---

