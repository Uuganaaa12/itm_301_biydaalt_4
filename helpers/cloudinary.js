const cloudinary = require('cloudinary').v2;
const multer = require('multer');
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: 'auto',
  });

  return {
    ...result,
    url: cloudinary.url(result.public_id, {
      fetch_format: 'auto',
      quality: 'auto',
    }),
  };
}

const upload = multer({
  storage,
});

module.exports = { upload, imageUploadUtil };
