'use strict';

import { DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
export default  {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    return queryInterface.changeColumn('products', 'image_url',{
      //Change the data type from STRING(limited length) to TEXT (for longer imgae URLs or base)
      type:DataTypes.TEXT,
      
      //Allow null values in this column
      allowNull: true,
    });
  
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Reverts the column types back to STRING if the migration 
    return queryInterface.changeColumn('products', 'image_url', {
      type: DataTypes.STRING,
      allowNull: true,
    });
  },
};
