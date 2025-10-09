/**
 * @fileoverview Defines the service layer for all user-related business logic
 * This file contains functions for user registration, login , and profile management
 * It interacts directly with the database models to perform these operations
 */

import User from "../../database/models/user.model.js";

// Import part

// We import `dotenv` and call `config()`  to load environment variables from `.env` file
import dotenv from "dotenv";
dotenv.config();

// We import the `bcryptjs` library , which is used for hashing passwords
import bcrypt from "bcryptjs";

// We import the `jsonwebtoken` (JWT) library fro creating and verifying authentication tokens
import jwt from "jsonwebtoken";

// define jwtSecret Key
// We get the secret key from `process.env` to keep it out of codebase
const jwtSecret = process.env.JWT_SECRET;

/**
 * @classdesc Service layer for all user-related business logic
 * This class provides a set of static methods to handle user opertaions..
 * Separating logic into a service layer helps keep our controllers and routes clean
 */

class UserService {
  /**
   * @description Registers a new user with a hashed password
   * @param {string} email - The user's email address
   * @param {string} password -The user's plain-text password
   * @return {object} The newly created user object , without the password hash
   */

  static async registerUser(email, password_hash) {
    // We use `await` bcoz `bcrypt.genSalt` is an asynchronous operation
    // The `genSalt` function generates a random string (a 'salt') that is used
    // To make the password hash more secure and unique for each user
    // The number 10 is the number of salt rounds, which determine the complexity
    const salt = await bcrypt.genSalt(10);

    // 2^10 (1024)

    // salt=$2a$10$Vt5E2o6d7J9H.3hK5xwTq.

    // We use `await` on `bcrypt.hash` to hash the user's password using generated salt
    const passwordHash = await bcrypt.hash(password_hash, salt);

    // password = admin1234;
    // 2^10 (1024)

    // admin1234

    // $2a$10$u6UC9RCqEKlkldiy.KnfUeW892j8R7cJ2H3PSZKPuxEkXVmsC23w6

    // We use the Sequelize `create()` method to create a new user record in the database (user table)
    const newUser = await User.create({
      email,
      password_hash: passwordHash,
    });

    // We return a new object with only the public user data (Id and email)..
    // It is crucial security practice to never expose the password hash to the client
    return {
      id: newUser.id,
      email: newUser.email,
    };
  }

  /**
   * @description Authenticates a user by email and password
   * @param {string} email - The user's email addres
   * @param {string} password_hash - The user's plain text password
   * @return {object|null}  The user object and  a JWT on successful login , or null on failure
   */

  static async loginUser(email, password_hash) {
    // We user `User.findOne()` to find a single user record that matches the provided email
    // The `where` option is how we filter our query

    const user = await User.findOne({
      where: { email },
    });

    // This check is important for security. If the user doesn't exist., we immediately return null..
    // We do this to prevent 'timing attacks', where a malicious user could guess if an email exists
    // in the database based on how long the login process takes
    if (!user) {
      return null;
    }

    // We use `bcrypt.compare` to compare the plain-text password provided by the user
    // with the hashed password stored in the database.`bcrypt` handles the hashing automatically
    const isMatch = await bcrypt.compare(password_hash, user.password_hash);

    // If `isMatch` is false, it means teh passwords don't match, so we return null
    if (!isMatch) {
      return null;
    }

    // If the passwords match , we create a JSON web token (JWT)
    // The `payload` is the data we want to store in the token; here we store Id
    const payload = { userId: user.id };

    // `jwt.sign()` creates the token. It takes the payload, our secrete key , and options
    // We set `expiresIn`: `10m` , so the token automatically becomes invalid after 10 minuites
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });

    // If authentication is successful , we return a new object with the user's ID , email , and the new token
    return {
      id: user.id,
      email: user.email,
      token,
    };
  }

  /**
   * @description Retrieves a user's profile by their ID.
   * @param {number} userId - The ID of the authenticated user.
   * @returns {object|null} The user object without the password hash, or null if not found.
   */

  static async getUserProfile(id) {
    // 'User.findByPk()' is a sequelize method to find a record by it's primary key (in this case , `id`)
    const user = await User.findByPk(id, {
      // The `attributes` option is a security measure , We explicitly list the columns we want to retrive
      // This ensures that the passwor_hash is never included in the result
      attributes: ["id", "email"],
    });

    console.log(user);

    // We return the user object if found, otherwise `null`
    return user;
  }

  /**
   * @description Updates a user's profile information.
   * @param {number} userId - The ID of the authenticated user.
   * @param {object} updates - An object containing the fields to update (e.g., { email: 'new@email.com' }).
   * @returns {object|null} The updated user object without the password hash, or null if not found.
   */ //3    email:admin12@gmail.com
  static async updateUserProfile(userId, updates) {
    // We find the user by their ID.
    const user = await User.findByPk(userId); // 3
    console.log("user", user);
    // If the user doesn't exist, we return null.
    if (!user) {
      return null;
    }

    // This is a crucial security measure. We prevent the password hash from being updated
    // through this general-purpose function. Password updates should have a separate,
    // more secure process.
    if (updates.password_hash) {
      delete updates.password_hash;
    }

    // We use the Sequelize `update()` method to apply the new values to the user object.
    // Sequelize will automatically save these changes to the database.
    await user.update(updates);

    // We return the updated user object with only public information.
    return {
      id: user.id,
      email: user.email,
    };
  }
}

export default UserService;
