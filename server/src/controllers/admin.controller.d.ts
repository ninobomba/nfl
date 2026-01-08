import type { Request, Response } from 'express';
export declare const simulateGame: (req: Request, res: Response) => Promise<void>;
export declare const createMatchup: (req: Request, res: Response) => Promise<void>;
export declare const updateMatchup: (req: Request, res: Response) => Promise<void>;
export declare const deleteMatchup: (req: Request, res: Response) => Promise<void>;
export declare const clearSchedule: (req: Request, res: Response) => Promise<void>;
export declare const getSettings: (req: Request, res: Response) => Promise<void>;
export declare const updateSetting: (req: Request, res: Response) => Promise<void>;
export declare const getUsers: (req: Request, res: Response) => Promise<void>;
export declare const toggleUserStatus: (req: Request, res: Response) => Promise<void>;
export declare const updateTeam: (req: Request, res: Response) => Promise<void>;
export declare const getAuditLogs: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=admin.controller.d.ts.map