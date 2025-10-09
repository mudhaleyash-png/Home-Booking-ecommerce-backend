import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

// Use the same secret key that you used to sign the token.
const jwtSecret = process.env.JWT_SECRET;
  
/**
 * @description: Middleware function to authenticate a JSON Web Token (JWT).
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function in the stack.
 */
function authenticateToken(req, res, next) {
  // 1. Get the Authorization header from the request.
  const authHeader = req.headers["authorization"];

  // 2. Extract the token from the header. The format is typically "Bearer TOKEN".
  const token = authHeader && authHeader.split(" ")[1];

  // 3. If no token is provided, the user is not authenticated.
  if (!token) {
    // Return a 401 Unauthorized status, as the user did not provide a token.
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  // 4. Verify the token using the secret key.
  try {
    const decoded = jwt.verify(token, jwtSecret);

    // A common practice is to attach the entire decoded payload to the request.
    // This gives you access to all data stored in the token.
    req.user = decoded;

    // Log for debugging purposes
    console.log("Decoded token:", decoded);
    // Correct way to log the userId:
    console.log("User ID from token:", req.user.userId);
    // 5. Call next() to pass the request to the next middleware or route handler.
    next();
  } catch (err) {
    // If the token is not valid (e.g., expired, corrupted, or wrong signature),
    // we send a 401 Unauthorized response.
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
}

export default authenticateToken;
