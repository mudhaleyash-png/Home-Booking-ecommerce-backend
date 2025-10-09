// This line imports the main `Sequelize` library.
// The library provides an Object-Relational Mapper (ORM) for Node.js,
// which allows you to interact with a database using JavaScript objects instead of raw SQL queries.
// import Sequelize from "sequelize";

// // This line imports the `dotenv` library.
// import dotenv from "dotenv";
// // This line calls the `config()` method on `dotenv`.
// // This loads environment variables from a `.env` file into `process.env`.
// // Environment variables are used to store sensitive information (like database credentials)
// // outside of the main codebase for security and easier configuration management.
// dotenv.config();

// // These lines access the environment variables that were loaded from the `.env` file.
// // The values from the `.env` file are assigned to these JavaScript constants.
// // For example, `process.env.DB_DATABASE` gets the value of the `DB_DATABASE` variable.
// const database = process.env.DB_DATABASE;
// const username = process.env.DB_USERNAME;
// const password = process.env.DB_PASSWORD;
// const host = process.env.DB_HOST;

// // This line creates a new `Sequelize` instance, which establishes the connection to the database.
// // The constructor takes the database name, username, and password as the first three arguments.
// // The fourth argument is an options object.
// const sequelize = new sequelize(, {
//   // `host: host` specifies the database server's address.
//   host: host,
//   // `dialect: "postgres"` tells Sequelize which type of database you are connecting to.
//   // In this case, it's PostgreSQL. Other options include 'mysql', 'sqlite', etc.
//   dialect: "postgres",
// });

// // This line logs the `sequelize` object to the console.
// // This is typically used for debugging to confirm that the instance has been created correctly
// // and to see its properties.
// console.log("Sequelize from connection.js", sequelize);

// // This line exports the `sequelize` instance.
// // The `export default` statement makes the `sequelize` object available for other files
// // to import and use for database operations (e.g., in a service layer or model definitions).
// export default sequelize;


//==== For NENON DB ====/
import Sequelize from "sequelize";

// This line imports the `dotenv` library.
import dotenv from "dotenv";
// This line calls the `config()` method on `dotenv`.
// This loads environment variables from a `.env` file into `process.env`.
// Environment variables are used to store sensitive information (like database credentials)
// outside of the main codebase for security and easier configuration management.
dotenv.config();

// These lines access the environment variables that were loaded from the `.env` file.
// The values from the `.env` file are assigned to these JavaScript constants.
// For example, `process.env.DB_DATABASE` gets the value of the `DB_DATABASE` variable.
const nenobd_url = process.env.DATABASE_URL;

// This line creates a new `Sequelize` instance, which establishes the connection to the database.
// The constructor takes the database name, username, and password as the first three arguments.
// The fourth argument is an options object.
const sequelize = new Sequelize(nenobd_url, {
  // `dialect: "postgres"` tells Sequelize which type of database you are connecting to.
  // In this case, it's PostgreSQL. Other options include 'mysql', 'sqlite', etc.
  dialect: "postgres",
  logging: false
});

// This line logs the `sequelize` object to the console.
// This is typically used for debugging to confirm that the instance has been created correctly
// and to see its properties.
console.log("Sequelize from connection.js", sequelize);

// This line exports the `sequelize` instance.
// The `export default` statement makes the `sequelize` object available for other files
// to import and use for database operations (e.g., in a service layer or model definitions).
export default sequelize;