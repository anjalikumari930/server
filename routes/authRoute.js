import express from "express";
import {
  registerController,
  loginController,
  forgotPasswordController,
  testController,
  editUserController,
} from "../controller/authcontroller.js";
import { isAdmin } from "../middlewares/authMiddleware.js";
import { verifyToken } from "../middlewares/authVerification.js";

//router object
const router = express.Router();

//routing
//REGISTER || METHOD POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);

//Forgot Password || POST
router.post("/forgot-password", forgotPasswordController);

//test routes
router.get("/test", isAdmin, testController);

//protected User route auth
router.get("/user-auth", verifyToken, (req, res) => {
  res.status(200).send({ ok: true });
});
//protected Admin route auth
router.get("/admin-auth", verifyToken, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//update profile
router.patch("/users/:userId", verifyToken, editUserController);

export default router;
