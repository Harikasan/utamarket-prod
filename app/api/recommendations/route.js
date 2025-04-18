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

    // Get recommended products based on user interactions and product similarities
    console.log("Executing recommendations query for user:", userId);
    const [recommendations] = await connection.execute(
      `
      WITH UserInteractionStats AS (
        -- Calculate user's interaction statistics
        SELECT 
          COUNT(*) as total_interactions,
          COUNT(DISTINCT product_id) as unique_products,
          COUNT(DISTINCT CASE WHEN interaction_type = 'Purchase' THEN product_id END) as purchased_products,
          COUNT(DISTINCT CASE WHEN interaction_type = 'Wishlist' THEN product_id END) as wishlisted_products,
          COUNT(DISTINCT CASE WHEN interaction_type = 'Add to Cart' THEN product_id END) as carted_products,
          COUNT(DISTINCT CASE WHEN interaction_type = 'View' THEN product_id END) as viewed_products,
          MAX(recommendation_time) as last_interaction_time
        FROM ai_recommendation_logs
        WHERE user_id = ?
      ),
      UserCategoryPreferences AS (
        -- Calculate user's category preferences
        SELECT 
          p.category_id,
          COUNT(*) as interaction_count,
          COUNT(DISTINCT CASE WHEN arl.interaction_type = 'Purchase' THEN arl.product_id END) as purchase_count,
          COUNT(DISTINCT CASE WHEN arl.interaction_type = 'Wishlist' THEN arl.product_id END) as wishlist_count,
          MAX(arl.recommendation_time) as last_category_interaction
        FROM ai_recommendation_logs arl
        JOIN products p ON arl.product_id = p.id
        WHERE arl.user_id = ?
        GROUP BY p.category_id
      ),
      UserInteractions AS (
        -- Get detailed user interactions with products
        SELECT 
          p.id as product_id,
          p.category_id,
          JSON_UNQUOTE(JSON_EXTRACT(p.item_details, '$.Color')) as color,
          JSON_UNQUOTE(JSON_EXTRACT(p.item_details, '$.Size')) as size,
          MAX(
            CASE TRIM(arl.interaction_type)
              WHEN 'Purchase' THEN 4
              WHEN 'Add to Cart' THEN 3
              WHEN 'Wishlist' THEN 2
              WHEN 'View' THEN 1
            END
          ) as max_interaction_weight,
          MAX(arl.recommendation_time) as last_interaction_time,
          COUNT(*) as interaction_count,
          COUNT(DISTINCT CASE WHEN arl.interaction_type = 'Purchase' THEN 1 END) as purchase_count
        FROM ai_recommendation_logs arl
        JOIN products p ON arl.product_id = p.id
        WHERE arl.user_id = ?
        AND arl.recommendation_time > DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY p.id, p.category_id, color, size
      ),
      SimilarProducts AS (
        -- Find similar products with enhanced scoring
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price,
          c.category_name as category,
          p.stock_quantity,
          p.image_url,
          p.item_details,
          ui.max_interaction_weight,
          ui.last_interaction_time,
          -- Calculate enhanced similarity score
          (
            -- Category preference (40% weight)
            CASE 
              WHEN p.category_id = ui.category_id THEN 
                0.4 * (1 + COALESCE(ucp.purchase_count, 0) * 0.2) -- Boost for preferred categories
              ELSE 0 
            END +
            -- Color match (25% weight)
            CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(p.item_details, '$.Color')) = ui.color THEN 0.25 ELSE 0 END +
            -- Size match (15% weight)
            CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(p.item_details, '$.Size')) = ui.size THEN 0.15 ELSE 0 END +
            -- Recent interaction boost (10% weight)
            CASE WHEN ui.last_interaction_time > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 0.1 ELSE 0 END +
            -- Purchase history boost (10% weight)
            CASE WHEN ui.purchase_count > 0 THEN 0.1 ELSE 0 END
          ) as similarity_score,
          -- Calculate user engagement score
          CASE 
            WHEN uis.total_interactions > 50 THEN 1.0 -- Experienced user
            WHEN uis.total_interactions > 20 THEN 0.8 -- Intermediate user
            WHEN uis.total_interactions > 5 THEN 0.6  -- New user
            ELSE 0.4 -- Very new user
          END as user_engagement_score
        FROM products p
        JOIN categories c ON p.category_id = c.id
        CROSS JOIN UserInteractions ui
        CROSS JOIN UserInteractionStats uis
        LEFT JOIN UserCategoryPreferences ucp ON p.category_id = ucp.category_id
        WHERE p.id NOT IN (SELECT product_id FROM UserInteractions)
        AND p.stock_quantity > 0
      ),
      RankedProducts AS (
        -- Rank products with dynamic weights based on user engagement
        SELECT 
          *,
          ROW_NUMBER() OVER (
            PARTITION BY id 
            ORDER BY 
              (
                (max_interaction_weight * 0.6 + similarity_score * 0.4) * 
                (0.7 + (user_engagement_score * 0.3))
              ) DESC,
              last_interaction_time DESC
          ) as rn
        FROM SimilarProducts
      )
      SELECT 
        id,
        name,
        description,
        price,
        category,
        stock_quantity,
        image_url,
        item_details,
        max_interaction_weight as interaction_weight,
        last_interaction_time as recommendation_time,
        similarity_score,
        user_engagement_score
      FROM RankedProducts
      WHERE rn = 1
      ORDER BY 
        (
          (max_interaction_weight * 0.6 + similarity_score * 0.4) * 
          (0.7 + (user_engagement_score * 0.3))
        ) DESC,
        last_interaction_time DESC
      LIMIT 20
    `,
      [userId, userId, userId]
    );
    console.log(
      "Query executed successfully. Found recommendations:",
      recommendations.length
    );

    // Process product details
    const processedRecommendations = recommendations.map((product) => {
      const { item_details, ...rest } = product;

      try {
        const parsedDetails =
          typeof item_details === "string"
            ? JSON.parse(item_details)
            : item_details;

        return {
          ...rest,
          itemDetails: parsedDetails,
        };
      } catch (error) {
        console.error(
          `Error parsing item_details for product ${product.id}:`,
          error
        );
        return {
          ...rest,
          itemDetails: null,
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
