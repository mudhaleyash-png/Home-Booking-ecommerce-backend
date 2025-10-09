// Defines the User Model...

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

/**
 * Define User Model
 * The first argument , 'User' , is the model name . Sequelize will automatically
 * look for a table named 'users' (the plural form) in ths database
 *
 * The second argument is an object that defines the columns (attributes) of the table
 *
 * The third argument is an object for model options
 */

const User = sequelize.define(
  "User",
  {
    // Defines the 'id' column
    id: {
      // Data type for the column
      type: DataTypes.INTEGER,
      // Tells the database to automatically add a new , unique number for each user
      autoIncrement: true,
      // This column is the unique identifier for each row. This is a fundamental concept in database
      primaryKey: true,
    },

    // Defines the 'email' column
    email: {
      // The  data type is a string
      type: DataTypes.STRING,

      //  'allowNull: false' means this column cannot be empty . It is a required field
      allowNull: false,

      // `unique : true` ensures that no two users can have the same email address
      unique: true,
    },

    //Defines the 'password_hash' column
    //We store the hashed password here, which is a long string of characters.
    password_hash: {
      // The DataType is a STRING
      type: DataTypes.STRING,

      // This column is also required and cannot be empty
      allowNull: false,
    },
  },

  {
    // ==Model Options==

    // `tableName: 'users'` explicitly tells sequelize to use the 'users'  table in the database
    // It's a good practice to specify  this, even if sequelize would guess it correctly...
    tableName: "users",

    // `timestamps: true` automatically adds two columns to our table
    // `createdAt` and `updatedAt` .These column will store the data and time
    // a user was created and last updated. This is very common for tracking the data
    timestamps: true,
  }
);

// -----Exporting the User Model -----

// This allows other files to import and use it...
export default User;

