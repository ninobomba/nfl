import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { sendWelcomeEmail, sendResetKeyEmail } from '../services/email.service.js';
export const register = async (req, res) => {
    try {
        const { username, email, password, lang } = req.body;
        if (!username || !email || !password) {
            res.status(400).json({ message: 'REQUIRED_FIELDS_MISSING' });
            return;
        }
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ username }, { email }] }
        });
        if (existingUser) {
            res.status(400).json({ message: 'USER_ALREADY_EXISTS' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { username, email, password: hashedPassword },
        });
        await prisma.auditLog.create({
            data: { userId: user.id, action: 'USER_REGISTERED', details: 'Language: ' + lang }
        });
        await sendWelcomeEmail({
            email: user.email,
            username: user.username,
            lang: lang === 'es' ? 'es' : 'en'
        });
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email, score: user.score, role: user.role } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'SERVER_ERROR' });
    }
};
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`Login attempt for: "${username}"`);
        const trimmedUsername = username?.trim();
        const user = await prisma.user.findUnique({ where: { username: trimmedUsername } });
        if (!user || !user.isActive) {
            res.status(400).json({ message: 'INVALID_CREDENTIALS' });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'INVALID_CREDENTIALS' });
            return;
        }
        await prisma.auditLog.create({ data: { userId: user.id, action: 'USER_LOGIN' } });
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, score: user.score, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ message: 'SERVER_ERROR' });
    }
};
export const forgotPassword = async (req, res) => {
    try {
        const { email, lang } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            await prisma.auditLog.create({
                data: { action: 'FORGOT_PASSWORD_FAIL', details: `Email not found: ${email}` }
            });
            res.json({ message: 'RESET_KEY_SENT' });
            return;
        }
        const key = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await prisma.passwordReset.create({
            data: { userId: user.id, key, expiresAt }
        });
        await prisma.auditLog.create({
            data: { userId: user.id, action: 'FORGOT_PASSWORD_REQUEST' }
        });
        await sendResetKeyEmail(user.email, key, lang === 'es' ? 'es' : 'en');
        res.json({ message: 'RESET_KEY_SENT' });
    }
    catch (error) {
        res.status(500).json({ message: 'SERVER_ERROR' });
    }
};
export const resetPassword = async (req, res) => {
    try {
        const { email, key, newPassword } = req.body;
        const resetRecord = await prisma.passwordReset.findFirst({
            where: {
                user: { email },
                key,
                used: false,
                expiresAt: { gt: new Date() }
            }
        });
        if (!resetRecord) {
            await prisma.auditLog.create({
                data: { action: 'PASSWORD_RESET_FAIL', details: `Invalid/Expired key for email: ${email}` }
            });
            res.status(400).json({ message: 'INVALID_OR_EXPIRED_KEY' });
            return;
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: resetRecord.userId },
            data: { password: hashedPassword }
        });
        await prisma.passwordReset.update({
            where: { id: resetRecord.id },
            data: { used: true }
        });
        await prisma.auditLog.create({
            data: { userId: resetRecord.userId, action: 'PASSWORD_RESET_SUCCESS' }
        });
        res.json({ message: 'PASSWORD_RESET_SUCCESS' });
    }
    catch (error) {
        res.status(500).json({ message: 'SERVER_ERROR' });
    }
};
//# sourceMappingURL=auth.controller.js.map