/**
 * Defines the OrderItem Model
 * The first argument defien model name ,which sequelize will auto guess the table name 'order_items' in the database
 * The second argument is an object where we defines the columns
 * The third argument is an object for model options
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const OrderItem = sequelize.define(
  "OrderItem",
  {
    // defines the 'id' column
    id: {
      // The datatype is a INTEGER
      type: DataTypes.INTEGER,

      // Autoincrement
      autoIncrement: true,

      // Sets this as the primary key => column is unique
      primaryKey: true,
    },

    // Defines the 'quantity' column
    // This tells us how many of a specific product were ordered
    quantity: {
      // The datatype is an INTEGER
      type: DataTypes.INTEGER,

      // The quantity cannot be empty
      allowNull: false,

      // Sets the default quantity of 1 for new items
      defaultValue: 1,
    },

    // Defines the 'priceAtPurchase' column
    // This is a crucial field. It stores the product's price at the exact moment of purchase
    // This prevents historical order data from changing if the product's price i updated later
    priceAtPurchase: {
      // The datatype is a DECIMAL(10,2)
      type: DataTypes.DECIMAL(10, 2),

      // The price is a required field
      allowNull: false,
    },
  },
  {
    // ===Model Options ===
    // Explicitly sets the tablename 'order_items'
    tableName: "order_items",

    // timestamp auto create  createdAt and updatedAt columns

    timestamps: true,
  }
);

export default OrderItem;
