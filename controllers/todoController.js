const mongoose = require('mongoose');
const Todo = require('../models/Todo');

const getRequesterId = req => {
  const headerId = req.headers['x-user-id'];
  const queryId = req.query.userId;
  const bodyId = req.body?.userId;
  const userId = headerId || queryId || bodyId || req.user?.id || req.userId;

  return typeof userId === 'string' ? userId.trim() : userId ? String(userId) : '';
};

const parseDueDate = value => {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

exports.getTodos = async (req, res) => {
  try {
    const userId = getRequesterId(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Хандалтын үед хэрэглэгчийн мэдээлэл шаардлагатай',
      });
    }

    const todos = await Todo.find({ userId })
      .sort({ isCompleted: 1, dueDate: 1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: todos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Тэмдэглэлийг авахад алдаа гарлаа',
      error: error.message,
    });
  }
};

exports.createTodo = async (req, res) => {
  try {
    const userId = getRequesterId(req);
    const { title, description, dueDate } = req.body || {};

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Хэрэглэгчийн мэдээлэл шаардлагатай',
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Гарчиг шаардлагатай',
      });
    }

    const todo = await Todo.create({
      userId,
      title: title.trim(),
      description: description ? description.trim() : '',
      dueDate: parseDueDate(dueDate),
    });

    return res.status(201).json({
      success: true,
      message: 'Тэмдэглэл нэмэгдлээ',
      data: todo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Тэмдэглэл үүсгэхэд алдаа гарлаа',
      error: error.message,
    });
  }
};

exports.updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getRequesterId(req);
    const { title, description, isCompleted, dueDate } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Буруу ID',
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Хэрэглэгчийн мэдээлэл шаардлагатай',
      });
    }

    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Тэмдэглэл олдсонгүй',
      });
    }

    if (todo.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Та зөвхөн өөрийн тэмдэглэлээ засварлах боломжтой',
      });
    }

    if (title !== undefined) {
      const trimmed = title.trim();
      if (!trimmed) {
        return res.status(400).json({
          success: false,
          message: 'Гарчиг хоосон байж болохгүй',
        });
      }
      todo.title = trimmed;
    }

    if (description !== undefined) {
      todo.description = description ? description.trim() : '';
    }

    if (isCompleted !== undefined) {
      todo.isCompleted = Boolean(isCompleted);
    }

    if (dueDate !== undefined) {
      todo.dueDate = parseDueDate(dueDate);
    }

    await todo.save();

    return res.json({
      success: true,
      message: 'Тэмдэглэл шинэчлэгдлээ',
      data: todo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Тэмдэглэлийг шинэчлэхэд алдаа гарлаа',
      error: error.message,
    });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getRequesterId(req);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Буруу ID',
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Хэрэглэгчийн мэдээлэл шаардлагатай',
      });
    }

    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Тэмдэглэл олдсонгүй',
      });
    }

    if (todo.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Та зөвхөн өөрийн тэмдэглэлээ устгах боломжтой',
      });
    }

    await todo.deleteOne();

    return res.json({
      success: true,
      message: 'Тэмдэглэл устгагдлаа',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Тэмдэглэлийг устгахад алдаа гарлаа',
      error: error.message,
    });
  }
};
