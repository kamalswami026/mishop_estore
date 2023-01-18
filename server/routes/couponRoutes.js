import express from "express";
import {
  createCoupom,
  deleteCoupon,
  getALlCoupons,
  updateCoupon,
} from "../controllers/couponController.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createCoupom);
router.get("/", authMiddleware, isAdmin, getALlCoupons);
router.put("/:id", authMiddleware, isAdmin, updateCoupon);
router.delete("/:id", authMiddleware, isAdmin, deleteCoupon);

export default router;
