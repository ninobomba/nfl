import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import prisma from '../prisma.js';
import bcrypt from 'bcryptjs';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || 'your_app_id',
      clientSecret: process.env.FACEBOOK_APP_SECRET || 'your_app_secret',
      callbackURL: `${SERVER_URL}/api/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'emails', 'photos'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if user exists with this facebookId
        const existingUser = await prisma.user.findUnique({
          where: { facebookId: profile.id },
        });

        if (existingUser) {
          return done(null, existingUser);
        }

        // 2. Check if user exists with the same email
        const email = profile.emails?.[0]?.value;
        if (email) {
          const userWithEmail = await prisma.user.findUnique({
            where: { email },
          });

          if (userWithEmail) {
            // Link the facebookId to the existing user
            const updatedUser = await prisma.user.update({
              where: { id: userWithEmail.id },
              data: { facebookId: profile.id },
            });
            return done(null, updatedUser);
          }
        }

        // 3. Create new user
        // Generate a random password since it's not used for OAuth
        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        
        // Ensure username is unique
        let baseUsername = profile.displayName.replace(/\s+/g, '').toLowerCase();
        let username = baseUsername;
        let counter = 1;
        
        while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }

        const newUser = await prisma.user.create({
          data: {
            username,
            email: email || `facebook_${profile.id}@example.com`, // Fallback if no email provided
            password: hashedPassword,
            facebookId: profile.id,
            isActive: true,
          },
        });

        await prisma.auditLog.create({
            data: { userId: newUser.id, action: 'USER_REGISTERED_FACEBOOK' }
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;
