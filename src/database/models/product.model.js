/**
 * Defines the Product model..
 * The Model name is 'Product', which sequelize will automatically guess table name 'products' (plural)
 * The second argument is an object defining the attributes (columns)..
 * The third argument is an object for model options.. 
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const Product = sequelize.define(
    'Product',
    {
        // Defines the id column
        id: {
            // The data type is an INTEGER
            type: DataTypes.INTEGER,

            // Auto-increment 
            autoIncrement: true,
            // THis is unique column so we have to mention primaryKey
            primaryKey: true,
        },
        // Defines the 'name' column
        name: {
            // Data types is a STRING
            type: DataTypes.STRING,

            // This column is required and cannot be empty
            allowNull: false,
        },

        // Defines the 'description' column
        description: {
            // The dataype is a TEXT
            type: DataTypes.TEXT,

            // The decription is optional
            allowNull: true
        },

        // Defines the 'price' column
        price: {
            // DECIMAL(10, 2) is the best data type for money
            // It stores numbers with a fixed decimal point
            // 10 is the total number of digits, and 2 is the number of digits after the decimal point..
            type: DataTypes.DECIMAL(10,2),
            
            // eg 12345678.00 this is right
            // eg 1234567880.00 this is wrong becoz it has 12 dgits

            // This column is required and cannot be empty
            allowNull: false,

        },

        // Defines the 'stock' column
        stock: {
            // Datatypes is an INTEGER
            type: DataTypes.INTEGER,

            // The stock count is required
            allowNull: false,

            // Default value 
            defaultValue: 0,
        
        },

        // Defines the 'image_url' column
        image_url:{
            // The datatype is a STRING
            type: DataTypes.TEXT,

            // This column is optional
            allowNull:true
        },

        // Defines the 'userId' column. This is a crucial column
        // It's  a foreign key that will link this productto a user in the 'users' table
        // This establishes a relationship : one user can have many products
        userId: {
            // The data type is an INTEGER
            type: DataTypes.INTEGER,

            // This column is required
            allowNull: false
        },

       
    },

    {
         // ===Model Options ====
        // Explicitly tell sequelize to use the 'products' table in the database
        tableName: 'products',

        // 'timestamps: true' automatically add two columns to our table
        timestamps: true,
    }
);

// Exporting the Product Model

export default Product;