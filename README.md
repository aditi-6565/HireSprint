# HireSprint — AI Placement Preparation & Assessment Platform

HireSprint is a full-stack placement preparation platform built around aptitude practice, AI-agent group discussions, evaluation, analytics and a real-time student GD room.

## Stack
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Real-time: Socket.IO + WebRTC signaling
- Database: PostgreSQL + Prisma (production mode)
- Browser speech: Web Speech API
- AI evaluation: API-ready service layer; demo mode works without an external AI key

## Quick start (works without PostgreSQL)
Requirements: Node.js 20+ and npm.

```powershell
npm install
npm run dev
```

Open http://localhost:5173. The API runs on http://localhost:4000.

The default is `DEMO_MODE=true`, so the project runs without a database. This mode provides the dashboard, aptitude API, AI-GD evaluation API and Socket.IO room signaling with demo data.

## PostgreSQL mode
1. Copy `.env.example` to `.env`.
2. Set `DEMO_MODE=false`.
3. Set `DATABASE_URL` to your PostgreSQL database.
4. Run:

```powershell
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

Demo seed credentials:
- Email: `demo@hiresprint.local`
- Password: `HireSprint@123`

## GitHub
From the project root:

```powershell
git init
git add .
git commit -m "Initial HireSprint full-stack project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hiresprint.git
git push -u origin main
```

Do not commit `.env`, API keys, database passwords, or `node_modules`.

## Project structure
```text
HireSprint/
├── client/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── server/
│   ├── src/index.ts
│   ├── prisma/schema.prisma
│   ├── prisma/seed.ts
│   └── package.json
├── .env.example
├── .gitignore
└── package.json
```
