import { Router } from 'express';
import { upload } from '../utils/multer';
import {
  createPengembalian,
  getAllPengembalian,
  getPengembalianById,
  updatePengembalian,
  deletePengembalian,
  getDailySummary
} from '../controllers/pengembalian.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.post('/', upload.single('fotoUrl'), createPengembalian);
router.get('/daily',  authenticateToken, roleMiddleware(Role.SUPERVISOR, Role.ADMIN) , getDailySummary )
router.get('/', authenticateToken, getAllPengembalian);
router.get('/:id', getPengembalianById);
router.put('/:id', authenticateToken, upload.single('fotoUrl'), updatePengembalian);
router.delete('/:id', authenticateToken, deletePengembalian);

export default router;