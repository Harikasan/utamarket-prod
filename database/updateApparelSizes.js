import pool from "./db.js";

// Standard size options for different departments
const sizeOptions = {
  mens: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
  womens: ["XS", "S", "M", "L", "XL", "2XL"],
  unisex: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
};

async function updateApparelSizes() {
  let connection;
  try {
    // Get connection from pool
    connection = await pool.getConnection();
    console.log("Connected to database successfully");

    // Get all apparel products
    const [products] = await connection.execute(`
      SELECT p.id, p.item_details, c.category_name 
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE c.category_name = 'Apparel'
    `);

    console.log(`Found ${products.length} apparel products`);

    // Process each product
    for (const product of products) {
      try {
        // Handle both JSON strings and JavaScript objects
        let itemDetails;
        if (typeof product.item_details === "string") {
          itemDetails = JSON.parse(product.item_details);
        } else {
          itemDetails = product.item_details;
        }

        const department = itemDetails.Department || "unisex";
        const sizes = sizeOptions[department] || sizeOptions.unisex;

        // Insert size options for the product
        for (const size of sizes) {
          try {
            await connection.execute(
              "INSERT INTO product_sizes (product_id, size, stock_quantity) VALUES (?, ?, ?)",
              [product.id, size, 10] // Default stock of 10 for each size
            );
            console.log(`Added size ${size} for product ID ${product.id}`);
          } catch (error) {
            if (error.code === "ER_DUP_ENTRY") {
              console.log(
                `Size ${size} already exists for product ID ${product.id}`
              );
            } else {
              throw error;
            }
          }
        }

        // Update item_details to include size field
        itemDetails.Size = sizes.join(",");
        await connection.execute(
          "UPDATE products SET item_details = ? WHERE id = ?",
          [JSON.stringify(itemDetails), product.id]
        );
        console.log(`Updated item_details for product ID ${product.id}`);
      } catch (error) {
        console.error(`Error processing product ID ${product.id}:`, error);
      }
    }

    console.log("\nSize update completed successfully!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.release();
      console.log("Database connection closed");
    }
  }
}

// Run the function
updateApparelSizes().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
