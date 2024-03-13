import express from "express";
import { getAllUsersController,deleteUserController } from "../controller/userController.js";
import { isAdmin } from "../middlewares/authMiddleware.js";
import { verifyToken } from "../middlewares/authVerification.js";

//router object
const router = express.Router();


// get all users with pagination, sorting, and search
router.get("/users", verifyToken, isAdmin, getAllUsersController);

// delete user by ID
router.delete("/users/:userId", verifyToken, isAdmin, deleteUserController);

export default router;
