import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import pool from "@/database/db.js";

export async function DELETE(request) {
  let connection;
  try {
    // Get the token from the cookie
    const token = cookies().get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "utamarket_secret_key_2024"
    );

    // Get request body
    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json(
        { message: "Item ID is required" },
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
        `SELECT ci.* 
         FROM cart_items ci
         JOIN carts c ON ci.cart_id = c.id
         WHERE ci.id = ? AND c.user_id = ? AND c.status = 'active'`,
        [itemId, decoded.userId]
      );

      if (cartItems.length === 0) {
        throw new Error("Cart item not found");
      }

      // Delete the cart item
      await connection.execute("DELETE FROM cart_items WHERE id = ?", [itemId]);

      // Commit transaction
      await connection.commit();

      return NextResponse.json({
        message: "Cart item removed successfully",
      });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error removing cart item:", error);

    if (error.message === "Cart item not found") {
      return NextResponse.json(
        { message: "Cart item not found" },
        { status: 404 }
      );
    }

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { message: "Invalid authentication token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "Failed to remove cart item" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}
