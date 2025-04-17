import { NextResponse } from "next/server";
import pool from "@/database/db.js";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

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

    // Get total orders and revenue
    const [orderStats] = await connection.query(`
      SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(total_amount), 0) as totalRevenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingOrders
      FROM orders
    `);

    // Calculate average order value
    const totalOrders = Number(orderStats[0].totalOrders);
    const totalRevenue = Number(orderStats[0].totalRevenue);
    const pendingOrders = Number(orderStats[0].pendingOrders);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get recent orders with all necessary fields
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
      totalOrders,
      totalRevenue,
      averageOrderValue,
      pendingOrders,
      recentOrders: formattedRecentOrders,
    });
  } catch (error) {
    console.error("Orders API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    // Always release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
}

export async function PUT(request) {
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

    const data = await request.json();
    const { orderId, status } = data;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Get connection from pool
    connection = await pool.getConnection();

    // Update order status
    await connection.query(
      `UPDATE orders 
       SET status = ?, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, orderId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating order:", error);
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
