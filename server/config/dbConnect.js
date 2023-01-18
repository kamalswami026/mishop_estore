import mongoose from "mongoose";

export const connectDB = () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.DB_URL);
  } catch (error) {
    console.log(error);
  }
};
