# URLForge

A secure URL shortener with caching and basic analytics.

## Current Status

`Phase 1 — Project Skeleton`

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express

### Planned
- MongoDB (Atlas)
- Redis
- JWT / Authentication

## Project Structure

- `client/` — React + Vite frontend
- `server/` — Node.js + Express backend

## Local Development Instructions

### 1. Backend Server
Navigate to the `server/` directory and start the development server:
```bash
cd server
npm install
npm run dev
```
The backend server will run on `http://localhost:5000`. You can verify the server by visiting `http://localhost:5000/api/health`.

### 2. Frontend Application
In a separate terminal, navigate to the `client/` directory and start the Vite development server:
```bash
cd client
npm install
npm run dev
```
The frontend application will run on `http://localhost:5173`.
