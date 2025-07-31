import { Router } from 'express';
import { Role } from '@prisma/client';
import { roleMiddleware } from '../middlewares/role.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import { exportAllTransaksi } from '../controllers/export.controller';

const router = Router();

router.get('/', authenticateToken, roleMiddleware(Role.ADMIN, Role.SUPERVISOR), exportAllTransaksi);

export default router;