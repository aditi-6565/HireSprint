# HireSprint Database Architecture (MongoDB & Mongoose)

## Migration Summary
- **Previous Stack**: PostgreSQL via Prisma (only User and Assessment models).
- **Current Stack**: MongoDB using Mongoose ODM with normalized schemas, strict TypeScript types, indexing, and comprehensive validation.
- **Scope Restriction**: All aptitude-related models and tables (`Assessment` with `type: APTITUDE`) have been completely removed.

## Models Overview

1. **User**: Authentication, roles (`STUDENT`, `ADMIN`, `TEACHER`, `TNP`, `STUDENT_COORDINATOR`), department/class reference, profile, status.
2. **DepartmentClass**: Academic departments and classes/batches (e.g., Computer Science 2026).
3. **GDTopic**: Curated and AI-suggested group discussion topics, categories, difficulty, preparation guides, learning objectives, and discussion rules.
4. **LearningResource**: LMS study materials, articles, rubrics, guides, and presentation documents.
5. **Assignment**: Teacher-issued group discussion assignments with deadlines, topic references, and guidelines.
6. **AssignmentSubmission**: Student submissions, self-reflection notes, and teacher feedback with grades.
7. **GDSession**: Core unified session model representing both `AI_PRACTICE` and `LIVE_GD`. Includes scheduled time, duration, room state machine (`CREATED`, `READY`, `ACTIVE`, `PAUSED`, `EVALUATING`, `COMPLETED`, `CANCELLED`), topic reference, and creator.
8. **GDParticipant**: Session roster tracking participant role (speaker, moderator, observer), connection state, speaking stats, audio/video status.
9. **TranscriptSegment**: Server-persisted ordered transcript chunks with timestamp, speaker ID or AI persona ID, spoken text, confidence, and source (`live_speech` vs `ai_persona`).
10. **ModeratorEvent**: AI or human moderator interventions (intro, rule explanation, intervention, time warning, wrap-up summary).
11. **Evaluation**: Comprehensive structured performance evaluation scoring 8 distinct rubric dimensions with quotes and actionable feedback.
12. **AttendanceRecord**: Live session join/leave logs, duration calculation, and attendance validity.
13. **Notification**: Real-time and persisted user notifications (assignments, session invites, feedback, system announcements).
14. **AuditLog**: Administrative action logging for role changes, account activation, and platform modifications.
15. **PlatformSetting**: Dynamic system configuration (moderator prompts, token limits, STUN/TURN configs).

## Indexing Strategy
- `User`: Unique index on `email`.
- `GDSession`: Compound index on `[status, scheduledAt]`, index on `creator`.
- `GDParticipant`: Compound unique index on `[sessionId, userId]`.
- `TranscriptSegment`: Compound index on `[sessionId, sequence]`.
- `Evaluation`: Index on `[userId, createdAt]` and `[sessionId, userId]`.
- `AttendanceRecord`: Compound index on `[sessionId, userId]`.
- `Notification`: Compound index on `[userId, read, createdAt]`.
