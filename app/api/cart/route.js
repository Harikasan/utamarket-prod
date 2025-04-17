import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import pool from "@/database/db.js";

export async function GET(request) {
  let connection;
  try {
    // Get the token from the cookie - properly awaited both calls
    const cookieStore = await cookies();
    const token = await cookieStore.get("auth_token");
    const tokenValue = token?.value;

    if (!tokenValue) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = jwt.verify(
      tokenValue,
      process.env.JWT_SECRET || "utamarket_secret_key_2024"
    );

    // Get connection from pool
    connection = await pool.getConnection();

    // Get user's active cart and items
    const [cartItems] = await connection.execute(
      `SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        ci.selected_size,
        ci.selected_color,
        p.id as product_id,
        p.name,
        p.price,
        p.image_url,
        p.stock_quantity,
        c.category_name
      FROM carts cart
      JOIN cart_items ci ON cart.id = ci.cart_id
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE cart.user_id = ? AND cart.status = 'active'`,
      [decoded.userId]
    );

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = subtotal >= 35 ? 0 : 5.99;
    const tax = subtotal * 0.0825; // 8.25% tax rate
    const total = subtotal + shipping + tax;

    return NextResponse.json({
      items: cartItems.map((item) => ({
        id: item.cart_item_id,
        productId: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image_url,
        category: item.category_name,
        selectedSize: item.selected_size,
        selectedColor: item.selected_color,
        stockQuantity: item.stock_quantity,
      })),
      summary: {
        subtotal,
        shipping,
        tax,
        total,
        itemCount: cartItems.length,
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error("Error fetching cart:", error);

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { message: "Invalid authentication token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "Failed to fetch cart items" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}
