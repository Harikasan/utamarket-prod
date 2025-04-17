import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import pool from "@/database/db.js";

export async function POST(request) {
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

    // Get request body
    const body = await request.json();
    const { shippingInfo, paymentInfo, items, subtotal, shipping, tax, total } =
      body;

    // Get connection from pool
    connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    try {
      // Get the user's active cart
      const [carts] = await connection.execute(
        "SELECT id FROM carts WHERE user_id = ? AND status = 'active'",
        [decoded.userId]
      );

      if (carts.length === 0) {
        throw new Error("No active cart found");
      }

      const cartId = carts[0].id;

      // Create order
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (
          user_id,
          shipping_address,
          shipping_city,
          shipping_state,
          shipping_zip,
          shipping_phone,
          shipping_email,
          payment_method,
          subtotal,
          shipping_fee,
          tax,
          total_amount,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          decoded.userId,
          shippingInfo.address,
          shippingInfo.city,
          shippingInfo.state,
          shippingInfo.zipCode,
          shippingInfo.phone,
          shippingInfo.email,
          "credit_card", // For now, hardcoding as credit card
          subtotal,
          shipping,
          tax,
          total,
          "pending",
        ]
      );

      const orderId = orderResult.insertId;

      // Insert order items
      for (const item of items) {
        await connection.execute(
          `INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            price,
            selected_size,
            selected_color
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.productId,
            item.quantity,
            item.price,
            item.selectedSize || null,
            item.selectedColor || null,
          ]
        );

        // Update product stock
        await connection.execute(
          `UPDATE products 
           SET stock_quantity = stock_quantity - ?,
               total_sales = total_sales + ?
           WHERE id = ?`,
          [item.quantity, item.quantity, item.productId]
        );
      }

      // Update cart status to 'converted_to_order'
      await connection.execute(
        "UPDATE carts SET status = 'converted_to_order' WHERE id = ?",
        [cartId]
      );

      // Commit transaction
      await connection.commit();

      return NextResponse.json({
        success: true,
        orderId,
        message: "Order created successfully",
      });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error creating order:", error);

    if (error.message === "No active cart found") {
      return NextResponse.json(
        { message: "No active cart found" },
        { status: 400 }
      );
    }

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { message: "Invalid authentication token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}
