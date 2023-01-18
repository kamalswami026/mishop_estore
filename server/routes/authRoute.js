import express from "express";
import {
  createUser,
  loginUser,
  loginAdmin,
  getAllUsers,
  getAUser,
  deleteAUser,
  updateUser,
  blockUser,
  unBlockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  saveAddress,
  addToWishList,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
} from "../controllers/userController.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", createUser);
router.put("/password", authMiddleware, updatePassword);
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.put("/update-order/:id", authMiddleware, isAdmin, updateOrderStatus);
router.post("/login", loginUser);
router.post("/admin-login", loginAdmin);
router.put("/wishlist", authMiddleware, addToWishList);
router.get("/all-users", getAllUsers);
router.post("/cart", authMiddleware, userCart);
router.get("/cart", authMiddleware, getUserCart);
router.post("/cart/applycoupon", authMiddleware, applyCoupon);
router.post("/cart/cash-order", authMiddleware, createOrder);
router.get("/get-orders", authMiddleware, getOrders);
router.delete("/empty-cart", authMiddleware, emptyCart);
router.get("/logout", logout);
router.get("/:id", authMiddleware, isAdmin, getAUser);
router.delete("/:id", deleteAUser);
router.put("/edit-user", authMiddleware, updateUser);
router.put("/save-address", authMiddleware, saveAddress);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unBlockUser);
router.put("/refresh", handleRefreshToken);

export default router;
