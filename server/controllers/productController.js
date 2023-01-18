import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import slugify from "slugify";
import { validateMongoDbId } from "../utils/validateMongoDbId.js";
import { cloudinaryUploadImage } from "../utils/cloudnary.js";
import path_ from "path";
import fs from "fs";

export const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) req.body.slug = slugify(req.body.title);

    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.findById(id);
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

export const getAllProducts = asyncHandler(async (req, res) => {
  try {
    //? Filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    let queryString = JSON.stringify(queryObj);

    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    console.log(
      "🚀 ~ file: productController.js:38 ~ getAllProducts ~ queryString",
      JSON.parse(queryString)
    );

    let query = Product.find(JSON.parse(queryString));

    //? Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //? Limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    //? Pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) {
        throw new Error("Page doesn't exist");
      }
    }

    const products = await query;

    res.json(products);
  } catch (error) {
    throw new Error(error);
  }
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    if (req.body.title) req.body.slug = slugify(req.body.title);

    const updatedProduct = await Product.findOneAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedProduct);
  } catch (error) {
    throw new Error(error);
  }
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await Product.findOneAndDelete(id);
    res.json(deletedProduct);
  } catch (error) {
    throw new Error(error);
  }
});


export const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        { $set: { "ratings.$.star": star, "ratings.$.comment": star } },
        { new: true }
      );
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              postedby: _id,
              comment: comment,
            },
          },
        },
        { new: true }
      );
    }
    const getAllRatings = await Product.findById(prodId);
    let totalRating = getAllRatings.ratings.length;
    let ratingSum = getAllRatings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingSum / totalRating);
    let finalProduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating,
      },
      { new: true }
    );
    res.json(finalProduct);
  } catch (error) {
    throw new Error(error);
  }
});

export const uploadImages = asyncHandler(async (req, res) => {
  console.log("i am called");
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const uploader = (path) => cloudinaryUploadImage(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      console.log(file);
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);

      fs.unlinkSync(path_.resolve("public/images", file.filename));
    }
    const findProduct = await Product.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => file),
      },
      { new: true }
    );
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});
