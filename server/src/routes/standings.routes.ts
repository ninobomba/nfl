import { Router } from 'express';
import { getStandings } from '../controllers/standings.controller.js';

const router = Router();

router.get('/', getStandings);

export default router;
