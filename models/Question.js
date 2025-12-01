const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    school_name: String,
    picture : String,
    message: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', QuestionSchema);
