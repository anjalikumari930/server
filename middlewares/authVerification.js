// middleware/authMiddleware
import jwt from "jsonwebtoken";

//verify token for authentication
export function verifyToken(req, res, next) {
  
  const tokenHeader = req.header("Authorization");

  // console.log(token);
  if (!tokenHeader) {
    return res.status(401).json({ error: "Access denied. Token missing in the header." });
  }
  const token = tokenHeader.split(" ")[1];
  try {
    // eslint-disable-next-line no-undef
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}
