import { Router } from 'express';
import { upload } from '../utils/multer';
import {
  createPengembalian,
  getAllPengembalian,
  getPengembalianById,
  updatePengembalian,
  deletePengembalian,
} from '../controllers/pengembalian.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken)
router.post('/', upload.single('fotoUrl'), createPengembalian);
router.get('/', getAllPengembalian);
router.get('/:id', getPengembalianById);
router.put('/:id', upload.single('fotoUrl'), updatePengembalian);
router.delete('/:id', deletePengembalian);

export default router;