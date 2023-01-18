import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";
import Coupon from "../models/couponModel.js";
import Order from "../models/orderModel.js";
import asyncHandler from "express-async-handler";
import { generateToken } from "../config/jwtToken.js";
import { validateMongoDbId } from "../utils/validateMongoDbId.js";
import { generateRefreshToken } from "../config/refreshToken.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../controllers/emailController.js";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

//? Create User
export const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email });

  if (!findUser) {
    //* Create New User
    const newUser = User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("User Already Exists");
  }
});

//? Login User
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //* Check if user already exists
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);

    const updatedUser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: await generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

//? Login Admin
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //* Check if user already exists
  const findAdmin = await User.findOne({ email });
  if (findAdmin?.role !== "admin") {
    throw new Error("Not Authorized as Admin");
  }
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);

    const updatedUser = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: await generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

//? Update User
export const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

//? Get All Users
export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json({ getUsers });
  } catch (error) {
    throw new Error(error);
  }
});

//? Get a User
export const getAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getAUser = await User.findById(id);

    res.json(getAUser);
  } catch (error) {
    throw new Error(error);
  }
});

//? Delete a User
export const deleteAUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    res.json({ deleteAUser });
  } catch (error) {
    throw new Error(error);
  }
});

//? Block User
export const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const block = await User.findOneAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );
    res.json({ message: "User Blocked" });
  } catch (error) {
    throw new Error(error);
  }
});

//? UnBlock User
export const unBlockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const block = await User.findOneAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );
    res.json({ message: "User UnBlocked" });
  } catch (error) {
    throw new Error(error);
  }
});

//? Handle Refresh Token
export const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    throw new Error("No Refresh Token Found");
  }
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("No Refresh Token Present in Db");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id)
      throw new Error("There is something wrong with the refresh token");
    const accessToken = generateToken(user?._id);
    res.json(accessToken);
  });
});

//? Update Password
export const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  // validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatePassword = await user.save();
    res.json(updatePassword);
  } else {
    res.json(user);
  }
});

//? Forgot Password Token
export const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User does not exist with this email id");
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetUrl = `Hi, Please click the provided link to reset your password. <a href="http://localhost:4000/api/user/reset-password/${token}">Click Here</a>`;
    const data = {
      to: email,
      text: "Password Reset Link from Mishop",
      subject: "Forgot Password",
      html: resetUrl,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

//? Password Reset
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: Date.now() },
  });
  if (!user) throw new Error("Link expired, please try again later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();
  res.json(user);
});

//? Logout
export const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;

  if (!cookie?.refreshToken)
    throw new Error("No Refresh Token Present in Cookie");
  const refreshToken = cookie.refreshToken;

  const user = await User.findOne({ refreshToken });

  if (!user) {
    res.clearCookie("refreshToken", { httpOnly: true, secure: true });
    return res.sendStatus(204); //*forbidden
  }
  await User.findOneAndUpdate(refreshToken, { refreshToken: "" });
  res.clearCookie("refreshToken", { httpOnly: true, secure: true });
  return res.sendStatus(204); //*forbidden
});

//? WishList
export const addToWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyAdded = await user.wishList.find(
      (id) => id.toString() === prodId
    );
    if (alreadyAdded) {
      let user = await User.findByIdAndUpdate(_id, {
        $pull: { wishList: prodId },
      });
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(_id, {
        $push: { wishList: prodId },
      });
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
});

//? Get Wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const findUser = await User.findById(_id).populate("wishList");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

//? Save Address
export const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updatedAddress = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      { new: true }
    );
    res.json(updatedAddress);
  } catch (error) {
    throw new Error(error);
  }
});

//? Add Item To User Cart
export const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    let products = [];
    const user = await User.findById(_id);
    const alreadyExistCart = await Cart.findOne({ orderBy: user._id });
    if (alreadyExistCart) {
      alreadyExistCart.remove();
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      object.price = getPrice.price;
      products.push(object);
    }
    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }

    let newCart = await new Cart({
      products,
      cartTotal,
      orderBy: user?._id,
    }).save();
    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});

//? Get User Cart
export const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderBy: _id }).populate(
      "products.product"
    );
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

//? Empty Cart
export const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findById(_id);
    const cart = await Cart.findOneAndRemove({ orderBy: user._id });
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

//? Apply Coupon
export const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon === null) {
    throw new Error("Invalid Coupon");
  }
  const user = await User.findById(_id);
  let { products, cartTotal } = await Cart.findOne({
    orderBy: user._id,
  }).populate("products.product");
  let totalAfterDiscounnt = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderBy: user._id },
    { totalAfterDiscounnt },
    { new: true }
  );
  res.json(totalAfterDiscounnt);
});

//? Create Order
export const createOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    if (!COD) throw new Error("Create Cash Order Failed");
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderBy: user._id });
    let finalAmount = 0;
    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmount = userCart.totalAfterDiscount * 100;
    } else {
      finalAmount = userCart.cartTotal * 100;
    }
    let newOrder = new Order({
      products: userCart.products,
      paymentIntent: {
        id: uuidv4(),
        method: "COD",
        amount: finalAmount,
        status: "Cash On Delivery",
        created: Date.now(),
        currency: "INR",
      },
      orderBy: user._id,
      orderStatus: "Processing",
    }).save();
    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });
    const updated = await Product.bulkWrite(update, {});
    res.json({ message: "SUCCESS" });
  } catch (error) {
    throw new Error(error);
  }
});

//? Get Orders
export const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const userOrders = await Order.findOne({ orderBy: _id }).populate(
      "products.product"
    );
    res.json(userOrders);
  } catch (error) {
    throw new Error(error);
  }
});

//? Update Order Status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      { new: true }
    );
    res.json(updateOrderStatus);
  } catch (error) {
    throw new Error(error);
  }
});
