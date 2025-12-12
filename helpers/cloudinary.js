const cloudinary = require('cloudinary').v2;
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file, mimetype) {
  let uploadSource = file;

  if (Buffer.isBuffer(file)) {
    if (!mimetype) {
      throw new Error('Missing mimetype for buffer upload');
    }
    const base64 = file.toString('base64');
    uploadSource = `data:${mimetype};base64,${base64}`;
  }

  const result = await cloudinary.uploader.upload(uploadSource, {
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