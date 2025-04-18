import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from the root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "..", ".env");
dotenv.config({ path: envPath });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10),
};

console.log("Attempting to connect with config:", {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
});

async function columnExists(connection, tableName, columnName) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) as count 
     FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = ? 
     AND TABLE_NAME = ? 
     AND COLUMN_NAME = ?`,
    [dbConfig.database, tableName, columnName]
  );
  return rows[0].count > 0;
}

async function updateSchema() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected to database successfully!");

    // Start transaction
    await connection.beginTransaction();
    console.log("Transaction started");

    // Create reviews table
    console.log("Creating reviews table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        order_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255) NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_product_order (user_id, product_id, order_id),
        INDEX idx_user (user_id),
        INDEX idx_product (product_id),
        INDEX idx_order (order_id)
      )
    `);
    console.log("Reviews table created successfully");

    // Add review count and average rating to products table
    console.log("Adding review columns to products table...");

    // Check and add review_count column
    if (!(await columnExists(connection, "products", "review_count"))) {
      await connection.query(`
        ALTER TABLE products
        ADD COLUMN review_count INT DEFAULT 0
      `);
      console.log("Added review_count column");
    }

    // Check and add average_rating column
    if (!(await columnExists(connection, "products", "average_rating"))) {
      await connection.query(`
        ALTER TABLE products
        ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.00
      `);
      console.log("Added average_rating column");
    }

    // Commit transaction
    await connection.commit();
    console.log("Transaction committed successfully");

    console.log("Schema update completed successfully!");
  } catch (error) {
    // Rollback transaction on error
    if (connection) {
      await connection.rollback();
      console.error("Transaction rolled back due to error");
    }
    console.error("Error updating schema:", error);
    throw error;
  } finally {
    // Close connection
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

// Run the update
updateSchema()
  .then(() => {
    console.log("Schema update completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Schema update failed:", error);
    process.exit(1);
  });
