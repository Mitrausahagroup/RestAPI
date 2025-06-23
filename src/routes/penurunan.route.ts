import { Router } from "express";
import { upload } from "../utils/multer";
import {
  createPenurunan,
  deletePenurunan,
  getAllPenurunan,
  getPenurunanById,
  updatePenurunan,
} from "../controllers/penurunan.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.post("/", upload.single("fotoUrl"), createPenurunan);
router.get("/", getAllPenurunan);
router.get("/:id", getPenurunanById);
router.put("/:id", upload.single("fotoUrl"), updatePenurunan);
router.delete("/:id", deletePenurunan);

export default router;
