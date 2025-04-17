import { NextResponse } from "next/server";
import pool from "@/database/db.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const minPrice = parseFloat(searchParams.get("minPrice")) || 0;
    const maxPrice = parseFloat(searchParams.get("maxPrice")) || 999999;
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "DESC";
    const page = parseInt(searchParams.get("page")) || 1;
    const colors = searchParams.get("colors")
      ? searchParams.get("colors").split(",")
      : [];
    const limit = 12;
    const offset = (page - 1) * limit;

    // Input validation
    if (isNaN(minPrice) || isNaN(maxPrice)) {
      return NextResponse.json(
        { error: "Invalid price range parameters" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Base query with joins
      let sql = `
        SELECT 
          SQL_CALC_FOUND_ROWS
          p.*,
          c.category_name,
          COALESCE(oi.total_sold, 0) as total_sold
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN (
          SELECT product_id, SUM(quantity) as total_sold
          FROM order_items
          GROUP BY product_id
        ) oi ON p.id = oi.product_id
        WHERE p.stock_quantity > 0
      `;

      const params = [];

      // Add search conditions
      if (query) {
        sql += ` AND (
          LOWER(p.name) LIKE LOWER(?) OR 
          LOWER(p.description) LIKE LOWER(?) OR 
          LOWER(JSON_UNQUOTE(JSON_EXTRACT(p.tags, '$[*]'))) LIKE LOWER(?)
        )`;
        const searchTerm = `%${query}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Add category filter
      if (category) {
        sql += ` AND LOWER(c.category_name) = LOWER(?)`;
        params.push(category);
      }

      // Add color filter
      if (colors.length > 0) {
        sql += ` AND (`;
        const colorConditions = colors.map((color, index) => {
          if (index > 0) sql += ` OR `;
          // Search in both product_details.color and product name
          sql += `(JSON_CONTAINS(p.product_details, ?, '$.color') OR LOWER(p.name) LIKE LOWER(?))`;
          params.push(JSON.stringify(color), `%${color}%`);
          return null;
        });
        sql += `)`;
      }

      // Add price range filter
      sql += ` AND p.price BETWEEN ? AND ?`;
      params.push(minPrice, maxPrice);

      // Add sorting
      const validSortColumns = ["price", "created_at", "total_sold", "name"];
      const validSortOrder = ["ASC", "DESC"];

      const safeSortBy = validSortColumns.includes(sortBy.toLowerCase())
        ? sortBy
        : "created_at";
      const safeSortOrder = validSortOrder.includes(sortOrder.toUpperCase())
        ? sortOrder
        : "DESC";

      sql += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

      // Add pagination
      sql += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      // Execute query
      const [products] = await connection.query(sql, params);

      // Get total count
      const [totalRows] = await connection.query(
        "SELECT FOUND_ROWS() as total"
      );
      const total = totalRows[0].total;

      // Format the response
      const formattedProducts = products.map((product) => {
        let details = {};
        let tags = [];

        try {
          if (product.product_details) {
            details =
              typeof product.product_details === "string"
                ? JSON.parse(product.product_details)
                : product.product_details;
          }
        } catch (e) {
          console.warn(
            `Failed to parse product_details for product ${product.id}:`,
            e
          );
          details = { text: product.product_details };
        }

        try {
          if (product.tags) {
            tags =
              typeof product.tags === "string"
                ? JSON.parse(product.tags)
                : product.tags;
          }
        } catch (e) {
          console.warn(`Failed to parse tags for product ${product.id}:`, e);
          tags = product.tags ? [product.tags] : [];
        }

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          category: product.category_name,
          image: product.image_url,
          stock: parseInt(product.stock_quantity),
          totalSales: parseInt(product.total_sold),
          details,
          tags,
          createdAt: product.created_at,
        };
      });

      return NextResponse.json({
        products: formattedProducts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          limit,
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
