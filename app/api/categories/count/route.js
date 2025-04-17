import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Map category IDs to slugs
const categoryMap = {
  1: "apparel",
  2: "accessories",
  3: "spirit-gear",
  4: "school-supplies",
  5: "gifts",
};

export async function GET() {
  try {
    // Create MySQL connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Query to get count of products for each category_id
    const [rows] = await connection.execute(`
      SELECT 
        category_id,
        COUNT(*) as count
      FROM products
      WHERE category_id IS NOT NULL
      GROUP BY category_id
    `);

    await connection.end();

    // Map the category_ids to slugs and format the response
    const categoryCounts = rows.reduce((acc, row) => {
      const slug = categoryMap[row.category_id];
      if (slug) {
        acc[slug] = row.count;
      }
      return acc;
    }, {});

    // Ensure all categories have a count (even if 0)
    Object.values(categoryMap).forEach((slug) => {
      if (!(slug in categoryCounts)) {
        categoryCounts[slug] = 0;
      }
    });

    return NextResponse.json({ categoryCounts });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch category counts" },
      { status: 500 }
    );
  }
}
