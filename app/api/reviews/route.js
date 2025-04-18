import { NextResponse } from "next/server";
import pool from "@/database/db.js";

export async function GET(request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    const [reviews] = await connection.query(
      `SELECT r.*, u.name as userName 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = ? 
       ORDER BY r.created_at DESC`,
      [productId]
    );

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

export async function POST(request) {
  let connection;
  try {
    const { productId, userId, rating, title, comment } = await request.json();

    if (!productId || !userId || !rating || !title || !comment) {
      return NextResponse.json(
        { error: "All fields are required" },
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

    if (!hasPurchased.length) {
      return NextResponse.json(
        { error: "You can only review products you have purchased" },
        { status: 403 }
      );
    }

    // Check if user has already reviewed this product
    const [existingReview] = await connection.query(
      `SELECT 1 FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1`,
      [userId, productId]
    );

    if (existingReview.length) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Get the order ID for this purchase
    const [order] = await connection.query(
      `SELECT o.id 
       FROM orders o 
       JOIN order_items oi ON o.id = oi.order_id 
       WHERE o.user_id = ? AND oi.product_id = ? 
       ORDER BY o.created_at DESC 
       LIMIT 1`,
      [userId, productId]
    );

    if (!order.length) {
      return NextResponse.json(
        { error: "No purchase found for this product" },
        { status: 400 }
      );
    }

    // Insert the review
    await connection.query(
      `INSERT INTO reviews (user_id, product_id, order_id, rating, title, comment) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, productId, order[0].id, rating, title, comment]
    );

    // Update product review count and average rating
    await connection.query(
      `UPDATE products 
       SET review_count = review_count + 1,
           average_rating = (
             SELECT AVG(rating) 
             FROM reviews 
             WHERE product_id = ?
           )
       WHERE id = ?`,
      [productId, productId]
    );

    return NextResponse.json({ message: "Review submitted successfully" });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

export async function DELETE(request) {
  let connection;
  try {
    const { reviewId, userId } = await request.json();

    if (!reviewId || !userId) {
      return NextResponse.json(
        { error: "Review ID and User ID are required" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Check if review exists and belongs to the user
    const [review] = await connection.query(
      `SELECT product_id FROM reviews WHERE id = ? AND user_id = ?`,
      [reviewId, userId]
    );

    if (!review.length) {
      return NextResponse.json(
        { error: "Review not found or unauthorized" },
        { status: 404 }
      );
    }

    const productId = review[0].product_id;

    // Delete the review
    await connection.query(`DELETE FROM reviews WHERE id = ? AND user_id = ?`, [
      reviewId,
      userId,
    ]);

    // Update product review count and average rating
    await connection.query(
      `UPDATE products 
       SET review_count = (
         SELECT COUNT(*) 
         FROM reviews 
         WHERE product_id = ?
       ),
       average_rating = (
         SELECT COALESCE(AVG(rating), 0) 
         FROM reviews 
         WHERE product_id = ?
       )
       WHERE id = ?`,
      [productId, productId, productId]
    );

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
