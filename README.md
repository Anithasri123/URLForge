# URLForge

A secure URL shortener with caching and basic analytics.

## Current Status

`Phase 3 — Authentication`

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
- Redis
- URL Shortening Logic
- Analytics

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
| `POST` | `/api/auth/register` | No | Register a new user (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | No | Authenticate user and receive JWT token |
| `GET` | `/api/auth/me` | Yes (`Bearer <token>`) | Fetch current authenticated user profile |
| `GET` | `/api/health` | No | Health check endpoint |

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
│   │   │   └── database.js      # MongoDB connection module
│   │   ├── controllers/
│   │   │   └── authController.js# Registration, Login, & Profile logic
│   │   ├── middleware/
│   │   │   └── authMiddleware.js# JWT Bearer verification
│   │   ├── models/
│   │   │   ├── User.js          # User schema with pre-save bcrypt hashing
│   │   │   └── URL.js           # URL schema
│   │   ├── routes/
│   │   │   └── authRoutes.js    # Auth route definitions
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
The server will connect to MongoDB Atlas and listen on `http://localhost:5000`.

### 2. Frontend Application
In a separate terminal, navigate to the `client/` directory and start the Vite dev server:
```bash
cd client
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.
