import { Router } from 'express';
import { getMatchups, getTeams, getTheme } from '../controllers/data.controller.js';
const router = Router();
router.get('/teams', getTeams);
router.get('/matchups', getMatchups);
router.get('/theme', getTheme);
export default router;
//# sourceMappingURL=data.routes.js.map