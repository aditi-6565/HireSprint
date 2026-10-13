import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/student', authenticate, AnalyticsController.getStudentAnalytics);
router.get('/tnp', authenticate, authorizeRoles('ADMIN', 'TNP', 'TEACHER'), AnalyticsController.getTnPAnalytics);
router.get('/admin', authenticate, authorizeRoles('ADMIN'), AnalyticsController.getAdminAnalytics);
router.get('/tnp/export-csv', authenticate, authorizeRoles('ADMIN', 'TNP', 'TEACHER'), AnalyticsController.exportTnPReportCSV);

export default router;
