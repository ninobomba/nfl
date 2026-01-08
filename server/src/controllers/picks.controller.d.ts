import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
export declare const getMyPicks: (req: AuthRequest, res: Response) => Promise<void>;
export declare const makePick: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getLeaderboard: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getWeeklyLeaderboard: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=picks.controller.d.ts.map