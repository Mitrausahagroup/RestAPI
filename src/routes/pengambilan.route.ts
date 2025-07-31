import { Router } from 'express';
import { upload } from '../utils/multer'
import { Role } from '@prisma/client';
import { roleMiddleware } from '../middlewares/role.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import { getAllPengambilan, updateStatusPengambilan, createPengambilan, updatePengambilan, deletePengambilan, getDailySummary , getPengambilanByStatus } from '../controllers/pengambilan.controller';

const router = Router();

router.post('/',  upload.single('fotoUrl') , createPengambilan);
router.get('/' , authenticateToken ,roleMiddleware(Role.SUPERVISOR, Role.ADMIN), getAllPengambilan);
router.get('/status/:status', authenticateToken ,roleMiddleware(Role.SUPERVISOR, Role.ADMIN), getPengambilanByStatus)
router.get('/daily',  authenticateToken, roleMiddleware(Role.SUPERVISOR, Role.ADMIN) , getDailySummary )
router.patch('/:id/:status' , authenticateToken,roleMiddleware(Role.SUPERVISOR, Role.ADMIN), updateStatusPengambilan);
router.put('/:id' , authenticateToken ,upload.single('fotoUrl'), roleMiddleware(Role.SUPERVISOR, Role.ADMIN), updatePengambilan);
router.delete('/:id' , authenticateToken, roleMiddleware(Role.SUPERVISOR, Role.ADMIN), deletePengambilan);

export default router;