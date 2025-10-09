/**
 * Defines the Order Model
 * The first argument define model name 'Order', which sequelize will automatically guess table name 'orders' in the database
 * The second argument is an object of attributes(columns),
 * The third argument is an object for model options
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const Order = sequelize.define(
  "Order",
  {
    // Defines the id column
    id: {
      type: DataTypes.INTEGER,

      // Autoincrement
      autoIncrement: true,

      // It is a unique
      primaryKey: true,
    },
    // Defines the ' totalAmount'
    total_amount: {
      // The DataTypes is a DECIMAL(10,2)
      type: DataTypes.DECIMAL(10, 2),

      // The total amount is required and it cannot be null
      allowNull: false,
    },

    // Defines 'userId' column
    // It's crucial for understanding which user placed which order
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Defines the 'status' column
    status: {
      // Datatypes is a STRING
      type: DataTypes.STRING,

      // status field is required
      allowNull: false,

      // Sets a default value pf 'pending' for  new order
      defaultValue: "pending",
    },
  },

  {
    // ===Model Options ===
    // Ecplicitly sets the tableName orders
    tableName: "orders",

    // timestamps for createdAt and updatedAt columns
    timestamps: true,
  }
);

export default Order;
