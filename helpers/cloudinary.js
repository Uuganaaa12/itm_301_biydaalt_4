const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: 'dvnbdfajd',
  api_key: '534377337391846',
  api_secret: '0PAfaxUmuxoYUbKMf8LM1iw5uYA',
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
