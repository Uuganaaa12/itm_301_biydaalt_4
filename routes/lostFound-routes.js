const express = require('express');
const router = express.Router();
const lostFoundController = require('../controllers/lostFoundControllers');
const { upload } = require('../helpers/cloudinary');

router.get('/', lostFoundController.getAllItems);

router.get('/search', lostFoundController.searchItems);

router.get('/:id', lostFoundController.getItemById);

router.post('/', upload.single('image'), lostFoundController.createItem);

router.put('/:id', upload.single('image'), lostFoundController.updateItem);

router.delete('/:id', lostFoundController.deleteItem);

module.exports = router;
