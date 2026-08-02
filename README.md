<h1 align="center">
  🏠 SmartStay
</h1>

<p align="center">
  <strong>A full-stack PG & Hostel Management System for Owners and Tenants</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Redux-Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white" />
  <img src="https://img.shields.io/badge/Razorpay-Payment-02042B?style=for-the-badge&logo=razorpay&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudinary-Image_Upload-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Security](#-security)

---

## 🌟 Overview

SmartStay is a production-grade, full-stack web application that digitalizes the entire lifecycle of PG (Paying Guest) and hostel management. It provides a unified platform for **Property Owners** to manage their real estate portfolio and for **Students/Tenants** to find, book, and manage their accommodation — all from a single dashboard.

The system handles the complete tenant lifecycle:
**Browse Rooms → Apply → Get Approved → Pay Rent → Raise Complaints → Checkout**

---

## ✨ Features

### 👤 Authentication
- Secure registration and login with **bcrypt** password hashing (salt rounds: 10)
- Dual-token JWT strategy: short-lived **Access Token** (15 min) + long-lived **Refresh Token** (7 days)
- Tokens stored in **HttpOnly cookies** — immune to XSS attacks
- Automatic token refresh via Axios Response Interceptor — users never see an unexpected logout

### 🏢 Property Management (Owner)
- Full CRUD for property listings with multi-image upload via **Multer + Cloudinary**
- Images stored on Cloudinary CDN; database stores only URLs (bypasses MongoDB 16MB limit)
- Nested routing (`/properties/:propertyId/rooms`) validates property ownership before processing file uploads

### 🛏️ Room Management (Owner)
- Create and manage rooms with capacity, rent, and amenities
- **Mongoose `pre/post` save hooks** automatically sync room availability counts on the parent Property document
- Prevents race conditions — counts are recalculated from the database, not incremented manually

### 📝 Join Requests (Booking)
- Students apply for available rooms with optional document uploads (ID proof)
- Owner approval triggers a **bulk rejection** of all other pending applicants for the same room via `updateMany`
- **Redux Optimistic UI Update** — competing applicant badges update instantly on the owner's screen without a re-fetch

### 💳 Payments (Razorpay)
- **3-step payment architecture**: Order creation → Student pays → Backend verification
- Rent amount is **fetched server-side from the database** — frontend can never manipulate the price
- Payment authenticity verified via **HMAC-SHA256 cryptographic signature**
- **Idempotency check** prevents duplicate payment records on network retry
- **Denormalized** payment status on `JoinRequest` for fast dashboard reads

### 📊 Dashboard (Owner)
- Real-time analytics: occupancy rates, today's revenue, monthly revenue, rent defaulters
- Per-property breakdown of income and vacancy
- Maintenance queue, pending complaints counter, recent payments feed
- `.lean()` queries for memory-efficient reads; `countDocuments` instead of `.find().length`
- `new Set()` for counting unique payers to identify defaulters accurately

### 🔧 Complaints (Ticketing System)
- Students can only raise complaints if they have an active approved booking (anti-spam)
- Built-in **threaded chat** between owner and tenant using MongoDB **Embedded Document Arrays**
- **Field-Level Authorization** — only owners can change the complaint status; students can only chat
- Single `PATCH` endpoint handles both status updates and chat messages

### 🔨 Maintenance Tasks (Owner)
- Owner-exclusive task scheduler for maintenance jobs
- **Router-level authorization** blocks all non-owners before reaching any controller
- **Higher-Order Function closure** powers the `authorize()` middleware
- Database Index on `owner` field for O(log n) lookups

### 🚪 Checkout
- Formal checkout request system with move-out date and reason
- Owner approval triggers a **Cascading Update** across 4 MongoDB collections simultaneously:
  `CheckoutRequest` → `JoinRequest` → `Room` → `Notification`
- **State Machine Guard** prevents double-processing of the same request

### 🔔 Notifications
- Passive, event-driven notification system — created as side effects by other controllers
- Displayed in the Dashboard's notification feed (latest 5, sorted newest first)
- Dual database indexes (`user` + `createdAt`) for fast filtered + sorted queries

---

