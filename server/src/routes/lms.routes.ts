import { Router } from 'express';
import { LMSController } from '../controllers/lms.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Topics
router.get('/topics', LMSController.listTopics);
router.post('/topics', authenticate, authorizeRoles('ADMIN', 'TEACHER', 'TNP', 'STUDENT_COORDINATOR'), LMSController.createTopic);
router.put('/topics/:id', authenticate, authorizeRoles('ADMIN', 'TEACHER', 'TNP'), LMSController.updateTopic);
router.delete('/topics/:id', authenticate, authorizeRoles('ADMIN', 'TEACHER'), LMSController.deleteTopic);

// Resources
router.get('/resources', LMSController.listResources);
router.post('/resources', authenticate, authorizeRoles('ADMIN', 'TEACHER', 'TNP'), LMSController.createResource);

// Assignments
router.get('/assignments', authenticate, LMSController.listAssignments);
router.post('/assignments', authenticate, authorizeRoles('ADMIN', 'TEACHER'), LMSController.createAssignment);
router.post('/assignments/:id/submit', authenticate, LMSController.submitAssignment);

// Attendance
router.get('/attendance', authenticate, LMSController.listAttendance);

// Notifications
router.get('/notifications', authenticate, LMSController.listNotifications);
router.patch('/notifications/:id/read', authenticate, LMSController.markNotificationRead);
router.post('/notifications/read-all', authenticate, LMSController.markAllNotificationsRead);

export default router;
