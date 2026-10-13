# HireSprint Automated & Manual Testing Guide

## 1. Automated Test Suite
HireSprint uses Vitest and Supertest for unit, role authorization, GD state machine, and LMS integration tests.

### Running the Test Suite
From the root directory:
```powershell
npm.cmd run test
```
Or directly within the server workspace:
```powershell
npm.cmd run test -w server
```

### Verified Test Suites
1. **`server/tests/auth.test.ts`**:
   - `GET /api/v1/health` status check
   - `POST /api/v1/auth/register` student account creation
   - `POST /api/v1/auth/login` credential authentication & JWT issuance
   - `GET /api/v1/auth/me` profile recovery with valid token
   - Role-Based Access Control (RBAC): rejection of student tokens on admin endpoints
2. **`server/tests/gd.test.ts`**:
   - `GET /api/v1/gd/personas` persona listing
   - `POST /api/v1/gd/sessions` AI Practice session creation with opening moderator statement
   - `POST /api/v1/gd/sessions/:id/turn` turn-taking
   - `POST /api/v1/gd/sessions/:id/ai-turn` autonomous persona contribution
   - `POST /api/v1/gd/sessions/:id/complete` session conclusion and multi-dimensional rubric scoring
3. **`server/tests/lms.test.ts`**:
   - `GET /api/v1/lms/topics` topic listing
   - `POST /api/lms/topics` teacher topic authoring
   - `POST /api/v1/lms/assignments` assignment publishing & student notification generation
   - `GET /api/v1/analytics/student` personalized readiness scores

---

## 2. WebRTC Audio/Video Manual Testing Checklist (2 Browsers)

To verify the real peer-to-peer WebRTC mesh audio and video:

1. **Start the Development Servers**:
   ```powershell
   npm.cmd run dev
   ```
2. **Open Browser 1 (e.g. Chrome / Edge)**:
   - Navigate to `http://localhost:5173/login`.
   - Click "Student" quick-fill button (`student@hiresprint.local` / `HireSprint@123`) and log in.
   - Go to "Live GD Rooms" (`/gd/live`).
   - Click "Join Waiting Room" on an active room or enter room code.
   - Allow camera and microphone permissions when prompted.
   - Click "Enter Meeting Room".
3. **Open Browser 2 (e.g. Incognito window or Firefox / Edge)**:
   - Navigate to `http://localhost:5173/login`.
   - Click "Coordinator" quick-fill button (`coordinator@hiresprint.local` / `HireSprint@123`) and log in.
   - Navigate to "Live GD Rooms" (`/gd/live`).
   - Click "Enter Room" on the same session.
   - Allow camera and microphone permissions.
   - Click "Enter Meeting Room".
4. **Verify Connectivity**:
   - Both browser screens should display the local camera preview and the remote participant tile.
   - Audio should stream between peers.
   - Click the Mic button to mute/unmute — verify speaking state reflects on the peer's screen.
   - Click the Camera button — verify video toggle.
   - Click the Raise Hand button — verify hand icon appears on the peer's video tile.
   - Speak into the microphone — verify live speech-to-text transcript segments appear in the "Live Transcript" panel.
   - Observe AI Moderator Guidance banners when discussion thresholds are reached.
   - Click "Leave" — verify connection cleanly closes and attendance duration is logged in MongoDB.
