import pool from "./db.js";

async function createProductSizesTable() {
  let connection;
  try {
    // Get connection from pool
    connection = await pool.getConnection();
    console.log("Connected to database successfully");

    // Create product_sizes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS product_sizes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        size VARCHAR(10) NOT NULL,
        stock_quantity INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_product_size (product_id, size)
      )
    `);
    console.log("Product sizes table created successfully");

    // Add indexes one at a time
    try {
      await connection.execute(
        "CREATE INDEX idx_product_id ON product_sizes(product_id)"
      );
      console.log("Created index on product_id");

      await connection.execute("CREATE INDEX idx_size ON product_sizes(size)");
      console.log("Created index on size");
    } catch (indexError) {
      // If indexes already exist, that's fine
      if (indexError.code === "ER_DUP_KEYNAME") {
        console.log("Indexes already exist, skipping creation");
      } else {
        throw indexError;
      }
    }
  } catch (error) {
    console.error("Error creating product sizes table:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.release();
      console.log("Database connection closed");
    }
  }
}

// Run the function
createProductSizesTable().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
