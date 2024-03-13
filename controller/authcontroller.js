import user from "../models/user.js";
import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import sendMail from "../smtp/sendMail.js";
import JWT from "jsonwebtoken";
import mongoose from "mongoose";

export const registerController = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide username, email, and password",
      });
    }

    // Check if the username or email is already registered
    const existingUser = await user.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "Username or email already registered",
      });
    }

    const hashedPassword = await hashPassword(password);

    // Create a new user
    const newUser = new user({
      username,
      email,
      password: hashedPassword,
      role: role || "employee",
    });
    await newUser.save();

    // Send congratulatory email before hashing the password
    const emailSubject = "Welcome to Exim Logic!";
    const emailText = `Congratulations ${username}, your account has been successfully registered at Exim Logic.`;
    let emailHtml = `<p>Hello ${username},</p><p>Your account has been successfully registered at Exim Logic.</p>`;

    // Include password in the email
    emailHtml += `<p>Your password: ${password}</p>`;

    if (role === "user") {
      emailHtml += `<p>You have access to all user-related tasks, including user dashboard and creating customers.</p>`;
    } else if (role === "admin") {
      emailHtml += `<p>You have access to all data and the ability to add and delete admins, users, and customers through the admin dashboard.</p>`;
    }

    const emailOptions = {
      to: email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    };

    await sendMail(emailOptions);

    res.status(201).send({
      success: true,
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in registration",
      error,
    });
  }
};

//POST LOGIN
export const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;
    //validation
    if (!username || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid username or password",
      });
    }
    //check user
    const employee = await user.findOne({ username });
    if (!employee) {
      return res.status(404).send({
        success: false,
        message: "Username is not registered",
      });
    }
    const match = await comparePassword(password, employee.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }
    //token
    const token = await JWT.sign(
      { _id: employee._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.status(200).send({
      success: true,
      message: "Login successfully",
      user: {
        _id: employee._id,
        username: employee.username,
        email: employee.email,
        role: employee.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//forgotPasswordController

export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    // Find user by email
    const employee = await user.findOne({ email });

    // Check if user exists
    if (!employee) {
      return res.status(404).send({
        success: false,
        message: "Wrong Email Or Email Not Registered",
      });
    }

    // Find admin user(s) in the database
    const admins = await user.find({ role: "admin" });

    // Send notification email to admin(s)
    const adminEmailSubject = "Password Change Request";
    const adminEmailText = `${employee.username} (${employee.email}) has requested a password change.`;
    const adminEmailHtml = `<p>${employee.username} (${employee.email}) has requested a password change.</p>`;

    const adminEmailOptions = {
      to: admins.map((admin) => admin.email),
      subject: adminEmailSubject,
      text: adminEmailText,
      html: adminEmailHtml,
    };

    await sendMail(adminEmailOptions);

    res.status(200).send({
      success: true,
      message: " email sent to admin",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//test controller
export const testController = (req, res) => {
  try {
    res.send("Protected Routes");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

export const updateProfileController = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Retrieve the user from the database
    const existingUser = await user.findById(req.user._id);
    if (!existingUser) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Update the user properties if provided in the request body
    if (username) {
      existingUser.username = username;
    }
    if (email) {
      existingUser.email = email;
    }
    if (password) {
      existingUser.password = password;
    }

    // Save the updated user
    const updatedUser = await existingUser.save();

    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error While Updating Profile",
      error,
    });
  }
};

export const editUserController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, role, password } = req.body;

    // Check if the user ID is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Check if the user exists
    const existingUser = await user.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user details
    existingUser.username = username || existingUser.username;
    existingUser.email = email || existingUser.email;
    existingUser.role = role || existingUser.role;

    // Update password if provided
    if (password) {
      const hashedPassword = await hashPassword(password);
      existingUser.password = hashedPassword;
    }

    // Save the updated user
    await existingUser.save();

    // Send email with updated user details
    const emailSubject = "Account Details Updated";
    const emailText = `Your account details have been updated.\n\nUsername: ${existingUser.username}\nEmail: ${existingUser.email}\nRole: ${existingUser.role}\nPassword: ${password}`;
    const emailHtml = `<p>Your account details have been updated:</p><ul><li>Username: <strong>${existingUser.username}</strong></li><li>Email: <strong>${existingUser.email}</strong></li><li>Role: <strong>${existingUser.role}</strong></li><li>Password: <strong>${password}</strong></li></ul>`;

    const emailOptions = {
      to: existingUser.email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    };

    await sendMail(emailOptions);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      updatedUser: {
        _id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        role: existingUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error,
    });
  }
};
