# URLForge

A secure URL shortener with caching and basic analytics.

## Current Status

`Phase 5 — Redis Caching`

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

### Planned
- Analytics Dashboard & React UI

## Environment Variables

Copy `.env.example` to `.env` in `server/` or project root:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/urlforge?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
REDIS_URL=redis://username:password@redis-host:6379
```

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

### URL Shortener Routes (`/api/urls` & `/:shortCode`)

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/urls` | Yes (`Bearer <token>`) | Create a new shortened URL (`originalUrl`, `expiresAt`) |
| `GET` | `/api/urls` | Yes (`Bearer <token>`) | List all URLs created by current user |
| `GET` | `/api/urls/:id` | Yes (`Bearer <token>`) | Get details of a specific URL (Ownership verified) |
| `DELETE` | `/api/urls/:id` | Yes (`Bearer <token>`) | Delete URL (Invalidates Redis cache & deletes from DB) |
| `GET` | `/:shortCode` | No | Public redirect (302) with Redis Cache-Aside & MongoDB fallback |

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
