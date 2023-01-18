import express from "express";
import {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  rating,
  uploadImages,
} from "../controllers/productController.js";
import { uploadPhoto, productImageResize } from "../middlewares/uploadImage.js";
import { isAdmin, authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProduct);
router.put(
  "/upload/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  // productImageResize,
  uploadImages
);
router.put("/rating", authMiddleware, rating);
router.get("/:id", getProduct);
router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.get("/", getAllProducts);

export default router;
