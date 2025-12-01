const { imageUploadUtil } = require('../../helpers/cloudinary.js');
const Question = require('../../models/Question.js');

const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const url = 'data:' + req.file.mimetype + ';base64,' + b64;
    const result = await imageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: 'Error occured',
    });
  }
};
//add a new Question
const addQuestion = async (req, res) => {
  try {
    const { name, email, school_name, picture, message } = req.body;
    const newlyCreateQuestion = new Question({
      name,
      email,
      school_name,
      picture,
      message,
    });

    await newlyCreateQuestion.save();
    res.status(201).json({
      success: true,
      data: newlyCreateQuestion,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: 'Error occured',
    });
  }
};

module.exports = {
  handleImageUpload,
  addQuestion,
};
