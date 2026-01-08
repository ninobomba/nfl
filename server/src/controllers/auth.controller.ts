import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { sendWelcomeEmail } from '../services/email.service.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, lang } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: 'Username, email and password are required' });
      return;
    }

    const existingUser = await prisma.user.findFirst({ 
        where: { 
            OR: [{ username }, { email }]
        } 
    });
    
    if (existingUser) {
      res.status(400).json({ message: 'Username or Email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // Send Welcome Email
    await sendWelcomeEmail({
        email: user.email,
        username: user.username,
        lang: lang === 'es' ? 'es' : 'en'
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d',
    });

    res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email, score: user.score, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    console.log(`Login attempt for: "${username}"`);
    const trimmedUsername = username?.trim();

    const user = await prisma.user.findUnique({ where: { username: trimmedUsername } });
    if (!user) {
      console.log(`User not found: "${trimmedUsername}"`);
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    if (!user.isActive) {
        console.log(`User inactive: "${trimmedUsername}"`);
        res.status(403).json({ message: 'Account is disabled. Contact admin.' });
        return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Password mismatch for: "${trimmedUsername}"`);
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    console.log(`Login successful for: "${trimmedUsername}"`);
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d',
    });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, score: user.score, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};