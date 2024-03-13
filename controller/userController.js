// Get all users with pagination and sorting
import user from "../models/user.js";
export const getAllUsersController = async (req, res) => {
  try {
    let { page, limit, sortField, sortOrder, search } = req.query;

    // Set default values if not provided
    page = page || 1;
    limit = limit || 10;
    sortField = sortField || "username";
    sortOrder = sortOrder || "asc";
    search = search || "";

    // Define sorting order
    const sortOption = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    // Define search query
    const searchQuery = {
      $or: [
        { username: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
      ],
    };

    // Get users with pagination, sorting, and search
    const users = await user
      .find(searchQuery)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalUsers = await user.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      users,
      pageInfo: {
        page: Number(page),
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while getting users",
      error,
    });
  }
};

// Delete user by ID
export const deleteUserController = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user exists
    const existingUser = await user.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete the user
    await user.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while deleting user",
      error,
    });
  }
};