## 🛠️ Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| `express` | ^5.2.1 | REST API Framework |
| `mongoose` | ^9.7.3 | MongoDB ODM + Schema Validation |
| `jsonwebtoken` | ^9.0.3 | JWT Access + Refresh Tokens |
| `bcryptjs` | ^3.0.3 | Password Hashing |
| `cookie-parser` | ^1.4.7 | HttpOnly Cookie Parsing |
| `multer` | ^2.2.0 | Multipart Form Data (File Uploads) |
| `cloudinary` | ^1.41.3 | Cloud Image Storage |
| `razorpay` | ^2.9.6 | Payment Gateway Integration |
| `cors` | ^2.8.6 | Cross-Origin Resource Sharing |
| `morgan` | ^1.11.0 | HTTP Request Logging |
| `express-validator` | ^7.3.2 | Request Validation |
| `nodemon` | ^3.1.14 | Dev Server Auto-Restart |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.7 | UI Library |
| `react-router-dom` | ^7.18.1 | Client-Side Routing |
| `@reduxjs/toolkit` | ^2.12.0 | State Management |
| `axios` | ^1.18.1 | HTTP Client + Interceptors |
| `framer-motion` | ^12.42.2 | Animations |
| `recharts` | ^3.9.2 | Dashboard Charts |
| `lucide-react` | ^1.23.0 | Icon Library |
| `react-hot-toast` | ^2.6.0 | Toast Notifications |
| `tailwindcss` | ^3.4.19 | Utility CSS Framework |
| `vite` | ^8.1.1 | Build Tool |

---

## 📁 Project Structure

```
SmartStay/
├── backend/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── cloudinary.js       # Cloudinary configuration
│   ├── constants/
│   │   └── roles.js            # Centralized role constants (ROLES.OWNER, etc.)
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── property.controller.js
│   │   ├── room.controller.js
│   │   ├── joinRequest.controller.js
│   │   ├── payment.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── complaint.controller.js
│   │   ├── task.controller.js
│   │   └── checkout.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js   # protect + authorize (Higher-Order Function)
│   │   └── error.middleware.js  # Global error handler (11000, CastError, ValidationError)
│   ├── models/
│   │   ├── user.model.js
│   │   ├── property.model.js
│   │   ├── room.model.js        # pre/post save hooks
│   │   ├── joinRequest.model.js
│   │   ├── Payment.model.js
│   │   ├── Complaint.model.js   # Embedded replySchema
│   │   ├── Task.model.js
│   │   ├── checkoutRequest.model.js
│   │   └── Notification.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── property.routes.js
│   │   ├── joinRequest.routes.js
│   │   ├── payment.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── complaint.routes.js
│   │   ├── task.routes.js
│   │   └── checkout.routes.js
│   ├── services/
│   │   └── razorpay.service.js  # createOrder + verifySignature (HMAC-SHA256)
│   ├── validators/
│   ├── app.js                   # Express app config (CORS, parsers, routes)
│   └── server.js                # Entry point (DB connect, graceful shutdown)
│
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── services/
        │   └── api.js           # Axios instance + Request/Response Interceptors
        └── store/
            ├── index.js         # Redux store configuration
            ├── storeRef.js      # Circular dependency solution
            └── slices/
                ├── authSlice.js
                ├── propertySlice.js
                ├── roomSlice.js
                ├── joinRequestSlice.js
                ├── paymentSlice.js
                ├── dashboardSlice.js
                ├── complaintSlice.js
                ├── taskSlice.js
                └── checkoutSlice.js
```

---

## 🏗️ Architecture

### Request Lifecycle
```
Browser → CORS Check → Body Parser → cookieParser
       → Route Match → protect (JWT verify) → authorize (Role check)
       → Controller → Service/Model → MongoDB
       → Response → errorHandler (if error)
```

### Auto Token Refresh Flow
```
API Call → 401 (Token Expired)
         → POST /auth/refresh-token (HttpOnly cookie)
         → New Access Token issued
         → Redux state updated (setCredentials)
         → All queued failed requests replayed
         → User sees nothing — completely seamless
```

### Payment Flow
```
Student clicks "Pay" → Backend fetches rent from DB (price locked server-side)
                     → Razorpay Order created (orderId returned)
                     → Student pays via Razorpay popup
                     → Razorpay sends HMAC-SHA256 signature to Frontend
                     → Frontend sends signature to Backend for verification
                     → Backend recomputes hash and compares
                     → Match → Payment recorded → Booking marked Paid
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- Cloudinary account
- Razorpay account (test keys for development)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/smartstay.git
cd smartstay
```

**2. Install Backend Dependencies**
```bash
cd backend
npm install
```

**3. Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

**4. Configure Environment Variables**

