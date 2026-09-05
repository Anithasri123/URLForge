# URLForge

A secure URL shortener with caching and basic analytics.

## Current Status

`Phase 2 — MongoDB & Data Models`

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

### Planned
- Redis
- JWT / Authentication

## Environment Variables

Copy `.env.example` to `.env` inside `server/` or project root and configure:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/urlforge?retryWrites=true&w=majority
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
│   │   │   └── database.js   # MongoDB connection module
│   │   ├── models/
│   │   │   ├── User.js       # User Mongoose schema & indexes
│   │   │   └── URL.js        # URL Mongoose schema & indexes
│   │   └── server.js         # Express server & startup flow
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md
```

## Database Design

### User Model
- `name`: String (required, trimmed)
- `email`: String (required, unique, indexed, lowercase)
- `password`: String (required)
- `timestamps`: `createdAt`, `updatedAt`

### URL Model
- `originalUrl`: String (required, valid HTTP/HTTPS URL)
- `shortCode`: String (required, unique, indexed)
- `userId`: ObjectId (reference to `User`, indexed)
- `clickCount`: Number (default 0)
- `expiresAt`: Date (optional)
- `timestamps`: `createdAt`, `updatedAt`

## Local Development Instructions

### 1. Backend Server
Navigate to the `server/` directory and start the server:
```bash
cd server
npm install
npm run dev
```
The server will connect to MongoDB Atlas and listen on `http://localhost:5000`. Test server status at `http://localhost:5000/api/health`.

### 2. Frontend Application
In a separate terminal, navigate to the `client/` directory and start the Vite dev server:
```bash
cd client
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.
