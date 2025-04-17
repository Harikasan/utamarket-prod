const pool = require("./database/db.js");

async function getProduct() {
  let connection;
  try {
    // Get connection from pool
    connection = await pool.getConnection();
    console.log("Connected to database successfully");

    // Get one product from the products table
    const [products] = await connection.execute(
      `SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.item_details,
        p.product_details,
        c.category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LIMIT 1`
    );

    if (products.length === 0) {
      console.log("No products found in the database");
      return;
    }

    const product = products[0];
    console.log("\nProduct Details:");
    console.log("---------------");
    console.log(`ID: ${product.id}`);
    console.log(`Name: ${product.name}`);
    console.log(`Description: ${product.description}`);
    console.log(`Price: $${product.price}`);
    console.log(`Category: ${product.category_name}`);
    console.log(`Image URL: ${product.image_url}`);

    // Function to safely get object from either JSON string or object
    const safeGetObject = (value) => {
      if (!value) return null;
      if (typeof value === "object") return value;
      try {
        return JSON.parse(value);
      } catch (e) {
        return null;
      }
    };

    // Handle item_details
    const itemDetails = safeGetObject(product.item_details);
    if (itemDetails) {
      console.log("\nItem Details:");
      console.log(JSON.stringify(itemDetails, null, 2));
    } else {
      console.log("\nNo valid item details available");
    }

    // Handle product_details
    const productDetails = safeGetObject(product.product_details);
    if (productDetails) {
      console.log("\nProduct Details:");
      console.log(JSON.stringify(productDetails, null, 2));
    } else {
      console.log("\nNo valid product details available");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    if (connection) {
      await connection.release();
      console.log("\nDatabase connection closed");
    }
  }
}

// Execute the function
getProduct();
