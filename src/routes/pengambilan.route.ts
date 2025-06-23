import { Router } from 'express';
import { upload } from '../utils/multer'
import { Role } from '@prisma/client';
import { roleMiddleware } from '../middlewares/role.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import { getAllambils, updateStatusPengambilan, createPengambilan, updatePengambilan, removePengambilan } from '../controllers/pengambilan.controller';

const router = Router();

router.post('/',  authenticateToken ,upload.single('fotoUrl') , createPengambilan);
router.get('/', authenticateToken ,getAllambils);
router.post('/:id/status', authenticateToken ,roleMiddleware(Role.SUPERVISOR, Role.ADMIN), updateStatusPengambilan);
router.put('/:id', authenticateToken ,upload.single('fotoUrl') ,updatePengambilan);
router.delete('/:id', authenticateToken ,removePengambilan);

export default router;