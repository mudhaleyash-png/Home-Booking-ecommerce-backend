/**
 * Defines the Cart model.
 * The model name is 'Cart', and it maps to the 'carts' table in the database.
 * The Cart model holds a  ID and will be associated with a User.
 * The actual products inside the cart will be stored in a separate table (e.g., 'CartItems').
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const Cart = sequelize.define(
  "Cart",
  {
    // Defines the 'id' column
    id: {
      // The data type is an INTEGER
      type: DataTypes.INTEGER,
      // Auto-increment
      autoIncrement: true,
      // This is a unique column, so we have to mention primaryKey
      primaryKey: true,
    },
  },
  {
    // --- Model Options ---

    // Explicitly sets the table name to 'carts' for clarity and consistency.
    tableName: "carts",

    // `timestamps: true` adds `createdAt` and `updatedAt` columns automatically.
    timestamps: true,
  }
);

export default Cart;
