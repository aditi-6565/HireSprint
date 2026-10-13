# HIRESPRINT — AI-Powered Group Discussion & Learning Management Portal

HireSprint is a full-stack university placement preparation portal built with the **MERN** stack (MongoDB, Express, React, Node.js, Mongoose, and TypeScript). It equips students with AI-agent group discussion practice, real-time WebRTC peer-to-peer live GD rooms, automated AI moderation, live speech transcription, and a comprehensive Learning Management System (LMS).

> **Scope Note**: Aptitude testing, question banks, and aptitude scoring have been strictly removed. HireSprint is exclusively focused on Group Discussions, communication skills, learning resources, and placement readiness.

---

## Architecture & Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router v6, TanStack Query, Socket.IO Client, HTML5 WebRTC & Web Speech APIs.
- **Backend**: Node.js, Express.js (v1 API), TypeScript, Socket.IO, JWT Auth, Bcrypt, Zod validation.
- **Database**: MongoDB with Mongoose ODM (15 normalized models with strict schemas, indexes, and relations).
- **Embedded Database Fallback**: Includes `mongodb-memory-server` so local development and testing work seamlessly out-of-the-box without requiring a local MongoDB service installation.
- **AI Engine**: Groq API (`llama-3.3-70b-versatile`) with an intelligent heuristic conversational engine fallback when no API key is configured.
- **Real-Time Communication**: WebRTC P2P Mesh for audio/video + Socket.IO for signaling, room state, chat, and live transcription streams.

---

## Five Complete Role Dashboards

1. **Student Dashboard (`/student/dashboard`)**: Personalized welcome, readiness score, upcoming GD sessions, start AI GD practice, join live GDs, recommended topics, learning resources, assigned activities, communication skill progress, and attendance history.
2. **Admin Dashboard (`/admin/dashboard`)**: Total users by role, user directory management (change roles securely, activate/deactivate accounts), audit logs, platform settings, and integration health checks.
3. **Teacher Dashboard (`/teacher/dashboard`)**: Create & manage GD topics, schedule live GD meetings, publish learning resources and assignments, track class attendance, and review AI evaluations.
4. **TnP Cell Dashboard (`/tnp/dashboard`)**: Placement readiness reports, candidate participation metrics, aggregated department skill trends, candidates requiring practice, and one-click CSV report export.
5. **Student Coordinator Dashboard (`/coordinator/dashboard`)**: Assigned upcoming GD sessions, waiting room management, session start/end controls, and real-time attendance rosters.

---

## Quick Start (Windows PowerShell)

Requirements: Node.js 20+ and npm.

### 1. Install Dependencies
```powershell
npm.cmd install --legacy-peer-deps
```

### 2. Seed Initial Test Accounts & Topics
```powershell
npm.cmd run seed
```

Seeded credentials (Password: `HireSprint@123`):
- **Admin**: `admin@hiresprint.local`
- **Teacher**: `teacher@hiresprint.local`
- **TnP Cell**: `tnp@hiresprint.local`
- **Coordinator**: `coordinator@hiresprint.local`
- **Student**: `student@hiresprint.local`

*(Quick-login buttons are also provided on the `/login` screen for one-click access to each role).*

### 3. Run Development Server
```powershell
npm.cmd run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000/api/v1/health

---

## Testing & Quality Assurance

### Run Automated Unit and API Tests
```powershell
npm.cmd run test
```
Executes the Vitest test suite covering:
- Authentication & JWT token issuance
- Server-side RBAC and route protection
- AI GD Practice engine, turn-taking, and rubric evaluations
- LMS topics, resources, assignments, notifications, and analytics

### Typecheck All Workspaces
```powershell
npm.cmd run typecheck
```

### Build Production Assets
```powershell
npm.cmd run build
```

---

## WebRTC Audio/Video Manual Testing (Two Browsers)
See [`docs/TESTING.md`](docs/TESTING.md) for full instructions:
1. Open Browser 1 (Chrome/Edge): Log in as Student (`student@hiresprint.local`), navigate to `/gd/live`, and enter the meeting.
2. Open Browser 2 (Incognito / Firefox): Log in as Coordinator (`coordinator@hiresprint.local`), navigate to `/gd/live`, and enter the meeting.
3. Verify local & remote video tiles, two-way audio, microphone mute, camera toggle, hand raise, text chat, live speech-to-text transcript streaming, and AI Moderator interventions.

---

## Documentation

- [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) — System architecture and topology
- [`DATABASE.md`](docs/DATABASE.md) — MongoDB schema and Mongoose models
- [`AI_AGENT.md`](docs/AI_AGENT.md) — Groq API integration and persona prompt designs
- [`WEBRTC_AND_SOCKET_IO.md`](docs/WEBRTC_AND_SOCKET_IO.md) — Signaling protocols and mesh architecture
- [`API.md`](docs/API.md) — REST API endpoint documentation
- [`TESTING.md`](docs/TESTING.md) — Automated tests and manual WebRTC checklist
- [`DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Production hosting and WebSocket configuration
- [`SECURITY.md`](docs/SECURITY.md) — Authentication, RBAC, and data privacy
