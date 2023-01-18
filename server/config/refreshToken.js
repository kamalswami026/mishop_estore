import jwt from "jsonwebtoken";

export const generateRefreshToken = async (id) => {
  return await jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
