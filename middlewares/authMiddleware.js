import jwt from "jsonwebtoken";
import user from "../models/user.js";

// //protected routes token base
// export const requireSignIn = async (req, res, next) => {
//   try {
//     const decode = JWT.verify(
//       req.headers.authorization,
//       process.env.JWT_SECRET
//     );
//     req.user = decode;
//     next();
//   } catch (error) {
//     console.log(error);
//   }
// };
//admin access

export const isAdmin = async (req, res, next) => {
  try {
    // Get the token from the request headers
    const token = req.headers.authorization.split(" ")[1];

    // Decode the token to get the user's _id
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken._id;
    

    // Find the user in the database
    const myuser = await user.findById(userId);
  

    // Check if the user has the "admin" role
    if (myuser && myuser.role === "admin") {
      next(); // User is an admin, proceed to the next middleware or route handler
    } else {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};
