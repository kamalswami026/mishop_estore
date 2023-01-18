import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./config/dbConnect.js";
import authRouter from "./routes/authRoute.js";
import productRouter from "./routes/productRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import blogCategoryRouter from "./routes/blogCategoryRoutes.js";
import brandRouter from "./routes/brandRoutes.js";
import couponRouter from "./routes/couponRoutes.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3500;

//? CONNTECTING TO DATABASE
connectDB();

//? Middlewares
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//? ROUTES
app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRoutes);
app.use("/api/category", categoryRouter);
app.use("/api/blogcategory", blogCategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);

//? ERROR HANDLERS
app.use(notFound);
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to Database");

  app.listen(PORT, () => {
    console.log(`Server is running on PORT - ${PORT}`);
  });
});
