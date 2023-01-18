import express from "express";
import {
  createBlog,
  deleteBlog,
  dislikeBlog,
  getAllBlogs,
  getBlog,
  likeBlog,
  updateBlog,
  uploadImages
} from "../controllers/blogController.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
import { uploadPhoto } from "../middlewares/uploadImage.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createBlog);
router.put(
  "/upload/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 2),
  // productImageResize,
  uploadImages
);
router.put("/likes", authMiddleware, likeBlog);
router.put("/dislike", authMiddleware, dislikeBlog);
router.put("/:id", authMiddleware, isAdmin, updateBlog);
router.get("/:id", getBlog);
router.get("/", getAllBlogs);
router.delete("/:id", authMiddleware, isAdmin, deleteBlog);

export default router;
