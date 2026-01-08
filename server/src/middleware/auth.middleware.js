import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        // Fetch user from DB to get latest role and active status
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || !user.isActive) {
            res.status(403).json({ message: 'User not found or inactive' });
            return;
        }
        req.user = {
            userId: user.id,
            role: user.role
        };
        next();
    }
    catch (err) {
        res.status(403).json({ message: 'Invalid token' });
    }
};
export const isAdmin = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ message: 'Admin access required' });
        return;
    }
    next();
};
//# sourceMappingURL=auth.middleware.js.map