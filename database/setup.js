const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
// Debug logging
console.log("Current working directory:", process.cwd());
console.log("Environment variables loaded:", {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
  DB_PASSWORD: process.env.DB_PASSWORD ? "***" : "undefined",
});

const mysql = require("mysql2/promise");
const fs = require("fs").promises;

async function setupDatabase() {
  let connection;

  try {
    // Log the connection details (without password)
    console.log("Attempting to connect with:", {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
    });

    // First connect without database to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true,
    });

    console.log("Connected to MySQL server");

    // Create database if it doesn't exist
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "utamarket"}`
    );
    console.log("Database created or already exists");

    // Switch to the database
    await connection.query(`USE ${process.env.DB_NAME || "utamarket"}`);
    console.log("Using database:", process.env.DB_NAME || "utamarket");

    // Read the schema file
    const schemaPath = path.join(__dirname, "schema.sql");
    console.log("Reading schema from:", schemaPath);
    const schema = await fs.readFile(schemaPath, "utf8");

    // Execute the schema
    await connection.query(schema);
    console.log("Database schema executed successfully");

    // Check if categories already exist
    const [existingCategories] = await connection.query(
      "SELECT category_name FROM categories"
    );
    const existingCategoryNames = existingCategories.map(
      (cat) => cat.category_name
    );

    // Define categories to add
    const categories = [
      "Apparel",
      "Accessories",
      "Spirit Gear",
      "School Supplies",
      "Gifts",
    ];

    // Filter out categories that already exist
    const categoriesToAdd = categories.filter(
      (cat) => !existingCategoryNames.includes(cat)
    );

    if (categoriesToAdd.length > 0) {
      // Prepare values for insertion
      const values = categoriesToAdd.map((cat) => [cat, new Date()]);

      // Insert new categories
      await connection.query(
        "INSERT INTO categories (category_name, created_at) VALUES ?",
        [values]
      );
      console.log(
        `Added ${categoriesToAdd.length} new categories:`,
        categoriesToAdd
      );
    } else {
      console.log("All categories already exist in the database");
    }

    // Verify final categories
    const [finalCategories] = await connection.query(
      "SELECT category_name FROM categories ORDER BY category_name"
    );
    console.log("\nCurrent categories in database:");
    finalCategories.forEach((cat) => console.log(`- ${cat.category_name}`));
  } catch (error) {
    console.error("\nError details:");
    console.error("Code:", error.code);
    console.error("Message:", error.message);

    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error(
        "\nAccess denied. Please check your database credentials in .env file:"
      );
      console.error("1. Make sure MySQL is running");
      console.error(
        "2. Verify DB_USER is correct (currently:",
        process.env.DB_USER || "root",
        ")"
      );
      console.error("3. Verify DB_PASSWORD is correct");
      console.error("4. Ensure the user has sufficient privileges");
    } else if (error.code === "ECONNREFUSED") {
      console.error("\nCould not connect to MySQL server:");
      console.error("1. Make sure MySQL is running");
      console.error(
        "2. Verify DB_HOST is correct (currently:",
        process.env.DB_HOST,
        ")"
      );
      console.error("3. Check if MySQL is running on the default port (3306)");
    } else if (error.code === "ER_DB_CREATE_EXISTS") {
      console.log("Database already exists, continuing with setup...");
    } else if (error.code === "ER_TABLE_EXISTS_ERROR") {
      console.log("Tables already exist, continuing with setup...");
    } else {
      console.error("Error setting up database:", error.message);
      if (error.sqlMessage) {
        console.error("SQL Error:", error.sqlMessage);
      }
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log("\nDatabase connection closed");
    }
  }
}

// Run the setup
setupDatabase();
