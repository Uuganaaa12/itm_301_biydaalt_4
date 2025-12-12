import School from "../../models/School.js";

export const createSchool = async (req, res) => {
  try {
    const { name, url, priority } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "School name is required",
      });
    }

    const school = await School.create({
      name,
      url,
      priority: priority || 1,
      users: [],
    });

    res.status(201).json({
      success: true,
      message: "School created successfully",
      school,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllSchools = async (req, res) => {
  try {
    const schools = await School.find().populate(
      "users",
      "first_name last_name email role"
    );

    res.status(200).json({
      success: true,
      schools,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const school = await School.findById(schoolId).populate("users");

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    res.status(200).json({
      success: true,
      school,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
