# Wave

Real-time chat application with a Node.js/Express + MongoDB backend and a React + Vite frontend (plus Capacitor Android support).

## Features

- Authentication with protected sessions
- Real-time messaging via Socket.IO
- Online presence + typing indicators
- Delivery/read status updates
- Attachments and image/file upload
- Sticker picker + emote picker
- Emoji reactions with full emoji picker
- Reply, forward, edit, and delete message actions
- Slide-to-reply on message bubbles (mobile-friendly)
- In-app delete confirmation popup
- Search chats/contacts and unread counters
- Profile editing with avatar upload
- API server URL switcher from the UI

## Tech Stack

- Backend: Express, Mongoose, Socket.IO, JWT, Multer
- Frontend: React, Vite, Socket.IO Client
- Mobile: Capacitor (Android)
- Optional services: Cloudinary, Resend, Arcjet

## Prerequisites

- Node.js 18+
- npm
- MongoDB (local or Atlas)

## Project Structure

```
chatApp/
	backend/
	frontend/
```

## Environment Variables

Create `backend/.env`:

```env
PORT=3000
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
CLIENT_URL=http://localhost:5173

# Optional (email)
RESEND_API_KEY=
EMAIL_FROM=
EMAIL_FROM_NAME=

# Optional (media upload)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional (security/rate limiting)
ARCJET_KEY=
ARCJET_ENV=DRY_RUN
```

Optional frontend env in `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

## Install

From project root:

```bash
npm run build
```

Or install manually:

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Run Locally

### 1) Start backend

```bash
cd backend
npm run dev
```

### 2) Start frontend

```bash
cd frontend
npm run dev
```

Open: http://localhost:5173

## Android (Capacitor)

From `frontend/`:

```bash
npm run android:sync
npm run android:open
```

For livereload run:

```bash
npm run android-run
```

## Available Scripts

### Root

- `npm run build` → installs backend/frontend deps and builds frontend
- `npm start` → starts backend

### Backend

- `npm run dev` → nodemon server
- `npm run start` → production start

### Frontend

- `npm run dev` / `npm start` → Vite dev server
- `npm run build` → production build
- `npm run preview` → preview production build
- `npm run lint` → run ESLint

## Notes

- API URL is auto-resolved but can be overridden in-app (saved in localStorage).
- If optional services are not configured, core chat still runs locally with MongoDB.
