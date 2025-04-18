import { NextResponse } from "next/server";
import pool from "@/database/db";
import jwt from "jsonwebtoken";

// Helper function to get user from JWT token
async function getCurrentUser(request) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "utamarket_secret_key_2024"
    );
    return decoded;
  } catch (error) {
    return null;
  }
}

// Helper function to update product rating
async function updateProductRating(productId) {
  try {
    // Calculate average rating
    const [result] = await pool.query(
      `
      SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as review_count
      FROM product_reviews
      WHERE product_id = ?
    `,
      [productId]
    );

    const averageRating = result[0].average_rating || 0;
    const reviewCount = result[0].review_count || 0;

    return { averageRating, reviewCount };
  } catch (error) {
    console.error("Error calculating product rating:", error);
    throw error;
  }
}

// GET /api/reviews?productId=123
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const [reviews] = await pool.query(
      `
      SELECT 
        pr.*,
        u.name as user_name,
        u.student_id
      FROM product_reviews pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.product_id = ?
      ORDER BY pr.created_at DESC
    `,
      [productId]
    );

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/reviews
export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, orderId, rating, reviewText } = await request.json();

    if (!productId || !orderId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify that the user has purchased the product
    const [order] = await pool.query(
      `
      SELECT o.id FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ? AND o.user_id = ? AND oi.product_id = ?
    `,
      [orderId, user.userId, productId]
    );

    if (!order.length) {
      return NextResponse.json(
        { error: "You can only review products you have purchased" },
        { status: 403 }
      );
    }

    // Check if user has already reviewed this product for this order
    const [existingReview] = await pool.query(
      `
      SELECT id FROM product_reviews
      WHERE user_id = ? AND product_id = ? AND order_id = ?
    `,
      [user.userId, productId, orderId]
    );

    if (existingReview.length) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Insert the review
    const [result] = await pool.query(
      `
      INSERT INTO product_reviews (user_id, product_id, order_id, rating, review_text)
      VALUES (?, ?, ?, ?, ?)
    `,
      [user.userId, productId, orderId, rating, reviewText]
    );

    // Update product rating
    const { averageRating, reviewCount } = await updateProductRating(productId);

    return NextResponse.json({
      message: "Review added successfully",
      reviewId: result.insertId,
      averageRating,
      reviewCount,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json(
      { error: "Failed to add review" },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews?reviewId=123
export async function DELETE(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    // Get product ID before deleting
    const [review] = await pool.query(
      `
      SELECT product_id FROM product_reviews
      WHERE id = ? AND user_id = ?
    `,
      [reviewId, user.userId]
    );

    if (!review.length) {
      return NextResponse.json(
        { error: "Review not found or unauthorized" },
        { status: 404 }
      );
    }

    const productId = review[0].product_id;

    // Delete the review
    await pool.query("DELETE FROM product_reviews WHERE id = ?", [reviewId]);

    // Update product rating
    const { averageRating, reviewCount } = await updateProductRating(productId);

    return NextResponse.json({
      message: "Review deleted successfully",
      averageRating,
      reviewCount,
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
