import BlogCategory from "../models/blogCategoryModel.js";
import asyncHandler from "express-async-handler";
import { validateMongoDbId } from "../utils/validateMongoDbId.js";

export const createCategory = asyncHandler(async (req, res) => {
  try {
    const newCategory = await BlogCategory.create(req.body);
    res.json(newCategory);
  } catch (error) {
    throw new Error(error);
  }
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedCategory = await BlogCategory.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedCategory);
  } catch (error) {
    throw new Error(error);
  }
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedCategory = await BlogCategory.findByIdAndDelete(id);
    res.json(deletedCategory);
  } catch (error) {
    throw new Error(error);
  }
});

export const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getCategory = await BlogCategory.findById(id);
    res.json(getCategory);
  } catch (error) {
    throw new Error(error);
  }
});

export const getAllCategory = asyncHandler(async (req, res) => {
  try {
    const allCategories = await BlogCategory.find();
    res.json(allCategories);
  } catch (error) {
    throw new Error(error);
  }
});
