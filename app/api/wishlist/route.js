import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import pool from "@/database/db.js";

// Helper function to get user ID from token
async function getUserId() {
  const cookieStore = cookies();
  const cookieList = await cookieStore;
  const token = cookieList.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "utamarket_secret_key_2024"
    );
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// GET /api/wishlist - Get all wishlist items for the current user
export async function GET() {
  let connection;
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    connection = await pool.getConnection();

    const [wishlistItems] = await connection.execute(
      `SELECT 
        w.id as wishlist_id,
        p.*,
        c.category_name as category,
        w.created_at as added_at
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC`,
      [userId]
    );

    return NextResponse.json(wishlistItems);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { message: "Failed to fetch wishlist items" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}

// POST /api/wishlist - Add item to wishlist
export async function POST(request) {
  let connection;
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Check if product exists
    const [products] = await connection.execute(
      "SELECT id FROM products WHERE id = ?",
      [productId]
    );

    if (products.length === 0) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Add to wishlist
    await connection.execute(
      "INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)",
      [userId, productId]
    );

    // Log the interaction for AI recommendations
    await connection.execute(
      `INSERT INTO ai_recommendation_logs 
        (user_id, product_id, interaction_type) 
       VALUES (?, ?, 'Wishlist')`,
      [userId, productId]
    );

    return NextResponse.json({ message: "Added to wishlist" });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { message: "Item already in wishlist" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Failed to add item to wishlist" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}

// DELETE /api/wishlist - Remove item from wishlist
export async function DELETE(request) {
  let connection;
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    const [result] = await connection.execute(
      "DELETE FROM wishlists WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Item not found in wishlist" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { message: "Failed to remove item from wishlist" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}
