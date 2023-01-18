import Blog from "../models/blogModel.js";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import { validateMongoDbId } from "../utils/validateMongoDbId.js";
import { cloudinaryUploadImage } from "../utils/cloudnary.js";
import fs from "fs";
import path_ from "path";

export const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.json(newBlog);
  } catch (error) {
    throw new Error(error);
  }
});

export const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedBlog);
  } catch (error) {
    throw new Error(error);
  }
});

export const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getBlog = await Blog.findById(id)
      .populate("likes")
      .populate("dislikes");
    await Blog.findByIdAndUpdate(id, { $inc: { numViews: 1 } }, { new: true });
    res.json(getBlog);
  } catch (error) {
    throw new Error(error);
  }
});

export const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const allBlogs = await Blog.find();
    res.json(allBlogs);
  } catch (error) {
    throw new Error(error);
  }
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedBlog = await Blog.findByIdAndDelete(id);
    res.json(deleteBlog);
  } catch (error) {
    throw new Error(error);
  }
});

export const likeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;

  validateMongoDbId(blogId);
  const blog = await Blog.findById(blogId);
  const loginUserId = req?.user?._id;

  const isLiked = blog?.isLiked;

  const alreadyDisliked = blog?.dislikes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );

  if (alreadyDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      { new: true }
    );
    res.json(blog);
  }

  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      { new: true }
    );
    res.json(blog);
  }
});

export const dislikeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;

  validateMongoDbId(blogId);
  const blog = await Blog.findById(blogId);
  const loginUserId = req?.user?._id;

  const isDisLiked = blog?.isDisliked;

  const alreadyLiked = blog?.likes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );

  if (alreadyLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(blog);
  }

  if (isDisLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      { new: true }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { dislikes: loginUserId },
        isDisliked: true,
      },
      { new: true }
    );
    res.json(blog);
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
    const findBlog = await Blog.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => file),
      },
      { new: true }
    );
    res.json(findBlog);
  } catch (error) {
    throw new Error(error);
  }
});
