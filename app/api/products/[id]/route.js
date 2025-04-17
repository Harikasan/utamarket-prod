import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import pool from "@/database/db.js";

export async function GET(request, { params }) {
  let connection;
  try {
    // Destructure id after awaiting params
    const { id } = await params;

    // Get user ID from JWT token in cookies
    const cookieStore = await cookies();
    const authToken = await cookieStore.get("auth_token")?.value;
    let userId = null;

    if (authToken) {
      try {
        const decoded = jwt.verify(
          authToken,
          process.env.JWT_SECRET || "utamarket_secret_key_2024"
        );
        userId = decoded.userId;
        console.log("Successfully decoded user ID:", userId);
      } catch (e) {
        console.error("Error decoding JWT:", e);
        userId = null;
      }
    } else {
      console.log("No auth token found in cookies");
    }

    // Get connection from pool
    connection = await pool.getConnection();

    // Get product details
    const [products] = await connection.execute(
      `SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.item_details,
        p.product_details,
        c.category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?`,
      [id]
    );

    if (products.length === 0) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const product = products[0];

    // Only attempt to record browsing history if we have a valid user ID
    if (userId) {
      try {
        // Verify user exists first
        const [userExists] = await connection.execute(
          "SELECT id FROM users WHERE id = ?",
          [userId]
        );

        if (userExists.length === 0) {
          console.error("User not found in database:", userId);
        } else {
          // Check if there's a recent view of this product by this user (within last 5 minutes)
          const [recentViews] = await connection.execute(
            `SELECT id FROM browsing_history 
             WHERE user_id = ? 
             AND product_id = ? 
             AND view_timestamp >= NOW() - INTERVAL 5 MINUTE`,
            [userId, product.id]
          );

          // Only insert if no recent view exists
          if (recentViews.length === 0) {
            await connection.execute(
              `INSERT INTO browsing_history (user_id, product_id) 
               VALUES (?, ?)`,
              [userId, product.id]
            );
            console.log(
              "Successfully recorded browsing history for user:",
              userId
            );
          } else {
            console.log("Recent view already exists for user:", userId);
          }
        }
      } catch (e) {
        console.error("Error recording browsing history:", e);
      }
    }

    // Parse item_details
    let itemDetails = {};
    try {
      itemDetails =
        typeof product.item_details === "string"
          ? JSON.parse(product.item_details)
          : product.item_details || {};
    } catch (e) {
      console.error("Error parsing item_details:", e);
      itemDetails = {};
    }

    // Parse product_details
    let productDetails = {};
    try {
      productDetails =
        typeof product.product_details === "string"
          ? JSON.parse(product.product_details)
          : product.product_details || {};
    } catch (e) {
      console.error("Error parsing product_details:", e);
      productDetails = {};
    }

    // Get recommended products
    const [recommendedProducts] = await connection.execute(
      `SELECT 
        p.id,
        p.name,
        p.price,
        p.image_url,
        c.category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE c.id = (SELECT category_id FROM products WHERE id = ?)
      AND p.id != ?
      LIMIT 3`,
      [id, id]
    );

    const formattedRecommendations = recommendedProducts.map((rec) => ({
      id: rec.id,
      name: rec.name,
      category: rec.category_name,
      price: rec.price,
      image: rec.image_url,
      rating: productDetails.rating || 4.5,
      reason: `Similar ${rec.category_name?.toLowerCase() || "product"}`,
    }));

    // Use the same image for all views
    const images = Array(4).fill(product.image_url);

    // Format the response
    const formattedProduct = {
      id: product.id,
      name: product.name,
      category: product.category_name,
      price: product.price,
      originalPrice: productDetails.original_price || product.price,
      discount: productDetails.discount_percentage || 0,
      image: product.image_url,
      images: images,
      rating: productDetails.rating || 4.5,
      reviewCount: productDetails.review_count || 0,
      description: product.description,
      details: Object.entries(itemDetails).map(
        ([key, value]) => `${key}: ${value}`
      ),
      availableSizes: itemDetails.Size ? itemDetails.Size.split(",") : [],
      availableColors: itemDetails.Color ? itemDetails.Color.split(",") : [],
      reviews: productDetails.reviews || [],
      aiRecommendations: formattedRecommendations,
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error("Error fetching product details:", error);
    return NextResponse.json(
      { error: "Failed to fetch product details" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}
