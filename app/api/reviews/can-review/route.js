import { NextResponse } from "next/server";
import pool from "@/database/db.js";

export async function GET(request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId");

    if (!productId || !userId) {
      return NextResponse.json(
        { error: "Product ID and User ID are required" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Check if user has purchased the product
    const [hasPurchased] = await connection.query(
      `SELECT 1 
       FROM order_items oi 
       JOIN orders o ON oi.order_id = o.id 
       WHERE o.user_id = ? AND oi.product_id = ? 
       LIMIT 1`,
      [userId, productId]
    );

    // Check if user has already reviewed this product
    const [hasReviewed] = await connection.query(
      `SELECT 1 FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1`,
      [userId, productId]
    );

    return NextResponse.json({
      canReview: hasPurchased.length > 0 && hasReviewed.length === 0,
    });
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check review eligibility" },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
