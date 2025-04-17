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
      if (decoded.email !== "admin@mavs.uta.edu" || decoded.name !== "admin") {
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
      if (decoded.email !== "admin@mavs.uta.edu" || decoded.name !== "admin") {
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

    // Start transaction
    await connection.beginTransaction();

    try {
      // First, delete related records in other tables
      await connection.query("DELETE FROM orders WHERE user_id = ?", [userId]);
      await connection.query("DELETE FROM cart_items WHERE user_id = ?", [
        userId,
      ]);
      await connection.query("DELETE FROM wishlist WHERE user_id = ?", [
        userId,
      ]);

      // Finally, delete the user
      await connection.query("DELETE FROM users WHERE id = ?", [userId]);

      // Commit transaction
      await connection.commit();

      return NextResponse.json({ success: true });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error deleting user:", error);
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
