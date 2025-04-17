import { NextResponse } from "next/server";
import pool from "@/database/db.js";

export async function GET() {
  let connection;
  try {
    // Get connection from pool
    connection = await pool.getConnection();

    // First, check if there are any products with sales
    const [salesCheck] = await connection.execute(
      "SELECT COUNT(*) as count FROM products WHERE total_sales > 0"
    );

    let query;
    if (salesCheck[0].count > 0) {
      // If there are products with sales, get top 8 best-selling products
      query = `
        SELECT 
          p.id,
          p.name,
          p.description,
          CAST(p.price AS DECIMAL(10,2)) as price,
          p.image_url,
          p.total_sales,
          p.stock_quantity,
          c.category_name as category,
          (SELECT COUNT(*) FROM ai_recommendation_logs WHERE product_id = p.id) as interaction_count
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.total_sales > 0
        ORDER BY p.total_sales DESC, interaction_count DESC
        LIMIT 8
      `;
    } else {
      // If no sales, get 8 random products
      query = `
        SELECT 
          p.id,
          p.name,
          p.description,
          CAST(p.price AS DECIMAL(10,2)) as price,
          p.image_url,
          p.total_sales,
          p.stock_quantity,
          c.category_name as category,
          (SELECT COUNT(*) FROM ai_recommendation_logs WHERE product_id = p.id) as interaction_count
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY RAND()
        LIMIT 8
      `;
    }

    const [products] = await connection.execute(query);

    // Calculate discounts and format response
    const formattedProducts = products.map((product) => {
      const price = parseFloat(product.price);
      const originalPrice = price * 1.2; // 20% markup for original price
      const discount = Math.round(
        ((originalPrice - price) / originalPrice) * 100
      );

      return {
        id: product.id,
        name: product.name,
        category: product.category,
        price: price,
        originalPrice: originalPrice,
        discount: discount,
        image: product.image_url || "https://via.placeholder.com/300",
        rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5 and 5
        reviewCount: Math.floor(50 + Math.random() * 200), // Random review count between 50 and 250
        isNew: product.interaction_count < 10, // Consider product new if it has less than 10 interactions
        stockQuantity: product.stock_quantity,
        totalSales: product.total_sales,
      };
    });

    return NextResponse.json({
      products: formattedProducts,
      hasSales: salesCheck[0].count > 0,
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return NextResponse.json(
      { message: "Failed to fetch featured products" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}
