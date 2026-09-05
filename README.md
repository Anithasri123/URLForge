# URLForge

A secure URL shortener with caching and basic analytics.

## Current Status

`Phase 4 — URL Shortening Core`

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express
- MongoDB Atlas
- Mongoose
- bcryptjs (Password Hashing)
- jsonwebtoken (JWT Authentication)

### Planned
- Redis Caching (Phase 5)
- Analytics Dashboard & React UI

## Environment Variables

Copy `.env.example` to `.env` in `server/` or project root:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/urlforge?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
```

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
| `DELETE` | `/api/urls/:id` | Yes (`Bearer <token>`) | Delete a specific URL (Ownership verified) |
| `GET` | `/:shortCode` | No | Public redirect (302) to `originalUrl` & increments click count |

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
│   │   │   └── database.js        # MongoDB connection module
│   │   ├── controllers/
│   │   │   ├── authController.js  # Registration, Login, & Profile
│   │   │   └── urlController.js   # Shortener CRUD & Redirect
│   │   ├── middleware/
│   │   │   └── authMiddleware.js  # JWT Bearer verification
│   │   ├── models/
│   │   │   ├── User.js            # User schema & bcrypt hook
│   │   │   └── URL.js             # URL schema & indexes
│   │   ├── routes/
│   │   │   ├── authRoutes.js      # Auth route definitions
│   │   │   └── urlRoutes.js       # URL CRUD route definitions
│   │   ├── utils/
│   │   │   └── generateShortCode.js # 6-char random code generator
│   │   └── server.js              # Express server entry point
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
The server will connect to MongoDB Atlas and listen on `http://localhost:5000`.

### 2. Frontend Application
In a separate terminal, navigate to the `client/` directory and start the Vite dev server:
```bash
cd client
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.
