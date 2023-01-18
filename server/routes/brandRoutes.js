import express from "express";

import {
  createBrand,
  deleteBrand,
  getAllBrand,
  getBrand,
  updateBrand,
} from "../controllers/brandController.js";
import { isAdmin, authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createBrand);
router.put("/:id", authMiddleware, isAdmin, updateBrand);
router.delete("/:id", authMiddleware, isAdmin, deleteBrand);
router.get("/:id", getBrand);
router.get("/", getAllBrand);

export default router;
