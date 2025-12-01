const express = require('express');

const {
  handleImageUpload,
  addQuestion,
} = require('../../controllers/user/questions-controller');

const { upload } = require('../../helpers/cloudinary');

const router = express.Router();

router.post('/upload-image', upload.single('my_file'), handleImageUpload);

router.post('/add', addQuestion);

module.exports = router;
