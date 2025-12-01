const Question = require('../../models/Question.js');

//fetch all Question
const fetchAllQuestions = async (req, res) => {
  try {
    const listOfQuestions = await Question.find({});
    res.status(200).json({
      success: true,
      data: listOfQuestions,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: 'Error occured',
    });
  }
};
//edit a Question
const editQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, school_name, picture, message } = req.body;

    let findQuestion = await Question.findById(id);
    if (!findQuestion)
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    findQuestion.name = name || findQuestion.name;
    findQuestion.email = email || findQuestion.email;
    findQuestion.message = message || findQuestion.message;
    findQuestion.school_name = school_name || findQuestion.school_name;
    findQuestion.picture = picture || findQuestion.picture;
    await findQuestion.save();
    res.status(200).json({
      success: true,
      data: findQuestion,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: 'Error occured!!!',
    });
  }
};
//delete a Question
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndDelete(id);

    if (!question)
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });

    res.status(200).json({
      success: true,
      message: 'Question delete successfully',
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
  fetchAllQuestions,
  editQuestion,
  deleteQuestion,
};
