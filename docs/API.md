# HireSprint API Documentation (v1)

Base URL: `http://localhost:4000/api/v1`

All responses are serialized as JSON unless otherwise noted. Protected endpoints require the `Authorization: Bearer <token>` header or `token` cookie.

---

## 1. System Health
### `GET /health`
Returns system status and AI provider configuration state.
- **Access**: Public
- **Response (200)**:
```json
{
  "status": "ok",
  "service": "HireSprint Backend API",
  "version": "1.0.0",
  "timestamp": "2026-10-13T16:00:00.000Z",
  "aiConfigured": true
}
```

---

## 2. Authentication & Authorization (`/auth`)
### `POST /auth/register`
Creates a new student account.
- **Body**: `{ "name": "string", "email": "string", "password": "string", "role": "STUDENT" }`
- **Response (201)**: `{ "message": "Registration successful", "token": "jwt", "user": { ... } }`

### `POST /auth/login`
Authenticates a user by email and password.
- **Body**: `{ "email": "string", "password": "string" }`
- **Response (200)**: `{ "message": "Login successful", "token": "jwt", "user": { ... } }`

### `POST /auth/logout`
Clears HTTP-only session cookie.
- **Access**: Public

### `GET /auth/me`
Retrieves current authenticated user profile.
- **Access**: Authenticated

### `POST /auth/change-password`
Changes current user's password.
- **Access**: Authenticated
- **Body**: `{ "currentPassword": "string", "newPassword": "string" }`

---

## 3. Group Discussion Engine (`/gd`)
### `GET /gd/personas`
Retrieves all configured AI participant personas.
- **Access**: Public

### `GET /gd/sessions`
Lists group discussion sessions (filter by `type=AI_PRACTICE|LIVE_GD`, `status`).
- **Access**: Authenticated

### `POST /gd/sessions`
Creates a new GD session (AI Practice or Live GD).
- **Access**: Authenticated
- **Body**:
```json
{
  "title": "AI in University Education",
  "topicId": "optional_object_id",
  "topicTitle": "AI in Education",
  "sessionType": "AI_PRACTICE",
  "durationMinutes": 10,
  "selectedPersonas": ["confident_communicator", "analytical_thinker"]
}
```

### `GET /gd/sessions/:id`
Retrieves full session details, participants, transcripts, and evaluation.
- **Access**: Authenticated

### `POST /gd/sessions/:id/turn`
Submits a student's conversational turn to the session transcript.
- **Access**: Authenticated
- **Body**: `{ "text": "My argument...", "source": "typed_input" }`

### `POST /gd/sessions/:id/ai-turn`
Generates the next conversational turn from an autonomous AI persona.
- **Access**: Authenticated
- **Body**: `{ "personaId": "optional_persona_id" }`

### `POST /gd/sessions/:id/complete`
Concludes the discussion, records attendance duration, and triggers the AI evaluation engine.
- **Access**: Authenticated

### `GET /gd/sessions/:id/evaluation`
Retrieves the 8-dimension evaluation rubric for the session.
- **Access**: Authenticated

---

## 4. Learning Management System (`/lms`)
### `GET /lms/topics`
Lists published group discussion topics with search, category, and difficulty filters.
- **Access**: Public

### `POST /lms/topics`
Creates a new GD topic.
- **Access**: `ADMIN`, `TEACHER`, `TNP`, `STUDENT_COORDINATOR`

### `GET /lms/resources`
Lists learning materials, articles, and GD rubrics.
- **Access**: Public

### `POST /lms/resources`
Publishes learning materials.
- **Access**: `ADMIN`, `TEACHER`, `TNP`

### `GET /lms/assignments`
Lists active GD assignments.
- **Access**: Authenticated

### `POST /lms/assignments`
Publishes a new GD assignment and sends notifications to students.
- **Access**: `ADMIN`, `TEACHER`

### `POST /lms/assignments/:id/submit`
Submits student reflection notes for an assignment.
- **Access**: `STUDENT`

### `GET /lms/attendance`
Retrieves attendance records.
- **Access**: Authenticated

### `GET /lms/notifications`
Retrieves user's notifications.
- **Access**: Authenticated

### `PATCH /lms/notifications/:id/read`
Marks a notification as read.
- **Access**: Authenticated

---

## 5. Analytics & Placement Intelligence (`/analytics`)
### `GET /analytics/student`
Personalized GD metrics, radar readiness breakdown, and session history.
- **Access**: `STUDENT`

### `GET /analytics/tnp`
Cohort-level placement readiness, department breakdown, and candidates needing practice.
- **Access**: `TNP`, `ADMIN`, `TEACHER`

### `GET /analytics/tnp/export-csv`
Downloads a CSV spreadsheet of candidate placement scores and rubric dimensions.
- **Access**: `TNP`, `ADMIN`, `TEACHER`

### `GET /analytics/admin`
Platform usage metrics, user counts by role, and audit trails.
- **Access**: `ADMIN`

---

## 6. Administration (`/admin`)
### `GET /admin/users`
Lists user directory with search and role filters.
- **Access**: `ADMIN`

### `PATCH /admin/users/:id`
Updates user role (`STUDENT`, `TEACHER`, `TNP`, `STUDENT_COORDINATOR`, `ADMIN`) or activation status.
- **Access**: `ADMIN`

### `GET /admin/audit-logs`
Retrieves administrative action security log.
- **Access**: `ADMIN`
