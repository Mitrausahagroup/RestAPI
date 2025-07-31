import { Router } from "express";
import { upload } from "../utils/multer";
import {
  createPenurunan,
  deletePenurunan,
  getAllPenurunan,
  getPenurunanById,
  updatePenurunan,
  getDailySummary
} from "../controllers/penurunan.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";
import { Role } from "@prisma/client";


const router = Router();


router.post("/", upload.single("fotoUrl"), createPenurunan);
router.get('/daily',  authenticateToken, roleMiddleware(Role.SUPERVISOR, Role.ADMIN) , getDailySummary )
router.get("/all", authenticateToken, getAllPenurunan);
router.get("/:id", getPenurunanById);
router.put("/:id", authenticateToken, upload.single("fotoUrl"), updatePenurunan);
router.delete("/:id", authenticateToken, roleMiddleware(Role.ADMIN, Role.SUPERVISOR), deletePenurunan);

export default router;
