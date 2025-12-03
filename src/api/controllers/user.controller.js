/**
 * @fileoverview Controller layer for handling incoming HTTP requests and sending responses
 * This layer controls the service layer and handles validation and errors
 */

import UserService from "../services/user.service.js";

/**
 * @classdesc Controller layer for handling user-related HTTP requests..
 * This class receives requests from the routes and decides how to respond
 * It validates input, calls the service layer to perform the business logic,
 * and handles success/error responses.
 */

class UserController {
  /**
   * Handles the user registration request
   * @param {object} req - The Express request object
   * @param {object} res - The Express response object
   */

  static async register(req, res) {
    // Extract email and password from the request body(data sent by the user)

    const { email, password_hash } = req.body;

    // Basic vaildation -> make sure both email and password exist
    if (!email || !password_hash) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    try {
      // Call the Service layer -> handles actual registration (hashing , saving to db)
      const newUser = await UserService.registerUser(email, password_hash);

      //   newUser= id-1
      //             email-admin@gmail.comn

      // If registraction succeeds , return success response with user info
      return res.status(201).json({
        success: true,
        message: "User registered successfully!",
        user: newUser,
      });
    } catch (error) {
      console.error("User registration failed ", error.message);

      // If email already exists -> handle with clear error message
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          success: false,
          message: "This email is already exist",
        });
      }

      // Any other unknown error -> send "Internal Server Error"
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Handles the user login request and returns a JWT on success
   */

  static async login(req, res) {
    // Extract email & password from request body
    const { email, password_hash } = req.body;

    // Basic validation -> ensure both fields are present
    if (!email || !password_hash) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    try {
      // Call the service layer to authenticate the user
      const user = await UserService.loginUser(email, password_hash);

      // If user not found or password invalid -> generic error message
      // (prevents attackers from guessing whether email exists)

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // On successfull login -> send user data and JWT token
      return res.status(200).json({
        success: true,
        message: "Login Successful!",
        user,
      });
    } catch (error) {
      console.error("User login failed", error.message);

      // If something crashes return "Internal server error"
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Handles the request to get a user's profile.
   * (This endpoint is protected → requires authentication middleware).
   */

  static async getProfile(req, res) {
    try {
      // The authentication middleware attcahes userId to re.user
      const { id } = req.params;

      // Fetch user profile from service layer
      const userProfile = await UserService.getUserProfile(id);

      // If no profile found → send "Not Found".
      if (!userProfile) {
        return res.status(404).json({
          success: false,
          message: "User Profile Not found",
        });
      }

      // Profile found -> return it as success response
      return res.status(200).json({
        success: true,
        message: "user profile fetched successfully",
        profile: userProfile,
      });
    } catch (error) {
      console.error("Error fetching user profile", error.message);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  /**
   * Handles the request to update a user's profile.
   * (Also protected by authentication middleware).
   */
  static async updateProfile(req, res) {
    try {
      // Get userId from the auth middleware.
      const { id } = req.params;   // 3
      console.log(id);
      // Get update fields from the request body.
      const updates = req.body;      // email: admin12@gmail.com

      // Call service layer to apply updates.v                //3 , email: admin12@gmail.com
      const updatedUser = await UserService.updateUserProfile(id, updates);       //return id email

      // If no user found → return "Not Found".
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User profile not found.",
        });
      }

      // Success → return updated profile.
      return res.status(200).json({
        success: true,
        message: "User profile updated successfully!",
        profile: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user profile:", error.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }
}

export default UserController;
