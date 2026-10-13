# HireSprint Security Architecture

## 1. Authentication & Token Management
- **Password Storage**: Passwords are encrypted using `bcryptjs` with 10 salt rounds before persistence.
- **JWT Handling**: JSON Web Tokens are signed using HMAC SHA-256 with server-side secret validation. Tokens carry user role, subject ID, and standard expiration.
- **HTTP-Only Cookies & Bearer Headers**: Both `Authorization: Bearer <token>` and `cookie: token` are supported with `SameSite=lax` and `Secure` flags in production.

## 2. Server-Side Role-Based Access Control (RBAC)
- Five distinct roles: `STUDENT`, `ADMIN`, `TEACHER`, `TNP`, `STUDENT_COORDINATOR`.
- Client-supplied roles in requests are never trusted. All authorization decisions query verified database accounts or decoded JWT payloads.
- Resource ownership checks prevent students from viewing evaluations or private transcripts of other candidates.

## 3. WebRTC & Socket.IO Signaling Security
- Sockets require valid JWT authentication in the initial handshake.
- Room authorization validates that the connecting user is permitted to enter the specific `sessionId`.
- Malformed signaling messages (`webrtc:offer`, `webrtc:answer`, `webrtc:ice-candidate`) are rejected if the target client is not in the same authorized room.

## 4. Privacy & Consent
- Media streams are strictly peer-to-peer (P2P). No raw audio or video files are recorded or stored on the server.
- Speech-to-text operates client-side with explicit browser microphone permissions.
- Transcripts and evaluation data are retained under configurable institutional retention rules.

## 5. Defense Against Prompt Injection
- Candidate transcripts are wrapped and treated as untrusted data in AI prompts.
- Structured JSON outputs from the AI provider are schema-validated before committing to database records.
