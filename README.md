# URLForge

A secure URL shortener with caching and basic analytics.

## Current Status

`Phase 7 — Security & Robustness`

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express
- MongoDB Atlas (Persistent Source of Truth)
- Mongoose
- Redis (Performance Cache & Fallback)
- bcryptjs (Password Hashing)
- jsonwebtoken (JWT Authentication)
- Helmet (HTTP Security Headers)
- express-rate-limit (Abuse & Brute-Force Rate Limiting)

### Planned
- Analytics Dashboard & React UI

## Environment Variables

Copy `.env.example` to `.env` in `server/` or project root:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/urlforge?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
REDIS_URL=redis://username:password@redis-host:6379
CLIENT_URL=http://localhost:5173
```

## Security & Robustness

URLForge incorporates a multi-layered defense-in-depth strategy:

1. **Authentication**: JWT validation (`authMiddleware.js`) with bcrypt password hashing.
2. **Authorization**: Strict ownership validation (`urlDoc.userId === req.user._id`) on URL detail, stats, and delete operations.
3. **Helmet**: Sets security HTTP headers (`X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Content-Security-Policy`).
4. **CORS**: Explicit origin control tied to `process.env.CLIENT_URL || 'http://localhost:5173'`.
5. **Rate Limiting**: Protects auth endpoints (`10 reqs/15 min`) against brute-force attacks and API routes (`100 reqs/15 min`).
6. **Input Validation & Type Hygiene**: Enforces type checks, regex patterns for URLs and emails, and ObjectIDs to prevent MongoDB operator injection.
7. **Mass Assignment Protection**: Ignores client-supplied `userId` or `clickCount` overrides on creation.
8. **Centralized Error Handling**: Standardized 404 and Error middleware (`errorHandler.js`) that hides internal database stack traces in production.
9. **Resilient Fallback**: Graceful fallback to MongoDB if Redis is offline.

> **Limitations Note**: URLForge demonstrates practical backend security fundamentals but is not intended to be a fully hardened production security system.

## Analytics & Expiration

URLForge tracks simple, essential statistics for shortened URLs:

* `clickCount`: Total successful redirects (incremented atomically in MongoDB on each redirect).
* `createdAt`: Creation timestamp.
* `expiresAt`: Optional expiration date (`null` if no expiration set).
* `status`: Derived URL state (`"active"` or `"expired"`).

### Core Principles
1. **Atomic Increments**: `clickCount` is updated via MongoDB `$inc` on public redirects, preventing race conditions. Read calls to the analytics endpoint are strictly read-only and do not increment click counts.
2. **Derived Status**: `status` is derived dynamically from `expiresAt` rather than storing duplicated database state.
3. **Expired URL Access**: Expired URLs return `410 Gone` on public redirect attempts, but their statistics remain viewable to the URL owner.

## Redis Caching Architecture

```text
GET /:shortCode
       ↓
     Redis (url:<shortCode>)
       │
    ┌──┴──┐
   HIT   MISS
    │      │
    │    MongoDB
    │      │
    │    Redis SET (TTL: 300s)
    │      │
    └──┬───┘
       ↓
Check expiration
       ↓
MongoDB atomic click increment ($inc)
       ↓
302 Redirect
```

### Core Principles
1. **Source of Truth**: MongoDB is the authoritative database. Redis is an optional performance cache.
2. **Resilience & Fallback**: If Redis is offline or fails, the application automatically falls back to querying MongoDB without returning 500 errors.
3. **Cache Invalidation**: Deleting a URL via `DELETE /api/urls/:id` immediately removes the corresponding `url:<shortCode>` key from Redis.

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Authenticate user and receive JWT |
| `GET` | `/api/auth/me` | Yes (`Bearer <token>`) | Fetch current authenticated user profile |
| `GET` | `/api/health` | No | Health check endpoint |

### URL Shortener & Analytics Routes (`/api/urls` & `/:shortCode`)

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/urls` | Yes (`Bearer <token>`) | Create a new shortened URL (`originalUrl`, `expiresAt`) |
| `GET` | `/api/urls` | Yes (`Bearer <token>`) | List all URLs created by current user |
| `GET` | `/api/urls/:id` | Yes (`Bearer <token>`) | Get details of a specific URL (Ownership verified) |
| `GET` | `/api/urls/:id/stats` | Yes (`Bearer <token>`) | Get analytics and status for a specific URL (Ownership verified) |
| `DELETE` | `/api/urls/:id` | Yes (`Bearer <token>`) | Delete URL (Invalidates Redis cache & deletes from DB) |
| `GET` | `/:shortCode` | No | Public redirect (302) with Redis Cache-Aside & MongoDB fallback |

#### Statistics Response Example (`GET /api/urls/:id/stats`):
```json
{
  "id": "66dab123456789abcdef0123",
  "shortCode": "aB72xK",
  "originalUrl": "https://example.com/products/phone",
  "shortUrl": "http://localhost:5000/aB72xK",
  "clickCount": 42,
  "createdAt": "2026-09-06T10:00:00.000Z",
  "expiresAt": "2026-10-01T00:00:00.000Z",
  "status": "active"
}
```

## Project Structure

```text
URLForge/
├── client/              # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── vite.config.js
│
├── server/              # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js      # MongoDB connection module
│   │   │   └── redis.js         # Redis connection module (resilient error handling)
│   │   ├── controllers/
│   │   │   ├── authController.js# Registration, Login, & Profile
│   │   │   └── urlController.js # Shortener CRUD, Cache-Aside Redirect
│   │   ├── middleware/
│   │   │   └── authMiddleware.js# JWT Bearer verification
│   │   ├── models/
│   │   │   ├── User.js          # User schema & bcrypt hook
│   │   │   └── URL.js           # URL schema & indexes
│   │   ├── routes/
│   │   │   ├── authRoutes.js    # Auth route definitions
│   │   │   └── urlRoutes.js     # URL CRUD route definitions
│   │   ├── services/
│   │   │   └── cacheService.js  # Redis get/set/del cache abstraction
│   │   ├── utils/
│   │   │   └── generateShortCode.js # 6-char random code generator
│   │   └── server.js            # Express server entry point
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md
```

## Local Development Instructions

### 1. Backend Server
Navigate to the `server/` directory and start the server:
```bash
cd server
npm install
npm run dev
```
The server will connect to MongoDB Atlas and Redis, and listen on `http://localhost:5000`.

### 2. Frontend Application
In a separate terminal, navigate to the `client/` directory and start the Vite dev server:
```bash
cd client
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.
