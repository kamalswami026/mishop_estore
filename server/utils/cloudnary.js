import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: "dotsk6e7y",
  api_key: "762466513145182",
  api_secret: "iZKS9WCE4qBGejoksM0jnmOQoag",
});

export const cloudinaryUploadImage = async (fileToUpload) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(fileToUpload, (result) => {
      resolve(
        {
          url: result.secure_url,
        },
        { resource_type: "auto" }
      );
    });
  });
};
