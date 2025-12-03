"use strict";

import { DataTypes, TEXT } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    //modify the "image_url" column in the "products" table
    return queryInterface.changeColumn("products", "image_url", {
      //change the data type from STRING(limited length) to text (for longer image url or base64 data)
      type: DataTypes.TEXT,
      //allow null in this column
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    //revert the column type back to string if the migration is undone
    return queryInterface.changeColumn("products", "image_url", {
      type: DataTypes.STRING,
      allowNull: true,
    });
  },
};
