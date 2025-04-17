import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import pool from "@/database/db.js";

export async function PUT(request) {
  let connection;
  try {
    // Get the token from the cookie - properly awaited both calls
    const cookieStore = await cookies();
    const token = await cookieStore.get("auth_token");
    const tokenValue = token?.value;

    if (!tokenValue) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = jwt.verify(
      tokenValue,
      process.env.JWT_SECRET || "utamarket_secret_key_2024"
    );

    // Get request body
    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || !quantity) {
      return NextResponse.json(
        { message: "Item ID and quantity are required" },
        { status: 400 }
      );
    }

    // Get connection from pool
    connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    try {
      // Verify the cart item belongs to the user
      const [cartItems] = await connection.execute(
        `SELECT ci.*, p.stock_quantity 
         FROM cart_items ci
         JOIN carts c ON ci.cart_id = c.id
         JOIN products p ON ci.product_id = p.id
         WHERE ci.id = ? AND c.user_id = ? AND c.status = 'active'`,
        [itemId, decoded.userId]
      );

      if (cartItems.length === 0) {
        throw new Error("Cart item not found");
      }

      const cartItem = cartItems[0];

      // Check stock availability
      if (quantity > cartItem.stock_quantity) {
        throw new Error("Not enough stock available");
      }

      // Update quantity
      await connection.execute(
        "UPDATE cart_items SET quantity = ? WHERE id = ?",
        [quantity, itemId]
      );

      // Commit transaction
      await connection.commit();

      return NextResponse.json({
        message: "Cart item updated successfully",
      });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error updating cart item:", error);

    if (error.message === "Cart item not found") {
      return NextResponse.json(
        { message: "Cart item not found" },
        { status: 404 }
      );
    }

    if (error.message === "Not enough stock available") {
      return NextResponse.json(
        { message: "Not enough stock available" },
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
      { message: "Failed to update cart item" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}
