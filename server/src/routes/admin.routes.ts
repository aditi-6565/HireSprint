import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { createStaffUserSchema } from '../schemas/admin.schema.js';

const router = Router();

router.use(authenticate, authorizeRoles('ADMIN'));

router.post('/users', validateRequest(createStaffUserSchema), AdminController.createStaffUser);
router.get('/users', AdminController.listUsers);
router.patch('/users/:id', AdminController.updateUserRole);
router.get('/audit-logs', AdminController.listAuditLogs);
router.get('/settings', AdminController.getSettings);
router.put('/settings', AdminController.updateSetting);

export default router;
