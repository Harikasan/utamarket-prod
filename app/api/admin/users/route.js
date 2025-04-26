import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import pool from "@/database/db.js";

export async function GET(request) {
  let connection;
  try {
    // Simple auth check using JWT token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token" },
        { status: 401 }
      );
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token.value, process.env.JWT_SECRET);

      // Check if user is admin
      if (decoded.name !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized - Admin access required" },
          { status: 403 }
        );
      }
    } catch (err) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Get connection from pool
    connection = await pool.getConnection();

    // Get all users with their details
    const [users] = await connection.query(`
      SELECT 
        id,
        name,
        email,
        student_id,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    // Get total users count
    const [totalUsersResult] = await connection.query(`
      SELECT COUNT(*) as total
      FROM users
    `);

    // Get new users this month
    const [newUsersResult] = await connection.query(`
      SELECT COUNT(*) as total
      FROM users
      WHERE MONTH(created_at) = MONTH(CURRENT_DATE())
      AND YEAR(created_at) = YEAR(CURRENT_DATE())
    `);

    // Get active users (users who have placed orders in the last 30 days)
    const [activeUsersResult] = await connection.query(`
      SELECT COUNT(DISTINCT user_id) as total
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const stats = {
      totalUsers: Number(totalUsersResult[0].total),
      newUsersThisMonth: Number(newUsersResult[0].total),
      activeUsers: Number(activeUsersResult[0].total),
    };

    return NextResponse.json({
      users,
      stats,
    });
  } catch (error) {
    console.error("Error in users API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    // Always release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
}

export async function DELETE(request) {
  let connection;
  try {
    // Simple auth check using JWT token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token" },
        { status: 401 }
      );
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token.value, process.env.JWT_SECRET);

      // Check if user is admin
      if (decoded.name !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized - Admin access required" },
          { status: 403 }
        );
      }
    } catch (err) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Get userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get connection from pool
    connection = await pool.getConnection();
    console.log("Database connection established");

    // Start transaction
    await connection.beginTransaction();
    console.log("Transaction started");

    try {
      // Log the deletion process
      console.log(`Starting deletion process for user ${userId}`);

      // First, delete related records in other tables
      console.log("Deleting related records...");

      // Delete from support_chat_messages
      await connection.query(
        "DELETE FROM support_chat_messages WHERE sender_id = ? OR receiver_id = ?",
        [userId, userId]
      );
      console.log("Deleted support chat messages");

      // Delete from support_chat_sessions
      await connection.query(
        "DELETE FROM support_chat_sessions WHERE user_id = ?",
        [userId]
      );
      console.log("Deleted support chat sessions");

      // Delete from product_reviews
      await connection.query("DELETE FROM product_reviews WHERE user_id = ?", [
        userId,
      ]);
      console.log("Deleted product reviews");

      // Delete from browsing_history
      await connection.query("DELETE FROM browsing_history WHERE user_id = ?", [
        userId,
      ]);
      console.log("Deleted browsing history");

      // Delete from ai_recommendation_logs
      await connection.query(
        "DELETE FROM ai_recommendation_logs WHERE user_id = ?",
        [userId]
      );
      console.log("Deleted AI recommendation logs");

      // Delete from payments
      await connection.query("DELETE FROM payments WHERE user_id = ?", [
        userId,
      ]);
      console.log("Deleted payments");

      // Delete from order_items (through orders)
      await connection.query(
        "DELETE oi FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.user_id = ?",
        [userId]
      );
      console.log("Deleted order items");

      // Delete from orders
      await connection.query("DELETE FROM orders WHERE user_id = ?", [userId]);
      console.log("Deleted orders");

      // Delete from carts first
      await connection.query("DELETE FROM carts WHERE user_id = ?", [userId]);
      console.log("Deleted carts and associated cart items");

      // Delete from wishlist
      await connection.query("DELETE FROM wishlists WHERE user_id = ?", [
        userId,
      ]);
      console.log("Deleted wishlist items");

      // Delete from user_profiles
      await connection.query("DELETE FROM user_profiles WHERE user_id = ?", [
        userId,
      ]);
      console.log("Deleted user profile");

      // Finally, delete the user
      await connection.query("DELETE FROM users WHERE id = ?", [userId]);
      console.log("Deleted user");

      // Commit transaction
      await connection.commit();
      console.log("Transaction committed successfully");

      return NextResponse.json({ success: true });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      console.error("Error during deletion, rolling back transaction:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in DELETE route:", error);
    return NextResponse.json(
      {
        error: "Failed to delete user",
        details: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  } finally {
    // Always release the connection back to the pool
    if (connection) {
      connection.release();
      console.log("Database connection released");
    }
  }
}
