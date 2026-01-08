import { Router } from 'express';
import { getLeaderboard, getMyPicks, makePick, getWeeklyLeaderboard } from '../controllers/picks.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getMyPicks);
router.post('/', makePick);
router.get('/leaderboard', getLeaderboard);
router.get('/weekly', getWeeklyLeaderboard);

export default router;
