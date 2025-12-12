const mongoose = require('mongoose');
const LostFound = require('../models/LostFound');
const { imageUploadUtil } = require('../helpers/cloudinary.js');

// Бүх Lost & Found постуудыг авах
exports.getAllItems = async (req, res) => {
  try {
    const { status, sortBy, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) {
      filter.status = status; // 'lost' эсвэл 'found'
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'recent') {
      sortOption = { createdAt: -1 };
    } else if (sortBy === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const items = await LostFound.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LostFound.countDocuments(filter);

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Алдаа гарлаа',
      error: error.message,
    });
  }
};

// Нэг посту авах
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Буруу ID',
      });
    }

    const item = await LostFound.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Пост олдсонгүй',
      });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Алдаа гарлаа',
      error: error.message,
    });
  }
};

// Шинэ Lost & Found пост үүсгэх
exports.createItem = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      foundDate,
      status,
      userId,
      userName,
    } = req.body;

    // Үндсэн валидацион
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Гарчиг шаардлагатай',
      });
    }

    let imageUrl = null;

    // Зураг байвал upload хийх
    if (req.file) {
      try {
        const uploadResult = await imageUploadUtil(
          req.file.buffer,
          req.file.mimetype
        );
        imageUrl = uploadResult.url;
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: 'Зураг upload хийхэд алдаа гарлаа',
          error: uploadError.message,
        });
      }
    }

    const newItem = new LostFound({
      title,
      description: description || '',
      imageUrl,
      location: location || '',
      foundDate: foundDate ? new Date(foundDate) : new Date(),
      status: status || 'lost',
      createdBy: {
        userId: userId || null,
        name: userName || 'Ойлтгүй',
      },
    });

    await newItem.save();

    res.status(201).json({
      success: true,
      message: 'Пост амжилттай үүсгэгдлээ',
      data: newItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Пост үүсгэхэд алдаа гарлаа',
      error: error.message,
    });
  }
};

// Lost & Found постыг шинэчлэх
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, foundDate, status, userId } =
      req.body;
    const requester = (userId || req.user?.id || req.userId || '').toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Буруу ID',
      });
    }

    const item = await LostFound.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Пост олдсонгүй',
      });
    }

    if (item.createdBy?.userId && item.createdBy.userId !== requester) {
      return res.status(403).json({
        success: false,
        message: 'Та зөвхөн өөрийн нэмсэн постыг засах боломжтой',
      });
    }

    let imageUrl = item.imageUrl;
    if (req.file) {
      try {
        const uploadResult = await imageUploadUtil(
          req.file.buffer,
          req.file.mimetype
        );
        imageUrl = uploadResult.url;
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: 'Зураг upload хийхэд алдаа гарлаа',
          error: uploadError.message,
        });
      }
    }

    // Update хийх
    if (title) item.title = title;
    if (description !== undefined) item.description = description;
    if (location) item.location = location;
    if (foundDate) item.foundDate = new Date(foundDate);
    if (status) item.status = status;
    if (imageUrl !== item.imageUrl) item.imageUrl = imageUrl;

    await item.save();

    res.json({
      success: true,
      message: 'Пост амжилттай шинэчлэгдлээ',
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Постыг шинэчлэхэд алдаа гарлаа',
      error: error.message,
    });
  }
};

// Lost & Found постыг устгах
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = (
      req.headers['x-user-id'] ||
      req.user?.id ||
      ''
    ).toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Буруу ID',
      });
    }

    const item = await LostFound.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Пост олдсонгүй',
      });
    }
    console.log('CreatedBy', item.createdBy?.userId);
    console.log('CreatedBy req', requester);
    if (item.createdBy?.userId && item.createdBy.userId !== requester) {
      return res.status(403).json({
        success: false,
        message: 'Та зөвхөн өөрийн нэмсэн постыг устгах боломжтой',
      });
    }

    await item.deleteOne();

    res.json({
      success: true,
      message: 'Пост амжилттай устгагдлээ',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Постыг устгахад алдаа гарлаа',
      error: error.message,
    });
  }
};

// Хайлт хийх (title, description, location)
exports.searchItems = async (req, res) => {
  try {
    const { q, status } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Хайлтын үг шаардлагатай',
      });
    }

    let filter = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
      ],
    };

    if (status) {
      filter.status = status;
    }

    const items = await LostFound.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Хайлтаар алдаа гарлаа',
      error: error.message,
    });
  }
};
