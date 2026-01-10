import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';

async function createTestUser() {
  try {
    const username = 'test';
    const email = 'test@example.com';
    const password = 'test';

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      console.log('User "test" already exists.');
      // Update password just in case
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
      });
      console.log('Password for user "test" has been updated to "test".');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: 'USER',
        },
      });
      console.log('User "test" with password "test" has been created.');
    }
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
