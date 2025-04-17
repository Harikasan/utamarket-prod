import { NextResponse } from "next/server";
import pool from "@/database/db.js";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(request) {
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

    const connection = await pool.getConnection();

    try {
      // Get total users
      const [userRows] = await connection.query(
        "SELECT COUNT(*) as total FROM users"
      );
      const totalUsers = Number(userRows[0].total);

      // Get total orders and revenue
      const [orderStats] = await connection.query(`
        SELECT 
          COUNT(*) as totalOrders,
          COALESCE(SUM(total_amount), 0) as totalRevenue
        FROM orders
      `);

      // Get total products
      const [productRows] = await connection.query(
        "SELECT COUNT(*) as total FROM products"
      );
      const totalProducts = Number(productRows[0].total);

      // Get monthly revenue
      const [monthlyRevenue] = await connection.query(`
        SELECT COALESCE(SUM(total_amount), 0) as monthly
        FROM orders
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      `);

      // Calculate average order value
      const totalOrders = Number(orderStats[0].totalOrders);
      const totalRevenue = Number(orderStats[0].totalRevenue);
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get recent orders
      const [recentOrders] = await connection.query(`
        SELECT 
          o.id,
          u.name as customer_name,
          o.created_at,
          o.status,
          o.total_amount
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 10
      `);

      // Convert numeric values in recent orders
      const formattedRecentOrders = recentOrders.map((order) => ({
        ...order,
        total_amount: Number(order.total_amount),
      }));

      return NextResponse.json({
        totalUsers,
        totalOrders,
        totalRevenue,
        totalProducts,
        monthlyRevenue: Number(monthlyRevenue[0].monthly),
        averageOrderValue,
        recentOrders: formattedRecentOrders,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
