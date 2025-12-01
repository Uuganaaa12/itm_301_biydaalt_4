const express = require('express');

const {
  editQuestion,
  fetchAllQuestions,
  deleteQuestion,
} = require('../../controllers/admin/questions-controller');

const router = express.Router();

router.put('/edit/:id', editQuestion);
router.delete('/delete/:id', deleteQuestion);
router.get('/get', fetchAllQuestions);

module.exports = router;
