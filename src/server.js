// Express for routing and frontend -backend communication
// const express = require('express');   // It's a old version using require

// ES6 Modules
import express from "express";
import sequelize from "./database/connection.js";
import cors from "cors";

// Import the all models

// define in this way when u want to use the User model in this file
import User from "./database/models/user.model.js";
import Product from "./database/models/product.model.js";
import Cart from "./database/models/cart.model.js";
import CartItem from "./database/models/cart_item.model.js";
import Order from "./database/models/order.model.js";
import OrderItem from "./database/models/order_item.model.js";

// Associaltion
import "./database/association.js";

// // Or just import the file to ensure the model is registered with sequelize
// import "./database/models/user.model.js"

// Import Routes
import userRoutes from "./api/routes/user.routes.js";
import productRoutes from "./api/routes/product.routes.js";
import cartRoutes from "./api/routes/cart.routes.js";
import orderRoutes from "./api/routes/order.routes.js";

// Create the express application
const app = express();

// Middleware to parse JSON bodies
// Increase the JSON body size limit to 50mb
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Define the port the server will run on
const PORT = 3000;

// Enable CORS for requests from localhost:5173
app.use(
  cors({
    origin: "*", // Allow only your frontend to access the API
    methods: "GET, POST, PUT, DELETE", // Specify allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], //Allow Authorization header
  })
);

// A simple route to test if server is working
app.get("/", (req, res) => {
  res.send("Hello ! This is the backend server running");
});

// Set up APi Response
// For user-related routes,  we use the userRoutes module
app.use("/api/users", userRoutes);

// For product-related routes , we use the productRoutes module
app.use("/api/products", productRoutes);

// For cart-related routes , we use the cartRoutes
app.use("/api/cart", cartRoutes);

// For order-related routes, we directly require the order routes module.
app.use("/api/orders", orderRoutes);

// Test the database connection
console.log("Sequelize from server.js", sequelize);

// Function to connect to the databse and start the server

// Normal Function
// async function setupDatabaseAndServer() {
// try {
//     // Log the sequelize instance to verify it's correct
//     console.log("Sequelize instance from setupDatabaseAndServer",sequelize);

//     // Authenticate the database connection
//     sequelize.authenticate();
//     console.log("Database connection has been established successfully");

//     // Start the server
//     app.listen(PORT,() => {
//         console.log(`Server is running on http://localhost:${PORT}`);
//     })
// }catch (error) {
//     console.error("Unable to connect to the database or start the server");
//     console.error("Error details", error.message);
// }
// }

// Arrow Function
const setupDatabaseAndServer = async () => {
  try {
    // Log the sequelize instance to verify it's correct
    console.log("Sequelize instance from setupDatabaseAndServer", sequelize);

    // Authenticate the database connection
    await sequelize.authenticate();
    console.log("Database connection has been established successfully");

    // Sync models with the database
    await sequelize.sync();
    console.log("All models were synchronized successfully");

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database or start the server");
    console.error("Error details", error.message);
  }
};

setupDatabaseAndServer();
