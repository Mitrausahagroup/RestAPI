import Router from 'express'
import { getAllToko, getTokoById, createToko, updateToko, deleteToko, getTokoBybarcodeId
} from '../controllers/toko.controller'
import { authenticateToken } from '../middlewares/auth.middleware';
import { upload } from '../utils/multer'
import { roleMiddleware } from '../middlewares/role.middleware'
import { Role } from '@prisma/client'

const router = Router()

// Middleware otentikasi untuk semua route toko
// GET /toko - Ambil semua data toko (Admin & Supervisor)
router.get('/', authenticateToken ,roleMiddleware(Role.ADMIN, Role.SUPERVISOR), getAllToko)

// GET /toko/:id - Ambil detail toko by ID (Admin & Supervisor)
router.get('/:id', authenticateToken, roleMiddleware(Role.ADMIN, Role.SUPERVISOR), getTokoById)

router.get('/bycode/:barcodeId',  getTokoBybarcodeId )

// POST /toko - Tambah toko baru (Admin saja)
router.post('/', upload.single('fotoUrl'), createToko)

// PUT /toko/:id - Perbarui data toko (Admin saja)
router.put('/:id', authenticateToken, upload.single('fotoUrl') ,roleMiddleware(Role.ADMIN, Role.SUPERVISOR), updateToko)

// DELETE /toko/:id - Hapus toko (Admin saja)
router.delete('/:id', authenticateToken, roleMiddleware(Role.ADMIN, Role.SUPERVISOR), deleteToko)

export default router