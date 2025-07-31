import { Router } from 'express';
import { Role } from '@prisma/client';
import { roleMiddleware } from '../middlewares/role.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import { getAllUsers, createUser, getUserById, updateUser, removeUser } from '../controllers/user.controller';

const router = Router();

router.post('/', createUser);
router.get('/', authenticateToken, roleMiddleware(Role.ADMIN, Role.SUPERVISOR), getAllUsers);
router.get('/:id', authenticateToken, roleMiddleware(Role.ADMIN , Role.SUPERVISOR), getUserById);
router.put('/:id', authenticateToken, roleMiddleware(Role.ADMIN), updateUser);
router.delete('/:id', authenticateToken, roleMiddleware(Role.ADMIN) ,removeUser);

export default router;