Create a `.env` file inside the `backend/` directory (see [Environment Variables](#-environment-variables) below).

Create a `.env` file inside the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

**5. Run the Application**

Start the backend (from `backend/` directory):
```bash
npm run dev
```

Start the frontend (from `frontend/` directory):
```bash
npm run dev
```

The backend runs on `http://localhost:5000` and the frontend on `http://localhost:5173`.

---

## 🔐 Environment Variables

Create `backend/.env` with the following:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/smartstay
# OR for Atlas:
# MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/smartstay

# JWT
JWT_ACCESS_SECRET=your_access_token_secret_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (use test keys for development)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Client
CLIENT_URL=http://localhost:5173
```

> ⚠️ **Never commit your `.env` file to version control.** Add it to `.gitignore`.

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive tokens |
| POST | `/api/auth/logout` | Protected | Logout and clear cookies |
| POST | `/api/auth/refresh-token` | Public | Refresh access token |
| GET | `/api/auth/me` | Protected | Get current user profile |

### Properties
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/properties` | Public | Get all properties |
| POST | `/api/properties` | Owner | Create a property (multipart) |
| GET | `/api/properties/:id` | Public | Get single property |
| PUT | `/api/properties/:id` | Owner | Update property |
| DELETE | `/api/properties/:id` | Owner | Delete property + images |

### Rooms
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/properties/:propertyId/rooms` | Public | Get all rooms in a property |
| POST | `/api/properties/:propertyId/rooms` | Owner | Create a room |
| PUT | `/api/properties/:propertyId/rooms/:id` | Owner | Update a room |
| DELETE | `/api/properties/:propertyId/rooms/:id` | Owner | Delete a room |

### Join Requests
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/join-requests` | Student | Submit a join request |
| GET | `/api/join-requests/tenant` | Student | Get own requests |
| GET | `/api/join-requests/owner` | Owner | Get incoming requests |
| PATCH | `/api/join-requests/:id/status` | Owner | Approve or reject a request |

### Payments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/payments/create-order` | Student | Create Razorpay order |
| POST | `/api/payments/verify` | Student | Verify payment signature |
| GET | `/api/payments/history` | Protected | Get payment history |

### Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard/owner` | Owner | Get complete owner dashboard data |

### Complaints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/complaints` | Student | Create a complaint |
| GET | `/api/complaints` | Protected | Get complaints (role-filtered) |
| PATCH | `/api/complaints/:id` | Protected | Update status or add reply |

### Maintenance Tasks
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/tasks` | Owner | Get all tasks |
| POST | `/api/tasks` | Owner | Create a task |
| PATCH | `/api/tasks/:id` | Owner | Update task status |

### Checkout
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/checkout/request` | Student | Submit checkout request |
| GET | `/api/checkout/my-request` | Student | Get own checkout requests |
| GET | `/api/checkout/owner` | Owner | Get incoming checkout requests |
| PUT | `/api/checkout/:id/approve` | Owner | Approve checkout (cascading update) |
| PUT | `/api/checkout/:id/reject` | Owner | Reject checkout |
| GET | `/api/checkout/:id` | Protected | Get single checkout request |

### Health Check
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Server health check |

---

## 🔒 Security

| Mechanism | Implementation | Protects Against |
|---|---|---|
| **HttpOnly Cookies** | JWT stored in HttpOnly cookie | XSS Token Theft |
| **bcrypt Hashing** | `bcrypt.hash(password, 10)` | Plain-text password exposure |
| **JWT Verification** | `jwt.verify()` on every request | Fake/Tampered tokens |
| **Role-Based Access** | `authorize()` Higher-Order Function | Wrong-role route access |
| **Owner Validation** | `resource.owner !== req.user.id` | Unauthorized resource modification |
| **Server-Side Pricing** | Rent fetched from DB, not frontend | Client-Side Payload Tampering |
| **HMAC-SHA256** | Payment signature verification | Payment fraud |
| **Idempotency Checks** | `if (paymentStatus === 'Paid')` | Duplicate payments |
| **Mongoose Enums** | Schema-level whitelist validation | Invalid data injection |
| **CORS Whitelist** | Origin-based request filtering | Cross-site request forgery |
| **DoS Prevention** | `express.json({ limit: '10mb' })` | Payload flooding attacks |
| **Graceful Shutdown** | `SIGTERM/SIGINT` handlers | Data corruption on server crash |

---
<img width="1706" height="948" alt="image" src="https://github.com/user-attachments/assets/80f7839f-c0ba-4890-8561-a5a56135662d" />
<img width="684" height="806" alt="image" src="https://github.com/user-attachments/assets/6c4235f6-60cf-4f41-a5a0-34191a154054" />


## 👨‍💻 Author

**Ayush Singh**

---

## 📄 License

This project is licensed under the ISC License.
