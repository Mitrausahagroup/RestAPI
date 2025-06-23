import { Router } from 'express';
import { Role } from '@prisma/client';
import { roleMiddleware } from '../middlewares/role.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import { getBarangByVarian, createBarang, getBarangById, updateBarang, removeBarang } from '../controllers/barang.controller';

const router = Router();

router.post('/',authenticateToken, roleMiddleware(Role.ADMIN, Role.SUPERVISOR), createBarang);
router.get('/',authenticateToken,  getBarangByVarian);
router.get('/:id',authenticateToken, getBarangById);
router.put('/:id',authenticateToken, roleMiddleware(Role.ADMIN, Role.SUPERVISOR), updateBarang);
router.delete('/:id',authenticateToken, roleMiddleware(Role.ADMIN, Role.SUPERVISOR), removeBarang);

export default router;