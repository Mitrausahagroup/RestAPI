// routes/barcode.route.ts
import { Router } from 'express'
import {
  generateBarcode,
  getAllBarcode,
  getUnusedBarcode,
  getBarcodeById,
  deleteAllBarcode,
  deleteBarcodeById,
  getBarcodeSingleById
} from '../controllers/barcode.controller'
import { Role } from '@prisma/client';
import { roleMiddleware } from '../middlewares/role.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router()



router.post('/generate', authenticateToken, roleMiddleware(Role.SUPERVISOR , Role.ADMIN),  generateBarcode)
router.get('/single/:id', authenticateToken, roleMiddleware(Role.SUPERVISOR , Role.ADMIN),  getBarcodeSingleById)
router.get('/', authenticateToken, roleMiddleware(Role.SUPERVISOR , Role.ADMIN), getAllBarcode)
router.get('/unused', authenticateToken, roleMiddleware(Role.SUPERVISOR , Role.ADMIN), getUnusedBarcode)
router.get('/:id', authenticateToken, roleMiddleware(Role.SUPERVISOR , Role.ADMIN), getBarcodeById)
router.delete('/', authenticateToken, roleMiddleware(Role.SUPERVISOR , Role.ADMIN), deleteAllBarcode)
router.delete('/:id', authenticateToken, roleMiddleware(Role.SUPERVISOR , Role.ADMIN), deleteBarcodeById) 

export default router
