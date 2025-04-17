import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import pool from "@/database/db.js";

// Helper function to get user ID from token
async function getUserId() {
  const cookieStore = cookies();
  const cookieList = await cookieStore;
  const token = cookieList.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "utamarket_secret_key_2024"
    );
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  let connection;
  try {
    const userId = await getUserId();
    if (!userId) {
      console.log("Authentication failed: No valid user ID");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.log("Authenticated user ID:", userId);

    console.log("Attempting database connection...");
    connection = await pool.getConnection();
    console.log("Database connection successful");

    // First verify the tables exist
    console.log("Verifying required tables...");
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME 
       FROM information_schema.tables 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME IN ('products', 'categories', 'ai_recommendation_logs')`,
      [process.env.DB_NAME]
    );
    console.log("Available tables:", tables);

    // Get recommended products based on user interactions
    console.log("Executing recommendations query for user:", userId);
    const [recommendations] = await connection.execute(
      `
      WITH PurchasedProducts AS (
        SELECT DISTINCT product_id
        FROM ai_recommendation_logs
        WHERE user_id = ?
        AND TRIM(interaction_type) = 'Purchase'
      ),
      RankedProducts AS (
        SELECT 
          p.*,
          c.category_name,
          arl.recommendation_time,
          CASE TRIM(arl.interaction_type)
            WHEN 'Purchase' THEN 4
            WHEN 'Add to Cart' THEN 3
            WHEN 'Wishlist' THEN 2
            WHEN 'View' THEN 1
          END as interaction_weight,
          ROW_NUMBER() OVER (
            PARTITION BY p.id 
            ORDER BY 
              CASE TRIM(arl.interaction_type)
                WHEN 'Purchase' THEN 4
                WHEN 'Add to Cart' THEN 3
                WHEN 'Wishlist' THEN 2
                WHEN 'View' THEN 1
              END DESC,
              arl.recommendation_time DESC
          ) as rn
        FROM ai_recommendation_logs arl
        JOIN products p ON arl.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE arl.user_id = ?
        AND arl.recommendation_time > DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND arl.product_id NOT IN (SELECT product_id FROM PurchasedProducts)
      )
      SELECT 
        id,
        name,
        description,
        price,
        category_name as category,
        stock_quantity,
        image_url,
        product_details,
        interaction_weight,
        recommendation_time
      FROM RankedProducts
      WHERE rn = 1
      ORDER BY interaction_weight DESC, recommendation_time DESC
      LIMIT 20
    `,
      [userId, userId]
    );
    console.log(
      "Query executed successfully. Found recommendations:",
      recommendations.length
    );

    // Process product details
    const processedRecommendations = recommendations.map((product) => {
      // Create a new object with all properties except product_details
      const { product_details, ...rest } = product;

      try {
        // Only parse if product_details is a string and not already an object
        const parsedDetails =
          typeof product_details === "string"
            ? JSON.parse(product_details)
            : product_details;

        return {
          ...rest,
          product_details: parsedDetails,
        };
      } catch (error) {
        console.error(
          `Error parsing product_details for product ${product.id}:`,
          error
        );
        return {
          ...rest,
          product_details: null,
        };
      }
    });

    return NextResponse.json(processedRecommendations);
  } catch (error) {
    console.error("Detailed error information:", {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: "Failed to fetch recommendations", error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}
