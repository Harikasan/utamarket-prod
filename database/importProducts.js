import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pool from "./db.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Category mapping
const categoryMap = {
  "product_apparel_info.json": "Apparel",
  "product_accessories_info.json": "Accessories",
  "product_spirit_gear_info.json": "Spirit Gear",
  "product_school_supplies.json": "School Supplies",
  "product_gifts_info.json": "Gifts",
};

async function importProducts() {
  let connection;
  try {
    // Get connection from pool
    connection = await pool.getConnection();
    console.log("Connected to database successfully");

    // Get all JSON files from constants directory
    const constantsDir = path.join(__dirname, "..", "constants");
    console.log(`Looking for JSON files in: ${constantsDir}`);

    const files = await fs.readdir(constantsDir);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    if (jsonFiles.length === 0) {
      throw new Error("No JSON files found in the constants directory");
    }

    console.log(`Found ${jsonFiles.length} JSON files to process`);

    // Process each JSON file
    for (const file of jsonFiles) {
      console.log(`\nProcessing ${file}...`);

      // Read and parse JSON file
      const filePath = path.join(constantsDir, file);
      const fileContent = await fs.readFile(filePath, "utf8");
      const products = JSON.parse(fileContent);

      // Get category ID
      const categoryName = categoryMap[file];
      if (!categoryName) {
        console.error(`No category mapping found for file: ${file}`);
        continue;
      }

      const [categoryRows] = await connection.execute(
        "SELECT id FROM categories WHERE category_name = ?",
        [categoryName]
      );

      if (categoryRows.length === 0) {
        console.error(`Category ${categoryName} not found in database`);
        continue;
      }

      const categoryId = categoryRows[0].id;

      // Insert products
      for (const product of products) {
        try {
          // Convert price from string to decimal
          const price = parseFloat(product.price.replace("$", ""));

          // Set image URL based on product ID from the JSON
          const imageUrl = `/images/product/${product.pid}.jpg`;

          // Prepare product data
          const productData = {
            name: product.product_name,
            description: product.product_description,
            price: price,
            category_id: categoryId,
            stock_quantity: 100, // Default stock quantity
            image_url: imageUrl,
            product_details: JSON.stringify(product.product_details),
            tags: JSON.stringify(product.tags),
            item_details: JSON.stringify(product.item_details),
          };

          // Insert product
          const [result] = await connection.execute(
            `INSERT INTO products (
              name, description, price, category_id, stock_quantity,
              image_url, product_details, tags, item_details
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              productData.name,
              productData.description,
              productData.price,
              productData.category_id,
              productData.stock_quantity,
              productData.image_url,
              productData.product_details,
              productData.tags,
              productData.item_details,
            ]
          );

          console.log(
            `Inserted product: ${product.product_name} with ID: ${result.insertId}`
          );
        } catch (error) {
          if (error.code === "ER_DUP_ENTRY") {
            console.log(
              `Product ${product.product_name} already exists, skipping...`
            );
          } else {
            console.error(
              `Error inserting product ${product.product_name}:`,
              error
            );
          }
        }
      }
    }

    console.log("\nProduct import completed successfully!");
  } catch (error) {
    console.error("Error during import:", error);
    process.exit(1); // Exit with error code if import fails
  } finally {
    if (connection) {
      await connection.release();
      console.log("Database connection closed");
    }
  }
}

// Run the import
importProducts().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
