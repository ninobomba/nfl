import { Router } from 'express';
import { simulateGame, clearSchedule, createMatchup, updateMatchup, deleteMatchup, getSettings, updateSetting, getUsers, toggleUserStatus, updateTeam, getAuditLogs } from '../controllers/admin.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware.js';
const router = Router();
// Secure all admin routes
router.use(authenticateToken);
router.use(isAdmin);
router.post('/simulate', simulateGame);
router.post('/clear-schedule', clearSchedule);
router.post('/matchups', createMatchup);
router.put('/matchups', updateMatchup);
router.delete('/matchups/:id', deleteMatchup);
router.get('/settings', getSettings);
router.post('/settings', updateSetting);
router.get('/users', getUsers);
router.post('/users/toggle-status', toggleUserStatus);
router.post('/teams/update', updateTeam);
router.get('/logs', getAuditLogs);
export default router;
//# sourceMappingURL=admin.routes.js.map