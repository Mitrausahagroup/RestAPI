import { Router } from "express"
import {
  getAllSales,
  getSalesById,
  createSales,
  updateSales,
  deleteSales
} from "../controllers/sales.controller"
import { Role } from '@prisma/client';
import { roleMiddleware } from '../middlewares/role.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router()

router.get("/:id",  getSalesById)
router.put("/:id", authenticateToken, roleMiddleware(Role.ADMIN, Role.SUPERVISOR), updateSales)
router.get("/",  getAllSales)
router.post("/", authenticateToken, roleMiddleware(Role.ADMIN, Role.SUPERVISOR), createSales)
router.delete("/:id", authenticateToken, roleMiddleware(Role.ADMIN, Role.SUPERVISOR), deleteSales)

export default router
