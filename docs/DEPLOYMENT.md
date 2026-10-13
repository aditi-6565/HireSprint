# HireSprint Deployment Guide

## Production Architecture
HireSprint is designed for deployment on persistent Node.js environments supporting WebSocket connections and MongoDB (e.g., Render, Railway, AWS ECS/EC2, DigitalOcean App Platform):

- **Frontend**: Vite SPA deployed to Vercel, Netlify, or AWS CloudFront/S3.
- **Backend API & WebSockets**: Node.js/Express server with Socket.IO running on a persistent container or VM.
- **Database**: MongoDB Atlas replica set (or self-hosted MongoDB 7.0+).
- **AI Service**: Groq Cloud API (`llama-3.3-70b-versatile`).

> **Note on Serverless Functions**: Traditional serverless platforms (e.g. AWS Lambda without WebSockets) are incompatible with long-lived Socket.IO meeting rooms. Use persistent containers (Render, Railway, Fly.io, or AWS ECS/Fargate).

---

## 1. Environment Configuration
Create a production `.env` file on your server (or configure environment variables in your hosting dashboard):

```env
NODE_ENV=production
PORT=4000
CLIENT_URL=https://hiresprint.youruniversity.edu
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/hiresprint?retryWrites=true&w=majority
JWT_SECRET=<long-cryptographically-secure-random-string>
JWT_EXPIRES_IN=24h
COOKIE_SECRET=<long-cryptographically-secure-random-string>

# AI Engine
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile

# WebRTC STUN/TURN
STUN_SERVERS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302
TURN_SERVER_URL=turn:turn.yourdomain.com:3478
TURN_SERVER_USERNAME=hiresprint_user
TURN_SERVER_CREDENTIAL=turn_password
```

---

## 2. Production Build Commands
From the project root:
```powershell
npm.cmd install --legacy-peer-deps
npm.cmd run build
npm.cmd run seed
```

---

## 3. Starting the Production Server
```powershell
npm.cmd run start
```
Starts `node dist/server.js` on the configured `PORT`.
