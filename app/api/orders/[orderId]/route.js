import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import pool from "@/database/db.js";

export async function GET(request, { params }) {
  let connection;
  try {
    // Get user ID from JWT token
    const cookieStore = await cookies();
    const token = await cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "utamarket_secret_key_2024"
    );

    // Get connection from pool
    connection = await pool.getConnection();

    // Get order details
    const [orders] = await connection.execute(
      `SELECT 
        o.*,
        GROUP_CONCAT(
          JSON_OBJECT(
            'id', oi.id,
            'productId', oi.product_id,
            'name', p.name,
            'price', oi.price,
            'quantity', oi.quantity,
            'selectedSize', oi.selected_size,
            'selectedColor', oi.selected_color,
            'image', p.image_url
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = ? AND o.user_id = ?
      GROUP BY o.id`,
      [params.orderId, decoded.userId]
    );

    if (orders.length === 0) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const order = orders[0];

    // Parse numeric values
    order.subtotal = parseFloat(order.subtotal);
    order.shipping_fee = parseFloat(order.shipping_fee);
    order.tax = parseFloat(order.tax);
    order.total_amount = parseFloat(order.total_amount);

    // Parse items JSON string and convert numeric values
    order.items = JSON.parse(`[${order.items}]`).map((item) => ({
      ...item,
      price: parseFloat(item.price),
      quantity: parseInt(item.quantity),
    }));

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { message: "Invalid authentication token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "Failed to fetch order" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}
