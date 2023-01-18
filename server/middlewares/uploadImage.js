import multer from "multer";
import sharp from "sharp";
import path from "path";

const multerStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(path.resolve(), "./public/images"));
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname} - ${uniqueSuffix}+.jpeg`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/; // Choose Types you want...
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = true; //filetypes.test(file.mimetype);

  console.log(extname, mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Images only!"); // custom this message to fit your needs
  }
}

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      {
        message: "File not supported",
      },
      false
    );
  }
};

export const productImageResize = async (req, res, next) => {
  if (!req.files) return next();
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/products/${file.filename}`);
    })
  );
};

export const blogImageResize = async (req, res, next) => {
  if (!req.files) return next();
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/blogs/${file.filename}`);
    })
  );
};

export const uploadPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
