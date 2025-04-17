import { NextResponse } from "next/server";
import pool from "../../../../database/db.js";

async function updateAIRecommendationLogs() {
  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Insert View interactions from browsing_history
    await connection.execute(`
      INSERT INTO ai_recommendation_logs (user_id, product_id, interaction_type, recommendation_time)
      SELECT 
        user_id,
        product_id,
        'View' as interaction_type,
        view_timestamp as recommendation_time
      FROM browsing_history
      WHERE view_timestamp > (NOW() - INTERVAL 1 HOUR)
    `);

    // 2. Insert Wishlist interactions
    await connection.execute(`
      INSERT INTO ai_recommendation_logs (user_id, product_id, interaction_type, recommendation_time)
      SELECT 
        user_id,
        product_id,
        'Wishlist' as interaction_type,
        created_at as recommendation_time
      FROM wishlists
      WHERE created_at > (NOW() - INTERVAL 1 HOUR)
    `);

    // 3. Insert Purchase interactions from completed orders
    await connection.execute(`
      INSERT INTO ai_recommendation_logs (user_id, product_id, interaction_type, recommendation_time)
      SELECT DISTINCT
        c.user_id,
        ci.product_id,
        'Purchase' as interaction_type,
        c.updated_at as recommendation_time
      FROM carts c
      JOIN cart_items ci ON c.id = ci.cart_id
      WHERE c.status = 'converted_to_order'
      AND c.updated_at > (NOW() - INTERVAL 1 HOUR)
    `);

    // 4. Insert Add to Cart interactions from active carts
    await connection.execute(`
      INSERT INTO ai_recommendation_logs (user_id, product_id, interaction_type, recommendation_time)
      SELECT DISTINCT
        c.user_id,
        ci.product_id,
        'Add to Cart' as interaction_type,
        ci.created_at as recommendation_time
      FROM carts c
      JOIN cart_items ci ON c.id = ci.cart_id
      WHERE c.status = 'active'
      AND ci.created_at > (NOW() - INTERVAL 1 HOUR)
    `);

    return true;
  } catch (error) {
    console.error("Error updating AI recommendation logs:", error);
    return false;
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}

// This variable helps us prevent too frequent updates
let lastUpdateTime = 0;
const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function GET() {
  try {
    const currentTime = Date.now();

    // Only update if enough time has passed since the last update
    if (currentTime - lastUpdateTime > UPDATE_INTERVAL) {
      const success = await updateAIRecommendationLogs();
      lastUpdateTime = currentTime;

      if (success) {
        return NextResponse.json({ message: "AI logs updated successfully" });
      } else {
        return NextResponse.json(
          { message: "Failed to update AI logs" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json({
        message: "Update skipped - too soon since last update",
        nextUpdateIn: UPDATE_INTERVAL - (currentTime - lastUpdateTime),
      });
    }
  } catch (error) {
    console.error("Error in AI logs update endpoint:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
