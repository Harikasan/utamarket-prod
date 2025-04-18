import { NextResponse } from "next/server";
import pool from "@/database/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const exclude = searchParams.get("exclude");

    if (!category) {
      return NextResponse.json(
        { error: "Category parameter is required" },
        { status: 400 }
      );
    }

    // Get a connection from the pool
    const connection = await pool.getConnection();

    try {
      // Query to get similar products from the same category
      const [rows] = await connection.execute(
        `SELECT 
          p.id,
          p.name,
          p.price,
          p.image_url as image,
          c.category_name as category,
          p.item_details
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE c.category_name = ? 
        AND p.id != ?
        LIMIT 4`,
        [category, exclude]
      );

      // Process the rows to add discount and originalPrice from item_details if they exist
      const processedRows = rows.map((row) => {
        const itemDetails = row.item_details || {};
        return {
          ...row,
          discount: itemDetails.discount || 0,
          originalPrice: itemDetails.original_price || row.price,
        };
      });

      return NextResponse.json(processedRows);
    } finally {
      // Always release the connection back to the pool
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return NextResponse.json(
      { error: "Failed to fetch similar products" },
      { status: 500 }
    );
  }
}
