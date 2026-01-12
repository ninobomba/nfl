import { Router } from 'express';
import passport from 'passport';
import { login, register, forgotPassword, resetPassword, facebookCallback, getMe } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', 
  passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
  facebookCallback
);

router.get('/me', authenticateToken, getMe);

export default router;
