# Space Explorer Dashboard (PERN Stack)

This repository contains the backend and frontend for the Space Explorer Dashboard, integrating with NASA's APOD, Mars Rover, and NEO APIs.

It was built as part of the Interim Recruitment Task for the Operations Committee.

## Architecture Note

The project is structured into two main applications:
1. **Frontend (`/frontend`)**: A React application built with Vite, Tailwind CSS, TanStack Query for state/caching management, React Router for navigation with URL state sync, and `react-window` for heavily virtualized lists.
2. **Backend (`/backend`)**: A Node.js + Express.js API utilizing PostgreSQL via Prisma ORM (specifically `@prisma/adapter-pg` driver for modern deployment readiness). It caches external responses and persists user "Favorites" to the database.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL server running locally or via Docker

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder.
2. Run `npm install` to install dependencies.
3. Copy the `.env.example` file to `.env` and configure your `DATABASE_URL` with your local Postgres password, and insert your NASA API key.
4. Initialize the database schema:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *(The server will run on port 5000 and expose Swagger docs at `http://localhost:5000/api/docs`)*

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder.
2. Run `npm install` to install frontend dependencies.
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *(The frontend runs on `http://localhost:5173`)*

## Caching and Rate-Limiting Strategy

### Caching
To prevent hammering NASA's APIs and exhausting the hourly rate limits of the `DEMO_KEY`, the backend uses `node-cache` (an in-memory caching mechanism).
- **APOD**: Cached for 24 hours (86400s) since the picture only changes once a day.
- **Mars Photos**: Cached for 30 minutes (1800s). Historic photos rarely change, but caching them saves large bandwidth and API calls on repeated filters.
- **NEO**: Cached for 1 hour (3600s).

### Rate Limiting
We use `express-rate-limit` on the backend API endpoints to prevent abuse. It restricts users to 100 requests per 15 minutes per IP address.

### Trade-offs Made Under Time Pressure
**Trade-off: Using In-Memory Caching (`node-cache`) over Redis.**
- *Reasoning*: Implementing a full Redis instance requires additional containerization or local installation steps for whoever is running this project. Under time constraints and to prioritize simplicity and easy setup (zero extra dependencies outside of PostgreSQL), an in-memory cache was chosen.
- *Downside*: In-memory cache does not scale well horizontally. If we were to spin up multiple instances of this Node server behind a load balancer, each instance would have its own empty cache, leading to redundant calls to NASA's API until all instances have warmed up their caches. A shared Redis instance would solve this for production.
