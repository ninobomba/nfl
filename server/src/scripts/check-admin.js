import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function check() {
    const user = await prisma.user.findUnique({ where: { username: 'admin' } });
    if (!user) {
        console.log('Admin user NOT FOUND');
        return;
    }
    console.log('Admin user found:', user.username);
    console.log('Role:', user.role);
    console.log('IsActive:', user.isActive);
    const isMatch = await bcrypt.compare('admin', user.password);
    console.log('Password "admin" matches hash:', isMatch);
}
check().finally(() => prisma.$disconnect());
//# sourceMappingURL=check-admin.js.map