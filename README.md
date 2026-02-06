# Local Chat App

A simple local chat app with a Node/Express + MongoDB backend and a Vite/React frontend.

## Requirements

- Node.js 18+
- MongoDB (local or Atlas)

## Backend setup

Create `backend/.env`:

```
PORT=3000
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<random secret>
CLIENT_URL=http://localhost:5173
```

Start backend:

```
cd backend
npm install
npm run start
```

## Frontend setup

```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Notes

- Emails are disabled for local setup.
- Messages are stored in MongoDB.
- Real-time updates via Socket.IO (typing, online status, read receipts).
- Supports message editing, deletion, and image attachments.
