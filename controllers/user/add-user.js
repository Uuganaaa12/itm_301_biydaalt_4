import bcrypt from "bcryptjs/dist/bcrypt.js";
import School from "../../models/School.js";
import User from "../../models/User.js";

export const createUser = async (req, res) => {
  try {
    const { username, first_name, last_name, email, phone, password } =
      req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const user = await User.create({
      username,
      first_name,
      last_name,
      email,
      phone,
      password: hashedPassword,
      role: 20,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addUsertoSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { userId, role_id } = req.body;

    // Validate role
    if (![40, 50].includes(role_id)) {
      return res.status(400).json({
        success: false,
        message: "Role must be 40 (student) or 50 (teacher)",
      });
    }

    // Update the user's role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: role_id },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Add user to school
    const school = await School.findByIdAndUpdate(
      schoolId,
      { $addToSet: { users: userId } },
      { new: true }
    );

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User added to school and role updated",
      user: updatedUser,
      school,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
